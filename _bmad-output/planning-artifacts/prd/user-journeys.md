# User Journeys

### Journey 1 — Teacher Madina (happy path: “my class, my data”)

**Opening:** Madina logs into the admin dashboard after the update. Before, the “Foydalanuvchilar” page felt like a mixed list and made her worry she was seeing everyone in the city.

**Rising action:** She opens **Students**. The table shows **only learners linked to her**, with search and pagination. She opens **Tests** and **Natijalar** — only **her** tests and attempts appear. Home totals match what she expects from **her** activity.

**Climax:** She realizes she can **trust the numbers**: a colleague’s student never flashes on her screen.

**Resolution:** She updates her **profile** (name/phone) without asking IT. She tells the director: “Bu endi mening sinfim.”

**Failure / recovery:** If a student should appear but does not, she contacts the **super admin** to fix the **teacher–student link** (per MVP assignment rule).

---

### Journey 2 — Super admin Jasur (platform governance)

**Opening:** Jasur needs two math teachers, Madina and Sardor, working in the same deployment **without** seeing each other’s rosters.

**Rising action:** He confirms both are **ADMIN** (not super). New students arrive via **Telegram**; per the agreed **v1 assignment rule**, Jasur **creates or confirms** `TeacherStudent` rows so each learner sits under the right teacher.

**Climax:** Sardor tries a deep link to a test ID Madina owns — **403** or empty, not a silent leak.

**Resolution:** Jasur can audit “who owns whom” from a **super-admin view** (exact UI TBD) without raw SQL.

---

### Journey 3 — Student Dilshod (Telegram, core + edge)

**Opening:** Dilshod opens the **Telegram Mini App** on his phone — no student website in the admin product.

**Rising action (happy path):** He completes **Telegram onboarding**, unlocks a test with the **3-digit code**, takes the attempt, submits, sees score / pass-fail when configured.

**Edge:** He mistypes the code — bot says wrong code, **no** server error. His session survives **grammY** / Telegram hiccups (existing error boundary).

**Climax / resolution:** He never needs an admin account; **STUDENT** token cannot open dashboard admin APIs (**403**).

---

### Journey 4 — Teacher Sardor (abuse / mistake path)

**Opening:** Sardor bookmarked an old URL pattern or guesses another teacher’s resource id.

**Rising action:** He hits **Students**, **GET test**, **GET attempts** for resources not his.

**Climax:** Every response is **403** or empty list — never **200** with another teacher’s rows.

**Resolution:** He reports “broken link” to Jasur; Jasur explains scope — no data breach occurred.

---

### Journey 5 — API / CI (regression sentinel) — *technical persona*

**Opening:** A developer ships a change to `GET /api/...` list endpoints.

**Rising action:** CI runs **JWT-forged** tests: **Admin A** token vs **Admin B** resource ids.

**Climax:** Build **fails** if a list or detail leaks cross-scope.

**Resolution:** Release blocked until fixed — aligns with “zero known cross-teacher leaks.”

---

### Journey Requirements Summary

| Area | Capabilities implied |
|------|------------------------|
| **AuthZ** | Role matrix (`SUPER_ADMIN`, `ADMIN`, `STUDENT`); consistent rules on students, tests, attempts, stats. |
| **Data** | `TeacherStudent` (or equivalent); migration; documented rule for **new Telegram users** ↔ teacher. |
| **Dashboard** | Scoped lists; **Students** UX (DataTable, no staff, no role/actions, no promote); **Profile** page + API. |
| **API** | Scoped queries/middleware; Zod; standardized errors. |
| **Quality** | Automated tests for isolation + role matrix + profile; CI gate. |
| **Telegram student channel** | Preserve stable Mini App / bot flows; global error handling unchanged or improved. |
| **Future** | AI / practice quiz journeys **out of MVP** unless explicitly pulled in with governance stories. |
