# Sports App — Auth Backend

Node.js 22 LTS · Express · SQLite (better-sqlite3) · Zod · bcryptjs

---

## Prerequisites

### 1. Node.js 22 LTS
This project targets **Node 22 LTS**. `better-sqlite3` ships prebuilt binaries for
Node 22 on Windows — no C++ compiler needed on that version.

Download: https://nodejs.org/en/download (select 22 LTS)

### 2. Windows — if you must use Node 24+
`better-sqlite3` must compile from source on Node 24 because no prebuilt binary
exists yet. Install the Visual Studio C++ build tools once:

```powershell
# Run as Administrator
npm install --global node-gyp
winget install Microsoft.VisualStudio.2022.BuildTools
# In the VS installer, select: "Desktop development with C++"
```

Then install normally (without `--ignore-scripts`).

---

## Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies  (Node 22 — no build tools needed)
npm install

# 3. Start the server
npm start

# Development (auto-restart on file change)
npm run dev
```

The `data/` directory and `sports.db` file are created automatically on first run.

---

## API Endpoints

Base URL: `http://localhost:3000/api`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/register/athlete` | Register athlete |
| POST | `/auth/register/coach` | Register coach |
| POST | `/auth/otp/verify` | Verify OTP |
| POST | `/auth/otp/resend` | Resend OTP |
| POST | `/auth/password/set` | Set password (post-OTP) |
| POST | `/auth/password/forgot` | Forgot password lookup |
| POST | `/auth/password/reset` | Reset password |
| POST | `/auth/login` | Login |
| GET | `/auth/users/:local_id` | Get user by local_id |
| POST | `/sync/users` | Bulk sync users from device |

---

## Request / Response Format

Every response follows `{ success, message, data }`.

Errors follow `{ success: false, message }` — field errors add `errors: [{field, message}]`.

---

## Project Structure

```
src/
├── app.js                    Express app (middleware + routes)
├── server.js                 HTTP server, DB init, graceful shutdown
├── config/
│   ├── env.js                Typed environment variables
│   └── constants.js          All constants (roles, ID types, HTTP codes…)
├── database/
│   ├── db.js                 SQLite singleton, WAL mode, migrations runner
│   └── migrations.js         DDL for users, otp_verifications, sync_queue
├── repositories/
│   ├── userRepository.js     SQL for users table
│   ├── otpRepository.js      SQL for otp_verifications table
│   └── syncQueueRepository.js SQL for sync_queue table
├── services/
│   ├── authService.js        Auth business logic
│   └── syncService.js        Bulk sync business logic
├── controllers/
│   ├── authController.js     Auth request handlers
│   └── syncController.js     Sync request handler
├── routes/
│   ├── index.js              Mounts /auth and /sync under /api
│   ├── authRoutes.js
│   └── syncRoutes.js
├── middleware/
│   ├── validate.js           Zod validation factory
│   ├── errorHandler.js       Global error handler
│   └── notFound.js           404 catch-all
├── schemas/
│   ├── authSchemas.js        Zod schemas for all auth endpoints
│   └── syncSchemas.js        Zod schema for bulk sync
└── utils/
    ├── password.js           bcrypt hash + compare
    ├── response.js           Consistent JSON response helpers
    ├── otp.js                OTP generation + expiry
    └── date.js               ISO timestamp helpers
```

---

## Deployment (Submission)

- [ ] Add `Dockerfile` to this folder
- [ ] See [`../docs/API_Spec.yaml`](../docs/API_Spec.yaml) for OpenAPI specification

```bash
# docker build -t battery-fitness-api .
# docker run -p 3000:3000 battery-fitness-api
```
