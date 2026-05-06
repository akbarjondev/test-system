# Cascade Delete Rules

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
