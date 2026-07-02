import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UsersPage from "./UsersPage";
import AdminChat from "./AdminChat";

type Props = {
    onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: Props) {

    const [dashboard, setDashboard] = useState<any>();
    const [page, setPage] = useState("dashboard");

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        const data = await ApiwebService.getAdminDashboard();
        setDashboard(data);
    }

    return (
        <div style={{ display: "flex", height: "100vh" }}>

            {/* Sidebar */}
            <div
                style={{
                    width: 230,
                    background: "#222",
                    color: "white",
                    padding: 20
                }}
            >
                <h2>Admin</h2>

                <button
                    style={{ width: "100%", marginBottom: 10 }}
                    onClick={() => setPage("dashboard")}
                >
                    Dashboard
                </button>

                <button
                    style={{ width: "100%", marginBottom: 10 }}
                    onClick={() => setPage("users")}
                >
                    Users
                </button>

                <button
                     style={{ width: "100%", marginBottom: 10 }}
                     onClick={() => setPage("messages")}
                >
                    Messages
                </button>

                <button
                    style={{ width: "100%" }}
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>

            {/* Content */}

            <div style={{ flex: 1, padding: 30 }}>

                {page === "dashboard" && dashboard && (

                    <>
                        <h1>Dashboard</h1>

                        <h3>Total Users : {dashboard.totalUsers}</h3>

                        <h3>Total Messages : {dashboard.totalMessages}</h3>

                        <h3>Total Conversations : {dashboard.totalConversations}</h3>
                    </>

                )}

                {page === "users" && (
                    <UsersPage />
                )}

                {page === "messages" && (
                    <AdminChat />
                )}

            </div>

        </div>
    );
}