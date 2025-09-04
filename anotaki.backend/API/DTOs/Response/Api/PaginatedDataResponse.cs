namespace anotaki_api.DTOs.Response.Api
{
    public class PaginatedDataResponse<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }
        public List<T> Items { get; set; } = [];
    }
}
