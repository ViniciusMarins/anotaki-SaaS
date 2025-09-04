using anotaki_api.Models;
using Microsoft.EntityFrameworkCore;

namespace anotaki_api.Data
{
	public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
	{
		public virtual DbSet<User> Users { get; set; }
		public virtual DbSet<Address> Addresses { get; set; }
		public virtual DbSet<Extra> Extras { get; set; }
		public virtual DbSet<Order> Orders { get; set; }
		public virtual DbSet<Product> Products { get; set; }
		public virtual DbSet<ProductExtra> ProductExtras { get; set; }
		public virtual DbSet<OrderProductItem> OrderProductItems { get; set; }
		public virtual DbSet<OrderLog> OrderLogs { get; set; }
		public virtual DbSet<OrderExtraItem> OrderExtraItems { get; set; }
		public virtual DbSet<Category> Categories { get; set; }
		public virtual DbSet<PaymentMethod> PaymentMethods { get; set; }
		public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
		public virtual DbSet<StoreSettings> StoreSettings { get; set; }
		public virtual DbSet<WorkingHours> WorkingHours { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
			modelBuilder.Entity<RefreshToken>().HasKey(r => r.Id);
			modelBuilder.Entity<RefreshToken>().Property(r => r.Token).HasMaxLength(200);
			modelBuilder.Entity<RefreshToken>().HasIndex(r => r.Token).IsUnique();
			modelBuilder.Entity<RefreshToken>().HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId);

            base.OnModelCreating(modelBuilder);
        }
    }
}
