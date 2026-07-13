import { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { OpenAPI } from "../services/core/OpenAPI";
import { connection } from "../signalr/connection";
import "./styles/admin.css"; // All admin styles imported here once — shared by all admin pages
import { toast } from "react-toastify";
export default function AdminApp() {
  // Tracks whether the admin is authenticated
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  /**
   * On mount, check if an admin token is already saved in localStorage.
   * If yes, restore the session without requiring a re-login.
   * OpenAPI.TOKEN is set so all API calls include the Authorization header.
   */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      OpenAPI.TOKEN = token;
      setIsLoggedIn(true);
    }
  }, []);

  /**
   * Called by AdminLogin after a successful login.
   * Saves the token, attaches it to API calls, and resets the SignalR connection.
   *
   * Why stop the connection?
   * The shared SignalR connection may have been started with a regular user token.
   * Stopping it here forces a fresh connection with the admin token on next ensureConnection() call.
   */
  const handleLogin = async (token: string) => {

  
    localStorage.setItem("adminToken", token);
    OpenAPI.TOKEN = token;

    // Stop any existing connection so it reconnects with the new admin token
    if (connection.state !== "Disconnected") {
      await connection.stop();
    }

    setIsLoggedIn(true);
  };

  /**
   * Clears the admin session.
   * Removes the token from storage and unsets it from the API config.
   */
  const logout = () => {
    localStorage.removeItem("adminToken");
    OpenAPI.TOKEN = undefined;
    setIsLoggedIn(false);
  };

  // Show login form if not authenticated, otherwise show the dashboard
  if (!isLoggedIn)
    return <AdminLogin onLogin={handleLogin} />;

  return <AdminDashboard onLogout={logout} />;
}
