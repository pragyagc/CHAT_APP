import { useEffect, useState } from "react";
import { ApiwebService } from "../services";

type User = { id: string; userName: string; email: string };

type Props = {
  currentUserId: string;
  onConversationCreated: () => void;
  onSelectConversation: (conversation: any) => void;
};

export default function UserList({
  currentUserId,
  onConversationCreated,
  onSelectConversation,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUserId) loadUsers();
  }, [currentUserId]);

  async function loadUsers() {
    try {
      setLoading(true);
      const allUsers = await ApiwebService.getUsers();
      const conversations = await ApiwebService.getConversations();
      // only exclude users whose conversation already has messages
      const existingIds = conversations
        .filter((c: any) => c.lastMessage)
        .map((c: any) => c.otherUserId);
      setUsers(
        allUsers.filter(
          (u: User) => u.id !== currentUserId && !existingIds.includes(u.id)
        )
      );
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }

  async function createConversation(userId: string) {
    try {
      const created = await ApiwebService.postConversations(userId);
      const conversations = await ApiwebService.getConversations();
      const full = conversations.find((c: any) => c.id === created.id);
      onConversationCreated();
      if (full) onSelectConversation(full);
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  }

  if (loading || users.length === 0) return null;

  return (
    <div>
      <div className="sidebar-section-title">New Chat</div>
      {users.map((user) => (
        <div
          key={user.id}
          className="user-item"
          onClick={() => createConversation(user.id)}
        >
          <div className="user-avatar">
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <strong>{user.userName}</strong>
            <span>{user.email}</span>
          </div>
          <button
            className="user-start-btn"
            onClick={(e) => { e.stopPropagation(); createConversation(user.id); }}
          >
            Chat
          </button>
        </div>
      ))}
    </div>
  );
}
