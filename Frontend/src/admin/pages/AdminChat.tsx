import { useState } from "react";
import AdminConversationList from "../components/AdminConversationList";
import AdminChatWindow from "../components/AdminChatWindow";


export default function AdminChat() {
  // The conversation currently open in the chat window (null = none selected)
  const [conversation, setConversation] = useState<any>(null);

  return (
    <>
      <div className="admin-page-title">Messages</div>

      {/* Split panel container — height fills the remaining viewport */}
      <div className="admin-chat-layout" style={{ height: "calc(100vh - 120px)" }}>

        {/* ── LEFT: scrollable list of users to chat with ── */}
        <div className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-title">Users</div>
          <div className="admin-chat-sidebar-scroll">
            {/**
             * AdminConversationList fetches all non-admin, non-deleted users.
             * Clicking a user calls postConversations to get/create a conversation,
             * then calls onSelectConversation to open it in the chat window.
             */}
            <AdminConversationList
              selectedId={conversation?.id} // Highlights the active user in the list
              onSelectConversation={setConversation}
            />
          </div>
        </div>

        {/* ── RIGHT: chat window or empty state ── */}
        {conversation ? (
          <AdminChatWindow conversation={conversation} />
        ) : (
          // Shown when no user is selected yet
          <div className="admin-empty-chat">
            <div className="admin-empty-chat-icon">💬</div>
            <p>Select a user to start messaging</p>
          </div>
        )}
      </div>
    </>
  );
}
