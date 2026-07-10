# ChatApp

A real-time chat app built with ASP.NET Core, SignalR, PostgreSQL, and React + TypeScript.

---

## Stack

**Backend** — ASP.NET Core 10, SignalR, Entity Framework Core, PostgreSQL, ASP.NET Identity, JWT

**Frontend** — React 19, TypeScript, Vite, @microsoft/signalr

---

## Project Structure

```
CHAT_APP/
├── Backend/
│   ├── APIWEB/          # API endpoints + SignalR hub
│   ├── Application/     # Interfaces + DTOs
│   ├── Domain/          # Entities
│   └── Infrastructure/  # EF Core, services, JWT, seeder
└── Frontend/
    └── src/
        ├── admin/       # Admin panel
        ├── components/  # ChatWindow, ConversationList, UserList
        ├── pages/       # Login, Register
        ├── services/    # Auto-generated API client
        └── signalr/     # SignalR singleton
```

---

## Setup

### Backend

1. Update the connection string and JWT key in `Backend/APIWEB/appsettings.json`

2. Run migrations
```bash
cd Backend
dotnet ef database update --project Infrastructure --startup-project APIWEB
```

3. Start the API
```bash
cd Backend/APIWEB
dotnet run
```

Runs on `http://localhost:5162`. Swagger at `/swagger`.

On first run the seeder creates Admin/User roles and a default admin account:
- Email: `admin@test.com`
- Password: `Admin@123`

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

---

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login |
| POST | `/auth/admin/login` | — | Admin login |
| GET | `/users` | User | List all users |
| GET | `/users/me` | User | Current user profile |
| GET | `/conversations` | User | My conversations |
| POST | `/conversations/{otherUserId}` | User | Start a conversation |
| GET | `/messages/conversation/{id}` | User | Get messages |
| GET | `/admin/dashboard` | Admin | Stats |
| GET | `/admin/users` | Admin | All users |
| POST | `/admin/users` | Admin | Create user |
| PUT | `/admin/users/{id}/block` | Admin | Block user |
| PUT | `/admin/users/{id}/unblock` | Admin | Unblock user |
| DELETE | `/admin/users/{id}` | Admin | Soft delete user |
| PUT | `/admin/users/{id}/restore` | Admin | Restore deleted user |

---

## SignalR — `/chatHub`

**Client → Server**

- `SendMessage(conversationId, content)`
- `MarkAsSeen(conversationId)`
- `JoinConversation(conversationId)`
- `IsUserOnline(userId)` → returns bool

**Server → Client**

- `ReceiveMessage` — new message
- `MessagesSeen` — other user read the messages
- `UserOnline` / `UserOffline` — presence updates

---

## Features

- Real-time messaging via SignalR
- Unread message count per conversation, clears on open
- Seen receipts (✓ Sent / ✓✓ Seen)
- Online/offline status with correct initial state on chat open
- Conversations only appear in the list once they have a message
- Admin can message any user; user sees it as read-only
- Blocked/deleted users are rejected at SignalR connect
- JWT expiry checked on page load, expired tokens cleared automatically

---

## Notes

- Change the default admin password before deploying
- Move the JWT key and DB password to environment variables for production
- CORS is set to `localhost:5173` — update for production in `Program.cs`
