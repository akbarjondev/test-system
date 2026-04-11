---
title: 'Epic 6 — Design System Consistency'
type: 'refactor'
created: '2026-04-11'
status: 'done'
baseline_commit: '16f2d8dd08139d18e5c4b322ee9e82fc26912ee7'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The admin dashboard uses hardcoded Tailwind palette classes (`bg-green-100`, `text-zinc-500`, `border-zinc-200`, etc.) scattered across multiple files, causing dark-mode breakage and making color changes require hunting through every file.

**Approach:** Introduce six semantic CSS tokens (`--success`, `--error`, `--warning` + foregrounds) in `globals.css`, wire them through `@theme inline`, update `Badge` variants to use them, then sweep all dashboard pages replacing hardcoded color classes with semantic tokens, consistent table wrappers, `Badge` components, and `Card` components.

## Boundaries & Constraints

**Always:**
- All colors must use the existing OKLCH format (match globals.css convention)
- `Badge` is the sole pattern for status and role indicators — no inline `<span>` with color classes
- `Card`/`CardContent` is the sole pattern for card surfaces — no raw `<div>` with hardcoded bg/border
- Table wrappers must use `rounded-xl border border-border overflow-hidden bg-card`
- `text-muted-foreground` replaces every `text-zinc-500`, `text-zinc-400`, `text-gray-500`, `text-gray-600`
- Sidebar nav styles in `ui/Sidebar.tsx` are exempt — intentional token space

**Ask First:**
- Any change to API calls, routing, or business logic
- Any new npm dependency

**Never:**
- Raw SQL, Prisma schema changes, API changes
- Changes to `apps/telegram-bot`, `apps/api`, `packages/*`
- Adding `console.log`
- Changing Uzbek-language text content (labels stay as-is)

</frozen-after-approval>

## Code Map

- `apps/admin-dashboard/app/globals.css` -- CSS token definitions; `@theme inline`, `:root`, `.dark` blocks
- `apps/admin-dashboard/components/ui/badge.tsx` -- Badge CVA variants (lines 14–16 currently hardcoded)
- `apps/admin-dashboard/app/dashboard/page.tsx` -- StatCard component + recent attempts table
- `apps/admin-dashboard/app/dashboard/students/page.tsx` -- Users list; role column + table wrapper
- `apps/admin-dashboard/app/dashboard/tests/page.tsx` -- Tests list page; H1 area needs subtitle
- `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx` -- Question options (lines ~119); metadata labels

## Tasks & Acceptance

**Execution — Phase 1 (foundation, must be first):**
- [x] `apps/admin-dashboard/app/globals.css` -- Add to `:root {}`: `--success: oklch(0.648 0.150 148)`, `--success-foreground: oklch(0.985 0 0)`, `--error: oklch(0.628 0.222 25)`, `--error-foreground: oklch(0.985 0 0)`, `--warning: oklch(0.769 0.189 84)`, `--warning-foreground: oklch(0.205 0 0)` -- semantic token foundation
- [x] `apps/admin-dashboard/app/globals.css` -- Add to `.dark {}`: `--success: oklch(0.723 0.160 148)`, `--success-foreground: oklch(0.145 0 0)`, `--error: oklch(0.704 0.191 22)`, `--error-foreground: oklch(0.985 0 0)`, `--warning: oklch(0.828 0.189 84)`, `--warning-foreground: oklch(0.205 0 0)` -- dark mode overrides
- [x] `apps/admin-dashboard/app/globals.css` -- Add to `@theme inline {}`: `--color-success: var(--success)`, `--color-success-foreground: var(--success-foreground)`, `--color-error: var(--error)`, `--color-error-foreground: var(--error-foreground)`, `--color-warning: var(--warning)`, `--color-warning-foreground: var(--warning-foreground)` -- Tailwind utility mappings

**Execution — Phase 2 (depends on Phase 1):**
- [x] `apps/admin-dashboard/components/ui/badge.tsx` -- Replace lines 14–16: `success: "bg-success text-success-foreground"`, `error: "bg-error text-error-foreground"`, `warning: "bg-warning text-warning-foreground"` -- removes hardcoded palette classes

**Execution — Phase 3 (depends on Phase 1+2, files independent of each other):**
- [x] `apps/admin-dashboard/app/dashboard/page.tsx` -- Replace `StatCard` raw `<div>` with `<Card><CardContent className="pt-6">...</CardContent></Card>`; label uses `text-muted-foreground`; warning variant uses `border-warning`/`text-warning` on Card/value -- Story 6.3
- [x] `apps/admin-dashboard/app/dashboard/page.tsx` -- Replace `text-zinc-500`, `text-zinc-400`, `text-zinc-400` with `text-muted-foreground` (lines 42, 65, 95, 140, 143) -- Story 6.4
- [x] `apps/admin-dashboard/app/dashboard/page.tsx` -- Replace recent-attempts table wrapper classes `border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900` with `border-border bg-card` -- Story 6.5
- [x] `apps/admin-dashboard/app/dashboard/page.tsx` -- Replace pass/fail `<span className="text-green-600...">` with `<Badge variant="success">O'tdi</Badge>` and `<span className="text-red-500...">` with `<Badge variant="error">O'tmadi</Badge>`; null case: `<span className="text-muted-foreground text-sm">—</span>` -- Story 6.6
- [x] `apps/admin-dashboard/app/dashboard/students/page.tsx` -- Replace role column `<span className="text-blue-600...">` / `<span className="text-gray-600">` with `<Badge variant="default">Admin</Badge>` / `<Badge variant="secondary">O'quvchi</Badge>` -- Story 6.7
- [x] `apps/admin-dashboard/app/dashboard/students/page.tsx` -- Wrap `<Table>` in `<div className="rounded-xl border border-border overflow-hidden bg-card">`; replace `text-gray-500` with `text-muted-foreground`; add subtitle `<p className="text-sm text-muted-foreground mt-1">Barcha ro'yxatdan o'tgan foydalanuvchilar</p>` after H1 (change `mb-6` → `mb-1` on H1) -- Stories 6.5, 6.8, 6.10, 6.4
- [x] `apps/admin-dashboard/app/dashboard/tests/page.tsx` -- Add subtitle `<p className="text-sm text-muted-foreground mt-1">Barcha testlar ro'yxati</p>` after H1; change H1 `mb` if needed to accommodate subtitle -- Story 6.10
- [x] `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx` -- Replace `text-green-600` with `text-success` and `text-red-500` with `text-error` in option list (line ~119); replace all `text-gray-500` with `text-muted-foreground` (lines 46, 50, 54, 67, 71) -- Stories 6.9, 6.4

