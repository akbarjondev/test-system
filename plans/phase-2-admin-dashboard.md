# Phase 2 — Admin Dashboard Completion

**Goal:** Every admin CRUD flow works end-to-end in the web UI.
**Depends on:** Phase 1
**Blocks:** Phase 5 (E2E tests), Phase 6 (deployment)

---

## Context

The dashboard currently supports creating tests and questions. All edit/delete actions are commented out. There is no user management UI, no admin creation flow, and missing UX elements (breadcrumbs, loading states, error pages). This phase completes the admin experience.

---

## Tasks

### 2.1 — Edit test page
**Files:** `apps/admin-dashboard/app/dashboard/tests/[id]/edit/page.tsx` (create), `apps/admin-dashboard/actions/tests.ts`

- New page at `/dashboard/tests/[id]/edit`
- Pre-populate all form fields by fetching the existing test from the API (`GET /api/tests/:testId`)
- Reuse `FormTest` component or extract a shared form — accept initial values as props
- Add `updateTest` server action that calls `PUT /api/tests/:testId`
- On success redirect to test detail; on error show toast
- Add "Edit" button/link on the test detail page (`[id]/page.tsx`)

---

### 2.2 — Delete test action
**Files:** `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx`, `apps/admin-dashboard/actions/tests.ts`

- Uncomment the delete button on the test detail page
- Add `deleteTest(testId)` server action calling `DELETE /api/tests/:testId`
- Show a confirmation dialog (use a simple `AlertDialog` from Radix UI or a `window.confirm` as a first pass) before deleting
- On success redirect to `/dashboard/tests`; on error show toast

---

### 2.3 — Edit question page
**Files:** `apps/admin-dashboard/app/dashboard/tests/[id]/questions/[questionId]/edit/page.tsx` (create), `apps/admin-dashboard/actions/questions.ts`

- New page at `/dashboard/tests/[id]/questions/[questionId]/edit`
- Pre-populate form with existing question data (`GET /api/questions/:questionId`)
- Reuse or extend `FormQuestion` component to accept initial values
- Add `updateQuestion` server action calling `PUT /api/questions/:questionId`
- Add "Edit" button next to each question on the test detail page

---

### 2.4 — Delete question action
**Files:** `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx`, `apps/admin-dashboard/actions/questions.ts`

- Uncomment the delete button next to each question on the test detail page
- Add `deleteQuestion(questionId)` server action calling `DELETE /api/questions/:questionId`
- Confirm before deleting; on success revalidate the page; on error show toast

---

### 2.5 — Admin user management page
**Files:** `apps/admin-dashboard/app/dashboard/users/page.tsx` (create), `apps/admin-dashboard/actions/users.ts` (create)

- New page at `/dashboard/users`
- List all users in a table: email, role, created date
- Support changing a user's role (ADMIN ↔ STUDENT) via a dropdown or toggle
- Add `updateUserRole(userId, role)` server action calling `PUT /api/users/:userId`
- Add navigation link "O'quvchilar" in dashboard layout nav (it already exists in the nav — wire it to this page)

---

### 2.6 — Admin seed command
**File:** `apps/api/src/scripts/seed-admin.ts` (create), or add npm script

- CLI script: `npx ts-node apps/api/src/scripts/seed-admin.ts email@example.com password`
- Creates a user with `ADMIN` role if one doesn't already exist
- Print success/already-exists message
- Add `"seed:admin": "ts-node -r tsconfig-paths/register src/scripts/seed-admin.ts"` script to `apps/api/package.json`
- Document in README

---

### 2.7 — UX polish: breadcrumbs, logo, loading/error pages

**Breadcrumbs + logo:**
- `apps/admin-dashboard/app/dashboard/layout.tsx` — add a logo (text or SVG) and breadcrumb component (TODO noted in code)
- Breadcrumbs should reflect current path: `Dashboard / Tests / [test title] / Edit`

**Loading states:**
- Add `loading.tsx` to: `app/dashboard/`, `app/dashboard/tests/`, `app/dashboard/tests/[id]/`, `app/dashboard/users/`
- Use skeleton cards/table rows (Tailwind `animate-pulse`)

**Error pages:**
- Add `error.tsx` to the same directories above
- Show a friendly Uzbek error message with a retry button

---

### 2.8 — Refactor tests list page fetch
**File:** `apps/admin-dashboard/app/dashboard/tests/page.tsx`

- Extract the `fetch` call into a typed async helper function (e.g., `getTests(page, limit)`)
- Wrap in try-catch; on error return empty list and show an error banner
- This is a noted TODO in the existing code

---

## Definition of Done

- [ ] Admin can edit and delete any test
- [ ] Admin can edit and delete any question
- [ ] Admin can view all users and change roles
- [ ] First admin account can be created via seed script
- [ ] Dashboard layout has breadcrumbs and a logo
- [ ] All data pages have loading skeletons and error fallbacks
- [ ] Tests list fetch handles API errors gracefully
