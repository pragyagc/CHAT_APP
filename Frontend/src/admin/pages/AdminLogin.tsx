import { useState } from "react";
import { ApiwebService } from "../../services";

type Props = {
    onLogin: (token: string) => void;
};

export default function AdminLogin({ onLogin }: Props) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin() {

        setError("");
        setLoading(true);

        try {

            const response =
                await ApiwebService.postAuthAdminLogin({
                    email,
                    password
                });

            localStorage.setItem("adminToken", response.token);

            onLogin(response.token);

        } catch {

            setError("Invalid admin credentials.");

        } finally {

            setLoading(false);

        }
    }

    return (
        <div
            style={{
                width: 350,
                margin: "100px auto",
                padding: 25,
                border: "1px solid #ccc",
                borderRadius: 10
            }}
        >
            <h2>Admin Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: 8
                }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: 8
                }}
            />

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                    width: "100%",
                    padding: 10
                }}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </div>
    );
}