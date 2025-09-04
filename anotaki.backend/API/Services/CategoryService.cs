using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Category;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using static anotaki_api.Controllers.CategoryController;

namespace anotaki_api.Services
{
    public class CategoryService(AppDbContext context) : ICategoryService
    {
        private readonly AppDbContext _context = context;

        public async Task<List<Category>> GetAllCategories() => await _context.Categories.ToListAsync();



        public async Task<PaginatedDataResponse<Category>> GetPaginatedCategories(PaginationParams paginationParams)
        {
            int page = paginationParams.Page < 1 ? 1 : paginationParams.Page;
            var query = _context.Categories.AsNoTracking();

            // Aplicar sorting
            query = ApplySorting(query, paginationParams.SortBy, paginationParams.SortDirection);

            var totalItems = await query.CountAsync();
            var categories = await query
                .Skip((page - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalItems / paginationParams.PageSize);

            return new PaginatedDataResponse<Category>
            {
                Page = paginationParams.Page,
                PageSize = paginationParams.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = categories
            };
        }

        private IQueryable<Category> ApplySorting(IQueryable<Category> query, string? sortBy, string? sortDirection)
        {
            if (string.IsNullOrEmpty(sortBy))
                return query.OrderBy(x => x.Id); // Sort padrão

            var isDescending = sortDirection?.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "id" => isDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id),
                "name" => isDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "createdat" => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),

                _ => query.OrderBy(x => x.Id) // Fallback para sort padrão
            };
        }
        public async Task<Category> CreateCategory(FormCategoryRequestDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return category;
        }

        public async Task<Category> UpdateCategory(FormCategoryRequestDto dto, int id)
        {
            var category = _context.Categories.FirstOrDefault(c => c.Id == id) ?? throw new Exception("Category not found.");

            if (!String.IsNullOrEmpty(dto.Name))
                category.Name = dto.Name;

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return category;
        }

        public async Task<Category> DeleteCategory(int id)
        {
            var category = _context.Categories.FirstOrDefault(c => c.Id == id) ?? throw new Exception("Category not found.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return category;
        }
    }
}
