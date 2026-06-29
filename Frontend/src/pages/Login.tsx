import { useState } from "react";

type Props = {
  onLogin: (email: string, password: string) => void;
  goToRegister: () => void;
};

export default function Login({ onLogin, goToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={() => onLogin(email, password)}>
        Login
      </button>

      <p onClick={goToRegister} style={{ cursor: "pointer" }}>
        Register
      </p>
    </div>
  );
}