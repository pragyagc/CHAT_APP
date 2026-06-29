import { useEffect, useState } from "react";
import Login from "./pages/Login";
import ChatWindow from "./components/ChatWindow";
import ConversationList from "./components/ConversationList";
import UserList from "./components/UserList";
import { ApiwebService } from "./services";
import { jwtDecode } from "jwt-decode";
import { OpenAPI } from "./services/core/OpenAPI";
import { connection } from "./signalr/connection";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [refresh, setRefresh] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const [currentUserId, setCurrentUserId] = useState<string>("");

  // ---------------- TOKEN CHECK ----------------
  const validateToken = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  // ---------------- INIT ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !validateToken(token)) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    } else {
      OpenAPI.TOKEN = token;
      setIsLoggedIn(true);

      const decoded: any = jwtDecode(token);
      setCurrentUserId(decoded?.nameid || decoded?.sub || "");

      connection.start().catch(() => {});
    }

    setLoading(false);
  }, []);

  // ---------------- LOGIN ----------------
  const handleLogin = async (email: string, password: string) => {
    const res = await ApiwebService.postAuthLogin({ email, password });

    const token = res?.token || res?.data?.token;

    if (!token) {
      console.error("Login failed - no token");
      return;
    }

    localStorage.setItem("token", token);
    OpenAPI.TOKEN = token;

    const decoded: any = jwtDecode(token);
    setCurrentUserId(decoded?.nameid || decoded?.sub || "");

    if (connection.state === "Disconnected") {
      await connection.start();
    }

    setIsLoggedIn(true);
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    localStorage.removeItem("token");

    if (connection.state === "Connected") {
      await connection.stop();
    }

    setIsLoggedIn(false);
    setSelectedConversation(null);
  };

  // ---------------- LOADING ----------------
  if (loading) return <div>Loading...</div>;

  // ---------------- LOGIN SCREEN ----------------
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} goToRegister={() => {}} />;
  }

  // ---------------- MAIN CHAT UI ----------------
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT PANEL */}
      <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 10 }}>

        {/* EXISTING CONVERSATIONS */}
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

        <hr />

        <button onClick={logout}>Logout</button>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1 }}>
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div style={{ padding: 20 }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>

    </div>
  );
}