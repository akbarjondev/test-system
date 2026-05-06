# Prisma Cascade Delete Rules

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
