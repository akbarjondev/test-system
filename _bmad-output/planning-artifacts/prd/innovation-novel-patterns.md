# Innovation & Novel Patterns

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
