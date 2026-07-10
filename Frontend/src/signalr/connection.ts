import * as signalR from "@microsoft/signalr";


export const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5162/chatHub", {
    // Provide the JWT token so the hub can authenticate the user
    accessTokenFactory: () => {
    const isAdmin =
        window.location.pathname.startsWith("/admin");

    return isAdmin
        ? localStorage.getItem("adminToken") || ""
        : localStorage.getItem("token") || "";
}
  })
  .withAutomaticReconnect() // auto-reconnect on network drops
  .build();


export async function ensureConnection() {
  // Already connected — nothing to do
  if (connection.state === signalR.HubConnectionState.Connected)
    return;

  // Only start if fully disconnected (not in Connecting/Reconnecting state)
  if (connection.state === signalR.HubConnectionState.Disconnected)
    await connection.start();
}
