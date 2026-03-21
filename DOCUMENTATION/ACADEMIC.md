# Academics Module — Complete Documentation

> **Path:** `pages/admin/academics/` · **Sidebar section:** Academics
> **Covers:** Academic Config, Classes, Subjects, Syllabus, Timetable, Promote Students, Assessments, ID Cards

---

## 1. Module Overview

The Academics module is the backbone of the school management system. It defines the institutional structure that **every other module depends on**: classes, sections, subjects, terms, and academic years. Getting this right in the backend ensures every other module (Grading, Attendance, Finance, etc.) functions correctly.

### Dependency Order (Build in this order)
```
1. Branches (Owner)
2. Academic Years
3. Terms (within Academic Years)
4. Classes
5. Sections (within Classes)
6. Subjects
7. Subject-Class assignments
8. Teacher-Section assignments
9. Student Enrollments
10. Timetable
```

---

## 2. Academic Configuration

**Page:** `academics/config/academic-config.html` · **JS:** `academic-config.js`

### 2.1 Academic Years

```json
{
  "id": "AY002",
  "name": "2024/2025",
  "startDate": "2024-09-05",
  "endDate": "2025-07-15",
  "status": "Active"
}
```

**Rules:**
- Only **one academic year** can be `Active` at a time
- Changing the active year updates the context for all modules (attendance, fee collection, scores, timetables)
- Past years remain `Past` — their data is read-only but still viewable

### 2.2 Terms

Each academic year has exactly **3 terms**:

```json
[
  { "id": "TM001", "name": "First Term",  "academicYearId": "AY002", "startDate": "2024-09-05", "endDate": "2024-12-13" },
  { "id": "TM002", "name": "Second Term", "academicYearId": "AY002", "startDate": "2025-01-10", "endDate": "2025-04-05" },
  { "id": "TM003", "name": "Third Term",  "academicYearId": "AY002", "startDate": "2025-04-23", "endDate": "2025-07-15" }
]
```

**Backend Note:** The `term_id` is used as a foreign key in nearly every transactional table: `scores`, `attendances`, `fee_payments`, `student_result_evaluations`, `timetable_slots`. Always store `term_id` — not just `academic_year_id` — on time-sensitive records.

### 2.3 Class Groups
E.g., Junior Secondary (JSS1–JSS3), Senior Secondary (SS1–SS3). Used for grouping in reports and subject assignments.

### Laravel Tables
```sql
CREATE TABLE academic_years (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(20),        -- "2024/2025"
    start_date DATE,
    end_date DATE,
    status ENUM('Active','Past','Upcoming'),
    UNIQUE (branch_id, name)
);

CREATE TABLE terms (
    id BIGINT PK,
    academic_year_id BIGINT FK,
    name ENUM('First Term','Second Term','Third Term'),
    start_date DATE,
    end_date DATE,
    status ENUM('Active','Past','Upcoming'),
    UNIQUE (academic_year_id, name)
);
```

### API Endpoints
```
GET    /api/v1/academic-years
POST   /api/v1/academic-years
PATCH  /api/v1/academic-years/{id}/activate
GET    /api/v1/terms?academic_year_id=AY002
POST   /api/v1/terms
```

---

## 3. Class & Section Management

**Page:** `academics/classes/` · **JS:** `classes.js`

### Classes

```json
{
  "id": "C001",
  "name": "JSS1",
  "level": 7,
  "formTeacherId": "T002",
  "academicYearId": "AY002",
  "branchId": "BR001"
}
```

**Form Teacher** — One primary teacher responsible for a whole class. Stored as `form_teacher_id` on the class record.

### Sections

Each class is divided into sections (A, B, C, etc. or named like "Gold", "Diamond"):

```json
{
  "id": "S001",
  "classId": "C001",
  "name": "A",
  "teacherIds": ["T002", "T004", "T001"],
  "capacity": 30,
  "room": "Block A - 101"
}
```

**Section Teachers** — Multiple teachers can be assigned per section. These are the subject teachers for that section. Stored as a many-to-many pivot `section_teachers`.

