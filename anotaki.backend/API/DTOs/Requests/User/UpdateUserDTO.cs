using System.ComponentModel.DataAnnotations;

namespace anotaki_api.DTOs.Requests.User
{
    public class UpdateUserDTO
    {
        public string? Name { get; set; }
        public string? Password { get; set; }
    }
}
