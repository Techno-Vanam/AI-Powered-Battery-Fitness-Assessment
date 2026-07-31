# Athlete / Coach App — Auth Flow Documentation (Offline-First)

**Platform:** React Native (bare workflow, Metro bundler)
**Scope:** User Mode Selection → Registration → Mock OTP → Set Password → Login → Forgot Password → Home Dashboard
**Core Constraint:** App must be **fully functional offline**. All auth data is written to a local SQLite database first, then synced to the remote server when connectivity is available.

---

## 1. Overview

The app supports two distinct user modes, each with its own registration and login flow:

| Mode | Identity Field | Extra Logic |
|---|---|---|
| **Athlete** | NSRS / APAAR / Aadhar | Age check (DOB → auto-calc age). If age < 18, guardian details required |
| **Coach** | NSRS / APAAR / Aadhar | Designation selector (Coach / PE Teacher / TIDC / TIZC) |

**Key design decisions:**
1. **Mock OTP** — no SMS gateway. OTP is generated locally and displayed directly on-screen for the user to read and re-enter (demo/offline-safe verification).
2. **User-set password** — after OTP verification the user creates their own password on the Set Password screen.
3. **Local-first SQLite storage** — every write lands in on-device SQLite first; works fully offline, then syncs to the remote server when internet returns.
4. **Forgot Password (offline-aware)** — user enters their ID. If found in local SQLite (or remote when online), they go straight to a Set New Password screen — no OTP step.
5. **Password hashing** — `bcryptjs` with 10 salt rounds. Only `password_hash` is stored; plaintext password is never persisted.

---

## 2. Screen Flow Map

```
┌──────────────────────┐
│   SelectMode Screen   │
│  [ Athlete ] [ Coach ]│
└──────┬───────────┬────┘
       │           │
  ATHLETE       COACH
       │           │
   ┌───┴───┐   ┌───┴───┐
Register  Login Register  Login
   │        │      │        │
   ▼        ▼      ▼        ▼
Fill Form  Enter  Fill Form  Enter
   │       ID+Pwd     │     ID+Pwd
   ▼                  ▼
AthleteOtpVerify  CoachOtpVerify
   │                  │
   ▼                  ▼
SetPassword        SetPassword
   │                  │
   ▼                  ▼
AthleteHome        CoachHome
```

---

## 3. Registered Navigation Routes (`App.tsx`)

| Route Name | Screen Component | Notes |
|---|---|---|
| `SelectMode` | `SelectModeScreen` | Initial route, no header |
| `AthleteRegister` | `AthleteRegisterScreen` | |
| `AthleteOtpVerify` | `AthleteOtpVerifyScreen` | Back button hidden |
| `AthleteLogin` | `AthleteLoginScreen` | |
| `AthleteHome` | `AthleteHomeScreen` | Post-login, no header |
| `CoachRegister` | `CoachRegisterScreen` | |
| `CoachOtpVerify` | `CoachOtpVerifyScreen` | Back button hidden |
| `CoachLogin` | `CoachLoginScreen` | |
| `CoachHome` | `CoachHomeScreen` | Post-login, no header |
| `SetPassword` | `SetPasswordScreen` | Shared by both roles, back hidden |
| `ForgotPassword` | `ForgotPasswordScreen` | |
| `ResetPassword` | `ResetPasswordScreen` | Back button hidden |
| `TermsAndConditions` | `TermsAndConditionsScreen` | No header |

---

## 4. Athlete Registration Flow

### Screen A1 — Athlete Registration Form
**Route:** `AthleteRegister`

| Field | Validation |
|---|---|
| Full Name | Required, letters + spaces only, 2–50 chars |
| Date of Birth | Required, 3-part picker (Day / Month / Year). Age auto-calculated; shown as chip |
| Gender | Required, segmented control (M / F / O) |
| Phone Number | Optional, 10-digit Indian mobile (starts 6–9), +91 prefix shown |
| ID Type | Required, dropdown: `NSRS` / `APAAR` / `AADHAR` |
| ID Number | Required. NSRS: 4–20 digits. APAAR/AADHAR: exactly 12 digits |
| School / Institution | Required, min 2 chars |
| Consent | Must be checked (links to `TermsAndConditions` screen) |

**Minor path (age < 18):** Guardian block expands with:
- Guardian Name (required)
- Relationship: Father / Mother / Legal Guardian (segmented, required)

**On Submit:**
1. Client-side validation via `react-hook-form` + `yup`.
2. Duplicate ID check against local SQLite `users` table.
3. If existing — re-use the existing `local_id` and generate a new OTP (re-registration path).
4. If new — `createUser()` inserts into `users` table (`is_verified = 0`, `password_hash = NULL`, `sync_status = 'pending'`) and enqueues an `INSERT` into `sync_queue`.
5. `generateMockOTP()` inserts a 6-digit OTP into `otp_verifications` (expires in **10 minutes**) and caches it in memory.
6. Navigate to `AthleteOtpVerify` passing `{ local_id, otp }`.

