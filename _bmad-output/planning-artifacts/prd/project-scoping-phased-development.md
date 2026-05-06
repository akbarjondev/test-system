# Project Scoping & Phased Development

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
