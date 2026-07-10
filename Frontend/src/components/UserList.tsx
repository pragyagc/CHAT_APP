import { useEffect, useState } from "react";
import { ApiwebService } from "../services";

type User = { id: string; userName: string; email: string };

type Props = {
  currentUserId: string;
  conversations: any[];
  onConversationCreated: (conversations: any[]) => void;
  onSelectConversation: (conversation: any) => void;
};

export default function UserList({
  currentUserId,
  conversations,
  onConversationCreated,
  onSelectConversation,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUserId) loadUsers();
  }, [currentUserId, conversations]);

  async function loadUsers() {
    try {
      setLoading(true);
      const allUsers = await ApiwebService.getUsers();
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

      onConversationCreated(conversations);
      if (full) onSelectConversation(full);
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  }

  // Hide the section entirely if loading or no eligible users
  if (loading || users.length === 0) return null;

  return (
    <div>
      <div className="sidebar-section-title">New Chat</div>

      {users.map((user) => (
        <div
          key={user.id}
          className="user-item"
          onClick={() => createConversation(user.id)} // Clicking the row also starts a chat
        >
          {/* Avatar: first letter of username */}
          <div className="user-avatar">
            {user.userName.charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <strong>{user.userName}</strong>
            <span>{user.email}</span>
          </div>

          {/* Chat button — stopPropagation prevents the row's onClick from firing twice */}
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
