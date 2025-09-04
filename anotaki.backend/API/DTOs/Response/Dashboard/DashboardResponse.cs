using anotaki_api.Models;

namespace anotaki_api.DTOs.Response.Dashboard
{
    public class DashboardResponseDto
    {
        public List<CardMetricBase> CardMetricItems { get; set; } = [];
        public List<Product> ProductsGraph { get; set; } = [];
        public List<OrdersGraphItem> OrdersGraph { get; set; } = [];
    }

    public class OrdersGraphItem
    {
        public string Key { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public abstract class CardMetricBase
    {
        public string Name { get; set; }
        public string Notes { get; set; }
    }

    public class CardMetricItem<T> : CardMetricBase
    {
        public required T Value { get; set; }
    }
}
