using anotaki_api.DTOs.Requests.Auth;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services;
using anotaki_api.Services.Interfaces;
using anotaki_api.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;

namespace anotaki_api.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController(ITokenService tokenService, IUserService userService, IWebHostEnvironment env, IConfiguration configuration
        , IRefreshTokenService refreshTokenService, IMemoryCache memoryCache) : ControllerBase
    {
        private readonly ITokenService _tokenService = tokenService;
        private readonly IUserService _userService = userService;
        private readonly IWebHostEnvironment _env = env;
        private readonly IConfiguration _configuration = configuration;
        private readonly IRefreshTokenService _refreshTokenService = refreshTokenService;
        private readonly IMemoryCache _memoryCache = memoryCache;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            var user = await _userService.FindByEmail(loginDTO.Email);
            if (user == null || !HashUtils.VerifyPassword(loginDTO.Password, user.Password))
            {
                return ApiResponse.Create("User not found.", StatusCodes.Status401Unauthorized);
            }

            try
            {
                var token = _tokenService.CreateToken(user);
                var refreshToken = _tokenService.CreateRefreshToken();

                var dbRefreshToken = new RefreshToken()
                {
                    ExpiresAt = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("RefreshToken:ExpirationInDays")),
                    Token = refreshToken,
                    UserId = user.Id,
                };

                var isDevEnv = _env.IsDevelopment();
                var cookieOptions = new CookieOptions()
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = isDevEnv ? SameSiteMode.Lax : SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("RefreshToken:ExpirationInDays"))
                };

                Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

                await _refreshTokenService.SaveRefreshToken(dbRefreshToken);

                var userData = new
                {
                    user,
                    token
                };

                return ApiResponse.Create("User auth successfully.", StatusCodes.Status200OK, userData);
            }
            catch (Exception ex)
            {
                return ApiResponse.Create($"Error autenticating the user: {ex.Message}", StatusCodes.Status400BadRequest);
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> Refresh()
        {
            var cookieToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(cookieToken))
                return Unauthorized();

            var cacheKey = $"refresh_{cookieToken}";

            if (_memoryCache.TryGetValue(cacheKey, out _))
                return StatusCode(429, "Refresh in progress");

            _memoryCache.Set(cacheKey, true, TimeSpan.FromSeconds(5));

            try
            {
                var dbRefreshToken = await _refreshTokenService.GetStoredRefreshToken(cookieToken);
                if (dbRefreshToken == null || dbRefreshToken.ExpiresAt < DateTime.UtcNow)
                    return Unauthorized();

                var user = await _userService.FindById(dbRefreshToken.UserId);
                if (user == null)
                    return Unauthorized();

                await _refreshTokenService.DeleteRefreshToken(dbRefreshToken);

                // Rotaciona tokens
                var newAccesstoken = _tokenService.CreateToken(user);
                var newRefreshToken = _tokenService.CreateRefreshToken();

                var newDbRefreshToken = new RefreshToken()
                {
                    ExpiresAt = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("RefreshToken:ExpirationInDays")),
                    Token = newRefreshToken,
                    UserId = user.Id,
                };

                var isDevEnv = _env.IsDevelopment();
                var cookieOptions = new CookieOptions()
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = isDevEnv ? SameSiteMode.Lax : SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("RefreshToken:ExpirationInDays")),
                };

                await _refreshTokenService.SaveRefreshToken(newDbRefreshToken);

                Response.Cookies.Append("refreshToken", newRefreshToken, cookieOptions);

                var userData = new
                {
                    user,
                    token = newAccesstoken
                };

                return ApiResponse.Create("User refreshed successfully.", StatusCodes.Status200OK, userData);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message + " " + ex.StackTrace);
                return ApiResponse.Create("Error refreshing token for the user.", StatusCodes.Status400BadRequest);
            }
            finally
            {
                _memoryCache.Remove(cacheKey);
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var cookieToken = Request.Cookies["refreshToken"];
            if (cookieToken != null)
            {
                var dbRefreshToken = await _refreshTokenService.GetStoredRefreshToken(cookieToken);

                if(dbRefreshToken != null)
                {
                    await _refreshTokenService.DeleteRefreshToken(dbRefreshToken);
                    Response.Cookies.Delete("refreshToken");
                }
            }

            return Ok();
        }

    }
}
