# Model: `TestAttempt`

| Field         | Type      | Notes                                   |
|---------------|-----------|-----------------------------------------|
| id            | String    | CUID, PK                                |
| testId        | String    | FK → Test (cascade delete)              |
| studentId     | String    | FK → User (cascade delete)              |
| startedAt     | DateTime  | Auto — when `POST .../start` was called |
| submittedAt   | DateTime? | Set when `POST .../submit` is called    |
| score         | Float?    | Computed at submission; null until then |
| questionOrders| QuestionOrder[] | Shuffled order for this attempt    |
| answers       | Answer[]  | Student's answers for this attempt      |

**Business context:**
- An attempt is "in progress" when `submittedAt` is null.
- A student can only have one active (unsubmitted) attempt per test at a time (enforced at service layer).
- `score` is `null` until submission; after submission it holds the total points earned.
- Cascade: deleting a Test deletes all its attempts, which cascades to QuestionOrders and Answers.

---
