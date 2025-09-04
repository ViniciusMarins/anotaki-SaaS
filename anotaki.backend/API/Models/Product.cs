using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace anotaki_api.Models
{
	public class Product
	{
		[Key]
		public int Id { get; set; }

		public string Name { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal Price { get; set; }

		public string Description { get; set; }

		public string? ImageMimeType { get; set; }
        public byte[]? ImageData { get; set; }

		public List<ProductExtra> Extras { get; set; } = [];

		public int? CategoryId { get; set; }
		public Category? Category { get; set; }

		public DateTime CreatedAt { get; set; }
		
		public bool IsActive { get; set; }

		public int SalesCount { get; set; }
	}
}
