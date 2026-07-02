import { useEffect, useState } from "react";
import { ApiwebService } from "../services";
import "../styles/dashboard.css";

import ConversationList from "../assets/ConversationList";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [refreshConversations, setRefreshConversations] =
    useState(false);

  const [selectedConversation, setSelectedConversation] =
    useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const result = await ApiwebService.getUsersMe();

      setUser(result);
    } catch (err) {
      console.error(err);
      alert("Failed to load current user");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");

    window.location.reload();
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="dashboard">

      <header className="navbar">
        <h2>Chat Application</h2>

        <button onClick={logout}>
          Logout
        </button>
      </header>

      <div className="dashboard-body">

        <div className="sidebar">

          <h3>Your Profile</h3>

          <p>
            <b>Username</b>
          </p>

          <p>{user?.userName}</p>

          <p>
            <b>Email</b>
          </p>

          <p>{user?.email}</p>

          <hr />

          <UserList
            currentUserId={user.id}
            onConversationCreated={() =>
              setRefreshConversations(prev => !prev)
            }
            onSelectConversation={setSelectedConversation}
          />

          <hr />

          <ConversationList
            refresh={refreshConversations}
            onSelectConversation={setSelectedConversation}
          />

        </div>

        <div className="chat-area">

          {selectedConversation ? (

            <ChatWindow
              conversation={selectedConversation}
            />

          ) : (

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%"
              }}
            >
              <h2>Select a conversation</h2>
            </div>

          )}

        </div>

      </div>

    </div>
  );
}