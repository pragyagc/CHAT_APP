import { useEffect, useRef, useState } from "react";
import { ApiwebService } from "../services";
import { connection,ensureConnection } from "../signalr/connection";

type Props = {
  conversation: any;
  currentUserId: string;
  onUnreadMessage?: (conversationId: string) => void;
};

 export default function ChatWindow({
  conversation,
  currentUserId,
  onUnreadMessage,
}: Props){
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const canSend = !conversation?.isAdminConversation;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const isAtBottomRef = useRef(true);
  const isTabActiveRef = useRef(true);
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);


 

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
    if (conversation.otherUserId === currentUserIdRef.current) return;
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
      const hasUnseenFromOther = (data ?? []).some(
        (m: any) => m.senderId !== currentUserIdRef.current && !m.isSeen
      );
      if (checkIfAtBottom() && hasUnseenFromOther) markAsSeen();
    }, 50);
  }




  // ---------------- SEND MESSAGE ----------------
  async function sendMessage() {
     if (!canSend) return;
    if (!text.trim()) return;

    await connection.invoke("SendMessage", conversation.id, text);

    setText("");

    isTabActiveRef.current=true;
  }

  // ---------------- TAB VISIBILITY FIX ----------------
    useEffect(() => {
  const handleVisibility = () => {
    isTabActiveRef.current =
      document.visibilityState === "visible";
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
    if (!conversation?.id) return;

    let mounted = true;

    const onReceiveMessage = (msg: any) => {
      if (msg.conversationId !== conversation.id) return;
      setMessages(prev => {
        const exists = prev.some(x => x.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
      const isMine = msg.senderId === currentUserIdRef.current;
      if (isMine || (isAtBottomRef.current && isTabActiveRef.current)) {
        requestAnimationFrame(() => {
          scrollToBottom();
          if (!isMine) markAsSeen();
        });
      } else {
        setHasNewMessages(true);
      }
    };

    const onMessagesSeen = (conversationId: string) => {
      if (conversationId !== conversation.id) return;
      setMessages(prev => prev.map(m => ({ ...m, isSeen: true })));
    };

    const onUserOnline = (userId: string) => {
      if (userId === conversation.otherUserId) setIsOnline(true);
    };

    const onUserOffline = (userId: string) => {
      if (userId === conversation.otherUserId) setIsOnline(false);
    };

    const init = async () => {
      await ensureConnection();
      if (!mounted) return;

      setMessages([]);
      setHasNewMessages(false);
      loadMessages();

      connection.invoke("JoinConversation", conversation.id).catch(() => {});
    };

    connection.on("ReceiveMessage", onReceiveMessage);
    connection.on("MessagesSeen", onMessagesSeen);
    connection.on("UserOnline", onUserOnline);
    connection.on("UserOffline", onUserOffline);

    init();

    return () => {
      mounted = false;
      connection.off("ReceiveMessage", onReceiveMessage);
      connection.off("MessagesSeen", onMessagesSeen);
      connection.off("UserOnline", onUserOnline);
      connection.off("UserOffline", onUserOffline);
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
            const hasUnseenFromOther = messages.some(
              (m) => m.senderId !== currentUserIdRef.current && !m.isSeen
            );
            if (hasUnseenFromOther) markAsSeen();
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
          const isMine = m.senderId === currentUserIdRef.current;

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
    markAsSeen();
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