using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Order;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;

namespace anotaki_api.Services.Interfaces
{
    public interface IOrderService
    {
        Task<Order> AddProductToOrder(User user, AddProductToOrderDTO dto);
        Task ChangeProductQuantity(ChangeProductQuantityDTO dto, User user);
        Task CheckoutOrder(Order order, CheckoutOrderDTO dto, int userId);
        Task DeleteOrder(int orderId);
        Task<Order> GetCart(int userId);
        Task<Order> GetOrderDetails(int orderId);
        Task<Order?> GetOrderById(int cartId);
        Task<List<Order>> GetOrdersByUser(int userId);
        Task<PaginatedDataResponse<Order>> GetPaginatedOrders(PaginationParams paginationParams);
        Task<Order> ChangeOrderStatus(int orderId, int orderStatus, int userId);
    }
}
