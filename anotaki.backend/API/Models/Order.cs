using System.Text.Json.Serialization;

namespace anotaki_api.Models
{
	public class Order
	{
		public int Id { get; set; }
		public string? Notes { get; set; }
		public decimal TotalPrice { get; set; }
		
		public OrderStatus OrderStatus { get; set; }
		
		public DateTime CreatedAt { get; set; }
		public DateTime UpdatedAt { get; set; }
		
		public int? PaymentMethodId { get; set; }
		public PaymentMethod? PaymentMethod { get; set; }
		
		public int UserId { get; set; }
		public User User { get; set; }
		
		public int? AddressId { get; set; }
		public Address Address { get; set; }
		
		public List<OrderProductItem> Items { get; set; } = [];
		public List<OrderLog> Logs { get; set; } = [];
	}

	public class OrderLog
	{
		public int Id { get; set; }
		public string Description { get; set; }
		public OrderStatus Status { get; set; }
		public DateTime CreatedAt { get; set; }
		
		public int UserId { get; set; }
		public User User { get; set; }

		public int OrderId { get; set; }
		public Order Order { get; set; }
	}

	public enum OrderStatus
	{
		Cart, // carrinho do cliente (pedido ainda em aberto)
		Pending, // esperando a loja confirmar o pedido
		Preparing, // preparando o pedido
		OnTheWay, // pedido na rota de entrega
		Delivered, // pedido entregue ao cliente
		Cancelled, // pedido cancelado
	}

	public class OrderProductItem
	{
		public int Id { get; set; }

		public int OrderId { get; set; }

		[JsonIgnore]
		public Order Order { get; set; }

		public int ProductId { get; set; }
		public Product Product { get; set; }

		public List<OrderExtraItem> ExtrasItems { get; set; } = [];

		public int Quantity { get; set; } = 1;
		public decimal UnitPrice { get; set; }
		public decimal TotalPrice { get; set; }

		public string? Notes { get; set; }
	}

	public class OrderExtraItem
	{
		public int Id { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public int ExtraId { get; set; }
		public Extra Extra { get; set; }
		public int OrderProductItemId { get; set; }

		[JsonIgnore]
		public OrderProductItem OrderProductItem { get; set; }

		public int Quantity { get; set; } = 1;
	}
}
