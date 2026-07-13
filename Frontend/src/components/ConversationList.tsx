import { useEffect, useState } from "react";
import { ApiwebService } from "../services";
import { toast } from "react-toastify";

type Props = {
  refresh: boolean;
  prefetchedList?: any[] | null;             // Pre-fetched conversations from UserList — skips the re-fetch
  latestMessage?: any;
  unreadConversations?: Map<string, number>;
  onSelectConversation: (conversation: any) => void;
  selectedId?: string;
};

/**
 * A set of gradient colors used for conversation avatars.
 * Each user gets a consistent color based on a hash of their name.
 */
const AVATAR_COLORS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
];

/**
 * Deterministically picks an avatar color for a given name.
 * Sums the char codes of all characters, then mods by the number of colors.
 * Same name always gets the same color — no randomness.
 */
function avatarColor(name: string) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export default function ConversationList({
  refresh,
  prefetchedList,
  latestMessage,
  unreadConversations = new Map(),
  onSelectConversation,
  selectedId,
}: Props) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches all conversations from the API.
   *
   * Filter: only show conversations that have at least one message (lastMessage is non-empty).
   * Why? A conversation is created as soon as two users connect, even before any messages.
   * We don't want empty conversations cluttering the sidebar — they appear in UserList instead.
   */
  async function loadConversations() {
    try {
      setLoading(true);
      const data = await ApiwebService.getConversations();
      setConversations((data ?? []).filter((c: any) => c.lastMessage));
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // If UserList already fetched the list, use it directly — no extra API call
    if (prefetchedList != null) {
      setConversations(prefetchedList.filter((c: any) => c.lastMessage));
      setLoading(false);
      return;
    }
    loadConversations();
  }, [refresh, prefetchedList]);


  useEffect(() => {

    if (!latestMessage) return;

    setConversations(prev => {

        const updated = [...prev];

        const index = updated.findIndex(
            c => c.id === latestMessage.conversationId
        );

        if (index === -1)
            return prev;

        const conversation = {
            ...updated[index],
            lastMessage: latestMessage.text
        };

        updated.splice(index, 1);

        updated.unshift(conversation);

        return updated;
    });

}, [latestMessage]);

  if (loading) return <div style={{ padding: "16px", color: "#65676b", fontSize: 13 }}>Loading...</div>;

  return (
    <div>
      {/* Section title — only shown if there are conversations */}
      {conversations.length > 0 && (
        <div className="sidebar-section-title">Messages</div>
      )}

      {conversations.length === 0 ? (
        <div style={{ padding: "16px", color: "#65676b", fontSize: 13 }}>
          No conversations yet.
        </div>
      ) : (
        conversations.map((c) => {

         
          // Get the unread count for this conversation (0 if not in the map)
          const unread =
                    unreadConversations.get(c.id) ??
                    c.unreadCount ??
                    0;

          // Highlight this item if it's the currently open conversation
          const isActive = c.id === selectedId;

          return (
            <div
              key={c.id}
              className={`conv-item${isActive ? " active" : ""}`}
              // onClick={() => onSelectConversation(c)}

              // onClick={() => {
              //   if (c.isAdminConversation && c.isReadOnly) {
              //     toast.info("This user is now an administrator. You cannot open this conversation.");
              //     return;
              //   }

              //   onSelectConversation(c);
              // }}

              onClick={() => {
    onSelectConversation(c);
}}
            >
              {/* Colored avatar circle with the first letter of the other user's name */}
              <div
                className="conv-avatar"
                style={{ background: avatarColor(c.otherUserName ?? "?") }}
              >
                {(c.otherUserName ?? "?").charAt(0).toUpperCase()}
              </div>

              <div className="conv-info">
                {/* Bold name if there are unread messages */}
                <div className={`conv-name${unread > 0 ? " unread" : ""}`}>
                  {c.otherUserName}
                </div>
                {c.isAdminConversation && (
                  <div className="conv-subtitle">Administrator conversation</div>
                )}
              </div>

              {/* Unread count badge — only shown when unread > 0, caps at "99+" */}
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
