# Data Model

Source of truth: `packages/database/prisma/schema.prisma`

---

## Enum: `Role`

```
ADMIN   — can create/edit/delete tests, view all results, manage users
STUDENT — can take tests; cannot access admin dashboard
```

---

## Model: `User`

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | String   | CUID, PK                           |
| email       | String   | Unique                             |
| password    | String   | bcrypt hash                        |
| role        | Role     | Default: STUDENT                   |
| createdAt   | DateTime | Auto                               |

**Business context:** Single user table for both admins and students. Role is the discriminator. The seed script creates the first ADMIN. Students self-register via `/api/auth/register` (default role = STUDENT); an admin can promote them via `PUT /api/users/:userId`.

---

## Model: `Test`

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

## Model: `Question`

| Field     | Type     | Notes                           |
|-----------|----------|---------------------------------|
| id        | String   | CUID, PK                        |
| testId    | String   | FK → Test (cascade delete)      |
| text      | String   | The question body                |
| createdAt | DateTime | Auto                            |

**Business context:** Belongs to exactly one Test. Deleting a Test cascades here; deleting a Question cascades to its Options, QuestionOrders, and Answers.

---

## Model: `Option`

| Field       | Type    | Notes                                              |
|-------------|---------|----------------------------------------------------|
| id          | String  | CUID, PK                                           |
| questionId  | String  | FK → Question (cascade delete)                     |
| text        | String  | Display text of the option                         |
| isCorrect   | Boolean | Default: false — only one option should be true    |
| order       | Int     | 0-based display order (separate from correctness)  |
| explanation | String? | Optional explanation shown after submission        |

**Unique constraint:** `(questionId, order)` — no two options on the same question can share the same display order.

**Business context:**
- `order` controls the display sequence in the UI/bot and is set explicitly (not auto-increment), allowing reordering without touching `isCorrect`.
- `explanation` can be shown to students after they submit, explaining why the option is correct or incorrect.
- Each question should have exactly one `isCorrect = true` option (enforced at application layer, not DB constraint).

---

## Model: `TestAttempt`

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

## Model: `QuestionOrder`

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

## Model: `Answer`

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

## Cascade Delete Rules

```
Test
 └── Question (onDelete: Cascade)
      └── Option (onDelete: Cascade)
      └── QuestionOrder (onDelete: Cascade)
      └── Answer (onDelete: Cascade)
 └── TestAttempt (onDelete: Cascade)
      └── QuestionOrder (onDelete: Cascade)
      └── Answer (onDelete: Cascade)

User (student)
 └── TestAttempt (onDelete: Cascade)
      └── QuestionOrder (onDelete: Cascade)
      └── Answer (onDelete: Cascade)
```

> **Never** manually delete child records before deleting a parent — the cascade handles it. Do not write raw SQL that bypasses this.
