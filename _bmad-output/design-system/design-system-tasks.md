# Design System — PM Task List

Quick reference for creating dev tickets. Full context in `design-system.md`.

## Epic: Design System Consistency

| Task ID | Title | Files to Change | Priority | Blocked By |
|---|---|---|---|---|
| DS-1 | Add `--success`, `--error`, `--warning` CSS tokens | `app/globals.css` | 🔴 High | — |
| DS-2 | Update Badge status variants to use new tokens | `components/ui/badge.tsx` | 🔴 High | DS-1 |
| DS-3 | Refactor StatCard to use Card component; remove hardcoded colors | `app/dashboard/page.tsx` | 🔴 High | DS-1 |
| DS-4 | Replace `text-gray-500` / `text-zinc-500` → `text-muted-foreground` across all pages | All dashboard pages | 🟡 Medium | — |
| DS-5 | Fix table wrappers to use `border-border bg-card` tokens | `app/dashboard/page.tsx`, `app/dashboard/students/page.tsx` | 🟡 Medium | — |
| DS-6 | Replace inline pass/fail spans with Badge in dashboard recent attempts | `app/dashboard/page.tsx` | 🟡 Medium | DS-2 |
| DS-7 | Replace hardcoded role colors with Badge in students page | `app/dashboard/students/page.tsx` | 🟡 Medium | DS-2 |
| DS-8 | Add styled table wrapper to students page | `app/dashboard/students/page.tsx` | 🟡 Medium | — |
| DS-9 | Replace hardcoded green/red on question options with token classes | `app/dashboard/tests/[id]/page.tsx` | 🟢 Low | DS-1 |
| DS-10 | Add page subtitles to Students and Tests list pages | `app/dashboard/students/page.tsx`, `app/dashboard/tests/page.tsx` | 🟢 Low | — |

---

## Task Details

### DS-1 — Add Status Color Tokens
**What:** Add `--success`, `--error`, `--warning` (+ `*-foreground` + dark overrides) to `globals.css`.
**Why:** Badge component and several pages hardcode Tailwind palette classes — this makes dark mode broken for status colors and prevents future theming.
**File:** `apps/admin-dashboard/app/globals.css`
**Sections to update:** `:root {}`, `.dark {}`, `@theme inline {}`

---

### DS-2 — Update Badge Variants
**What:** Change success/error/warning Badge variants from `bg-green-100 text-green-800` (etc.) to `bg-success text-success-foreground`.
**File:** `apps/admin-dashboard/components/ui/badge.tsx`
**Lines:** 14–16

---

### DS-3 — Refactor StatCard
**What:** The `StatCard` inline component in `dashboard/page.tsx` (line 39–46) uses a raw `div` with hardcoded `bg-white dark:bg-zinc-900`, `border-zinc-200 dark:border-zinc-800`, `text-zinc-500 dark:text-zinc-400`, `text-amber-500`. Replace entire component body with `<Card>` + `<CardContent>`.
**File:** `apps/admin-dashboard/app/dashboard/page.tsx`
**Reference pattern:** See `design-system.md` § 2.3 (Stat Card Pattern)

---

### DS-4 — Purge Hardcoded Gray Text
**What:** Find and replace all instances of secondary text using raw palette classes.

Search for (in `app/dashboard/**`):
- `text-gray-500` → `text-muted-foreground`
- `text-zinc-500` → `text-muted-foreground`
- `text-zinc-400` → `text-muted-foreground`

**Exceptions:** Sidebar nav uses `text-zinc-500` intentionally (sidebar has its own token space — do NOT change those).

---

### DS-5 — Fix Table Wrappers
**What:** Two pages wrap `<Table>` in divs with hardcoded colors.

Replace:
```tsx
// BEFORE
<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">

// AFTER
<div className="rounded-xl border border-border overflow-hidden bg-card">
```

**Files:**
- `app/dashboard/page.tsx` line 97
- `app/dashboard/students/page.tsx` — currently no wrapper, add one

---

### DS-6 — Badge for Pass/Fail in Dashboard
**What:** Recent attempts table in `dashboard/page.tsx` (lines 133–142) uses `<span className="text-green-600">` and `<span className="text-red-500">`.

Replace with:
```tsx
{passed === true && <Badge variant="success">O'tdi</Badge>}
{passed === false && <Badge variant="error">O'tmadi</Badge>}
{passed === null && <span className="text-muted-foreground text-sm">—</span>}
```

---

### DS-7 — Badge for User Roles
**What:** Students page `role` column (lines 63–70) uses hardcoded color spans.

Replace with:
```tsx
<Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
  {user.role === "ADMIN" ? "Admin" : "O'quvchi"}
</Badge>
```

---

### DS-8 — Students Table Wrapper
**What:** `app/dashboard/students/page.tsx` renders `<Table>` directly without a wrapper div.

Wrap it:
```tsx
<div className="rounded-xl border border-border overflow-hidden bg-card">
  <Table>...</Table>
</div>
```

---

### DS-9 — Question Option Colors
**What:** In `tests/[id]/page.tsx` (lines 118–122), question option list items use `text-green-600` / `text-red-500`.

After DS-1 tokens are added, replace with `text-success` / `text-error`.

---

### DS-10 — Page Subtitles
**What:** Students and Tests list pages are missing a subtitle line under H1, which the dashboard page already has. Add for visual consistency.

```tsx
<h1 className="text-2xl font-bold mb-1">Foydalanuvchilar</h1>
<p className="text-sm text-muted-foreground">Barcha ro'yxatdan o'tgan foydalanuvchilar</p>
```

---

## Notes for PM

- **DS-1 must ship first** — it's a prerequisite for DS-2, DS-3, DS-6, DS-7, DS-9
- DS-4, DS-5, DS-8, DS-10 are independent and can be done in any order or in parallel
- All tasks are purely UI/styling — no API changes, no DB changes, no new routes
- Each task is small (< 30 lines changed) and low risk
- The `design-system.md` doc has full acceptance criteria per task for QA sign-off
