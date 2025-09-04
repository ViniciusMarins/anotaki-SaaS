using Microsoft.AspNetCore.Mvc;

namespace anotaki_api.DTOs.Response.Api
{
    public static class ApiResponse
    {
        public static IActionResult Create<T>(string title, int statusCode, T? data = default)
        {
            var response = new ApiResponse<T>(title, data);
            return new ObjectResult(response)
            {
                StatusCode = statusCode
            };
        }

        public static IActionResult Create(string title, int statusCode)
        {
            var response = new ApiResponse<object>(title);
            return new ObjectResult(response)
            {
                StatusCode = statusCode
            };
        }
    }
}
