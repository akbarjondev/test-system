# Story 7.3: Mini App Auth Flow & Home Screen

Status: review

## Story

As a student,
I want to be silently authenticated when I open the Mini App,
So that I land directly on a home screen without any login form.

## Acceptance Criteria

1. **Given** a student opens the Mini App inside Telegram,
   **When** the app initializes,
   **Then** it reads `window.Telegram.WebApp.initData` and calls `POST /api/auth/telegram-miniapp`
   **And** the returned JWT is stored in `sessionStorage` (cleared when Telegram closes the app)
   **And** the student is shown a home screen displaying their name: "Salom, {fullName}!"

2. **Given** the auth API returns an error (network failure or invalid initData),
   **When** the app handles the response,
   **Then** it shows a user-friendly error screen in Uzbek: "Autentifikatsiya xatosi. Iltimos qayta urinib ko'ring."
   **And** a retry button is visible

3. **Given** the student is authenticated,
   **When** the home screen renders,
   **Then** it shows a "Testlarga o'tish" button that navigates to the tests list screen

## Tasks / Subtasks

- [x] Task 1: Create API client utility (AC: #1)
  - [x] Create `apps/mini-app/src/lib/api.ts` with a `apiFetch` helper that reads JWT from `sessionStorage` and sets `Authorization: Bearer <token>` header
  - [x] Export constants: `API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"`

- [x] Task 2: Create auth service (AC: #1, #2)
  - [x] Create `apps/mini-app/src/services/auth.ts`
  - [x] Export `async function authenticate(): Promise<{ token: string; user: { id: string; fullName: string; telegramId: string } }>`
  - [x] Read `WebApp.initData` from `@twa-dev/sdk`
  - [x] POST `{ initData }` to `${API_URL}/api/auth/telegram-miniapp`
  - [x] On success: store token in `sessionStorage.setItem("token", token)`, return user
  - [x] On failure: throw error for caller to handle

- [x] Task 3: Create app state / routing (AC: #1, #2, #3)
  - [x] Use simple screen-based state in `App.tsx` — no router library needed for this story (4 screens total across all stories)
  - [x] State: `screen: "loading" | "error" | "home" | "tests-list" | "test-unlock" | "test-taking" | "results"`
  - [x] On mount: call `authenticate()`, set screen to "home" on success, "error" on failure
  - [x] Store `user` in state (fullName needed for home screen greeting)

- [x] Task 4: Create LoadingScreen component (AC: #1)
  - [x] Create `apps/mini-app/src/screens/LoadingScreen.tsx`
  - [x] Show a centered spinner or "Yuklanmoqda..." text using Telegram theme colors

- [x] Task 5: Create ErrorScreen component (AC: #2)
  - [x] Create `apps/mini-app/src/screens/ErrorScreen.tsx`
  - [x] Display error message: "Autentifikatsiya xatosi. Iltimos qayta urinib ko'ring."
  - [x] Show "Qayta urinish" button that calls `onRetry` prop (re-triggers auth)

- [x] Task 6: Create HomeScreen component (AC: #1, #3)
  - [x] Create `apps/mini-app/src/screens/HomeScreen.tsx`
  - [x] Display greeting: `"Salom, {fullName}!"`
  - [x] Render "Testlarga o'tish" button — calls `onNavigate("tests-list")` prop
  - [x] Style with Telegram theme CSS variables: `--tg-bg-color`, `--tg-text-color`, `--tg-button-color`

- [x] Task 7: Wire up App.tsx (AC: #1, #2, #3)
  - [x] Render correct screen based on state
  - [x] Retry: re-call authenticate() on retry button press
  - [x] Navigation: update screen state on "Testlarga o'tish" press

## Dev Notes

### File Locations — Create These

| File | Purpose |
|------|---------|
| `apps/mini-app/src/lib/api.ts` | API fetch helper with auth header |
| `apps/mini-app/src/services/auth.ts` | initData → JWT authentication |
| `apps/mini-app/src/screens/LoadingScreen.tsx` | Loading state UI |
| `apps/mini-app/src/screens/ErrorScreen.tsx` | Error + retry UI |
| `apps/mini-app/src/screens/HomeScreen.tsx` | Authenticated home screen |
| `apps/mini-app/src/App.tsx` | Root with screen state machine |

### Session Storage Key Convention

Use `"token"` as the key: `sessionStorage.setItem("token", token)`. The `apiFetch` helper reads it with `sessionStorage.getItem("token")`. `sessionStorage` is cleared automatically when Telegram closes the WebApp — no manual cleanup needed.

### API Client Pattern

```ts
// src/lib/api.ts
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = sessionStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? "Request failed"), { status: res.status, code: body.code });
  }
  return res.json();
}
```

### App State Machine Pattern

```tsx
// App.tsx
type Screen = "loading" | "error" | "home" | "tests-list";

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [user, setUser] = useState<{ fullName: string } | null>(null);

  const doAuth = useCallback(async () => {
    setScreen("loading");
    try {
      const result = await authenticate();
      setUser(result.user);
      setScreen("home");
    } catch {
      setScreen("error");
    }
  }, []);

  useEffect(() => { doAuth(); }, [doAuth]);

  if (screen === "loading") return <LoadingScreen />;
  if (screen === "error") return <ErrorScreen onRetry={doAuth} />;
  if (screen === "home") return <HomeScreen user={user!} onNavigate={setScreen} />;
  // future screens...
}
```

### Styling Convention

Use inline styles or Tailwind classes with `--tg-*` CSS variables (set in Story 7.1):
```tsx
<div style={{ backgroundColor: "var(--tg-bg-color)", color: "var(--tg-text-color)" }}>
```
Or define Tailwind `extend.colors` to reference these vars.

### VITE_API_URL Environment Variable

Create `apps/mini-app/.env.example`:
```
VITE_API_URL=http://localhost:5000
```
Vite requires env vars to be prefixed with `VITE_` to be available in client code.

### References

- [Source: apps/mini-app/src/lib/api.ts] — Created in this story, used by all subsequent stories
- [Source: _bmad-output/implementation-artifacts/7-2-telegram-initdata-auth-api-endpoint.md] — Auth endpoint spec
- [Source: apps/telegram-bot/src/bot.ts lines 44–63] — API helper pattern (similar pattern adapted for browser)

## Dev Agent Record

### Agent Model Used
Claude Haiku 4.5

### Debug Log References
- TypeScript compilation: ✅ Zero errors
- Dev server startup: ✅ Successful on port 5174
- Import validation: ✅ All imports correctly resolved

### Completion Notes List
✅ **AC#1 Complete**: App initializes with `WebApp.initData`, calls `/api/auth/telegram-miniapp`, stores JWT in `sessionStorage`, shows home screen with personalized greeting
✅ **AC#2 Complete**: Error handling with Uzbek message "Autentifikatsiya xatosi. Iltimos qayta urinib ko'ring." and functional retry button
✅ **AC#3 Complete**: HomeScreen displays "Testlarga o'tish" button with navigation callback to tests-list screen

All 7 tasks completed successfully. App implements clean state machine pattern with 3 screens: Loading, Error, Home. Auth service handles WebApp initData and session storage. API client includes Bearer token injection.

### File List
- `apps/mini-app/src/lib/api.ts` — Created: API client with Bearer token authentication
- `apps/mini-app/src/services/auth.ts` — Created: Telegram initData authentication service
- `apps/mini-app/src/screens/LoadingScreen.tsx` — Created: Loading state UI with Telegram theme
- `apps/mini-app/src/screens/ErrorScreen.tsx` — Created: Error handling UI with retry button
- `apps/mini-app/src/screens/HomeScreen.tsx` — Created: Authenticated home screen with navigation
- `apps/mini-app/src/App.tsx` — Modified: Updated to implement state machine and screen routing
- `apps/mini-app/.env.example` — Created: VITE_API_URL environment variable example
