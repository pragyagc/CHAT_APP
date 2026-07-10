import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UserDetails from "./UserDetails";
import CreateUserModal from "../components/CreateUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  // When set, renders UserDetails instead of the table (drill-down navigation)
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Controls visibility of the Create User modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    // GET /admin/users — returns all users including admins, blocked, and deleted
    const result = await ApiwebService.getAdminUsers();
    setUsers(result);
  }

  // If a user is selected, show their detail page instead of the table
  if (selectedUser)
    return (
      <UserDetails
        userId={selectedUser.id}
        goBack={() => {
          setSelectedUser(null); // Go back to the table
          loadUsers();           // Refresh the table in case status changed
        }}
      />
    );

  return (
    <>
      <div className="admin-page-title">Users</div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3>All Users</h3>
          {/* Opens the Create User modal */}
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

                {/* Avatar + username */}
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

                {/* Role badge: purple for Admin, grey for User */}
                <td>
                  <span className={`badge ${user.role === "Admin" ? "badge-purple" : "badge-gray"}`}>
                    {user.role ?? "User"}
                  </span>
                </td>

                {/* Status badge: priority order — Deleted > Blocked > Active */}
                <td>
                  {user.isDeleted ? (
                    <span className="badge badge-gray">Deleted</span>
                  ) : user.isBlocked ? (
                    <span className="badge badge-red">Blocked</span>
                  ) : (
                    <span className="badge badge-green">Active</span>
                  )}
                </td>

                {/* View button — navigates to UserDetails */}
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

      {/* Create User modal — rendered on top of the table when showCreateModal is true */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            loadUsers();              // Refresh table after creation
            setShowCreateModal(false);
          }}
        />
      )}
    </>
  );
}
