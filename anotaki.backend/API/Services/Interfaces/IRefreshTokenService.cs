using anotaki_api.Models;

namespace anotaki_api.Services.Interfaces
{
    public interface IRefreshTokenService
    {
        Task DeleteRefreshToken(RefreshToken refreshToken);
        Task<RefreshToken?> GetStoredRefreshToken(string token);
        Task SaveRefreshToken(RefreshToken refreshToken);
    }
}
