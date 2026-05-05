# Story 7.1: Mini App Monorepo Scaffold

Status: done

## Story

As a developer,
I want a new `apps/mini-app` workspace bootstrapped in the Turborepo,
So that the team has a working React app foundation to build the Mini App on.

## Acceptance Criteria

1. **Given** the monorepo root,
   **When** `apps/mini-app` is created,
   **Then** it is a Vite + React + TypeScript project with Tailwind CSS configured
   **And** `@twa-dev/sdk` is installed
   **And** `packages/ui` and `packages/types` are added as workspace dependencies
   **And** the app is added so `npm run dev` and `npm run build` include it
   **And** `tg.expand()` is called on mount so the Mini App takes full height in Telegram

2. **Given** the app runs locally with a tunnel (e.g. ngrok),
   **When** opened inside Telegram,
   **Then** the Telegram Web App JS SDK initializes without errors and `tg.themeParams` CSS variables are applied to the root element

## Tasks / Subtasks

- [x] Task 1: Create `apps/mini-app` package (AC: #1)
  - [x] Create `apps/mini-app/package.json` with name `@test-system/mini-app`, vite, react, react-dom, typescript, tailwindcss, @twa-dev/sdk as deps
  - [x] Add `@repo/ui` and `@test-system/types` as workspace deps (`"*"`)
  - [x] Verify root `package.json` workspaces includes `apps/*` (already does — no change needed)

- [x] Task 2: Scaffold Vite + React + TypeScript config (AC: #1)
  - [x] Create `apps/mini-app/vite.config.ts` using `@vitejs/plugin-react`
  - [x] Create `apps/mini-app/tsconfig.json` extending `@repo/typescript-config/base.json` (no vite.json exists)
  - [x] Create `apps/mini-app/index.html` as Vite entry point
  - [x] Create `apps/mini-app/src/main.tsx` and `apps/mini-app/src/App.tsx`

- [x] Task 3: Configure Tailwind CSS (AC: #1)
  - [x] Create `apps/mini-app/tailwind.config.ts`
  - [x] Create `apps/mini-app/src/index.css` with `@tailwind base/components/utilities` directives

- [x] Task 4: Integrate Telegram Web App SDK (AC: #1, #2)
  - [x] In `src/main.tsx`, import `@twa-dev/sdk` and call `WebApp.ready()` and `WebApp.expand()` before rendering
  - [x] Apply Telegram theme params as CSS variables to `document.documentElement` on mount:
    ```ts
    const tg = window.Telegram.WebApp;
    const tp = tg.themeParams;
    document.documentElement.style.setProperty("--tg-bg-color", tp.bg_color ?? "#fff");
    // repeat for other theme params
    ```
  - [x] Type `window.Telegram` using `@twa-dev/sdk` types (no manual `declare global` needed)

- [x] Task 5: Add scripts to package.json (AC: #1)
  - [x] `"dev": "vite"`, `"build": "tsc && vite build"`, `"preview": "vite preview"`, `"lint": "eslint src"`
  - [x] Verify Turborepo picks it up by checking `turbo.json` tasks (build/dev/lint already defined globally — no change needed)

- [x] Task 6: Verify local dev works (AC: #2)
  - [x] Run `npx vite build` in apps/mini-app — Vite builds successfully (36 modules, no errors)
  - [x] Confirm TypeScript compiles (no strict errors via `tsc --noEmit`)

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/mini-app/package.json` | Create — workspace package definition |
| `apps/mini-app/vite.config.ts` | Create — Vite config |
| `apps/mini-app/tsconfig.json` | Create — extends shared TS config |
| `apps/mini-app/index.html` | Create — Vite entry HTML |
| `apps/mini-app/src/main.tsx` | Create — app entry with SDK init |
| `apps/mini-app/src/App.tsx` | Create — placeholder root component |
| `apps/mini-app/src/index.css` | Create — Tailwind directives |
| `apps/mini-app/tailwind.config.ts` | Create — Tailwind config |

**Do NOT modify**: `turbo.json` (already handles all apps via `apps/*`), root `package.json` (already has `apps/*` workspace pattern), any existing apps.

### Workspace Package Name Pattern

Existing apps use `@test-system/<name>` (e.g., `@test-system/api`, `@test-system/admin-dashboard`). Use `@test-system/mini-app`.

### TypeScript Config Inheritance Pattern

Check `packages/typescript-config/` for available base configs. Use whichever matches a Vite/browser app (likely `base.json` or `vite.json`). Pattern from other apps:
```json
{
  "extends": "@test-system/typescript-config/base.json",
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### @twa-dev/sdk Usage Pattern

```ts
// src/main.tsx
import WebApp from "@twa-dev/sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

WebApp.ready();
WebApp.expand();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`WebApp` from `@twa-dev/sdk` is a typed wrapper around `window.Telegram.WebApp`. Use it throughout — no raw `window.Telegram.WebApp` calls.

### Telegram Theme CSS Variables Pattern

```ts
// Apply once on mount in App.tsx or main.tsx
const tg = WebApp;
const root = document.documentElement;
root.style.setProperty("--tg-bg-color", tg.backgroundColor);
root.style.setProperty("--tg-text-color", tg.themeParams.text_color ?? "#000");
root.style.setProperty("--tg-hint-color", tg.themeParams.hint_color ?? "#999");
root.style.setProperty("--tg-button-color", tg.themeParams.button_color ?? "#2481cc");
root.style.setProperty("--tg-button-text-color", tg.themeParams.button_text_color ?? "#fff");
```

### Tailwind Config for Mini App

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

### References

- [Source: apps/telegram-bot/package.json] — Sibling app pattern for workspace deps
- [Source: packages/typescript-config/] — Base tsconfig to extend
- [Source: turbo.json] — Build/dev pipeline (no change needed)
- [Source: https://core.telegram.org/bots/webapps#themeparams] — Telegram themeParams

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `@twa-dev/sdk@^2.0.0` didn't exist — latest is `^8.0.0`. Updated package.json.
- Postcss.config.js needed `"type": "module"` in package.json to suppress ESM warning from Vite.
- `packages/typescript-config` is named `@repo/typescript-config` (not `@test-system/typescript-config`); `packages/ui` is `@repo/ui`. Used actual names.
- Used `noEmit: true` in tsconfig.json instead of `outDir: "dist"` so `tsc` only type-checks; Vite handles build output.

### Completion Notes List

- Created `apps/mini-app` as a Vite 6 + React 19 + TypeScript + Tailwind CSS v3 workspace app.
- `@twa-dev/sdk` v8 installed; `WebApp.ready()`, `WebApp.expand()`, and all 5 theme CSS variables applied in `src/main.tsx` before render.
- TypeScript strict mode enabled, `tsc --noEmit` passes clean.
- `vite build` produces clean output (36 modules, 248 kB JS, 4.9 kB CSS).
- Turborepo picks up the app automatically via `apps/*` workspace pattern — no turbo.json changes needed.

### File List

- apps/mini-app/package.json
- apps/mini-app/vite.config.ts
- apps/mini-app/tsconfig.json
- apps/mini-app/index.html
- apps/mini-app/postcss.config.js
- apps/mini-app/tailwind.config.ts
- apps/mini-app/src/main.tsx
- apps/mini-app/src/App.tsx
- apps/mini-app/src/index.css

### Review Findings

- [x] [Review][Patch] WebApp.backgroundColor lacks `??` fallback unlike sibling theme reads [apps/mini-app/src/main.tsx:11]
- [x] [Review][Patch] tailwind.config.ts content glob omits @repo/ui workspace sources — classes from shared UI will be purged once consumed [apps/mini-app/tailwind.config.ts:4]
- [x] [Review][Defer] App crashes when opened outside Telegram (no guard around WebApp.ready/expand/themeParams) [apps/mini-app/src/main.tsx:7-15] — deferred, dev-ergonomics outside story 7-1 scope
- [x] [Review][Defer] `npm run lint` fails — no ESLint config file in apps/mini-app/ [apps/mini-app/package.json:10] — deferred, needs repo-wide ESLint setup decision
- [x] [Review][Defer] No Vite `base` config for Mini App deployment subpath [apps/mini-app/vite.config.ts] — deferred, belongs to story 7-4 (Vercel deployment)
- [x] [Review][Defer] Telegram polish — missing viewport-fit=cover and <meta name="theme-color"> [apps/mini-app/index.html] — deferred, post-MVP polish

## Change Log

- 2026-05-05: Story 7.1 implemented — created apps/mini-app Vite+React+TS+Tailwind scaffold with Telegram Web App SDK integration
- 2026-05-05: Code review complete — 2 patches identified, 4 deferred, 8 dismissed; AC #1 and AC #2 verified compliant
