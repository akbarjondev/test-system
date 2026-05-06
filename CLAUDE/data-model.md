# Data Model

Core models: `User` (role: `ADMIN | STUDENT`), `Test`, `Question`, `Option`, `TestAttempt`, `QuestionOrder`, `Answer`, `BotSession`.

Key business rules:
- Questions are shuffled per attempt via `QuestionOrder` (stores `displayOrder` per attempt)
- `Answer` has a unique constraint per `(attemptId, questionId)`
- Tests support: time limits, optional 3-digit password, scheduled availability windows, passing score threshold, one-attempt-only restriction

API docs (Swagger UI) available at `http://localhost:5000/api-docs` when the API is running.

---
