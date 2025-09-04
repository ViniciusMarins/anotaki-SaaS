using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Product;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace anotaki_api.Controllers
{
	[Route("api/v1/product")]
	[Authorize(Roles = Roles.Admin)]
    [ApiController]
	public class ProductController(IProductService productService, IUserService userService) : ControllerBase
	{
		private readonly IProductService _productService = productService;
		private readonly IUserService _userService = userService;

        [HttpPost("paginated")]
        public async Task<IActionResult> GetPaginatedProducts([FromBody] PaginationParams paginationParams)
        {
            try
            {
                var data = await _productService.GetPaginatedProducts(paginationParams);
                return ApiResponse.Create("Getting All Products", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Get All Products", StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var user = await _userService.GetContextUser(User);
                if (user == null)
                    return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

                var data = await _productService.GetAllProducts();
                return ApiResponse.Create("Getting All Products", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Get All Products", StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("menu")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProductsByCategory([FromQuery] string? searchTerm)
        {
            try
            {
                var data = await _productService.ProductsFilterByCategory(searchTerm);
                return ApiResponse.Create("Success getting the menu", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to get menu", StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById([FromRoute] int id)
        {
            try
            {
                var data = await _productService.GetById(id);
                return ApiResponse.Create("Get Product", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to get Product", StatusCodes.Status400BadRequest, ex.Message);
            }
        }

        [HttpPost]
		public async Task<IActionResult> CreateProduct([FromForm] CreateProductRequestDTO dto, IFormFile? image)
		{
			try
			{
                if (image != null && image.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await image.CopyToAsync(ms);
                    dto.ImageData = ms.ToArray();
                    dto.ImageMimeType = image.ContentType;
                }

                // Deserializar os extras
                dto.ExtraIds = string.IsNullOrEmpty(dto.Extras)
                    ? new List<int>()
                    : JsonSerializer.Deserialize<List<int>>(dto.Extras) ?? [];

                var data = await _productService.CreateProduct(dto);
				return ApiResponse.Create("Product Created", StatusCodes.Status201Created, data);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed to create Product", StatusCodes.Status400BadRequest, ex.Message);
			}
		}

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct([FromForm] CreateProductRequestDTO form, IFormFile? image, [FromRoute] int id)
        {
            try
            {
                if (image != null && image.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await image.CopyToAsync(ms);
                    form.ImageData = ms.ToArray();
                    form.ImageMimeType = image.ContentType;
                }

                // Deserializar os extras
                form.ExtraIds = string.IsNullOrEmpty(form.Extras)
                    ? new List<int>()
                    : JsonSerializer.Deserialize<List<int>>(form.Extras) ?? [];

                var data = await _productService.UpdateProduct(form, id);
                return ApiResponse.Create("Product Updated", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Update Product", StatusCodes.Status400BadRequest, ex.Message);
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> ToggleProductStatus([FromRoute] int id)
        {
            try
            {
                await _productService.ToggleProductStatus(id);
                return ApiResponse.Create("Product Deleted", StatusCodes.Status200OK, id);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Delete Product", StatusCodes.Status400BadRequest, ex.Message);
            }
        }

        [HttpDelete("{id}")]
		public async Task<IActionResult> DeleteProduct([FromRoute] int id)
		{
			try
			{
				await _productService.DeleteProduct(id);
				return ApiResponse.Create("Product Deleted", StatusCodes.Status200OK, id);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed to Delete Product", StatusCodes.Status400BadRequest, ex.Message);
			}
		}
	}
}
