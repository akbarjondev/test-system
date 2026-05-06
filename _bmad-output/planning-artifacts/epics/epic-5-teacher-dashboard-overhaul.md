# Epic 5: Teacher Dashboard Overhaul

Teachers have a modern, Uzbek-language dashboard built for users with limited digital experience. All list views use DataTable with sorting and pagination.

### Story 5.1: Tests List Page

As a teacher,
I want to see all my tests in a clear, sortable table,
So that I can quickly find and manage any test.

**Acceptance Criteria:**

**Given** a teacher navigates to `/dashboard/tests`
**When** the page loads
**Then** tests are displayed in a shadcn DataTable with columns: Nomi, Savollar soni, Vaqt chegarasi, Holat, Amallar
**And** the table supports sorting by name and creation date
**And** the table supports pagination (10 rows per page default)
**And** all column headers and action buttons are in Uzbek

**Given** no tests exist yet
**When** the page loads
**Then** an empty state message is shown in Uzbek: "Hali testlar yo'q. Yangi test yarating."
**And** a prominent "Yangi test" button is visible

---

### Story 5.2: Test Create & Edit Forms

As a teacher,
I want a clear, well-labeled form to create and edit tests,
So that I can configure all test settings without confusion.

**Acceptance Criteria:**

**Given** a teacher opens the test create or edit form
**When** the form renders
**Then** fields are grouped in labeled sections with Uzbek labels and helper text for every field
**And** the form includes all fields: Nomi, Tavsif, Har bir savol uchun ball, Vaqt chegarasi (daqiqa), Har doim mavjud, Boshlanish/tugash vaqti, Test kodi (3 ta raqam), Faqat bir marta topshirish, O'tish bali

**Given** a teacher submits the form with missing required fields
**When** validation runs
**Then** inline error messages appear in Uzbek beneath each invalid field

**Given** a teacher successfully saves a test
**When** the form submits
**Then** they are redirected to the test detail page with a success toast in Uzbek: "Test muvaffaqiyatli saqlandi"

---

### Story 5.3: Test Results Page

As a teacher,
I want to see a detailed results table for each test,
So that I can evaluate how students performed.

**Acceptance Criteria:**

**Given** a teacher navigates to `/dashboard/tests/:id/results`
**When** the page loads
**Then** a DataTable shows columns: Talaba ismi, Ball, Maksimal ball, Natija, Holat, Topshirilgan vaqt, Sarflangan vaqt
**And** the Natija column shows a shadcn Badge: "O'tdi" (green), "O'tmadi" (red), or empty if no passingScore set
**And** the Holat column shows: "Topshirilgan", "Vaqt tugadi", or "Jarayonda"

**Given** no attempts exist for the test
**When** the page loads
**Then** an empty state is shown: "Hali hech kim bu testni topshirmagan."

---

### Story 5.4: Users List Page

As a teacher,
I want to see all registered students in a clear table,
So that I can monitor who is using the platform.

**Acceptance Criteria:**

**Given** a teacher navigates to `/dashboard/users`
**When** the page loads
**Then** a DataTable shows columns: Ismi, Telefon raqami, Rol, Ro'yxatdan o'tgan sana
**And** role is shown as a shadcn Badge: "O'qituvchi" (blue) or "Talaba" (gray)
**And** the table supports sorting and pagination

**Given** the teacher searches or filters by name
**When** they type in the search input
**Then** the table filters results in real time

---

### Story 5.5: Navigation & Layout

As a teacher,
I want a simple navigation structure where any page is reachable in 2 clicks,
So that I never feel lost in the dashboard.

**Acceptance Criteria:**

**Given** a teacher is logged in
**When** they view any dashboard page
**Then** a sidebar or top navigation shows links: Bosh sahifa, Testlar, Foydalanuvchilar — all in Uzbek
**And** the active page is visually highlighted

**Given** a teacher is on any page
**When** they click any nav item
**Then** they reach their destination in one click (maximum 2 clicks from any screen)

**Given** the dashboard is viewed on a smaller screen
**When** the viewport is mobile-sized
**Then** the navigation collapses into a hamburger menu and all pages remain accessible

---
