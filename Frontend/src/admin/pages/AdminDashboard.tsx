import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UsersPage from "./UsersPage";
import AdminChat from "./AdminChat";

type Props = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: Props) {
  // Dashboard stats returned by GET /admin/dashboard
  const [dashboard, setDashboard] = useState<any>();

  // Controls which page is shown in the content area: "dashboard" | "users" | "messages"
  const [page, setPage] = useState("dashboard");

  // Load dashboard stats on mount
  useEffect(() => {
    loadDashboard();
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
