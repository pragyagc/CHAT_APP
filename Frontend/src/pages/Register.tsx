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
    <div style={{ padding: 20 }}>
      <h2>Register</h2>

      <input
        placeholder="Username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <br />

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

      <button onClick={() => onRegister(email, password, userName)}>
        Register
      </button>

      <p onClick={goToLogin} style={{ cursor: "pointer" }}>
        Login
      </p>
    </div>
  );
}