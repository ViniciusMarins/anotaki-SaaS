namespace anotaki_api.Models
{
	public class Category
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public DateTime CreatedAt { get; set; }

		public List<Product> Products { get; set; } = [];
	}
}
