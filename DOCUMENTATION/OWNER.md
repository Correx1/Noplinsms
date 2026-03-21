# Owner Portal — Detailed Documentation

> **Role:** `owner` · **Entry:** `pages/owner/` · **Sidebar:** `components/owner-sidebar.html`

---

## Table of Contents

1. [Portal Overview](#1-portal-overview)
2. [Owner Dashboard](#2-owner-dashboard)
3. [Branch Management](#3-branch-management)
4. [Cross-Branch Analytics](#4-cross-branch-analytics)
5. [Owner Profile & Settings](#5-owner-profile--settings)
6. [Access to Admin Modules](#6-access-to-admin-modules)
7. [Multi-Tenancy Architecture](#7-multi-tenancy-architecture)
8. [Owner Data Model](#8-owner-data-model)
9. [Laravel API Endpoints](#9-laravel-api-endpoints)
10. [Parent Portal Reference](#10-parent-portal-reference)

---

## 1. Portal Overview

The **Owner portal** is designed for the school proprietor, director, or management board. It provides a **bird's-eye view** across one or multiple school branches. The owner has full read access to all modules and limited administrative control, primarily:

- Managing **school branches**
- Viewing **consolidated reports** across branches
- Accessing any branch's **admin panel** in proxy/read mode
- Managing **owner-level settings** (school profile, subscription, etc.)

### Key Differences From Admin
| Feature | Admin | Owner |
|---------|-------|-------|
| Data Scope | Single branch | All branches |
| User Management | Within branch | Cross-branch |
| Financial View | Branch-level | Consolidated |
| Branch Control | No | Yes (create/disable branches) |
| Direct Data Entry | Yes | Mostly read-only |

### Authentication
- Login at `index.html` with role = `owner`
- `role = "Owner"` → `owner-sidebar.html` loaded
- Branch context switcher available to pivot between branches
- `sms_currentBranchId` in `localStorage` tracks active branch context

---

## 2. Owner Dashboard

**File:** `pages/owner/owner-dashboard.html` · **JS:** `owner-dashboard.js`

### Dashboard Widgets

| Widget | Data |
|--------|------|
| Total Branches | Count of active school branches |
| Total Students (All Branches) | Aggregated |
| Total Teachers (All Branches) | Aggregated |
| Total Revenue (Current Year) | Across all branches |
| Branch Performance Cards | Per-branch: Students, Fees collected, Attendance % |
| Recent Activity Feed | Cross-branch recent actions |
| Financial Overview Chart | Monthly revenue comparison |

### Laravel API
```
GET /api/v1/owner/dashboard
Authorization: Bearer {owner_token}
```

### Response Schema
```json
{
  "owner": { "id": "OWN001", "name": "Chief Emmanuel Adeola" },
  "totalBranches": 3,
  "totalStudents": 720,
  "totalTeachers": 54,
  "totalRevenue": { "2024/2025": 52500000 },
  "branches": [
    {
      "id": "BR001",
      "name": "Noplin School — Victoria Island",
      "students": 240,
      "teachers": 18,
      "feesCollected": 17500000,
      "feesOutstanding": 2100000,
      "attendanceRate": 94.5
    },
    {
      "id": "BR002",
      "name": "Noplin School — Lekki",
      "students": 280,
      "teachers": 21,
      "feesCollected": 20300000,
      "feesOutstanding": 3500000,
      "attendanceRate": 92.0
    }
  ]
}
```

---

## 3. Branch Management

**File:** `pages/owner/branches.html` (or admin area) · **JS:** `branches.js`

### Purpose
Allows the owner to create, edit, view, and deactivate school branches.

### Branch Data Model
```json
{
  "id": "BR001",
  "name": "Noplin School — Victoria Island",
  "address": "12 Akin Adesola, VI, Lagos",
  "phone": "0801234567",
  "email": "vi@noplin.school",
  "principalId": "T001",
  "logo": "url",
  "founded": "2010-09-01",
  "status": "Active",
  "subscription": {
    "plan": "Premium",
    "expiresAt": "2025-12-31",
    "maxStudents": 500
  }
}
```

### Branch-Level Admin Access
The owner can **switch branch context** using the branch selector in the header. Once switched, the owner can navigate all admin modules scoped to that branch — viewing its students, teachers, finances, etc.

**Frontend implementation:** `localStorage.sms_currentBranchId` and `localStorage.sms_currentBranchName` are set on branch switch. All subsequent API calls from `sidebar.js` loaders pass this branch context.

### Laravel Implementation
```php
// All queries in admin controllers should be scoped:
$branchId = request()->header('X-Branch-Id') 
          ?? auth()->user()->branch_id;

$students = Student::whereBranchId($branchId)->get();
```

### Laravel API
```
GET    /api/v1/owner/branches
POST   /api/v1/owner/branches
GET    /api/v1/owner/branches/{id}
PUT    /api/v1/owner/branches/{id}
PATCH  /api/v1/owner/branches/{id}/status    { status: "Inactive" }
POST   /api/v1/owner/branches/{id}/switch    → sets X-Branch-Id session context
```

### Laravel Table: `branches`

| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `owner_id` | FK → users | |
| `name` | string | Branch full name |
| `address` | text | |
| `phone` | string | |
| `email` | string | |
| `principal_id` | FK → teachers | Branch head |
| `logo` | string | URL |
| `founded_date` | date | |
| `status` | enum(Active, Inactive) | |
| `subscription_plan` | string | Basic, Premium |
| `subscription_expires_at` | date | |
| `max_students` | integer | |

---

## 4. Cross-Branch Analytics

**File:** `pages/owner/` (integrated in dashboard) · **JS:** `owner-dashboard.js`

### Reports Available at Owner Level

#### 4.1 Consolidated Financial Report
```
GET /api/v1/owner/reports/finance?year=2024/2025
```
- Total fees billed across all branches
- Total fees collected
- Outstanding per branch
- Monthly revenue trend

#### 4.2 Enrollment Report
```
GET /api/v1/owner/reports/enrollment?year=2024/2025
```
- Total students per branch
- New admissions per term
- Gender distribution
- Class-level enrollment count

#### 4.3 Academic Performance Report
```
GET /api/v1/owner/reports/academic?term_id=TM002
```
- Average score per branch
- Pass rate per branch
- Top performing classes

#### 4.4 Attendance Report
```
GET /api/v1/owner/reports/attendance?month=2025-02
```
- Overall attendance rate per branch
- Absence trends

---

## 5. Owner Profile & Settings

**Files:** `pages/owner/settings/` and accessible from `admin/settings/`

### Profile Fields
```json
{
  "id": "OWN001",
  "name": "Chief Emmanuel Adeola",
  "phone": "08012345678",
  "email": "owner@noplin.school",
  "address": "5 Palm Drive, Ikoyi, Lagos",
  "photo": "url",
  "role": "owner"
}
```

### Settings Access
The owner also accesses the system-level settings panel (`admin/settings/`), scoped to whichever branch is currently active in their context.

### Laravel API
```
GET /api/v1/owner/profile
PUT /api/v1/owner/profile
GET /api/v1/owner/settings
PUT /api/v1/owner/settings
```

---

## 6. Access to Admin Modules

When an Owner switches into a branch context, they can access **all Admin module pages** exactly as the branch admin would. This is implemented via:

1. Branch selector sets `sms_currentBranchId` in `localStorage`
2. All `loadPage()` calls in `sidebar.js` load the same admin HTML
3. **Laravel must enforce**: all API calls from an `owner` role include `branch_id` from the request header `X-Branch-Id`

### Routing Note (sidebar.js)
```javascript
// From sidebar.js: cross-directory proxy for owner
else if (path.includes('/owner/')) {
    if (!url.startsWith('owner-dashboard.html') && !url.startsWith('branches.html')) {
        url = '../admin/' + url; // Proxy into admin module
    }
}
```

This means the Owner views the same HTML pages as Admin — the differentiation is purely API-side.

---

## 7. Multi-Tenancy Architecture

### Design Overview

```
Owner (1) ──< Branch (n)
Branch (1) ──< AcademicYear, Class, Student, Teacher, ...
```

Every primary data table includes `branch_id`. The backend enforces branch scoping via middleware:

```php
// app/Http/Middleware/BranchScope.php
class BranchScope {
    public function handle($request, Closure $next) {
        $branchId = $request->header('X-Branch-Id')
                 ?? auth()->user()->branch_id;

        // Inject into all model queries via global scope
        SchoolClass::addGlobalScope('branch', fn($q) => $q->where('branch_id', $branchId));
        Student::addGlobalScope('branch', fn($q) => $q->where('branch_id', $branchId));
        // ... etc for all models

        return $next($request);
    }
}
```

### Frontend Branch Context Headers
```javascript
// Every API call should include:
fetch('/api/v1/students', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('sms_token')}`,
    'X-Branch-Id': localStorage.getItem('sms_currentBranchId')
  }
});
```

### Branch Isolation Rules
- Students of Branch A **cannot** appear in Branch B
- A teacher can be assigned to only one branch (unless cross-branch teaching is explicitly configured — out of current scope)
- Fee structures are per-branch
- Grade boundaries and grading components are per-branch
- Academic years are per-branch (different branches may start on different dates)

---

## 8. Owner Data Model

### Laravel Table: `users` (Owner Entry)

```php
// Owner record in users table
[
    'name' => 'Chief Emmanuel Adeola',
    'email' => 'owner@noplin.school',
    'role' => 'owner',
    'branch_id' => null,  // Owner is not scoped to a single branch
]
```

### Query Pattern for Owner vs Admin

```php
// In UsersController or BaseController
if (auth()->user()->role === 'owner') {
    // Fetch from all branches
    $branchIds = Branch::where('owner_id', auth()->id())->pluck('id');
    $query->whereIn('branch_id', $branchIds);
} else {
    // Admin/Teacher/Student — scope to their branch
    $query->where('branch_id', auth()->user()->branch_id);
}
```

---

## 9. Laravel API Endpoints

### Owner-Scoped Routes (require `auth:sanctum` + `role:owner`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/owner/dashboard` | Consolidated stats |
| GET | `/api/v1/owner/branches` | All branches |
| POST | `/api/v1/owner/branches` | Create branch |
| GET | `/api/v1/owner/branches/{id}` | Branch details |
| PUT | `/api/v1/owner/branches/{id}` | Update branch |
| PATCH | `/api/v1/owner/branches/{id}/status` | Activate/deactivate |
| GET | `/api/v1/owner/reports/finance` | Financial summary |
| GET | `/api/v1/owner/reports/enrollment` | Enrollment summary |
| GET | `/api/v1/owner/reports/academic` | Academic performance |
| GET | `/api/v1/owner/reports/attendance` | Attendance overview |
| GET | `/api/v1/owner/profile` | Owner profile |
| PUT | `/api/v1/owner/profile` | Update profile |

> Owner also uses all `/api/v1/admin/*` routes with `X-Branch-Id` header.

---

## 10. Parent Portal Reference

> The Parent Portal is a **separate role** but documented here for completeness given its relationship to students.

**Entry:** `login-student-parent.html` · **JS:** `parent-pages.js`, `parent-dashboard.js` · **Sidebar:** `components/parent-sidebar.html`

### Parent Portal Pages
| File | Module |
|------|--------|
| `pages/parent/dashboard.html` | Overview of all linked children |
| `pages/parent/my-children.html` | Linked children list and profiles |
| `pages/parent/marks.html` | Academic results per child |
| `pages/parent/attendance.html` | Attendance per child |
| `pages/parent/fees.html` | Fee status and transactions per child |
| `pages/parent/messages.html` | Messaging with teachers/admin |

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

### Parent-Child Link
A parent can be linked to **multiple children** (students), modeled as a many-to-many relationship via the `student_parent` pivot table.

```sql
-- student_parent pivot table
CREATE TABLE student_parent (
    student_id INT REFERENCES students(id),
    parent_id INT REFERENCES parents(id),
    relation ENUM('Father', 'Mother', 'Guardian'),
    is_primary_contact BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (student_id, parent_id)
);
```

### Parent Portal Features

#### Dashboard
- Cards for each linked child
- Quick summary: attendance rate, latest marks, fee status

#### My Children
- Detailed profile per child
- Class, section, roll, photo, admission number

#### Marks
- Same data as Student → Marks page, but viewed per-child
- Parent can select which child to view

#### Attendance
- Monthly attendance per child
- Notification hooks (future: notify parent when child is absent)

#### Fees
- See full fee breakdown and outstanding balance per child
- View payment receipts

#### Messages
- Can send messages to class teacher or admin
- Receive school broadcasts

### Parent - Laravel API
```
GET /api/v1/parent/dashboard          → Overview of all children
GET /api/v1/parent/children           → List of linked children
GET /api/v1/parent/children/{id}/marks
GET /api/v1/parent/children/{id}/attendance
GET /api/v1/parent/children/{id}/fees
GET /api/v1/messages?user_id={me}
POST /api/v1/messages                 → Send message to teacher/admin
```

### Parent Data Model: `parents` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `user_id` | FK → users | Login account |
| `name` | string | Full name |
| `relation` | string | Father, Mother, Guardian |
| `phone` | string | |
| `email` | string | |
| `occupation` | string | |
| `address` | text | |
| `photo` | string | URL |
| `emergency_contact` | boolean | |
| `status` | enum(Active, Inactive) | |
| `branch_id` | FK → branches | |

---

*See [README.md](./README.md) for the master overview, [ADMIN.md](./ADMIN.md) for admin operations, [STUDENTS.md](./STUDENTS.md) for the student portal.*