---

### Screen A2 — Mock OTP Verification
**Route:** `AthleteOtpVerify`

- OTP displayed on-screen in a dashed green banner (demo/offline mode).
- 6-digit segmented input, auto-advances on each digit.
- Countdown timer: **5 minutes** (`OTP_EXPIRY_SECONDS = 300`). "Resend OTP" appears when expired.
- Shake animation + error message on wrong entry.

**On Successful Verification:**
1. `verifyOTP()` matches entered OTP against the DB/in-memory value and checks `expires_at`.
2. `markUserVerified()` sets `users.is_verified = 1`.
3. Navigate to `SetPassword` with `{ local_id, role: 'athlete' }`.

---

### Screen A3 — Set Password
**Route:** `SetPassword` (shared by Athlete & Coach)

| Field | Validation |
|---|---|
| New Password | Required, min 8 chars, ≥1 letter, ≥1 number |
| Confirm Password | Must match New Password |

- Password strength bar (Weak / Medium / Strong, 5-segment).
- Show/hide toggle on both fields.

**On Submit:**
1. `setUserPassword()` → `hashPassword()` via `bcryptjs` (10 salt rounds) → `updateUserPassword()` writes `password_hash` into `users` table and enqueues an `UPDATE` into `sync_queue`.
2. Success screen shown with "Account Created!" and "Go to Login" CTA.

---

## 5. Coach Registration Flow

### Screen C1 — Coach Registration Form
**Route:** `CoachRegister`

| Field | Validation |
|---|---|
| Full Name | Required, letters + spaces only, 2–50 chars |
| Organization Name | Required, min 2 chars |
| Designation | Required, dropdown: `Coach` / `PE Teacher` / `TIDC` / `TIZC` |
| Gender | Required, segmented control (M / F / O) |
| Phone Number | Optional, 10-digit Indian mobile |
| ID Type + Number | Same rules as Athlete |
| Consent | Must be checked |

**On Submit:** Same pipeline as Athlete — inserts into `users` (role = `coach`), generates mock OTP, navigates to `CoachOtpVerify`.

> Note: `registerUser()` in `authService.ts` is **synchronous** — do not `await` it.

### Screen C2 — Mock OTP Verification
**Route:** `CoachOtpVerify` — identical pattern to Screen A2.

### Screen C3 — Set Password
Reuses the shared `SetPassword` screen.

---

## 6. Login Flow

### Screen L1 — Login Form
**Routes:** `AthleteLogin` / `CoachLogin`

| Field | Validation |
|---|---|
| ID Type | Required, dropdown: NSRS / APAAR / AADHAR |
| ID Number | Required, format matches selected ID type |
| Password | Required |

**On Submit (`loginUser()` in `authService.ts`):**
1. `getUserByIdentifier(id_type, id_number, role)` queries local SQLite.
2. If user not found → throws `"Invalid ID or password."`
3. If `password_hash` is NULL → throws `"Account setup incomplete. Please complete registration first."` (user registered but never reached Set Password).
4. `bcrypt.compare(password, password_hash)` — mismatch → throws `"Invalid ID or password."`
5. On success → `navigation.reset({ index: 0, routes: [{ name: 'AthleteHome' }] })` (or `CoachHome`).

**UI extras:**
- `Forgot Password?` link → `ForgotPassword`
- "New user? Register here" link
- Offline badge (via `@react-native-community/netinfo`) — reassures the user login works offline

---

### Screen L2 — Forgot Password
**Route:** `ForgotPassword`

1. User enters ID Type + ID Number.
2. `getUserByIdentifier()` queries local SQLite.
3. Found → navigate to `ResetPassword` with `{ local_id }`.
4. Not found → "No account found with this ID."

> Remote lookup not yet implemented — currently local-only.

### Screen L3 — Reset Password
**Route:** `ResetPassword` — reuses the same UI as `SetPassword`.

1. `setUserPassword()` hashes and saves the new password.
2. Enqueues `UPDATE` into `sync_queue`.
3. Success → "Go to Login".

---

## 7. Home Screens (Post-Login)

### `AthleteHome`
**Route:** `AthleteHome` — `AthleteHomeScreen.tsx`
- Welcome screen with athlete avatar and dashboard placeholder.
- "Log Out" button → `navigation.reset` back to `SelectMode`.

### `CoachHome`
**Route:** `CoachHome` — `CoachHomeScreen.tsx`
- Welcome screen with coach avatar and athlete management placeholder.
- "Log Out" button → `navigation.reset` back to `SelectMode`.

---

