# Noplin School Management System — Frontend Documentation

> **Version:** 1.0 · **Stack:** HTML + Vanilla JS + Tailwind CSS + Flowbite · **Purpose:** Laravel Backend Implementation Guide

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Role-Based Portal Map](#role-based-portal-map)
4. [Module Directory Map](#module-directory-map)
5. [Data Flow Overview](#data-flow-overview)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database Table Reference](#database-table-reference)
8. [API Endpoint Convention](#api-endpoint-convention)
9. [Key Cross-Module Relationships](#key-cross-module-relationships)
10. [File Structure Guide](#file-structure-guide)

---

## Project Overview

**Noplin SMS** is a comprehensive, multi-tenant School Management System frontend built for Nigerian secondary schools (JSS1–SS3). It is designed as a **pure HTML/JS SPA** loaded dynamically via `sidebar.js`, which handles role-based routing without a traditional router framework.

The backend is expected to be a **Laravel REST API** that replaces all `data/*.json` files, implementing proper authentication, CRUD operations, and business logic.

### Key Features
- Multi-role access: **Admin**, **Teacher**, **Staff**, **Student**, **Parent**, **Owner**
- Academic management: Classes, Sections, Subjects, Grading, Results, Timetable
- Financial management: Fee collection, Income, Expenses, Payroll
- Communication: Notices, Messages, SMS/Email logs
- HR management: Staff directory, Leave, Payroll, Designations
- Infrastructure: Hostel, Library, Transportation

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Browser (HTML SPA)            │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  index.html  │  │ dashboard.html   │  │
│  │ (Login Gate) │  │  (Admin/Role)    │  │
│  └──────┬──────┘  └────────┬─────────┘  │
│         │                  │             │
│         ▼                  ▼             │
│  ┌─────────────────────────────────────┐ │
│  │           sidebar.js               │ │
│  │  - Loads components (navbar,sidebar)│ │
│  │  - Dynamic page injection via fetch │ │
│  │  - loadPage(url, scriptSrc, id)     │ │
│  └────────────────────────────────────-┘ │
│         │                               │
│         ▼                               │
│  ┌─────────────────────────────────────┐ │
│  │     pages/admin/{module}/page.html  │ │ 
│  │        + js/{module}.js             │ │
│  │   (inject into #main-content div)   │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
          │
          ▼  (fetch from JSON files → replace with Laravel API)
┌─────────────────────┐
│   data/*.json       │  ← Mock API responses
│   (38 JSON files)   │  ← Replace with /api/* endpoints
└─────────────────────┘
```

### Key Principles
- **No build system for runtime** — scripts are loaded dynamically with `loadScript(src, id)`
- **Tailwind CSS** compiled at build time via Vite
- **Flowbite** used for interactive UI components (modals, dropdowns)
- **localStorage** used for session state (user role, login flag, branch context)
- **Page modules** are self-contained IIFEs — each JS file is an Immediately Invoked Function Expression

---

## Role-Based Portal Map

| Role | Entry Dashboard | Panel Base Path | Sidebar Template |
|------|----------------|-----------------|-----------------|
| **Admin** | `pages/admin/dashboard.html` | `pages/admin/` | `components/sidebar.html` |
| **Teacher/Staff** | `pages/teacher/dashboard.html` | `pages/teacher/` | `components/teacher-sidebar.html` |
| **Student** | `pages/student/dashboard.html` | `pages/student/` | `components/student-sidebar.html` |
| **Parent** | `pages/parent/dashboard.html` | `pages/parent/` | `components/parent-sidebar.html` |
| **Owner** | `pages/owner/` | `pages/owner/` | `components/owner-sidebar.html` |

---

## Module Directory Map

### Admin Modules

| Module | Path | JS Controller | Data Source |
|--------|------|---------------|-------------|
| Dashboard | `admin/dashboard-home.html` | `dashboard.js` | `dashboard-data.json` |
| Students | `admin/manage/students/` | `students-list.js`, `add-student.js` | `students-data.json` |
| Teachers | `admin/manage/teachers/` | `teachers.js` | `teachers-data.json` |
| Parents | `admin/manage/parents/` | `parents.js` | `parents-data.json` |
| Staff | `admin/manage/staff/` | `staff.js` | `staff-data.json` |
| Alumni | `admin/manage/alumni/` | `alumni.js` | `alumni-data.json` |
| Classes | `admin/academics/classes/` | `classes.js` | `classes-data.json` |
| Subjects | `admin/academics/subjects/` | `subjects.js` | `subjects-data.json` |
| Syllabus | `admin/academics/syllabus/` | `syllabus.js` | `syllabus-data.json` |
| Academic Config | `admin/academics/config/` | `academic-config.js` | `academic-config.json` |
| Promote Students | `admin/academics/classes/promote-students.html` | `promote-students.js` | — |
| Assessments | `admin/academics/assessments/` | `assessments.js` | `assessments-data.json` |
| Examinations | `admin/academics/examinations/` | `examinations.js`, `cbt-exams.js` | `examinations-data.json` |
| Grade Boundaries | `admin/academics/grading/grade-boundaries.html` | `grade-boundaries.js` | — |
| Grading Components | `admin/academics/grading/grading-components.html` | `grading-components.js` | — |
| Score Sheets | `admin/academics/grading/score-sheets.html` | `score-sheets.js` | — |
| Multi Score Sheet | `admin/academics/grading/multi-score-sheet.html` | `multi-score-sheet.js` | — |
| Result Sheets | `admin/academics/grading/result-sheets.html` | `result-sheets.js` | — |
| Result Settings | `admin/academics/grading/result-settings.html` | `result-settings.js` | — |
| Session Results | `admin/academics/grading/session-results.html` | `session-results.js` | — |
| Master Results | `admin/academics/grading/results.html` | `results.js` | — |
| Timetable | `admin/academics/timetable/` | `timetable.js` | `timetable-data.json` |
| ID Cards | `admin/academics/id-cards.html` | `id-cards.js` | — |
| Attendance (Students) | `admin/attendance/student-attendance.html` | `attendance.js` | — |
| Attendance (Staff) | `admin/attendance/staff-attendance.html` | `staff-attendance.js` | — |
| Finance — Income | `admin/finance/income.html` | `income.js` | `income-data.json` |
| Finance — Expenses | `admin/finance/expenses.html` | `expenses.js` | `expenses-data.json` |
| Finance — Fees | `admin/finance/fee-collection.html` | `fee-collection.js` | `fee-data.json` |
| HR | `admin/hr/` | `hr.js` | `hr-data.json` |
| Library | `admin/library/` | `library.js` | `library-books.json`, `library-members.json` |
| Transportation | `admin/transportation/` | `transportation.js` | `transport-*.json` |
| Hostel | `admin/hostel/` | `hostel.js` | `hostel-*.json` |
| Notices | `admin/notices/` | `notices.js` | `notices-data.json` |
| Events | `admin/events/` | `events.js` | `events-data.json` |
| Discipline | `admin/discipline/` | `discipline.js` | `discipline-data.json` |
| Reports | `admin/reports.html` | `reports.js` | `reports-data.json` |
| AI & Automations | `admin/ai-automations.html` | `ai-automations.js` | — |
| Settings | `admin/settings/` | `settings.js`, `users.js`, `templates.js` | — |

---

## Data Flow Overview

### Current (Mock) Flow
```
User Action → JS Module → fetch('../../data/module.json') → render
```

### Target (Laravel) Flow
```
User Action → JS Module → fetch('/api/v1/resource', { headers: Bearer token }) 
           → Laravel API Controller → Eloquent Model → MySQL
           → JSON Response → JS render
```

### Authentication Token Flow
```
Login Form → POST /api/auth/login 
           → { token, role, user_id, branch_id }
           → localStorage: { isLoggedIn, userRole, token, savedUsername }
           → All subsequent requests: Authorization: Bearer {token}
```

---

## Authentication & Authorization

### Current Implementation (Frontend)
- `auth.js` manages login/logout
- Role stored in `localStorage.userRole`
- Sidebar template switched based on role
- No token validation on routes (pure client-side)

### Required Laravel Implementation

#### Roles
```php
// Roles Enum
const ROLES = [
    'admin', 'teacher', 'staff', 'student', 'parent', 'owner'
];
```

#### Middleware
- `auth:sanctum` — All protected routes
- `role:admin` — Admin-only routes
- `role:teacher,staff` — Teacher/staff routes
- `role:student` — Student routes
- `role:parent` — Parent routes
- `role:owner` — Owner/cross-branch routes

#### Multi-Tenancy
The system supports **multiple school branches** (managed by Owner role). Each branch has its own data context. All models should include a `branch_id` foreign key.

---

## Database Table Reference

> See individual role documentation (ADMIN.md, TEACHERS.md, etc.) for field-level detail.

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | All login accounts (admin, teacher, student, parent, owner) |
| `roles` | Role definitions |
| `branches` | School branches (multi-tenant) |
| `students` | Student profiles |
| `teachers` | Teacher profiles |
| `parents` | Parent/guardian profiles |
| `staff` | Non-teaching staff |
| `classes` | Class groups (JSS1, SS1, etc.) |
| `sections` | Class sections (A, B, C...) |
| `subjects` | Subject catalog |
| `academic_years` | Academic session records |
| `terms` | Term records per academic year |
| `enrollments` | Student-class-term assignment |
| `scores` | Student subject scores |
| `grading_components` | Score component definitions (CA, Exam) |
| `grade_boundaries` | Grade to score range mapping |
| `timetable_slots` | Class timetable entries |
| `fee_structures` | Fee type definitions per class |
| `fee_payments` | Payment transaction records |
| `attendances` | Daily student/staff attendance |
| `notices` | School notice board |
| `events` | School event records |
| `timetables` | Class period scheduling |
| `library_books` | Library book inventory |
| `transport_vehicles` | Transport fleet |
| `hostel_rooms` | Hostel room inventory |
| `hr_leave_requests` | Staff leave applications |
| `payroll_records` | Monthly staff salary records |

---

## API Endpoint Convention

All endpoints should follow RESTful conventions:

```
Base URL: /api/v1/

GET    /api/v1/{resource}           → List (with filters via query params)
POST   /api/v1/{resource}           → Create
GET    /api/v1/{resource}/{id}      → Show
PUT    /api/v1/{resource}/{id}      → Update
DELETE /api/v1/{resource}/{id}      → Delete (soft-delete preferred)
```

### Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 240
  }
}
```

---

## Key Cross-Module Relationships

```
Branch (1) ──< AcademicYear (n)
AcademicYear (1) ──< Term (3)
Term (1) ──< Enrollment (n)
Class (1) ──< Section (n)
Section (1) ──< Enrollment (n)
Student (1) ──< Enrollment (n)
Teacher (n) >──< Section (n) [section_teachers pivot]
Subject (n) >──< Class (n) [class_subjects pivot]
Subject (n) >──< Teacher (n) [subject_teachers pivot]
Enrollment (1) ──< Score (n per subject per term)
Score (n) ──── GradingComponent (1)
Student (n) >──< Parent (n) [student_parent pivot]
Student (1) ──< FeePayment (n)
```

---

## File Structure Guide

```
/
├── index.html              ← Login page (admin/teacher login)
├── login-student-parent.html ← Student/parent login
├── password-recovery.html  ← Password reset
│
├── pages/
│   ├── admin/              ← Admin portal pages
│   ├── teacher/            ← Teacher portal pages
│   ├── student/            ← Student portal pages
│   ├── parent/             ← Parent portal pages
│   └── owner/              ← Owner/director portal pages
│
├── js/                     ← JavaScript modules (1 per page/feature)
├── data/                   ← Mock JSON data (replace with API calls)
├── components/             ← Reusable HTML partials (navbar, sidebars)
├── css/                    ← Compiled Tailwind styles
├── assets/                 ← Images, icons, fonts
└── DOCUMENTATION/          ← This documentation
```

---

## Development Notes for Laravel Team

1. **Replace all `fetch('../../data/*.json')`** calls in JS files with proper API calls pointing to `/api/v1/` endpoints
2. **Token injection** — After login, store the Sanctum token in `localStorage('sms_token')` and pass it in all API requests as `Authorization: Bearer {token}`
3. **Pagination** — Most list endpoints (students, teachers, etc.) should support `?page=1&per_page=15` query params. The frontend JS handles pagination state locally.
4. **Filters** — Pass filter parameters as query strings: `?class=SS3&status=Active&gender=Male`
5. **Export** — The Excel export buttons generate CSV from the current JS `filteredData` array — no server-side export endpoint needed unless large datasets require it
6. **Multi-branch** — All requests must be scoped to `branch_id` (stored in `localStorage('sms_currentBranchId')`)
7. **Soft Deletes** — Students and Teachers are never hard-deleted; they are marked `Inactive`. Use Laravel's `SoftDeletes` trait for all people-related models.

---

*See [ADMIN.md](./ADMIN.md), [TEACHERS.md](./TEACHERS.md), [STUDENTS.md](./STUDENTS.md), [OWNER.md](./OWNER.md) for detailed per-role documentation.*
