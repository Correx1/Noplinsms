# Admin Dashboard Architecture & Flow

The Admin interface (`index.html`) serves as the central command center for the entire school ecosystem. Admins have broad read/write access to manage users, configure academic sessions, and oversee the entire operation.

## Base Layout

- **Path**: `pages/admin/dashboard.html`
- **Sidebar Component**: `components/sidebar.html`
- **Default View**: An overview dashboard containing quick stat cards, recent activities, and charts summarizing school data.

## Module Breakdown

### 1. Dashboard

- **Route**: `dashboard.html` -> loads `loadDashboardHome()` -> `pages/admin/dashboard.html`
- **Actions**: View high-level metrics (total students, total revenue, attendance averages).

### 2. Manage Users

- **Students**:
  - `manage/students/students-list.html`: View all students across all classes with search/filter options.
  - `manage/students/add-student.html`: Enroll a new student, assign to a class/parent.
- **Teachers**:
  - `manage/teachers/teachers-list.html`: View all employed teachers.
  - `manage/teachers/add-teacher.html`: Onboard a new teacher.
- **Parents**:
  - `manage/parents/parents.html`: View parent profiles and linked children.
  - `manage/parents/add-parent.html`: Register a new parent proxy.
- **Alumni**:
  - `manage/alumni.html`: Track graduated students.
- **Import Users**:
  - `manage/import-users.html`: Bulk upload CSV files to batch creation of students/staff.

### 3. Academics

- **Classes**: `academics/classes.html` (Manage grades/levels e.g., Grade 1, JSS1).
- **Subjects**: `academics/subjects/subjects-list.html` (Manage curriculum subjects).
- **Syllabus**: `academics/syllabus/syllabus-list.html` (Upload and manage termly curriculums).
- **Timetable**: `academics/timetable/create-timetable.html` (Generate and assign class schedules).
- **Student Attendance**: `attendance/student-attendance.html` (View/edit daily class attendance).
- **ID Cards**: `academics/id-cards.html` (Generate/print physical ID tags).
- **Discipline**: `academics/discipline.html` (Log behavioral reports).
- **Academic Config**: `academics/config/academic-config.html` (Set current Active Term, Academic Year).

### 4. Examinations

- **Create Examination**: `academics/examinations/examinations.html` (Setup new exam periods).
- **Physical Exams**: `academics/examinations/physical-exams.html` (Manage sit-down pen/paper exams).
- **Online Exams**: `academics/examinations/online-exams.html` (Setup auto-graded web tests).
- **CBT (Mock/Real)**: `academics/examinations/cbt-exams.html` (Manage strict Computer Based Testing).
- **Assessments**: `academics/assessments/assessments.html` (CAs, Quizzes, Projects).
- **Master Sheet**: `academics/examinations/master-sheet.html` (View class-wide subject scores).
- **Cumulative Master Sheet**: `academics/examinations/cumulative-master-sheet.html` (View multi-term academic growth).

### 5. Grading & Promotion

- **Results**: `academics/results.html` (Generate student report cards).
- **Marks Register**: `academics/marks/marks.html` (View raw inputs from teachers).
- **Score Sheets**: `academics/score-sheets.html` (Printable blank sheets for teachers).
- **Promote Students**: `academics/promote-students.html` (Batch migrate students to the next class at year-end).

### 6. Finance

- **Income**: `finance/income.html` (Log miscellaneous school revenue).
- **Expenses**: `finance/expenses.html` (Log purchases, maintenance costs).
- **Fee Collection**: `finance/fee-collection.html` (Manage tuition payments and invoicing).

### 7. Human Resources (HR)

- **Staff Directory**: `hr/staff-directory.html` (View non-teaching staff).
- **Add Staff**: `hr/add-staff.html` (Onboard admins, janitors, drivers).
- **Departments**: `hr/departments.html` (Manage org structure).
- **Designations**: `hr/designations.html` (Manage job titles).
- **Leave Management**: `hr/leave.html` (Approve/Reject staff PTO).
- **Payroll**: `hr/payroll.html` (Generate monthly salary slips).
- **Staff Attendance**: `attendance/staff-attendance.html` (Track employee clock-ins).

### 8. Library

- **Books**: `library/library-list.html` (View inventory).
- **Add Book**: `library/add-book.html` (Catalog new entries).
- **Issue / Return**: `library/issue-return.html` (Manage borrowed assets).
- **Members**: `library/members.html` (Manage library cards).

### 9. Transportation & Hostel

- Manage buses, routes, driver allocations manually.
- Manage hostel buildings, room assignments, and boarder attendance.

### 10. Record Logging

- Detailed tracking of physical Visitors, Phone calls, Emails, and SMS dispatches.

### 11. Communication & AI

- **Events**: Publish changes to the school-wide calendar.
- **Notices**: Broadcast messages to specific user roles via the dashboard banners.
- **Reports**: Generate analytics PDFs.
- **AI & Automations**: Configure backend crons and ML integrations if applicable.

### 12. Settings

- Superuser-level configuration (Branding, User Roles, Invoice Templates, Theme customization).
