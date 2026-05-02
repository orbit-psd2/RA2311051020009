# Notification System Design

## Overview

This document describes the architecture and design decisions behind the notification system. The system is split into three independent modules: a backend API, a frontend UI, and a logging middleware. Each module has a single responsibility and can be reasoned about on its own.

---

## Architecture

```
Browser
  |
  | HTTP
  v
notification_app_fe (Next.js - port 3001)
  |
  | Internal API routes (/api/notifications)
  | runs server-side only
  |
  +---> logging_middleware  (logs frontend events)
  |
  | HTTP
  v
notification_app_be (Express - port 3000)
  |
  +---> logging_middleware  (logs backend events)
  |
  | In-memory store
  v
Notification Store (Map<userId, Notification[]>)
```

The frontend never talks to the backend directly from the browser. All requests go through Next.js API route handlers, which keeps auth tokens and logger credentials server-side only.

---

## Modules

### Backend (notification_app_be)

Built with Express and TypeScript. Responsible for:

- Auth token management (fetch, cache, refresh)
- Notification creation and retrieval
- Request/response logging at every layer

**Layer breakdown:**

```
Request
  -> requestLogger middleware   (logs every incoming request)
  -> Route                      (logs route hit)
  -> Controller                 (validates input, calls service)
  -> Service                    (business logic, in-memory storage)
  -> Response
  -> errorHandler middleware    (catches unhandled errors, logs them)
```

**In-memory storage:**

Notifications are stored in a `Map<string, Notification[]>` keyed by userId. This resets on server restart. No database is needed for the current scope.

**Auth flow:**

```
getValidToken()
  |
  +-- token exists in .env and not expired? --> return it
  |
  +-- expired or missing --> call /auth endpoint
        |
        +-- write new ACCESS_TOKEN and TOKEN_EXPIRY to .env
        +-- return fresh token
```

Token expiry is stored as an absolute Unix timestamp in milliseconds. A 30-second buffer is applied before actual expiry so tokens are refreshed proactively.

---

### Frontend (notification_app_fe)

Built with Next.js (App Router) and React 19. Two components on a single page:

- `NotificationForm` — takes userId, title, message and POSTs to the backend
- `NotificationList` — takes a userId and fetches their notifications on demand

All API calls go through Next.js route handlers at `/api/notifications` rather than hitting the backend directly. This means the logger (which uses the filesystem to read `.env`) can run without any issues in a pure server context.

**Data flow for creating a notification:**

```
User fills form -> handleSubmit()
  -> POST /api/notifications (Next.js route handler)
    -> Log() called server-side
    -> POST http://localhost:3000/notifications (backend)
    -> { success: true, notificationId: "..." }
  -> UI shows success message
```

---

### Logging Middleware (logging_middleware)

A standalone TypeScript module. Exposes a single function:

```typescript
Log(stack, level, package, message)
```

**Design decisions:**

- Fire-and-forget. `Log()` is synchronous from the caller's perspective. The async work runs detached so it never delays the caller.
- Fail-safe. Every failure path ends in `console.warn`, never a throw. The app never crashes because of a failed log.
- Token handled internally. The logger reads credentials from the shared `.env`, fetches a token if needed, and retries once on 401.
- Input sanitization. Messages are trimmed to 48 characters (API constraint). Package names that the API does not accept are silently mapped to `"service"`.

**Accepted values:**

| Field   | Accepted values |
|---------|----------------|
| stack   | `backend`, `frontend` |
| level   | `debug`, `info`, `warn`, `error`, `fatal` |
| package | `route`, `service`, `db`, `middleware`, `api`, `component` |

**Token refresh in the logger:**

```
Log() called
  -> get token (from cache or .env)
  -> POST to log API
  -> 401? -> forceRefreshToken() -> retry once
  -> still failing? -> console.warn, move on
```

---

## Data Model

### Notification

```typescript
{
  id: string         // UUID v4
  userId: string     // identifier for the recipient
  title: string
  message: string
  createdAt: string  // ISO 8601 timestamp
}
```

---

## API Reference

### POST /notifications

Create a notification.

Request body:
```json
{
  "userId": "user1",
  "title": "System Alert",
  "message": "Disk usage above 90%"
}
```

Response:
```json
{
  "success": true,
  "notificationId": "552b69f5-c997-4d6d-bbb0-18971bd5cc0f"
}
```

### GET /notifications/:userId

Fetch all notifications for a user.

Response:
```json
{
  "notifications": [
    {
      "id": "552b69f5-c997-4d6d-bbb0-18971bd5cc0f",
      "userId": "user1",
      "title": "System Alert",
      "message": "Disk usage above 90%",
      "createdAt": "2026-05-02T05:33:09.450Z"
    }
  ]
}
```

---

## Environment Variables

All credentials live in `notification_app_be/.env`. Both the backend and the frontend logger read from this file.

| Variable      | Description                                      |
|---------------|--------------------------------------------------|
| BASE_URL      | Base URL of the external API                     |
| CLIENT_ID     | Registered client ID                             |
| CLIENT_SECRET | Registered client secret                         |
| ACCESS_TOKEN  | Cached access token (written automatically)      |
| TOKEN_EXPIRY  | Token expiry as Unix ms timestamp (written automatically) |

---

## Known Constraints

- Notifications are in-memory only. A server restart clears all data.
- The logging API has a strict 48-character message limit and only accepts a subset of package names. Both are handled silently by the middleware.
- The frontend logger is a self-contained copy of the logging logic rather than a shared import, because Next.js Turbopack does not resolve modules outside the project root.
