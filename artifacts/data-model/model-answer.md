# Model: `Answer`

| Field        | Type      | Notes                                           |
|--------------|-----------|-------------------------------------------------|
| id           | String    | CUID, PK                                        |
| attemptId    | String    | FK → TestAttempt (cascade delete)               |
| questionId   | String    | FK → Question (cascade delete)                  |
| optionId     | String?   | FK → Option (nullable — null means skipped)     |
| pointsEarned | Float     | Default: 0; set to `pointsPerQuestion` if correct|
| answeredAt   | DateTime  | Auto                                            |

**Unique constraint:** `(attemptId, questionId)` — one answer per question per attempt (upsert on re-answer).

**Business context:**
- `optionId = null` means the student skipped that question (submitted the attempt without answering it). Skipped questions earn 0 points.
- `pointsEarned` is computed at answer-submission time: if `option.isCorrect = true` then `pointsEarned = test.pointsPerQuestion`, else 0.
- At final submission, `TestAttempt.score = SUM(answers.pointsEarned)`.

---
