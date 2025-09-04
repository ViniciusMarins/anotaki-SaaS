using anotaki_api.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace anotaki_api.DTOs.Requests.Product
{
    public class CreateProductRequestDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string? Extras { get; set; }
        public string? CategoryId { get; set; }

        [JsonIgnore]
        public byte[]? ImageData { get; set; }
        [JsonIgnore]
        public string? ImageMimeType { get; set; }
        [JsonIgnore]
        public List<int> ExtraIds { get; set; } = [];

    }
}
