import { useEffect, useState } from "react";
import { ApiwebService } from "../services";

type Props = {
  refresh: boolean;
  onSelectConversation: (conversation: any) => void;
};

export default function ConversationList({
  refresh,
  onSelectConversation,
}: Props) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadConversations() {
    try {
      setLoading(true);

      const data =
        await ApiwebService.getConversations();

      console.log("Conversations:", data);

      setConversations(data ?? []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, [refresh]);

  if (loading) {
    return <p>Loading conversations...</p>;
  }

  return (
    <div>

      <h3>Your Conversations</h3>

      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="conversation-item"
            onClick={() =>
              onSelectConversation(conversation)
            }
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <strong>
              {conversation.otherUserName}
            </strong>

            <br />

            <small>
              {conversation.otherUserEmail}
            </small>

            <br />

            <div
              style={{
                color: "gray",
                marginTop: "5px",
              }}
            >
              {conversation.lastMessage || "No messages yet"}
            </div>

            {conversation.lastMessageTime && (
              <small
                style={{
                  color: "#999",
                }}
              >
                {new Date(
                  conversation.lastMessageTime
                ).toLocaleString()}
              </small>
            )}
          </div>
        ))
      )}
    </div>
  );
}