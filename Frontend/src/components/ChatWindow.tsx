import { useEffect, useState } from "react";
import { ApiwebService } from "../services";
import { connection } from "../signalr/connection";

export default function ChatWindow({ conversation }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    if (!conversation?.id) return;

    setMessages([]);

    loadCurrentUser();
    loadMessages();
    joinChat();

    return () => {
      connection.invoke("LeaveConversation", conversation.id).catch(() => {});
      connection.off("ReceiveMessage");
    };
  }, [conversation?.id]);

  // ---------------- CURRENT USER ----------------
  async function loadCurrentUser() {
    try {
      const me = await ApiwebService.getUsersMe();

      console.log("Current User:", me);

      setCurrentUserId(me.id);
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- JOIN ----------------
  async function joinChat() {
    try {
      if (connection.state === "Disconnected") {
        await connection.start();
      }

      await connection.invoke("JoinConversation", conversation.id);

      connection.off("ReceiveMessage");

      connection.on("ReceiveMessage", (msg: any) => {
        if (msg.conversationId === conversation.id) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- LOAD HISTORY ----------------
  async function loadMessages() {
    try {
      const data = await ApiwebService.getMessagesConversation(
        conversation.id
      );

      console.log("Messages:", data);

      setMessages(data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- SEND ----------------
  async function sendMessage() {
    if (!text.trim()) return;

    try {
      await connection.invoke(
        "SendMessage",
        conversation.id,
        text
      );

      setText("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <h3>{conversation.otherUserName}</h3>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          background: "#f5f5f5",
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((m) => {
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
                    background: isMine
                      ? "#0084ff"
                      : "#e4e6eb",
                    color: isMine
                      ? "#fff"
                      : "#000",
                    padding: "10px 15px",
                    borderRadius: "18px",
                    maxWidth: "60%",
                    wordBreak: "break-word",
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,.15)",
                  }}
                >
                  {m.text}

                  {m.createdAt && (
                    <div
                      style={{
                        fontSize: "11px",
                        marginTop: "5px",
                        textAlign: "right",
                        opacity: 0.7,
                      }}
                    >
                      {new Date(
                        m.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
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
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: "#0084ff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}