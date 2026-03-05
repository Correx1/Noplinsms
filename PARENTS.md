# Parents Dashboard Architecture & Flow

The Parents interface (`parent/dashboard.html`) is designed to give guardians oversight of their wards' academic and financial standing. The fundamental backend requirement here is a One-to-Many mapping: a single Parent account may be linked to multiple sibling Student accounts.

## Base Layout

- **Path**: `pages/parent/dashboard.html`
- **Sidebar Component**: `components/parent-sidebar.html`
- **Default View**: An overview of all linked children, total outstanding fees, and recent school announcements.

## Module Breakdown

### 1. Dashboard

- **Route**: `dashboard.html` -> loads `loadParentHome()` -> `pages/parent/dashboard.html`
- **Actions**: View aggregated financial and academic alerts for all their wards.

### 2. My Children

- **Route**: `parent/children.html` (or dynamic `loadMyChildren()`)
- **Backend Requirement**: Return an array of Student profiles strictly mapped to the logged-in Parent ID.

### 3. Attendance

- **Route**: `parent/attendance.html`
- **Backend Requirement**: Allow the parent to select a specific child and view their detailed historical attendance log.

### 4. Marks

- **Route**: `parent/marks.html`
- **Backend Requirement**: Allow the parent to select a specific child and download or view their official termly report cards.

### 5. Fees

- **Route**: `parent/fees.html`
- **Backend Requirement**: Retrieve all outstanding invoices and payment history across all linked children. If a payment gateway is integrated, processing should occur here.

### 6. Messages

- **Route**: `parent/messages.html`
- **Backend Requirement**: An inbox for direct communication between the parent and the school administration or their children's teachers.
