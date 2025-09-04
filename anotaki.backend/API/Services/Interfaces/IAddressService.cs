using anotaki_api.DTOs.Requests.Address;
using anotaki_api.Models;

namespace anotaki_api.Services.Interfaces
{
    public interface IAddressService
    {
        Task<Address> CreateAddress(User user, CreateAddressDTO addressDTO);
        Task DeleteUserAddress(User user, int id);
        Task<Address> SetStandardAddress(bool flag, int id, int userId);
        Task<Address> UpdateUserAddress(int id, UpdateAddressDTO dto, User user);
    }
}
