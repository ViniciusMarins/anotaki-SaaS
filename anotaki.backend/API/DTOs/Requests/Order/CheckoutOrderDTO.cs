using anotaki_api.Models;

namespace anotaki_api.DTOs.Requests.Order
{
    public class CheckoutOrderDTO
    {
        public int AddressId { get; set; }
        public int PaymentMethodId { get; set; }
        public string Notes { get; set; }
    }
}
