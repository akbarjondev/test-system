# Model: `Option`

| Field       | Type    | Notes                                              |
|-------------|---------|----------------------------------------------------|
| id          | String  | CUID, PK                                           |
| questionId  | String  | FK → Question (cascade delete)                     |
| text        | String  | Display text of the option                         |
| isCorrect   | Boolean | Default: false — only one option should be true    |
| order       | Int     | 0-based display order (separate from correctness)  |
| explanation | String? | Optional explanation shown after submission        |

**Unique constraint:** `(questionId, order)` — no two options on the same question can share the same display order.

**Business context:**
- `order` controls the display sequence in the UI/bot and is set explicitly (not auto-increment), allowing reordering without touching `isCorrect`.
- `explanation` can be shown to students after they submit, explaining why the option is correct or incorrect.
- Each question should have exactly one `isCorrect = true` option (enforced at application layer, not DB constraint).

---
