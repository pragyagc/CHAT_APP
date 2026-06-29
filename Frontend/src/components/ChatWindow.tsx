import { useEffect, useState } from "react";
import { ApiwebService } from "../services";
import { connection } from "../signalr/connection";

export default function ChatWindow({ conversation }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!conversation?.id) return;

    setMessages([]);

    loadMessages();
    joinChat();

    return () => {
      connection.invoke("LeaveConversation", conversation.id).catch(() => {});
      connection.off("ReceiveMessage");
    };
  }, [conversation?.id]);

  // ---------------- JOIN ----------------
  async function joinChat() {
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
  }

  // ---------------- LOAD HISTORY ----------------
  async function loadMessages() {
    const data = await ApiwebService.getMessagesConversation(
      conversation.id
    );
    setMessages(data ?? []);
  }

  // ---------------- SEND MESSAGE ----------------
  async function sendMessage() {
    if (!text.trim()) return;

    await connection.invoke("SendMessage", conversation.id, text);
    setText("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      <h3>{conversation.otherUserName}</h3>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <b>{m.senderName}</b>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div style={{ display: "flex" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}