import { useEffect, useState } from "react";
import { ApiwebService } from "../services";

type User = {
  id: string;
  userName: string;
  email: string;
};

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
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const result = await ApiwebService.getUsers();

      const filtered = result.filter(
        (u: User) => u.id !== currentUserId
      );

      setUsers(filtered);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }

  async function createConversation(userId: string) {
    try {
      const conversation =
        await ApiwebService.postConversations(userId);

      console.log("Conversation created:", conversation);

      onConversationCreated();

      onSelectConversation(conversation);

    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  }

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
      <h3>Start New Chat</h3>

      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => createConversation(user.id)}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          <strong>{user.userName}</strong>

          <br />

          <small>{user.email}</small>
        </div>
      ))}
    </div>
  );
}