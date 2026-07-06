import { useState } from "react";
import AdminConversationList from "../components/AdminConversationList";
import AdminChatWindow from "../components/AdminChatWindow";

export default function AdminChat() {
  const [conversation, setConversation] = useState<any>(null);

  return (
    <>
      <div className="admin-page-title">Messages</div>
      <div className="admin-chat-layout" style={{ height: "calc(100vh - 120px)" }}>
        <div className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-title">Users</div>
          <div className="admin-chat-sidebar-scroll">
            <AdminConversationList
              selectedId={conversation?.id}
              onSelectConversation={setConversation}
            />
          </div>
        </div>

        {conversation ? (
          <AdminChatWindow conversation={conversation} />
        ) : (
          <div className="admin-empty-chat">
            <div className="admin-empty-chat-icon">💬</div>
            <p>Select a user to start messaging</p>
          </div>
        )}
      </div>
    </>
  );
}
