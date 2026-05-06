# Data Flows for Critical Paths

### 1. Admin Creates a Test

```
Admin Browser
  1. Fills form in /dashboard/tests/new
  2. React Hook Form calls server action: createTest() [actions/tests.ts]
  3. Server action calls POST /api/tests with { title, description, pointsPerQuestion, timeLimitMinutes, isAlwaysAvailable, availableFrom?, availableUntil? }
  4. API: validate(createTestSchema) → verifyToken → TestsController.createTest
  5. Controller calls TestsService.createTest → TestsRepository → Prisma.test.create
  6. Returns { id, title, ... }
  7. Server action calls redirect(/dashboard/tests/:id)

Admin Browser
  8. On test detail page, adds questions via separate POST /api/tests/:testId/questions calls
  9. Each question persisted with options array; options get order: 0,1,2,...
```

### 2. Student Takes a Test via Telegram Bot

```
Student (Telegram)
  1. Sends /login command → bot prompts for email+password
  2. Bot calls POST /api/auth/login → receives { token }
  3. Token stored in grammY session
  4. Bot lists available tests → GET /api/tests
  5. Student picks a test → bot calls POST /api/tests/:testId/attempts/start
     - API shuffles questions → inserts QuestionOrder rows (random displayOrder)
     - Returns { attemptId, questions: [...sorted by displayOrder] }
  6. Bot presents question 0, shows options as inline keyboard
  7. Student taps option → POST /api/attempts/:attemptId/answers { questionId, optionId }
     - API checks isCorrect → sets Answer.pointsEarned
  8. Bot advances to next question (displayOrder + 1)
  9. After last question → POST /api/attempts/:attemptId/submit
     - API sums pointsEarned → sets TestAttempt.score + submittedAt
  10. Bot shows score summary
```

### 3. Admin Views Results

```
Admin Browser
  1. Navigates to /dashboard/tests/:testId/results
  2. Page calls GET /api/tests/:testId/attempts (admin token)
  3. API returns all TestAttempt records with student info and scores
  4. Dashboard renders table: student email, score, submittedAt, time taken
  5. Admin can click individual attempt to see per-question answers
     → GET /api/attempts/:attemptId/results
     → Returns questions + selected options + pointsEarned per question
```

---
