# Story 6.4: Purge Hardcoded Gray Text Across Dashboard

Status: done

## Story

As an admin dashboard maintainer,
I want muted and secondary text across the dashboard route tree to use `text-muted-foreground` (and other semantic tokens) instead of raw `text-zinc-*` / `text-gray-*` classes,
So that typography responds correctly to theme changes and dark mode.

## Acceptance Criteria

1. **Given** files under `apps/admin-dashboard/app/dashboard/` **excluding** `app/dashboard/ui/Sidebar.tsx` (intentionally exempt in epic),
   **When** searching for deprecated muted patterns,
   **Then** there are **no** remaining `text-zinc-500`, `text-zinc-400`, `text-gray-500`, or `text-gray-600` (and no `text-gray-*` used for muted body copy — role badges must use `Badge` variants per Story 6.7, not gray text hacks).

2. **Given** the same scope as AC1,
   **When** grepping for hardcoded red destructive text on interactive controls (example: `hover:bg-red-500` on delete icons),
   **Then** such uses are replaced with token-appropriate classes (e.g. `hover:bg-error` or `hover:bg-destructive` depending on design intent — must remain accessible and visible in dark mode).

3. **Given** `apps/admin-dashboard/app/dashboard/layout.tsx`,
   **When** reviewing the shell background,
   **Then** page shell uses theme tokens (e.g. `bg-background`) instead of `bg-zinc-50 dark:bg-zinc-950` **if** the epic grep / DoD for Epic 6 requires zero zinc background in dashboard layout — align with `spec-epic-6-design-system.md` verification section.

4. **Given** `cd apps/admin-dashboard && npm run build`,
   **When** the build finishes,
   **Then** exit code 0.

## Tasks / Subtasks

- [x] Task 1: Inventory (AC: #1–#3)
  - [x] `rg "text-zinc-|text-gray-|hover:bg-red-|bg-zinc-50|dark:bg-zinc-950" apps/admin-dashboard/app/dashboard --glob '!**/Sidebar.tsx'`

- [x] Task 2: Fix `UsersTable` role styling (AC: #1)
  - [x] File: `apps/admin-dashboard/app/dashboard/users/ui/UsersTable.tsx` — replace `Badge` with `className="bg-gray-100 text-gray-800"` with proper `variant` (e.g. `secondary` for “Talaba”) per Badge patterns; do not change Uzbek string content

- [x] Task 3: Fix question form delete hover (AC: #2)
  - [x] `apps/admin-dashboard/app/dashboard/tests/[id]/questions/ui/FormQuestion.tsx`
  - [x] `apps/admin-dashboard/app/dashboard/tests/[id]/questions/[questionId]/edit/ui/FormEditQuestion.tsx`
  - [x] Replace `hover:bg-red-500` with a semantic token hover class

- [x] Task 4: Dashboard layout shell (AC: #3)
  - [x] `apps/admin-dashboard/app/dashboard/layout.tsx` — migrate `bg-zinc-50 dark:bg-zinc-950` to token-based background if required by epic verification

- [x] Task 5: Re-run grep + build (AC: #1, #4)
  - [x] Confirm Sidebar left unchanged
  - [x] `npm run build`

## Dev Notes

### Exemptions

- **`apps/admin-dashboard/app/dashboard/ui/Sidebar.tsx`** — do **not** edit for this story; epic marks sidebar nav as exempt token space.

### Related files (may already be clean)

Re-scan these if grep hits move:

- `apps/admin-dashboard/app/dashboard/page.tsx`
- `apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx`
- `apps/admin-dashboard/app/dashboard/attempts/ui/AttemptsTable.tsx`
- `apps/admin-dashboard/app/dashboard/error.tsx`

### Out of scope (unless epic explicitly expands)

- `apps/admin-dashboard/app/auth/**` (LoginForm uses `text-red-500` — not under `app/dashboard/`; leave unless PM extends epic)
- `apps/admin-dashboard/app/page.tsx` (marketing-style landing)

### Verification (from epic — adapt path scope)

Epic suggests grep sweeps under `apps/admin-dashboard/app/dashboard/`. After changes, run the epic’s verification commands and capture output in Dev Agent Record.

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Boundaries, Phase 3, Verification]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- `UsersTable`: role chips now use `Badge variant="default"` / `variant="secondary"` (removed blue/gray utility overrides).
- Question create/edit forms: delete controls use `Button variant="destructive"`; validation borders use `border-destructive` instead of `border-red-500`.
- Extended the same `border-destructive` swap to `FormTest.tsx` and `FormEditTest.tsx` so dashboard forms no longer reference raw red border utilities.
- `FormQuestion` `onError`: removed `console.log` (project rule).
- `layout.tsx`: shell background `bg-zinc-50 dark:bg-zinc-950` → `bg-background`.
- Post-change grep: no `border-red-`, `hover:bg-red-`, `text-gray-`, or `bg-gray-` under `app/dashboard/**/*.tsx` except Sidebar zinc tokens (exempt). `npm run build` / lint: OK (0 errors).

### File List

- `apps/admin-dashboard/app/dashboard/layout.tsx`
- `apps/admin-dashboard/app/dashboard/users/ui/UsersTable.tsx`
- `apps/admin-dashboard/app/dashboard/tests/[id]/questions/ui/FormQuestion.tsx`
- `apps/admin-dashboard/app/dashboard/tests/[id]/questions/[questionId]/edit/ui/FormEditQuestion.tsx`
- `apps/admin-dashboard/app/dashboard/tests/new/ui/FormTest.tsx`
- `apps/admin-dashboard/app/dashboard/tests/[id]/edit/ui/FormEditTest.tsx`

## Change Log

- 2026-04-11: Story created — purge hardcoded gray/zinc muted text in dashboard (Epic 6)
- 2026-04-11: Dev-story — token sweep + layout; status → `review`
