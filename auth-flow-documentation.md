# Athlete / Coach App — Auth Flow Documentation (Offline-First)
**Platform:** React Native (Expo / Metro bundler)
**Scope:** User Mode Selection → Registration → Mock OTP → Set Password → Login → Forgot Password
**Core Constraint:** App must be **fully functional offline**. All auth data is written to a local SQL (SQLite) database first, then synced to the remote SQL database when connectivity is available.

---

## 1. Overview

The app supports two distinct user modes, each with its own registration and login flow:

| Mode | Identity Field | Extra Logic |
|---|---|---|
| **Athlete** | NSRS / APAAR / Aadhar (mock OTP) | Age check (DOB → auto-calc age). If age < 18, guardian details are required |
| **Coach** | NSRS / APAAR / Aadhar (mock OTP) | Designation selector (Coach / PE Teacher / TIDC / TIZC) |

**Key changes in this revision:**
1. **Mock OTP** — no real SMS gateway. The OTP is generated locally and **displayed directly on the screen** for the user to read and re-enter (demo/offline-safe verification).
2. **User-set password** — after OTP verification, the user is taken to a **Set Password** screen inside the app and creates their own password (no auto-generated password sent via SMS).
3. **Local-first SQL storage** — SQLite on-device; every write (registration, password, profile edits) lands in the local DB first, works fully offline, then syncs to the remote server DB when internet is back.
4. **Forgot Password (offline-aware)** — user enters their ID (NSRS/APAAR/Aadhar). If that ID exists in the DB (local or remote), they go straight to a **Set New Password** screen — no OTP/SMS step required.

---

## 2. Screen Flow Map

```
┌─────────────────────┐
│   Splash / Landing   │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────┐
│   Select User Mode Screen    │
│   [ Athlete ]   [ Coach ]    │
└──────┬────────────────┬─────┘
       │                │
       ▼                ▼
 ATHLETE FLOW      COACH FLOW
       │                │
       ▼                ▼
┌─────────────┐   ┌─────────────┐
│ New user?    │   │ New user?    │
│ Register     │   │ Register     │
│ or Login     │   │ or Login     │
└──┬───────┬──┘   └──┬───────┬──┘
   │       │         │       │
Register Login    Register Login
   │       │         │       │
   ▼       ▼         ▼       ▼
Fill Form  Enter ID+  Fill Form  Enter ID+
   │       Password      │       Password
   ▼                     ▼
Mock OTP                Mock OTP
Screen                  Screen
   │                     │
   ▼                     ▼
Set Password           Set Password
Screen                  Screen
   │                     │
   ▼                     ▼
Home/Dashboard        Home/Dashboard
```

---

## 3. Athlete Registration Flow

### Screen A1 — Athlete Registration Form
**Route:** `AthleteRegister`

| Field | Type | Component | Validation |
|---|---|---|---|
| Full Name | text | `TextInput` | Required, alphabets + spaces only |
| Date of Birth | date picker | `DateTimePicker` (spinner/calendar modal) | Required. On select → auto-calculate **Age**, shown as read-only chip below field |
| Gender | select | Segmented control / Radio group | Required |
| Phone Number | numeric text | `TextInput` (10-digit, +91 prefix) | Required, 10 digits |
| ID Type + Number | select + text | Dropdown (`NSRS / APAAR / Aadhar`) + `TextInput` | Required, unique — checked against **local SQLite first**, then remote if online |
| School / Institution | text/autocomplete | `TextInput` or searchable dropdown | Required |
| Consent Checkbox | checkbox | `Checkbox` + T&C link (modal) | Must be checked |

**Conditional Logic — Guardian Block (Minor Path)**
- Triggered when calculated `age < 18`.
- Expands **"Guardian Details"** section below DOB:

| Field | Type | Validation |
|---|---|---|
| Guardian Name | text | Required |
| Relationship to Athlete | dropdown (Father/Mother/Legal Guardian) | Required |

**On Submit (`Register` button):**
1. Client-side validation.
2. **Duplicate ID check** — query local SQLite `users` table for the entered ID. If online, also check remote (non-blocking; local check is source of truth for offline use).
3. Insert a new row into local SQLite `users` table with `sync_status = 'pending'`, `is_verified = 0`.
4. Generate a **mock OTP** (4–6 digit random number) and store it against this registration attempt (in-memory or a local `otp_verifications` table with an expiry timestamp).
5. Navigate to **Screen A2 (Mock OTP Verification)**.

