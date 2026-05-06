# Mini App Patterns (`apps/mini-app`)

### Stack
- **Vite** + **React** + **@twa-dev/sdk** (Telegram WebApp SDK)
- Tailwind CSS v4, no router library — screen-based state machine only
- No TypeScript path aliases — use plain relative imports (`../lib/api`, `./screens/HomeScreen`)

### Authentication
- On mount, `App.tsx` calls `authenticate()` from `services/auth.ts`
- `authenticate()` reads `WebApp.initData` from `@twa-dev/sdk` and POSTs to `POST /api/auth/telegram-miniapp`
- Token stored in **`sessionStorage`** (not localStorage, not httpOnly cookie)
- All subsequent API calls read token from `sessionStorage.getItem("token")`

### API Helper (`lib/api.ts`)
```typescript
// Always use apiFetch<T>(path, options?) — never raw fetch
// Automatically attaches Bearer token from sessionStorage
// Throws enriched Error with .status and .code on non-ok responses
const result = await apiFetch<SomeType>("/api/some-endpoint");
```

### Screen Navigation
- `App.tsx` owns a `Screen` union type state — no React Router
- Add new screens: new value in `Screen` type + new `if (screen === "...")` branch in `App.tsx`
- Pass `onNavigate` callback prop down to screens for navigation

### Environment Variable
- `VITE_API_URL` — must be **browser-reachable** (never `http://api:5000` — that's Docker-internal)
- Falls back to `http://localhost:5000` in dev
- Baked in at **build time** via `docker/mini-app.Dockerfile` build arg in prod

---
