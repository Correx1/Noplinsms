# Settings & System Configuration — Complete Documentation

> **Path:** `pages/admin/settings/` · **JS:** `settings.js`, `users.js`, `templates.js`, `theme-settings.js`

---

## 1. Module Overview

The Settings module controls everything that configures how the system behaves. It covers:
- School profile (name, logo, address)
- User account management (create logins for teachers/students/parents)
- Notification/communication templates
- Theme and display settings
- System preferences

---

## 2. School Profile

**Page:** `settings/profile.html` · Stored in `localStorage('sms_school_profile')` on frontend.

### School Profile Object
```json
{
  "name": "Noplin Academy",
  "motto": "Knowledge is Light",
  "address": "12 School Road, Yaba, Lagos",
  "phone": "08012345678",
  "email": "admin@noplin.school",
  "website": "www.noplin.school",
  "logo": "base64_or_cdn_url",
  "themeColor": "#0a195c",
  "principalName": "Mr. Adewale Babatunde"
}
```

### How This Feeds Other Modules
The school profile is embedded in every **result card** header, **ID cards**, **receipts**, and **reports**. The `themeColor` controls the accent color of the Elegant and Modern result templates.

### Laravel Table: `school_profiles`
```sql
CREATE TABLE school_profiles (
    id BIGINT PK,
    branch_id BIGINT UNIQUE FK,
    name VARCHAR(200),
    motto VARCHAR(200),
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(150),
    website VARCHAR(200),
    logo LONGTEXT,                -- base64 or CDN URL
    theme_color VARCHAR(10),      -- hex color e.g., "#0a195c"
    principal_name VARCHAR(150)
);
```

### API Endpoints
```
GET    /api/v1/school-profile
PUT    /api/v1/school-profile
POST   /api/v1/school-profile/upload-logo   { file: logo_file }
```

---

## 3. User Account Management

**Page:** `settings/users.html` · **JS:** `users.js`

### Purpose
Admins create login credentials (username + password) for:
- Teaching Staff / Teachers
- Students
- Parents

### User Account Model
```json
{
  "id": "U001",
  "name": "Sarah Wilson",
  "email": "sarah.wilson@school.com",
  "username": "sarah.wilson",
  "role": "teacher",
  "linkedId": "T001",
  "linkedType": "teacher",
  "status": "Active",
  "lastLogin": "2025-02-10T09:15:00Z"
}
```

### Roles
| Role | Portal Access | Notes |
|------|--------------|-------|
| `admin` | Full admin panel | Full access to all modules |
| `teacher` | Teacher portal | Scoped to assigned classes |
| `student` | Student portal | Scoped to own records |
| `parent` | Parent portal | Scoped to linked children |
| `owner` | Owner portal | Cross-branch access |
| `staff` | No portal | HR records only |

### Password Policy
- Minimum 8 characters
- Students: default password = admission number
- Teachers: default password = phone number (last 4 digits + "noplin")
- All must change on first login (planned)

### Laravel Table: `users`
```sql
CREATE TABLE users (
    id BIGINT PK,
    branch_id BIGINT FK NULLABLE,   -- NULL for owner role
    name VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255),          -- bcrypt hashed
    role ENUM('admin','teacher','student','parent','owner','staff'),
    linked_id BIGINT NULLABLE,      -- FK to role-specific table
    linked_type VARCHAR(30) NULLABLE,  -- 'teacher', 'student', 'parent'
    status ENUM('Active','Inactive') DEFAULT 'Active',
    last_login TIMESTAMP NULLABLE,
    deleted_at TIMESTAMP NULLABLE
);
```

### API Endpoints
```
GET    /api/v1/users?role=teacher&status=Active
POST   /api/v1/users                         → create account
PUT    /api/v1/users/{id}
PATCH  /api/v1/users/{id}/reset-password     { new_password }
PATCH  /api/v1/users/{id}/status             { status: "Inactive" }
POST   /api/v1/auth/login                    → { email, password } → { token, role, user }
POST   /api/v1/auth/logout                   → invalidate token
POST   /api/v1/auth/change-password          → { old_password, new_password }
```

