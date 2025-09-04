using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Dashboard;
using anotaki_api.DTOs.Response.Dashboard;
using anotaki_api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace anotaki_api.Services
{
    public class DashboardService(AppDbContext context) : IDashboardService
    {
        private readonly AppDbContext _context = context;

        public DashboardResponseDto GetDashboardData(DashboardRequestDto requestParams)
        {
            var dashboardResponse = new DashboardResponseDto();

            var ordersQuery = _context.Orders.AsNoTracking();
            var usersQuery = _context.Users.AsNoTracking();

            var now = DateTime.UtcNow;
            var startOfCurrentMonth = DateTime.SpecifyKind(new DateTime(now.Year, now.Month, 1), DateTimeKind.Utc);
            var startOfLastMonth = startOfCurrentMonth.AddMonths(-1);

            // --- TOTAL DE PEDIDOS ---
            var totalOrders = ordersQuery.Count();

            var currentMonthOrders = ordersQuery
                .Where(x => x.CreatedAt >= startOfCurrentMonth)
                .Count();

            var lastMonthOrders = ordersQuery
                .Where(x => x.CreatedAt >= startOfLastMonth && x.CreatedAt < startOfCurrentMonth)
                .Count();

            double ordersGrowth = 0;
            if (lastMonthOrders > 0)
                ordersGrowth = ((double)(currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;

            var ordersNotes = ordersGrowth >= 0
                ? $"+{ordersGrowth:F1}% desde o mês passado"
                : $"{ordersGrowth:F1}% desde o mês passado";

            dashboardResponse.CardMetricItems.Add(new CardMetricItem<int>()
            {
                Name = "Total de Pedidos",
                Value = totalOrders,
                Notes = ordersNotes
            });

            // --- USUÁRIOS ATIVOS ---
            var totalUsers = usersQuery.Count();

            var currentMonthUsers = usersQuery
                .Where(x => x.CreatedAt >= startOfCurrentMonth)
                .Count();

            var lastMonthUsers = usersQuery
                .Where(x => x.CreatedAt >= startOfLastMonth && x.CreatedAt < startOfCurrentMonth)
                .Count();

            double usersGrowth = 0;
            if (lastMonthUsers > 0)
                usersGrowth = ((double)(currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

            var usersNotes = usersGrowth >= 0
                ? $"+{usersGrowth:F1}% desde o mês passado"
                : $"{usersGrowth:F1}% desde o mês passado";

            dashboardResponse.CardMetricItems.Add(new CardMetricItem<int>()
            {
                Name = "Usuários Ativos",
                Value = totalUsers,
                Notes = usersNotes
            });

            // --- RECEITA TOTAL ---

            var totalRevenue = ordersQuery.Sum(x => x.TotalPrice);

            var currentMonthRevenue = ordersQuery
                .Where(x => x.CreatedAt >= startOfCurrentMonth)
                .Sum(x => x.TotalPrice);

            var lastMonthRevenue = ordersQuery
                .Where(x => x.CreatedAt >= startOfLastMonth && x.CreatedAt < startOfCurrentMonth)
                .Sum(x => x.TotalPrice);

            double revenueGrowth = 0;
            if (lastMonthRevenue > 0)
                revenueGrowth = (double)(currentMonthRevenue - lastMonthRevenue) / (double)lastMonthRevenue * 100;

            var revenueNotes = revenueGrowth >= 0
                ? $"+{revenueGrowth:F1}% desde o mês passado"
                : $"{revenueGrowth:F1}% desde o mês passado";

            dashboardResponse.CardMetricItems.Add(new CardMetricItem<decimal>()
            {
                Name = "Receita Total",
                Value = totalRevenue,
                Notes = revenueNotes
            });

            // --- USER ORDERS COUNT ---

            var userMaxCount = usersQuery
                .OrderByDescending(x => x.OrdersCount)
                .FirstOrDefault();

            dashboardResponse.CardMetricItems.Add(new CardMetricItem<int>()
            {
                Name = "Usuário com mais pedidos",
                Value = userMaxCount?.OrdersCount ?? 0,
                Notes = userMaxCount?.Email ?? ""
            });

            // --- GRÁFICOS ---
            dashboardResponse.ProductsGraph = _context.Products
                                                .AsNoTracking()
                                                .OrderByDescending(x => x.SalesCount)
                                                .Take(5)
                                                .ToList();

            dashboardResponse.OrdersGraph = GetOrdersGraphData(requestParams);

            return dashboardResponse;
        }

        public List<OrdersGraphItem> GetOrdersGraphData(DashboardRequestDto requestParams)
        {
            var ordersQuery = _context.Orders.AsNoTracking();
            var items = new List<OrdersGraphItem>();

            var currentYear = DateTime.UtcNow.Year;
            switch (requestParams.OrdersGraphFilter)
            {
                case "week":
                    var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
                    for (int i = 0; i < 7; i++)
                    {
                        var date = startOfWeek.AddDays(i);
                        var nextDay = date.AddDays(1);

                        var orders = ordersQuery.Where(x => x.CreatedAt >= date && x.CreatedAt < nextDay);

                        items.Add(new()
                        {
                            Key = date.DayOfWeek.ToString().ToLower(),
                            TotalOrders = orders.Count(),
                            TotalRevenue = orders.Sum(x => x.TotalPrice),
                        });
                    }

                    break;
                case "month":
                    var months = CultureInfo.CurrentCulture.DateTimeFormat.MonthNames;

                    for (int i = 1; i <= 12; i++)
                    {
                        var orders = ordersQuery.Where(x => x.CreatedAt.Month == i && x.CreatedAt.Year == currentYear);

                        items.Add(new()
                        {
                            Key = months[i - 1].ToLower(),
                            TotalOrders = orders.Count(),
                            TotalRevenue = orders.Sum(x => x.TotalPrice),
                        });
                    }

                    break;
                case "year":
                    for (int i = 0; i < 5; i++)
                    {
                        var year = currentYear - i;
                        var startDate = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                        var endDate = new DateTime(year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);

                        var orders = ordersQuery.Where(x => x.CreatedAt >= startDate && x.CreatedAt < endDate);

                        items.Add(new()
                        {
                            Key = year.ToString().ToLower(),
                            TotalOrders = orders.Count(),
                            TotalRevenue = orders.Sum(x => x.TotalPrice),
                        });
                    }
                    break;
            }

            return items.ToList();
        }
    }
}
