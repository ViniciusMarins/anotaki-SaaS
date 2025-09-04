using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Category;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using static anotaki_api.Controllers.CategoryController;

namespace anotaki_api.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<Category> CreateCategory(FormCategoryRequestDto dto);
        Task<Category> DeleteCategory(int id);
        Task<List<Category>> GetAllCategories();
        Task<PaginatedDataResponse<Category>> GetPaginatedCategories(PaginationParams paginationParams);
        Task<Category> UpdateCategory(FormCategoryRequestDto dto, int id);
    }
}
