import { useState } from "react";

type Props = {
  onRegister: (email: string, password: string, userName: string) => void;
  goToLogin: () => void;
};

export default function Register({ onRegister, goToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <h1>Create account</h1>
          <p>Join and start chatting today</p>
        </div>

        <div className="auth-field">
          <label>Username</label>
          <input
            placeholder="johndoe"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="auth-btn"
          onClick={() => onRegister(email, password, userName)}
        >
          Create Account
        </button>

        <div className="auth-switch">
          Already have an account?{" "}
          <span onClick={goToLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
