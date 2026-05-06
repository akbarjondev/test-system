# Epic 6: Design System Consistency

The admin dashboard speaks one visual language — semantic color tokens replace every hardcoded palette class, Badge and Card components are used consistently throughout, and every list page has a polished, uniform structure.

### Story 6.1: Add Semantic Status Color Tokens

As an admin dashboard maintainer,
I want semantic CSS tokens for success, error, and warning states,
So that status colors adapt correctly to light/dark mode and can be changed from one place.

**Acceptance Criteria:**

**Given** the file `apps/admin-dashboard/app/globals.css` is opened
**When** the dev adds `--success`, `--success-foreground`, `--error`, `--error-foreground`, `--warning`, `--warning-foreground` inside `:root {}`
**Then** each token has a valid OKLCH value matching the visual intent (green/red/amber)
**And** `.dark {}` contains matching dark-mode overrides for all six tokens
**And** `@theme inline {}` maps `--color-success`, `--color-error`, `--color-warning` (and foregrounds) to their CSS variable counterparts
**And** Tailwind utility classes `bg-success`, `text-success-foreground`, `bg-error`, `text-error-foreground`, `bg-warning`, `text-warning-foreground` are usable in component files

---

### Story 6.2: Migrate Badge Variants to Semantic Tokens

As a teacher viewing test results,
I want pass/fail/warning badges to render correctly in both light and dark mode,
So that status is always legible regardless of theme.

**Acceptance Criteria:**

**Given** Story 6.1 tokens are in place
**When** the dev updates `apps/admin-dashboard/components/ui/badge.tsx` lines 14–16
**Then** `success` variant uses `bg-success text-success-foreground` (not `bg-green-100 text-green-800`)
**And** `error` variant uses `bg-error text-error-foreground` (not `bg-red-100 text-red-800`)
**And** `warning` variant uses `bg-warning text-warning-foreground` (not `bg-orange-100 text-orange-700`)
**And** no hardcoded Tailwind palette color classes remain in `badge.tsx`
**And** all existing badge usages (`<Badge variant="success">`, etc.) render correctly without any changes to call sites

---

### Story 6.3: Refactor StatCard to Use Card Component

As a teacher viewing the dashboard home,
I want stat cards to look consistent with the rest of the dashboard's card surfaces,
So that the home page feels polished and adapts to dark mode correctly.

**Acceptance Criteria:**

**Given** the `StatCard` component in `apps/admin-dashboard/app/dashboard/page.tsx` (lines 39–46)
**When** the dev replaces the raw `div` with `<Card>` and `<CardContent className="pt-6">`
**Then** the label uses `text-muted-foreground` (not `text-zinc-500 dark:text-zinc-400`)
**And** the value text retains `text-4xl font-bold mt-1`
**And** normal cards use `border-border` via the Card component (not `border-zinc-200 dark:border-zinc-800`)
**And** warning cards use `border-warning` on the Card and `text-warning` on the value (not `border-amber-400` / `text-amber-500`)
**And** card backgrounds use `bg-card` via the Card component (not `bg-white dark:bg-zinc-900`)
**And** the stat grid layout (`grid grid-cols-2 sm:grid-cols-4 gap-4`) is preserved

---

### Story 6.4: Purge Hardcoded Gray Text Across Dashboard

As a developer maintaining the dashboard,
I want all secondary text to use the `text-muted-foreground` design token,
So that secondary text color is controlled from one place and dark mode works correctly everywhere.

**Acceptance Criteria:**

**Given** the dashboard pages in `apps/admin-dashboard/app/dashboard/`
**When** the dev replaces all instances of `text-gray-500`, `text-zinc-500`, and `text-zinc-400` with `text-muted-foreground`
**Then** a grep for `text-gray-500` and `text-zinc-500` in `app/dashboard/**` (excluding `ui/Sidebar.tsx`) returns zero results
**And** all affected text visually renders as secondary/muted text in both light and dark modes
**And** sidebar nav styles (`text-zinc-500` active/inactive states) are left unchanged — they use the sidebar token space intentionally

---

### Story 6.5: Standardize Table Wrappers with Token Classes

As a teacher viewing any list page,
I want tables to have a consistent visual container that matches the rest of the dashboard,
So that list pages look uniform regardless of which page I'm on.

**Acceptance Criteria:**

