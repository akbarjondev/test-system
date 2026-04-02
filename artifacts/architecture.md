# System Architecture

---

## Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLIENTS                                        │
│                                                                           │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐  │
│  │  Admin Browser  │    │  Telegram User   │    │   Flutter App      │  │
│  │  (ADMIN role)   │    │  (STUDENT role)  │    │  (STUDENT role)    │  │
│  └────────┬────────┘    └────────┬─────────┘    └─────────┬──────────┘  │
└───────────┼─────────────────────┼──────────────────────────┼────────────┘
            │ HTTPS               │ Telegram API              │ HTTPS
            ▼                     ▼                           │
┌───────────────────┐    ┌─────────────────┐                 │
│  Next.js Dashboard│    │  Telegram Bot   │                 │
│  (apps/admin-     │    │  (apps/telegram-│                 │
│   dashboard)      │    │   bot, grammy)  │                 │
│  Port: 3000       │    │                 │                 │
│                   │    │  Long polling   │                 │
│  proxy.ts         │    │  (→ webhook in  │                 │
│  (cookie→Bearer)  │    │   production)   │                 │
└────────┬──────────┘    └────────┬────────┘                 │
         │ Bearer JWT             │ Bearer JWT                │ Bearer JWT
         └────────────────────────┴──────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Express API            │
                    │  (apps/api)             │
                    │  Port: 5000             │
                    │                         │
                    │  helmet → cors →        │
                    │  json → rate-limit →    │
                    │  router → validate →    │
                    │  verifyToken →          │
                    │  verifyAdmin →          │
                    │  Controller →           │
                    │  Service →              │
                    │  Repository →           │
                    │  Prisma Client          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  PostgreSQL            │
                    │  (managed add-on in    │
                    │   production; local    │
                    │   Docker in dev)       │
                    └────────────────────────┘
```

---

## Data Flows for Critical Paths

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

## Auth Flows

### Admin Dashboard (httpOnly Cookie)

```
1. Admin submits login form
2. Server action calls POST /api/auth/login
3. API returns { token }
4. proxy.ts (Next.js route handler) sets httpOnly cookie "token=<jwt>"
5. Subsequent server actions call getToken() → reads cookie from server context
6. Each API call: Authorization: Bearer <token>
7. Logout: server action clears cookie
```

### Telegram Bot / Flutter App (Bearer Token)

```
1. User sends /login command or taps login in app
2. Client collects email + password
3. Client calls POST /api/auth/login
4. API returns { token }
5. Bot: token stored in grammY session (in-memory, cleared on restart)
   App: token stored in Flutter secure storage (persists across app restarts)
6. Every API call includes: Authorization: Bearer <token>
7. verifyTokenMiddleware:
   a. Extracts token from header
   b. Calls verifyToken(token) [packages/shared/auth]
   c. Looks up user in DB to confirm existence
   d. Attaches decoded payload to req.user
```

---

## API Middleware Chain

Applied globally in `apps/api/src/server.ts`:

```
1. helmet()          — Sets security headers (CSP, HSTS, etc.)
2. cors()            — Allows cross-origin requests (configure origins in production)
3. express.json()    — Parses JSON request bodies
4. rateLimit()       — 100 requests per IP per minute; returns 429 on breach
```

Applied per-route:

```
5. validate(schema)         — Zod validation of req.body; 400 on failure
6. verifyTokenMiddleware    — JWT check; 401 if missing, 403 if invalid/expired
7. verifyAdminMiddleware    — Role check; 403 if not ADMIN (admin routes only)
```

Then: `Controller → Service → Repository → Prisma`

---

## Prisma Cascade Delete Rules

Deleting a `Test` cascades to everything beneath it. Deleting a `User` cascades to their attempts.

```
Test (deleted)
├── Question (Cascade)
│   ├── Option (Cascade)
│   ├── QuestionOrder (Cascade)
│   └── Answer (Cascade)
└── TestAttempt (Cascade)
    ├── QuestionOrder (Cascade)
    └── Answer (Cascade)

User (deleted)
└── TestAttempt (Cascade)
    ├── QuestionOrder (Cascade)
    └── Answer (Cascade)
```

> These cascades are defined in `schema.prisma` via `onDelete: Cascade`. They execute at the database level — do not write application code to manually delete children first.

---

## Packages and Shared Code

- **`packages/shared`** — exports `signToken(payload)` and `verifyToken(token)` using `jsonwebtoken`. Used by API for auth and by shared utilities.
- **`packages/types`** — shared TypeScript interfaces/enums used across apps and packages.
- **`packages/database`** — re-exports Prisma generated client. Import as `import { prisma } from "@test-system/database/generated/client"`.
- **`packages/ui`** — shared Radix/shadcn UI components for the dashboard.
