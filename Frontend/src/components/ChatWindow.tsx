import { useEffect, useRef, useState } from "react";
import { ApiwebService } from "../services";
import { connection, ensureConnection } from "../signalr/connection";

type Props = {
  conversation: any;
  currentUserId: string;
};

export default function ChatWindow({ conversation, currentUserId }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const canSend = !conversation?.isAdminConversation;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const isTabActiveRef = useRef(true);
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

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

  const markAsSeen = () => {
    if (!isTabActiveRef.current) return;
    if (!conversation?.id) return;
    if (conversation.otherUserId === currentUserIdRef.current) return;
    connection.invoke("MarkAsSeen", conversation.id).catch(() => {});
  };

  async function loadMessages() {
    const data = await ApiwebService.getMessagesConversation(conversation.id);
    setMessages(data ?? []);
    setTimeout(() => {
      scrollToBottom(false);
      const hasUnseen = (data ?? []).some(
        (m: any) => m.senderId !== currentUserIdRef.current && !m.isSeen
      );
      if (checkIfAtBottom() && hasUnseen) markAsSeen();
    }, 50);
  }

  async function sendMessage() {
    if (!canSend || !text.trim()) return;
    await connection.invoke("SendMessage", conversation.id, text);
    setText("");
    isTabActiveRef.current = true;
  }

  useEffect(() => {
    const handleVisibility = () => {
      isTabActiveRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    let mounted = true;

    const onReceiveMessage = (msg: any) => {
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) => {
        if (prev.some((x) => x.id === msg.id)) return prev;
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
      setMessages((prev) => prev.map((m) => ({ ...m, isSeen: true })));
    };

    const onUserOnline = (userId: string) => {
      if (userId?.toLowerCase() === conversation.otherUserId?.toLowerCase()) setIsOnline(true);
    };

    const onUserOffline = (userId: string) => {
      if (userId?.toLowerCase() === conversation.otherUserId?.toLowerCase()) setIsOnline(false);
    };

    const onUserTyping = (
      conversationId: string,
      userId: string,
      userName: string
      ) => {
        if (conversationId !== conversation.id) return;

        if (userId === currentUserIdRef.current) return;

        setIsOtherTyping(true);
      };

      const onUserStoppedTyping = (
        conversationId: string,
        userId: string
      ) => {
        if (conversationId !== conversation.id) return;

        if (userId === currentUserIdRef.current) return;

        setIsOtherTyping(false);
      };

    const init = async () => {
      await ensureConnection();
      if (!mounted) return;
      setMessages([]);
      setHasNewMessages(false);
      loadMessages();
      connection.invoke("JoinConversation", conversation.id).catch(() => {});
      // check initial online status
      connection.invoke("IsUserOnline", conversation.otherUserId)
        .then((online: boolean) => { if (mounted) setIsOnline(online); })
        .catch(() => {});
    };

    connection.on("ReceiveMessage", onReceiveMessage);
    connection.on("MessagesSeen", onMessagesSeen);
    connection.on("UserOnline", onUserOnline);
    connection.on("UserOffline", onUserOffline);
    connection.on("UserTyping", onUserTyping);
    connection.on("UserStoppedTyping", onUserStoppedTyping);

    init();

    return () => {
      mounted = false;
      connection.off("ReceiveMessage", onReceiveMessage);
      connection.off("MessagesSeen", onMessagesSeen);
      connection.off("UserOnline", onUserOnline);
      connection.off("UserOffline", onUserOffline);
      connection.off("UserTyping", onUserTyping);
      connection.off("UserStoppedTyping", onUserStoppedTyping);
    };
  }, [conversation?.id]);

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-header">
        <div className="chat-header-user">
          <div className="chat-header-avatar">
            {conversation.otherUserName.charAt(0).toUpperCase()}
            <div className={`chat-header-dot ${isOnline ? "online" : "offline"}`} />
          </div>
          <div className="chat-header-info">
            <strong>{conversation.otherUserName}</strong>
            <span className={isOnline ? "online" : "offline"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn">📞</button>
          <button className="chat-action-btn">📹</button>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="messages-area"
        onScroll={() => {
          isAtBottomRef.current = checkIfAtBottom();
          if (isAtBottomRef.current) {
            setHasNewMessages(false);
            const hasUnseen = messages.some(
              (m) => m.senderId !== currentUserIdRef.current && !m.isSeen
            );
            if (hasUnseen) markAsSeen();
          }
        }}
      >
        {messages.map((m) => {
          const isMine = m.senderId === currentUserIdRef.current;
          return (
            <div key={m.id} className={`msg-row ${isMine ? "mine" : "theirs"}`}>
              <div className="msg-bubble">
                {m.text}
                <div className="msg-meta">
                  {m.createdAt &&
                    new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
                {isMine && (
                  <div className="msg-status">
                    {m.isSeen ? "✓✓ Seen" : "✓ Sent"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW MESSAGES BANNER */}
      {hasNewMessages && (
        <div
          className="new-msg-banner"
          onClick={() => {
            scrollToBottom();
            setHasNewMessages(false);
            markAsSeen();
          }}
        >
          New messages ↓
        </div>
      )}

      {isOtherTyping && (
        <div
          style={{
            padding: "6px 14px",
            fontSize: "13px",
            color: "#666",
            fontStyle: "italic",
          }}
        >
          {conversation.otherUserName} is typing...
        </div>
      )}

      {/* INPUT */}
      {canSend ? (
        <div className="chat-input-area">
          <input
            className="chat-input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              if (!isTypingRef.current) {
                isTypingRef.current = true;
                connection.invoke("Typing", conversation.id).catch(() => {});
              }

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                connection.invoke("StopTyping", conversation.id).catch(() => {});
              }, 1000);
              }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!text.trim()}
          >
            ➤
          </button>
        </div>
      ) : (
        <div className="admin-notice">
          This is an admin conversation. You cannot reply.
        </div>
      )}
    </div>
  );
}
