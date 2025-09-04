using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace anotaki_api.Services
{
    public class PaymentMethodService(AppDbContext context) : IPaymentMethodService
    {
        private readonly AppDbContext _context = context;

        public async Task<List<PaymentMethod>> GetAllPaymentMethods() => await _context.PaymentMethods.ToListAsync();

        public async Task<PaginatedDataResponse<PaymentMethod>> GetPaginatedPaymentMethods(PaginationParams paginationParams)
        {
            int page = paginationParams.Page < 1 ? 1 : paginationParams.Page;
            var query = _context.PaymentMethods.AsNoTracking();

            // Aplicar sorting
            query = ApplySorting(query, paginationParams.SortBy, paginationParams.SortDirection);

            var totalItems = await query.CountAsync();
            var paymentMethods = await query
                .Skip((page - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalItems / paginationParams.PageSize);

            return new PaginatedDataResponse<PaymentMethod>
            {
                Page = paginationParams.Page,
                PageSize = paginationParams.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = paymentMethods
            };
        }

        private IQueryable<PaymentMethod> ApplySorting(IQueryable<PaymentMethod> query, string? sortBy, string? sortDirection)
        {
            if (string.IsNullOrEmpty(sortBy))
                return query.OrderBy(x => x.Id); // Sort padrão

            var isDescending = sortDirection?.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "id" => isDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id),
                "name" => isDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),

                _ => query.OrderBy(x => x.Id) // Fallback para sort padrão
            };
        }

        public async Task<PaymentMethod> CreatePaymentMethod(string name)
        {
            var paymentMethod = new PaymentMethod
            {
                Name = name,
                CreatedAt = DateTime.UtcNow,
            };

            _context.PaymentMethods.Add(paymentMethod);
            await _context.SaveChangesAsync();

            return paymentMethod;
        }

        public async Task<PaymentMethod> UpdatePaymentMethod(string name, int id)
        {
            var paymentMethod = _context.PaymentMethods.FirstOrDefault(c => c.Id == id) ?? throw new Exception("PaymentMethod not found.");

            if (!String.IsNullOrEmpty(name))
                paymentMethod.Name = name;

            _context.PaymentMethods.Update(paymentMethod);
            await _context.SaveChangesAsync();

            return paymentMethod;
        }

        public async Task<PaymentMethod> DeletePaymentMethod(int id)
        {
            var paymentMethod = _context.PaymentMethods.FirstOrDefault(c => c.Id == id) ?? throw new Exception("PaymentMethod not found.");

            _context.PaymentMethods.Remove(paymentMethod);
            await _context.SaveChangesAsync();

            return paymentMethod;
        }
    }
}
