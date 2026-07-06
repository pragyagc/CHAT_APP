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
        var user = await _userManager.GetUserAsync(Context.User);

        if (user == null)
        {
            Context.Abort();
            return;
        }

        if (user.IsDeleted)
        {
            Context.Abort();
            return;
        }

        if (user.IsBlocked)
        {
            Context.Abort();
            return;
        }

        OnlineUsers.Add(user.Id, Context.ConnectionId);

        // Join ALL conversation groups
        var conversationIds =
            await _conversationService
                .GetConversationIdsForUserAsync(user.Id);

        foreach (var conversationId in conversationIds)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                conversationId.ToString());
        }

        await Clients.All.SendAsync("UserOnline", user.Id);

        Console.WriteLine($"Connected: {Context.ConnectionId}");
        Console.WriteLine($"Joined {conversationIds.Count} conversation groups");

        await base.OnConnectedAsync();
    }

    //disconnected

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = await _userManager.GetUserAsync(Context.User);

        if (user != null)
        {
            OnlineUsers.Remove(Context.ConnectionId);

            await Clients.All.SendAsync("UserOffline", user.Id);
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
        Console.WriteLine($"User {userId} joined group {conversationId}");
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
        await Clients.Group(conversationId.ToString())
    .SendAsync("ConversationChanged", conversationId);
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

        await Clients.OthersInGroup(conversationId.ToString())
            .SendAsync("MessagesSeen", conversationId);
    }

    public bool IsUserOnline(Guid userId)
    {
        return OnlineUsers.IsOnline(userId);
    }

    public async Task NotifyConversationOpened(Guid conversationId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            conversationId.ToString());
    }


    public async Task Typing(Guid conversationId)
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

        var user = await _userManager.GetUserAsync(Context.User);

        if (user == null)
            return;

        await Clients.OthersInGroup(conversationId.ToString())
            .SendAsync(
                "UserTyping",
                conversationId,
                user.Id,
                user.UserName
            );
    }

    public async Task StopTyping(Guid conversationId)
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

        await Clients.OthersInGroup(conversationId.ToString())
            .SendAsync(
                "UserStoppedTyping",
                conversationId,
                userId
            );
    }


}