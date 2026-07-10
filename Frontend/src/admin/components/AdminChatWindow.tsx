import { useEffect, useRef, useState } from "react";
import { ApiwebService } from "../../services";
import { ensureConnection, connection } from "../../signalr/connection";

type Props = { conversation: any };

export default function AdminChatWindow({ conversation }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  // Ref to the scrollable messages container for programmatic scrolling
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation) return;

    // Load existing messages from REST API
    load();

    /**
     * SignalR handler: called when a new message arrives in this conversation.
     * Guards against messages from other conversations (we're in all groups).
     * Deduplicates by message ID to prevent double-rendering.
     */
    const onReceiveMessage = (msg: any) => {
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) => {
        if (prev.some((x) => x.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Small delay to let the DOM render the new message before scrolling
      setTimeout(() => scrollToBottom(), 50);
    };

    // Join the SignalR group for this conversation so we receive its messages
    ensureConnection().then(() => {
      connection.invoke("JoinConversation", conversation.id).catch(() => {});
    });

    connection.on("ReceiveMessage", onReceiveMessage);

    // Cleanup: remove only this specific handler when conversation changes or component unmounts
    return () => {
      connection.off("ReceiveMessage", onReceiveMessage);
    };
  }, [conversation?.id]); // Re-run when a different conversation is selected

  /** Fetches all messages for the current conversation and scrolls to the bottom. */
  async function load() {
    const result = await ApiwebService.getMessagesConversation(conversation.id);
    setMessages(result ?? []);
    setTimeout(() => scrollToBottom(false), 50); // Instant scroll on initial load
  }

  function scrollToBottom(smooth = true) {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  /** Sends a message via SignalR hub method. The hub broadcasts it back to the group. */
  async function send() {
    if (!text.trim()) return;
    await ensureConnection();
    await connection.invoke("SendMessage", conversation.id, text);
    setText("");
  }

  /**
   * Determines if a message was sent by the admin (not the regular user).
   * Admin messages appear on the RIGHT (purple gradient).
   * User messages appear on the LEFT (white bubble).
   *
   * Logic: if the sender is NOT the other user, it must be the admin.
   */
  const isAdminMsg = (m: any) => m.senderId !== conversation.otherUserId;

  return (
    <div className="admin-chat-window">

      {/* ── HEADER: other user's name and avatar ── */}
      <div className="admin-chat-header">
        <div className="admin-user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
          {conversation.otherUserName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <strong>{conversation.otherUserName}</strong>
          <span style={{ display: "block" }}>User</span>
        </div>
      </div>

      {/* ── MESSAGES LIST ── */}
      <div ref={scrollRef} className="admin-messages-area">
        {messages.map((m) => {
          const mine = isAdminMsg(m); // true = admin sent it, false = user sent it
          return (
            <div key={m.id} className={`admin-msg ${mine ? "admin-side" : "user-side"}`}>
              {/* Sender label above the bubble */}
              <div className="admin-msg-sender">
                {mine ? "You (Admin)" : conversation.otherUserName}
              </div>
              <div className="admin-msg-bubble">{m.text}</div>
              {/* Timestamp below the bubble */}
              <div className="admin-msg-time">
                {m.createdAt &&
                  new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── INPUT AREA ── */}
      <div className="admin-chat-input-area">
        <input
          className="admin-chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()} // Enter key sends
          placeholder="Type a message..."
        />
        <button
          className="admin-send-btn"
          onClick={send}
          disabled={!text.trim()} // Disable when input is empty
        >
          ➤
        </button>
      </div>
    </div>
  );
}
