# Deferred Work

## Deferred from: code review of story-7-2-telegram-initdata-auth-api-endpoint (2026-05-05)

- URLSearchParams may misparse unencoded non-ASCII or incomplete percent-encoding in initData — edge case at crypto boundary; verify Telegram SDK always sends properly-encoded data.
- fullName can be empty string if Telegram user has no first_name or last_name — spec allows; UI should handle gracefully or display fallback.
- No logging on security-critical auth failures (invalid signature, expired token) — impacts debugging and threat detection; deferred to repo-wide logging/monitoring infrastructure decision.

## Deferred from: code review of story-7-1-mini-app-monorepo-scaffold (2026-05-05)

- App crashes when opened outside Telegram (no guard around WebApp.ready/expand/themeParams) — `apps/mini-app/src/main.tsx:7-15`. Developer-ergonomics issue; consider a `WebApp.platform === "unknown"` fallback.
- `npm run lint` fails — no ESLint config file in `apps/mini-app/`; needs a repo-wide decision (flat config vs legacy, shared `@repo/eslint-config` package).
- No Vite `base` config for Mini App deployment subpath — should be set as part of story 7-4 (Vercel deployment) once final URL/path is known.
- Telegram polish — missing `viewport-fit=cover` in viewport meta and missing `<meta name="theme-color">` synced to Telegram bg; iOS safe-area + status-bar flash mitigations.
