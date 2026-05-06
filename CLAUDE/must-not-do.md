# Must NOT Do

- Break Prisma cascade deletes: `Test → Question → Option / QuestionOrder / Answer`
- Write raw SQL — Prisma only
- Skip Zod validation on any new API route (every mutating route needs `validate(schema)`)
- Hardcode environment variables — always read from `process.env`
- Create student-facing web pages — students use Telegram bot + Flutter only
- Put Zod schemas inline in route files — they belong in `apps/api/src/config/schemas.ts`
- Add `console.log` to committed code

---
