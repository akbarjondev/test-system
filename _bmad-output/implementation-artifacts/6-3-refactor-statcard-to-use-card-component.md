# Story 6.3: Refactor StatCard to Use Card Component

Status: done

## Story

As an admin dashboard maintainer,
I want the dashboard home `StatCard` helper to use shadcn `Card` and `CardContent` instead of ad-hoc surface markup,
So that stat tiles follow the same surface/border tokens as the rest of the UI and stay theme-safe.

## Acceptance Criteria

1. **Given** `apps/admin-dashboard/app/dashboard/page.tsx`,
   **When** the `StatCard` component is rendered,
   **Then** its outer surface is `<Card>` with `<CardContent>` (from `@/components/ui/card`), not a raw `<div>` with hardcoded `bg-*` / `border-*` / `shadow-*` palette classes.

2. **Given** `StatCard` receives `warning={true}` (e.g. “Savolsiz testlar” &gt; 0),
   **When** viewing the card,
   **Then** the warning state uses token utilities — at minimum `border-warning` on the card and warning styling on the value text per epic (`text-warning` or equivalent token-based class). No `border-amber-*` / `text-amber-*` / `bg-orange-*`.

3. **Given** non-warning stat cards,
   **When** rendered,
   **Then** labels use `text-muted-foreground` for de-emphasized text (no `text-zinc-*` / `text-gray-*` on those labels).

4. **Given** `npm run build` in `apps/admin-dashboard`,
   **When** the command completes,
   **Then** exit code is 0.

## Tasks / Subtasks

- [x] Task 1: Implement or verify `StatCard` structure (AC: #1)
  - [x] Import `Card`, `CardContent` from `@/components/ui/card` if not already
  - [x] Wrap content in `<Card>` → `<CardContent className="pt-6">` per epic design notes (adjust spacing only if needed to match current layout)

- [x] Task 2: Warning and label tokens (AC: #2, #3)
  - [x] Align warning prop styling with epic token requirements
  - [x] Ensure label paragraph uses `text-muted-foreground`

- [x] Task 3: Build (AC: #4)
  - [x] `cd apps/admin-dashboard && npm run build`

## Dev Notes

### Prerequisite

- Semantic tokens from Story **6.1** for warning/border/text utilities.

### Epic excerpt (authoritative behavior)

[Source: `spec-epic-6-design-system.md` — Phase 3, `dashboard/page.tsx` StatCard + Story 6.3]

- Replace raw div stat surface with `Card` / `CardContent`
- Warning: `border-warning`, value: token-based warning color

### File scope

- **Primary:** `apps/admin-dashboard/app/dashboard/page.tsx` (`StatCard` only unless a missing import blocks build)

### Anti-patterns

- Do not reintroduce `bg-white`, `dark:bg-zinc-*`, or zinc border classes on StatCard

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Code Map, Phase 3]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- `StatCard` already used `Card` / `CardContent` with token warning styling; added `className="pt-6"` on `CardContent` to match epic spacing.
- `npm run build` and `npm run lint` succeeded (0 lint errors).

### File List

- `apps/admin-dashboard/app/dashboard/page.tsx`

## Change Log

- 2026-04-11: Story created — StatCard uses Card component (Epic 6)
- 2026-04-11: Dev-story — `CardContent` padding aligned; status → `review`
