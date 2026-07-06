import { useEffect, useState } from "react";
import { ApiwebService } from "../services";

type Props = {
  refresh: boolean;
  unreadConversations?: Map<string, number>;
  onSelectConversation: (conversation: any) => void;
  selectedId?: string;
};

const AVATAR_COLORS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
];

function avatarColor(name: string) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export default function ConversationList({
  refresh,
  unreadConversations = new Map(),
  onSelectConversation,
  selectedId,
}: Props) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadConversations() {
    try {
      setLoading(true);
      const data = await ApiwebService.getConversations();
      // only show conversations that have at least one message
      setConversations((data ?? []).filter((c: any) => c.lastMessage));
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, [refresh]);

  if (loading) return <div style={{ padding: "16px", color: "#65676b", fontSize: 13 }}>Loading...</div>;

  return (
    <div>
      {conversations.length > 0 && (
        <div className="sidebar-section-title">Messages</div>
      )}

      {conversations.length === 0 ? (
        <div style={{ padding: "16px", color: "#65676b", fontSize: 13 }}>
          No conversations yet.
        </div>
      ) : (
        conversations.map((c) => {
          const unread = unreadConversations.get(c.id) ?? 0;
          const isActive = c.id === selectedId;
          return (
            <div
              key={c.id}
              className={`conv-item${isActive ? " active" : ""}`}
              onClick={() => onSelectConversation(c)}
            >
              <div
                className="conv-avatar"
                style={{ background: avatarColor(c.otherUserName ?? "?") }}
              >
                {(c.otherUserName ?? "?").charAt(0).toUpperCase()}
              </div>

              <div className="conv-info">
                <div className={`conv-name${unread > 0 ? " unread" : ""}`}>
                  {c.otherUserName}
                </div>
              </div>

              {unread > 0 && (
                <div className="conv-badge">{unread > 99 ? "99+" : unread}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
