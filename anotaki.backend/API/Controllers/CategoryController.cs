using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Category;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anotaki_api.Controllers
{
	[Route("api/v1/category")]
	[ApiController]
	[Authorize(Roles = Roles.Admin)]
	public class CategoryController(ICategoryService categoryService, IUserService userService) : ControllerBase
	{
		private readonly ICategoryService _categoryService = categoryService;
		private readonly IUserService _userService = userService;

        [HttpPost("paginated")]
        public async Task<IActionResult> GetPaginatedProducts([FromBody] PaginationParams paginationParams)
        {
            try
            {
                var data = await _categoryService.GetPaginatedCategories(paginationParams);
                return ApiResponse.Create("Getting All Categories", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Get All Categories", StatusCodes.Status500InternalServerError, ex.Message);
            }
        }


        [HttpGet]
		public async Task<IActionResult> GetAllCategories()
		{
			try
			{
				var data = await _categoryService.GetAllCategories();
				return ApiResponse.Create("Categories retrieved successfully.", StatusCodes.Status200OK, data);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed to retrieve categories.", StatusCodes.Status400BadRequest, ex);
			}
		}

		[HttpPost]
		public async Task<IActionResult> CreateCategory([FromBody] FormCategoryRequestDto dto)
		{
			try
			{
				var data = await _categoryService.CreateCategory(dto);
				return ApiResponse.Create("Category created successfully.", StatusCodes.Status201Created, data);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed to create category.", StatusCodes.Status400BadRequest, ex);
			}
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteCategory([FromRoute] int id)
		{
			try
			{
				await _categoryService.DeleteCategory(id);
				return ApiResponse.Create("Category delete successfully.", StatusCodes.Status200OK, id);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed to delete category.", StatusCodes.Status400BadRequest, ex);
			}
		}

		[HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory([FromRoute] int id,[FromBody] FormCategoryRequestDto dto)
		{
			try
			{
				var data = await _categoryService.UpdateCategory(dto, id);
				return ApiResponse.Create("Category Updated", StatusCodes.Status200OK, data);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed to update category.", StatusCodes.Status400BadRequest, ex);
			}
		}
    }
}
