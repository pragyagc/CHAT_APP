import { useEffect, useRef, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatWindow from "./components/ChatWindow";
import ConversationList from "./components/ConversationList";
import UserList from "./components/UserList";
import { ApiwebService } from "./services";
import { jwtDecode } from "jwt-decode";
import { OpenAPI } from "./services/core/OpenAPI";
import { connection, ensureConnection } from "./signalr/connection";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [refresh, setRefresh] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  const [unreadConversations, setUnreadConversations] =
    useState<Map<string, number>>(new Map());

  const selectedConversationRef = useRef<any>(null);
  const currentUserIdRef = useRef("");

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // ---------------- TOKEN ----------------
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
    async function init() {
      const token = localStorage.getItem("token");

      if (!token || !validateToken(token)) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      OpenAPI.TOKEN = token;

      try {
        const me = await ApiwebService.getUsersMe();
        setCurrentUser(me);
        setCurrentUserId(me.id);
        await ensureConnection();
        setIsLoggedIn(true);
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    init();
  }, []);

  // ---------------- RECEIVE MESSAGE (ONLY HERE FOR UNREAD) ----------------
  const unreadHandlerRef = useRef<((msg: any) => void) | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Remove previous handler if any
    if (unreadHandlerRef.current) {
      connection.off("ReceiveMessage", unreadHandlerRef.current);
    }

    const handler = (msg: any) => {
      if (msg.senderId === currentUserIdRef.current) return;
      if (selectedConversationRef.current?.id === msg.conversationId) return;
      setUnreadConversations((prev) => {
        const next = new Map(prev);
        next.set(msg.conversationId, (next.get(msg.conversationId) ?? 0) + 1);
        return next;
      });
    };

    unreadHandlerRef.current = handler;
    connection.on("ReceiveMessage", handler);

    return () => {
      connection.off("ReceiveMessage", handler);
      unreadHandlerRef.current = null;
    };
  }, [isLoggedIn]);

  // ---------------- LOGIN ----------------
  const handleLogin = async (email: string, password: string) => {
    const res = await ApiwebService.postAuthLogin({ email, password });

    const token = res?.token || res?.data?.token;
    if (!token) return;

    localStorage.setItem("token", token);
    OpenAPI.TOKEN = token;

    const me = await ApiwebService.getUsersMe();
    setCurrentUser(me);
    setCurrentUserId(me.id);
    setIsLoggedIn(true);

    await ensureConnection();
  };

  // ---------------- REGISTER ----------------
  const handleRegister = async (
    email: string,
    password: string,
    userName: string
  ) => {
    await ApiwebService.postAuthRegister({
      email,
      password,
      userName,
    });

    alert("Registered successfully");
    setShowRegister(false);
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

  // ---------------- UI ----------------
  if (loading) return (
    <div className="app-loading">
      <div className="spinner" />
      Loading...
    </div>
  );

  if (!isLoggedIn) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        goToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        goToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {currentUser?.userName?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <strong>{currentUser?.userName}</strong>
              <span>{currentUser?.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>

        <div className="sidebar-scroll">
          <ConversationList
            refresh={refresh}
            unreadConversations={unreadConversations}
            selectedId={selectedConversation?.id}
            onSelectConversation={(c) => {
              selectedConversationRef.current = c;
              setSelectedConversation(c);
              setUnreadConversations((prev) => {
                const next = new Map(prev);
                next.delete(c.id);
                return next;
              });
            }}
          />

          <UserList
            currentUserId={currentUserId}
            onConversationCreated={() => setRefresh((p) => !p)}
            onSelectConversation={(c) => {
              selectedConversationRef.current = c;
              setSelectedConversation(c);
            }}
          />
        </div>
      </div>

      {/* CHAT */}
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          currentUserId={currentUserId}
        />
      ) : (
        <div className="empty-chat">
          <div className="empty-chat-icon">💬</div>
          <h3>Your Messages</h3>
          <p>Select a conversation or start a new chat</p>
        </div>
      )}
    </div>
  );
}