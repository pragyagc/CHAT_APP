# 💬 ChatApp — Full Stack Real-Time Chat Application

A full-stack real-time chat application built with **ASP.NET Core 10**, **SignalR**, **PostgreSQL**, and **React + TypeScript + Vite**. Supports user-to-user messaging, live online/offline status, unread message counts, seen receipts, and a full admin control panel.

---

## 📁 Project Structure

```
CHAT_APP/
├── Backend/
│   ├── APIWEB/              # ASP.NET Core Web API + SignalR Hub
│   ├── Application/         # DTOs, Interfaces (business contracts)
│   ├── Domain/              # Entities (User, Message, Conversation)
│   ├── Infrastructure/      # EF Core, Repositories, Services, JWT, Seeder
│   └── solution2.slnx
└── Frontend/
    ├── src/
    │   ├── admin/           # Admin panel (pages, components, styles)
    │   ├── components/      # ChatWindow, ConversationList, UserList
    │   ├── pages/           # Login, Register
    │   ├── services/        # Auto-generated API client
    │   ├── signalr/         # SignalR connection singleton
    │   ├── App.tsx          # Main user app
    │   └── main.tsx
    └── package.json
```

---

## 🧱 Architecture

The backend follows **Clean Architecture** with 4 layers:

| Layer | Project | Responsibility |
|---|---|---|
| API | `APIWEB` | Minimal API endpoints, SignalR Hub, middleware |
| Application | `Application` | DTOs, service & repository interfaces |
| Domain | `Domain` | Core entities, no dependencies |
| Infrastructure | `Infrastructure` | EF Core, Identity, JWT, service implementations |

---

## ⚙️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| ASP.NET Core | 10 | Web API framework |
| SignalR | 10 | Real-time WebSocket communication |
| Entity Framework Core | Latest | ORM |
| PostgreSQL | Any | Database |
| ASP.NET Core Identity | Built-in | User auth & role management |
| JWT Bearer | Built-in | Token-based authentication |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool & dev server |
| @microsoft/signalr | 10 | SignalR client |
| jwt-decode | 4 | JWT token parsing |
| openapi-typescript-codegen | 0.25 | Auto-generated API client |

---

## 🗄️ Database Schema

### User
Extends `IdentityUser<Guid>` with:
- `IsBlocked` — prevents login when true
- `IsDeleted` — soft delete flag
- `CreatedAt` — registration timestamp

### Conversation
- `Id` — GUID primary key
- `IsReadOnly` — true for admin-initiated conversations (user cannot reply)
- `IsAdminConversation` — marks admin-to-user conversations
- `CreatedAt`
- Navigation: `Participants`, `Messages`

### ConversationParticipant
- Join table between `User` and `Conversation`
- `JoinedAt` timestamp

### Message
- `Id`, `ConversationId`, `SenderId`
- `Text` — message content
- `SentAt`, `CreatedAt`
- `IsSeen` — read receipt flag
- `SeenAt` — when it was seen

---

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

---

### Backend Setup

**1. Configure the database connection**

Edit `Backend/APIWEB/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=Chatdb;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Key": "YOUR_SUPER_SECRET_KEY_MIN_32_CHARS",
    "Issuer": "localhost",
    "Audience": "localhost"
  }
}
```

**2. Apply migrations**
```bash
cd Backend
dotnet ef database update --project Infrastructure --startup-project APIWEB
```

**3. Run the API**
```bash
cd Backend/APIWEB
dotnet run
```

The API runs on `http://localhost:5162`.  
Swagger UI is available at `http://localhost:5162/swagger`.

> On first run, the seeder automatically creates:
> - `Admin` and `User` roles
> - Default admin account: `admin@test.com` / `Admin@123`

---

### Frontend Setup

**1. Install dependencies**
```bash
cd Frontend
npm install
```

**2. Start the dev server**
```bash
npm run dev
```

The app runs on `http://localhost:5173`.

---

## 🔌 API Endpoints

### Auth — `/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login as user, returns JWT |
| POST | `/auth/admin/login` | Login as admin, returns JWT |

### Users — `/users` *(requires auth)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Get all users |
| GET | `/users/me` | Get current logged-in user profile |

### Conversations — `/conversations` *(requires auth)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | Get all conversations for current user |
| POST | `/conversations/{otherUserId}` | Create or get existing conversation |

### Messages — `/messages` *(requires auth)*
| Method | Endpoint | Description |
|---|---|---|
| POST | `/messages` | Send a message (REST fallback) |
| GET | `/messages/conversation/{conversationId}` | Get all messages in a conversation |

### Admin — `/admin` *(requires Admin role)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Get stats: total users, messages, conversations |
| GET | `/admin/users` | Get all users |
| GET | `/admin/users/{id}` | Get single user details |
| POST | `/admin/users` | Create a new user |
| PUT | `/admin/users/{id}/block` | Block a user |
| PUT | `/admin/users/{id}/unblock` | Unblock a user |
| DELETE | `/admin/users/{id}` | Soft-delete a user |
| PUT | `/admin/users/{id}/restore` | Restore a soft-deleted user |

