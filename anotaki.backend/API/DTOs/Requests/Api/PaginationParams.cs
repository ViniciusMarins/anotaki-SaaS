using System.ComponentModel.DataAnnotations;

namespace anotaki_api.DTOs.Requests.Api
{
    public class PaginationParams
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } = "asc"; // "asc" ou "desc"
        public string? FilterBy { get; set; }
        public string? Filter {  get; set; }
    }
}
