# Student Portal — Detailed Documentation

> **Role:** `student` · **Entry:** `pages/student/dashboard.html` · **Sidebar:** `components/student-sidebar.html`

---

## Table of Contents

1. [Portal Overview](#1-portal-overview)
2. [Dashboard](#2-dashboard)
3. [My Marks](#3-my-marks)
4. [Attendance](#4-attendance)
5. [Fees & Payments](#5-fees--payments)
6. [Assignments](#6-assignments)
7. [Library](#7-library)
8. [My Profile](#8-my-profile)
9. [Student Data Model](#9-student-data-model)
10. [Laravel API Endpoints](#10-laravel-api-endpoints)
11. [Cross-Module Relationships](#11-cross-module-relationships)

---

## 1. Portal Overview

The Student Portal gives enrolled students a **read-only view** of their academic records — marks, attendance, fees, assignments, and profile. Students cannot modify data except for their profile photo and password.

### Access Control
- Login at `login-student-parent.html` with student ID + password
- `role = "Student"` → `student-sidebar.html` loaded
- All data scoped to `student_id` from authenticated user
- No cross-student data visibility

### Portal Pages
| File | Module |
|------|--------|
| `pages/student/dashboard.html` | Dashboard |
| `pages/student/marks.html` | Marks & Results |
| `pages/student/attendance.html` | Attendance Record |
| `pages/student/fees.html` | Fee Payments |
| `pages/student/assignments.html` | Class Assignments |
| `pages/student/library.html` | Library Books |
| `pages/student/my-profile.html` | Personal Profile |

---

## 2. Dashboard

**File:** `pages/student/dashboard.html` · **JS:** `student-dashboard.js`

### Widgets Displayed
| Widget | Description |
|--------|-------------|
| Student Card | Photo, name, class, section, roll number |
| Status Indicator | Active / Inactive (dropdown for admin, display-only for student) |
| Current Term | Active term and academic year |
| Fee Summary | Total fee, amount paid, outstanding balance |
| Today's Timetable | Today's subject schedule |
| Latest Marks | Most recent subject scores |
| Attendance Rate | Current term attendance percentage |
| Notices | School notices directed to all students |

### Laravel API
```
GET /api/v1/student/dashboard
Authorization: Bearer {student_token}
```

### Response Schema
```json
{
  "student": {
    "id": "STU001",
    "name": "Adebayo Ogunlesi",
    "class": "SS3",
    "section": "A",
    "roll": "001",
    "photo": "url",
    "status": "Active"
  },
  "currentTerm": { "name": "2nd Term", "academicYear": "2024/2025" },
  "feeStatus": { "totalFee": 173000, "paidAmount": 173000, "outstanding": 0 },
  "attendanceRate": 96.5,
  "todaySchedule": [ { "period": 1, "subject": "Mathematics", "teacher": "Mrs. Wilson", "time": "08:00-09:00" } ],
  "latestMarks": [ { "subject": "Mathematics", "total": 82, "grade": "A1" } ],
  "notices": [ ... ]
}
```

---

## 3. My Marks

**File:** `pages/student/marks.html` · **JS:** `student-pages.js`

### Purpose
Displays the student's academic performance per subject for any selected term.

### Features
- Filter by term and academic year
- Shows score breakdown per grading component
- Displays letter grade and remark per subject
- Shows overall position in class and section
- Can view completed result card (PDF-style preview)

### Data Displayed
```json
{
  "term": "2nd Term",
  "academicYear": "2024/2025",
  "class": "SS3A",
  "position": 5,
  "totalStudents": 28,
  "subjects": [
    {
      "subject": "Mathematics",
      "components": { "1st_ca": 8, "2nd_ca": 9, "exam": 65 },
      "total": 82,
      "grade": "A1",
      "remark": "Excellent"
    },
    {
      "subject": "English Language",
      "components": { "1st_ca": 6, "2nd_ca": 7, "exam": 58 },
      "total": 71,
      "grade": "B2",
      "remark": "Very Good"
    }
  ],
  "average": 74.5
}
```

### Grade Scale Reference (Standard WAEC Grading)
| Grade | Score Range | Remark |
|-------|-------------|--------|
| A1 | 75–100 | Excellent |
| B2 | 70–74 | Very Good |
| B3 | 65–69 | Good |
| C4 | 60–64 | Credit |
| C5 | 55–59 | Credit |
| C6 | 50–54 | Credit |
| D7 | 45–49 | Pass |
| E8 | 40–44 | Pass |
| F9 | 0–39 | Fail |

### Laravel API
```
GET /api/v1/student/marks?term_id=TM002&academic_year_id=AY002
```

---

## 4. Attendance

**File:** `pages/student/attendance.html` · **JS:** `student-pages.js`

### Purpose
Shows the student's attendance record for the current or selected term.

### Features
- Monthly view — shows attendance status per school day
- Summary: Total school days, Present, Absent, Late, Excused
- Percentage attendance prominently displayed
- Warning indicator if attendance drops below 75%

### Data Model
```json
{
  "term": "2nd Term",
  "totalDays": 60,
  "present": 57,
  "absent": 2,
  "late": 1,
  "excused": 0,
  "attendanceRate": 95.0,
  "records": [
    { "date": "2025-01-10", "status": "Present" },
    { "date": "2025-01-11", "status": "Absent" },
    { "date": "2025-01-13", "status": "Late" }
  ]
}
```

### Laravel API
```
GET /api/v1/student/attendance?term_id=TM002
```

---

## 5. Fees & Payments

**File:** `pages/student/fees.html` · **JS:** `student-pages.js`

### Purpose
Shows the student's fee obligations, payment history, and outstanding balance.

### Features
- Fee breakdown per fee type
- Payment history with dates and methods
- Receipt view/print per transaction
- Outstanding balance prominently shown
- No online payment gateway currently (planned)

### Data Model
```json
{
  "studentId": "STU001",
  "academicYear": "2024/2025",
  "term": "2nd Term",
  "feeStructure": [
    { "type": "Tuition Fee", "amount": 120000 },
    { "type": "Development Levy", "amount": 25000 },
    { "type": "Exam Fee", "amount": 15000 },
    { "type": "Sports Fee", "amount": 8000 },
    { "type": "Library Fee", "amount": 5000 }
  ],
  "totalFee": 173000,
  "paidAmount": 173000,
  "outstanding": 0,
  "transactions": [
    {
      "id": "TXN001234",
      "date": "2024-09-15",
      "amount": 100000,
      "method": "Bank Transfer",
      "remarks": "First installment",
      "receiptUrl": null
    }
  ]
}
```

### Laravel API
```
GET /api/v1/student/fees?academic_year_id=AY002&term_id=TM002
GET /api/v1/student/fees/{transaction_id}/receipt
```

---

## 6. Assignments

**File:** `pages/student/assignments.html` · **JS:** `student-pages.js`

### Purpose
Displays assignments created by teachers for the student's class/section.

### Features
- Lists all active assignments sorted by due date
- Shows subject, title, description, due date
- Status indicator: Pending / Submitted / Overdue

### Data Model
```json
{
  "assignments": [
    {
      "id": "ASGN001",
      "title": "Quadratic Equations Exercise",
      "subject": "Mathematics",
      "teacher": "Mrs. Wilson",
      "dueDate": "2025-02-20",
      "description": "Complete exercises 4.1 to 4.5 in the textbook",
      "status": "Pending"
    }
  ]
}
```

### Laravel API
```
GET /api/v1/student/assignments?class_id=C004&section_id=S006&status=active
```

---

## 7. Library

**File:** `pages/student/library.html` · **JS:** `student-pages.js`

### Purpose
Allows students to browse available library books and check their borrowed books status.

### Features
- Browse book catalog (search by title/author/category)
- View current borrowed books and due dates
- Overdue warning display

### Data Model
```json
{
  "borrowedBooks": [
    {
      "bookId": "BK001",
      "title": "New Further Mathematics",
      "author": "Chukwuemeka",
      "issueDate": "2025-01-10",
      "dueDate": "2025-01-24",
      "status": "Borrowed",
      "isOverdue": true
    }
  ],
  "catalog": [
    { "id": "BK002", "title": "Chemistry for Schools", "available": 5, "category": "Science" }
  ]
}
```

### Laravel API
```
GET /api/v1/library/books?available=true&category=Science
GET /api/v1/student/library/borrowed
```

---

## 8. My Profile

**File:** `pages/student/my-profile.html` · **JS:** `student-pages.js`

### Purpose
Student views their complete personal profile.

### Editable Fields (student-facing)
- Profile photo
- Phone number
- Password (via change password form)

### Read-Only Fields (managed by admin)
- Name, DOB, Gender, Class, Section, Roll
- Admission number and date
- Parent/guardian information
- Academic history

### Laravel API
```
GET    /api/v1/student/profile
PUT    /api/v1/student/profile/photo     { photo: file }
PUT    /api/v1/student/profile/password  { old_password, new_password }
```

---

## 9. Student Data Model

### Database Table: `students`

| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `user_id` | FK → users | Login account |
| `admission_number` | string(20) | Unique admission ID |
| `name` | string(100) | Full name |
| `date_of_birth` | date | |
| `gender` | enum(Male, Female) | |
| `nationality` | string | |
| `state_of_origin` | string | |
| `religion` | string | |
| `blood_group` | string(5) | |
| `phone` | string(15) | |
| `email` | string | |
| `address` | text | |
| `photo` | string | URL/path |
| `class_id` | FK → classes | Current class |
| `section_id` | FK → sections | Current section |
| `roll_number` | string(10) | |
| `admission_date` | date | |
| `status` | enum(Active, Inactive) | |
| `department` | string | Science, Art, Commercial |
| `branch_id` | FK → branches | |
| `deleted_at` | timestamp | Soft delete |

### Relationships (Eloquent)
```php
public function user() { return $this->belongsTo(User::class); }
public function class() { return $this->belongsTo(SchoolClass::class); }
public function section() { return $this->belongsTo(Section::class); }
public function parents() { return $this->belongsToMany(ParentGuardian::class, 'student_parent'); }
public function scores() { return $this->hasMany(Score::class); }
public function attendances() { return $this->hasMany(StudentAttendance::class); }
public function fees() { return $this->hasMany(FeePayment::class); }
public function libraryTransactions() { return $this->hasMany(LibraryTransaction::class); }
```

---

## 10. Laravel API Endpoints

### Student-Scoped Routes (all require `auth:sanctum` + `role:student`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/student/dashboard` | Dashboard summary |
| GET | `/api/v1/student/profile` | Full student profile |
| PUT | `/api/v1/student/profile/photo` | Update photo |
| GET | `/api/v1/student/marks` | Term marks |
| GET | `/api/v1/student/attendance` | Attendance record |
| GET | `/api/v1/student/fees` | Fee & payment info |
| GET | `/api/v1/student/assignments` | Class assignments |
| GET | `/api/v1/student/library/borrowed` | Borrowed books |
| GET | `/api/v1/student/timetable` | Class timetable |
| GET | `/api/v1/student/notices` | School notices |

---

## 11. Cross-Module Relationships

```
Student ──── Section (section_id) ManyToOne
Student ──── Class (class_id) ManyToOne
Student ──< Scores (student_id)
Student ──< Attendances (student_id)
Student ──< FeePayments (student_id)
Student ──< LibraryTransactions
Student >──< Parents (student_parent pivot)
Student ──── User (user_id, for login)
```

### Score Computation Flow
```
Student enrolled in Section → Section has Subjects → 
Teacher enters component scores per subject → 
Scores summed per grading_components config → 
Grade derived from grade_boundaries table →
Result card generated from result_sheets.js
```

### Status Lifecycle
```
Admission → status: Active
Graduated/Transferred → status: Inactive (moved to past students view)
Inactive students: visible to admin in separate "Past Students" table
Never hard-deleted (see: soft deletes in students table)
```

---

*See [ADMIN.md](./ADMIN.md) for administrative management of students, [TEACHERS.md](./TEACHERS.md) for who marks their scores.*
