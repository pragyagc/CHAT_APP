import { useState } from "react";
import { ApiwebService } from "../../services";

type Props = {
    onClose: () => void;
    onCreated: () => void;
};

export default function CreateUserModal({
    onClose,
    onCreated,
}: Props) {

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("User");

    const [loading, setLoading] = useState(false);

    async function createUser() {

        if (!userName.trim()) {
            alert("Username is required.");
            return;
        }

        if (!email.trim()) {
            alert("Email is required.");
            return;
        }

        if (!password.trim()) {
            alert("Password is required.");
            return;
        }

        try {

            setLoading(true);

            await ApiwebService.postAdminUsers({
                userName,
                email,
                password,
                role,
            });

            alert("User created successfully.");

            onCreated();

        } catch (err: any) {

            console.error(err);

            alert(
                err?.body ??
                err?.message ??
                "Unable to create user."
            );

        } finally {

            setLoading(false);

        }
    }

    return (

        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >

            <div
                style={{
                    background: "white",
                    width: 420,
                    borderRadius: 10,
                    padding: 25,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                }}
            >

                <h2
                    style={{
                        marginTop: 0,
                        marginBottom: 20,
                    }}
                >
                    Create User
                </h2>

                <div style={{ marginBottom: 15 }}>

                    <label>Username</label>

                    <input
                        type="text"
                        value={userName}
                        onChange={(e) =>
                            setUserName(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: 10,
                            marginTop: 5,
                        }}
                    />

                </div>

                <div style={{ marginBottom: 15 }}>

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: 10,
                            marginTop: 5,
                        }}
                    />

                </div>

                <div style={{ marginBottom: 15 }}>

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: 10,
                            marginTop: 5,
                        }}
                    />

                </div>

                <div style={{ marginBottom: 20 }}>

                    <label>Role</label>

                    <select
                        value={role}
                        onChange={(e) =>
                            setRole(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: 10,
                            marginTop: 5,
                        }}
                    >
                        <option value="User">
                            User
                        </option>

                        <option value="Admin">
                            Admin
                        </option>

                    </select>

                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                    }}
                >

                    <button
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={createUser}
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create User"}
                    </button>

                </div>

            </div>

        </div>

    );
}