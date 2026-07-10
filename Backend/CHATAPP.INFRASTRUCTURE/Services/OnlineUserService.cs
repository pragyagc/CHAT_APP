using System.Collections.Concurrent;
using CHATAPP.APPLICATION.Interfaces;

namespace CHATAPP.INFRASTRUCTURE.Services;

public class OnlineUserService : IOnlineUserService
{
    private readonly ConcurrentDictionary<Guid, string> _users = new();

    public void Add(Guid userId, string connectionId)
    {
        _users[userId] = connectionId;
    }

    public void Remove(string connectionId)
    {
        var user = _users.FirstOrDefault(x => x.Value == connectionId);

        if (!user.Equals(default(KeyValuePair<Guid, string>)))
        {
            _users.TryRemove(user.Key, out _);
        }
    }

    public bool IsOnline(Guid userId)
    {
        return _users.ContainsKey(userId);
    }
}