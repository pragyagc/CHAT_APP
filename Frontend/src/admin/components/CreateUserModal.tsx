import { useState } from "react";
import { ApiwebService } from "../../services";

type Props = { onClose: () => void; onCreated: () => void };

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User"); // Default role is "User"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Validates fields and calls POST /admin/users to create the user.
   * On success: calls onCreated() which refreshes the user table and closes the modal.
   * On failure: displays the error message from the API response body.
   */
  async function createUser() {
    // Client-side validation before hitting the API
    if (!userName.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await ApiwebService.postAdminUsers({ userName, email, password, role });
      onCreated(); // Notify parent to refresh the user list and close modal
    } catch (err: any) {
      // Show the API error message if available, otherwise a generic fallback
      setError(err?.body ?? err?.message ?? "Unable to create user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    /**
     * Modal overlay — covers the entire screen with a semi-transparent backdrop.
     * Clicking the backdrop (not the card) closes the modal.
     * `e.target === e.currentTarget` ensures clicks on the card itself don't close it.
     */
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-title">Create User</div>

        {/* Error banner — only visible when an error occurs */}
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

        {/* Role dropdown: "User" (default) or "Admin" */}
        <div className="modal-field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="modal-actions">
          {/* Cancel closes the modal without doing anything */}
          <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          {/* Create button — shows "Creating..." while the request is in flight */}
          <button className="admin-btn admin-btn-primary" onClick={createUser} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
