import { useEffect, useRef, useState } from "react";
import {ApiwebService} from "../services";
import { connection, ensureConnection } from "../signalr/connection";


type CurrentUser = {
  id: string;
  userName: string;
  email: string;
  role: string;
};

type Props = {
  conversation: any;  // The full conversation object (id, otherUserId, otherUserName, isAdminConversation, etc.)
  currentUserId: string;
  currentUser: CurrentUser;
   onConversationUpdated?: () => void;
};

export default function ChatWindow({ conversation, currentUserId, currentUser, onConversationUpdated }: Props) {
  // List of message objects loaded from the API and appended via SignalR
  const [messages, setMessages] = useState<any[]>([]);

  // Controlled input value for the message text box
  const [text, setText] = useState("");

  // True when new messages arrive while the user is scrolled up — shows a "New messages ↓" banner
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // True when the other user is currently online (updated via SignalR UserOnline/UserOffline events)
  const [isOnline, setIsOnline] = useState(false);

  // True when the other user is typing (updated via SignalR UserTyping/UserStoppedTyping events)
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // Ref to the debounce timer for StopTyping — cleared on each keystroke
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tracks whether we've already sent a Typing event (avoids spamming the hub on every keystroke)
  const isTypingRef = useRef(false);

  console.log("Conversation received:", conversation);

  const isAdmin = currentUser?.role === "Admin";
  const isAdminConversation = conversation?.isAdminConversation;

  const canSend = !conversation?.isReadOnly || isAdmin;

  console.log("conversation.isReadOnly", conversation?.isReadOnly);
  console.log("isAdmin", isAdmin);
  console.log("canSend", canSend);
  // Ref to the scrollable messages container — used to scroll to bottom programmatically
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Tracks whether the user is currently scrolled near the bottom
  // Used to decide whether to auto-scroll when a new message arrives
  const isAtBottomRef = useRef(true);

  // Tracks browser tab visibility — we don't mark messages as seen if the tab is hidden
  const isTabActiveRef = useRef(true);

  /**
   * Ref copy of currentUserId to avoid stale closures inside SignalR handlers.
   * SignalR handlers capture variables at registration time; using a ref ensures
   * they always read the latest value.
   */
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

  //SCROLL HELPERS

  /** Returns true if the scroll position is within 80px of the bottom. */
  const checkIfAtBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  /** Scrolls the message list to the very bottom. */
  const scrollToBottom = (smooth = true) => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // ─── MARK AS SEEN ─────────────────────────────────────────────────────────
  /**
   * Tells the backend that the current user has read all messages in this conversation.
   * The backend then broadcasts a MessagesSeen event to the other user so their
   * "✓ Sent" ticks update to "✓✓ Seen".
   *
   * Guards:
   * - Tab must be visible (don't mark seen if user is on another tab)
   * - conversation.id must exist
   * - Don't mark seen if we ARE the other user (edge case safety)
   */
  const markAsSeen = () => {
    if (!isTabActiveRef.current) return;
    if (!conversation?.id) return;
    if (conversation.otherUserId === currentUserIdRef.current) return;
    connection.invoke("MarkAsSeen", conversation.id).catch(() => {});
  };

  // ─── LOAD MESSAGES ────────────────────────────────────────────────────────
  /**
   * Fetches all messages for this conversation from the REST API.
   * After loading, scrolls to the bottom and marks unseen messages as seen
   * if the user is already at the bottom.
   */
  async function loadMessages() {
    const data = await ApiwebService.getMessagesConversation(conversation.id);
    setMessages(data ?? []);
    setTimeout(() => {
      scrollToBottom(false); // Instant scroll (no animation) on initial load
      const hasUnseen = (data ?? []).some(
        (m: any) => m.senderId !== currentUserIdRef.current && !m.isSeen
      );
      if (checkIfAtBottom() && hasUnseen) markAsSeen();
    }, 50); // Small delay to let the DOM render the messages first
  }

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  /**
   * Sends the typed message via SignalR (not REST).
   * The hub broadcasts it back to all group members including the sender,
   * so the onReceiveMessage handler below will add it to the list.
   */
  async function sendMessage() {
    if (!canSend || !text.trim()) return;
    await connection.invoke("SendMessage", conversation.id, text);
    const updated = await ApiwebService.getConversations();

    onConversationUpdated?.();
    setText(""); // Clear input after sending
    isTabActiveRef.current = true; // Treat send as "tab is active"
  }

  // ─── TAB VISIBILITY ───────────────────────────────────────────────────────
  /**
   * Listens for the browser's visibilitychange event.
   * When the user switches tabs, we stop marking messages as seen.
   * When they come back, seen marking resumes normally.
   */
  useEffect(() => {
    const handleVisibility = () => {
      isTabActiveRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ─── SIGNALR SETUP ────────────────────────────────────────────────────────
  /**
   * This effect runs whenever the conversation changes (conversation.id).
   * It:
   *  1. Registers all SignalR event handlers BEFORE the async init() call.
   *  2. Calls init() to connect, load messages, and join the SignalR group.
   *  3. Returns a cleanup function that removes all handlers when the
   *     conversation changes or the component unmounts.
   *
   * IMPORTANT: Handlers are registered OUTSIDE the async init() function.
   * If they were inside, there would be a race condition where messages
   * could arrive before the handlers are registered.
   */
  useEffect(() => {
    if (!conversation?.id) return;
    let mounted = true; // Prevents state updates after unmount

    // ── Handler: new message received ──
    const onReceiveMessage = (msg: any) => {
      // Ignore messages for other conversations (we're in all groups simultaneously)
      if (msg.conversationId !== conversation.id) return;

      setMessages((prev) => {
        // Deduplicate: don't add if we already have this message ID
        if (prev.some((x) => x.id === msg.id)) return prev;
        return [...prev, msg];
      });

      const isMine = msg.senderId === currentUserIdRef.current;

      if (isMine || (isAtBottomRef.current && isTabActiveRef.current)) {
        // Auto-scroll if it's our own message OR we're already at the bottom
        requestAnimationFrame(() => {
          scrollToBottom();
          if (!isMine) markAsSeen(); // Mark as seen if it's the other person's message
        });
      } else {
        // User is scrolled up — show the "New messages ↓" banner instead
        setHasNewMessages(true);
      }
    };

    // ── Handler: other user read our messages ──
    const onMessagesSeen = (conversationId: string) => {
      if (conversationId !== conversation.id) return;
      // Update all messages to isSeen: true so "✓ Sent" → "✓✓ Seen"
      setMessages((prev) => prev.map((m) => ({ ...m, isSeen: true })));
    };

    // ── Handler: other user came online ──
    const onUserOnline = (userId: string) => {
      // Case-insensitive comparison because GUIDs can differ in casing
      if (userId?.toLowerCase() === conversation.otherUserId?.toLowerCase()) setIsOnline(true);
    };

    // ── Handler: other user went offline ──
    const onUserOffline = (userId: string) => {
      if (userId?.toLowerCase() === conversation.otherUserId?.toLowerCase()) setIsOnline(false);
    };

    // ── Handler: other user started typing ──
    const onUserTyping = (
      conversationId: string,
      userId: string,
      _userName: string // not used but part of the hub signature
    ) => {
      if (conversationId !== conversation.id) return;
      if (userId === currentUserIdRef.current) return; // Ignore our own typing event
      setIsOtherTyping(true);
    };

    // ── Handler: other user stopped typing ──
    const onUserStoppedTyping = (
      conversationId: string,
      userId: string
    ) => {
      if (conversationId !== conversation.id) return;
      if (userId === currentUserIdRef.current) return;
      setIsOtherTyping(false);
    };

    // ── Async init: connect + load + join group ──
    const init = async () => {
      await ensureConnection(); // Make sure SignalR is connected
      if (!mounted) return; // Component may have unmounted during await

      setMessages([]);          // Clear old messages before loading new ones
      setHasNewMessages(false);
      loadMessages();           // Fetch messages from REST API

      // Join the SignalR group for this conversation
      // The backend adds this connection to a group named after the conversationId
      // so it receives ReceiveMessage events for this conversation
      connection.invoke("JoinConversation", conversation.id).catch(() => {});

      // Ask the hub if the other user is currently online
      // This sets the initial online status (green/grey dot in the header)
      connection.invoke("IsUserOnline", conversation.otherUserId)
        .then((online: boolean) => { if (mounted) setIsOnline(online); })
        .catch(() => {});
    };

    // Register all handlers BEFORE calling init()
    connection.on("ReceiveMessage", onReceiveMessage);
    connection.on("MessagesSeen", onMessagesSeen);
    connection.on("UserOnline", onUserOnline);
    connection.on("UserOffline", onUserOffline);
    connection.on("UserTyping", onUserTyping);
    connection.on("UserStoppedTyping", onUserStoppedTyping);

    init();

    // Cleanup: remove ONLY the specific handler functions registered above.
    // Using connection.off(event) without a handler ref would remove ALL listeners
    // including App.tsx's unread handler — which would break unread notifications.
    return () => {
      mounted = false;
      connection.off("ReceiveMessage", onReceiveMessage);
      connection.off("MessagesSeen", onMessagesSeen);
      connection.off("UserOnline", onUserOnline);
      connection.off("UserOffline", onUserOffline);
      connection.off("UserTyping", onUserTyping);
      connection.off("UserStoppedTyping", onUserStoppedTyping);
    };
  }, [conversation?.id]); // Re-run when the user opens a different conversation

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="chat-window">

      {/* ── HEADER: avatar, name, online status, action buttons ── */}
      <div className="chat-header">
        <div className="chat-header-user">
          <div className="chat-header-avatar">
            {conversation.otherUserName.charAt(0).toUpperCase()}
            {/* Green dot = online, grey dot = offline */}
            <div className={`chat-header-dot ${isOnline ? "online" : "offline"}`} />
          </div>
          <div className="chat-header-info">
            <strong>{conversation.otherUserName}</strong>
            <span className={isOnline ? "online" : "offline"}>
              {isOnline ? "Online" : "Offline"}
            </span>
            {isAdminConversation && (
              <span className="chat-admin-badge">
                Administrator conversation
              </span>
            )}
          </div>
        </div>
        <div className="chat-header-actions">
          {/* Placeholder action buttons (not yet implemented) */}
          <button className="chat-action-btn">📞</button>
          <button className="chat-action-btn">📹</button>
        </div>
      </div>

      {/* ── MESSAGES LIST ── */}
      <div
        ref={scrollRef}
        className="messages-area"
        onScroll={() => {
          // Update whether we're at the bottom on every scroll event
          isAtBottomRef.current = checkIfAtBottom();

          if (isAtBottomRef.current) {
            // User scrolled back to bottom — hide the "New messages" banner
            setHasNewMessages(false);

            // Mark any unseen messages as seen now that the user can see them
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
            // mine = right-aligned blue bubble, theirs = left-aligned white bubble
            <div key={m.id} className={`msg-row ${isMine ? "mine" : "theirs"}`}>
              <div className="msg-bubble">
                {m.text}
                {/* Timestamp shown below the message text */}
                <div className="msg-meta">
                  {m.createdAt &&
                    new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
                {/* Seen receipt — only shown on our own messages */}
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

      {/* ── NEW MESSAGES BANNER ── */}
      {/* Shown when new messages arrive while the user is scrolled up */}
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

      {/* ── TYPING INDICATOR ── */}
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

      {/* ── INPUT AREA ── */}
      {canSend ? (
        <div className="chat-input-area">
          <input
            className="chat-input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              // Send Typing event on first keystroke (not on every keystroke)
              if (!isTypingRef.current) {
                isTypingRef.current = true;
                connection.invoke("Typing", conversation.id).catch(() => {});
              }

              // Reset the debounce timer on every keystroke
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              // After 1 second of no typing, send StopTyping event
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
            disabled={!text.trim()} // Disable if input is empty
          >
            ➤
          </button>
        </div>
      ) : (
        
        <div className="admin-notice">
    You cannot reply to this conversation because it is an administrator conversation.
</div>
      )}
    </div>
  );
}
