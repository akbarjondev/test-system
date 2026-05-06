# Domain-Specific Requirements

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
