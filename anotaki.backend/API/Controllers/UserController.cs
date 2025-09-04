using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.User;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.DTOs.Response.User;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anotaki_api.Controllers
{
    [ApiController]
    [Route("/api/v1/user")]
    [Authorize]
    public class UserController(IUserService userService) : ControllerBase
    {
        private readonly IUserService _userService = userService;

        [HttpPost("paginated")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetPaginatedUsers([FromBody] PaginationParams paginationParams)
        {
            try
            {
                var data = await _userService.GetPaginatedUsers(paginationParams);
                return ApiResponse.Create("Getting All Users", StatusCodes.Status200OK, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create("Failed to Get All Users", StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDTO dto)
        {
            try
            {
                var user = await _userService.CreateUser(dto);
                var data = new UserResponseDTO
                {
                    Name = user.Name,
                    Cpf = user.Cpf,
                    Email = user.Email,
                };

                return ApiResponse.Create("User created successfully!", StatusCodes.Status201Created, data);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create($"Error creating user: {ex.Message}", StatusCodes.Status500InternalServerError);

            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDTO dto, [FromRoute] int id)
        {
            var user = await _userService.GetContextUser(User);
            if (user == null)
                return ApiResponse.Create("User not authenticated.", StatusCodes.Status404NotFound);

            var userToUpdate = await _userService.FindById(id);
            if (userToUpdate == null)
                return ApiResponse.Create("User not found.", StatusCodes.Status404NotFound);

            try
            {
                await _userService.UpdateUser(dto, userToUpdate);
                return ApiResponse.Create("User updated!", StatusCodes.Status200OK, userToUpdate);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create($"Error updating user: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> DeleteUser([FromRoute] int id)
        {
            try
            {
                await _userService.DeleteUser(id);
                return ApiResponse.Create("User deleted!", StatusCodes.Status200OK);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create($"Error deleting user: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("store-settings")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> UpdateStoreSettings([FromBody] StoreSettingsDto storeSettingsDto)
        {
            var user = await _userService.GetContextUser(User);
            if (user == null)
                return ApiResponse.Create("User not authenticated.", StatusCodes.Status404NotFound);

            try
            {
                await _userService.UpdateStoreSettings(storeSettingsDto);
                return ApiResponse.Create("Settings updated!", StatusCodes.Status200OK);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create($"Error updating settings: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("store-settings")]
        [Authorize(Roles = Roles.Admin + "," + Roles.Default )]
        public async Task<IActionResult> GetStoreSettings()
        {
            var user = await _userService.GetContextUser(User);
            if (user == null)
                return ApiResponse.Create("User not authenticated.", StatusCodes.Status404NotFound);

            try
            {
                var settings = await _userService.GetStoreSettings();
                return ApiResponse.Create("Success getting the settings!", StatusCodes.Status200OK, settings);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create($"Error getting settings: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        //// endpoint para verificar se a loja esta aberta no momento atual
        //[HttpGet("is-open")]
        //public async Task<ActionResult<object>> IsStoreOpen()
        //{
        //    try
        //    {
        //        var settings = await _storeSettingsService.GetStoreSettings();
        //        var now = DateTime.Now;
        //        var currentDay = GetDayOfWeekString(now.DayOfWeek);
        //        var currentTime = TimeOnly.FromDateTime(now);

        //        var todayHours = settings.WorkingHours
        //            .FirstOrDefault(wh => wh.DayOfWeek == currentDay);

        //        if (todayHours == null || !todayHours.IsOpen)
        //        {
        //            return Ok(new
        //            {
        //                isOpen = false,
        //                message = "Loja fechada hoje",
        //                currentTime = now.ToString("HH:mm"),
        //                dayOfWeek = currentDay
        //            });
        //        }

        //        var startTime = TimeOnly.Parse(todayHours.StartTime);
        //        var endTime = TimeOnly.Parse(todayHours.EndTime);
        //        var isOpen = currentTime >= startTime && currentTime <= endTime;

        //        return Ok(new
        //        {
        //            isOpen = isOpen,
        //            message = isOpen ? "Loja aberta" : "Loja fechada",
        //            currentTime = now.ToString("HH:mm"),
        //            openingTime = todayHours.StartTime,
        //            closingTime = todayHours.EndTime,
        //            dayOfWeek = currentDay
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
        //    }
        //}

        //private string GetDayOfWeekString(DayOfWeek dayOfWeek)
        //{
        //    return dayOfWeek switch
        //    {
        //        DayOfWeek.Monday => "monday",
        //        DayOfWeek.Tuesday => "tuesday",
        //        DayOfWeek.Wednesday => "wednesday",
        //        DayOfWeek.Thursday => "thursday",
        //        DayOfWeek.Friday => "friday",
        //        DayOfWeek.Saturday => "saturday",
        //        DayOfWeek.Sunday => "sunday",
        //        _ => "monday"
        //    };
        //}
    }
}
