// DataSeeder.cs
using anotaki_api.Models;

namespace anotaki_api.Data
{
    public static class DataSeeder
    {
        public static async Task SeedInitialDataAsync(AppDbContext context)
        {
            if (!context.Users.Any() || !context.Users.Any(u => u.Id == 1))
            {
                // password: admin1
                context.Users.AddRange(
                    new User { Id = 1, Name = "System Admin", Email= "admin@admin.com", IsActive = true,  Password = "$2a$11$jzPPXyriPq0CeoSWxrlod.thTx/AX2ZTD0GDfQ4227gd0eNqW6/6q", Role = Role.Admin, Cpf = "00000000000",CreatedAt = DateTime.UtcNow }
                );
            }
            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Pastéis", CreatedAt = DateTime.UtcNow },
                    new Category { Name = "Hamburguers", CreatedAt = DateTime.UtcNow },
                    new Category { Name = "Refrigerantes", CreatedAt = DateTime.UtcNow }
                );
            }

            if (!context.PaymentMethods.Any())
            {
                context.PaymentMethods.AddRange(
                    new PaymentMethod { Name = "Cartão de Crédito", CreatedAt = DateTime.UtcNow },
                    new PaymentMethod { Name = "Pix", CreatedAt = DateTime.UtcNow },
                    new PaymentMethod { Name = "Boleto", CreatedAt = DateTime.UtcNow }
                );
            }

            if (!context.Extras.Any())
            {
                context.Extras.AddRange(
                    new Extra { Name = "Ovo frito", Price = 5.00m },
                    new Extra { Name = "Hamburguer", Price = 50.00m },
                    new Extra { Name = "Cebola roxa", Price = 30.00m }
                );
                await context.SaveChangesAsync();
            }

            if (!context.Products.Any())
            {
                var category = context.Categories.FirstOrDefault();

                var product1 = new Product
                {
                    Name = "Anotaki Frango",
                    Price = 199.90m,
                    Description = "2 salsichas, frango, alface, milho, batata palha e molho.",
                    CategoryId = category?.Id,
                    CreatedAt = DateTime.UtcNow,
                    SalesCount = 5
                };

                var product2 = new Product
                {
                    Name = "Anotaki Carne Seca",
                    Price = 49.99m,
                    Description = "2 salsichas, carne seca, alface, milho, batata palha e molho.",
                    CategoryId = category?.Id,
                    CreatedAt = DateTime.UtcNow,
                    SalesCount = 10
                };

                context.Products.AddRange(product1, product2);
                await context.SaveChangesAsync(); 

                var extras = context.Extras.ToList();

                context.ProductExtras.AddRange(
                    new ProductExtra { ProductId = product1.Id, ExtraId = extras[0].Id },
                    new ProductExtra { ProductId = product1.Id, ExtraId = extras[1].Id },
                    new ProductExtra { ProductId = product2.Id, ExtraId = extras[0].Id }
                );
            }

            await context.SaveChangesAsync();
        }
    }
}