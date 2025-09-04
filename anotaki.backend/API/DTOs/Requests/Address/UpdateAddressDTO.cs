using System.ComponentModel.DataAnnotations;

namespace anotaki_api.DTOs.Requests.Address
{
    public class UpdateAddressDTO
    {
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Neighborhood { get; set; }
        public string? Street { get; set; }
        public string? Number { get; set; }
        public string? Complement { get; set; }
        public bool? IsStandard { get; set; }
    }
}
