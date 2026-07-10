namespace CHATAPP.APPLICATION.Interfaces;

public interface IOnlineUserService
{
    void Add(Guid userId, string connectionId);

    void Remove(string connectionId);

    bool IsOnline(Guid userId);
}