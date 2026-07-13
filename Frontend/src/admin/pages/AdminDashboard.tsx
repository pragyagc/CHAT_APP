import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UsersPage from "./UsersPage";
import AdminChat from "./AdminChat";
import { jwtDecode } from "jwt-decode";

type Props = {
  onLogout: () => void;
};


export default function AdminDashboard({ onLogout }: Props) {
  // Dashboard stats returned by GET /admin/dashboard
  const [dashboard, setDashboard] = useState<any>();

  // Controls which page is shown in the content area: "dashboard" | "users" | "messages"
  const [page, setPage] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load dashboard stats on mount
 useEffect(() => {
  loadDashboard();

  const token = localStorage.getItem("adminToken");

  if (token) {
    const decoded: any = jwtDecode(token);

    setCurrentUser({
      userName:
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      email:
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      role:
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    });
  }
}, []);

  async function loadDashboard() {
    // GET /admin/dashboard — returns { totalUsers, totalMessages, totalConversations }
    const data = await ApiwebService.getAdminDashboard();
    setDashboard(data);
  }

  return (
    <div className="admin-layout">

      {/* ── LEFT SIDEBAR: branding + navigation ── */}
      <div className="admin-sidebar">

        {/* Brand / logo area */}
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">🛡️</div>
          <div>
            <span>Admin Panel</span>
            <small>Chat App</small>
          </div>
        </div>

        {/* Navigation items — each sets `page` to switch the content area */}
        <nav className="admin-nav">
          <button
            className={`admin-nav-item${page === "dashboard" ? " active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            <span className="admin-nav-item-icon">📊</span>
            Dashboard
          </button>

          <button
            className={`admin-nav-item${page === "users" ? " active" : ""}`}
            onClick={() => setPage("users")}
          >
            <span className="admin-nav-item-icon">👥</span>
            Users
          </button>

          <button
            className={`admin-nav-item${page === "messages" ? " active" : ""}`}
            onClick={() => setPage("messages")}
          >
            <span className="admin-nav-item-icon">💬</span>
            Messages
          </button>
        </nav>

        {/* Logout button pinned to the bottom of the sidebar */}
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={onLogout}>
            <span className="admin-nav-item-icon">⏻</span>
            Logout
          </button>
        </div>
      </div>

      {/* ── RIGHT CONTENT AREA ── */}
     <div className="admin-content">

  {currentUser && (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        padding: "16px 20px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>Administrator Dashboard</h2>
        <div style={{ color: "#666", marginTop: 4 }}>
          Logged in as <strong>{currentUser.userName}</strong>
        </div>
        <div style={{ color: "#999", fontSize: "14px" }}>
          {currentUser.email}
        </div>
      </div>

      <span
        style={{
          background: "#4f46e5",
          color: "#fff",
          padding: "6px 14px",
          borderRadius: "999px",
          fontWeight: 600,
        }}
      >
        {currentUser.role}
      </span>
    </div>
  )}

  {/* Dashboard page: stat cards */}
  {page === "dashboard" && (
      
          <>
            <div className="admin-page-title">Dashboard</div>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon purple">👥</div>
                <div className="admin-stat-info">
                  <strong>{dashboard?.totalUsers ?? "—"}</strong>
                  <span>Total Users</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon green">💬</div>
                <div className="admin-stat-info">
                  <strong>{dashboard?.totalMessages ?? "—"}</strong>
                  <span>Total Messages</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon blue">🗂️</div>
                <div className="admin-stat-info">
                  <strong>{dashboard?.totalConversations ?? "—"}</strong>
                  <span>Total Conversations</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users page: table of all users with View/Block/Delete actions */}
        {page === "users" && <UsersPage />}

        {/* Messages page: admin chat interface */}
        {page === "messages" && <AdminChat />}
      </div>
    </div>
  );
}
