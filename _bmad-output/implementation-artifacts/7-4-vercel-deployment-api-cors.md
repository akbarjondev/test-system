# Story 7.4: Vercel Deployment & API CORS

Status: ready-for-dev

## Story

As a developer,
I want the Mini App deployed to Vercel and the API configured to accept requests from it,
So that students can access the live app inside Telegram.

## Acceptance Criteria

1. **Given** the `apps/mini-app` Vite build,
   **When** deployed to Vercel,
   **Then** the app is served over HTTPS at the assigned Vercel domain

2. **Given** the Vercel domain is known,
   **When** `apps/api/src/server.ts` CORS configuration is updated,
   **Then** the Vercel domain is included in the allowed origins list (read from `MINI_APP_URL` env var)
   **And** the env var is documented in `.env.example`

3. **Given** the Mini App is registered with `@BotFather` as the Mini App URL,
   **When** a student opens Telegram and taps the bot's menu button (added in Epic 9),
   **Then** the Mini App loads correctly at the Vercel URL

## Tasks / Subtasks

- [ ] Task 1: Add `vercel.json` to `apps/mini-app` (AC: #1)
  - [ ] Create `apps/mini-app/vercel.json`:
    ```json
    {
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "framework": "vite"
    }
    ```
  - [ ] Alternatively, Vercel auto-detects Vite — `vercel.json` is optional but explicit is better

- [ ] Task 2: Update API CORS to support Mini App origin (AC: #2)
  - [ ] Read `apps/api/src/server.ts` — current CORS is `app.use(cors())` (allows all origins)
  - [ ] Replace with allowlist-based CORS:
    ```ts
    const allowedOrigins = [
      "http://localhost:3000", // admin dashboard dev
      process.env.MINI_APP_URL, // Vercel Mini App domain
    ].filter(Boolean) as string[];

    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed"));
        }
      },
      credentials: true,
    }));
    ```
  - [ ] If `MINI_APP_URL` is not set, CORS still works for existing clients (admin dashboard, bot use non-browser requests)

- [ ] Task 3: Document env vars (AC: #2)
  - [ ] Add `MINI_APP_URL=https://your-mini-app.vercel.app` to root `.env.example` or `apps/api/.env.example` (check which exists)
  - [ ] Add `VITE_API_URL=https://your-api.railway.app` to `apps/mini-app/.env.example`

- [ ] Task 4: Verify build output (AC: #1)
  - [ ] Run `npm run build --filter=@test-system/mini-app` — confirm `dist/` is generated without errors
  - [ ] Confirm `dist/index.html` exists and references correct asset paths

- [ ] Task 5: Deploy to Vercel (AC: #1, #3)
  - [ ] Run `npx vercel --cwd apps/mini-app` or configure Vercel dashboard to point to `apps/mini-app` as root directory
  - [ ] Set env var `VITE_API_URL` in Vercel dashboard to the Railway API URL
  - [ ] Note the assigned Vercel URL for use in Epic 9 (bot menu button) and BotFather registration

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/mini-app/vercel.json` | Create — Vercel deployment config |
| `apps/mini-app/.env.example` | Create — document VITE_API_URL |
| `apps/api/src/server.ts` | Update CORS from open to allowlist |
| `.env.example` (root or api) | Add MINI_APP_URL |

### Current CORS State

`apps/api/src/server.ts` line 25 currently uses `app.use(cors())` — this allows ALL origins. This is permissive for dev but needs tightening for production. The update in this story introduces an allowlist. The bot and admin dashboard both use non-browser contexts (server-to-server) so they are unaffected by CORS.

### CORS Origin Allowlist Logic

The Telegram Mini App runs inside Telegram's in-app browser. The `origin` header will be the Vercel domain. `!origin` handles server-to-server calls (bot API calls, health checks, curl) — these should still pass through.

### Monorepo Vercel Deployment

Vercel supports monorepos. When deploying `apps/mini-app`:
- Set **Root Directory** to `apps/mini-app` in Vercel project settings
- Or use the CLI: `vercel --cwd apps/mini-app`
- Turbo is NOT required for Vercel deployment of a single Vite app — Vercel runs `npm run build` in the specified root directory

### env.example Location

Check if root `.env.example` exists: if yes, add `MINI_APP_URL` there. If only `apps/api/.env.example` exists, add it there. Either way, document both:
```
# Telegram Mini App (Epic 7+)
MINI_APP_URL=https://your-mini-app.vercel.app
```

### References

- [Source: apps/api/src/server.ts line 25] — Current cors() call to update
- [Source: apps/api/src/config/env.ts] — Env validation pattern (MINI_APP_URL is optional, do not add to required list)
- [Source: https://vercel.com/docs/monorepos] — Vercel monorepo deployment guide

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
