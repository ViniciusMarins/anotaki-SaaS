using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Address;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace anotaki_api.Services
{
    public class AddressService(AppDbContext context) : IAddressService
    {

        private readonly AppDbContext _context = context;

        public async Task<Address> CreateAddress(User user, CreateAddressDTO addressDTO)
        {

            bool isFirstAddress = user.Addresses.Count == 0;

            var address = new Address
            {
                UserId = user.Id,
                Street = addressDTO.Street,
                Number = addressDTO.Number,
                City = addressDTO.City,
                State = addressDTO.State,
                ZipCode = addressDTO.ZipCode,
                Neighborhood = addressDTO.Neighborhood,
                Complement = addressDTO.Complement,
                IsStandard = isFirstAddress
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            return address;
        }

        public async Task DeleteUserAddress(User user, int id)
        {
            var address = _context.Addresses.Find(id);
            if (address is null)
                throw new Exception("Address not found.");

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
        }

        public async Task<Address> UpdateUserAddress(int id, UpdateAddressDTO dto, User user)
        {
            var address = _context.Addresses.Find(id);
            if (address is null)
                throw new Exception("Address not found.");

            if (dto.City != null) address.City = dto.City;
            if (dto.State != null) address.State = dto.State;
            if (dto.ZipCode != null) address.ZipCode = dto.ZipCode;
            if (dto.Neighborhood != null) address.Neighborhood = dto.Neighborhood;
            if (dto.Street != null) address.Street = dto.Street;
            if (dto.Number != null) address.Number = dto.Number;
            if (dto.Complement != null) address.Complement = dto.Complement;

            await _context.SaveChangesAsync();
            return address;
        }

        public async Task<Address> SetStandardAddress(bool flag, int id, int userId)
        {
            var address = _context.Addresses.Find(id);
            if (address is null)
                throw new Exception("Address not found");

            if (flag)
            {
                var addr = await _context.Addresses.FirstOrDefaultAsync(a => a.IsStandard && a.UserId == userId);
                if (addr is not null)
                {
                    addr.IsStandard = false;
                    _context.Update(addr);
                }
            }

            address.IsStandard = flag;

            _context.Update(address);
            await _context.SaveChangesAsync();
            return address;
        }

    }
}
