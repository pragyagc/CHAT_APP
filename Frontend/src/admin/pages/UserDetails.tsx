import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import ConfirmModal from "../components/ConfirmModal";

type Props = { userId: string; goBack: () => void };

export default function UserDetails({ userId, goBack }: Props) {
  const [user, setUser] = useState<any>(null);
  const [confirm, setConfirm] = useState<{ message: string; action: () => Promise<any> } | null>(null);

  function ask(message: string, action: () => Promise<any>) {
    setConfirm({ message, action });
  }

  // Load user details on mount
  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    // GET /admin/users/{userId} — returns full user object with isDeleted, isBlocked, role, etc.
    const result = await ApiwebService.getAdminUsers1(userId);
    setUser(result);
  }

  if (!user)
    return <div style={{ color: "#6b7280", padding: 20 }}>Loading...</div>;

  return (
    <>
      {/* Back button + page title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={goBack}>
          ← Back
        </button>
        <div className="admin-page-title" style={{ margin: 0 }}>User Details</div>
      </div>

      <div className="admin-detail-card">
        {/* Large avatar with first letter of username */}
        <div className="admin-detail-avatar">
          {user.userName?.charAt(0).toUpperCase()}
        </div>
        <div className="admin-detail-name">{user.userName}</div>

        {/* Info rows: email, role badge, status badge */}
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

        {/**
         * Action buttons — logic depends on current user status:
         *
         * DELETED  → Show only "Restore" (can't block/delete an already-deleted user)
         * BLOCKED  → Show "Unblock" + "Delete" (no Block button since already blocked)
         * ACTIVE   → Show "Block" + "Delete"
         *
         * Each button calls the API then reloads the user to reflect the new status.
         * `.then(loadUser)` is shorthand for `.then(() => loadUser())`.
         */}
        <div className="admin-detail-actions">
          {user.isDeleted ? (
            <button
              className="admin-btn admin-btn-success"
              onClick={() => ask("Restore this user?", () => ApiwebService.putAdminUsersRestore(userId).then(loadUser))}
            >
              ♻️ Restore
            </button>
          ) : (
            <>
              {user.isBlocked ? (
                <button
                  className="admin-btn admin-btn-success"
                  onClick={() => ask("Unblock this user?", () => ApiwebService.putAdminUsersUnblock(userId).then(loadUser))}
                >
                  ✅ Unblock
                </button>
              ) : (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => ask("Block this user?", () => ApiwebService.putAdminUsersBlock(userId).then(loadUser))}
                >
                  🚫 Block
                </button>
              )}
              <button
                className="admin-btn admin-btn-danger"
                onClick={() => ask("Delete this user? This cannot be undone.", () => ApiwebService.deleteAdminUsers(userId).then(loadUser))}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={() => { confirm.action(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
      </div>
    </>
  );
}
