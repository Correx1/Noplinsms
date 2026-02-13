# School Management System

Complete School Management System built with HTML, TailwindCSS, Flowbite, and Vanilla JavaScript.

## Features

- **Dashboard** - Overview with stats and quick actions
- **Student Management** - Add, edit, view students
- **Teacher Management** - Manage teaching staff
- **Parent Management** - Parent information and contacts
- **Academics** - Classes, exams, assessments, results
- **Attendance** - Student and staff attendance tracking
- **Finance** - Income and expense management
- **Records** - Visitors, phone, email, SMS logs
- **Events & Notices** - School events and announcements
- **Library** - Book management and tracking
- **Transportation** - Route and vehicle management
- **Hostel** - Hostel management
- **Reports** - Generate various reports
- **Settings** - Profile and user management

## Tech Stack

- HTML5
- TailwindCSS (installed via npm)
- Flowbite (installed via npm)
- Vanilla JavaScript (ES6 Modules)
- Vite (Dev Server)
- localStorage (Data Persistence)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Build

```bash
npm run build
```

## Default Login

- **Email:** admin@school.com
- **Password:** admin123

## Project Structure

```
root/
├── index.html (Login page)
├── css/
│   └── styles.css
├── js/
│   ├── auth.js
│   ├── sidebar.js
│   ├── breadcrumb.js
│   ├── storage.js
│   └── utils.js
├── components/
│   ├── header.html
│   ├── sidebar.html
│   ├── breadcrumb.html
│   └── footer.html
├── dummydatas/
│   └── *.json (Sample data files)
└── pages/
    └── admin/
        ├── dashboard.html
        ├── manage/
        ├── academics/
        ├── attendance/
        ├── finance/
        ├── record/
        └── settings/
```

## Color Theme

Primary color: Blue (#3b82f6)

## License

MIT
