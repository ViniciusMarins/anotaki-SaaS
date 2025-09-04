using System.ComponentModel.DataAnnotations;

namespace anotaki_api.Models
{
    public class ProductExtra
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }
        
        public int ExtraId { get; set; }
        public Extra Extra { get; set; }
    }
}
