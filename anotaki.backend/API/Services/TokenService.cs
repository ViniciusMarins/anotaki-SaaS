using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace anotaki_api.Services
{
	public class TokenService(IConfiguration configuration) : ITokenService
	{
		public string CreateToken(User user)
		{
			string secretKey = configuration["Jwt:SecretKey"]!;
			var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
			var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
			var role = user.Role.ToString().ToLowerInvariant();

			var tokenDescriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(
					[
						new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
						new Claim(JwtRegisteredClaimNames.Email, user.Email),
						new Claim(ClaimTypes.Role, role),
					]
				),
				Expires = DateTime.UtcNow.AddMinutes(configuration.GetValue<int>("Jwt:ExpirationInMinutes")),
				SigningCredentials = credentials,
				Issuer = configuration["Jwt:Issuer"],
				Audience = configuration["Jwt:Audience"],
			};

			var handler = new JsonWebTokenHandler();
			var token = handler.CreateToken(tokenDescriptor);

			return token;
		}

        public string CreateRefreshToken()
		{
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        }
	}
}
