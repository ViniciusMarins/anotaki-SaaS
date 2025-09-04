using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Extra;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;

namespace anotaki_api.Services.Interfaces
{
    public interface IExtraService
    {
        Task<Extra> CreateExtra(CreateExtraRequestDTO dto);
        Task DeleteExtra(int extraId);
        Task<Extra?> FindById(int extraId);
        Task<List<Extra>> GetAllExtras();
        Task<Extra> UpdateExtra(Extra extra, int id);
        Task<List<ProductExtra>> AddMultipleExtrasToProduct(int productId, List<int> extraIdList);
        Task<PaginatedDataResponse<Extra>> GetPaginatedExtras(PaginationParams paginationParams);
    }
}
