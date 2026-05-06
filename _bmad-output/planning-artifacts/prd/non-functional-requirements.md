# Non-Functional Requirements

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
