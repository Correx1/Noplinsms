# People Management Module — Complete Documentation

> **Path:** `pages/admin/manage/` · **Sidebar section:** Management
> **Covers:** Students, Teachers, Parents, Staff, Alumni

---

## 1. Module Overview

The Management module handles all **people records** in the system. These records are **the foundation** of every other module — you cannot log attendance, enter scores, or collect fees without first having people registered here.

### People Types

| Type | Table | Login Access | Portal |
|------|-------|-------------|--------|
| Student | `students` | ✅ via `users` | Student Portal |
| Teacher | `teachers` | ✅ via `users` | Teacher Portal |
| Parent/Guardian | `parents` | ✅ via `users` | Parent Portal |
| Staff (Non-Teaching) | `staff` | ❌ (no portal) | — |
| Alumni | `alumni` | ❌ | — |

---

## 2. Students

**Pages:** `manage/students/` · **JS:** `students-list.js`, `add-student.js`

### Full Student Data Model
```json
{
  "id": "STU001",
  "userId": "U010",
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
  "classId": "C004",
  "sectionId": "S006",
  "roll": "001",
  "admissionDate": "2022-09-01",
  "status": "Active",
  "department": "Science",
  "branchId": "BR001"
}
```

### Status Lifecycle
```
Admission → status: "Active"    → appears in main students table
Graduated/Left → status: "Inactive"  → moved to "Past Students" view
Never hard-deleted — use soft deletes (deleted_at timestamp)
```

### Filtering & Table Features
- Filter by: Class, Section, Gender, Status, Department
- Search by: Name, Admission Number
- Export filtered list to CSV/Excel
- Quick action: Change status (Active ↔ Inactive)

### Laravel Table: `students`
```sql
CREATE TABLE students (
    id BIGINT PK,
    user_id BIGINT FK NULLABLE,      -- NULL until login account created
    branch_id BIGINT FK,
    admission_number VARCHAR(30) UNIQUE,
    name VARCHAR(150),
    date_of_birth DATE,
    gender ENUM('Male','Female'),
    nationality VARCHAR(100),
    state_of_origin VARCHAR(100),
    religion VARCHAR(50),
    blood_group VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    photo VARCHAR(255),
    class_id BIGINT FK,
    section_id BIGINT FK,
    roll_number VARCHAR(20),
    admission_date DATE,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    department VARCHAR(50),
    deleted_at TIMESTAMP NULLABLE    -- SoftDeletes
);
```

### API Endpoints
```
GET    /api/v1/students?status=Active&class_id=&gender=&page=1
POST   /api/v1/students
GET    /api/v1/students/{id}
PUT    /api/v1/students/{id}
PATCH  /api/v1/students/{id}/status    { status: "Inactive" }
GET    /api/v1/students/export         → CSV download (with same filters)
POST   /api/v1/students/{id}/create-login  → creates User account for student
```

---

## 3. Teachers

**Pages:** `manage/teachers/` · **JS:** `teachers.js`

### Full Teacher Data Model
```json
{
  "id": "T001",
  "userId": "U005",
  "name": "Sarah Wilson",
  "photo": "url",
  "dateOfBirth": "1985-04-12",
  "gender": "Female",
  "phone": "08012345678",
  "email": "sarah.wilson@school.com",
  "address": "123, Maple Street, Lagos",
  "status": "Active",
  "joiningDate": "2018-09-01",
  "qualification": "M.Sc. Mathematics",
  "employmentType": "Full-time",
  "salary": 150000,
  "branchId": "BR001"
}
```

### Status Values
| Status | Meaning |
|--------|---------|
| `Active` | Currently teaching |
| `On Leave` | Temporarily absent |
| `Inactive` | No longer employed |

### Laravel Table: `teachers`
```sql
CREATE TABLE teachers (
    id BIGINT PK,
    user_id BIGINT FK NULLABLE,
    branch_id BIGINT FK,
    name VARCHAR(150),
    photo VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('Male','Female'),
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    status ENUM('Active','On Leave','Inactive') DEFAULT 'Active',
    joining_date DATE,
    qualification VARCHAR(200),
    employment_type ENUM('Full-time','Part-time','Contract'),
    salary DECIMAL(12,2),
    deleted_at TIMESTAMP NULLABLE
);
```

### API Endpoints
```
GET    /api/v1/teachers?status=Active&subject_id=
POST   /api/v1/teachers
GET    /api/v1/teachers/{id}
PUT    /api/v1/teachers/{id}
PATCH  /api/v1/teachers/{id}/status
GET    /api/v1/teachers/export               → CSV
GET    /api/v1/teachers/{id}/classes         → assigned classes & sections
POST   /api/v1/teachers/{id}/create-login    → creates User account
```