---

### Screen A2 — Mock OTP Verification (Athlete)
**Route:** `AthleteOtpVerify`

**UI Elements:**
- Header: "Verify your [NSRS/APAAR/Aadhar]"
- **Mock OTP banner** (clearly styled as a demo/dev aid, e.g. dashed border, info-color background):
  `Your OTP: 4 8 2 1 9 6` — displayed directly on screen (no SMS dispatch)
- 6-digit OTP input (segmented boxes, auto-focus next box) for the user to **re-type** the displayed OTP
- Countdown timer (e.g. `00:30`) + "Resend OTP" link (regenerates a new mock OTP locally)
- `Verify` button (disabled until 6 digits entered)
- Error state: shake animation + "Incorrect OTP, please check the code shown above"

**On Successful Verification:**
1. Match entered OTP against the locally stored value.
2. Update local `users` row: `is_verified = 1`.
3. Navigate to **Screen A3 (Set Password)** — no password is generated by the system; the user creates their own.

---

### Screen A3 — Set Password
**Route:** `SetPassword` (shared by Athlete & Coach)

| Field | Type | Validation |
|---|---|---|
| New Password | password `TextInput` (show/hide toggle) | Min 8 chars, at least 1 letter + 1 number (adjust per your policy) |
| Confirm Password | password `TextInput` | Must match New Password |

**UI Elements:**
- Password strength indicator (weak/medium/strong bar)
- `Set Password & Continue` button — disabled until both fields valid and matching

**On Submit:**
1. Hash the password locally (e.g., `bcrypt`/`expo-crypto` — never store plaintext, even offline).
2. Update local SQLite `users` row: store `password_hash`, set `sync_status = 'pending'`.
3. Show success state:
   - Icon: account created successfully
   - CTA: `Go to Login` (or auto-login and route straight to Home — your choice)
4. If device is online → trigger background sync immediately (see Section 8). If offline → record stays queued locally.

---

## 4. Coach Registration Flow

### Screen C1 — Coach Registration Form
**Route:** `CoachRegister`

| Field | Type | Component | Validation |
|---|---|---|---|
| Coach Name | text | `TextInput` | Required |
| Organization Name | text/autocomplete | `TextInput` or searchable dropdown | Required |
| Designation | select | Dropdown/Segmented: `Coach` / `PE Teacher` / `TIDC` / `TIZC` | Required |
| Gender | select | Segmented control / Radio group | Required |
| Phone Number | numeric text | `TextInput` (10-digit, +91 prefix) | Required |
| ID Type + Number | select + text | Dropdown (`NSRS / APAAR / Aadhar`) + `TextInput` | Required, unique (local-first check) |
| Consent Checkbox | checkbox | `Checkbox` + T&C link | Must be checked |

**On Submit:** same pipeline as Athlete — insert into local SQLite `users` (role = `coach`), generate mock OTP, navigate to OTP screen.

### Screen C2 — Mock OTP Verification (Coach)
**Route:** `CoachOtpVerify` — identical pattern to **Screen A2** (mock OTP displayed on screen, re-typed to verify).

### Screen C3 — Set Password
Reuses the shared **Screen A3 / `SetPassword`** component.

---

## 5. Login Flow (Shared Pattern — Athlete & Coach)

### Screen L1 — Login Form
**Route:** `AthleteLogin` / `CoachLogin`

| Field | Type | Component |
|---|---|---|
| ID Type + Number | select + text | Dropdown + `TextInput` |
| Password | password text | `TextInput` (secure entry, show/hide icon) |

**On Submit:**
1. **Always check local SQLite first**: query `users` table by ID, verify password hash.
   - Match found & valid → login succeeds **even fully offline**.
2. If local lookup fails and device is online, optionally fall back to a remote check (covers a second device / reinstall scenario) — on success, pull that user's record down into local SQLite for future offline use.
3. Failure → inline error: "Invalid ID or password."

**UI Elements:**
- `Login` button (primary, full-width)
- `Forgot Password?` link
- Mode indicator: "Logging in as **Athlete**" / "**Coach**"
- "New user? Register here" link
- Small **offline indicator badge** (e.g., a subtle "Offline mode" pill) if `NetInfo` reports no connection — reassures the user login/registration still works.

---

### Screen L2 — Forgot Password
**Route:** `ForgotPassword`

