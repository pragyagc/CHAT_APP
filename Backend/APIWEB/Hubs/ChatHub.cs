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

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"SignalR Connected : {Context.ConnectionId}");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"SignalR Disconnected : {Context.ConnectionId}");

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinConversation(Guid conversationId)
    {
        var userIdValue =
            Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue == null)
            throw new HubException("Unauthorized");

        var userId = Guid.Parse(userIdValue);

        var allowed = await _conversationService.IsParticipantAsync(
            conversationId,
            userId);

        if (!allowed)
            throw new HubException(
                "You are not a participant of this conversation.");

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            conversationId.ToString());

        Console.WriteLine(
            $"User {userId} joined conversation {conversationId}");
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            conversationId.ToString());

        Console.WriteLine(
            $"User left conversation {conversationId}");
    }

    public async Task SendMessage(
        Guid conversationId,
        string content)
    {
        var userIdValue =
            Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue == null)
            throw new HubException("Unauthorized");

        var senderId = Guid.Parse(userIdValue);

        var allowed =
            await _conversationService.IsParticipantAsync(
                conversationId,
                senderId);

        if (!allowed)
            throw new HubException(
                "You are not part of this conversation.");

        var message =
            await _messageService.SendAsync(
                senderId,
                conversationId,
                content);

        await Clients
            .Group(conversationId.ToString())
            .SendAsync("ReceiveMessage", message);
    }

    public async Task MarkAsSeen(Guid conversationId)
    {
        var userIdValue = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdValue == null)
            throw new HubException("Unauthorized");

        var userId = Guid.Parse(userIdValue);

        var allowed = await _conversationService.IsParticipantAsync(conversationId, userId);

        if (!allowed)
            throw new HubException("Not allowed");

        await _messageService.MarkConversationAsSeen(conversationId, userId);

        // Get updated messages from DB
        var messages = await _messageService.GetConversationMessagesAsync(conversationId);

        await Clients.Group(conversationId.ToString())
            .SendAsync("ConversationUpdated", messages);
    }
}