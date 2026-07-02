import { useState } from "react";
import ConversationList from "../assets/ConversationList";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";
import { jwtDecode } from "jwt-decode";

export default function ChatPage() {
  const token = localStorage.getItem("token");

  const decoded: any = jwtDecode(token || "");
  const currentUserId = decoded?.nameid || decoded?.sub;

  const [refresh, setRefresh] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT SIDEBAR */}
      <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 10 }}>

        {/* EXISTING CHATS */}
        <ConversationList
          refresh={refresh}
          onSelectConversation={setSelectedConversation}
        />

        <hr />

        {/* START NEW CHAT */}
        <UserList
          currentUserId={currentUserId}
          onConversationCreated={() => setRefresh(!refresh)}
          onSelectConversation={setSelectedConversation}
        />

      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1 }}>
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div style={{ padding: 20 }}>
            Select a conversation
          </div>
        )}
      </div>

    </div>
  );
}