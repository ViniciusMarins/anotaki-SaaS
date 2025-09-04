namespace anotaki_api.Models
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
