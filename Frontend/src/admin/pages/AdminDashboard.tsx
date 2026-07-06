import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UsersPage from "./UsersPage";
import AdminChat from "./AdminChat";
import "../styles/admin.css";

type Props = { onLogout: () => void };

export default function AdminDashboard({ onLogout }: Props) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    ApiwebService.getAdminDashboard().then(setDashboard).catch(() => {});
  }, []);

  const navItems = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "users",     icon: "👥", label: "Users" },
    { key: "messages",  icon: "💬", label: "Messages" },
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">🛡️</div>
          <div>
            <span>ChatAdmin</span>
            <small>Control Panel</small>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item${page === item.key ? " active" : ""}`}
              onClick={() => setPage(item.key)}
            >
              <span className="admin-nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={onLogout}>
            <span className="admin-nav-item-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="admin-content">
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
                  <span>Conversations</span>
                </div>
              </div>
            </div>
          </>
        )}

        {page === "users" && <UsersPage />}

        {page === "messages" && <AdminChat />}
      </div>
    </div>
  );
}
