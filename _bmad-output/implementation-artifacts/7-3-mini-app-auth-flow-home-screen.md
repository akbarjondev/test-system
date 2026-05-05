# Story 7.3: Mini App Auth Flow & Home Screen

Status: ready-for-dev

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

- [ ] Task 1: Create API client utility (AC: #1)
  - [ ] Create `apps/mini-app/src/lib/api.ts` with a `apiFetch` helper that reads JWT from `sessionStorage` and sets `Authorization: Bearer <token>` header
  - [ ] Export constants: `API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"`

- [ ] Task 2: Create auth service (AC: #1, #2)
  - [ ] Create `apps/mini-app/src/services/auth.ts`
  - [ ] Export `async function authenticate(): Promise<{ token: string; user: { id: string; fullName: string; telegramId: string } }>`
  - [ ] Read `WebApp.initData` from `@twa-dev/sdk`
  - [ ] POST `{ initData }` to `${API_URL}/api/auth/telegram-miniapp`
  - [ ] On success: store token in `sessionStorage.setItem("token", token)`, return user
  - [ ] On failure: throw error for caller to handle

- [ ] Task 3: Create app state / routing (AC: #1, #2, #3)
  - [ ] Use simple screen-based state in `App.tsx` — no router library needed for this story (4 screens total across all stories)
  - [ ] State: `screen: "loading" | "error" | "home" | "tests-list" | "test-unlock" | "test-taking" | "results"`
  - [ ] On mount: call `authenticate()`, set screen to "home" on success, "error" on failure
  - [ ] Store `user` in state (fullName needed for home screen greeting)

- [ ] Task 4: Create LoadingScreen component (AC: #1)
  - [ ] Create `apps/mini-app/src/screens/LoadingScreen.tsx`
  - [ ] Show a centered spinner or "Yuklanmoqda..." text using Telegram theme colors

- [ ] Task 5: Create ErrorScreen component (AC: #2)
  - [ ] Create `apps/mini-app/src/screens/ErrorScreen.tsx`
  - [ ] Display error message: "Autentifikatsiya xatosi. Iltimos qayta urinib ko'ring."
  - [ ] Show "Qayta urinish" button that calls `onRetry` prop (re-triggers auth)

- [ ] Task 6: Create HomeScreen component (AC: #1, #3)
  - [ ] Create `apps/mini-app/src/screens/HomeScreen.tsx`
  - [ ] Display greeting: `"Salom, {fullName}!"`
  - [ ] Render "Testlarga o'tish" button — calls `onNavigate("tests-list")` prop
  - [ ] Style with Telegram theme CSS variables: `--tg-bg-color`, `--tg-text-color`, `--tg-button-color`

- [ ] Task 7: Wire up App.tsx (AC: #1, #2, #3)
  - [ ] Render correct screen based on state
  - [ ] Retry: re-call authenticate() on retry button press
  - [ ] Navigation: update screen state on "Testlarga o'tish" press

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

### Debug Log References

### Completion Notes List

### File List
