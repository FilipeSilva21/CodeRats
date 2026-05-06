# DevRats Backend Specification (Java Spring Boot)

## Overview
The DevRats backend is a gamified API built with **Java 21** and **Spring Boot 3.3.x**. It integrates with the GitHub API to monitor user commits and assigns scores, maintaining a competitive leaderboard and squad rankings. It has been recently refactored from a Kotlin/Ktor architecture to a standard Spring Web MVC structure.

## Core Technologies
- **Framework**: Spring Boot (Web, Data JPA, Security, WebSockets, Mail)
- **Language**: Java 21
- **Database**: PostgreSQL (managed via Spring Data JPA / Hibernate)
- **Build Tool**: Maven (`pom.xml`)
- **Authentication**: Custom JWT Filter combined with Spring Security and GitHub OAuth.

## Domain Models (Entities)
All models are standard JPA `@Entity` classes located in `com.devrats.model`:
1. **User**: Represents a DevRats developer. Stores GitHub credentials, overall score, streaks (current & best), and league status.
2. **Score**: Represents an event where points were earned. Contains `points`, `scoreSource` (e.g., push), `commitHash`, `repositoryName`, and `scoredAt`.
3. **Squad**: Represents a group of users competing together. Contains an invite code and owner.
4. **SquadMember**: A mapping entity between `User` and `Squad` with a `role` (OWNER/MEMBER).
5. **Notification**: In-app notifications alerting users when they've been surpassed globally or in their squads.
6. **RefreshToken**: Stores active JWT refresh tokens.

## Application Flow

### 1. Authentication Flow (`AuthController` & `AuthService`)
- The user hits `/api/auth/github/login`, redirecting them to GitHub OAuth.
- GitHub redirects to `/api/auth/github/callback` with a code.
- `GitHubApiClient` (using Spring `RestClient`) exchanges the code for an Access Token and fetches the user's profile and primary verified email.
- The `AuthService` registers the user (if new) or updates them, returning a signed JWT (Access & Refresh tokens).

### 2. GitHub Webhook Flow (`WebhookController` & `WebhookService`)
- When a user pushes code, GitHub sends a JSON payload to `/api/webhooks/github`.
- The controller validates the payload against a configured `webhookSecret` using HMAC SHA-256 (`HmacValidator`).
- The `WebhookService` parses the JSON using Jackson into a `WebhookPayload` record, extracting commits and the `repositoryName`.

### 3. Scoring & Streaks (`ScoringService`)
- Each valid commit is processed by `scoreCommit()`.
- Points are capped at 50 per day (`dailyCap = 50`). Standard commits give 10 points; Markdown-only commits give 2 points.
- The streak logic (`getEffectiveStreak()`) is highly strict:
  - It calculates the days between the last commit and today.
  - If the user hasn't committed today (`daysBetween == 0L`), their displayed streak resets to 0 at midnight. Once they commit, their historical streak is retrieved and incremented.
- Once a score is added, `ScoreWebSocketHandler` broadcasts the update, and `NotificationService` checks if the user surpassed anyone.

### 4. Real-time Leaderboard (`ScoreWebSocketHandler`)
- Spring WebSockets are enabled at `/leaderboard/global`.
- Clients connect to receive live JSON payloads whenever any user scores points, allowing the frontend to animate leaderboard shifts instantly.

### 5. Scheduled Jobs (`WeeklyReportService`)
- A Spring `@Scheduled` task runs every Sunday at 12:00 PM (cron: `0 0 12 ? * SUN`).
- It iterates through all users, aggregates their scores and commits from the past 7 days, finds their most active repository, and determines their global/squad ranks.
- An HTML report is generated and dispatched using Spring's `JavaMailSender` (configured via `EmailService`).

## Security & API Protection
- The API is secured by a `SecurityFilterChain` that ignores `/api/auth/**`, `/api/webhooks/**`, and WebSocket routes.
- Protected endpoints require a Bearer JWT, which is decoded and validated by `JwtAuthenticationFilter`. Upon success, the `userId` is placed in the `SecurityContextHolder`.