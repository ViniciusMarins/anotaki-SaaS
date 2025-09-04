using System.ComponentModel.DataAnnotations;

namespace anotaki_api.DTOs.Requests.Auth
{
    public class LoginDTO
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
