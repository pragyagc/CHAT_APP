import { useState } from "react";
import { ApiwebService } from "../../services";
import "../styles/admin.css";
import { toast } from "react-toastify";

type Props = { onLogin: (token: string) => void };

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Submits credentials to the admin login endpoint.
   * On success: passes the JWT token up to AdminApp via onLogin().
   * On failure: shows an error message (doesn't expose the actual server error for security).
   */
  async function handleLogin() {
  setLoading(true);

  try {
    const res = await ApiwebService.postAuthAdminLogin({
      email,
      password,
    });

    localStorage.setItem("adminToken", res.token);
    onLogin(res.token);
  } catch (error: any) {
    toast.error(
      error.response?.data || "Invalid admin credentials."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        {/* Logo / branding section */}
        <div className="admin-login-logo">
          <div className="admin-login-logo-icon">🛡️</div>
          <h1>Admin Panel</h1>
          <p>Sign in with your admin account</p>
        </div>

        {/* Email field — Enter key triggers login */}
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* Password field — Enter key triggers login */}
        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* Submit button — disabled while the request is in flight */}
        <button
          className="admin-btn admin-btn-primary"
          style={{ width: "100%", padding: "13px", marginTop: 8, fontSize: 15 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
