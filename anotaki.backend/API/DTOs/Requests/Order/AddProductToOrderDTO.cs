namespace anotaki_api.DTOs.Requests.Order
{
    public class AddProductToOrderDTO
    {
        public int ProductId { get; set; }
        public string Notes { get; set; }
        public List<OrderExtraItemDTO> Extras { get; set; } = [];
    }

    public class OrderExtraItemDTO
    {
        public int ExtraId { get; set; }
        public int Quantity { get; set; }
    }

}
