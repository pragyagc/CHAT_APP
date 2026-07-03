using System.Security.Claims;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace APIWEB.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IMessageService _messageService;
    private readonly IConversationService _conversationService;
    private readonly UserManager<User> _userManager;

    public ChatHub(
        IMessageService messageService,
        IConversationService conversationService,
    UserManager<User> userManager)
    {
        _messageService = messageService;
        _conversationService = conversationService;
        _userManager= userManager;
    }

    private async Task<bool> IsAdminAsync()
    {
        var user = await _userManager.GetUserAsync(Context.User);

        if (user == null)
            return false;

        return await _userManager.IsInRoleAsync(user, "Admin");
    }

 
    public override async Task OnConnectedAsync()
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is not null)
        {
            var userId = Guid.Parse(userIdValue);

            OnlineUsers.Add(userId, Context.ConnectionId);

            await Clients.All.SendAsync("UserOnline", userId);
        }

        Console.WriteLine($"Connected: {Context.ConnectionId}");

        await base.OnConnectedAsync();
    }

   
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is not null)
        {
            var userId = Guid.Parse(userIdValue);

            OnlineUsers.Remove(Context.ConnectionId);

            await Clients.All.SendAsync("UserOffline", userId);
        }

        Console.WriteLine($"Disconnected: {Context.ConnectionId}");

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinConversation(Guid conversationId)
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is null)
            throw new HubException("Unauthorized");

        var userId = Guid.Parse(userIdValue);

        var allowed =
        await _conversationService.IsParticipantAsync(conversationId, userId);

        if (!allowed)
        {
            var isAdmin = await IsAdminAsync();

            if (!isAdmin)
                throw new HubException("Not part of this conversation");
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
        Console.WriteLine($"Joined group: {conversationId} with connection {Context.ConnectionId}");
        Console.WriteLine($"User {userId} joined {conversationId}");
    }

 
    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());

        Console.WriteLine($"Left conversation {conversationId}");
    }

 
    public async Task SendMessage(Guid conversationId, string content)
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is null)
            throw new HubException("Unauthorized");

        var senderId = Guid.Parse(userIdValue);
        var user = await _userManager.GetUserAsync(Context.User);

        Console.WriteLine($"Current User: {user?.UserName}");
        Console.WriteLine($"Current Email: {user?.Email}");




        var allowed =
     await _conversationService.IsParticipantAsync(conversationId, senderId);

        Console.WriteLine($"Participant: {allowed}");

        var isAdmin = await IsAdminAsync();

        Console.WriteLine($"IsAdmin: {isAdmin}");

        if (!allowed && !isAdmin)
        {
            throw new HubException("Not allowed");
        }

        var messageDto = await _messageService.SendAsync(
    senderId,
    conversationId,
    content);

        Console.WriteLine("========== SEND MESSAGE ==========");
        Console.WriteLine($"Conversation: {conversationId}");
        Console.WriteLine($"ConnectionId: {Context.ConnectionId}");
        Console.WriteLine($"Sender: {senderId}");

        await Clients.Group(conversationId.ToString())
            .SendAsync("ReceiveMessage", messageDto);

        Console.WriteLine("ReceiveMessage broadcast completed");
        Console.WriteLine("==================================");
    }

   
    public async Task MarkAsSeen(Guid conversationId)
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is null)
            throw new HubException("Unauthorized");

        var userId = Guid.Parse(userIdValue);

        var allowed = await _conversationService.IsParticipantAsync(conversationId, userId);

        if (!allowed)
        {
            var isAdmin = await IsAdminAsync();

            if (!isAdmin)
                throw new HubException("Not allowed");
        }

        await _messageService.MarkConversationAsSeen(conversationId, userId);

        var messageDtos =
    await _messageService.GetConversationMessagesAsync(conversationId);

        await Clients.Group(conversationId.ToString())
            .SendAsync("ConversationUpdated", messageDtos);
    }

    public bool IsUserOnline(Guid userId)
    {
        return OnlineUsers.IsOnline(userId);
    }

    
}