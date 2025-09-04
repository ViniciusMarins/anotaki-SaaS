using anotaki_api.Data;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace anotaki_api.Services
{
    public class RefreshTokenService(AppDbContext context) : IRefreshTokenService
    {
        private readonly AppDbContext _context = context;

        public async Task SaveRefreshToken(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetStoredRefreshToken(string token)
        {
            return await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token);
        }

        public async Task DeleteRefreshToken(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Remove(refreshToken);
            await _context.SaveChangesAsync();
        }
    }
}
