# Story 6.6: Replace Inline Pass/Fail Spans With Badge Component

Status: done

## Story

As an admin dashboard maintainer,
I want pass/fail indicators in dashboard tables to use the shared `Badge` component with semantic variants,
So that result styling is consistent, accessible, and theme-correct (no inline `text-green-*` / `text-red-*` spans).

## Acceptance Criteria

1. **Given** `apps/admin-dashboard/app/dashboard/page.tsx` recent-attempts table (Natija column),
   **When** `passed === true`,
   **Then** the UI renders `<Badge variant="success">` with the existing Uzbek copy for “passed” (preserve exact apostrophe / string content from the file — do not change user-visible wording).

2. **Given** the same column,
   **When** `passed === false`,
   **Then** the UI renders `<Badge variant="error">` with the existing Uzbek copy for “failed”.

3. **Given** `passed === null`,
   **Then** show neutral placeholder: `<span className="text-muted-foreground text-sm">—</span>` (or equivalent muted token usage) — **not** a colored badge.

4. **Given** grep under `apps/admin-dashboard/app/dashboard/` excluding `Sidebar.tsx`,
   **When** searching for `text-green-` or `text-red-` tied to pass/fail table cells,
   **Then** zero matches remain for those patterns in pass/fail contexts (other legitimate uses must not be broken).

5. **Given** `npm run build` in `apps/admin-dashboard`,
   **Then** exit code 0.

## Tasks / Subtasks

- [x] Task 1: Implement or verify Natija column (AC: #1–#3)
  - [x] Import `Badge` from `@/components/ui/badge` if missing
  - [x] Replace any legacy span-based pass/fail coloring

- [x] Task 2: Sweep other dashboard pass/fail displays (AC: #4)
  - [x] Check `AttemptsTable`, results tables, and related UI for inline green/red pass-fail spans; migrate to `Badge` where epic requires “Badge is sole pattern for status indicators”

- [x] Task 3: Grep + build (AC: #4, #5)
  - [x] Run targeted `rg` / epic grep commands; `npm run build`

## Dev Notes

### Prerequisite

- Stories **6.1** and **6.2** (tokens + Badge variants) must be satisfied so `variant="success" | "error"` render correctly.

### Anti-pattern

- Do not use `<span className="text-green-600">` / `text-red-500` for boolean outcomes anywhere in dashboard tables covered by this epic.

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Phase 3 pass/fail, Acceptance grep]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- `dashboard/page.tsx` Natija column already used `Badge variant="success|error"` and muted `—` placeholder; no code edits in this batch.
- Grep `text-green-` / `text-red-` under `app/dashboard/**/*.tsx`: zero matches.
- `npm run build`: success.

### File List

- _(no file edits — verified against current branch)_

## Change Log

- 2026-04-11: Story created — pass/fail uses Badge (Epic 6)
- 2026-04-11: Dev-story — verified ACs; status → `review`