## 8. Local Database (SQLite via `@op-engineering/op-sqlite`)

Database file: **`SportsApp.db`** — stored in the app's private storage on-device.
- Android: `/data/data/com.<package>/databases/SportsApp.db`
- iOS: app's Library or Documents folder

Tables are created on first app launch via `createTables()` called in `App.tsx`'s `useEffect`.

> **Important:** `@op-engineering/op-sqlite` returns `QueryResult.rows` as a plain JavaScript `Array<Record<string, any>>`. Access rows with `rows[i]`, **not** `rows.item(i)` (which does not exist in this library).

### Table: `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  local_id          TEXT PRIMARY KEY,       -- UUID generated on-device
  server_id         TEXT,                   -- NULL until synced
  role              TEXT NOT NULL,          -- 'athlete' | 'coach'
  full_name         TEXT NOT NULL,
  dob               TEXT,                   -- athlete only, ISO date (YYYY-MM-DD)
  gender            TEXT NOT NULL,          -- 'M' | 'F' | 'O'
  phone             TEXT,
  id_type           TEXT NOT NULL,          -- 'NSRS' | 'APAAR' | 'AADHAR'
  id_number         TEXT NOT NULL,
  school_or_org     TEXT,
  designation       TEXT,                   -- coach only
  guardian_name     TEXT,                   -- athlete minors only
  guardian_relation TEXT,                   -- athlete minors only
  password_hash     TEXT,                   -- NULL until Set Password completes
  is_verified       INTEGER DEFAULT 0,      -- 0 = unverified, 1 = OTP verified
  consent_given     INTEGER DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  sync_status       TEXT DEFAULT 'pending', -- 'pending' | 'synced' | 'conflict'
  UNIQUE(id_type, id_number)
);
```

### Table: `otp_verifications`
```sql
CREATE TABLE IF NOT EXISTS otp_verifications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_local_id TEXT NOT NULL,
  otp_code      TEXT NOT NULL,
  expires_at    TEXT NOT NULL,             -- ISO timestamp, 10 min from generation
  verified      INTEGER DEFAULT 0
);
```

### Table: `sync_queue`
```sql
CREATE TABLE IF NOT EXISTS sync_queue (
  queue_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type     TEXT NOT NULL,           -- 'users'
  entity_local_id TEXT NOT NULL,
  operation       TEXT NOT NULL,           -- 'INSERT' | 'UPDATE'
  payload         TEXT NOT NULL,           -- JSON snapshot of the row
  created_at      TEXT NOT NULL,
  attempts        INTEGER DEFAULT 0
);
```

---

## 9. Registration Data Write Sequence

```
User submits Register form
  └── registerUser()              ← authService.ts (synchronous)
        ├── getUserByIdentifier() ← duplicate check
        ├── createUser()          ← INSERT into users (password_hash = NULL)
        │                            INSERT into sync_queue (operation = 'INSERT')
        └── generateMockOTP()    ← INSERT into otp_verifications
                                    + cache in memory Map

User verifies OTP
  └── verifyOTP()                 ← checks expires_at, verified flag
  └── markUserVerified()          ← UPDATE users SET is_verified = 1

User sets password
  └── setUserPassword()
        └── hashPassword()        ← bcryptjs, 10 salt rounds
        └── updateUserPassword()  ← UPDATE users SET password_hash = <hash>
                                     INSERT into sync_queue (operation = 'UPDATE')
