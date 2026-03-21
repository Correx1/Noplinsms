# Admin Portal — Detailed Documentation

> **Role:** `admin` · **Entry:** `pages/admin/dashboard.html` · **Sidebar:** `components/sidebar.html`

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Student Management](#2-student-management)
3. [Teacher Management](#3-teacher-management)
4. [Parent Management](#4-parent-management)
5. [Staff Management](#5-staff-management)
6. [Alumni Management](#6-alumni-management)
7. [Class & Section Management](#7-class--section-management)
8. [Subject Management](#8-subject-management)
9. [Academic Configuration](#9-academic-configuration)
10. [Grading System](#10-grading-system)
11. [Examination System](#11-examination-system)
12. [Score Sheets & Results](#12-score-sheets--results)
13. [Timetable](#13-timetable)
14. [Attendance](#14-attendance)
15. [Finance](#15-finance)
16. [Human Resources](#16-human-resources)
17. [Library](#17-library)
18. [Transportation](#18-transportation)
19. [Hostel](#19-hostel)
20. [Notices & Events](#20-notices--events)
21. [Discipline](#21-discipline)
22. [Reports & Analytics](#22-reports--analytics)
23. [Settings & User Management](#23-settings--user-management)

---

## 1. Dashboard

**File:** `admin/dashboard-home.html` · **JS:** `dashboard.js` · **Data:** `dashboard-data.json`

### Purpose
Displays school-wide statistics and quick-access widgets.

### Data Displayed
- Total Students, Teachers, Classes, Subjects
- Fee collection summary (collected vs outstanding)
- Attendance rate (today)
- Recent notices and upcoming events
- Quick links to all major modules

### Laravel API Required
```
GET /api/v1/dashboard/stats
```

### Response Schema
```json
{
  "totalStudents": 240,
  "totalTeachers": 18,
  "totalClasses": 6,
  "totalSubjects": 12,
  "feeCollected": 2500000,
  "feeOutstanding": 750000,
  "attendanceRate": 94.5,
  "recentNotices": [ ... ],
  "upcomingEvents": [ ... ]
}
```

---

## 2. Student Management

**Files:** `admin/manage/students/` · **JS:** `students-list.js`, `add-student.js`, `view-student.js`

### Pages
| Page | Function |
|------|----------|
| `students-list.html` | Main students table with filters, export, status management |
| `add-student.html` | Add/edit student form |
| `view-student.html` | Detailed student profile view |
| `inactive-students.html` | Past/inactive students table |

### Student Data Model

```json
{
  "id": "STU001",
  "name": "Adebayo Ogunlesi",
  "class": "SS3",
  "department": "Science",
  "section": "A",
  "roll": "001",
  "phone": "08012345678",
  "gender": "Male",
  "status": "Active",
  "photo": "url"
}
```

### Full Student Schema (for Add/Edit form)

```json
{
  "id": "STU001",
  "admissionNumber": "ADM/2024/001",
  "name": "Adebayo Ogunlesi",
  "dateOfBirth": "2008-05-12",
  "gender": "Male",
  "nationality": "Nigerian",
  "stateOfOrigin": "Lagos",
  "religion": "Christianity",
  "bloodGroup": "O+",
  "phone": "08012345678",
  "email": "adebayo@example.com",
  "address": "123 Main Street, Lagos",
  "photo": "url",
  "class": "SS3",
  "section": "A",
  "department": "Science",
  "roll": "001",
  "admissionDate": "2022-09-01",
  "status": "Active",
  "parentId": "P001",
  "documents": {
    "birthCertificate": "url",
    "transferCertificate": "url"
  }
}
```

### Status Values
| Status | Description | Appears in Main Table |
|--------|-------------|----------------------|
| `Active` | Currently enrolled | ✅ Yes |
| `Inactive` | Left/transferred/graduated | ❌ No (moved to Inactive page) |

### Filtering Supported
- Class (e.g., JSS1, SS3)
- Section (A, B, C...)
- Gender (Male, Female)
- Status (Active only in main table)
- Department (Science, Art, Commercial)

### Export Feature
- **Excel Export:** Exports currently filtered students as CSV
  - Columns: S/N, Student ID, Name, Class, Section, Department, Roll, Phone, Gender, Status
  - Excludes photos
  - Filename includes active filter and date

### Laravel API Required
```
GET    /api/v1/students?class=SS3&status=Active&gender=Male&page=1
POST   /api/v1/students
GET    /api/v1/students/{id}
PUT    /api/v1/students/{id}
PATCH  /api/v1/students/{id}/status   { status: "Inactive" }
```

### Laravel Model: `Student`
```php
// Key Fields
$fillable = [
    'admission_number', 'name', 'date_of_birth', 'gender', 
    'phone', 'email', 'address', 'photo', 'class_id', 
    'section_id', 'roll_number', 'admission_date', 'status',
    'branch_id', 'department', 'religion', 'blood_group',
    'state_of_origin', 'nationality'
];

// Relationships
public function section() { return $this->belongsTo(Section::class); }
public function class() { return $this->belongsTo(SchoolClass::class); }
public function parents() { return $this->belongsToMany(Parent::class, 'student_parent'); }
public function fees() { return $this->hasMany(FeePayment::class); }
public function scores() { return $this->hasMany(Score::class); }
public function attendances() { return $this->hasMany(Attendance::class); }
```

---

## 3. Teacher Management

**Files:** `admin/manage/teachers/` · **JS:** `teachers.js`

### Pages
| Page | Function |
|------|----------|
| `teachers-list.html` | Main teachers table with status filter, export |
| `add-teacher.html` | Add/edit teacher form |

### Teacher Data Model

```json
{
  "id": "T001",
  "name": "Sarah Wilson",
  "photo": "url",
  "dob": "1985-04-12",
  "gender": "Female",
  "phone": "08012345678",
  "email": "sarah.wilson@school.com",
  "address": "123, Maple Street, Lagos",
  "status": "Active",
  "employment": {
    "joining_date": "2018-09-01",
    "qualification": "M.Sc. Mathematics",
    "specialization": ["Mathematics", "Physics"],
    "classes_assigned": ["SS3 A", "SS2 B"],
    "salary": "150000",
    "type": "Full-time"
  }
}
```

### Status Values
| Status | Description | Shows in Main Table |
|--------|-------------|---------------------|
| `Active` | Currently teaching | ✅ Yes |
| `On Leave` | Temporarily away | ✅ Yes |
| `Inactive` | No longer employed | ❌ No |

### Export Feature
- **Excel Export:** Exports `filteredTeachers` array as CSV
  - Columns: S/N, Teacher ID, Name, Phone, Email, Status, Specialization, Classes, Type

### Laravel API Required
```
GET    /api/v1/teachers?status=Active&subject=Mathematics
POST   /api/v1/teachers
GET    /api/v1/teachers/{id}
PUT    /api/v1/teachers/{id}
PATCH  /api/v1/teachers/{id}/status
```

### Laravel Model: `Teacher`
```php
$fillable = [
    'name', 'photo', 'date_of_birth', 'gender', 'phone', 
    'email', 'address', 'status', 'joining_date', 'qualification',
    'salary', 'employment_type', 'branch_id', 'user_id'
];

public function subjects() { return $this->belongsToMany(Subject::class, 'subject_teachers'); }
public function sections() { return $this->belongsToMany(Section::class, 'section_teachers'); }
public function user() { return $this->belongsTo(User::class); }
```

---

## 4. Parent Management

**Files:** `admin/manage/parents/` · **JS:** `parents.js`

### Parent Data Model
```json
{
  "id": "P001",
  "name": "Mr. Adebayo Johnson",
  "relation": "Father",
  "phone": "08012345678",
  "email": "adebayo.johnson@email.com",
  "occupation": "Engineer",
  "address": "12 Victoria Island, Lagos",
  "linkedStudents": ["STU001", "STU015"],
  "emergencyContact": true,
  "status": "Active"
}
```

### Status Values
| Status | Shows in Main Table |
|--------|---------------------|
| `Active` | ✅ Yes |
| `Inactive` | ❌ No (moved to past/inactive view) |

### Key Relationship
A parent can be linked to **multiple students** (children). `linkedStudents` is a many-to-many pivot.

### Laravel API Required
```
GET    /api/v1/parents?status=Active
POST   /api/v1/parents
GET    /api/v1/parents/{id}
PUT    /api/v1/parents/{id}
POST   /api/v1/parents/{id}/link-student   { student_id }
DELETE /api/v1/parents/{id}/unlink-student/{student_id}
```

### Laravel Model: `ParentGuardian`
```php
$fillable = ['name', 'relation', 'phone', 'email', 'occupation', 'address', 'status', 'branch_id'];
public function students() { return $this->belongsToMany(Student::class, 'student_parent'); }
```

---

## 5. Staff Management

**Files:** `admin/manage/staff/` · **JS:** `staff.js` · **Data:** `staff-data.json`

### Purpose
Manages non-teaching staff (Clerks, Security, Cleaners, Lab Assistants, etc.)

### Staff Data Model
```json
{
  "id": "SF001",
  "name": "Amaka Obi",
  "role": "Clerk",
  "department": "Administration",
  "phone": "08011223344",
  "email": "amaka.obi@school.com",
  "status": "Active",
  "joining_date": "2021-01-01"
}
```

### Laravel API
```
GET    /api/v1/staff
POST   /api/v1/staff
GET    /api/v1/staff/{id}
PUT    /api/v1/staff/{id}
PATCH  /api/v1/staff/{id}/status
```

---

## 6. Alumni Management

**Files:** `admin/manage/alumni/` · **JS:** `alumni.js`

### Purpose
Tracks graduated/former students.

### Key Fields
Same as Student model + `graduation_year`, `current_institution`, `profession`

---

## 7. Class & Section Management

**Files:** `admin/academics/classes/` · **JS:** `classes.js`

### Pages
| Page | Function |
|------|----------|
| `classes.html` | Class list view |
| `add-class.html` | Create/edit class |
| `view-class.html` | Class detail with sections management |
| `promote-students.html` | Promote/move students between classes |

### Class Data Model
```json
{
  "id": "C001",
  "name": "JSS1",
  "level": 7,
  "totalStudents": 45,
  "classTeacherId": "T002",
  "academicYear": "2023/2024",
  "sections": [
    {
      "id": "S001",
      "name": "A",
      "teacherIds": ["T002", "T004"],
      "capacity": 30,
      "studentCount": 25,
      "room": "Block A - 101"
    }
  ],
  "subjects": ["Mathematics", "English Language", "Basic Science"]
}
```

### Key Points
- **Form Teacher** (formerly "Class Teacher") — The primary teacher responsible for the entire class. Stored as `classTeacherId`.
- **Section Teachers** — Multiple teachers can be assigned to a section. Stored as `teacherIds[]` array in each section.
- **Sections** are sub-groups of a class. Student enrollment is always at the section level.

### Promote Students Logic
The `promote-students.js` implements a class transition system:
- Select source class + term/session
- Choose target class for promotion
- Students who pass are promoted; repeaters stay back
- Triggers enrollment record updates

### Laravel Tables Required

#### `classes` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `name` | string | "JSS1", "SS3" |
| `level` | integer | Grade level (7–12) |
| `form_teacher_id` | FK → teachers | |
| `academic_year_id` | FK → academic_years | |
| `branch_id` | FK → branches | |

#### `sections` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `class_id` | FK → classes | |
| `name` | string | "A", "B", "Ruby" |
| `capacity` | integer | Max students |
| `room` | string | Room label |

#### `section_teachers` pivot
| Column | Type |
|--------|------|
| `section_id` | FK |
| `teacher_id` | FK |

### Laravel API Required
```
GET    /api/v1/classes
POST   /api/v1/classes
GET    /api/v1/classes/{id}
PUT    /api/v1/classes/{id}
POST   /api/v1/classes/{id}/sections
PUT    /api/v1/classes/{class_id}/sections/{id}
POST   /api/v1/promote-students
```

---

## 8. Subject Management

**Files:** `admin/academics/subjects/` · **JS:** `subjects.js`

### Subject Data Model
```json
{
  "id": "SUB001",
  "name": "Mathematics",
  "code": "MTH101",
  "type": "Core",
  "department": "General",
  "classes": ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"],
  "teacherIds": ["T001", "T003"]
}
```

### Subject Types
- `Core` — Compulsory for all students in assigned classes
- `Elective` — Optional
- `Compulsory` — Alias for Core

### Subject Group / Department
- `General` — All classes
- `Science` — SS classes (Physics, Chemistry, Biology)
- `Art` — Literature, Government, History
- `Commercial` — Economics, Accounting, Commerce

### Laravel Tables

#### `subjects` table
| Column | Type |
|--------|------|
| `id` | PK |
| `name` | string |
| `code` | string(10) |
| `type` | enum(Core, Elective) |
| `department` | string |
| `branch_id` | FK |

#### `class_subjects` pivot
| Column | Type |
|--------|------|
| `class_id` | FK |
| `subject_id` | FK |

#### `subject_teachers` pivot
| Column | Type |
|--------|------|
| `subject_id` | FK |
| `teacher_id` | FK |

---

## 9. Academic Configuration

**File:** `admin/academics/config/academic-config.html` · **JS:** `academic-config.js`

### Data Model
```json
{
  "academicYears": [
    { "id": "AY001", "name": "2023/2024", "startDate": "2023-09-01", "endDate": "2024-07-20", "status": "Past" },
    { "id": "AY002", "name": "2024/2025", "startDate": "2024-09-05", "endDate": "2025-07-15", "status": "Active" }
  ],
  "terms": [
    { "id": "TM001", "name": "First Term", "academicYear": "2024/2025", "startDate": "2024-09-05", "endDate": "2024-12-15", "status": "Past" },
    { "id": "TM002", "name": "Second Term", "academicYear": "2024/2025", "startDate": "2025-01-10", "endDate": "2025-04-05", "status": "Active" }
  ],
  "classGroups": [ ... ],
  "subjectGroups": [ ... ]
}
```

### Laravel Tables
- `academic_years` — sessions
- `terms` — 3 terms per year
- `class_groups` — Junior Secondary, Senior Secondary

---

## 10. Grading System

**Path:** `admin/academics/grading/` · **JS:** `grade-boundaries.js`, `grading-components.js`, `result-settings.js`

### 10.1 Grade Boundaries

Defines score ranges and their corresponding letter grades and remarks.

```json
{
  "boundaries": [
    { "grade": "A1", "minScore": 75, "maxScore": 100, "remark": "Excellent" },
    { "grade": "B2", "minScore": 70, "maxScore": 74, "remark": "Very Good" },
    { "grade": "B3", "minScore": 65, "maxScore": 69, "remark": "Good" },
    { "grade": "C4", "minScore": 60, "maxScore": 64, "remark": "Credit" },
    { "grade": "C5", "minScore": 55, "maxScore": 59, "remark": "Credit" },
    { "grade": "C6", "minScore": 50, "maxScore": 54, "remark": "Credit" },
    { "grade": "D7", "minScore": 45, "maxScore": 49, "remark": "Pass" },
    { "grade": "E8", "minScore": 40, "maxScore": 44, "remark": "Pass" },
    { "grade": "F9", "minScore": 0,  "maxScore": 39, "remark": "Fail" }
  ]
}
```

### 10.2 Grading Components

Defines how total scores are computed per subject.

```json
{
  "components": [
    { "id": "GC001", "name": "1st CA", "maxScore": 10, "weight": 10 },
    { "id": "GC002", "name": "2nd CA", "maxScore": 10, "weight": 10 },
    { "id": "GC003", "name": "Assignment", "maxScore": 10, "weight": 10 },
    { "id": "GC004", "name": "Examination", "maxScore": 70, "weight": 70 }
  ],
  "totalWeight": 100
}
```

### 10.3 Result Sheet Settings

Configures the result card appearance — school header, principal signature, comment templates, and display fields.

### Laravel Tables

#### `grade_boundaries` table
| Column | Type |
|--------|------|
| `id` | PK |
| `grade` | string |
| `min_score` | integer |
| `max_score` | integer |
| `remark` | string |
| `branch_id` | FK |

#### `grading_components` table
| Column | Type |
|--------|------|
| `id` | PK |
| `name` | string |
| `max_score` | integer |
| `weight` | integer |
| `order` | integer |
| `branch_id` | FK |

---

## 11. Examination System

**Path:** `admin/academics/examinations/` · **JS:** `examinations.js`, `cbt-exams.js`, `exam-questions.js`

### Pages
| Page | Function |
|------|----------|
| `examinations.html` | Exam schedule list |
| `cbt-exams.html` | Computer-based test setup |
| `exam-questions.html` | Question bank management |
| `admit-cards.html` | Generate student admit cards |

### Exam Data Model
```json
{
  "id": "EX001",
  "title": "2nd Term Mid-Term Examination",
  "class": "SS3",
  "term": "2nd Term",
  "startDate": "2025-02-10",
  "endDate": "2025-02-15",
  "subjects": ["Mathematics", "English Language", "Physics"]
}
```

### CBT Exam
- Time-limited online examinations
- Multiple choice question bank
- Auto-grading on submission
- Results stored per student per subject

---

## 12. Score Sheets & Results

**Path:** `admin/academics/grading/`

### Pages & Functions

| Page | JS | Purpose |
|------|-----|---------|
| `score-sheets.html` | `score-sheets.js` | Enter scores for one subject/class/term |
| `multi-score-sheet.html` | `multi-score-sheet.js` | Bulk score entry across multiple subjects |
| `result-sheets.html` | `result-sheets.js` | Generate printable student result cards |
| `results.html` | `results.js` | Master results matrix broadsheet |
| `session-results.html` | `session-results.js` | Annual cumulative broadsheet (all 3 terms) |

### Score Data Model
```json
{
  "studentId": "STU001",
  "subjectId": "SUB001",
  "classId": "C004",
  "termId": "TM002",
  "academicYearId": "AY002",
  "components": {
    "1st_ca": 8,
    "2nd_ca": 7,
    "assignment": 9,
    "exam": 58
  },
  "total": 82,
  "grade": "A1",
  "remark": "Excellent"
}
```

### Result Card Generation
`result-sheets.js` builds printable A4 HTML report cards containing:
- Student bio, class, section, term
- Subject-by-subject scores with component breakdown
- Grade and remark per subject
- Total score, average, position in class
- Teacher and principal comments
- School stamp and signature block
- Attendance summary

### Laravel Tables

#### `scores` table
| Column | Type |
|--------|------|
| `id` | PK |
| `student_id` | FK |
| `subject_id` | FK |
| `class_id` | FK |
| `section_id` | FK |
| `term_id` | FK |
| `academic_year_id` | FK |
| `component_id` | FK → grading_components |
| `score` | decimal(5,2) |

---

## 13. Timetable

**Files:** `admin/academics/timetable/` · **JS:** `timetable.js` · **Data:** `timetable-data.json`

### Timetable Data Model
```json
{
  "classId": "C001",
  "section": "A",
  "academicYear": "2024/2025",
  "term": "2nd Term",
  "schedule": {
    "Monday": [
      { "period": 1, "subjectId": "SUB001", "teacherId": "T001", "time": "08:00–09:00", "room": "Block A-101" }
    ]
  }
}
```

### Laravel Tables

#### `timetable_slots` table
| Column | Type |
|--------|------|
| `id` | PK |
| `section_id` | FK |
| `subject_id` | FK |
| `teacher_id` | FK |
| `day_of_week` | enum(Monday..Friday) |
| `period_number` | integer |
| `start_time` | time |
| `end_time` | time |
| `room` | string |
| `term_id` | FK |

---

## 14. Attendance

**Files:** `admin/attendance/` · **JS:** `attendance.js`, `staff-attendance.js`

### Student Attendance
- Daily attendance per class/section
- Status: Present, Absent, Late, Excused
- Monthly summary charts

### Staff Attendance
- Daily staff check-in/out
- Leave deduction integration with HR

### Laravel Tables

#### `student_attendances` table
| Column | Type |
|--------|------|
| `id` | PK |
| `student_id` | FK |
| `section_id` | FK |
| `date` | date |
| `status` | enum(Present, Absent, Late, Excused) |
| `marked_by` | FK → users |

---

## 15. Finance

**Files:** `admin/finance/` · **JS:** `income.js`, `expenses.js`, `fee-collection.js`

### 15.1 Fee Collection

Each student has a fee structure with multiple fee types. Payments are tracked as transactions.

```json
{
  "studentId": "STU001",
  "feeStructure": [
    { "type": "Tuition Fee", "amount": 120000 },
    { "type": "Development Levy", "amount": 25000 },
    { "type": "Exam Fee", "amount": 15000 }
  ],
  "totalFee": 160000,
  "paidAmount": 160000,
  "transactions": [
    { "id": "TXN001", "date": "2024-09-15", "amount": 100000, "method": "Bank Transfer", "remarks": "First installment" }
  ]
}
```

### Payment Methods
`Cash`, `Bank Transfer`, `Card`, `Cheque`, `Online`

### Laravel Tables

#### `fee_structures` table
| Column | Type |
|--------|------|
| `id` | PK |
| `name` | string (Tuition Fee, etc.) |
| `amount` | decimal(10,2) |
| `class_id` | FK (null = all classes) |
| `academic_year_id` | FK |
| `branch_id` | FK |

#### `fee_payments` table
| Column | Type |
|--------|------|
| `id` | PK |
| `student_id` | FK |
| `fee_structure_id` | FK |
| `amount_paid` | decimal(10,2) |
| `payment_date` | date |
| `method` | string |
| `reference` | string |
| `remarks` | text |
| `received_by` | FK → users |

### 15.2 Income & Expenses

General school income and expense tracking (separate from student fees).

```json
{
  "income": [
    { "id": "INC001", "source": "School Uniform Sales", "amount": 250000, "date": "2024-10-05", "category": "Sales" }
  ],
  "expenses": [
    { "id": "EXP001", "description": "Classroom Renovation", "amount": 500000, "date": "2024-10-10", "category": "Maintenance" }
  ]
}
```

---

## 16. Human Resources

**Files:** `admin/hr/` · **JS:** `hr.js` · **Data:** `hr-data.json`

### Pages
| Page | Function |
|------|----------|
| `staff-directory.html` | All staff list |
| `departments.html` | Department management |
| `designations.html` | Job title/role management |
| `leave.html` | Leave request management |
| `payroll.html` | Monthly payroll computation |

### HR Staff Data Model
Extends the `staff` model with full employment details:
- `department_id`, `designation_id`
- `basic_salary`, `allowances`, `deductions`
- `leave_balance` (annual, sick, casual)

### Laravel Tables
- `departments` — Admin, Science, Arts, etc.
- `designations` — Principal, Vice Principal, HOD, Teacher, etc.
- `hr_leave_requests` — Staff leave applications with approval workflow
- `payroll_records` — Monthly generated payslips

---

## 17. Library

**Files:** `admin/library/` · **JS:** `library.js`

### Data Models

#### Book
```json
{ "id": "BK001", "title": "New Further Mathematics", "isbn": "978-0-000-000", "author": "Chukwuemeka", "publisher": "Tonad", "copies": 20, "available": 15, "category": "Science" }
```

#### Transaction (Issue / Return)
```json
{ "id": "LT001", "bookId": "BK001", "memberId": "STU001", "issueDate": "2025-01-10", "dueDate": "2025-01-24", "returnDate": null, "status": "Borrowed" }
```

### Laravel Tables
- `library_books` — Book inventory
- `library_members` — Students/staff registered as members
- `library_transactions` — Issue and return records

---

## 18. Transportation

**Files:** `admin/transportation/` · **JS:** `transportation.js`

### Data Models
- **Vehicles:** Bus ID, plate number, capacity, driver
- **Routes:** Route name, stops, assigned bus
- **Drivers:** Driver info, license number, assigned vehicle
- **Allocations:** Student → Route assignment

### Laravel Tables
- `transport_vehicles`
- `transport_routes`
- `transport_drivers`
- `transport_allocations` (student_id + route_id)

---

## 19. Hostel

**Path:** `admin/hostel/` · **JS:** `hostel.js`

### Data Models
- **Buildings:** Hostel building blocks
- **Rooms:** Room number, capacity, building, type (Male/Female)
- **Allocations:** Student → Room assignment
- **Attendance:** Hostel attendance (night check)

### Laravel Tables
- `hostel_buildings`
- `hostel_rooms`
- `hostel_allocations` (student_id + room_id + term_id)
- `hostel_attendances`

---

## 20. Notices & Events

### Notices
```json
{ "id": "N001", "title": "School Resumption", "content": "...", "targetRoles": ["all"], "date": "2025-01-05", "postedBy": "admin" }
```

### Events
```json
{ "id": "EV001", "title": "Inter-House Sports", "date": "2025-03-15", "venue": "School Field", "description": "..." }
```

### Laravel Tables
- `notices` with `target_roles` (JSON array of role names)
- `events`

---

## 21. Discipline

**Files:** `admin/discipline/` · **JS:** `discipline.js`

### Incident Data Model
```json
{ "id": "DIS001", "studentId": "STU003", "type": "Fighting", "description": "...", "date": "2025-01-20", "actionTaken": "Suspension - 3 days", "reportedBy": "T002" }
```

### Laravel Table: `discipline_incidents`
| Column | Type |
|--------|------|
| `student_id` | FK |
| `incident_type` | string |
| `description` | text |
| `incident_date` | date |
| `action_taken` | text |
| `reported_by` | FK → users |

---

## 22. Reports & Analytics

**File:** `admin/reports.html` · **JS:** `reports.js`

Analytics across:
- Academic performance trends
- Fee collection rates
- Attendance summaries
- Enrollment statistics by class/gender

All powered by `Chart.js` visualizations.

### Laravel API
```
GET /api/v1/reports/academic?term=TM002&class=all
GET /api/v1/reports/finance?year=2024/2025
GET /api/v1/reports/attendance?month=2025-02
```

---

## 23. Settings & User Management

**Files:** `admin/settings/` · **JS:** `settings.js`, `users.js`, `templates.js`, `theme-settings.js`

### Pages
| Page | Function |
|------|----------|
| `profile.html` | School profile (name, logo, address) |
| `users.html` | Manage user accounts, roles, passwords |
| `templates.html` | Result card and document templates |
| `theme.html` | Color theme and dark mode config |

### User Account Model
```json
{
  "id": "U001",
  "name": "Admin User",
  "email": "admin@school.com",
  "role": "admin",
  "linkedId": "T001",
  "status": "Active"
}
```

### Laravel: `users` table
| Column | Type |
|--------|------|
| `id` | PK |
| `name` | string |
| `email` | string, unique |
| `password` | hashed |
| `role` | enum(admin,teacher,student,parent,owner,staff) |
| `linked_id` | integer (nullable, FK to role-specific table) |
| `branch_id` | FK |
| `status` | enum(Active, Inactive) |

---

*See [README.md](./README.md) for the full project overview and [TEACHERS.md](./TEACHERS.md) for the teacher portal.*