**Flow (no OTP — direct DB lookup):**
1. Screen: single input — **ID Type + ID Number** (`NSRS / APAAR / Aadhar`)
2. `Check & Reset` button
3. On submit:
   - Query **local SQLite** `users` table for that ID.
   - If not found locally *and* device is online, query the remote DB as a fallback (handles a fresh install where local cache is empty).
   - **If found (local or remote):** navigate directly to **Screen L3 (Set New Password)** — no OTP step, per requirement.
   - **If not found anywhere:** inline error — "No account found with this ID."

### Screen L3 — Set New Password
**Route:** `ResetPassword` — reuses the same UI as **Screen A3 (Set Password)**.

**On Submit:**
1. Hash new password locally.
2. Update local `users` row (`password_hash`, `sync_status = 'pending'`, `updated_at = now`).
3. If online → sync immediately to remote DB.
4. Success screen → `Go to Login`.

---

## 6. Local Database Design (SQLite)

Use `expo-sqlite` (works fully offline, no native linking headaches in Expo/Metro).

### Table: `users`
```sql
CREATE TABLE users (
  local_id          TEXT PRIMARY KEY,       -- UUID generated on-device
  server_id         TEXT,                   -- NULL until synced; filled by server after first sync
  role              TEXT NOT NULL,          -- 'athlete' | 'coach'
  full_name         TEXT NOT NULL,
  dob               TEXT,                   -- athlete only, ISO date
  gender            TEXT NOT NULL,
  phone             TEXT NOT NULL,
  id_type           TEXT NOT NULL,          -- 'NSRS' | 'APAAR' | 'AADHAR'
  id_number         TEXT NOT NULL UNIQUE,
  school_or_org     TEXT,                   -- school (athlete) / organization (coach)
  designation       TEXT,                   -- coach only
  guardian_name     TEXT,                   -- athlete minors only
  guardian_relation TEXT,                   -- athlete minors only
  password_hash     TEXT,                   -- NULL until Set Password step completes
  is_verified       INTEGER DEFAULT 0,      -- 0/1, mock OTP verified
  consent_given     INTEGER DEFAULT 0,      -- 0/1
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  sync_status       TEXT DEFAULT 'pending'  -- 'pending' | 'synced' | 'conflict'
);
```

### Table: `sync_queue`
Tracks every local write that hasn't been pushed to the server yet.
```sql
CREATE TABLE sync_queue (
  queue_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type     TEXT NOT NULL,     -- 'users'
  entity_local_id TEXT NOT NULL,
  operation       TEXT NOT NULL,     -- 'INSERT' | 'UPDATE'
  payload         TEXT NOT NULL,     -- JSON snapshot of the row at write-time
  created_at      TEXT NOT NULL,
  attempts        INTEGER DEFAULT 0
);
```

### Table: `otp_verifications` (mock OTP, ephemeral)
```sql
CREATE TABLE otp_verifications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_local_id TEXT NOT NULL,
  otp_code      TEXT NOT NULL,
  expires_at    TEXT NOT NULL,
  verified      INTEGER DEFAULT 0
);
```

### Remote (server) SQL schema
Mirrors `users` (minus `local_id`/`sync_status`, using `server_id` as its own primary key). Recommended: Postgres or MySQL, with `id_number` as a `UNIQUE` constraint to prevent duplicate registrations across devices.

---

## 7. Password Security Note
Even though the app works offline, **never store plaintext passwords** in SQLite.
- Use `expo-crypto` (SHA-256 with a per-user salt) or a proper `bcrypt` port for React Native.
- Store only `password_hash` + `salt` locally; the same hash is what gets synced to the server (server should not re-hash a hash — coordinate the chosen algorithm across client/server so verification stays consistent).

---

## 8. Offline → Online Sync Strategy

**Trigger:** Listen for connectivity changes using `@react-native-community/netinfo`.

```js
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    runSyncJob();
  }
});
```

**`runSyncJob()` steps:**
1. Read all rows from `sync_queue` (oldest first).
2. For each queued item:
   - `INSERT` → `POST` the payload to the remote API (`/api/users`).
   - `UPDATE` → `PATCH /api/users/:id_number` (match by `id_number`, since `server_id` may not exist yet on first sync).
3. On success response:
   - Update the corresponding `users` row: set `server_id`, `sync_status = 'synced'`.
   - Delete the row from `sync_queue`.
4. On failure (network drop mid-sync, server validation error):
   - Leave the queue item in place, increment `attempts`, retry on next connectivity event / app foreground.
