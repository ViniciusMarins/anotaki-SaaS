using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace anotaki_api.DTOs.Requests.User
{
	public class CreateUserDTO
	{
		[Required(ErrorMessage = "Name is required.")]
		[StringLength(100, ErrorMessage = "Name must be at most 100 characters.")]
		public string Name { get; set; }

		[Required(ErrorMessage = "Email is required.")]
		[EmailAddress(ErrorMessage = "Invalid email format.")]
		public string Email { get; set; }

		[Required(ErrorMessage = "Password is required.")]
		[MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
		public string Password { get; set; }

		[Required(ErrorMessage = "CPF is required.")]
		public string Cpf { get; set; }
	}
}
