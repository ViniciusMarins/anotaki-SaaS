using anotaki_api.Models;

namespace anotaki_api.DTOs.Requests.Order
{
    public class CreateOrderDTO
    {
        public int UserId { get; set; }
        public int AddressId { get; set; }
        public OrderStatus OrderStatus { get; set; }

        public List<OrderProductItem> Items { get; set; } = [];
        public string Note { get; set; }
    }
}
