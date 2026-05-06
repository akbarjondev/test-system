# Model: `Test`

| Field              | Type      | Notes                                              |
|--------------------|-----------|----------------------------------------------------|
| id                 | String    | CUID, PK                                           |
| title              | String    |                                                    |
| description        | String?   | Optional                                           |
| pointsPerQuestion  | Float?    | Points awarded per correct answer                  |
| timeLimitMinutes   | Int       | Default: 30                                        |
| isAlwaysAvailable  | Boolean   | Default: true — open access vs. scheduled          |
| availableFrom      | DateTime? | Ignored when `isAlwaysAvailable = true`            |
| availableUntil     | DateTime? | Ignored when `isAlwaysAvailable = true`            |
| createdById        | String    | FK → User                                          |
| createdAt          | DateTime  | Auto                                               |

**Business context:**
- `isAlwaysAvailable = true` → test is always open; `availableFrom`/`availableUntil` are ignored.
- `isAlwaysAvailable = false` → test is only accessible between `availableFrom` and `availableUntil` (scheduled mode, e.g., exam window).
- `pointsPerQuestion` is used to compute `TestAttempt.score` at submission time: `score = correctAnswers × pointsPerQuestion`.
- Deleting a Test cascades to all Questions, which cascade further (see cascade rules below).

---
