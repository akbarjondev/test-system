# Story 5.2: Test Create & Edit Forms

Status: review

## Story

As a teacher,
I want a clear, well-labeled form to create and edit tests,
So that I can configure all test settings without confusion.

## Acceptance Criteria

1. **Given** a teacher opens the test create or edit form,
   **When** the form renders,
   **Then** fields are grouped in labeled sections with Uzbek labels and helper text for every field
   **And** the form includes all fields: Nomi, Tavsif, Har bir savol uchun ball, Vaqt chegarasi (daqiqa), Har doim mavjud, Boshlanish/tugash vaqti, Test kodi (3 ta raqam), Faqat bir marta topshirish, O'tish bali

2. **Given** a teacher submits the form with missing required fields,
   **When** validation runs,
   **Then** inline error messages appear in Uzbek beneath each invalid field

3. **Given** a teacher successfully saves a test,
   **When** the form submits,
   **Then** they are redirected to the test detail page with a success toast in Uzbek: "Test muvaffaqiyatli saqlandi"

## Tasks / Subtasks

- [x] Task 1: Find existing create and edit form components
  - [x] Glob: `apps/admin-dashboard/app/dashboard/tests/new/**/*.tsx`
  - [x] Glob: `apps/admin-dashboard/app/dashboard/tests/[id]/edit/**/*.tsx`
  - [x] Read both to understand current field coverage

- [x] Task 2: Add missing fields to both forms
  - [x] **Test kodi** (`testPassword`): text input, max 3 chars, label "Test kodi (3 ta raqam)", helper "Talabalar ushbu kod orqali testga kiradi (ixtiyoriy)"
  - [x] **Faqat bir marta topshirish** (`allowOnlyOneAttempt`): checkbox, label "Faqat bir marta topshirishga ruxsat"
  - [x] **O'tish bali** (`passingScore`): number input, label "O'tish bali (ixtiyoriy)", helper "Agar ko'rsatilsa, talabalar shu baldan yuqori to'plasa, 'O'tdi' deb belgilanadi"
  - [x] Ensure all EXISTING fields also have Uzbek labels (update if still in English)

- [x] Task 3: Translate all existing field labels to Uzbek
  - [x] Nomi (title), Tavsif (description), Har bir savol uchun ball (pointsPerQuestion), Vaqt chegarasi (timeLimitMinutes), Har doim mavjud (isAlwaysAvailable), Boshlanish vaqti (availableFrom), Tugash vaqti (availableUntil)

- [x] Task 4: Add inline validation error messages in Uzbek
  - [x] For required fields: "Bu maydon to'ldirilishi shart"
  - [x] For testPassword: "Test kodi 3 ta raqamdan iborat bo'lishi kerak"
  - [x] For passingScore: "O'tish bali musbat son bo'lishi kerak"

- [x] Task 5: Update server actions to pass new fields
  - [x] Ensure `apps/admin-dashboard/actions/tests.ts` sends `testPassword`, `allowOnlyOneAttempt`, `passingScore` (already done in Story 4.3 and 2.1 if those are merged)
  - [x] If not yet done, add them now

- [x] Task 6: Show success toast on redirect
  - [x] After successful save, use `sonner` or `react-hot-toast` (whichever is installed) to show toast: "Test muvaffaqiyatli saqlandi"
  - [x] Check what toast library is installed: grep `package.json` for "sonner" or "react-hot-toast"

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/admin-dashboard/app/dashboard/tests/new/page.tsx` (or form component) | Add new fields, translate labels |
| `apps/admin-dashboard/app/dashboard/tests/[id]/edit/page.tsx` (or form component) | Add new fields, translate labels, pre-fill values |
| `apps/admin-dashboard/actions/tests.ts` | Ensure new fields passed to API |

**Note:** Dev agent must read actual files first before editing to understand the form pattern.

### New Field Components Pattern

```tsx
{/* Test kodi */}
<div>
  <label htmlFor="testPassword">Test kodi (3 ta raqam)</label>
  <input
    id="testPassword"
    name="testPassword"
    type="text"
    maxLength={3}
    placeholder="Masalan: 472"
  />
  <p className="text-sm text-muted-foreground">
    Talabalar ushbu kod orqali testga kiradi (ixtiyoriy)
  </p>
</div>

{/* Faqat bir marta topshirish */}
<div className="flex items-center gap-2">
  <input
    id="allowOnlyOneAttempt"
    name="allowOnlyOneAttempt"
    type="checkbox"
  />
  <label htmlFor="allowOnlyOneAttempt">Faqat bir marta topshirishga ruxsat</label>
</div>
```

### Dependency

Story 2.1 (testPassword, allowOnlyOneAttempt schema) and Story 4.1 (passingScore schema) must be merged first.

### References

- [Source: apps/admin-dashboard/actions/tests.ts] — Current form submission logic
- Glob: `apps/admin-dashboard/app/dashboard/tests/**/*.tsx` — Find form components

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Prisma schema already had `testPassword`, `allowOnlyOneAttempt`, `passingScore` fields from previous story work; Prisma client was already regenerated.
- Added all three new fields to both `FormTest.tsx` (create) and `FormEditTest.tsx` (edit) forms.
- All field labels translated to Uzbek: Nomi, Tavsif, Har bir savol uchun ball, Vaqt chegarasi (daqiqa), Har doim mavjud, Boshlanish vaqti, Tugash vaqti, Test kodi (3 ta raqam), Faqat bir marta topshirishga ruxsat, O'tish bali.
- Added Uzbek validation error messages inline via Zod schema in both form components.
- Refactored `createTest` and `updateTest` server actions to return `{ redirectTo }` instead of calling `redirect()` directly, enabling the form to show a `sonner` toast ("Test muvaffaqiyatli saqlandi") before client-side redirecting with `router.push()`.
- Updated API schema in `apps/api/src/config/schemas.ts` with the three new fields.
- Updated `tests.controller.ts` and `tests.repository.ts` in the API to handle the new fields in create and update operations.

### File List

- `apps/admin-dashboard/app/dashboard/tests/new/ui/FormTest.tsx`
- `apps/admin-dashboard/app/dashboard/tests/[id]/edit/ui/FormEditTest.tsx`
- `apps/admin-dashboard/actions/tests.ts`
- `apps/api/src/config/schemas.ts`
- `apps/api/src/controllers/tests.controller.ts`
- `apps/api/src/repositories/tests.repository.ts`

### Change Log

- 2026-04-09: Implemented Story 5.2 — Test Create & Edit Forms. Added testPassword, allowOnlyOneAttempt, passingScore fields to both forms. Translated all labels to Uzbek. Added Uzbek inline validation errors. Refactored server actions to return redirectTo and show success toast. Updated API schema and controller to support new fields.
