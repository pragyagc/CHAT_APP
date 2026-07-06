import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";

type Props = {
  onSelectConversation: (conversation: any) => void;
  selectedId?: string;
};

export default function AdminConversationList({ onSelectConversation, selectedId }: Props) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    ApiwebService.getAdminUsers()
      .then((result) =>
        setUsers(result.filter((u: any) => u.role !== "Admin" && !u.isDeleted))
      )
      .catch(() => {});
  }, []);

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
          className={`admin-user-item${selectedId && user.conversationId === selectedId ? " active" : ""}`}
          onClick={() => openChat(user)}
        >
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