---

## 4. Parents / Guardians

**Pages:** `manage/parents/` · **JS:** `parents.js`

### Data Model
```json
{
  "id": "P001",
  "userId": "U020",
  "name": "Mr. Adebayo Johnson",
  "relation": "Father",
  "phone": "08012345678",
  "email": "adebayo.johnson@email.com",
  "occupation": "Engineer",
  "address": "12 Victoria Island, Lagos",
  "photo": null,
  "emergencyContact": true,
  "status": "Active",
  "linkedStudents": ["STU001", "STU015"]
}
```

### Parent–Student Link (`student_parent` pivot)
A parent can be linked to **multiple students** (children). One student can also have multiple parents/guardians.

```sql
CREATE TABLE student_parent (
    student_id BIGINT FK,
    parent_id BIGINT FK,
    relation VARCHAR(50),               -- "Father", "Mother", "Guardian"
    is_primary_contact BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (student_id, parent_id)
);
```

### Laravel Table: `parents`
```sql
CREATE TABLE parents (
    id BIGINT PK,
    user_id BIGINT FK NULLABLE,
    branch_id BIGINT FK,
    name VARCHAR(150),
    relation VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(150),
    occupation VARCHAR(100),
    address TEXT,
    photo VARCHAR(255),
    emergency_contact BOOLEAN DEFAULT FALSE,
    status ENUM('Active','Inactive') DEFAULT 'Active'
);
```

### API Endpoints
```
GET    /api/v1/parents?status=Active
POST   /api/v1/parents
GET    /api/v1/parents/{id}
PUT    /api/v1/parents/{id}
POST   /api/v1/parents/{id}/link-student     { student_id, relation }
DELETE /api/v1/parents/{id}/unlink-student/{student_id}
POST   /api/v1/parents/{id}/create-login
```

---

## 5. Staff (Non-Teaching)

**Pages:** `manage/staff/` · **JS:** `staff.js`

### Purpose
Non-teaching staff: clerks, security, cleaners, lab assistants, kitchen staff, bursars.

### Data Model
```json
{
  "id": "SF001",
  "name": "Amaka Obi",
  "role": "Clerk",
  "department": "Administration",
  "phone": "08011223344",
  "email": "amaka.obi@school.com",
  "status": "Active",
  "joiningDate": "2021-01-01",
  "salary": 60000
}
```

### Laravel Table: `staff`
```sql
CREATE TABLE staff (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(150),
    role VARCHAR(100),           -- Clerk, Security, Cleaner
    department_id BIGINT FK,
    designation_id BIGINT FK,
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    photo VARCHAR(255),
    joining_date DATE,
    salary DECIMAL(12,2),
    status ENUM('Active','Inactive') DEFAULT 'Active'
);
```

---

## 6. Alumni

**Pages:** `manage/alumni/` · **JS:** `alumni.js`

### Purpose
Tracks past students who have graduated. Alumni records are auto-created when a student graduates (status changed to Inactive + graduation flag set).

### Data Model (extends students)
```json
{
  "id": "ALU001",
  "studentId": "STU099",
  "name": "Bola James",
  "graduationYear": "2023",
  "classGraduated": "SS3",
  "currentInstitution": "University of Lagos",
  "programme": "Engineering",
  "phone": "08099887766",
  "email": "bola.james@gmail.com"
}
```

### Laravel Table: `alumni`
```sql
CREATE TABLE alumni (
    id BIGINT PK,
    student_id BIGINT FK,
    branch_id BIGINT FK,
    graduation_year INT,
    class_graduated VARCHAR(20),
    current_institution VARCHAR(200),
    programme VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(150)
);
```

---

## 7. Cross-Module Relationships

```
Student ──── User (login)
Student ──< student_parent >──< Parent
Student ──── Section (current class)
Student ──< Enrollments (term-by-term)
Student ──< Scores
Student ──< Attendances
Student ──< FeePayments
Student ──── Alumni (on graduation)

Teacher ──── User (login)
Teacher ──< section_teachers >──< Section
Teacher ──< subject_teachers >──< Subject
Teacher ──< Scores (entered_by)
Teacher ──< Attendances (marked_by)
Teacher ──< PayrollRecords

Parent ──── User (login)
Parent ──< student_parent >──< Student
```

*See [ACADEMIC.md](./ACADEMIC.md) for how students are assigned to classes and [GRADING.md](./GRADING.md) for how scores are entered.*
