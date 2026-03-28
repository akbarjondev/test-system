# Test System (Test tizimi)

A full-stack online quiz and test platform built as a Turborepo monorepo. The system supports test creation, student enrollment, timed attempts with question shuffling, and result tracking.

## Project Structure

```
test-system/
  apps/
    api/               # Express 5 REST API — port 5000
    admin-dashboard/   # Next.js 16 admin UI — port 3000
    telegram-bot/      # Planned Telegram bot integration (placeholder)
  packages/
    database/          # Prisma ORM + PostgreSQL client
    shared/            # JWT + bcrypt authentication utilities
    types/             # Shared TypeScript interfaces
    eslint-config/     # Shared ESLint configuration
    typescript-config/ # Shared tsconfig.json presets
```

## Apps

### API (`apps/api`) — port 5000

Express 5 REST backend with a layered architecture: **Routes → Controllers → Services → Repositories → Prisma**.

**Key features:**
- JWT authentication (7-day tokens), role-based access (`ADMIN` / `STUDENT`)
- Full CRUD for tests and questions
- Test attempt lifecycle: start → answer → submit → results
- Question shuffling (Fisher-Yates) per attempt (anti-cheating)
- Test scheduling (`availableFrom` / `availableUntil`) with server-side time limit enforcement
- Paginated test listing
- Swagger UI at `GET /api-docs`
- Rate limiting: 100 requests/min per IP
- Health check: `GET /health`

### Admin Dashboard (`apps/admin-dashboard`) — port 3000

Next.js 16 (App Router) frontend for administrators. UI language is **Uzbek**.

**Key features:**
- Login / logout with httpOnly cookie-based JWT storage
- Create and manage tests (title, description, time limit, scheduling)
- Add and manage questions with multiple-choice options
- Test detail view showing questions and metadata
- Role-based route protection via middleware
- Dark mode support

### Telegram Bot (`apps/telegram-bot`)

Placeholder — not yet implemented.

## Packages

| Package | Description |
|---|---|
| `@test-system/database` | Prisma client singleton, schema, and migrations |
| `@test-system/shared` | `hashPassword`, `comparePassword`, `generateToken`, `verifyToken` |
| `@test-system/types` | Shared TypeScript interfaces (`AuthUser`, `TestWithRelations`, `PaginatedResponse<T>`, etc.) |
| `@repo/eslint-config` | Shared ESLint config for all apps/packages |
| `@repo/typescript-config` | Shared `tsconfig.json` presets |

## Database Schema

PostgreSQL via Prisma. Key models:

| Model | Description |
|---|---|
| `User` | Email + hashed password, role (`ADMIN` or `STUDENT`) |
| `Test` | Title, description, time limit, scheduling window, creator |
| `Question` | Belongs to a test |
| `Option` | Multiple-choice options for a question, with `isCorrect` and optional explanation |
| `TestAttempt` | A student's attempt on a test, with start/submit timestamps and score |
| `QuestionOrder` | Shuffled question display order per attempt |
| `Answer` | Selected option per question per attempt, with points earned |

Cascade deletes: `Test → Questions → Options` and `Test → Attempts → Answers`.

## API Reference

All routes except auth require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register (always creates `STUDENT` role) |
| `POST` | `/api/auth/login` | Login, returns JWT + user |

### Tests
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tests` | Create a test |
| `GET` | `/api/tests?page=&limit=` | List tests (paginated) |
| `GET` | `/api/tests/:testId` | Get test with questions and options |
| `PUT` | `/api/tests/:testId` | Update test |
| `DELETE` | `/api/tests/:testId` | Delete test |

### Questions
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tests/:testId/questions` | Create question with options |
| `GET` | `/api/tests/:testId/questions` | List questions for a test |
| `GET` | `/api/questions/:questionId` | Get single question |
| `PUT` | `/api/questions/:questionId` | Update question |
| `DELETE` | `/api/questions/:questionId` | Delete question |

### Attempts
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tests/:testId/attempts/start` | Start attempt (student only) |
| `GET` | `/api/tests/:testId/attempts/current` | Get active attempt |
| `POST` | `/api/attempts/:attemptId/answers` | Submit/update an answer |
| `POST` | `/api/attempts/:attemptId/submit` | Submit test, calculates score |
| `GET` | `/api/attempts/:attemptId/results` | Get results (after submission only) |
| `GET` | `/api/attempts/my-attempts` | Student's own attempts |
| `GET` | `/api/tests/:testId/attempts` | All attempts for a test (admin/creator) |

Full interactive documentation: `http://localhost:5000/api-docs`

## Prerequisites

- Node.js 18+
- npm 10+
- [Podman](https://podman.io/) (used instead of Docker for container management)

## Environment Variables

**`packages/database/.env`**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/testdb
```

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/testdb
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

**`apps/admin-dashboard/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. First-time database setup

```bash
cd packages/database
npm run db:migrate    # Run Prisma migrations
npm run db:generate   # Generate Prisma client
cd ../..
```

### 3. Create an admin user

The register endpoint always creates `STUDENT` accounts. To create an `ADMIN` user, register normally then update the role directly in the database via Prisma Studio (see step 5 below) or a SQL query:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 4. Start development

Open **three terminals**:

**Terminal 1 — Database**
```bash
npm run docker:dev
```
Starts PostgreSQL on port 5432. Wait for it to be ready before continuing.

**Terminal 2 — All apps**
```bash
npm run dev
```
Starts:
- Admin Dashboard: http://localhost:3000
- API Server: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

**Terminal 3 — Prisma Studio (optional)**
```bash
cd packages/database
npm run db:studio
```
Opens database GUI at http://localhost:5555.

### 5. Stop services

```bash
npm run docker:down   # Stop database container
# Ctrl+C in Terminal 2 to stop dev servers
```

## Build

```bash
npm run build
```

Builds all apps via Turborepo. Outputs to `apps/api/dist` and `apps/admin-dashboard/.next`.

## Troubleshooting

- Ensure the database container is running before starting dev servers
- Check for port conflicts on 3000, 5000, 5432, or 5555
- The project uses **Podman**, not Docker — ensure Podman is installed and running

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| API | Express 5, TypeScript, JWT, Helmet, Swagger |
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Zod, react-hook-form |
| Database | PostgreSQL 15, Prisma ORM |
| Auth | JWT (7-day), bcryptjs, httpOnly cookies |
| Containers | Podman + docker-compose |
