# Model: `Question`

| Field     | Type     | Notes                           |
|-----------|----------|---------------------------------|
| id        | String   | CUID, PK                        |
| testId    | String   | FK → Test (cascade delete)      |
| text      | String   | The question body                |
| createdAt | DateTime | Auto                            |

**Business context:** Belongs to exactly one Test. Deleting a Test cascades here; deleting a Question cascades to its Options, QuestionOrders, and Answers.

---
