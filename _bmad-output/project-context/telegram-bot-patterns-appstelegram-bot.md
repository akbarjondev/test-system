# Telegram Bot Patterns (`apps/telegram-bot`)

### Session-Based State Machine
```typescript
// State: "idle" | "reg_email" | "reg_password" | "login_email" | "login_password"
// Token stored in session: ctx.session.token
// Active attempt stored: ctx.session.currentAttempt
```

### API Communication
```typescript
// All API calls go through the local api() helper:
async function api(method, path, body?, token?)
// Always sends Authorization: Bearer <token>
// API_URL from process.env.API_URL (default: http://localhost:5000)
```

### Answer Submission Flow
1. Bot stores `questionId` + `options[]` in session
2. User selects option by index (0-based in callback data `ans:0`, `ans:1`, etc.)
3. Bot submits `{ questionId, optionId: option.id }` to `POST /api/attempts/:id/answers`
4. After all questions → auto-submits via `POST /api/attempts/:id/submit`
5. Score displayed as `score / maxPossibleScore (percent%)`

### isCorrect NEVER sent to bot
The API strips `isCorrect` from options in `startTest` and `getCurrentAttempt` responses. Never expose it.

---
