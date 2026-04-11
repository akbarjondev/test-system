---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
visionNotes:
  userAddendum: "AI platform and quiz for learners"
inputDocuments:
  - _bmad-output/project-context.md
  - _bmad-output/planning-artifacts/epics.md
workflowType: prd
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 2
classification:
  projectType: saas_b2b
  projectTypeNarrative: Multi-teacher admin platform; single-organization deployment is acceptable for v1.
  domain: edtech
  complexity: medium
  projectContext: brownfield
  primaryDeliveryRisks:
    - Authorization and data scope must stay consistent across student roster, tests, attempts, and dashboard statistics (no mixed global vs scoped behavior).
  complianceNote: Treat student PII (e.g. phone, Telegram identity) with standard data-protection practices; formal COPPA or FERPA scope is out of band unless the product explicitly targets regulated minors.
partyModeRefinementAccepted: true
---

# Product Requirements Document - test-system

**Author:** Akbar
**Date:** 2026-04-11

> **Traceability:** Executive Summary → [Success Criteria](#success-criteria) (incl. [Product Scope](#product-scope)) → [User Journeys](#user-journeys) → [Functional Requirements](#functional-requirements) and [Non-Functional Requirements](#non-functional-requirements).

## Executive Summary

**test-system** is a **brownfield** **edtech** platform: teachers run **tests** and see **results** through a **Next.js admin dashboard** (Uzbek UI), backed by an **Express API** and **PostgreSQL (Prisma)**; **students** take assessments through a **Telegram Mini App** (Telegram-native experience; bot flows may coexist per deployment). There is **no** student-facing web app in the admin product surface. A **Flutter** mobile app for learners is **planned** as a future client on the **same** API rules. The near-term product push is **trustworthy multi-teacher operation** on one deployment: **explicit teacher–student relationships**, **role-based access (e.g. super admin vs teacher admin vs student)**, and **strictly scoped data** so each teacher sees **their students, their tests, and their attempts**—with **dashboard statistics** following the **same** scope rules. Teachers get a **profile** area to maintain their own information safely. The **students** roster page becomes a **student-focused** experience: **no staff rows**, **no role column**, **no actions column**, and **no in-row promotion to admin**—reducing accidental privilege escalation and cognitive load.

**Release focus (this PRD cycle):** ship **scoped multi-teacher access** (teacher–student links, role model, consistent filtering for **students, tests, attempts, stats**), **staff profile** self-service, **students page** UX cleanup (no staff on roster, no promote-to-admin, no role/actions columns), and **automated API tests** for changed surfaces and **cross-teacher isolation**. **Strategic direction:** evolve toward an **AI-assisted learning and quiz** layer for learners (practice, feedback, personalization—**specific capabilities and governance TBD** in follow-on requirements). **MVP does not depend on shipping production ML**; any near-term AI must be **additive**, **optional**, and **subordinate** to teacher-defined assessments and visibility rules. **Human-authored tests remain the source of truth** for high-stakes assessment; AI must not **silently substitute** teacher intent—where AI touches items learners see in real attempts, **teacher review and logging** apply as specified in later sections.

### What Makes It Special

- **Ownership by design:** A **teacher–student relation** (not a flat global user list) matches how schools think about classes.
- **One authorization story:** Roster, tests, attempts, and stats **must not disagree** on who may see what (avoid “scoped students / global tests”).
- **Low friction for learners:** **Telegram-native** flows for registration and test-taking; **JWT**-secured API for all clients.
- **Safer, calmer admin UX:** Roster is for **learners**, not RBAC experimentation; **profile** self-service for staff.
- **Quality bar:** **Automated tests** for **changed APIs** and critical scope rules (cross-teacher isolation, role matrix).
- **Forward path:** Positioning as an **AI + quiz** platform for learners differentiates long-term value beyond a static quiz engine.
- **Compared to Telegram + sheets:** institutional **ownership** of classes and outcomes, not just messaging.

## Project Classification

| Dimension | Value |
|-----------|--------|
| **Project type** | **saas_b2b** — multi-teacher **admin platform** (SaaS-shaped); **single organization** per deployment is acceptable for **v1**. |
| **Domain** | **edtech** — formal/informal **assessment** and learning outcomes. |
| **Complexity** | **medium** — RBAC, relational assignment model, migration, consistent scoping across modules, optional **AI** capabilities increase design discipline (safety, evaluation, cost). |
| **Project context** | **brownfield** — extends an existing monorepo (`apps/api`, `apps/admin-dashboard`, `apps/telegram-bot`, `packages/database`, shared packages). |
| **Primary delivery risk** | **Authorization consistency** across roster, tests, attempts, and statistics. |
| **Compliance note** | **Standard** protection of student **PII** (e.g. phone, Telegram identity); **COPPA/FERPA-grade** obligations only if the product explicitly targets regulated minors. |

## Success Criteria

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

## Product Scope

### MVP — Minimum Viable Product

- **RBAC:** Three roles + middleware/helpers; dashboard and admin APIs reject **STUDENT** where appropriate.
- **Teacher–student:** Persisted relation table; **rules** for listing students per teacher; super-admin behavior documented.
- **Scoped reads:** **Tests**, **attempts list**, **stats/home** aligned with **same** ownership model as students.
- **Students UI:** **DataTable**-style list (or equivalent), search/sort/pagination; **remove** Rol, Amallar, promote-to-admin.
- **Profile:** Staff **profile** page + API for self-update (fields as specified in implementation).
- **Tests:** API test suite coverage for **changed** endpoints and isolation cases above.
- **Assignment v1:** Document **one** rule for populating links (e.g. super assigns, or env default teacher for new Telegram users) — smallest shippable rule.

### Growth Features (Post-MVP)

- **Bulk** import/export of students; **self-service** invite codes per teacher.
- **Flutter** client parity for students (if not MVP).
- **Analytics:** richer reporting, exports, cohort views.
- **AI (light):** e.g. **draft practice questions** with **teacher approve** before publish — still no silent swap of summative items.

### Vision (Future)

- **AI platform:** personalized **quiz / practice** paths, feedback, possibly multilingual support; **governance** (model choice, cost, audit, content safety) as first-class requirements.
- **Multi-tenant SaaS:** org billing, self-serve org signup, regional compliance if markets expand.

## User Journeys

### Journey 1 — Teacher Madina (happy path: “my class, my data”)

**Opening:** Madina logs into the admin dashboard after the update. Before, the “Foydalanuvchilar” page felt like a mixed list and made her worry she was seeing everyone in the city.

**Rising action:** She opens **Students**. The table shows **only learners linked to her**, with search and pagination. She opens **Tests** and **Natijalar** — only **her** tests and attempts appear. Home totals match what she expects from **her** activity.

**Climax:** She realizes she can **trust the numbers**: a colleague’s student never flashes on her screen.

**Resolution:** She updates her **profile** (name/phone) without asking IT. She tells the director: “Bu endi mening sinfim.”

**Failure / recovery:** If a student should appear but does not, she contacts the **super admin** to fix the **teacher–student link** (per MVP assignment rule).

---

### Journey 2 — Super admin Jasur (platform governance)

**Opening:** Jasur needs two math teachers, Madina and Sardor, working in the same deployment **without** seeing each other’s rosters.

**Rising action:** He confirms both are **ADMIN** (not super). New students arrive via **Telegram**; per the agreed **v1 assignment rule**, Jasur **creates or confirms** `TeacherStudent` rows so each learner sits under the right teacher.

**Climax:** Sardor tries a deep link to a test ID Madina owns — **403** or empty, not a silent leak.

**Resolution:** Jasur can audit “who owns whom” from a **super-admin view** (exact UI TBD) without raw SQL.

---

### Journey 3 — Student Dilshod (Telegram, core + edge)

**Opening:** Dilshod opens the **Telegram Mini App** on his phone — no student website in the admin product.

**Rising action (happy path):** He completes **Telegram onboarding**, unlocks a test with the **3-digit code**, takes the attempt, submits, sees score / pass-fail when configured.

**Edge:** He mistypes the code — bot says wrong code, **no** server error. His session survives **grammY** / Telegram hiccups (existing error boundary).

**Climax / resolution:** He never needs an admin account; **STUDENT** token cannot open dashboard admin APIs (**403**).

---

### Journey 4 — Teacher Sardor (abuse / mistake path)

**Opening:** Sardor bookmarked an old URL pattern or guesses another teacher’s resource id.

**Rising action:** He hits **Students**, **GET test**, **GET attempts** for resources not his.

**Climax:** Every response is **403** or empty list — never **200** with another teacher’s rows.

**Resolution:** He reports “broken link” to Jasur; Jasur explains scope — no data breach occurred.

---

### Journey 5 — API / CI (regression sentinel) — *technical persona*

**Opening:** A developer ships a change to `GET /api/...` list endpoints.

**Rising action:** CI runs **JWT-forged** tests: **Admin A** token vs **Admin B** resource ids.

**Climax:** Build **fails** if a list or detail leaks cross-scope.

**Resolution:** Release blocked until fixed — aligns with “zero known cross-teacher leaks.”

---

### Journey Requirements Summary

| Area | Capabilities implied |
|------|------------------------|
| **AuthZ** | Role matrix (`SUPER_ADMIN`, `ADMIN`, `STUDENT`); consistent rules on students, tests, attempts, stats. |
| **Data** | `TeacherStudent` (or equivalent); migration; documented rule for **new Telegram users** ↔ teacher. |
| **Dashboard** | Scoped lists; **Students** UX (DataTable, no staff, no role/actions, no promote); **Profile** page + API. |
| **API** | Scoped queries/middleware; Zod; standardized errors. |
| **Quality** | Automated tests for isolation + role matrix + profile; CI gate. |
| **Telegram student channel** | Preserve stable Mini App / bot flows; global error handling unchanged or improved. |
| **Future** | AI / practice quiz journeys **out of MVP** unless explicitly pulled in with governance stories. |

## Domain-Specific Requirements

### Compliance & regulatory

- **Baseline:** Handle **student PII** (e.g. **phone**, **Telegram ID**, **full name**) with least privilege, encryption in transit (HTTPS), and **no unnecessary duplication** in logs or client storage.
- **COPPA / FERPA / regional education law:** **Out of scope for MVP** unless the product **explicitly** serves regulated minors or institutional customers requiring those frameworks — then trigger a **separate compliance epic** (consent, retention, DPA, data residency).
- **Assessment integrity:** Teacher-defined **summative** tests remain authoritative; any **AI-assisted** content in future phases must not **override** stored teacher items without an **audited** publish path.

### Technical constraints

- **Access control:** RBAC + resource scoping as in Success Criteria; **defense in depth** (API + UI) for roster and results.
- **Privacy UX:** Admin dashboard in **Uzbek** for teacher comprehension; avoid exposing **internal IDs** in user-visible errors unless needed for support.
- **Accessibility:** Target **WCAG-oriented** practices for new dashboard work (contrast via design tokens, keyboard reachability for tables/forms) — exact WCAG level can be a **post-MVP** certification goal.
- **Retention:** Document default **retention stance** for attempts and PII (keep current DB behavior unless legal requires deletion workflows).

### Integration requirements

- **Telegram:** Remain compatible with **grammY** session model and **Bot API** limits; no breaking change to student auth contract without migration notes.
- **API consumers:** Admin dashboard and Telegram bot today; **Flutter** in vision — shared **JWT** contract must stay version-stable for mobile.

### Risk mitigations

| Risk | Mitigation |
|------|------------|
| Cross-teacher data leak | Scoped queries, middleware, **automated isolation tests**, code review on list endpoints. |
| Wrong student–teacher assignment | Super-admin **audit** path; clear **MVP rule** for link creation; optional confirmation UI. |
| AI scope creep | PRD gates: **MVP** = no production ML requirement; AI stories need **governance** + teacher review. |
| Accessibility debt | Reuse **tokenized** UI patterns; avoid hardcoded grays; table semantics preserved in Students refactor. |

## Innovation & Novel Patterns

### Detected innovation areas

1. **Channel mix:** High-stakes or class **assessment** orchestrated from a **teacher web console**, consumed by **students in the Telegram Mini App** (not a student web app) — reduces friction for the learner segment you serve while keeping **institutional** control in the dashboard.
2. **Governed multi-teacher SaaS on one stack:** **Explicit teacher–student relationships** plus **scoped** tests/attempts/stats — “**boring**” data model, but **uncommon** in small Telegram-first products, which usually collapse to one global admin.
3. **AI trajectory (post-MVP / gated):** Move from static quizzes toward an **AI-assisted practice and quiz** experience — **personalization**, **feedback**, possibly **generation** — with PRD-enforced **teacher review** and **no silent substitution** of summative items. Aligns with project-type signal **AI agents** as **assistive**, not autonomous graders of record without policy.

### Market context & competitive landscape

- **Adjacent:** Generic form builders, Google Forms, simple quiz bots — weak on **class ownership**, **scoped staff**, and **integrity** across channels.
- **Differentiator:** **Ownership + scope + Telegram UX** in one product; **AI** as a **layer** on trusted data, not a replacement for the teacher’s test bank for official results.

### Validation approach

- **MVP validation:** **Two-teacher** deployment; **manual + automated** checks for isolation; teacher **interviews** (short) on “is this only my class?”
- **AI validation (when built):** Offline eval on **draft** content; **A/B** or pilot with **opt-in** teachers; **human sign-off** before learner-visible items tied to grades.

### Risk mitigation

| Risk | Fallback |
|------|----------|
| AI hallucinations in learner-facing content | **Teacher approve**; **staging**; disable feature flag. |
| Over-automation erodes trust | Default **human-authored** tests for graded attempts; AI limited to **practice** until policy changes. |
| Scope creep | **MVP** ships **RBAC + links + UI + tests** first; AI epics **gated** on governance doc. |

## SaaS B2B Specific Requirements

### Project-Type Overview

**test-system** matches **SaaS B2B**: multiple **staff** users (super admin, teachers), **student** end users, shared **platform** services (API + DB + bot), and **organization-style** data boundaries. **v1** explicitly allows **single-organization** deployment; the architecture should **not** block a later **multi-tenant** evolution (org id, namespacing, or equivalent) without rewriting core authorization.

### Technical architecture considerations

- **API-first contract:** Dashboard and Telegram (and future Flutter) are **clients** of the same **JWT**-secured REST API; versioning and breaking-change discipline apply as client count grows.
- **Horizontal concerns:** Rate limiting, structured errors, observability (without `console.log` in committed code), and **CI** as the gate for **scope regressions** match B2B expectations for stability.

### Tenant model

| Stage | Model |
|-------|--------|
| **MVP** | **Single org** per deployment: one logical “school” or operator, **multiple teacher admins**, shared student pool partitioned by **teacher–student links** and **resource ownership** (`Test.createdById`, etc.). |
| **Growth** | Optional **org** / **tenant** key on major aggregates if multi-customer SaaS is pursued; migrations planned so links and tests remain consistent. |

### RBAC matrix (summary)

Legend: **Yes** = in scope for that role when policies are complete; **TBD** = requires explicit implementation spec.

| Capability | SUPER_ADMIN | ADMIN (teacher) | STUDENT |
|------------|-------------|-----------------|---------|
| Dashboard (staff) | Yes | Yes | No |
| View all students (platform) | Yes (definition TBD) | No — **linked only** | N/A |
| Assign teacher–student links | Yes (MVP) | No unless explicitly allowed | No |
| CRUD own tests | Yes / all per policy | **Own** tests | No |
| View attempts | Scoped per policy | **Own** tests’ attempts | **Own** attempts |
| Profile (self) | Yes | Yes | N/A (student profile out of dashboard scope) |
| Promote users to admin from roster | Policy-based (not from `/students` UI) | No | No |

*Exact matrix is implemented in middleware + services; this table is the PRD contract.*

### Subscription tiers

- **MVP:** **Not in scope** — no billing, plans, or seat enforcement in this PRD cycle.
- **Vision:** If SaaS monetization is needed later, add **subscription_tiers**, metering, and admin UX as a **separate** epic without blocking current RBAC work.

### Integration list

| System | Role |
|--------|------|
| **PostgreSQL (Prisma)** | System of record |
| **Telegram (Mini App / Bot API)** | Student onboarding, test unlock, attempt UX at release |
| **Flutter mobile (roadmap)** | Additional student client; same assessment API contract |
| **Next.js admin dashboard** | Teacher + super admin UI |
| **Future AI provider(s)** | Optional; feature-flagged; governance in Domain + Innovation sections |

### Compliance requirements (B2B lens)

- Cross-reference **Domain-Specific Requirements**: PII handling, optional COPPA/FERPA expansion, assessment integrity.
- **Audit:** Super-admin actions on **assignments** and **role changes** should be **loggable** in a future iteration; MVP minimum is **application correctness** and **no silent cross-scope reads**.

### Implementation considerations

- **Permission checks** live in **services** (throw → controller maps to 403/404); **repositories** stay Prisma-only.
- **Avoid** “admin sees all” shortcuts in new code paths; **super admin** is the only bypass class where platform-wide read is intended.
- **Skip for this type (per CSV):** **CLI** as a primary surface; **mobile-first** admin UX — dashboard remains **responsive** but not native-app-first in MVP.

## Project Scoping & Phased Development

MVP **deliverables** align with **Product Scope** under [Success Criteria](#success-criteria); this section adds **release philosophy**, **journey coverage**, and **risk-based** tradeoffs. **Product Scope** bullets remain the **normative** MVP checklist; this section is **non-normative** (strategy, journeys, risks).

### MVP strategy & philosophy

**MVP approach:** **Problem-solving / platform integrity MVP** — the smallest release where **two teacher admins** (plus one **super admin**) can operate on one deployment with **credible data separation** (students, tests, attempts, stats) and **no standalone student web property in the admin monorepo**; students use **approved clients** (Telegram Mini App at release, Flutter on the roadmap). “Useful” means teachers **trust** the roster and results; “potential” means the stack can add **billing, multi-tenant orgs, and AI** without undoing RBAC.

**Resource requirements (indicative):** **1 backend-focused** engineer (API + Prisma + tests), **1 frontend-focused** engineer (Next dashboard), **shared** QA mindset via CI; super-admin assignment workflows can be **UI-light** in MVP if a documented **manual or seed path** exists.

### MVP feature set (Phase 1)

**Core user journeys supported:** **Journeys 1–5** at minimum — teacher scoped day, super-admin assignment, Telegram student happy path + code error, cross-teacher **403** path, CI isolation sentinel.

**Must-have capabilities:**

1. **Roles:** `SUPER_ADMIN`, `ADMIN`, `STUDENT` with JWT and middleware alignment across admin routes.
2. **Teacher–student persistence:** Join model + migration + listing rule per teacher; super-admin inclusive listing per PRD.
3. **Scoped resources:** Tests, attempts aggregates/lists, dashboard stats use **same** scope model as students.
4. **Students page:** Students only; **DataTable** UX; **no** Rol / Amallar / promote-to-admin.
5. **Staff profile:** Self-service read/update (+ validation) for agreed fields.
6. **Assignment rule v1:** One documented rule (super assigns and/or default teacher for new Telegram users).
7. **Automated API tests:** Role matrix + cross-teacher isolation + profile + regression on critical paths.
8. **Telegram:** No regression to student flows; existing global error handling preserved or improved.

**Explicitly out of MVP:** **Subscription / billing**, **production ML**, **full audit log product**, **WCAG certification**, **multi-tenant org self-signup**.

### Post-MVP features

**Phase 2 (growth):** Bulk student import/export; teacher invite codes; richer analytics exports; Flutter client parity if prioritized; **lightweight AI** (draft practice items with **teacher approve**); optional **audit trail** for super-admin assignments.

**Phase 3 (expansion):** **AI platform** capabilities (personalized practice, feedback at scale) with **governance** (model choice, cost, safety); **multi-tenant SaaS** (orgs, billing); deeper **compliance** packages if market requires.

### Risk mitigation strategy

| Category | Mitigation |
|----------|------------|
| **Technical** | Scope services first; **tests before UI polish**; feature flags only where needed; avoid raw SQL. |
| **Market / user trust** | **Two-teacher pilot** + scripted isolation demos; Uzbek copy reviewed for “whose data” clarity. |
| **Resource** | If cut: drop **non-blocking UI** before dropping **schema + API scope**; super-admin UI can be minimal if assignment is scripted **temporarily** (documented debt). |

## Student client applications

| Phase | Client | Description |
|-------|--------|-------------|
| **Current (release)** | **Telegram Mini App** | Primary student experience: sign-in/registration, test unlock, attempt, submit, outcomes — delivered inside Telegram (Mini App UX; bot-style flows may remain for some steps per implementation). **No** dedicated student web property in the admin monorepo. |
| **Planned** | **Flutter app** | Native mobile client for learners; must implement the **same** attempt rules, scoring, and auth model as the Telegram client via the shared REST API. |

## Functional Requirements

### Identity & roles

- **FR1:** Staff user can authenticate and receive a credential that carries their staff role.
- **FR2:** Student can authenticate through the **Telegram Mini App** (Telegram student channel) without using the staff dashboard.
- **FR3:** System can block staff-only capabilities when the authenticated party has the Student role.
- **FR4:** System can distinguish Super Admin, Teacher Admin, and Student for authorization decisions.

### Teacher–student membership

- **FR5:** Super Admin can associate a student with a teacher (create link).
- **FR6:** Super Admin can remove an association between a student and a teacher when policy allows.
- **FR7:** Super Admin can inspect associations between teachers and students for support and governance.
- **FR8:** Teacher Admin can view only students who are associated with them in the roster experience.
- **FR9:** Roster experience shown to Teacher Admin can omit all staff accounts.

### Tests, attempts, and outcomes (visibility)

- **FR10:** Teacher Admin can create and manage tests they own.
- **FR11:** Teacher Admin can view attempts for tests they own.
- **FR12:** Teacher Admin can view outcome summaries (scores, pass/fail where configured) for attempts on tests they own.
- **FR13:** Teacher Admin cannot access tests or attempts that belong exclusively to another teacher unless platform policy explicitly grants an override.
- **FR14:** Super Admin can access tests and attempts according to agreed platform-wide visibility rules.

### Dashboard summaries

- **FR15:** Teacher Admin can view dashboard summaries that include only metrics permitted for their scope.
- **FR16:** Super Admin can view dashboard summaries that include platform-wide metrics per policy.

### Staff profile

- **FR17:** Staff user can view their own profile attributes permitted for display.
- **FR18:** Staff user can update their own permitted profile attributes.
- **FR19:** Staff user can change their own password when the product requires verification of the current password.

### Student assessment (Telegram student channel, release)

- **FR20:** Student can complete identity capture required by the **Telegram Mini App** without using the staff dashboard.
- **FR21:** Student can unlock access to a test using a test access code when the test defines one.
- **FR22:** Student can start, answer within rules, and submit a permitted test attempt through the **Telegram Mini App**.
- **FR23:** Student can receive outcome messaging appropriate to the test configuration (score, pass/fail when applicable).

### Rules engine (attempt lifecycle)

- **FR24:** System can prevent a new attempt when a test is configured for a single completed attempt and the student already has one.
- **FR25:** System can enforce time-limit rules on submission according to test configuration.

### Super-administration (outside roster)

- **FR26:** Super Admin can change another user’s staff role through a controlled administrative workflow (not via the teacher student roster row actions).
- **FR27:** Super Admin can resolve “student not visible to teacher” situations by managing associations.

### Roster usability

- **FR28:** Teacher Admin can locate a linked student using search or filter within the roster experience.
- **FR29:** Teacher Admin can browse the roster in pages or segments when the list is large.

### Reliability of the student channel

- **FR30:** Telegram student channel can recover from common third-party transport failures without terminating service for all users.

### Automated verification (release gate)

- **FR31:** Product delivery can include automated checks that prove a Teacher Admin cannot retrieve another teacher’s private student list contents.
- **FR32:** Product delivery can include automated checks that prove protected staff endpoints reject callers with the Student role (and other disallowed cases per matrix).

### Future client (Flutter)

- **FR33:** Roadmap: Student can complete the same assessment journey (authenticate, unlock if required, attempt, submit, receive outcomes) through a **Flutter** client when shipped, without changing core attempt or scoring rules enforced by the API.

### Future-facing (AI, phased)

- **FR34:** Product roadmap can include AI-assisted practice or quiz experiences for learners that do not replace teacher-authored summative items without an explicit approval workflow (detailed in later releases).

## Non-Functional Requirements

### Security

- **NFR-S1:** All staff and student traffic to the API uses **TLS** in production; secrets (e.g. `JWT_SECRET`) are never committed or hardcoded in source.
- **NFR-S2:** Student **PII** (phone, Telegram identifiers, name) is accessible only under **role and scope** rules defined in this PRD; cross-teacher reads are **denied** by default for Teacher Admin.
- **NFR-S3:** Passwords for staff accounts are stored using a **strong one-way** hashing approach consistent with existing platform practice.

### Integration

- **NFR-I1:** Telegram Mini App / Bot integration tolerates **transient Telegram API failures** without process-wide failure (error boundary / graceful messaging to the user).
- **NFR-I2:** Public REST contracts used by the Telegram client remain **backward compatible** within a major release unless versioned migration is documented for the Flutter roadmap.

### Reliability

- **NFR-R1:** Critical student paths (unlock, answer submit, final submit) return a **clear error payload** on failure; no silent data loss of submitted answers where the API accepts them.
- **NFR-R2:** Admin dashboard list endpoints return **consistent pagination** defaults aligned with existing product standards (e.g. bounded page size).

### Maintainability & quality

- **NFR-M1:** New or changed **admin** endpoints that enforce scope are covered by **automated tests** that run in CI before merge, including negative tests for **403/401** as applicable.
- **NFR-M2:** Validation schemas for API bodies live in the **central** schema module for the API codebase, not duplicated ad hoc in route files.

### Accessibility (staff dashboard)

- **NFR-A1:** New dashboard work for this initiative uses **semantic design tokens** for text and surfaces (e.g. muted foreground) so contrast remains predictable in light/dark themes; formal WCAG conformance level is **out of MVP** unless separately funded.

### Performance (lightweight)

- **NFR-P1:** Typical teacher roster and paginated list views complete within **interactive** time under expected single-org load (exact SLO can be set in implementation; default target: sub-second server time for list pages at default page size under nominal DB size).
