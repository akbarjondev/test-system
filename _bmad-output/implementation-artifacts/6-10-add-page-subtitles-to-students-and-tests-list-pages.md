# Story 6.10: Add Page Subtitles to Students and Tests List Pages

Status: done

## Story

As a teacher using the admin dashboard,
I want short subtitles under the main headings on the students and tests list pages,
So that each screen’s purpose is immediately clear without changing existing navigation or actions.

## Acceptance Criteria

1. **Given** `apps/admin-dashboard/app/dashboard/students/page.tsx`,
   **When** the page header renders,
   **Then** immediately after the `<h1>` there is a `<p className="text-sm text-muted-foreground mt-1 ...">` containing the subtitle copy specified in the epic (Uzbek text must match epic exactly — do not alter wording).

2. **Given** the same page,
   **When** inspecting the `<h1>` spacing,
   **Then** vertical rhythm matches epic: typically `mb-1` on `h1` (replacing larger `mb-*` if present) so the subtitle sits close to the title and the section below retains appropriate spacing (`mb-6` on subtitle block per epic guidance).

3. **Given** `apps/admin-dashboard/app/dashboard/tests/page.tsx`,
   **When** the header row renders inside the flex container with the “Yangi test” button,
   **Then** the left column contains `<h1>` followed by the epic’s subtitle `<p className="text-sm text-muted-foreground mt-1">` with exact Uzbek copy from the epic.

4. **Given** `npm run build` in `apps/admin-dashboard`,
   **Then** exit code 0.

## Tasks / Subtasks

- [x] Task 1: Students page header (AC: #1, #2)
  - [x] Compare against epic strings in `spec-epic-6-design-system.md`
  - [x] Adjust margins per epic Design Notes

- [x] Task 2: Tests list page header (AC: #3)
  - [x] Ensure flex layout still aligns button with title block; use `items-start` if needed

- [x] Task 3: Build (AC: #4)
  - [x] `npm run build`

## Dev Notes

### Exact copy (from epic — verify before implementing)

Epic specifies:

- **Students:** `Barcha ro'yxatdan o'tgan foydalanuvchilar` inside `<p className="text-sm text-muted-foreground mt-1">` after H1; `mb-6` on H1 changed to `mb-1` on H1 per epic.

- **Tests list:** `Barcha testlar ro'yxati` as subtitle; container `mb` adjustments per epic (“change H1 mb-10 on container to mb-6” — current file may differ; match **intent**: subtitle provides spacing; avoid double huge gaps).

Use typographic apostrophe characters **exactly as already used** in sibling files (`o't` vs `o&apos;t` — follow existing file convention for JSX escaping).

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Design Notes for tests/students pages]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- `students/page.tsx` and `tests/page.tsx` already include the epic subtitle copy with `text-sm text-muted-foreground mt-1` and heading spacing aligned with the design notes.
- `npm run build`: success.

### File List

- _(no file edits — verified compliant)_

## Change Log

- 2026-04-11: Story created — page subtitles students + tests (Epic 6)
- 2026-04-11: Dev-story — verified; status → `review`
