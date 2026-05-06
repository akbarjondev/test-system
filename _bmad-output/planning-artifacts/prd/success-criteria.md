# Success Criteria

### User Success

- **Teacher (Admin):** Can open **Students** and see **only their linked students**; **never** sees other teachers’ students or **staff accounts** on that page. Can open **Tests**, **Attempts**, and **home stats** and see **only** data scoped to them (per RBAC rules). Completes **profile** updates (e.g. name, phone, optional password change) without contacting a developer.
- **Super admin:** Can perform **platform-wide** actions defined in this PRD (e.g. see all students / assign links if specified); **no** accidental “every teacher is super admin.”
- **Student (Telegram Mini App):** Existing flows (register, unlock test, attempt, submit) **keep working**; no regression in channel stability.
- **Emotional bar:** Teachers describe the dashboard as **“clear who is mine”** — not “another user table.”

### Business Success

- **Adoption (org):** At least **one** deployment can onboard **≥2 teacher admins** with **isolated** data; super admin can operate the org without manual DB edits for routine linking (unless explicitly out of MVP).
- **Risk reduction:** **Zero** known **cross-teacher data leaks** in QA for roster, tests, attempts, and stats before release.
- **Maintainability:** New/changed **admin APIs** ship with **automated tests**; CI fails on scope regressions for defined scenarios.

### Technical Success

- **Schema:** `TeacherStudent` (or equivalent) in Prisma with migration; **Role** enum extended for **SUPER_ADMIN / ADMIN / STUDENT** (exact names as implemented) with a documented **migration path** for existing rows.
- **API:** Zod in `schemas.ts`; no inline schemas; errors match `{ error, code? }` / validation shape.
- **Tests:** Minimum agreed set: **401/403** matrix per route class, **cross-teacher isolation** cases, **profile** happy path + validation failures.
- **Code quality:** No new `console.log`; Prisma-only data access.

### Measurable Outcomes

| Outcome | Measure |
|--------|---------|
| Scope correctness | Automated tests assert **Admin A** cannot **GET** **Admin B’s** students / tests / attempts (by id). |
| Roster correctness | **Students** page: **0** rows with role **ADMIN** / **SUPER_ADMIN**; student count matches **linked** set for a teacher. |
| Profile | **PATCH/PUT** “me” returns **2xx** with valid body; invalid body → **400** with validation details. |
| Regression | Existing critical paths (login, test CRUD, attempt lifecycle) remain **green** in CI. |
