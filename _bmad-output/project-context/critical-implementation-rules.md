# Critical Implementation Rules

### ABSOLUTE PROHIBITIONS
1. **No raw SQL** — Prisma only, always
2. **No `console.log`** in committed code
3. **No inline Zod schemas** in route files — all schemas go in `apps/api/src/config/schemas.ts`
4. **No hardcoded env vars** — always read from `process.env`
5. **No student-facing web pages** — students use Telegram bot + Flutter only
6. **Never break Prisma cascade deletes**: `Test → Question → Option / QuestionOrder / Answer`

### Error Response Format (MUST match exactly)
```json
// Generic error:
{ "error": "string", "code"?: "string" }

// Validation error (from validate middleware):
{ "error": "Validation failed", "details": [{ "field": "string", "message": "string" }] }
```

### HTTP Status Codes (enforced pattern)
- `200` — GET success, POST answer submit
- `201` — POST create (test, question, attempt start)
- `204` — DELETE success (no body)
- `400` — validation / business logic error
- `401` — missing token
- `403` — invalid token, wrong role, unauthorized action
- `404` — resource not found
- `500` — unexpected server error

### Pagination Pattern (ALL list endpoints)
Returns `PaginatedResponse<T>` from `@test-system/types`:
```typescript
{
  data: T[],
  pagination: {
    page: number, limit: number, total: number,
    totalPages: number, hasNext: boolean, hasPrev: boolean
  }
}
```
Default: `page=1, limit=20`. Max limit: `100`. Parse with: `Math.max(1, parseInt(...) || 1)`.

---
