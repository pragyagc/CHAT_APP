import { useEffect, useRef, useState } from "react";
import { ApiwebService } from "../../services";
import { ensureConnection, connection } from "../../signalr/connection";

type Props = { conversation: any };

export default function AdminChatWindow({ conversation }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation) return;

    load();

    const onReceiveMessage = (msg: any) => {
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) => {
        if (prev.some((x) => x.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => scrollToBottom(), 50);
    };

    ensureConnection().then(() => {
      connection.invoke("JoinConversation", conversation.id).catch(() => {});
    });

    connection.on("ReceiveMessage", onReceiveMessage);

    return () => {
      connection.off("ReceiveMessage", onReceiveMessage);
    };
  }, [conversation?.id]);

  async function load() {
    const result = await ApiwebService.getMessagesConversation(conversation.id);
    setMessages(result ?? []);
    setTimeout(() => scrollToBottom(false), 50);
  }

  function scrollToBottom(smooth = true) {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  async function send() {
    if (!text.trim()) return;
    await ensureConnection();
    await connection.invoke("SendMessage", conversation.id, text);
    setText("");
  }

  // admin messages are those NOT from otherUserId
  const isAdminMsg = (m: any) => m.senderId !== conversation.otherUserId;

  return (
    <div className="admin-chat-window">
      <div className="admin-chat-header">
        <div className="admin-user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
          {conversation.otherUserName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <strong>{conversation.otherUserName}</strong>
          <span style={{ display: "block" }}>User</span>
        </div>
      </div>

      <div ref={scrollRef} className="admin-messages-area">
        {messages.map((m) => {
          const mine = isAdminMsg(m);
          return (
            <div key={m.id} className={`admin-msg ${mine ? "admin-side" : "user-side"}`}>
              <div className="admin-msg-sender">
                {mine ? "You (Admin)" : conversation.otherUserName}
              </div>
              <div className="admin-msg-bubble">{m.text}</div>
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

      <div className="admin-chat-input-area">
        <input
          className="admin-chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
        />
        <button className="admin-send-btn" onClick={send} disabled={!text.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
