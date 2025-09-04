namespace anotaki_api.DTOs.Response.Api
{
    public class ApiResponse<T>
    {
        public string Title { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public T? Data { get; set; }

        public ApiResponse(string title, T? data = default)
        {
            Title = title;
            Data = data;
        }
    }
}
