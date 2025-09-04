using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;

namespace anotaki_api.Services.Interfaces
{
    public interface IPaymentMethodService
    {
        Task<PaymentMethod> CreatePaymentMethod(string name);
        Task<PaymentMethod> DeletePaymentMethod(int id);
        Task<List<PaymentMethod>> GetAllPaymentMethods();
        Task<PaginatedDataResponse<PaymentMethod>> GetPaginatedPaymentMethods(PaginationParams paginationParams);
        Task<PaymentMethod> UpdatePaymentMethod(string name, int id);
    }
}
