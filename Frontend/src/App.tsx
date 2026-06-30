import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
const [showRegister, setShowRegister] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
const [currentUser, setCurrentUser] = useState<any>(null);
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
  async function initialize() {
    const token = localStorage.getItem("token");

    if (!token || !validateToken(token)) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    OpenAPI.TOKEN = token;
    setIsLoggedIn(true);

   
    try {
      const me = await ApiwebService.getUsersMe();

     setCurrentUser(me);
      console.log(me);

      // Use database id instead of JWT id
      setCurrentUserId(me.id);
       setIsLoggedIn(true);

      if (connection.state === "Disconnected") {
        await connection.start();
      }

    } catch (err) {
      console.error(err);
    }

    connection.start().catch(() => {});

    setLoading(false);
  }

  initialize();
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
    const me = await ApiwebService.getUsersMe();
      setCurrentUser(me); 


    if (connection.state === "Disconnected") {
      await connection.start();
    }

    setIsLoggedIn(true);
  };


const handleRegister = async (
  email: string,
  password: string,
  userName: string
) => {
  try {
    await ApiwebService.postAuthRegister({
      email,
      password,
      userName,
    });

    alert("Registration successful. Please login.");

    setShowRegister(false);
  } catch (err) {
    console.error(err);
    alert("Registration failed");
  }
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
  // ---------------- MAIN CHAT UI ----------------
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <div
  style={{
    width: 330,
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    background: "#fafafa",
  }}
>
{/* for username */}
<div
  style={{
    padding: 20,
    borderBottom: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    gap: 15,
  }}
>
  <div
    style={{
      width: 50,
      height: 50,
      borderRadius: "50%",
      background: "#0084ff",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      fontSize: 20,
    }}
  >
    {currentUser?.userName?.charAt(0).toUpperCase()}
  </div>

  <div>
    <div style={{ fontWeight: "bold" }}>
      {currentUser?.userName}
    </div>

    <div
      style={{
        color: "gray",
        fontSize: 13,
      }}
    >
      {currentUser?.email}
    </div>
  </div>
</div>


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