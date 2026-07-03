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
  if (currentUserId) {
    loadUsers();
  }
}, [currentUserId]);

 async function loadUsers() {
  try {
    setLoading(true);

    // Get all users
    const allUsers = await ApiwebService.getUsers();

    // Get all existing conversations
    const conversations =
      await ApiwebService.getConversations();

    // IDs of users already in conversations
    const conversationUserIds = conversations.map(
      (c: any) => c.otherUserId
    );

    // Show only users who:
    // - aren't me
    // - aren't already in my conversation list
    const filtered = allUsers.filter(
      (u: User) =>
        u.id !== currentUserId &&
        !conversationUserIds.includes(u.id)
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
    // Create the conversation
    const createdConversation =
      await ApiwebService.postConversations(userId);

    console.log("Conversation created:", createdConversation);

    // Load the full conversation list
    const conversations =
      await ApiwebService.getConversations();

    // Find the newly created conversation
    const fullConversation = conversations.find(
      (c: any) => c.id === createdConversation.id
    );

    console.log("Full conversation:", fullConversation);

    // Refresh the conversation list
    onConversationCreated();

    // Open the chat with the full conversation object
    if (fullConversation) {
      onSelectConversation(fullConversation);
    }

  } catch (err) {
    console.error("Failed to create conversation", err);
  }
}

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
  {users.length > 0 && (
    <>
      <div
        style={{
          padding: "12px 16px",
          fontWeight: 600,
          fontSize: "15px",
          borderBottom: "1px solid #e5e5e5",
          background: "#fafafa",
        }}
      >
        Start New Chat
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => createConversation(user.id)}
          style={{
            borderBottom: "1px solid #eee",
            padding: "12px 16px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#f5f5f5")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "white")
          }
        >
          <div style={{ fontWeight: 600 }}>
            {user.userName}
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#666",
            }}
          >
            {user.email}
          </div>
        </div>
      ))}
    </>
  )}
</div>
  );
}