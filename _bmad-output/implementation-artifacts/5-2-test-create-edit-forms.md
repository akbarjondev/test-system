# Story 5.2: Test Create & Edit Forms

Status: ready-for-dev

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

- [ ] Task 1: Find existing create and edit form components
  - [ ] Glob: `apps/admin-dashboard/app/dashboard/tests/new/**/*.tsx`
  - [ ] Glob: `apps/admin-dashboard/app/dashboard/tests/[id]/edit/**/*.tsx`
  - [ ] Read both to understand current field coverage

- [ ] Task 2: Add missing fields to both forms
  - [ ] **Test kodi** (`testPassword`): text input, max 3 chars, label "Test kodi (3 ta raqam)", helper "Talabalar ushbu kod orqali testga kiradi (ixtiyoriy)"
  - [ ] **Faqat bir marta topshirish** (`allowOnlyOneAttempt`): checkbox, label "Faqat bir marta topshirishga ruxsat"
  - [ ] **O'tish bali** (`passingScore`): number input, label "O'tish bali (ixtiyoriy)", helper "Agar ko'rsatilsa, talabalar shu baldan yuqori to'plasa, 'O'tdi' deb belgilanadi"
  - [ ] Ensure all EXISTING fields also have Uzbek labels (update if still in English)

- [ ] Task 3: Translate all existing field labels to Uzbek
  - [ ] Nomi (title), Tavsif (description), Har bir savol uchun ball (pointsPerQuestion), Vaqt chegarasi (timeLimitMinutes), Har doim mavjud (isAlwaysAvailable), Boshlanish vaqti (availableFrom), Tugash vaqti (availableUntil)

- [ ] Task 4: Add inline validation error messages in Uzbek
  - [ ] For required fields: "Bu maydon to'ldirilishi shart"
  - [ ] For testPassword: "Test kodi 3 ta raqamdan iborat bo'lishi kerak"
  - [ ] For passingScore: "O'tish bali musbat son bo'lishi kerak"

- [ ] Task 5: Update server actions to pass new fields
  - [ ] Ensure `apps/admin-dashboard/actions/tests.ts` sends `testPassword`, `allowOnlyOneAttempt`, `passingScore` (already done in Story 4.3 and 2.1 if those are merged)
  - [ ] If not yet done, add them now

- [ ] Task 6: Show success toast on redirect
  - [ ] After successful save, use `sonner` or `react-hot-toast` (whichever is installed) to show toast: "Test muvaffaqiyatli saqlandi"
  - [ ] Check what toast library is installed: grep `package.json` for "sonner" or "react-hot-toast"

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

### Completion Notes List

### File List
