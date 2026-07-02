import { useEffect, useRef, useState } from "react";
import { ApiwebService } from "../services";
import { connection } from "../signalr/connection";

export default function ChatWindow({ conversation }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const canSend = !conversation?.isAdminConversation;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const isAtBottomRef = useRef(true);
  const isTabActiveRef = useRef(true);

  // ---------------- USER ----------------
  async function loadCurrentUser() {
    const me = await ApiwebService.getUsersMe();
    setCurrentUserId(me.id);
  }

  // ---------------- SCROLL ----------------
  const checkIfAtBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;

    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const scrollToBottom = (smooth = true) => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // ---------------- MARK AS SEEN (SAFE) ----------------
  const markAsSeen = () => {
    if (!isTabActiveRef.current) return;
    if (!conversation?.id) return;

    connection.invoke("MarkAsSeen", conversation.id).catch(() => {});
  };

  // ---------------- LOAD MESSAGES ----------------
  async function loadMessages() {
    const data = await ApiwebService.getMessagesConversation(
      conversation.id
    );

    setMessages(data ?? []);

    setTimeout(() => {
      scrollToBottom(false);
      markAsSeen(); // IMPORTANT: mark seen on open
    }, 50);
  }

  // ---------------- JOIN CHAT ----------------
  async function joinChat() {
    if (connection.state === "Disconnected") {
      await connection.start();
    }

    await connection.invoke("JoinConversation", conversation.id);
    // Get current online status
const online = await connection.invoke(
  "IsUserOnline",
  conversation.otherUserId
);

setIsOnline(online);

// Listen for online/offline events
connection.off("UserOnline");
connection.off("UserOffline");

connection.on("UserOnline", (userId: string) => {
  if (userId === conversation.otherUserId) {
    setIsOnline(true);
  }
});

connection.on("UserOffline", (userId: string) => {
  if (userId === conversation.otherUserId) {
    setIsOnline(false);
  }
});
    connection.off("ReceiveMessage");

    connection.on("ReceiveMessage", (msg: any) => {
      if (msg.conversationId !== conversation.id) return;

      setMessages((prev) => [...prev, msg]);

      if (isAtBottomRef.current) {
        setTimeout(() => {
          scrollToBottom();
          markAsSeen();
        }, 50);
      } else {
        setHasNewMessages(true);
      }
    });

  connection.off("ConversationUpdated");

connection.on("ConversationUpdated", (updatedMessages: any[]) => {
    setMessages(updatedMessages);
});


  }

  // ---------------- SEND MESSAGE ----------------
  async function sendMessage() {
     if (!canSend) return;
    if (!text.trim()) return;

    await connection.invoke("SendMessage", conversation.id, text);

    setText("");

    setTimeout(() => scrollToBottom(), 50);
  }

  // ---------------- TAB VISIBILITY FIX ----------------
  useEffect(() => {
    const handleVisibility = () => {
      isTabActiveRef.current =
        document.visibilityState === "visible";

      if (isTabActiveRef.current) {
        markAsSeen();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  // ---------------- INIT ----------------
  useEffect(() => {

    if (conversation) {
    console.log("Conversation:", conversation);
  }
    if (!conversation?.id) return;

    setMessages([]);
    setHasNewMessages(false);

    loadCurrentUser();
    loadMessages();
    joinChat();

    return () => {
      connection.invoke("LeaveConversation", conversation.id).catch(() => {});
      connection.off("ReceiveMessage");
      connection.off("MessagesSeen");
       connection.off("ConversationUpdated");
  connection.off("UserOnline");
  connection.off("UserOffline");
    };
  }, [conversation?.id]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      <div className="chat-header">

  <div className="chat-user">

    <div className="avatar-wrapper">

      <div className="avatar">
        {conversation.otherUserName.charAt(0).toUpperCase()}
      </div>

      <div
        className={`online-dot ${
          isOnline ? "online" : "offline"
        }`}
      />

    </div>

    <div>

      <div className="user-name">
        {conversation.otherUserName}
      </div>

      <div
        className={`user-status ${
          isOnline
            ? "status-online"
            : "status-offline"
        }`}
      >
        {isOnline ? "Online" : "Offline"}
      </div>

    </div>

  </div>

  <div className="chat-actions">

    <button className="chat-action-btn">
      📞
    </button>

    <button className="chat-action-btn">
      📹
    </button>

  </div>

</div>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        onScroll={() => {
          isAtBottomRef.current = checkIfAtBottom();

          if (isAtBottomRef.current) {
            setHasNewMessages(false);
            markAsSeen();
          }
        }}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          background: "#f5f5f5",
        }}
      >
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;

          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isMine
                  ? "flex-end"
                  : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: isMine ? "#0084ff" : "#e4e6eb",
                  color: isMine ? "#fff" : "#000",
                  padding: "10px 15px",
                  borderRadius: "18px",
                  maxWidth: "60%",
                  wordBreak: "break-word",
                }}
              >
                {m.text}

                {/* TIME */}
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {m.createdAt &&
                    new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>

                {/* SENT / SEEN */}
                {isMine && (
                  <div
                    style={{
                      fontSize: "11px",
                      marginTop: 2,
                      textAlign: "right",
                    }}
                  >
                    {m.isSeen ? "✓✓ Seen" : "✓ Sent"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW MESSAGE BUTTON */}
      {hasNewMessages && (
        <div
          onClick={() => {
            scrollToBottom();
            setHasNewMessages(false);
          }}
          style={{
            position: "absolute",
            bottom: 90,
            right: 20,
            background: "#0084ff",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          New messages ↓
        </div>
      )}

      {/* INPUT */}
      {canSend ? (
  <div
    style={{
      display: "flex",
      padding: "10px",
      borderTop: "1px solid #ddd",
    }}
  >
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      style={{
        flex: 1,
        padding: "10px",
        borderRadius: "20px",
      }}
      placeholder="Type a message..."
    />

    <button
      onClick={sendMessage}
      style={{ marginLeft: 10 }}
    >
      Send
    </button>
  </div>
) : (
  <div
    style={{
      padding: "16px",
      textAlign: "center",
      color: "#666",
      borderTop: "1px solid #ddd",
      background: "#fafafa",
    }}
  >
    This is an admin conversation. You cannot reply.
  </div>
)}
    </div>
  );
}