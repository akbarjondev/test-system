# SaaS B2B Specific Requirements

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
