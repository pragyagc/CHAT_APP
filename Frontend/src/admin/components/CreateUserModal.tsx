import { useState } from "react";
import { ApiwebService } from "../../services";

type Props = { onClose: () => void; onCreated: () => void };

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createUser() {
    if (!userName.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await ApiwebService.postAdminUsers({ userName, email, password, role });
      onCreated();
    } catch (err: any) {
      setError(err?.body ?? err?.message ?? "Unable to create user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-title">Create User</div>

        {error && <div className="admin-error">{error}</div>}

        <div className="modal-field">
          <label>Username</label>
          <input
            placeholder="johndoe"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-primary" onClick={createUser} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
