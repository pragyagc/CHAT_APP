import { useState } from "react";
import { ApiwebService } from "../../services";
import "../styles/admin.css";

type Props = { onLogin: (token: string) => void };

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await ApiwebService.postAuthAdminLogin({ email, password });
      localStorage.setItem("adminToken", res.token);
      onLogin(res.token);
    } catch {
      setError("Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="admin-login-logo-icon">🛡️</div>
          <h1>Admin Panel</h1>
          <p>Sign in with your admin account</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

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
