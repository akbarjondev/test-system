# Story 6.9: Migrate Question Option Colors to Token Classes

Status: done

## Story

As an admin dashboard maintainer,
I want correct/incorrect answer hints on the test detail question list to use semantic `text-success` / `text-error` tokens,
So that option coloring respects the design system and dark mode.

## Acceptance Criteria

1. **Given** `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx` (question options list),
   **When** rendering each option,
   **Then** correct options use `text-success` (via `cn(...)` or class string) and incorrect options use `text-error` — no `text-green-600`, `text-green-500`, `text-red-500`, or other raw green/red palette utilities for this purpose.

2. **Given** metadata labels on the same page (description, time limit, etc.),
   **When** using de-emphasized label styling,
   **Then** labels use `text-muted-foreground` — no `text-gray-500` / `text-gray-600` / `text-zinc-*` for those spans.

3. **Given** `npm run build` in `apps/admin-dashboard`,
   **Then** exit code 0.

## Tasks / Subtasks

- [x] Task 1: Verify or update option `cn()` classes (AC: #1)
  - [x] Locate `question.options.map` block
  - [x] Ensure `option.isCorrect` branch uses token classes only

- [x] Task 2: Muted labels (AC: #2)
  - [x] Sweep metadata `<span className=...>` labels in this file

- [x] Task 3: Build (AC: #3)
  - [x] `npm run build`

## Dev Notes

### Prerequisite

- Semantic `--success` / `--error` tokens from Story **6.1** and Tailwind mappings.

### File scope

- **Primary:** `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx`
- **Out of scope:** question editor forms except if grep shows green/red option preview there — then add subtask with file path

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — tests/[id]/page.tsx option colors]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- `tests/[id]/page.tsx`: options already use `text-success` / `text-error` via `cn()`; metadata labels already `text-muted-foreground`.
- `npm run build`: success.

### File List

- _(no file edits — verified compliant)_

## Change Log

- 2026-04-11: Story created — question option colors use tokens (Epic 6)
- 2026-04-11: Dev-story — verified; status → `review`
