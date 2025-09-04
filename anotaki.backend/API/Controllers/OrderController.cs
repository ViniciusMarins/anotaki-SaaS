using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Order;
using anotaki_api.DTOs.Response;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Services;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anotaki_api.Controllers
{
	[ApiController]
	[Route("/api/v1/order")]
	[Authorize]
	public class OrderController(IOrderService orderService, IUserService userService) : ControllerBase
	{
		private readonly IOrderService _orderService = orderService;
		private readonly IUserService _userService = userService;

        [HttpPost("paginated")]
        public async Task<IActionResult> GetPaginatedOrders([FromBody] PaginationParams paginationParams)
        {
            try
            {
                var data = await _orderService.GetPaginatedOrders(paginationParams);
                return ApiResponse.Create("Getting All Orders", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Get All Orders", StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetOrders([FromRoute] int userId)
        {
			var user = await _userService.GetContextUser(User);
			if (user == null)
				return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

			if (userId != user.Id)
			{
				return ApiResponse.Create("Permission denied.", StatusCodes.Status403Forbidden);
			}

			try
            {
                var orders = await _orderService.GetOrdersByUser(userId);

                return ApiResponse.Create("Successful.", StatusCodes.Status200OK, orders);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed getting cart info." + ex.Message, StatusCodes.Status400BadRequest);
            }
        }

        [HttpGet("cart")]
		public async Task<IActionResult> GetCart()
		{
			var user = await _userService.GetContextUser(User);
			if (user == null)
				return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

			try
			{
				var cart = await _orderService.GetCart(user.Id);

				var data = new CartDTO
				{
					Id = cart.Id,
					OrderStatus = cart.OrderStatus,
					TotalPrice = cart.TotalPrice,
					Items = cart.Items,
				};

				return ApiResponse.Create("Successful.", StatusCodes.Status200OK, data);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed getting cart info." + ex.Message, StatusCodes.Status400BadRequest);
			}
		}

		[HttpPost("cart")]
		public async Task<IActionResult> AddProductToCart([FromBody] AddProductToOrderDTO dto)
		{
			var user = await _userService.GetContextUser(User);
			if (user == null)
				return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

			try
			{
				var updatedCart = await _orderService.AddProductToOrder(user, dto);

				return ApiResponse.Create($"Added product id {dto.ProductId} successfully.", StatusCodes.Status200OK, updatedCart);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed adding product to cart.", StatusCodes.Status400BadRequest, ex.Message);
			}
		}

        [HttpPatch("cart")]
        public async Task<IActionResult> ChangeProductQuantity([FromBody] ChangeProductQuantityDTO dto)
        {
            var user = await _userService.GetContextUser(User);
            if (user == null)
                return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

            try
            {
                await _orderService.ChangeProductQuantity(dto, user);

                return ApiResponse.Create($"Success.", StatusCodes.Status200OK);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed.", StatusCodes.Status400BadRequest, ex.Message);
            }
        }

        [HttpPost("checkout-order")]
		public async Task<IActionResult> CheckoutOrder([FromBody] CheckoutOrderDTO dto)
		{
			var user = await _userService.GetContextUser(User);
			if (user == null)
				return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

			try
			{
				var cart = await _orderService.GetCart(user.Id);

				if (cart.UserId != user.Id)
					return ApiResponse.Create("Order not belong to that user.", StatusCodes.Status404NotFound);

				await _orderService.CheckoutOrder(cart, dto, user.Id);

				return ApiResponse.Create($"Order processed sucessfully.", StatusCodes.Status200OK);
			}
			catch (Exception ex)
			{
				return ApiResponse.Create("Failed ordering.", StatusCodes.Status400BadRequest, ex.Message);
			}
		}

        [HttpPatch("change-status/{id}")]
        public async Task<IActionResult> ChangeOrderStatus([FromRoute] int id, [FromQuery] int orderStatus)
        {
            var user = await _userService.GetContextUser(User);
            if (user == null)
                return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

            try
            {
                var order = await _orderService.ChangeOrderStatus(id, orderStatus, user.Id);
                return ApiResponse.Create("Order Details", StatusCodes.Status200OK, order);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Get Order Details", StatusCodes.Status400BadRequest, ex.Message);
            }
        }

        [HttpGet("details/{id}")]
        public async Task<IActionResult> GetOrder([FromRoute] int id)
        {
            try
            {
                var order = await _orderService.GetOrderDetails(id);
                return ApiResponse.Create("Order Details", StatusCodes.Status200OK, order);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Get Order Details", StatusCodes.Status400BadRequest, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder([FromRoute] int id)
        {
            try
            {
                await _orderService.DeleteOrder(id);
                return ApiResponse.Create("Order Deleted", StatusCodes.Status200OK, id);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Delete Order", StatusCodes.Status400BadRequest, ex.Message);
            }
        }
    }
}

