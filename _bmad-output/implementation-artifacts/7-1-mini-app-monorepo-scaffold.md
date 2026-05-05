# Story 7.1: Mini App Monorepo Scaffold

Status: ready-for-dev

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

- [ ] Task 1: Create `apps/mini-app` package (AC: #1)
  - [ ] Create `apps/mini-app/package.json` with name `@test-system/mini-app`, vite, react, react-dom, typescript, tailwindcss, @twa-dev/sdk as deps
  - [ ] Add `@test-system/ui` and `@test-system/types` as workspace deps (`"workspace:*"`)
  - [ ] Verify root `package.json` workspaces includes `apps/*` (already does — no change needed)

- [ ] Task 2: Scaffold Vite + React + TypeScript config (AC: #1)
  - [ ] Create `apps/mini-app/vite.config.ts` using `@vitejs/plugin-react`
  - [ ] Create `apps/mini-app/tsconfig.json` extending `@test-system/typescript-config/vite.json` (or base.json if vite config doesn't exist — check `packages/typescript-config/`)
  - [ ] Create `apps/mini-app/index.html` as Vite entry point
  - [ ] Create `apps/mini-app/src/main.tsx` and `apps/mini-app/src/App.tsx`

- [ ] Task 3: Configure Tailwind CSS (AC: #1)
  - [ ] Create `apps/mini-app/tailwind.config.ts`
  - [ ] Create `apps/mini-app/src/index.css` with `@tailwind base/components/utilities` directives

- [ ] Task 4: Integrate Telegram Web App SDK (AC: #1, #2)
  - [ ] In `src/main.tsx`, import `@twa-dev/sdk` and call `WebApp.ready()` and `WebApp.expand()` before rendering
  - [ ] Apply Telegram theme params as CSS variables to `document.documentElement` on mount:
    ```ts
    const tg = window.Telegram.WebApp;
    const tp = tg.themeParams;
    document.documentElement.style.setProperty("--tg-bg-color", tp.bg_color ?? "#fff");
    // repeat for other theme params
    ```
  - [ ] Type `window.Telegram` using `@twa-dev/sdk` types (no manual `declare global` needed)

- [ ] Task 5: Add scripts to package.json (AC: #1)
  - [ ] `"dev": "vite"`, `"build": "tsc && vite build"`, `"preview": "vite preview"`, `"lint": "eslint src"`
  - [ ] Verify Turborepo picks it up by checking `turbo.json` tasks (build/dev/lint already defined globally — no change needed)

- [ ] Task 6: Verify local dev works (AC: #2)
  - [ ] Run `npm run dev --filter=@test-system/mini-app` — confirm Vite starts without errors
  - [ ] Confirm TypeScript compiles (no strict errors)

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

### Debug Log References

### Completion Notes List

### File List
