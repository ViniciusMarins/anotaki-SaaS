using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Dashboard;
using anotaki_api.DTOs.Response.Dashboard;

namespace anotaki_api.Services.Interfaces
{
    public interface IDashboardService
    {
        DashboardResponseDto GetDashboardData(DashboardRequestDto requestParams);
        List<OrdersGraphItem> GetOrdersGraphData(DashboardRequestDto requestParams);
    }
}
