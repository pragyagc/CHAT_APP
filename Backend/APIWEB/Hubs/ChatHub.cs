using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace APIWEB.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IMessageService _messageService;
    private readonly IConversationService _conversationService;

    public ChatHub(
        IMessageService messageService,
        IConversationService conversationService)
    {
        _messageService = messageService;
        _conversationService = conversationService;
    }

    // -----------------------------------
    // CONNECT
    // -----------------------------------
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

    // -----------------------------------
    // DISCONNECT
    // -----------------------------------
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

    // -----------------------------------
    // JOIN CHAT ROOM
    // -----------------------------------
    public async Task JoinConversation(Guid conversationId)
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is null)
            throw new HubException("Unauthorized");

        var userId = Guid.Parse(userIdValue);

        var allowed = await _conversationService.IsParticipantAsync(conversationId, userId);

        if (!allowed)
            throw new HubException("Not part of this conversation");

        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
        Console.WriteLine($"Joined group: {conversationId} with connection {Context.ConnectionId}");
        Console.WriteLine($"User {userId} joined {conversationId}");
    }

    // -----------------------------------
    // LEAVE CHAT ROOM
    // -----------------------------------
    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());

        Console.WriteLine($"Left conversation {conversationId}");
    }

    // -----------------------------------
    // SEND MESSAGE (REALTIME CORE FIX)
    // -----------------------------------
    public async Task SendMessage(Guid conversationId, string content)
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is null)
            throw new HubException("Unauthorized");

        var senderId = Guid.Parse(userIdValue);

        var allowed = await _conversationService.IsParticipantAsync(conversationId, senderId);

        if (!allowed)
            throw new HubException("Not allowed");

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

    // -----------------------------------
    // MARK AS SEEN
    // -----------------------------------
    public async Task MarkAsSeen(Guid conversationId)
    {
        var userIdValue = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue is null)
            throw new HubException("Unauthorized");

        var userId = Guid.Parse(userIdValue);

        var allowed = await _conversationService.IsParticipantAsync(conversationId, userId);

        if (!allowed)
            throw new HubException("Not allowed");

        await _messageService.MarkConversationAsSeen(conversationId, userId);

        var messageDtos =
    await _messageService.GetConversationMessagesAsync(conversationId);

        await Clients.Group(conversationId.ToString())
            .SendAsync("ConversationUpdated", messageDtos);
    }

    // -----------------------------------
    // ONLINE CHECK
    // -----------------------------------
    public bool IsUserOnline(Guid userId)
    {
        return OnlineUsers.IsOnline(userId);
    }

    
}