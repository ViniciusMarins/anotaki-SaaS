using anotaki_api.Models;

namespace anotaki_api.DTOs.Response
{
    public class CartDTO
    {
        public int Id { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public decimal TotalPrice { get; set; }
        public List<OrderProductItem> Items { get; set; } = [];
    }
}
