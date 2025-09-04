using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Product;
using anotaki_api.DTOs.Response;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace anotaki_api.Services
{
    public class ProductService(AppDbContext context) : IProductService
    {
        private readonly AppDbContext _context = context;

        public async Task<List<Product>> GetAllProducts()
        {
            return await _context.Products.Include(x => x.Extras).ToListAsync();
        }

        public async Task<PaginatedDataResponse<Product>> GetPaginatedProducts(PaginationParams paginationParams)
        {
            int page = paginationParams.Page < 1 ? 1 : paginationParams.Page;
            var query = _context.Products
                .Include(x => x.Category)
                .Include(x => x.Extras)
                .AsNoTracking();

            // Aplicar sorting
            query = ApplySorting(query, paginationParams.SortBy, paginationParams.SortDirection);
            query = ApplyFiltering(query, paginationParams.FilterBy, paginationParams.Filter);

            var totalItems = await query.CountAsync();
            var products = await query
                .Skip((page - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalItems / paginationParams.PageSize);

            return new PaginatedDataResponse<Product>
            {
                Page = paginationParams.Page,
                PageSize = paginationParams.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = products
            };
        }

        private IQueryable<Product> ApplySorting(IQueryable<Product> query, string? sortBy, string? sortDirection)
        {
            if (string.IsNullOrEmpty(sortBy))
                return query.OrderBy(x => x.Id); // Sort padrão

            var isDescending = sortDirection?.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "id" => isDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id),
                "name" => isDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "price" => isDescending ? query.OrderByDescending(x => x.Price) : query.OrderBy(x => x.Price),
                "description" => isDescending ? query.OrderByDescending(x => x.Description) : query.OrderBy(x => x.Description),
                "salescount" => isDescending ? query.OrderByDescending(x => x.SalesCount) : query.OrderBy(x => x.SalesCount),
                "isactive" => isDescending ? query.OrderByDescending(x => x.IsActive) : query.OrderBy(x => x.IsActive),
                "createdat" => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),

                // Para propriedades de objetos relacionados
                "category" => isDescending ? query.OrderByDescending(x => x.Category!.Name) : query.OrderBy(x => x.Category!.Name),

                _ => query.OrderBy(x => x.Id) // Fallback para sort padrão
            };
        }

        public IQueryable<Product> ApplyFiltering(IQueryable<Product> query, string? filterBy, string? filter)
        {
            if (string.IsNullOrEmpty(filterBy))
                return query;

            return filterBy.ToLower() switch
            {
                "category" => query.Where(x => x.Category!.Name.Trim().ToLower() == filter!.Trim().ToLower()),
                "isactive" => query.Where(x => x.IsActive == bool.Parse(filter!)),

                _ => query // Fallback para filter padrão
            };
        }

        public async Task<Product> CreateProduct(CreateProductRequestDTO dto)
        {
            var newProduct = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                CategoryId = int.Parse(dto.CategoryId!),
                ImageData = dto.ImageData,
                ImageMimeType = dto.ImageMimeType, 
                CreatedAt = DateTime.UtcNow
            };

            if(dto.ExtraIds != null)
            {
                foreach (var id in dto.ExtraIds)
                {
                    newProduct.Extras.Add(new()
                    {
                        ExtraId = id,
                    });
                }
            }
            
            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync();
            return newProduct;
        }

        public async Task<Product> UpdateProduct(CreateProductRequestDTO form, int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                throw new KeyNotFoundException("Product not found");

            product.Name = form.Name;
            product.Price = form.Price;
            product.Description = form.Description;

            if (form.CategoryId != null)
                product.CategoryId = int.Parse(form.CategoryId!);

            if (form.ImageData != null)
            {
                product.ImageData = form.ImageData;
                product.ImageMimeType = form.ImageMimeType;
            }

            if (form.ExtraIds != null)
            {
                // Remover todos os extras existentes primeiro
                var existingExtras = await _context.ProductExtras
                    .Where(pe => pe.ProductId == id)
                    .ToListAsync();

                _context.ProductExtras.RemoveRange(existingExtras);

                // Adicionar os novos extras
                foreach (var idExtra in form.ExtraIds)
                {
                    _context.ProductExtras.Add(new ProductExtra()
                    {
                        ProductId = id,
                        ExtraId = idExtra
                    });
                }
            }

            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product?> GetById(int id)
        {
            return await _context.Products.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task DeleteProduct(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                throw new Exception("Product not found");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }

        public async Task ToggleProductStatus(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                throw new Exception("Product not found");

            product.IsActive = !product.IsActive;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ProductsByCategory>> ProductsFilterByCategory(string? searchTerm)
        {
            var categoriesWithProducts = _context.Categories
                .Include(c => c.Products)
                    .ThenInclude(p => p.Extras)
                        .ThenInclude(pe => pe.Extra)
                .Where(c => c.Products.Count > 0);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                string normalizedTerm = searchTerm.ToLower().Trim();

                categoriesWithProducts = categoriesWithProducts.Where(x => x.Products.Any(x => x.Name.ToLower().Trim().Contains(normalizedTerm)));

                return [..categoriesWithProducts.Select(c => new ProductsByCategory
                {
                    Name = c.Name,
                    Products = c.Products
                    .Where(p => p.Name.ToLower().Contains(normalizedTerm))
                    .ToList(),
                })];
            }

            var mostOrderedProducts = await _context.Products
                .OrderByDescending(p => p.SalesCount)
                .Take(5)
                .ToListAsync();

            ProductsByCategory mostOrdered = new()
            {
                Name = "Mais pedidos",
                Products = mostOrderedProducts
            };

            return [
                mostOrdered, 
                .. categoriesWithProducts.Select(c => new ProductsByCategory
                {
                    Name = c.Name,
                    Products = c.Products,
                })
            ];
        }
    }
}
