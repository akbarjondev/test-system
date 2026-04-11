# Story 6.8: Add Styled Table Wrapper to Students Page

Status: done

## Story

As an admin dashboard maintainer,
I want the students list table wrapped in the standard token-based rounded container,
So that the layout matches other dashboard tables and uses `border-border` / `bg-card` instead of raw browser defaults.

## Acceptance Criteria

1. **Given** `apps/admin-dashboard/app/dashboard/students/page.tsx` with at least one user row,
   **When** the table renders,
   **Then** `<Table>` is wrapped in `<div className="rounded-xl border border-border overflow-hidden bg-card">` per Story 6.5 pattern.

2. **Given** the empty state (`users.length === 0`),
   **When** rendered,
   **Then** the empty-state message is **outside** that wrapper (wrapper only around `<Table>` when the table exists).

3. **Given** `npm run build`,
   **Then** exit code 0.

## Tasks / Subtasks

- [x] Task 1: Verify or add wrapper (AC: #1, #2)
  - [x] Adjust conditional JSX so wrapper only wraps table branch

- [x] Task 2: Build (AC: #3)
  - [x] `npm run build`

## Dev Notes

### Overlap

- Strong overlap with **Story 6.5** — if Dev Agent runs both in one branch, implement once and mark both stories’ tasks complete with a single coherent commit sequence (Completion Notes must state that).

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Students page table wrapper]
- Story 6.5 in same folder for wrapper class string

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- Confirmed conditional: empty state is outside the wrapper; table branch uses `rounded-xl border border-border overflow-hidden bg-card` around `<Table>` only.
- `npm run build`: success.

### File List

- _(no file edits — already matched epic pattern)_

## Change Log

- 2026-04-11: Story created — students table wrapper (Epic 6)
- 2026-04-11: Dev-story — verified; status → `review`