---

## 4. Communication Templates

**Page:** `settings/templates.html` · **JS:** `templates.js`

### Purpose
Pre-written message templates for SMS and email communication:
- Fee reminder
- Result release notification
- Exam schedule notice
- Welcome messages (new admissions)

### Template Object
```json
{
  "id": "TPL001",
  "name": "Fee Reminder",
  "type": "SMS",
  "subject": "Fee Payment Reminder",
  "body": "Dear {parent_name}, {student_name} in {class} has an outstanding fee of ₦{outstanding}. Please pay before {due_date}. — Noplin Academy",
  "variables": ["parent_name", "student_name", "class", "outstanding", "due_date"]
}
```

### Template Variable Injection (Backend)
```php
$body = str_replace(
    ['{parent_name}', '{student_name}', '{class}', '{outstanding}', '{due_date}'],
    [$parent->name, $student->name, $student->class->name, $outstanding, $dueDate],
    $template->body
);
```

### Laravel Table: `message_templates`
```sql
CREATE TABLE message_templates (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(100),
    type ENUM('SMS','Email','Push'),
    subject VARCHAR(200) NULLABLE,
    body TEXT,
    variables JSON
);
```

---

## 5. Theme & Display Settings

**Page:** `settings/theme.html` · **JS:** `theme-settings.js`

### Settings Object
```json
{
  "darkMode": false,
  "accentColor": "#3b82f6",
  "sidebarCollapsed": false,
  "language": "en",
  "dateFormat": "DD/MM/YYYY",
  "currency": "NGN",
  "currencySymbol": "₦"
}
```

### Backend Note
Theme settings are largely **client-side preferences** stored in `localStorage`. The backend only needs to persist:
- `currency` and `currencySymbol` — affects fee displays
- `dateFormat` — affects date display across all modules

Store these in `school_profiles` table as additional columns:
```sql
ALTER TABLE school_profiles ADD COLUMN currency VARCHAR(10) DEFAULT 'NGN';
ALTER TABLE school_profiles ADD COLUMN currency_symbol VARCHAR(5) DEFAULT '₦';
ALTER TABLE school_profiles ADD COLUMN date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY';
```

---

## 6. Import Users

**Page:** `settings/import-users.html` · **JS:** `import-users.js`

### Purpose
Bulk import of students or teachers via CSV/Excel upload.

### Required CSV Format (Students)
```
admission_number, name, date_of_birth, gender, class, section, phone
ADM/2024/001, Adebayo Ogunlesi, 2008-05-12, Male, SS3, A, 08012345678
```

### Backend Validation Rules
1. `admission_number` must be unique per branch
2. `class` must exist in `classes` table for current academic year
3. `section` must exist within that class
4. Invalid rows should be skipped and reported back (don't fail the whole import)

### API Endpoint
```
POST /api/v1/import/students    { file: csv_file }
→ Response: { imported: 45, skipped: 2, errors: [{row: 12, reason: "Duplicate admission number"}] }
```

---

## 7. Notifications System

**JS:** `notifications.js`

### Purpose
In-app notification bell (badge count) for:
- New fee payment recorded
- Leave request approved/rejected
- New notice published
- Exam results released

### Laravel Table: `notifications`
(Use Laravel's built-in `Illuminate\Notifications` system)

```sql
CREATE TABLE notifications (
    id CHAR(36) UUID PK,
    type VARCHAR(255),
    notifiable_type VARCHAR(255),
    notifiable_id BIGINT,
    data JSON,
    read_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP
);
```

### API Endpoints
```
GET    /api/v1/notifications?unread=true    → unread for current user
PATCH  /api/v1/notifications/{id}/read
PATCH  /api/v1/notifications/read-all
```
