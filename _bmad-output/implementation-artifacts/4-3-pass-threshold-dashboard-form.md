# Story 4.3: Pass Threshold Dashboard Form

Status: ready-for-dev

## Story

As a teacher,
I want to optionally set a minimum passing score when creating or editing a test,
So that the system can automatically evaluate student results.

## Acceptance Criteria

1. **Given** a teacher opens the test create or edit form,
   **When** the form renders,
   **Then** a `passingScore` number input is shown with Uzbek label: "O'tish bali (ixtiyoriy)"
   **And** helper text explains: "Agar ko'rsatilsa, talabalar shu baldan yuqori to'plasa, 'O'tdi' deb belgilanadi"

2. **Given** the teacher leaves `passingScore` empty and submits,
   **When** the form data is sent to the API,
   **Then** `passingScore` is sent as `null` and the test is saved without a threshold

3. **Given** the teacher enters a valid number and submits,
   **When** the form data is sent to the API,
   **Then** `passingScore` is persisted and shown correctly on the test detail page

## Tasks / Subtasks

- [ ] Task 1: Update `apps/admin-dashboard/actions/tests.ts`
  - [ ] Add `passingScore: z.number().positive().nullable().optional()` to the local `testSchema` Zod object
  - [ ] Ensure `createTest` and `updateTest` actions pass `passingScore` in the request body to the API
  - [ ] Transform: if `passingScore` is empty string or undefined, send `null`

- [ ] Task 2: Find and update the test create form component
  - [ ] Search for the test creation form in `apps/admin-dashboard/` (likely in `app/dashboard/tests/new/` or `components/`)
  - [ ] Add a number input field for `passingScore`:
    - Label: "O'tish bali (ixtiyoriy)"
    - Input type: `number`, min: 0
    - Helper text: "Agar ko'rsatilsa, talabalar shu baldan yuqori to'plasa, 'O'tdi' deb belgilanadi"
  - [ ] Follow existing field pattern in the form

- [ ] Task 3: Find and update the test edit form component
  - [ ] Search for the test edit form in `apps/admin-dashboard/` (likely in `app/dashboard/tests/[id]/edit/` or similar)
  - [ ] Add same `passingScore` field with pre-filled value from existing test data

- [ ] Task 4: Update test detail page to show passingScore
  - [ ] Find the test detail page component
  - [ ] Display `passingScore` value if set, or "Ko'rsatilmagan" if null

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/admin-dashboard/actions/tests.ts` | Add passingScore to schema and actions |
| `apps/admin-dashboard/app/dashboard/tests/new/page.tsx` (or similar) | Add passingScore input |
| `apps/admin-dashboard/app/dashboard/tests/[id]/edit/page.tsx` (or similar) | Add passingScore input with pre-fill |

**Note:** Dev agent must first glob/search for the actual form component file locations before editing.

### Action Schema Update

```ts
// In apps/admin-dashboard/actions/tests.ts
const testSchema = z.object({
  // ... existing fields
  passingScore: z.number().positive().nullable().optional(),
});
```

### Passing passingScore to API

```ts
// In createTest action body:
body: JSON.stringify({
  ...data,
  passingScore: data.passingScore ?? null,
  availableFrom: data.availableFrom?.toISOString() ?? null,
  availableUntil: data.availableUntil?.toISOString() ?? null,
}),
```

### Form Field Pattern (follow existing fields)

```tsx
<div>
  <label htmlFor="passingScore">O'tish bali (ixtiyoriy)</label>
  <input
    id="passingScore"
    type="number"
    name="passingScore"
    min={0}
    placeholder="Masalan: 70"
  />
  <p className="text-sm text-muted-foreground">
    Agar ko'rsatilsa, talabalar shu baldan yuqori to'plasa, 'O'tdi' deb belgilanadi
  </p>
</div>
```

### Dependency

Story 4.2 must be merged first — API must accept `passingScore`.

### References

- [Source: apps/admin-dashboard/actions/tests.ts] — Existing schema and action pattern
- Glob: `apps/admin-dashboard/app/dashboard/tests/**/*.tsx` — Find form components

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
