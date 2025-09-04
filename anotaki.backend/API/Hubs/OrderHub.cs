using anotaki_api.DTOs.Response.Api;
using anotaki_api.Models;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace anotaki_api.Hubs
{
    public class OrderHub(IUserService userService) : Hub
    {
        public readonly IUserService _userService = userService;
        public override async Task OnConnectedAsync()
        {
            var user = await _userService.GetContextUser(Context.User!);

            if (user != null)
            {
                Console.WriteLine($"[Hub] Conectado user-{user.Id}");

                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{user.Id}");

                if (user.Role == Role.Admin)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = await _userService.GetContextUser(Context.User!);

            if (user != null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{user.Id}");

                if (user.Role == Role.Admin)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendOrderUpdate(Order order)
        {
            await Clients.Group("Admins").SendAsync("ReceiveOrder", order);
        }
    }
}
