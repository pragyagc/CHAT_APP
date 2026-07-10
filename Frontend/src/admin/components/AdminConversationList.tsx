import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";

type Props = {
  onSelectConversation: (conversation: any) => void;
  selectedId?: string; // ID of the currently open conversation (for active highlight)
};

/**
 * Shows a list of users the admin can chat with.
 *
 * Filtering: excludes Admin-role users and soft-deleted users.
 * Only regular, active/blocked users are shown.
 */
export default function AdminConversationList({ onSelectConversation, selectedId }: Props) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    ApiwebService.getAdminUsers()
      .then((result) =>
        // Filter out admins and deleted users — admin should only chat with regular users
        setUsers(result.filter((u: any) => u.role !== "Admin" && !u.isDeleted))
      )
      .catch(() => {});
  }, []);

  /**
   * Opens (or creates) a conversation between the admin and the selected user.
   *
   * POST /conversations/{userId} is idempotent:
   * - Returns existing conversation if one already exists
   * - Creates a new one if not
   *
   * Then fetches the full conversation list to get the complete object
   * (with otherUserName, etc.) and passes it up to AdminChat.
   */
  async function openChat(user: any) {
    try {
      const created = await ApiwebService.postConversations(user.id);
      const conversations = await ApiwebService.getConversations();
      const full = conversations.find((c: any) => c.id === created.id);
      if (full) onSelectConversation(full);
    } catch {
      alert("Unable to open chat.");
    }
  }

  return (
    <>
      {users.map((user) => (
        <div
          key={user.id}
          // Highlight the item if its conversation is currently open
          className={`admin-user-item${selectedId && user.conversationId === selectedId ? " active" : ""}`}
          onClick={() => openChat(user)}
        >
          {/* Avatar: first letter of username */}
          <div className="admin-user-avatar">
            {user.userName?.charAt(0).toUpperCase()}
          </div>
          <div className="admin-user-info">
            <strong>{user.userName}</strong>
            <span>{user.email}</span>
          </div>
        </div>
      ))}
    </>
  );
}
