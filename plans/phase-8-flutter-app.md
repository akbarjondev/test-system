# Phase 8 — Flutter Student App (MVP)

**Goal:** A cross-platform mobile app (iOS + Android) for students — login, join a class, browse and solve tests.
**Depends on:** Phase 4 (hardened API), Phase 6 (deployed API accessible over HTTPS)
**Blocks:** Nothing — parallel path to Telegram bot for student access.

---

## Context

The Telegram bot (Phase 3) is the first student channel. The Flutter app is the second, native channel — better UX for mobile, works offline-first, and is not dependent on Telegram. MVP scope is intentionally minimal: auth, class/test browsing, and taking tests.

**MVP scope (what's IN):**
- Login (existing students registered via bot or admin)
- Browse available tests
- Take a timed test (question by question)
- See results after submission

**Out of scope for MVP:**
- In-app registration (admin creates accounts, or Telegram bot handles registration)
- Push notifications
- Offline test-taking
- Leaderboards, statistics
- Dark mode
- Tablet layout

---

## Tasks

### 8.1 — Bootstrap Flutter project
**Directory:** `apps/flutter-student/` (new)

- Create Flutter project: `flutter create --org uz.testsystem --project-name test_system_student apps/flutter-student`
- Minimum SDK: Flutter 3.x, Dart 3.x
- Add to Turborepo as a non-JS app (add a `build` script stub so `turbo run build` doesn't fail)
- Folder structure:
  ```
  lib/
    core/         # API client, storage, constants
    features/
      auth/       # login screen + state
      tests/      # tests list + take-test + results
    shared/       # widgets, theme, utils
  ```
- State management: **Riverpod** (simple, testable, scales well)
- HTTP: **Dio** (interceptors for auth token injection + error handling)
- Local storage: **flutter_secure_storage** (JWT token)
- Navigation: **go_router**

---

### 8.2 — API client & auth interceptor
**Files:** `lib/core/api/api_client.dart`, `lib/core/api/auth_interceptor.dart`

- Dio instance pointed at `API_BASE_URL` (from compile-time env or flavor config)
- `AuthInterceptor`: reads JWT from `flutter_secure_storage`, injects `Authorization: Bearer <token>` header on every request
- On 401 response: clear stored token, redirect to login screen
- Error handling: map HTTP status codes to typed `AppException` (network error, unauthorized, not found, server error)

---

### 8.3 — Login screen
**Files:** `lib/features/auth/`

- Simple screen: email + password fields, "Kirish" button
- Calls `POST /api/auth/login`
- On success: store JWT in `flutter_secure_storage`, navigate to tests list
- On error: show inline error message in Uzbek
- Auto-login: on app start, check if token exists → navigate directly to tests list (skip login)
- Logout: clear token, return to login

---

### 8.4 — Tests list screen
**Files:** `lib/features/tests/tests_list/`

- Calls `GET /api/tests` with student's JWT
- Displays tests in a scrollable list/card layout:
  - Test title
  - Time limit (e.g., "30 daqiqa")
  - Number of questions (if available in API response)
  - Availability status badge (available now / scheduled / closed)
- Pull-to-refresh
- Pagination (load more on scroll)
- Empty state: "Hozircha testlar yo'q"
- Error state: retry button

---

### 8.5 — Take test screen
**Files:** `lib/features/tests/take_test/`

This is the core screen. Use a `PageView` or step-by-step navigation.

**Flow:**
1. Tap a test → confirmation bottom sheet: "Testni boshlash? (X daqiqa)" with Start button
2. Call `POST /api/tests/:testId/attempts/start`
3. Show questions one at a time:
   - Question text at top
   - 4 option tiles (tap to select, highlighted when selected)
   - "Keyingi" (Next) button — calls `POST /api/attempts/:attemptId/answers` then advances
   - Progress indicator: "5 / 20"
   - Countdown timer in header (MM:SS, turns red under 1 minute)
4. On last question: "Yakunlash" (Submit) button → confirmation dialog → `POST /api/attempts/:attemptId/submit`
5. Navigate to results screen

**Timer enforcement:**
- `Timer.periodic` updates countdown every second
- On expiry: auto-submit with a toast "Vaqt tugadi!"
- Interrupted session: on app resume, call `GET /api/tests/:testId/attempts/current` — if active attempt found, resume from where the student left off

---

### 8.6 — Results screen
**Files:** `lib/features/tests/results/`

- Calls `GET /api/attempts/:attemptId/results`
- Shows:
  - Big score display: "18 / 20 ball"
  - Percentage: "90%"
  - Per-question summary list: ✅ correct / ❌ incorrect / ⬜ skipped
  - Expandable rows: show student's answer, correct answer, explanation
- "Testlar ro'yxatiga qaytish" button → back to tests list

---

### 8.7 — API additions needed
**File:** `apps/api/src/routes/auth.ts` or `apps/api/src/routes/users.ts`

The Flutter app uses the same API as the bot. No new endpoints needed for MVP — all required endpoints already exist or will exist after Phase 2/4:
- `POST /api/auth/login` ✅
- `GET /api/tests` ✅
- `POST /api/tests/:testId/attempts/start` ✅
- `GET /api/tests/:testId/attempts/current` ✅
- `POST /api/attempts/:attemptId/answers` ✅
- `POST /api/attempts/:attemptId/submit` ✅
- `GET /api/attempts/:attemptId/results` ✅

One addition that improves app UX:
- `GET /api/tests/:testId` should include `questionCount` in the response (count of questions without exposing the answers) — add this to the API response in Phase 2 or 4

---

### 8.8 — Flavors / environment config
**Files:** `apps/flutter-student/lib/core/config/`

- Two flavors: `development` (local API) and `production` (deployed API)
- Store `API_BASE_URL` per flavor using `--dart-define` at build time
- Avoid hardcoding any URLs in source code

---

### 8.9 — Build & distribution
**Files:** `apps/flutter-student/`

- Android: generate release APK / AAB (`flutter build appbundle --flavor production`)
- iOS: generate IPA (requires macOS + Apple Developer account)
- For MVP: distribute Android APK directly (no Play Store required)
- Document build steps in `apps/flutter-student/README.md`
- Add Flutter build to CI after Phase 6 CI is stable (optional for MVP, required for production release)

---

## Definition of Done

- [ ] App runs on Android (physical device or emulator)
- [ ] Student can log in with email + password
- [ ] Tests list loads and displays correctly
- [ ] Student can take a test question by question
- [ ] Countdown timer works and auto-submits on expiry
- [ ] Results screen shows score and per-question breakdown
- [ ] Token persists across app restarts (no re-login on every open)
- [ ] Interrupted test can be resumed after app restart
- [ ] All UI text is in Uzbek
- [ ] APK can be built and distributed for testing
