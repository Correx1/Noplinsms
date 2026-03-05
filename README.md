# Noplin School Management System - Frontend Architecture & Flow

This repository contains the frontend implementation for the Noplin School Management System. It is designed to be a comprehensive, role-based Single Page Application (SPA)-like experience.

## Goal of this Documentation

This documentation serves as the blueprint for the **Backend Architecture and Modular Design Pattern**. It explicitly defines what each user role can see, control, and access based on the frontend UI/UX design. The backend must strictly follow these constraints and authorization checks when building out the API.

## Core Application Flow

### 1. Unified Authentication

- All users log in through a central authentication portal (`index.html` / `login.html`).
- Upon successful authentication, the backend should return a JSON Web Token (JWT) or session cookie, containing the user's `role` (Admin, Teacher, Student, Parent).
- The frontend redirects the user to their designated dashboard based on this `role`.

### 2. Single Page Application (SPA) Strategy

- The frontend utilizes a dynamic loading structure without full page reloads to maintain a seamless experience.
- Each user role has a unified dashboard wrapper (e.g., `admin/dashboard.html`, `teacher/dashboard.html`) which holds the persistent Navbar and Sidebar.
- Navigation links trigger JavaScript functions (e.g., `loadStudentsList()`) that fetch the raw HTML of the target module and inject it into the `#main-content` container.
- Necessary JavaScript scripts for that specific module are then dynamically appended to the DOM.

### 3. Role-Based Access Control (RBAC) Requirements for Backend

The backend must enforce strict RBAC on every API endpoint.

- **Verifying Endpoints:** Just because a module is dynamically loaded does not secure it. The backend API must verify the `role` and `permissions` of the requesting user token for every GET, POST, PUT, and DELETE request.
- **Data Scoping:**
  - Admins can fetch all data in the school.
  - Teachers can only fetch data regarding the classes they teach or the exams they oversee.
  - Students can only fetch their own data (their marks, their attendance).
  - Parents can only fetch data regarding their specific children.

## Existing Roles

Detailed documentation for each specific role and their intended backend modules are broken down in the following files:

- [SUPERADMIN.md](./SUPERADMIN.md)
- [ADMIN.md](./ADMIN.md)
- [TEACHER.md](./TEACHER.md)
- [STUDENT.md](./STUDENT.md)
- [PARENTS.md](./PARENTS.md)

## Universal UI Components

- **Navbar:** The top navigation bar is shared across all roles, providing a global search mechanism, theme toggling, notification dropdown, and a user profile dropdown for logout.
- **Sidebar:** The sidebar is highly dynamic and unique to each role, acting as the primary navigation hierarchy.

## Developer Note for Backend

When constructing the API modules, follow the exact naming conventions and hierarchical grouping outlined in the role documentation. If a module exists in the frontend sidebar, there MUST be a corresponding backend controller/service handling its data.
