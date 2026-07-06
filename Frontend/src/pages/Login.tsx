import { useState } from "react";

type Props = {
  onLogin: (email: string, password: string) => void;
  goToRegister: () => void;
};

export default function Login({ onLogin, goToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <h1>Welcome back</h1>
          <p>Sign in to continue chatting</p>
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin(email, password)}
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin(email, password)}
          />
        </div>

        <button className="auth-btn" onClick={() => onLogin(email, password)}>
          Sign In
        </button>

        <div className="auth-switch">
          Don't have an account?{" "}
          <span onClick={goToRegister}>Create one</span>
        </div>
      </div>
    </div>
  );
}
