# Project Classification

| Dimension | Value |
|-----------|--------|
| **Project type** | **saas_b2b** — multi-teacher **admin platform** (SaaS-shaped); **single organization** per deployment is acceptable for **v1**. |
| **Domain** | **edtech** — formal/informal **assessment** and learning outcomes. |
| **Complexity** | **medium** — RBAC, relational assignment model, migration, consistent scoping across modules, optional **AI** capabilities increase design discipline (safety, evaluation, cost). |
| **Project context** | **brownfield** — extends an existing monorepo (`apps/api`, `apps/admin-dashboard`, `apps/telegram-bot`, `packages/database`, shared packages). |
| **Primary delivery risk** | **Authorization consistency** across roster, tests, attempts, and statistics. |
| **Compliance note** | **Standard** protection of student **PII** (e.g. phone, Telegram identity); **COPPA/FERPA-grade** obligations only if the product explicitly targets regulated minors. |
