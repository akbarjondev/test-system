# Product Scope

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
