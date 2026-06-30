using System.Collections.Concurrent;

namespace APIWEB.Hubs;

public static class OnlineUsers
{
    private static readonly ConcurrentDictionary<Guid, string> _users = new();

    public static void Add(Guid userId, string connectionId)
    {
        _users[userId] = connectionId;
    }

    public static void Remove(string connectionId)
    {
        var user = _users.FirstOrDefault(x => x.Value == connectionId);

        if (!user.Equals(default(KeyValuePair<Guid, string>)))
        {
            _users.TryRemove(user.Key, out _);
        }
    }

    public static bool IsOnline(Guid userId)
    {
        return _users.ContainsKey(userId);
    }
}