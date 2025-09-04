using System.ComponentModel.DataAnnotations;

namespace anotaki_api.DTOs.Requests.Address
{
    public class CreateAddressDTO
    {
        [Required]
        public string City { get; set; } = string.Empty;
        [Required]
        public string State { get; set; } = string.Empty;
        [Required]
        public string ZipCode { get; set; } = string.Empty;
        [Required]
        public string Neighborhood { get; set; } = string.Empty;
        [Required]
        public string Street { get; set; } = string.Empty;
        [Required]
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
    }
}
