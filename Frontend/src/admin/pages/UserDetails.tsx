import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";

type Props = { userId: string; goBack: () => void };

export default function UserDetails({ userId, goBack }: Props) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    const result = await ApiwebService.getAdminUsers1(userId);
    setUser(result);
  }

  if (!user)
    return <div style={{ color: "#6b7280", padding: 20 }}>Loading...</div>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={goBack}>
          ← Back
        </button>
        <div className="admin-page-title" style={{ margin: 0 }}>User Details</div>
      </div>

      <div className="admin-detail-card">
        <div className="admin-detail-avatar">
          {user.userName?.charAt(0).toUpperCase()}
        </div>
        <div className="admin-detail-name">{user.userName}</div>

        <div style={{ marginTop: 16 }}>
          <div className="admin-detail-row">
            <span className="admin-detail-label">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="admin-detail-row">
            <span className="admin-detail-label">Role</span>
            <span className={`badge ${user.role === "Admin" ? "badge-purple" : "badge-gray"}`}>
              {user.role ?? "User"}
            </span>
          </div>
          <div className="admin-detail-row">
            <span className="admin-detail-label">Status</span>
            {user.isDeleted ? (
              <span className="badge badge-gray">Deleted</span>
            ) : user.isBlocked ? (
              <span className="badge badge-red">Blocked</span>
            ) : (
              <span className="badge badge-green">Active</span>
            )}
          </div>
        </div>

        <div className="admin-detail-actions">
          {user.isDeleted ? (
            <button
              className="admin-btn admin-btn-success"
              onClick={() => ApiwebService.putAdminUsersRestore(userId).then(loadUser)}
            >
              ♻️ Restore
            </button>
          ) : (
            <>
              {user.isBlocked ? (
                <button
                  className="admin-btn admin-btn-success"
                  onClick={() => ApiwebService.putAdminUsersUnblock(userId).then(loadUser)}
                >
                  ✅ Unblock
                </button>
              ) : (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => ApiwebService.putAdminUsersBlock(userId).then(loadUser)}
                >
                  🚫 Block
                </button>
              )}
              <button
                className="admin-btn admin-btn-danger"
                onClick={() => ApiwebService.deleteAdminUsers(userId).then(loadUser)}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
