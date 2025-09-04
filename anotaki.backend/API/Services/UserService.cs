using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.User;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Exceptions;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using anotaki_api.Utils;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace anotaki_api.Services
{
    public class UserService(AppDbContext context) : IUserService
    {
        private readonly AppDbContext _context = context;

        public async Task<User?> GetContextUser(ClaimsPrincipal user)
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier) ?? user.FindFirst("sub");
            if (idClaim == null || !int.TryParse(idClaim.Value, out var userId))
            {
                return null;
            }

            var userDb = await FindById(userId);

            return userDb;
        }
        public async Task<PaginatedDataResponse<User>> GetPaginatedUsers(PaginationParams paginationParams)
        {
            int page = paginationParams.Page < 1 ? 1 : paginationParams.Page;
            var query = _context.Users
                .AsNoTracking();

            // Aplicar sorting
            query = ApplySorting(query, paginationParams.SortBy, paginationParams.SortDirection);
            query = ApplyFiltering(query, paginationParams.FilterBy, paginationParams.Filter);

            var totalItems = await query.CountAsync();
            var users = await query
                .Skip((page - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalItems / paginationParams.PageSize);

            return new PaginatedDataResponse<User>
            {
                Page = paginationParams.Page,
                PageSize = paginationParams.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = users
            };
        }

        private IQueryable<User> ApplySorting(IQueryable<User> query, string? sortBy, string? sortDirection)
        {
            if (string.IsNullOrEmpty(sortBy))
                return query.OrderBy(x => x.Id); // Sort padr�o

            var isDescending = sortDirection?.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "id" => isDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id),
                "role" => isDescending ? query.OrderByDescending(x => x.Role) : query.OrderBy(x => x.Role),
                "name" => isDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "email" => isDescending ? query.OrderByDescending(x => x.Email) : query.OrderBy(x => x.Email),
                "cpf" => isDescending ? query.OrderByDescending(x => x.Cpf) : query.OrderBy(x => x.Cpf),
                "isactive" => isDescending ? query.OrderByDescending(x => x.IsActive) : query.OrderBy(x => x.IsActive),
                "orderscount" => isDescending ? query.OrderByDescending(x => x.OrdersCount) : query.OrderBy(x => x.OrdersCount),
                "createdat" => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),

                _ => query.OrderBy(x => x.Id) // Fallback para sort padr�o
            };
        }

        public IQueryable<User> ApplyFiltering(IQueryable<User> query, string? filterBy, string? filter)
        {
            if (string.IsNullOrEmpty(filterBy))
                return query;

            return filterBy.ToLower() switch
            {
                "isactive" => query.Where(x => x.IsActive == bool.Parse(filter!)),
                "role" => query.Where(x => x.Role == (Role)int.Parse(filter!)),

                _ => query // Fallback para filter padr�o
            };
        }


        public async Task<User?> FindById(int id)
        {
            return await _context.Users.Include(x => x.Addresses).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<User?> FindByEmail(string email)
        {
            return await _context.Users.Include(x => x.Addresses).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User?> FindByCpf(string cpf)
        {
            return await _context.Users.Include(x => x.Addresses).FirstOrDefaultAsync(x => x.Cpf == cpf);
        }

        public async Task<User> CreateUser(CreateUserDTO userDTO)
        {
            var newUser = new User
            {
                Name = userDTO.Name,
                Email = userDTO.Email,
                Cpf = Utils.Utils.RemoveNonDigits(userDTO.Cpf),
                Password = HashUtils.HashPassword(userDTO.Password),
                Role = Role.Default
            };

            if (await FindByCpf(newUser.Cpf) != null)
            {
                throw new CpfDuplicatedException();
            }

            if (await FindByEmail(newUser.Email) != null)
            {
                throw new EmailDuplicatedException();
            }

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }

        public async Task<User> UpdateUser(UpdateUserDTO dto, User user)
        {
            if (!string.IsNullOrWhiteSpace(dto.Name))
                user.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.Password = HashUtils.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return user;
        }
        
        public async Task DeleteUser(int id)
        {
            var user = await FindById(id);

            if (user == null)
                throw new Exception("User not found");

            _context.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<StoreSettingsDto> GetStoreSettings()
        {
            var settings = await _context.StoreSettings
                .Include(s => s.WorkingHours)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                return GetDefaultStoreSettings();
            }

            return new StoreSettingsDto
            {
                Id = settings.Id,
                City = settings.City,
                State = settings.State,
                ZipCode = settings.ZipCode,
                Neighborhood = settings.Neighborhood,
                Street = settings.Street,
                Number = settings.Number,
                Complement = settings.Complement,
                WorkingHours = GetWorkingHoursForAllDays(settings.WorkingHours)
            };
        }

        private StoreSettingsDto GetDefaultStoreSettings()
        {
            var daysOfWeek = new[] { "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" };

            return new StoreSettingsDto
            {
                Id = 0,
                WorkingHours = daysOfWeek.Select(day => new WorkingHoursDto
                {
                    DayOfWeek = day,
                    StartTime = null,
                    EndTime = null,
                    IsOpen = false
                }).ToList()
            };
        }

        private List<WorkingHoursDto> GetWorkingHoursForAllDays(ICollection<WorkingHours> workingHours)
        {
            var daysOfWeek = new[] { "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" };
            var result = new List<WorkingHoursDto>();

            foreach (var day in daysOfWeek)
            {
                var existingHours = workingHours.FirstOrDefault(wh => wh.DayOfWeek == day);

                result.Add(new WorkingHoursDto
                {
                    DayOfWeek = day,
                    StartTime = existingHours?.StartTime?.ToString("HH:mm"),
                    EndTime = existingHours?.EndTime?.ToString("HH:mm"),
                    IsOpen = existingHours?.IsOpen ?? false
                });
            }

            return result;
        }

        public async Task UpdateStoreSettings(StoreSettingsDto storeSettingsDto)
        {
            if (storeSettingsDto == null)
                return;

            var existingSettings = await _context.StoreSettings
                .Include(s => s.WorkingHours)
                .FirstOrDefaultAsync(x => x.Id == storeSettingsDto.Id) ?? new StoreSettings();


            if (!string.IsNullOrWhiteSpace(storeSettingsDto.City))
                existingSettings.City = storeSettingsDto.City;
            if (!string.IsNullOrWhiteSpace(storeSettingsDto.State))
                existingSettings.State = storeSettingsDto.State;
            if (!string.IsNullOrWhiteSpace(storeSettingsDto.ZipCode))
                existingSettings.ZipCode = Utils.Utils.RemoveNonDigits(storeSettingsDto.ZipCode);
            if (!string.IsNullOrWhiteSpace(storeSettingsDto.Neighborhood))
                existingSettings.Neighborhood = storeSettingsDto.Neighborhood;
            if (!string.IsNullOrWhiteSpace(storeSettingsDto.Street))
                existingSettings.Street = storeSettingsDto.Street;
            if (!string.IsNullOrWhiteSpace(storeSettingsDto.Number))
                existingSettings.Number = storeSettingsDto.Number;
            if (storeSettingsDto.Complement != null)
                existingSettings.Complement = storeSettingsDto.Complement;

            existingSettings.UpdatedAt = DateTime.UtcNow;


            _context.StoreSettings.Update(existingSettings);
            await _context.SaveChangesAsync();

            await UpdateWorkingHours(existingSettings.Id, storeSettingsDto.WorkingHours);
        }

        private async Task UpdateWorkingHours(int storeSettingsId, List<WorkingHoursDto> workingHoursDto)
        {
            var existingWorkingHours = await _context.WorkingHours
                .Where(wh => wh.StoreSettingsId == storeSettingsId)
                .ToListAsync();

            _context.WorkingHours.RemoveRange(existingWorkingHours);

            foreach (var hoursDto in workingHoursDto)
            {
                TimeOnly? startTime = null;
                TimeOnly? endTime = null;

                if (!string.IsNullOrWhiteSpace(hoursDto.StartTime) && TimeOnly.TryParse(hoursDto.StartTime, out var start))
                    startTime = start;

                if (!string.IsNullOrWhiteSpace(hoursDto.EndTime) && TimeOnly.TryParse(hoursDto.EndTime, out var end))
                    endTime = end;

                var workingHours = new WorkingHours
                {
                    StoreSettingsId = storeSettingsId,
                    DayOfWeek = hoursDto.DayOfWeek,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsOpen = hoursDto.IsOpen && startTime.HasValue && endTime.HasValue
                };

                _context.WorkingHours.Add(workingHours);
            }

            await _context.SaveChangesAsync();
        }
    }
}