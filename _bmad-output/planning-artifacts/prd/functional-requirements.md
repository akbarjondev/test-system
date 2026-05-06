# Functional Requirements

### Identity & roles

- **FR1:** Staff user can authenticate and receive a credential that carries their staff role.
- **FR2:** Student can authenticate through the **Telegram Mini App** (Telegram student channel) without using the staff dashboard.
- **FR3:** System can block staff-only capabilities when the authenticated party has the Student role.
- **FR4:** System can distinguish Super Admin, Teacher Admin, and Student for authorization decisions.

### Teacher–student membership

- **FR5:** Super Admin can associate a student with a teacher (create link).
- **FR6:** Super Admin can remove an association between a student and a teacher when policy allows.
- **FR7:** Super Admin can inspect associations between teachers and students for support and governance.
- **FR8:** Teacher Admin can view only students who are associated with them in the roster experience.
- **FR9:** Roster experience shown to Teacher Admin can omit all staff accounts.

### Tests, attempts, and outcomes (visibility)

- **FR10:** Teacher Admin can create and manage tests they own.
- **FR11:** Teacher Admin can view attempts for tests they own.
- **FR12:** Teacher Admin can view outcome summaries (scores, pass/fail where configured) for attempts on tests they own.
- **FR13:** Teacher Admin cannot access tests or attempts that belong exclusively to another teacher unless platform policy explicitly grants an override.
- **FR14:** Super Admin can access tests and attempts according to agreed platform-wide visibility rules.

### Dashboard summaries

- **FR15:** Teacher Admin can view dashboard summaries that include only metrics permitted for their scope.
- **FR16:** Super Admin can view dashboard summaries that include platform-wide metrics per policy.

### Staff profile

- **FR17:** Staff user can view their own profile attributes permitted for display.
- **FR18:** Staff user can update their own permitted profile attributes.
- **FR19:** Staff user can change their own password when the product requires verification of the current password.

### Student assessment (Telegram student channel, release)

- **FR20:** Student can complete identity capture required by the **Telegram Mini App** without using the staff dashboard.
- **FR21:** Student can unlock access to a test using a test access code when the test defines one.
- **FR22:** Student can start, answer within rules, and submit a permitted test attempt through the **Telegram Mini App**.
- **FR23:** Student can receive outcome messaging appropriate to the test configuration (score, pass/fail when applicable).

### Rules engine (attempt lifecycle)

- **FR24:** System can prevent a new attempt when a test is configured for a single completed attempt and the student already has one.
- **FR25:** System can enforce time-limit rules on submission according to test configuration.

### Super-administration (outside roster)

- **FR26:** Super Admin can change another user’s staff role through a controlled administrative workflow (not via the teacher student roster row actions).
- **FR27:** Super Admin can resolve “student not visible to teacher” situations by managing associations.

### Roster usability

- **FR28:** Teacher Admin can locate a linked student using search or filter within the roster experience.
- **FR29:** Teacher Admin can browse the roster in pages or segments when the list is large.

### Reliability of the student channel

- **FR30:** Telegram student channel can recover from common third-party transport failures without terminating service for all users.

### Automated verification (release gate)

- **FR31:** Product delivery can include automated checks that prove a Teacher Admin cannot retrieve another teacher’s private student list contents.
- **FR32:** Product delivery can include automated checks that prove protected staff endpoints reject callers with the Student role (and other disallowed cases per matrix).

### Future client (Flutter)

- **FR33:** Roadmap: Student can complete the same assessment journey (authenticate, unlock if required, attempt, submit, receive outcomes) through a **Flutter** client when shipped, without changing core attempt or scoring rules enforced by the API.

### Future-facing (AI, phased)

- **FR34:** Product roadmap can include AI-assisted practice or quiz experiences for learners that do not replace teacher-authored summative items without an explicit approval workflow (detailed in later releases).
