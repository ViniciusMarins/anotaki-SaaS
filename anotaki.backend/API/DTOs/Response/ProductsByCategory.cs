using anotaki_api.Models;

namespace anotaki_api.DTOs.Response
{
    public class ProductsByCategory
    {
        public string Name { get; set; }
        public List<Product> Products { get; set; }
    }
}
