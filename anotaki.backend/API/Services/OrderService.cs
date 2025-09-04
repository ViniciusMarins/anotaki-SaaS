using anotaki_api.Data;
using anotaki_api.DTOs.Requests.Api;
using anotaki_api.DTOs.Requests.Order;
using anotaki_api.DTOs.Response.Api;
using anotaki_api.Hubs;
using anotaki_api.Models;
using anotaki_api.Queues.Publishers.Interfaces;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace anotaki_api.Services
{
    public class OrderService(AppDbContext context, IOrderPublisher orderPublisher, IHubContext<OrderHub> hubContext) : IOrderService
    {
        private readonly AppDbContext _context = context;
        private readonly IOrderPublisher _orderPublisher = orderPublisher;
        private IHubContext<OrderHub> _hubContext = hubContext;

        public async Task<PaginatedDataResponse<Order>> GetPaginatedOrders(PaginationParams paginationParams)
        {
            int page = paginationParams.Page < 1 ? 1 : paginationParams.Page;
            var query = _context.Orders
                .Where(x => x.OrderStatus != OrderStatus.Cart)
                .Include(x => x.PaymentMethod)
                .Include(x => x.Items)
                .AsNoTracking();

            // Aplicar sorting
            query = ApplySorting(query, paginationParams.SortBy, paginationParams.SortDirection);
            query = ApplyFiltering(query, paginationParams.FilterBy, paginationParams.Filter);

            var totalItems = await query.CountAsync();
            var orders = await query
                .Skip((page - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalItems / paginationParams.PageSize);

            return new PaginatedDataResponse<Order>
            {
                Page = paginationParams.Page,
                PageSize = paginationParams.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = orders
            };
        }

        private IQueryable<Order> ApplySorting(IQueryable<Order> query, string? sortBy, string? sortDirection)
        {
            if (string.IsNullOrEmpty(sortBy))
                return query.OrderBy(x => x.Id); // Sort padrão

            var isDescending = sortDirection?.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "id" => isDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id),
                "totalprice" => isDescending ? query.OrderByDescending(x => x.TotalPrice) : query.OrderBy(x => x.TotalPrice),
                "orderstatus" => isDescending ? query.OrderByDescending(x => x.OrderStatus) : query.OrderBy(x => x.OrderStatus),
                "paymentmethod" => isDescending ? query.OrderByDescending(x => x.PaymentMethod!.Name) : query.OrderBy(x => x.PaymentMethod!.Name),
                "createdat" => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
                "updatedat" => isDescending ? query.OrderByDescending(x => x.UpdatedAt) : query.OrderBy(x => x.UpdatedAt),
                "user" => isDescending ? query.OrderByDescending(x => x.User.Name) : query.OrderBy(x => x.User.Name),

                _ => query.OrderBy(x => x.Id) // Fallback para sort padrão
            };
        }

        public IQueryable<Order> ApplyFiltering(IQueryable<Order> query, string? filterBy, string? filter)
        {
            if (string.IsNullOrEmpty(filterBy))
                return query;

            return filterBy.ToLower() switch
            {
                "orderstatus" => query.Where(x => x.OrderStatus == (OrderStatus)int.Parse(filter!)),
                "createdat" => ApplyDateRangeFilter(query, filter!),

                _ => query // Fallback para filter padrão
            };
        }

        private IQueryable<Order> ApplyDateRangeFilter(IQueryable<Order> query, string filter)
        {
            // Formato esperado: "2024-01-01,2024-01-31" (startDate,endDate)
            var dates = filter.Split(',');
            if (dates.Length != 2)
                return query;

            if (DateTime.TryParse(dates[0], out var startDate) &&
                DateTime.TryParse(dates[1], out var endDate))
            {
                // Converte para UTC explicitamente
                var startDateUtc = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
                var endDateUtc = DateTime.SpecifyKind(endDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

                return query.Where(x => x.CreatedAt >= startDateUtc && x.CreatedAt <= endDateUtc);
            }

            return query;
        }


        public async Task<Order> GetCart(int userId)
        {
            var cart = await _context.Orders
                .Include(x => x.Items)
                    .ThenInclude(x => x.Product)
                .Include(x => x.Items)
                    .ThenInclude(x => x.ExtrasItems)
                        .ThenInclude(x => x.Extra)
                .AsSplitQuery()
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.UserId == userId && o.OrderStatus == OrderStatus.Cart);

            if (cart == null)
            {
                var newCart = new Order
                {
                    UserId = userId,
                    OrderStatus = OrderStatus.Cart,
                    TotalPrice = 0,
                };
                _context.Orders.Add(newCart);
                await _context.SaveChangesAsync();

                return newCart;
            }

            return cart;
        }

        public async Task<Order?> GetOrderById(int orderId)
        {
            return await _context.Orders.FindAsync(orderId);
        }

        public async Task<List<Order>> GetOrdersByUser(int userId)
        {
            return await _context.Orders
                .Where(x => x.OrderStatus != OrderStatus.Cart && x.UserId == userId)
                .Include(x => x.Items)
                    .ThenInclude(x => x.Product)
                .Include(x => x.Address)
                .OrderByDescending(x => x.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task CheckoutOrder(Order order, CheckoutOrderDTO dto, int userId)
        {
            //calculos e afins antes
            var address =
                await _context.Addresses.FindAsync(dto.AddressId) ?? throw new Exception($"Address with id {dto.AddressId} not found.");

            var paymentMethod =
                 await _context.PaymentMethods.FindAsync(dto.PaymentMethodId) ?? throw new Exception($"Payment Method with id {dto.PaymentMethodId} not found.");

            foreach (var item in order.Items)
            {
                item.Product.SalesCount += item.Quantity;
            }

            order.AddressId = address.Id;
            order.PaymentMethodId = paymentMethod.Id;
            order.TotalPrice = CalculateOrderTotalPrice(order);
            order.OrderStatus = OrderStatus.Pending;
            order.Notes = dto.Notes;

            order.CreatedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            order.Logs.Add(new OrderLog()
            {
                Description = "Pedido realizado",
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            });

            var log = MakeOrderLog(OrderStatus.Pending, userId);
            order.Logs.Add(log);

            _context.Update(order);
            await _context.SaveChangesAsync();

            //manda pra fila
            await _orderPublisher.Publish(order);
        }

        public async Task<Order> AddProductToOrder(User user, AddProductToOrderDTO dto)
        {
            var cart = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.ExtrasItems)
                        .ThenInclude(x => x.Extra)
                .FirstOrDefaultAsync(o => o.UserId == user.Id && o.OrderStatus == OrderStatus.Cart)
                ?? throw new Exception("Cart not found.");

            var product = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == dto.ProductId)
                ?? throw new Exception($"Product with id {dto.ProductId} not found.");

            var extraIds = dto.Extras.Select(e => e.ExtraId).ToList();
            var extras = await _context.Extras
                .AsNoTracking()
                .Where(ex => extraIds.Contains(ex.Id))
                .ToDictionaryAsync(ex => ex.Id);

            var productItem = new OrderProductItem
            {
                OrderId = cart.Id,
                ProductId = dto.ProductId,
                Quantity = 1,
                UnitPrice = product.Price,
                Notes = dto.Notes,
                ExtrasItems = dto.Extras.Select(x =>
                {
                    if (!extras.TryGetValue(x.ExtraId, out var extra))
                        throw new Exception($"Extra with id {x.ExtraId} not found.");

                    return new OrderExtraItem
                    {
                        ExtraId = x.ExtraId,
                        UnitPrice = extra.Price,
                        Quantity = x.Quantity,
                        TotalPrice = x.Quantity * extra.Price
                    };
                }).ToList()
            };

            productItem.TotalPrice = productItem.UnitPrice * productItem.Quantity
                + productItem.ExtrasItems.Sum(e => e.UnitPrice * e.Quantity);

            cart.TotalPrice += productItem.TotalPrice;

            _context.OrderProductItems.Add(productItem);
            await _context.SaveChangesAsync();

            return cart;
        }

        public decimal CalculateOrderTotalPrice(Order order)
        {
            var totalPriceOrder = 0M;
            if (order.Items == null || order.Items.Count == 0)
                return 0M;

            return totalPriceOrder += order.Items.Sum(o => o.TotalPrice);
        }


        public async Task ChangeProductQuantity(ChangeProductQuantityDTO dto, User user)
        {
            var cart = await _context.Orders
                 .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                 .Include(o => o.Items)
                    .ThenInclude(i => i.ExtrasItems)
                        .ThenInclude(e => e.Extra)
                 .FirstOrDefaultAsync(o => o.UserId == user.Id && o.OrderStatus == OrderStatus.Cart) ?? throw new Exception("Cart not found.");

            var cartItem = cart.Items.FirstOrDefault(i => i.Id == dto.ItemId) ?? throw new Exception("Item not found.");

            cartItem.UnitPrice = cartItem.Product?.Price ?? 0;
            var itemPrice = (cartItem.UnitPrice * 1) + (cartItem.ExtrasItems.Sum(x => x.TotalPrice) * 1);

            if (dto.Operation == ChangeProductQuantityOperations.Add)
            {
                cartItem.Quantity += 1;
                cartItem.TotalPrice += itemPrice;
            }
            else
            {
                if (cartItem.Quantity == 1)
                {
                    cart.Items.Remove(cartItem);
                    cart.TotalPrice = CalculateOrderTotalPrice(cart);

                    _context.OrderProductItems.Remove(cartItem);

                    await _context.SaveChangesAsync();

                    return;
                }

                cartItem.Quantity -= 1;
                cartItem.TotalPrice -= itemPrice;
            }

            cart.TotalPrice = CalculateOrderTotalPrice(cart);

            _context.OrderProductItems.Update(cartItem!);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteOrder(int orderId)
        {
            var order = await GetOrderById(orderId) ?? throw new Exception("Order not found.");

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
        }

        public async Task<Order> GetOrderDetails(int orderId)
        {
            var order = await _context.Orders
                .Include(x => x.Address)
                .Include(x => x.User)
                .Include(x => x.Logs)
                .Include(x => x.Items)
                    .ThenInclude(x => x.Product)
                .Include(x => x.Items)
                    .ThenInclude(x => x.ExtrasItems)
                        .ThenInclude(x => x.Extra)
                .Include(x => x.PaymentMethod)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == orderId)
                ?? throw new Exception("Order not found.");

            return order;
        }

        public async Task<Order> ChangeOrderStatus(int orderId, int orderStatus, int userId)
        {
            OrderStatus status;
            try
            {
                status = (OrderStatus)orderStatus;
            }
            catch
            {
                throw new Exception("Invalid Status.");
            }

            var order = await GetOrderById(orderId) ?? throw new Exception("Order not found.");

            order.OrderStatus = status;
            var log = MakeOrderLog(status, userId, order.Id);

            _context.OrderLogs.Add(log);
            _context.Orders.Update(order);

            await _context.SaveChangesAsync();
            await _hubContext.Clients.Group($"user-{order.UserId}").SendAsync("OrderStatusUpdate", order);

            return order;

        }

        public OrderLog MakeOrderLog(OrderStatus orderStatus, int userId, int? orderId = null)
        {
            if (orderId <= 0)
                throw new ArgumentException("OrderId deve ser maior que zero");

            if (userId <= 0)
                throw new ArgumentException("UserId deve ser maior que zero");

            var description = orderStatus switch
            {
                OrderStatus.Pending => "Pedido em análise",
                OrderStatus.Preparing => "Pedido em produção",
                OrderStatus.OnTheWay => "Saiu para entrega",
                OrderStatus.Delivered => "Pedido finalizado",
                OrderStatus.Cancelled => "Pedido cancelado",
                _ => throw new ArgumentException($"Status inválido: {orderStatus}")
            };

            return orderId != null ? new OrderLog
            {
                Description = description,
                Status = orderStatus,
                OrderId = (int)orderId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            } : new OrderLog
            {
                Description = description,
                Status = orderStatus,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            };
        }
    }
}