### Laravel Tables
```sql
CREATE TABLE classes (
    id BIGINT PK,
    branch_id BIGINT FK,
    academic_year_id BIGINT FK,
    name VARCHAR(20),           -- "JSS1", "SS3"
    level INT,                  -- Grade level (7–12)
    form_teacher_id BIGINT FK NULLABLE
);

CREATE TABLE sections (
    id BIGINT PK,
    class_id BIGINT FK,
    name VARCHAR(20),           -- "A", "B", "Gold"
    capacity INT DEFAULT 30,
    room VARCHAR(50)
);

CREATE TABLE section_teachers (
    section_id BIGINT FK,
    teacher_id BIGINT FK,
    PRIMARY KEY (section_id, teacher_id)
);
```

### API Endpoints
```
GET    /api/v1/classes
POST   /api/v1/classes
GET    /api/v1/classes/{id}          → with sections
PUT    /api/v1/classes/{id}
POST   /api/v1/sections              → { class_id, name, capacity, room, teacher_ids[] }
PUT    /api/v1/sections/{id}
POST   /api/v1/sections/{id}/teachers  → { teacher_ids[] }  (sync section teachers)
```

---

## 4. Subject Management

**Page:** `academics/subjects/` · **JS:** `subjects.js`

```json
{
  "id": "SUB001",
  "name": "Mathematics",
  "code": "MTH101",
  "type": "Core",
  "department": "General",
  "teacherIds": ["T001", "T003"]
}
```

### Subject Types
- `Core` — Compulsory for all students in the class
- `Elective` — Optional, student chooses from a pool

### Subject-Class Assignment
A subject can be assigned to multiple classes. This drives what subjects appear in score entry and result sheets.

### Laravel Tables
```sql
CREATE TABLE subjects (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(100),
    code VARCHAR(15),
    type ENUM('Core','Elective'),
    department VARCHAR(50)
);

CREATE TABLE class_subjects (       -- Subject ↔ Class mapping
    class_id BIGINT FK,
    subject_id BIGINT FK,
    PRIMARY KEY (class_id, subject_id)
);

CREATE TABLE subject_teachers (     -- Subject ↔ Teacher mapping
    subject_id BIGINT FK,
    teacher_id BIGINT FK,
    PRIMARY KEY (subject_id, teacher_id)
);
```

### API Endpoints
```
GET    /api/v1/subjects?class_id=C004       → subjects for this class
POST   /api/v1/subjects
PUT    /api/v1/subjects/{id}
POST   /api/v1/subjects/{id}/assign-classes  { class_ids[] }
POST   /api/v1/subjects/{id}/assign-teachers { teacher_ids[] }
```

---

## 5. Syllabus Management

**Page:** `academics/syllabus/` · **JS:** `syllabus.js`

### Purpose
Defines the curriculum topics per subject per class per term. Allows tracking of syllabus completion.

```json
{
  "id": "SYL001",
  "subjectId": "SUB001",
  "classId": "C004",
  "termId": "TM002",
  "topics": [
    { "id": "TOP001", "title": "Quadratic Equations", "week": 1, "completed": true },
    { "id": "TOP002", "title": "Simultaneous Equations", "week": 2, "completed": false }
  ]
}
```

### Laravel Tables
```sql
CREATE TABLE syllabus_topics (
    id BIGINT PK,
    subject_id BIGINT FK,
    class_id BIGINT FK,
    term_id BIGINT FK,
    title VARCHAR(200),
    week_number INT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by BIGINT FK NULLABLE   -- teacher user_id
);
```

---

## 6. Timetable

**Page:** `academics/timetable/` · **JS:** `timetable.js`

### Timetable Slot Object
```json
{
  "sectionId": "S001",
  "subjectId": "SUB001",
  "teacherId": "T001",
  "dayOfWeek": "Monday",
  "periodNumber": 1,
  "startTime": "08:00",
  "endTime": "09:00",
  "room": "Block A - 101",
  "termId": "TM002"
}
```

### Laravel Table: `timetable_slots`
```sql
CREATE TABLE timetable_slots (
    id BIGINT PK,
    section_id BIGINT FK,
    subject_id BIGINT FK,
    teacher_id BIGINT FK,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday'),
    period_number INT,
    start_time TIME,
    end_time TIME,
    room VARCHAR(50),
    term_id BIGINT FK,
    UNIQUE (section_id, day_of_week, period_number, term_id)
);
```

