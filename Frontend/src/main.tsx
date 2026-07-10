import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const isAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")!).render(
  <>
    {isAdmin ? <AdminApp /> : <App />}

    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="colored"
    />
  </>
);