5. **"Vanish local data" requirement** — once a record's `sync_status = 'synced'` is confirmed and server acknowledges storage, you have two options depending on how strict "vanish" should be:
   - **Option A (recommended):** keep the row in local SQLite but marked `synced` — needed so the user can still **log in offline** afterward (deleting it would break offline login). Only the `sync_queue` entry is removed, not the `users` row itself.
   - **Option B (strict "vanish"):** if the literal requirement is that no personal data should remain on-device after a successful sync, delete the local `users` row post-sync and rely entirely on the server for future logins (this breaks offline login for that user afterward — confirm this tradeoff is intended before implementing).

> **Recommendation:** Clarify with your team which interpretation is correct — Option A preserves your "works fully offline" constraint for returning users; Option B is a stricter data-retention interpretation of "vanish."

**Conflict handling:** If the same `id_number` was somehow registered on two offline devices before either synced, the server's `UNIQUE` constraint on `id_number` will reject the second insert — surface this as `sync_status = 'conflict'` and prompt the user to contact support / re-verify.

---

## 9. Component Reuse Recommendations (React Native)

```
/components
  /auth
    IdTypeSelector.jsx       // dropdown: NSRS / APAAR / Aadhar
    MockOtpBanner.jsx        // displays the generated OTP on-screen
    OtpInput.jsx             // 6-digit boxed OTP re-entry + timer
    PhoneInput.jsx           // +91 prefixed numeric input
    ConsentCheckbox.jsx      // checkbox + T&C modal trigger
    GenderSelector.jsx       // segmented control
    GuardianFields.jsx       // conditional block for minors
    SetPasswordForm.jsx      // shared by registration + reset-password
    OfflineBadge.jsx         // small "Offline mode" indicator pill
/screens
  /athlete
    AthleteRegisterScreen.jsx
    AthleteOtpScreen.jsx
    AthleteLoginScreen.jsx
  /coach
    CoachRegisterScreen.jsx
    CoachOtpScreen.jsx
    CoachLoginScreen.jsx
  /shared
    SelectModeScreen.jsx
    SetPasswordScreen.jsx
    ForgotPasswordScreen.jsx
    ResetPasswordScreen.jsx
/db
  schema.js                  // CREATE TABLE statements, run on first app launch
  userRepository.js          // insert/query/update helpers for `users`
  syncQueueRepository.js     // enqueue/dequeue helpers
  otpService.js              // mock OTP generate/verify
/services
  syncService.js             // NetInfo listener + runSyncJob()
  authService.js              // login/register orchestration (local-first, remote fallback)
```

**Suggested libraries:**
- Local DB: `expo-sqlite`
- Connectivity: `@react-native-community/netinfo`
- Navigation: `@react-navigation/native` + `native-stack`
- Forms/validation: `react-hook-form` + `yup`/`zod`
- Date picker: `@react-native-community/datetimepicker`
- Password hashing: `expo-crypto` or `bcryptjs` (RN-compatible build)
- Secure token/session storage: `expo-secure-store`

---

## 10. Validation Rules Summary

| Field | Rule |
|---|---|
| DOB → Age | `age = today.getFullYear() - dob.getFullYear()` (adjust if birthday hasn't occurred yet this year) |
| Guardian block | Shown only if `age < 18`; both fields required in that case |
| Phone | Exactly 10 digits, numeric, Indian mobile pattern (starts 6–9) |
| Aadhar | 12 digits, numeric |
| APAAR/NSRS ID | Confirm exact format with backend spec |
| Mock OTP | 6 digits, generated on-device, expiry ~5 min, "Resend" regenerates locally (no network call) |
| Password | Min 8 chars, ≥1 letter + ≥1 number (tune to your policy); confirm-match required |
| Consent | Boolean, must be `true` to submit |
| ID uniqueness | Checked against local SQLite always; against remote too when online |

---

## 11. Open Questions for Product/Backend

- [ ] Confirm which "vanish local data" interpretation applies (Section 8, Option A vs B) — this materially affects whether offline login keeps working after a sync.
- [ ] Exact validation format for APAAR / NSRS IDs.
- [ ] Should "School/Institution" and "Organization Name" be free text or pull from a synced master list (which itself would need to be cached locally for offline use)?
- [ ] Minimum age floor for athlete registration (e.g., must be ≥ 5 years)?
- [ ] Password hashing algorithm — confirm same algorithm/format is used client-side and server-side so a synced hash remains verifiable both ways.
- [ ] Conflict-resolution UX when two offline devices register the same ID before either syncs.