### API Endpoints
```
GET    /api/v1/timetable?section_id=S001&term_id=TM002
POST   /api/v1/timetable                     → create slot
PUT    /api/v1/timetable/{id}
DELETE /api/v1/timetable/{id}
POST   /api/v1/timetable/bulk                → replace entire timetable for a section
```

---

## 7. Promote Students

**Page:** `academics/classes/promote-students.html` · **JS:** `promote-students.js`

### Purpose
At the end of each academic year, students are moved to the next class. Repeaters are kept back and moved to a different section or remain in the same class.

### Workflow
1. Admin selects source class + section + academic year
2. System shows all students with their average score
3. Admin sets promotion rule (e.g., average ≥ 50 = promoted)
4. Admin selects target class for promoted students
5. Confirm → new enrollment records created for the new academic year

### Backend Logic
```php
// On promote:
foreach ($students as $student) {
    if ($student->average >= $promotionThreshold) {
        Enrollment::create([
            'student_id'       => $student->id,
            'class_id'         => $targetClassId,
            'section_id'       => $targetSectionId,
            'academic_year_id' => $newAcademicYearId,
            'term_id'          => $firstTermId,
            'status'           => 'Promoted'
        ]);
    } else {
        Enrollment::create([
            'student_id'       => $student->id,
            'class_id'         => $student->class_id,     // same class
            'section_id'       => $student->section_id,
            'academic_year_id' => $newAcademicYearId,
            'status'           => 'Repeated'
        ]);
    }
}
```

### Laravel Table: `enrollments`
```sql
CREATE TABLE enrollments (
    id BIGINT PK,
    student_id BIGINT FK,
    class_id BIGINT FK,
    section_id BIGINT FK,
    academic_year_id BIGINT FK,
    term_id BIGINT FK,
    status ENUM('Active','Promoted','Repeated','Transferred','Graduated'),
    enrolled_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, academic_year_id, term_id)
);
```

---

## 8. Assessments

**Page:** `academics/assessments/` · **JS:** `assessments.js`

### Purpose
Scheduled in-class assessments (quizzes, class tests, projects). Can be linked to a Grading Component so their scores auto-flow into the mark register.

```json
{
  "id": "ASM001",
  "title": "First CA Test",
  "subjectId": "SUB001",
  "classId": "C004",
  "termId": "TM002",
  "date": "2025-01-20",
  "totalMarks": 10,
  "linkedComponentId": "CMP-CA1"
}
```

### API Endpoints
```
GET    /api/v1/assessments?class_id=&subject_id=&term_id=
POST   /api/v1/assessments
GET    /api/v1/assessments/{id}
PUT    /api/v1/assessments/{id}
POST   /api/v1/assessments/{id}/scores   { scores: [{student_id, score}] }
```

---

## 9. ID Cards

**Page:** `academics/id-cards.html` · **JS:** `id-cards.js`

### Purpose
Generates printable student ID cards (credit-card sized).

### Card Contains
- Student photo, name, class, section
- Admission number
- School name, logo, address
- QR code (planned)

### Data Sources
```
students table → all fields
school_profile → name, logo, address
```

### API Endpoint
```
GET /api/v1/id-cards?class_id=C004&section_id=S006   → returns list of student data for card generation
No backend generation needed — pure frontend HTML/CSS print
```

---

## 10. Cross-Module Relationships

```
AcademicYear ──< Term ──< Scores
                      ──< Attendances
                      ──< FeePayments
                      ──< Enrollments
                      ──< TimetableSlots
                      ──< StudentResultEvaluations

Class ──< Section ──< Enrollments (students)
               ──< SectionTeachers
               ──< TimetableSlots
               ──< GradingStructureClasses

Subject ──< ClassSubjects >──< Class
        ──< SubjectTeachers >──< Teacher
        ──< Scores
        ──< SyllabusTopics
        ──< ExamQuestions
```

*See [GRADING.md](./GRADING.md) for score entry and results, [EXAMINATION.md](./EXAMINATION.md) for exam scheduling.*
