# Teacher Portal — Detailed Documentation

> **Roles:** `teacher`, `staff` · **Entry:** `pages/teacher/dashboard.html` · **Sidebar:** `components/teacher-sidebar.html`

---

## Table of Contents

1. [Portal Overview](#1-portal-overview)
2. [Dashboard](#2-dashboard)
3. [My Classes](#3-my-classes)
4. [Grade Book](#4-grade-book)
5. [Score Entry (Mark Register)](#5-score-entry-mark-register)
6. [Attendance Marking](#6-attendance-marking)
7. [Assignments Management](#7-assignments-management)
8. [Timetable View](#8-timetable-view)
9. [Student Directory](#9-student-directory)
10. [Examination & Duties](#10-examination--duties)
11. [Teacher Profile](#11-teacher-profile)
12. [Messages](#12-messages)
13. [Reports](#13-reports)
14. [Leave Requests](#14-leave-requests)
15. [Payslips](#15-payslips)
16. [Data Model Reference](#16-data-model-reference)
17. [Laravel API Endpoints](#17-laravel-api-endpoints)
18. [Cross-Module Relationships](#18-cross-module-relationships)

---

## 1. Portal Overview

The Teacher Portal provides class teachers and subject teachers read/write access to modules relevant to their assigned classes and subjects. Access is strictly scoped by **teacher assignments** — a teacher can only see students in their classes, and enter scores for their subjects.

### Key Constraints
- A teacher can be a **Form Teacher** (responsible for a whole class) OR a **Section Teacher** (responsible for a section within a class) OR both.
- A teacher can teach **multiple subjects** across multiple **classes/sections**.
- Score entry is scoped to: `teacher → subject → class/section → term`
- Teachers cannot see or modify other teachers' scores.

### Authentication
- Login at `index.html` with email + password
- Upon login: `role = "Teacher"` → `teacher-sidebar.html` loaded
- `teacher_id` linked to `user_id` in users table

---

## 2. Dashboard

**File:** `pages/teacher/dashboard.html` · **JS:** `teacher-dashboard.js`

### Widgets Displayed
| Widget | Description |
|--------|-------------|
| My Classes Today | Periods the teacher has today (from timetable) |
| Pending Score Entry | Subjects missing scores for current term |
| Students Count | Across all assigned classes |
| Attendance Summary | Today's attendance status for their sections |
| Recent Notices | School-wide or teacher-targeted notices |
| Upcoming Events | School calendar events |

### Laravel API
```
GET /api/v1/teacher/dashboard
```

### Response Schema
```json
{
  "teacher": { "id": "T001", "name": "Sarah Wilson" },
  "todaySchedule": [ { "period": 1, "subject": "Mathematics", "class": "SS3A", "time": "08:00-09:00" } ],
  "pendingScoreEntries": 3,
  "totalStudents": 87,
  "todayAttendance": { "present": 82, "absent": 5 },
  "notices": [ ... ]
}
```

---

## 3. My Classes

**File:** `pages/teacher/my-classes.html` · **JS:** `teacher-pages.js`

### Purpose
Shows all classes and sections the teacher is assigned to, with a breakdown of students per section.

### Data Displayed
- Class name (e.g., SS3), Section(s) assigned
- Number of students per section
- Room/location
- Subjects the teacher covers in that class
- Quick links: View Students, Enter Scores, Mark Attendance

### Laravel API
```
GET /api/v1/teacher/classes
```

### Response Schema
```json
[
  {
    "classId": "C004",
    "className": "SS1",
    "sectionId": "S006",
    "sectionName": "A",
    "room": "Block C - 101",
    "studentCount": 20,
    "subjects": ["Mathematics", "Physics"],
    "isFormTeacher": true
  }
]
```

---

## 4. Grade Book

**File:** `pages/teacher/grade-book.html` · **JS:** `teacher-pages.js`

### Purpose
A per-subject, per-class overview of all students' scores entered so far for the current term. Allows the teacher to review, compare, and track academic performance at a glance.

### Data Displayed
- Student name, roll number
- Scores per grading component (1st CA, 2nd CA, Exam)
- Total score, grade, remark
- Class average and position

### Filters
- Select Class/Section
- Select Subject
- Select Term

### Laravel API
```
GET /api/v1/teacher/grade-book?class_id=C004&section_id=S006&subject_id=SUB001&term_id=TM002
```

### Response Schema
```json
{
  "subject": "Mathematics",
  "class": "SS1A",
  "term": "2nd Term",
  "entries": [
    {
      "studentId": "STU006",
      "studentName": "Hassan Bello",
      "roll": "006",
      "components": { "1st_ca": 8, "2nd_ca": 7, "exam": 60 },
      "total": 75,
      "grade": "A1",
      "remark": "Excellent",
      "position": 3
    }
  ],
  "classAverage": 68.5
}
```

---

## 5. Score Entry (Mark Register)

**File:** `admin/marks/marks.html` (shared with admin) · **JS:** `marks.js`, `marks-entry.js`

### Purpose
Teachers enter student scores for each grading component (CA1, CA2, Assignment, Exam) per subject per term.

### Workflow
1. Select Class → Section → Subject → Term
2. Student list loads with input fields for each grading component
3. Teacher enters or edits scores per student
4. Save sends all scores in bulk

### Score Components (from Grading Components config)
- **1st CA** — max 10 marks
- **2nd CA** — max 10 marks
- **Assignment** — max 10 marks
- **Examination** — max 70 marks
- **Total** — auto-computed: sum of all components (max 100)

### Validation Rules
- Each component score must not exceed its configured maximum
- Negative values rejected
- Total auto-calculated; cannot be manually overridden

### Data Submitted
```json
{
  "class_id": "C004",
  "section_id": "S006",
  "subject_id": "SUB001",
  "term_id": "TM002",
  "academic_year_id": "AY002",
  "scores": [
    {
      "student_id": "STU006",
      "component_scores": {
        "GC001": 8,
        "GC002": 7,
        "GC003": 9,
        "GC004": 58
      }
    }
  ]
}
```

### Laravel API
```
GET    /api/v1/scores?class_id=C004&section_id=S006&subject_id=SUB001&term_id=TM002
POST   /api/v1/scores/bulk        { scores: [...] }
PUT    /api/v1/scores/{id}        { component_id, score }
```

---

## 6. Attendance Marking

**File:** `pages/teacher/mark-attendance.html` · **JS:** `teacher-pages.js`

### Purpose
Teachers mark daily attendance for their assigned class/section.

### Workflow
1. Select class/section and date (defaults to today)
2. Student list displayed with radio buttons: Present / Absent / Late / Excused
3. Submit marks all selected statuses

### Attendance Statuses
- `Present`
- `Absent`
- `Late`
- `Excused` — with optional reason note

### Laravel API
```
GET    /api/v1/attendance?section_id=S006&date=2025-02-15
POST   /api/v1/attendance/bulk    { section_id, date, records: [ { student_id, status, note } ] }
PUT    /api/v1/attendance/{id}    { status, note }
```

### Notes for Backend
- A section may only have one attendance record per date. Reject duplicates gracefully.
- The system must support **re-marking** (teacher corrects earlier entry).

---

## 7. Assignments Management

**File:** `pages/teacher/assignments.html` · **JS:** `teacher-pages.js`

### Purpose
Teachers create and manage assignments for their assigned classes. Students can view and submit (planned feature).

### Assignment Data Model
```json
{
  "id": "ASGN001",
  "title": "Quadratic Equations Exercise",
  "subject": "Mathematics",
  "class": "SS3",
  "section": "A",
  "dueDate": "2025-02-20",
  "description": "Complete exercises 4.1 to 4.5 in the textbook",
  "attachments": [],
  "teacherId": "T001",
  "createdAt": "2025-02-10"
}
```

### Laravel API
```
GET    /api/v1/assignments?teacher_id={me}&class_id=C004
POST   /api/v1/assignments
PUT    /api/v1/assignments/{id}
DELETE /api/v1/assignments/{id}
```

---

## 8. Timetable View

**File:** `pages/teacher/timetable.html` · **JS:** `teacher-pages.js`

### Purpose
Displays the teacher's weekly schedule — which class/section/subject they teach each period each day.

### Data Displayed
- Day-by-day, period-by-period view
- Subject, Class, Room per period
- Breaks clearly marked

### Laravel API
```
GET /api/v1/teacher/timetable?term_id=TM002
```

### Response
```json
{
  "teacher": "Sarah Wilson",
  "term": "2nd Term",
  "schedule": {
    "Monday": [
      { "period": 1, "time": "08:00-09:00", "subject": "Mathematics", "class": "SS3A", "room": "Block C-101" },
      { "period": 2, "time": "09:00-10:00", "subject": "---", "class": "---", "room": "---" }
    ]
  }
}
```

---

## 9. Student Directory

**File:** `pages/teacher/students.html` · **JS:** `teacher-pages.js`

### Purpose
Teachers can browse students across their assigned classes. They can view basic student info but **cannot edit**.

### Data Displayed
- Student photo, name, roll, class, section
- Gender indicator
- Contact phone

### Scope
- Only students in the teacher's **assigned sections** are visible
- No cross-class visibility

### Laravel API
```
GET /api/v1/teacher/students?section_id=S006
```

---

## 10. Examination & Duties

**File:** `pages/teacher/exams.html` · **JS:** `teacher-pages.js`

### Purpose
Shows examination schedule and teacher's invigilation duties.

### Data Displayed
- Upcoming exams schedule
- Teacher's invigilation assignments (class, hall, date, time)
- Exam result entry status per subject

---

## 11. Teacher Profile

**File:** `pages/teacher/profile.html` · **JS:** `teacher-pages.js`

### Purpose
Teacher views and updates their personal and professional profile.

### Editable Fields
- Photo, phone, email, address
- Bank details (for payroll)
- Emergency contact

### Read-Only Fields
- Joining date, qualification, specialization, classes assigned

---

## 12. Messages

**File:** `pages/teacher/messages.html` · **JS:** `teacher-pages.js`

### Purpose
Internal messaging between teachers and admin, and notifications.

### Laravel API
```
GET    /api/v1/messages?user_id={me}
POST   /api/v1/messages    { recipient_id, subject, body }
PATCH  /api/v1/messages/{id}/read
```

---

## 13. Reports

**File:** `pages/teacher/reports.html` · **JS:** `teacher-pages.js`

### Purpose
Teacher-specific academic performance analytics:
- Subject pass rate
- Class average per term
- Students below average

---

## 14. Leave Requests

**Via:** HR Module (access restricted to own records)

### Workflow
1. Teacher fills leave form (type: Annual, Sick, Casual; dates; reason)
2. Submitted to admin for approval
3. Admin approves/rejects from `admin/hr/leave.html`

### Laravel API
```
GET    /api/v1/leave-requests?user_id={me}
POST   /api/v1/leave-requests    { type, start_date, end_date, reason }
```

---

## 15. Payslips

**Via:** HR Module (access restricted to own records)

Displays monthly payroll breakdown:
- Basic salary, allowances, deductions, net pay

### Laravel API
```
GET /api/v1/payslips?teacher_id={me}&year=2025
```

---

## 16. Data Model Reference

### Teacher Model (Full)
```json
{
  "id": "T001",
  "user_id": "U005",
  "name": "Sarah Wilson",
  "photo": "url",
  "date_of_birth": "1985-04-12",
  "gender": "Female",
  "phone": "08012345678",
  "email": "sarah.wilson@school.com",
  "address": "123, Maple Street, Lagos",
  "status": "Active",
  "joining_date": "2018-09-01",
  "qualification": "M.Sc. Mathematics",
  "employment_type": "Full-time",
  "salary": 150000,
  "subjects": ["SUB001", "SUB004"],
  "sections": ["S006", "S007"],
  "isFormTeacher": true,
  "formClass": "C004",
  "branch_id": "BR001"
}
```

---

## 17. Laravel API Endpoints

### Teacher-Scoped Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/teacher/dashboard` | Teacher dashboard stats |
| GET | `/api/v1/teacher/classes` | My assigned classes |
| GET | `/api/v1/teacher/students?section_id=` | Students in my sections |
| GET | `/api/v1/teacher/timetable` | My weekly schedule |
| GET | `/api/v1/teacher/grade-book` | Grade book view |
| GET | `/api/v1/scores` | Fetch scores for entry |
| POST | `/api/v1/scores/bulk` | Submit scores in bulk |
| GET | `/api/v1/attendance` | Fetch section attendance |
| POST | `/api/v1/attendance/bulk` | Submit attendance |
| GET | `/api/v1/assignments?mine=true` | My assignments |
| POST | `/api/v1/assignments` | Create assignment |
| GET | `/api/v1/leave-requests?mine=true` | My leave requests |
| POST | `/api/v1/leave-requests` | Submit leave |
| GET | `/api/v1/payslips?mine=true` | My payslips |

---

## 18. Cross-Module Relationships

```
Teacher ──< section_teachers >──< Section (many-to-many)
Teacher ──< subject_teachers >──< Subject (many-to-many)
Teacher ──── Class (form_teacher_id) OneToOne
Teacher ──< Scores (entered_by) 
Teacher ──< Attendance (marked_by)
Teacher ──── User (user_id) 
Teacher ──< LeaveRequests
Teacher ──< PayrollRecords
```

### Score-Entry Chain
```
Teacher selects: Section → Subject → Term
→ All enrolled students in that section are fetched
→ Grading components loaded from grading_components table
→ Score entries are validated against component max scores
→ Total computed and grade assigned via grade_boundaries table
→ Result available on result_sheets.html
```

---

*See [ADMIN.md](./ADMIN.md) for admin management of teachers, and [STUDENTS.md](./STUDENTS.md) for the student portal.*
