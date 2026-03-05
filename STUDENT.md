# Student Dashboard Architecture & Flow

The Student interface (`student/dashboard.html`) is the most restricted portal in the application. It acts as an inquiry-only endpoint, allowing students to view their own records without any destructive or wide-scale read permissions.

## Base Layout

- **Path**: `pages/student/dashboard.html`
- **Sidebar Component**: `components/student-sidebar.html`
- **Default View**: A welcome screen showing recent grades, upcoming assignments, and personalized notices.

## Module Breakdown

### 1. Dashboard

- **Route**: `dashboard.html` -> loads `loadStudentHome()` -> `pages/student/dashboard.html`
- **Actions**: View personal high-level academic metrics.

### 2. My Profile

- **Route**: `student/profile.html` (or dynamic load via `loadMyProfile()`)
- **Backend Requirement**: Return ONLY the logged-in student's personal information, medical records, and emergency contacts. No editing allowed.

### 3. Attendance

- **Route**: `student/attendance.html`
- **Backend Requirement**: Return a calendar or list of the student's historical attendance records.

### 4. Marks

- **Route**: `student/marks.html`
- **Backend Requirement**: Return the student's termly report cards and continuous assessment grades.

### 5. Assignments

- **Route**: `student/assignments.html`
- **Backend Requirement**: List active homework from the student's enrolled subjects. Enable submissions if digital upload is supported by the backend.

### 6. Fees

- **Route**: `student/fees.html`
- **Backend Requirement**: Display outstanding tuition balances and historical payment receipts linked to the student's ID.

### 7. Library

- **Route**: `student/library.html`
- **Backend Requirement**: View the school library catalog. View a secondary list of books currently issued to the _logged-in student_ along with due dates.
