import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UserDetails from "./UserDetails";
import CreateUserModal from "../components/CreateUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const result = await ApiwebService.getAdminUsers();
    setUsers(result);
  }

  if (selectedUser)
    return (
      <UserDetails
        userId={selectedUser.id}
        goBack={() => { setSelectedUser(null); loadUsers(); }}
      />
    );

  return (
    <>
      <div className="admin-page-title">Users</div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3>All Users</h3>
          <button
            className="admin-btn admin-btn-primary admin-btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            + Create User
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg,#667eea,#764ba2)",
                        color: "#fff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 700, fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {user.userName?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{user.userName}</span>
                  </div>
                </td>
                <td style={{ color: "#6b7280" }}>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === "Admin" ? "badge-purple" : "badge-gray"}`}>
                    {user.role ?? "User"}
                  </span>
                </td>
                <td>
                  {user.isDeleted ? (
                    <span className="badge badge-gray">Deleted</span>
                  ) : user.isBlocked ? (
                    <span className="badge badge-red">Blocked</span>
                  ) : (
                    <span className="badge badge-green">Active</span>
                  )}
                </td>
                <td>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { loadUsers(); setShowCreateModal(false); }}
        />
      )}
    </>
  );
}
