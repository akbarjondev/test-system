# Requirements Inventory

### Functional Requirements

FR1: Dashboard UI must be updated to use shadcn/ui components with a teacher-friendly layout designed for users with limited digital literacy
FR2: Test model must include an optional `passingScore` (Float?) field representing the minimum score required to pass a test
FR3: API create/update test endpoints must accept and persist `passingScore`
FR4: Dashboard test creation and edit forms must include a `passingScore` input field
FR5: Test results view must display whether each student passed or failed based on `passingScore` (when set)
FR6: Test model must include an `allowOnlyOneAttempt` (Boolean, default false) field
FR7: API must enforce the one-attempt rule when `allowOnlyOneAttempt` is true — reject attempt start if student already has a completed attempt for that test
FR8: API submit endpoint must check whether the time limit has been exceeded (now > startedAt + timeLimitMinutes) and auto-submit or reject accordingly
FR9: Bot must catch all Telegram API errors globally and never crash — errors must be logged and the bot must continue running
FR10: Bot must delete the previous login/register message and inline keyboard after successful authentication
FR11: Bot must display the selected answer as plain text below the question after selection, and remove the inline answer keyboard
FR12: Student authentication in the bot must use Telegram user ID (ctx.from.id) for auto-registration — no email or password required
FR13: `globals.css` must define `--success`, `--error`, `--warning` tokens (+ `*-foreground` variants) with light and dark mode values, mapped in `@theme inline`
FR14: `Badge` component `success`, `error`, and `warning` variants must reference semantic CSS tokens — no hardcoded Tailwind palette classes
FR15: Dashboard home `StatCard` must use `<Card>` + `<CardContent>` components; warning state uses `border-warning` / `text-warning` token classes
FR16: All secondary/helper text across dashboard pages must use `text-muted-foreground`; no `text-gray-500`, `text-zinc-500`, or `text-zinc-400`
FR17: All `<Table>` instances on dashboard pages must be wrapped in a `rounded-xl border border-border overflow-hidden bg-card` container div
FR18: Pass/fail status in the dashboard recent attempts table must use `<Badge variant="success">` / `<Badge variant="error">`
FR19: User role column in students page must use `<Badge variant="default">` (Admin) and `<Badge variant="secondary">` (Student)
FR20: Students page `<Table>` must be wrapped in the standard styled container div
FR21: Question option correct/incorrect indicators in test detail page must use `text-success` / `text-error` token classes
FR22: Students page and Tests list page must each have a subtitle `<p className="text-sm text-muted-foreground mt-1">` below the H1

### Non-Functional Requirements

NFR1: All new API routes must follow the existing middleware chain: validate(schema) → verifyToken → Controller → Service → Repository → Prisma
NFR2: All new Zod schemas must be added to apps/api/src/config/schemas.ts — never inline in route files
NFR3: No raw SQL — Prisma only for all data access
NFR4: TypeScript strict mode must be maintained across all files
NFR5: No console.log in committed code
NFR6: All API error responses must use format { error: string, code?: string }
NFR7: Bot error handling must use grammY's built-in error boundary (bot.catch) plus try/catch in individual handlers
NFR8: Dashboard language and labels must remain accessible for Uzbek-speaking teachers with limited platform experience

### Additional Requirements

- Bot auto-registration via Telegram identity requires either: (a) storing telegramId on the User model, or (b) creating a TelegramUser mapping table. Decision needed before implementation.
- Time limit enforcement: TestAttempt.startedAt already exists in schema; submit endpoint needs to compute startedAt + timeLimitMinutes and compare to current timestamp.
- allowOnlyOneAttempt enforcement: service layer must query for existing completed attempts (submittedAt IS NOT NULL) for the same testId + studentId before allowing attempt start.
- passingScore: optional Float field on Test model; does not affect scoring logic, only result display and pass/fail determination.
- All existing cascade delete rules (Test → Question → Option/QuestionOrder/Answer, TestAttempt → QuestionOrder/Answer) must be preserved in any schema migrations.
- BotSession table already exists in schema for grammY session storage.

### UX Design Requirements

UX-DR1: All list views (tests, users, results) must use shadcn DataTable component with sorting and pagination
UX-DR2: Test creation form must use clear, labeled sections with helper text for each field
UX-DR3: Pass/fail status in results must use a visible badge (green/red) — not just a number
UX-DR4: Navigation must be minimal and flat — teachers should reach any page in 2 clicks maximum
UX-DR5: Bot messages must be concise and in the local language — avoid technical jargon
UX-DR6: Color token system must be fully semantic — all status colors flow through CSS variables, enabling theme changes from `globals.css` alone
UX-DR7: `Badge` component is the sole pattern for status and role indicators across the dashboard — no inline colored `<span>` elements
UX-DR8: `Card` component is the sole pattern for card/panel surfaces — no raw `<div>` with hardcoded bg/border color classes
UX-DR9: All list-page tables must be visually contained in a consistent rounded border wrapper
UX-DR10: All dashboard list pages must have a subtitle under H1 for consistent page structure

### FR Coverage Map

FR13: Epic 6 — Add `--success`, `--error`, `--warning` CSS tokens to globals.css
FR14: Epic 6 — Migrate Badge success/error/warning variants to semantic tokens
FR15: Epic 6 — Refactor StatCard to use Card component with token classes
FR16: Epic 6 — Replace all hardcoded gray text classes with `text-muted-foreground`
FR17: Epic 6 — Wrap all dashboard Tables in `border-border bg-card` container
FR18: Epic 6 — Replace inline pass/fail spans with Badge variant components
FR19: Epic 6 — Replace hardcoded role colors with Badge variants in students page
FR20: Epic 6 — Add styled table wrapper to students page
FR21: Epic 6 — Migrate question option colors to `text-success` / `text-error` tokens
FR22: Epic 6 — Add subtitle `<p>` under H1 on Students and Tests list pages
UX-DR6: Epic 6 — Semantic color token system in globals.css
UX-DR7: Epic 6 — Badge as sole status/role indicator pattern
UX-DR8: Epic 6 — Card as sole card surface pattern
UX-DR9: Epic 6 — Consistent table wrapper on all list pages
UX-DR10: Epic 6 — Subtitle under H1 on all list pages
FR1: Epic 5 — Dashboard UI overhaul with shadcn/ui components
FR2: Epic 4 — passingScore field added to Test schema
FR3: Epic 4 — passingScore accepted in API create/update endpoints
FR4: Epic 4 — passingScore input field in dashboard test form
FR5: Epic 4 — Pass/fail badge in dashboard results and bot message
FR6: Epic 2 — allowOnlyOneAttempt field added to Test schema
FR7: Epic 2 — One-attempt enforcement in API + bot shows previous score
FR8: Epic 3 + 4 — Time limit block on submit (E3), timedOutAt schema + dashboard status (E4)
FR9: Epic 1 — Bot global error handling via bot.catch + try/catch
FR10: Epic 1 — Delete old auth messages after successful login/register
FR11: Epic 3 — Show selected answer text, remove inline keyboard
FR12: Epic 1 — Telegram identity auto-registration (telegramId + phone + fullName)
FR-E2-password: Epic 2 — testPassword on Test schema + unlock API endpoint + bot flow
NFR8: Epic 5 — All user-facing text in Uzbek language