**Given** the recent attempts table wrapper in `apps/admin-dashboard/app/dashboard/page.tsx` (line 97)
**When** the dev replaces `border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900` with `border-border bg-card`
**Then** the table container renders with the correct themed border and background in both light and dark modes
**And** the `rounded-xl` and `overflow-hidden` classes are preserved

**Given** the students page `apps/admin-dashboard/app/dashboard/students/page.tsx`
**When** the dev wraps the existing `<Table>` in `<div className="rounded-xl border border-border overflow-hidden bg-card">`
**Then** the table has a consistent visual container matching other list pages

---

### Story 6.6: Replace Inline Pass/Fail Spans with Badge Component

As a teacher reviewing recent attempts on the dashboard home,
I want pass/fail status to use the same badge style as the test results page,
So that status indicators look consistent across the whole dashboard.

**Acceptance Criteria:**

**Given** Story 6.2 Badge variants are in place
**When** the dev updates `apps/admin-dashboard/app/dashboard/page.tsx` lines 133–142
**Then** `passed === true` renders `<Badge variant="success">O'tdi</Badge>` (not `<span className="text-green-600">`)
**And** `passed === false` renders `<Badge variant="error">O'tmadi</Badge>` (not `<span className="text-red-500">`)
**And** `passed === null` renders `<span className="text-muted-foreground text-sm">—</span>`
**And** no `text-green-*` or `text-red-*` classes remain in `dashboard/page.tsx`

---

### Story 6.7: Replace Hardcoded Role Colors with Badge in Students Page

As a teacher viewing the users list,
I want Admin and Student roles displayed as styled badges,
So that roles are immediately scannable and visually consistent with other status indicators.

**Acceptance Criteria:**

**Given** Story 6.2 Badge variants are in place
**When** the dev updates the role column in `apps/admin-dashboard/app/dashboard/students/page.tsx` (lines 63–70)
**Then** Admin role renders `<Badge variant="default">Admin</Badge>`
**And** Student role renders `<Badge variant="secondary">O'quvchi</Badge>`
**And** the hardcoded `text-blue-600 font-medium` and `text-gray-600` classes are removed
**And** both badges are correctly styled in light and dark modes

---

### Story 6.8: Add Styled Table Wrapper to Students Page

As a teacher viewing the users list,
I want the users table to have the same visual container as other list-page tables,
So that the students page looks consistent with the tests and attempts pages.

**Acceptance Criteria:**

**Given** the `<Table>` in `apps/admin-dashboard/app/dashboard/students/page.tsx`
**When** the dev wraps it in `<div className="rounded-xl border border-border overflow-hidden bg-card">`
**Then** the table has a rounded border container in both light and dark modes
**And** the existing table columns and data are unchanged
**And** the wrapper matches the pattern used on the dashboard home recent attempts table (after Story 6.5)

---

### Story 6.9: Migrate Question Option Colors to Token Classes

As a teacher reviewing a test's questions,
I want correct and incorrect options to use themed colors,
So that the question list renders correctly in both light and dark modes.

**Acceptance Criteria:**

**Given** Story 6.1 tokens are in place
**When** the dev updates question option rendering in `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx` (lines 118–122)
**Then** correct options (`option.isCorrect === true`) use `text-success` (not `text-green-600`)
**And** incorrect options (`option.isCorrect === false`) use `text-error` (not `text-red-500`)
**And** the option letter prefix (`a)`, `b)`, etc.) and option text are visually unchanged

---

### Story 6.10: Add Page Subtitles to Students and Tests List Pages

As a teacher navigating the dashboard,
I want every list page to have a subtitle under the heading,
So that pages feel polished and consistent with the dashboard home page.

**Acceptance Criteria:**

**Given** `apps/admin-dashboard/app/dashboard/students/page.tsx`
**When** the dev adds a subtitle `<p>` after the H1
**Then** the subtitle reads `"Barcha ro'yxatdan o'tgan foydalanuvchilar"` with classes `text-sm text-muted-foreground mt-1`
**And** the H1 retains `text-2xl font-bold` with `mb-1` (adjusted from `mb-6` since subtitle follows)

**Given** `apps/admin-dashboard/app/dashboard/tests/page.tsx`
**When** the dev adds a subtitle `<p>` after the H1
**Then** the subtitle reads `"Barcha testlar ro'yxati"` with classes `text-sm text-muted-foreground mt-1`
**And** the H1 retains `text-2xl font-bold` with `mb-1`

---