```

A user is not login-ready until all three stages complete and `password_hash` is non-null.

---

## 10. Password Security

- Library: `bcryptjs` (React Native compatible)
- Salt rounds: `10`
- Only `password_hash` is stored — plaintext password is never persisted anywhere
- Login uses `bcrypt.compare(enteredPassword, storedHash)`
- The same hash is synced to the server; the server must use the same `bcrypt.compare` for verification (do not re-hash on the server side)

---

## 11. Offline → Online Sync Strategy

**Trigger:** `@react-native-community/netinfo` connectivity listener in `syncService.ts`.

```ts
NetInfo.addEventListener(state => {
  if (state.isConnected && state.isInternetReachable) {
    runSyncJob();
  }
});
```

**`runSyncJob()` steps:**
1. `getAllPendingSync()` reads all rows from `sync_queue` ordered by `created_at ASC`.
2. For each item:
   - `INSERT` → `POST /api/users`
   - `UPDATE` → `PATCH /api/users/:id_number`
3. On server success:
   - Update `users` row: set `server_id`, `sync_status = 'synced'`.
   - `removeSyncItem()` deletes the row from `sync_queue`.
4. On failure: increment `attempts`, retry on next connectivity event.

**Conflict handling:** If the same `id_number` was registered on two offline devices before either synced, the server's `UNIQUE(id_type, id_number)` constraint rejects the second insert. Set `sync_status = 'conflict'` locally and surface to the user.

**Local data retention after sync:**
- The `users` row is **kept** locally after sync (marked `synced`) so offline login continues to work.
- Only the `sync_queue` entry is removed, not the `users` row itself.

---

## 12. Project File Structure

```
Sports/
├── App.tsx                          ← Navigator setup, createTables(), syncService init
├── src/
│   ├── db/
│   │   ├── schema.ts                ← getDBConnection(), createTables()
│   │   ├── userRepository.ts        ← createUser, getUserByIdentifier, updateUserPassword, markUserVerified
│   │   ├── otpService.ts            ← generateMockOTP, verifyOTP, getLatestOTP
│   │   └── syncQueueRepository.ts   ← getAllPendingSync, removeSyncItem, markUserSynced
│   ├── services/
│   │   ├── authService.ts           ← registerUser, loginUser, setUserPassword, hashPassword
│   │   └── syncService.ts           ← NetInfo listener, runSyncJob
│   ├── screens/
│   │   ├── athlete/
│   │   │   ├── AthleteRegisterScreen.tsx
│   │   │   ├── AthleteOtpVerifyScreen.tsx  ← OTP_EXPIRY_SECONDS = 300
│   │   │   ├── AthleteLoginScreen.tsx
│   │   │   └── AthleteHomeScreen.tsx       ← post-login placeholder
│   │   ├── coach/
│   │   │   ├── CoachRegisterScreen.tsx
│   │   │   ├── CoachOtpVerifyScreen.tsx    ← OTP_EXPIRY_SECONDS = 300
│   │   │   ├── CoachLoginScreen.tsx
│   │   │   └── CoachHomeScreen.tsx         ← post-login placeholder
│   │   └── shared/
│   │       ├── SelectModeScreen.tsx
│   │       ├── SetPasswordScreen.tsx
│   │       ├── ForgotPasswordScreen.tsx
│   │       ├── ResetPasswordScreen.tsx
│   │       └── TermsAndConditionsScreen.tsx
│   └── components/
│       └── auth/
│           └── OfflineBadge.tsx
```

---

## 13. Key Libraries

| Purpose | Library |
|---|---|
| Local SQLite | `@op-engineering/op-sqlite` ^17.1.3 |
| Connectivity | `@react-native-community/netinfo` |
| Navigation | `@react-navigation/native` + `native-stack` |
| Forms & validation | `react-hook-form` + `yup` |
| Password hashing | `bcryptjs` |
| UUID generation | `uuid` + `react-native-get-random-values` |
| Icons | `lucide-react-native` |

---

## 14. Validation Rules Summary

| Field | Rule |
|---|---|
| Full Name | Letters + spaces only, 2–50 chars |
| DOB | Valid calendar date, not in future. Age auto-calculated |
| Guardian block | Shown and required only if `age < 18` |
| Phone | Optional, exactly 10 digits, starts with 6–9 (Indian mobile) |
| AADHAR / APAAR | Exactly 12 digits |
| NSRS | 4–20 digits |
| ID uniqueness | Checked against local SQLite `UNIQUE(id_type, id_number)` constraint |
| Mock OTP | 6 digits, expires in 10 min (DB), 5 min countdown on screen. Resend regenerates locally |
| Password | Min 8 chars, ≥1 letter + ≥1 number |
| Confirm Password | Must match Password field |
| Consent | Must be `true` to submit |

---

## 15. Known Bugs Fixed

| Bug | Root Cause | Fix Applied |
|---|---|---|
| "Invalid ID or password" after registration | OTP screen timer was 30s — too short to complete flow, `password_hash` stayed NULL | `OTP_EXPIRY_SECONDS` changed from `30` → `300` in both OTP screens; DB `expires_at` extended to 10 min |
| "undefined is not a function" on registration | `result.rows.item(i)` called on a plain JS array — `@op-engineering/op-sqlite` does not have `.item()` | Replaced all `.item(i)` with `[i]` in `userRepository.ts`, `otpService.ts`, `syncQueueRepository.ts` |
| Login crashes after success | `AthleteHome` / `CoachHome` routes were missing from the navigator | Created `AthleteHomeScreen.tsx`, `CoachHomeScreen.tsx` and registered both in `App.tsx` |

---

## 16. Open Questions for Product/Backend

- [ ] Remote API endpoint structure for sync (`/api/users` POST/PATCH) — not yet implemented.
- [ ] Forgot Password remote fallback — currently local-only; remote lookup not yet implemented.
- [ ] Exact validation format for APAAR / NSRS IDs (backend spec).
- [ ] Minimum age floor for athlete registration (e.g., ≥ 5 years)?
- [ ] Conflict-resolution UX when two offline devices register the same ID before either syncs.
- [ ] Should School / Organization be free text or pull from a synced master list?
