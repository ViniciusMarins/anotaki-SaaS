using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace anotaki_api.Models
{
	[Index(nameof(Cpf), IsUnique = true)]
	[Index(nameof(Email), IsUnique = true)]
	public class User
	{
		[Key]
		public int Id { get; set; }
		public Role Role { get; set; } = Role.Default;
		public string Name { get; set; }
		public string Email { get; set; }

		[JsonIgnore]
		public string Password { get; set; }
		public string Cpf { get; set; }

		public List<Address> Addresses { get; set; } = [];

		public bool IsActive { get; set; } = true;
		public DateTime CreatedAt {  get; set; }
		public int OrdersCount { get; set; }
	}

	public static class Roles
	{
		public const string Admin = "admin";
		public const string Default = "default";
	}

	public enum Role
	{
		Default,
		Admin,
	}
}
