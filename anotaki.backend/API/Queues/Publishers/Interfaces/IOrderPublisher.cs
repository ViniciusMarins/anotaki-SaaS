using anotaki_api.Models;

namespace anotaki_api.Queues.Publishers.Interfaces
{
    public interface IOrderPublisher
    {
        Task Publish(Order order);
    }
}
