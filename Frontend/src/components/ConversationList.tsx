import { useEffect, useState } from "react";
import { ApiwebService } from "../services";

type Props = {
  refresh: boolean;
  unreadConversations?: Map<string, number>;
  onSelectConversation: (conversation: any) => void;
};

export default function ConversationList({
  refresh,
  unreadConversations = new Map(),
  onSelectConversation,
}: Props) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  async function loadConversations() {
    try {
      setLoading(true);

      const data =
        await ApiwebService.getConversations();

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
              fontWeight: unreadConversations.has(conversation.id) ? "bold" : "normal",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{conversation.otherUserName}</strong>

              {unreadConversations.has(conversation.id) && (
                <div
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#0084ff",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                  }}
                >
                  {unreadConversations.get(conversation.id)}
                </div>
              )}
            </div>

            <br />

            {/* <small>
              {conversation.otherUserEmail}
            </small> */}

            {/* <div
              style={{
                color: "gray",
                marginTop: "5px",
              }}
            >
              {conversation.lastMessage || "No messages yet"}
            </div> */}

            {/* {conversation.lastMessageTime && (
              <small
                style={{
                  color: "#999",
                }}
              >
                {new Date(
                  conversation.lastMessageTime
                ).toLocaleString()}
              </small>
            )} */}
          </div>
        ))
      )}
    </div>
  );
}