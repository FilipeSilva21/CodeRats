# 🐀 DevRats

> **Commit. Compete. Conquer.**

DevRats is a gamified development platform that tracks GitHub activity and turns coding into a competitive game. Developers earn points for commits, compete in squads, and climb leaderboards — all with anti-cheat protection.

---

## 🏗️ Architecture

```
CodeRats/
├── backend/          # Kotlin + Ktor API (port 8080)
│   ├── src/main/kotlin/com/devrats/
│   │   ├── Application.kt         # Entry point
│   │   ├── di/                     # Koin Dependency Injection
│   │   ├── plugins/                # Ktor Plugins (Auth, CORS, DB, etc.)
│   │   ├── features/
│   │   │   ├── auth/               # GitHub OAuth + JWT
│   │   │   ├── github/             # Webhook processing
│   │   │   ├── scoring/            # Anti-cheat scoring engine
│   │   │   ├── squad/              # Team management
│   │   │   └── leaderboard/        # Rankings + WebSocket
│   │   └── shared/                 # Security, exceptions, extensions
│   └── docker-compose.yml          # PostgreSQL 16
│
├── mobile/           # React Native + Expo (port 8081)
│   ├── app/                        # Expo Router (file-based routing)
│   │   ├── (auth)/login.tsx        # GitHub login screen
│   │   └── (tabs)/                 # Home, Squad, Leaderboard, Profile
│   └── src/
│       ├── components/ui/          # Design system (Button, Card, Badge, Avatar)
│       ├── features/               # Zustand stores (auth, scoring, squad)
│       ├── lib/                    # API client, WebSocket hook
│       └── theme/                  # Dark cyberpunk theme
│
└── spec.md           # Project specification
```

## 🛠️ Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| **Backend**    | Kotlin, Ktor 3.x, Exposed ORM    |
| **Frontend**   | React Native, Expo SDK 54, Expo Router |
| **Database**   | PostgreSQL 16 (Docker)            |
| **Auth**       | GitHub OAuth 2.0, JWT             |
| **DI**         | Koin 4.x                          |
| **Real-time**  | WebSockets (Ktor native)          |
| **State**      | Zustand                           |
| **HTTP Client**| Axios (with JWT auto-refresh)     |

---

## 🚀 Getting Started

### Prerequisites

- **JDK 21+** — [Download](https://adoptium.net/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)

### 1. Start the Database

```bash
cd backend
docker-compose up -d
```

### 2. Run the Backend

```bash
cd backend
./gradlew run       # Linux/Mac
.\gradlew.bat run   # Windows
```

The API will be available at `http://localhost:8080`.  
Health check: `GET http://localhost:8080/api/health`

### 3. Run the Frontend

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start
```

Press `w` to open in browser, or scan the QR code with Expo Go.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Auth  | Description           |
|--------|----------------------|-------|-----------------------|
| POST   | `/api/auth/refresh`  | No    | Refresh access token  |
| GET    | `/api/auth/me`       | JWT   | Get current user      |
| DELETE | `/api/auth/logout`   | JWT   | Logout                |

### Webhooks
| Method | Endpoint               | Auth  | Description           |
|--------|------------------------|-------|-----------------------|
| POST   | `/api/webhooks/github` | HMAC  | GitHub push events    |

### Scoring
| Method | Endpoint               | Auth  | Description           |
|--------|------------------------|-------|-----------------------|
| GET    | `/api/scores/me`       | JWT   | Score summary         |
| GET    | `/api/scores/me/daily` | JWT   | Daily progress        |

### Squads
| Method | Endpoint              | Auth  | Description           |
|--------|-----------------------|-------|-----------------------|
| GET    | `/api/squads/my`      | JWT   | List my squads        |
| GET    | `/api/squads/:id`     | JWT   | Squad details         |
| POST   | `/api/squads`         | JWT   | Create squad          |
| POST   | `/api/squads/join`    | JWT   | Join by invite code   |

### Leaderboard
| Method | Endpoint                   | Auth  | Description           |
|--------|----------------------------|-------|-----------------------|
| GET    | `/api/leaderboard/global`  | No    | Global ranking        |
| WS     | `/leaderboard/:squadId`    | No    | Real-time updates     |

---

## 🎮 Scoring Rules

| Rule                    | Details                                      |
|-------------------------|----------------------------------------------|
| **Base points**         | 10 pts per valid commit                      |
| **Markdown penalty**    | 2 pts for commits with only `.md` files      |
| **Daily cap**           | 200 pts maximum per day                      |
| **Anti-cheat filters**  | Empty commits, merge commits, no-file-change |
| **Duplicate detection** | Commits are scored only once (by hash)       |

---

## 🔐 Environment Variables

| Variable               | Description                  | Default            |
|------------------------|------------------------------|--------------------|
| `PORT`                 | Server port                  | `8080`             |
| `DATABASE_URL`         | PostgreSQL JDBC URL          | `localhost:5432`   |
| `DATABASE_USER`        | Database user                | `postgres`         |
| `DATABASE_PASSWORD`    | Database password            | `devrats123`       |
| `GITHUB_CLIENT_ID`     | GitHub App Client ID         | —                  |
| `GITHUB_CLIENT_SECRET` | GitHub App Client Secret     | —                  |
| `GITHUB_WEBHOOK_SECRET`| Webhook signature secret     | —                  |

---

## 📱 Mobile Screens

| Screen        | Description                                     |
|---------------|-------------------------------------------------|
| **Login**     | GitHub OAuth with branding and feature highlights |
| **Home**      | Score dashboard, daily progress, streak stats    |
| **Squad**     | Create/join squads, view member leaderboard      |
| **Leaderboard** | Global ranking with medal system              |
| **Profile**   | User stats, GitHub integration status, sign out  |

---

## 🧑‍💻 Development

### Project Structure Philosophy

- **Feature-based architecture** — each domain (auth, scoring, squad) is self-contained
- **Modular plugins** — Ktor plugins are independently testable
- **Zustand stores** — lightweight, hook-based state management
- **Design tokens** — centralized theme for consistent dark-mode UI

### Useful Commands

```bash
# Backend: compile only (no run)
cd backend && .\gradlew.bat compileKotlin

# Backend: clean build
cd backend && .\gradlew.bat clean build

# Frontend: fix dependency versions
cd mobile && npx expo install --fix

# Database: reset
cd backend && docker-compose down -v && docker-compose up -d
```

---

## 📝 License

This project is private and proprietary.
