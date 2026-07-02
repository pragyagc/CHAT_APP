import * as signalR from "@microsoft/signalr";

export const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5162/chatHub", {
    accessTokenFactory: () => localStorage.getItem("token") || "",
  })
  .withAutomaticReconnect()
  .build();

// // ✅ Add this below the connection
// export async function ensureConnection() {
//   if (connection.state === signalR.HubConnectionState.Connected) {
//     return;
//   }

//   if (connection.state === signalR.HubConnectionState.Disconnected) {
//     await connection.start();
//   }
// }