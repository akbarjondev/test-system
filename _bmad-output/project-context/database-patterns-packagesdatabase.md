# Database Patterns (`packages/database`)

### Prisma Client Location
```typescript
import { prisma } from "@test-system/database/lib/prisma";
import { User, Test, Question, Option } from "@test-system/database/prisma/generated/client";
```

### Schema Key Points
- All IDs: `@id @default(cuid())` — string CUIDs, not integers
- All timestamps: `DateTime @default(now())`
- User password NEVER returned — always `select` or `Omit<User, "password">`
- Cascade deletes: `Test → Question (onDelete: Cascade)`, `Question → Option (onDelete: Cascade)`, `TestAttempt → QuestionOrder / Answer (onDelete: Cascade)`
- `Option.order` is unique per question: `@@unique([questionId, order])`
- `Answer` is unique per question per attempt: `@@unique([attemptId, questionId])`
- `QuestionOrder` tracks shuffled question display order per attempt

### Test Availability Logic
```typescript
// In repositories — available tests filter:
{
  OR: [
    { isAlwaysAvailable: true },
    { isAlwaysAvailable: false, availableFrom: { lte: now }, availableUntil: { gte: now } }
  ]
}
```

### After Schema Changes
```bash
cd packages/database && npm run db:migrate   # create + apply migration
cd packages/database && npm run db:generate  # regenerate Prisma client
```

---
