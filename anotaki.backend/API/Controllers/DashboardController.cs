using anotaki_api.DTOs.Requests.Auth;
using anotaki_api.DTOs.Requests.Dashboard;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anotaki_api.Controllers
{
    [ApiController]
    [Route("api/v1/dashboard")]
    [Authorize(Roles = Roles.Admin)]
    public class DashboardController(IDashboardService dashboardService) : ControllerBase
    {
        private readonly IDashboardService _dashboardService = dashboardService;

        [HttpPost]
        public IActionResult Index([FromBody] DashboardRequestDto ordersGraphFilter)
        {
            var data = _dashboardService.GetDashboardData(ordersGraphFilter);

            return ApiResponse.Create("Dashboard Data", StatusCodes.Status200OK, data);
        }
    }
}
