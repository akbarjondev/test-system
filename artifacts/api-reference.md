# API Reference

Base URL: `http://localhost:5000` (dev) / `https://<railway-api-url>` (production)

Swagger UI: `GET /api-docs`
Swagger JSON: `GET /api-docs.json`

**Auth header format:** `Authorization: Bearer <jwt_token>`

**Common error shapes:**
```json
{ "error": "string" }
{ "error": "Validation failed", "details": [{ "field": "string", "message": "string" }] }
```

---

## Health

```
GET /health
Auth: none
Response: { "status": "OK", "timestamp": "ISO8601" }
```

---

## Auth — `/api/auth`

### Register

```
POST /api/auth/register
Auth: none
Body: {
  email: string (valid email),
  password: string (min 6 chars)
}
Response 201: { id, email, role: "STUDENT", createdAt }
Errors:
  400 — Validation failed (bad email, short password)
  409 — Email already in use
```

### Login

```
POST /api/auth/login
Auth: none
Body: {
  email: string,
  password: string (min 1 char)
}
Response 200: { token: string }
Errors:
  400 — Validation failed
  401 — Invalid credentials
```

---

## Tests — `/api/tests`

All endpoints require authentication (`Authorization: Bearer <token>`).

### List Tests

```
GET /api/tests
Auth: required
Query params:
  page?: number   (default 1)
  limit?: number  (default 20)
Response 200: {
  data: Test[],
  total: number,
  page: number,
  limit: number
}
```

### Get Test

```
GET /api/tests/:testId
Auth: required
Response 200: Test (with questions count)
Errors:
  404 — Test not found
```

### Create Test

```
POST /api/tests
Auth: required
Body: {
  title: string (min 1),
  description?: string,
  pointsPerQuestion: number (min 0),
  timeLimitMinutes?: number (min 1, default 30),
  isAlwaysAvailable?: boolean (default true),
  availableFrom?: string (ISO8601 datetime, required if isAlwaysAvailable=false),
  availableUntil?: string (ISO8601 datetime, required if isAlwaysAvailable=false)
}
Response 201: Test
Errors:
  400 — Validation failed
  401 — Not authenticated
```

### Update Test

```
PUT /api/tests/:testId
Auth: required
Body: Partial<CreateTestBody> (any fields from create, all optional)
Response 200: Test
Errors:
  400 — Validation failed
  401 — Not authenticated
  404 — Test not found
```

### Delete Test

```
DELETE /api/tests/:testId
Auth: required
Response 204: (no body)
Errors:
  401 — Not authenticated
  404 — Test not found
```

> Deleting a test cascades: Questions → Options / QuestionOrders / Answers; TestAttempts → QuestionOrders / Answers

---

## Questions — `/api/tests/:testId/questions` and `/api/questions/:questionId`

All endpoints require authentication.

### List Questions for Test

```
GET /api/tests/:testId/questions
Auth: required
Response 200: Question[] (each with options array)
Errors:
  404 — Test not found
```

### Get Question

```
GET /api/questions/:questionId
Auth: required
Response 200: Question (with options)
Errors:
  404 — Question not found
```

### Create Question

```
POST /api/tests/:testId/questions
Auth: required
Body: {
  text: string (min 1),
  explanation?: string,
  options: [
    {
      text: string (min 1),
      isCorrect: boolean,
      order?: number (int, min 0),
      explanation?: string
    }
  ] (min 2 options, max 6 options)
}
Response 201: Question (with options)
Errors:
  400 — Validation failed
  404 — Test not found
```

### Update Question

```
PUT /api/questions/:questionId
Auth: required
Body: Partial<CreateQuestionBody> (all fields optional)
Response 200: Question (with options)
Errors:
  400 — Validation failed
  404 — Question not found
```

### Delete Question

```
DELETE /api/questions/:questionId
Auth: required
Response 204: (no body)
Errors:
  404 — Question not found
```

---

## Attempts

All endpoints require authentication.

### Start Test

```
POST /api/tests/:testId/attempts/start
Auth: required
Body: (none)
Response 201: {
  id: string,           (attemptId)
  testId: string,
  studentId: string,
  startedAt: DateTime,
  questions: [
    {
      questionId: string,
      displayOrder: number,
      text: string,
      options: [{ id, text, order }]   (isCorrect NOT included)
    }
  ]  (sorted by displayOrder — shuffled per attempt)
}
Errors:
  404 — Test not found
  409 — Active attempt already exists for this student+test
  403 — Test not currently available (if scheduled)
```

### Get Current Attempt

```
GET /api/tests/:testId/attempts/current
Auth: required
Response 200: Attempt (same shape as start response) | null (if no active attempt)
```

### Submit Answer

```
POST /api/attempts/:attemptId/answers
Auth: required
Body: {
  questionId: string (min 1),
  optionId?: string | null   (null = skip question)
}
Response 200: {
  answerId: string,
  pointsEarned: number
}
Errors:
  400 — Validation failed
  404 — Attempt or question not found
  409 — Attempt already submitted
```

### Submit Test (finish attempt)

```
POST /api/attempts/:attemptId/submit
Auth: required
Body: (none)
Response 200: {
  score: number,
  submittedAt: DateTime,
  totalQuestions: number,
  correctAnswers: number
}
Errors:
  404 — Attempt not found
  409 — Already submitted
```

### Get Attempt Results

```
GET /api/attempts/:attemptId/results
Auth: required
Response 200: {
  attempt: { id, score, submittedAt, startedAt },
  answers: [
    {
      questionId: string,
      questionText: string,
      selectedOptionId: string | null,
      selectedOptionText: string | null,
      isCorrect: boolean,
      pointsEarned: number,
      explanation?: string
    }
  ]
}
Errors:
  403 — Not owner of attempt (students can only view own results)
  404 — Attempt not found or not yet submitted
```

### Get My Attempts

```
GET /api/attempts/my-attempts
Auth: required
Response 200: TestAttempt[] (for the authenticated student)
```

### Get All Attempts for Test (Admin)

```
GET /api/tests/:testId/attempts
Auth: required (admin recommended — returns all students' data)
Response 200: {
  attempts: [
    { id, studentId, studentEmail, score, submittedAt, startedAt }
  ]
}
Errors:
  404 — Test not found
```

---

## Users — `/api/users`

**All endpoints require ADMIN role** (`verifyTokenMiddleware` + `verifyAdminMiddleware`).

### List Users

```
GET /api/users
Auth: admin only
Response 200: User[] (id, email, role, createdAt — no passwords)
```

### Update User Role

```
PUT /api/users/:userId
Auth: admin only
Body: {
  role: "ADMIN" | "STUDENT"
}
Response 200: { id, email, role, createdAt }
Errors:
  400 — Validation failed (invalid role value)
  404 — User not found
```

---

## Rate Limiting

- **Window:** 1 minute per IP
- **Limit:** 100 requests
- **Response on breach (429):**
  ```json
  { "error": "Too many requests, please try again later", "code": "TOO_MANY_REQUESTS" }
  ```

> Note: Rate limit config is flagged as temporary in `server.ts` (`@TODO`). Tighten before production — consider per-user limits for authenticated routes.