---

## ⚡ SignalR Hub — `/chatHub`

The hub requires a valid JWT passed as `?access_token=` query parameter (handled automatically by the frontend).

### Hub Methods (client → server)

| Method | Parameters | Description |
|---|---|---|
| `SendMessage` | `conversationId`, `content` | Send a message to a conversation group |
| `MarkAsSeen` | `conversationId` | Mark all messages in conversation as seen |
| `JoinConversation` | `conversationId` | Join a SignalR group for a conversation |
| `LeaveConversation` | `conversationId` | Leave a SignalR group |
| `IsUserOnline` | `userId` | Returns `bool` — whether user is currently connected |

### Hub Events (server → client)

| Event | Payload | Description |
|---|---|---|
| `ReceiveMessage` | `MessageDto` | New message received in a conversation |
| `MessagesSeen` | `conversationId` | Other participant marked messages as seen |
| `UserOnline` | `userId` | A user connected |
| `UserOffline` | `userId` | A user disconnected |
| `ConversationChanged` | `conversationId` | Conversation metadata updated |

### Connection Lifecycle
- `OnConnectedAsync` — joins all existing conversation groups, broadcasts `UserOnline`, blocks deleted/blocked users
- `OnDisconnectedAsync` — removes from online users map, broadcasts `UserOffline`

---

## 🎯 Features

### User App
- **Register / Login** — JWT auth with token expiry validation on page load
- **Conversation List** — only shows conversations that have at least one message
- **New Chat** — shows users without an active message thread; clicking creates a conversation and opens it
- **Real-time messaging** — messages delivered instantly via SignalR
- **Unread badge** — per-conversation unread count shown as a blue pill badge; clears on open
- **Seen receipts** — ✓ Sent / ✓✓ Seen shown on sender's messages
- **Online / Offline status** — live green/grey dot with initial state fetched on chat open
- **Auto-scroll** — scrolls to bottom on new messages; "New messages ↓" banner when scrolled up
- **Tab visibility** — does not mark messages as seen when browser tab is hidden

### Admin Panel (`/admin` route)
- **Separate login** — admin JWT stored separately from user JWT
- **Dashboard** — total users, messages, and conversations at a glance
- **Users table** — all users with role badges, status badges (Active / Blocked / Deleted)
- **User details** — view profile, contextual action buttons:
  - Active → Block + Delete
  - Blocked → Unblock + Delete
  - Deleted → Restore only
- **Create user** — create users with any role (User / Admin) from a modal
- **Message users** — admin can open a chat with any non-admin user; user sees it as read-only (cannot reply)

---

## 🔐 Authentication & Authorization

- JWT tokens expire after **2 hours**
- Frontend validates token expiry on page load via `jwt-decode`; expired tokens are cleared automatically
- Two separate token keys in `localStorage`:
  - `token` — regular user
  - `adminToken` — admin panel
- SignalR connection uses `adminToken` first, falls back to `token`
- Blocked or deleted users are disconnected immediately on SignalR connect (`Context.Abort()`)

---

## 🏗️ Key Implementation Details

### Stale Closure Prevention
SignalR handlers in React capture values at registration time. Refs (`currentUserIdRef`, `selectedConversationRef`) are used to always read the latest values inside handlers without re-registering them.

### Unread Count Architecture
- A single `ReceiveMessage` handler lives in `App.tsx` (not in `ChatWindow`)
- It skips messages sent by self and messages for the currently open conversation
- Stores counts in a `Map<conversationId, count>` — cleared when conversation is selected
- `ChatWindow` registers its own separate handler for rendering messages

### SignalR Group Membership
- On connect, the user joins **all** their conversation groups automatically
- `LeaveConversation` is **not** called when switching chats — users must stay in all groups to receive unread notifications from background conversations

### Conversation Visibility Rules
- A conversation only appears in the sidebar list if `lastMessage` is non-empty
- A user only appears in "New Chat" if they don't have an existing conversation **with messages**
- This means an empty conversation (created but no messages sent) keeps the user in "New Chat"

---

## 🛠️ Development Notes

### Regenerating the API Client
If you change backend endpoints, regenerate the TypeScript client:
```bash
cd Frontend
npx openapi-typescript-codegen --input http://localhost:5162/swagger/v1/swagger.json --output src/services --client axios
```

### Running Both Together
Open two terminals:
```bash
# Terminal 1 — Backend
cd Backend/APIWEB && dotnet run

# Terminal 2 — Frontend
cd Frontend && npm run dev
```

---

## 📝 Environment Notes

- CORS is configured to allow `http://localhost:5173` only — update `Program.cs` for production
- JWT key in `appsettings.json` should be moved to environment variables or secrets in production
- The default admin credentials (`admin@test.com` / `Admin@123`) should be changed before any deployment
