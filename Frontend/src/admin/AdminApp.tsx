import { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { OpenAPI } from "../services/core/OpenAPI";

export default function AdminApp() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {

        const token = localStorage.getItem("adminToken");

        if (token) {

            OpenAPI.TOKEN = token;

            setIsLoggedIn(true);
        }

    }, []);

    const handleLogin = (token: string) => {

        localStorage.setItem("adminToken", token);

        OpenAPI.TOKEN = token;

        setIsLoggedIn(true);
    };

    const logout = () => {

        localStorage.removeItem("adminToken");

        OpenAPI.TOKEN = undefined;

        setIsLoggedIn(false);
    };

    if (!isLoggedIn)
        return <AdminLogin onLogin={handleLogin} />;

    return <AdminDashboard onLogout={logout} />;
}