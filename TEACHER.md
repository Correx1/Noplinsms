# Teacher Dashboard Architecture & Flow

The Teacher interface (`teacher/dashboard.html`) is a heavily restricted and scoped version of the main application. Teachers only have access to modules and data directly related to their assigned classes and subjects.

## Base Layout

- **Path**: `pages/teacher/dashboard.html`
- **Sidebar Component**: `components/teacher-sidebar.html`
- **Default View**: An overview dashboard containing quick stat cards (Total Students in their classes), recent announcements, and upcoming events.

## Module Breakdown

### 1. Dashboard

- **Route**: `dashboard.html` -> loads `loadTeacherHome()` -> `pages/teacher/dashboard.html`
- **Actions**: View high-level metrics (My Classes count, assigned subjects).

### 2. Academics

- **My Classes**: `teacher/my-classes.html`
  - (Backend: Return ONLY the classes the logged-in teacher is assigned to teach or is the form teacher of.)
- **Timetables**: `teacher/timetable.html`
  - (Backend: Return ONLY the teacher's personal weekly schedule.)
- **Assignments**: `teacher/assignments.html`
  - (Create, grade, and track homework assigned by this teacher.)
- **Grade Book**: `teacher/gradebook.html`
  - (Enter continuous assessment and exam grades for their active classes.)

### 3. Students

- **Student Directory**: `teacher/students.html`
  - (Backend: Return ONLY profiles of students who belong to the teacher's enrolled classes.)
- **Mark Attendance**: `teacher/attendance.html`
  - (Log daily/subject attendance for students under their purview.)

### 4. Examinations

- **Exam Duties/Tasks**: `teacher/exam-duties.html`
  - (View invigilation schedules or assigned marking schemes.)
- **Marks Entry**: `admin/academics/assessments/assessments.html`
  - (Shared with admin design, but backend must scope access strictly to the teacher's subjects.)

### 5. My Portal (HR)

- **My Profile**: `teacher/profile.html` (View and request edits to their personal info).
- **Leave Requests**: `teacher/leave.html` (Apply for sick leave, casual leave).
- **Payslips**: `teacher/payslips.html` (View historical salary disbursements).

### 6. Communications

- **Messages**: `teacher/messages.html` (Inter-staff or parent direct messaging if permitted).
- **Notices**: `admin/notices.html` (Received broadcasted memos from Admins).
- **Events**: `admin/events.html` (View the school calendar).

### 7. Library

- **Book Search**: `admin/library.html` (Teachers can browse the school library catalog, but cannot issue/return books unless they possess secondary librarian privileges).

### 8. Reports

- **Reports**: `teacher/reports.html` (Generate PDFs of their assigned students' performance).
