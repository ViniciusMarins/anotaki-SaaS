using anotaki_api.Hubs;
using anotaki_api.Models;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace anotaki_api.Queues.Consumers
{
    public class OrderConsumer : BackgroundService
    {
        private readonly IConfiguration _config;
        private readonly JsonSerializerOptions _jsonOptions;
        private IConnection? _connection;
        private IChannel? _channel;
        private readonly string queueName = "order_queue";
        private IHubContext<OrderHub> _hubContext;

        public OrderConsumer(IHubContext<OrderHub> hubContext, IConfiguration config, IOptions<JsonOptions> jsonOptions)
        {
            _hubContext = hubContext;
            _config = config;
            _jsonOptions = jsonOptions.Value.SerializerOptions;
        }

        public override async Task<Task> StartAsync(CancellationToken cancellationToken)
        {
            var factory = new ConnectionFactory
            {
                HostName = _config["RabbitMq:Host"]!,
                Port = int.Parse(_config["RabbitMq:Port"]!),
                UserName = _config["RabbitMq:User"]!,
                Password = _config["RabbitMq:Password"]!
            };

            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();

            // Declara a fila
            await _channel.QueueDeclareAsync(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);

            return base.StartAsync(cancellationToken);
        }

        protected override async Task<Task> ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_channel != null)
            {
                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.ReceivedAsync += async (_, ea) =>
                {
                    Console.WriteLine("[OrderConsumerService] Mensagem recebida da fila.");

                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);

                    var order = JsonSerializer.Deserialize<Order>(message, _jsonOptions)
                                   ?? throw new InvalidOperationException("Error deserializing order - result was null.");

                    await _hubContext.Clients.Group("Admins").SendAsync("ReceiveOrder", order);

                    // Confirma o processamento da mensagem
                    Console.WriteLine($"[x] Processed: {message}");
                    await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
                };

                string consumerTag = await _channel.BasicConsumeAsync(queueName, false, consumer);
            }

            return Task.CompletedTask;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _channel?.CloseAsync(cancellationToken: cancellationToken);
            _connection?.CloseAsync(cancellationToken: cancellationToken);

            return base.StopAsync(cancellationToken);
        }

        public override void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
            base.Dispose();
        }
    }

}
