# 6. Dev Task List

**Epic: Design System Consistency**
Tasks must be done in priority order — DS-1 and DS-2 are blockers for all color-related fixes.

| Task ID | Title | Files | Priority | Depends On |
|---|---|---|---|---|
| **DS-1** | Add `--success`, `--error`, `--warning` CSS tokens to globals.css | `app/globals.css` | 🔴 High | — |
| **DS-2** | Update `badge.tsx` success/error/warning variants to use new tokens | `components/ui/badge.tsx` | 🔴 High | DS-1 |
| **DS-3** | Refactor `StatCard` in dashboard page to use `Card` component; remove all hardcoded zinc/white/amber classes | `app/dashboard/page.tsx` | 🔴 High | DS-1 |
| **DS-4** | Replace all `text-gray-500` and `text-zinc-500` with `text-muted-foreground` across all dashboard pages | All pages listed in audit | 🟡 Medium | — |
| **DS-5** | Fix table wrappers — replace hardcoded zinc/white border+bg with `border-border bg-card` | `app/dashboard/page.tsx`, `app/dashboard/students/page.tsx` | 🟡 Medium | — |
| **DS-6** | Replace inline pass/fail spans with Badge component in dashboard recent attempts table | `app/dashboard/page.tsx` | 🟡 Medium | DS-2 |
| **DS-7** | Replace hardcoded role colors with Badge component in students page | `app/dashboard/students/page.tsx` | 🟡 Medium | DS-2 |
| **DS-8** | Add table wrapper div (border-border bg-card) to students page table | `app/dashboard/students/page.tsx` | 🟡 Medium | — |
| **DS-9** | Replace `text-green-600`/`text-red-500` on question option correctness with token classes | `app/dashboard/tests/[id]/page.tsx` | 🟢 Low | DS-1 |
| **DS-10** | Add missing page subtitles (Students, Tests list pages) for visual consistency | `app/dashboard/students/page.tsx`, `app/dashboard/tests/page.tsx` | 🟢 Low | — |

### Acceptance Criteria (per task)

**DS-1:** `globals.css` `:root {}` contains `--success`, `--error`, `--warning` and matching `--*-foreground` variants; `.dark {}` has dark overrides; `@theme inline {}` maps `--color-success` etc.

**DS-2:** All three Badge status variants reference `bg-success/error/warning` and `text-success/error/warning-foreground`. No hardcoded Tailwind palette classes remain in `badge.tsx`.

**DS-3:** `StatCard` component in `dashboard/page.tsx` uses `<Card>` and `<CardContent>`. No inline `bg-white`, `dark:bg-zinc-*`, `border-zinc-*`, `text-zinc-*`, `text-amber-*`. Warning card uses `border-warning` and `text-warning`.

**DS-4:** Grep for `text-gray-500`, `text-zinc-500`, `text-zinc-400` in `app/dashboard/**` returns zero results (excluding sidebar nav which is intentional).

**DS-5:** Grep for `border-zinc-200`, `bg-white dark:bg-zinc-900` inside table wrapper divs returns zero results.

**DS-6:** Recent attempts table in `dashboard/page.tsx` uses `<Badge variant="success">` and `<Badge variant="error">` — no inline `text-green-*` or `text-red-*` spans.

**DS-7:** Students page role column uses `<Badge>` — no inline color classes on role display.

**DS-8:** Students page `<Table>` is wrapped in `<div className="rounded-xl border border-border overflow-hidden bg-card">`.

**DS-9:** Question options in `tests/[id]/page.tsx` use CSS token classes for correct/incorrect styling.

**DS-10:** Students and Tests list pages have a subtitle `<p className="text-sm text-muted-foreground mt-1">` after H1.
