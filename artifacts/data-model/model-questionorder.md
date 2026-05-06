# Model: `QuestionOrder`

| Field        | Type   | Notes                                          |
|--------------|--------|------------------------------------------------|
| id           | String | CUID, PK                                       |
| attemptId    | String | FK → TestAttempt (cascade delete)              |
| questionId   | String | FK → Question (cascade delete)                 |
| displayOrder | Int    | 0-based shuffled position for this attempt     |

**Unique constraints:**
- `(attemptId, displayOrder)` — each position is used once per attempt
- `(attemptId, questionId)` — each question appears once per attempt

**Business context:** This table stores a per-attempt randomized question order. When an attempt starts, the server shuffles the test's questions and inserts one `QuestionOrder` row per question with a random `displayOrder`. The bot/app uses `displayOrder` to present questions in the shuffled sequence. This means two students taking the same test see questions in different orders (anti-cheating).

---