**Acceptance Criteria:**
- Given `globals.css` is saved, when Tailwind builds, then `bg-success`, `text-error`, `bg-warning`, `border-warning`, `text-muted-foreground` resolve without errors
- Given dark mode is active, when viewing any dashboard page, then success/error/warning badges and StatCards render with correct dark-mode colors (no hardcoded light-mode palette bleed)
- Given `grep -r "text-green-\|text-red-\|bg-green-\|bg-red-\|text-zinc-5\|text-zinc-4\|text-gray-5\|text-gray-6\|bg-white\|dark:bg-zinc\|border-zinc\|dark:border-zinc\|border-amber\|text-amber\|bg-orange" apps/admin-dashboard/app/dashboard/`, then zero results (excluding Sidebar.tsx)
- Given `grep -r "text-green-\|text-red-\|bg-green-\|bg-red-" apps/admin-dashboard/components/ui/badge.tsx`, then zero results

## Design Notes

**OKLCH consistency:** All existing tokens in `globals.css` use OKLCH. New tokens must follow suit — no hex, no hsl.

**StatCard Card import:** `Card` and `CardContent` are from `@/components/ui/card`. Must add import to `dashboard/page.tsx`. Badge import `@/components/ui/badge` also needed where not already present.

**tests/page.tsx H1 structure:** Currently the H1 is inside `flex justify-between items-center mb-10` div alongside the "Yangi test" button. The subtitle `<p>` goes inside this same div, right after the H1. Change H1's `mb-10` on the container to `mb-6` (the subtitle provides visual gap now).

**students/page.tsx table wrapper:** Currently `<Table>` is a direct child of the conditional branch — wrap only the `<Table>` tag, not the empty-state `<p>`.

## Verification

**Commands:**
- `cd apps/admin-dashboard && npm run build` -- expected: exits 0, no TypeScript errors
- `grep -r "text-green-\|text-red-\|text-zinc-5\|text-zinc-4\|text-gray-5\|text-gray-6\|bg-white\|dark:bg-zinc-9\|border-zinc-\|border-amber\|text-amber\|bg-orange-" apps/admin-dashboard/app/dashboard/` -- expected: zero matches
- `grep "bg-green-\|bg-red-\|bg-orange-" apps/admin-dashboard/components/ui/badge.tsx` -- expected: zero matches

## Suggested Review Order

**Token foundation**

- Six OKLCH tokens defined in `:root`, `.dark`, and wired into Tailwind via `@theme inline`
  [`globals.css:40`](../../apps/admin-dashboard/app/globals.css#L40)

**Badge variants**

- `success`/`error`/`warning` variants switched from hardcoded palette to semantic tokens
  [`badge.tsx:14`](../../apps/admin-dashboard/components/ui/badge.tsx#L14)

**Dashboard home — multiple concerns in one file**

- StatCard: raw `div` replaced with `Card`+`CardContent`; warning state uses `border-warning`/`text-warning`
  [`page.tsx:41`](../../apps/admin-dashboard/app/dashboard/page.tsx#L41)

- Table wrapper: hardcoded zinc classes → `border-border bg-card`
  [`page.tsx:97`](../../apps/admin-dashboard/app/dashboard/page.tsx#L97)

- Pass/fail: `<span className="text-green-*">` → `<Badge variant="success/error">`
  [`page.tsx:131`](../../apps/admin-dashboard/app/dashboard/page.tsx#L131)

**Students page**

- Role column: hardcoded span colors → `<Badge variant="default/secondary">`
  [`students/page.tsx:56`](../../apps/admin-dashboard/app/dashboard/students/page.tsx#L56)

- Table wrapped in `rounded-xl border border-border overflow-hidden bg-card`; subtitle added
  [`students/page.tsx:44`](../../apps/admin-dashboard/app/dashboard/students/page.tsx#L44)

**Tests pages**

- Tests list: H1 area restructured to include subtitle paragraph
  [`tests/page.tsx:31`](../../apps/admin-dashboard/app/dashboard/tests/page.tsx#L31)

- Test detail: option colors `text-green-600`/`text-red-500` → `text-success`/`text-error`
  [`tests/[id]/page.tsx:119`](../../apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx#L119)

**Supporting pages (muted text sweep)**

- Results table: empty state `text-gray-500` → `text-muted-foreground`
  [`results-table.tsx:122`](../../apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx#L122)

- Attempts table: score percent colors + status span tokens updated; `text-warning` on text → `text-muted-foreground`
  [`AttemptsTable.tsx:98`](../../apps/admin-dashboard/app/dashboard/attempts/ui/AttemptsTable.tsx#L98)

- Error page: border/hover classes → `border-border hover:bg-muted`
  [`error.tsx:18`](../../apps/admin-dashboard/app/dashboard/error.tsx#L18)
