// Basic Component Loader
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
            
            // Wait for next tick to ensure DOM is fully updated
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Only initialize Flowbite if it exists
            if (typeof initFlowbite === 'function') {
                initFlowbite();
            }
        } else {
            console.error(`Failed to load component: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error loading component ${filePath}:`, error);
    }
}

// Dynamic Script Loader
function loadScript(src, id) {
    const existingScript = document.getElementById(id);
    if (existingScript) {
        existingScript.remove();
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    document.body.appendChild(script);
}

function setActiveLink(element) {
    document.querySelectorAll('#logo-sidebar li, #logo-sidebar a').forEach(el => {
        el.classList.remove('bg-primary-800', 'dark:bg-primary-900', 'active-nav-link');
        
    });
    if (element) {
        element.classList.add('bg-primary-800', 'dark:bg-primary-900', 'active-nav-link');
    }
}


// Expose to global scope
window.setActiveLink = setActiveLink;

// User Data & Logout Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');

    if (!isLoggedIn) {
         window.location.href = '../../index.html';
    }

    // Load components with relative paths from pages/admin/
    await Promise.all([
        loadComponent('navbar-container', '../../components/navbar.html'),
        loadComponent('sidebar-container', '../../components/sidebar.html')
    ]);

    // Update User Info in Navbar
    setTimeout(() => {
        const userNameDisplay = document.getElementById('user-name-display');
        const userRoleDisplay = document.getElementById('user-role-display');
        if (userNameDisplay) userNameDisplay.textContent = localStorage.getItem('savedUsername') || 'User';
        if (userRoleDisplay) userRoleDisplay.textContent = userRole || 'Role';
    }, 500); // Wait for components to load

    // Logout Handler (Delegation)
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
            e.preventDefault();
            if(confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userRole');
                window.location.href = '../../index.html';
            }
        }
    });

    // Sidebar Active State Highlighting & Dynamic Loading
    document.getElementById('sidebar-container').addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Handle Sidebar Navigation
        if (href === 'dashboard.html' || href === '#') {
            e.preventDefault();
            
            // Visual Active State
            document.querySelectorAll('aside a, aside li').forEach(l => l.classList.remove('active-nav-link'));
            link.classList.add('active-nav-link');

            const text = link.textContent.trim();
            
            // Handle Sidebar Navigation
            const pageLoaders = {
                'Dashboard': loadDashboardHome,
    
                // Manage Section
                'Students': loadStudentsList,
                'Teachers': loadTeachersPage,
                'Parents': loadParentsPage,
                'Staff': loadStaffPage,
                'Import Users': loadImportUsersPage,
    
                // Academics Section
                'Classes': loadClassesPage,
                'Promote Students': loadPromoteStudentsPage,
                'Assessments': loadAssessmentsPage,
                'Examinations': loadExaminationsPage,
                'Score Sheets': loadScoreSheetsPage,
                'Marks Register': loadMarksEntryPage,
                'Results': loadResultsPage,
                'Timetable': loadTimetablePage,
                'Subjects': loadSubjectsPage,
    
                // Academic Configuration
                'Academic Config': loadAcademicConfigPage,

                // Attendance Section
                'Staff Attendance': loadStaffAttendancePage,
                'Student Attendance': loadAttendancePage,
    
                // Finance Section
                'Income': loadIncomePage,
                'Expenses': loadExpensesPage,
    
                // Record Section
                'Visitors Log': loadVisitorsLogPage,
                'Phone Log': loadPhoneLogPage,
                'Email Logs': loadEmailLogsPage,
                'SMS Logs': loadSMSLogsPage,
    
                // Standalone Pages
                'Events': loadEventsPage,
                'Notices': loadNoticesList,
                'Library': loadLibraryDashboard,
                'Transportation': loadTransportationPage,
                'Hostel': loadHostelPage,
                'Reports': loadReportsPage,
    
                // Settings Section
                'System Profile': loadSettingsProfilePage,
                'User Management': loadSettingsUsersPage,
            };

            if (href === 'dashboard.html' || href === '#') {
                e.preventDefault();

                // Visual Active State
                document.querySelectorAll('aside a').forEach(l => l.classList.remove('active-nav-link'));
                link.classList.add('active-nav-link');

                const text = link.textContent.trim();

                // Call the appropriate loader function if it exists
                if (pageLoaders[text]) {
                    pageLoaders[text]();
                }
            }
        }
    });
});

// Helper: Standard Page Loader
async function loadPage(url, scriptPath = null, scriptId = null) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="flex justify-center p-10"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i></div>';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Page not found: ${url}`);
        
        const html = await response.text();
        mainContent.innerHTML = html;
        
        if (scriptPath && scriptId) {
            loadScript(scriptPath + '?v=' + Date.now(), scriptId);
        }
        
        setTimeout(() => initFlowbite(), 100);
    } catch (e) {
        console.error(e);
        mainContent.innerHTML = `<div class="p-8 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p class="font-bold">Error</p>
            <p>Failed to load content. Please try again later.</p>
        </div>`;
    }
}

// ============================================
// MANAGE SECTION
// ============================================

window.loadStudentsList = () => loadPage('manage/students/students-list.html', '../../js/students-list.js', 'students-list-script');

window.loadAddStudentPage = (studentId = null) => {
    window.editingStudentId = studentId;
    loadPage('manage/students/add-student.html', '../../js/add-student.js', 'add-student-script');
};

window.loadViewStudentPage = async function(studentId) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="flex justify-center p-10"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i></div>';
    try {
        const response = await fetch('manage/students/view-student.html');
        const html = await response.text();
        mainContent.innerHTML = html;
        
        // Pass ID usually via global or dedicated element. 
        // For now, allow the script to read it from window or similar if needed.
        // Assuming view-student.js uses window.viewingStudentId logic if implemented
        
        loadScript('../../js/view-student.js?v=' + Date.now(), 'view-student-script');
        setTimeout(() => initFlowbite(), 100);
    } catch (e) {
        console.error(e);
        mainContent.innerHTML = '<p class="text-red-500">Error loading View Student page.</p>';
    }
};

window.loadTeachersPage = () => loadPage('manage/teachers/teachers-list.html', '../../js/teachers.js', 'teachers-script');

window.loadAddTeacherPage = (teacherId = null) => {
    window.editingTeacherId = teacherId;
    loadPage('manage/teachers/add-teacher.html', '../../js/teachers.js', 'teachers-script');
};

// Parents 
window.loadParentsPage = () => loadPage('manage/parents/parents.html', '../../js/parents.js', 'parents-script');
window.loadAddParentPage = (parentId = null) => {
    window.editingParentId = parentId;
    loadPage('manage/parents/add-parent.html', '../../js/parents.js', 'parents-script');
};

// Staff
window.loadStaffPage = () => loadPage('manage/staff/staff-list.html', '../../js/staff.js', 'staff-script');
window.loadAddStaffPage = (staffId = null) => {
    window.editingStaffId = staffId;
    loadPage('manage/staff/add-staff.html', '../../js/staff.js', 'staff-script');
};


// ============================================
// ACADEMICS SECTION
// ============================================

window.loadClassesPage = () => loadPage('academics/classes/classes.html', '../../js/classes.js', 'classes-script');
window.loadAddClassPage = () => loadPage('academics/classes/add-class.html', '../../js/classes.js', 'classes-script');
window.loadViewClassPage = (classId) => {
    window.viewingClassId = classId;
    loadPage('academics/classes/view-class.html', '../../js/classes.js', 'classes-script');
};

window.loadSubjectsPage = () => loadPage('academics/subjects/subjects-list.html', '../../js/subjects.js', 'subjects-script');
window.loadAddSubjectPage = () => loadPage('academics/subjects/add-subject.html', '../../js/subjects.js', 'subjects-script');

// Academic Configuration
window.loadAcademicConfigPage = () => loadPage('academics/config/academic-config.html', '../../js/academic-config.js', 'acad-config-script');

window.loadPromoteStudentsPage = () => loadPage('academics/promote-students.html', '../../js/promote-students.js', 'promote-script');

window.loadAssessmentsPage = () => loadPage('academics/assessments/assessments.html', '../../js/assessments.js', 'assessments-script');
window.loadCreateAssessmentPage = () => loadPage('academics/assessments/create-assessment.html', '../../js/assessments.js', 'assessments-script');
window.loadViewAssessmentPage = () => loadPage('academics/assessments/view-assessment.html', '../../js/assessments.js', 'assessments-script');

window.loadExaminationsPage = () => loadPage('academics/examinations/examinations.html', '../../js/examinations.js', 'examinations-script');
window.loadCreateExamPage = () => loadPage('academics/examinations/create-examination.html', '../../js/examinations.js', 'examinations-script');
window.loadExamSchedulePage = () => loadPage('academics/examinations/exam-schedule.html', '../../js/examinations.js', 'examinations-script');
window.loadViewExamPage = () => loadPage('academics/examinations/view-examination.html', '../../js/examinations.js', 'examinations-script');
window.loadAdmitCardsPage = () => loadPage('academics/examinations/admit-cards.html', '../../js/examinations.js', 'examinations-script');

window.loadScoreSheetsPage = () => loadPage('academics/score-sheets.html', '../../js/score-sheets.js', 'scores-script');
window.loadMarksEntryPage = () => loadPage('academics/marks/marks.html', '../../js/marks.js', 'marks-script');
window.loadResultsPage = () => loadPage('academics/results.html', '../../js/results.js', 'results-script');

window.loadTimetablePage = () => loadPage('academics/timetable/create-timetable.html', '../../js/timetable.js', 'timetable-script');


// ============================================
// ATTENDANCE SECTION
// ============================================
window.loadStaffAttendancePage = () => loadPage('attendance/staff-attendance.html', '../../js/staff-attendance.js', 'staff-attendance-script');
window.loadAttendancePage = () => loadPage('attendance/student-attendance.html', '../../js/attendance.js', 'attendance-script');


// ============================================
// FINANCE SECTION
// ============================================
window.loadIncomePage = () => loadPage('finance/income.html', '../../js/income.js', 'income-script');
window.loadExpensesPage = () => loadPage('finance/expenses.html', '../../js/expenses.js', 'expenses-script');
window.loadFeeCollectionPage = () => loadPage('finance/fee-collection.html', '../../js/fee-collection.js', 'fee-collection-script');


// ============================================
// RECORD SECTION
// ============================================
window.loadVisitorsLogPage = () => loadPage('record/visitors-log.html', '../../js/visitors-log.js', 'visitors-script');
window.loadPhoneLogPage = () => loadPage('record/phone-log.html', '../../js/phone-log.js', 'phone-script');
window.loadEmailLogsPage = () => loadPage('record/email-logs.html', null, null);
window.loadSMSLogsPage = () => loadPage('record/sms-logs.html', null, null);


// ============================================
// STANDALONE MODULES (Events, Notices, Library, etc.)
// ============================================

window.loadDashboardHome = () => loadPage('dashboard-home.html', '../../js/dashboard.js', 'dashboard-script');

window.loadEventsPage = () => loadPage('events.html', '../../js/events.js', 'events-script'); // Providing lists
window.loadViewEventPage = () => loadPage('events/view-event.html', '../../js/events.js', 'events-script');
window.loadAddEventPage = () => loadPage('events/add-event.html', '../../js/events.js', 'events-script');

window.loadNoticesList = () => loadPage('notices/notices-list.html', '../../js/notices.js', 'notices-script');
window.loadCreateNoticePage = () => loadPage('notices/create-notice.html', '../../js/notices.js', 'notices-script');

// Library
window.loadLibraryDashboard = () => loadPage('library/library-books.html', '../../js/library.js', 'library-script'); // Defaulting to books list for "Library" click
window.loadLibraryBooksPage = () => loadPage('library/library-books.html', '../../js/library.js', 'library-script');
window.loadAddBookPage = () => loadPage('library/add-book.html', '../../js/library.js', 'library-script');
window.loadIssueReturnPage = () => loadPage('library/issue-return-book.html', '../../js/library.js', 'library-script');
window.loadLibraryTransactionsPage = () => loadPage('library/transactions.html', '../../js/library.js', 'library-script');
window.loadLibraryMembersPage = () => loadPage('library/members.html', '../../js/library.js', 'library-script');

// Transportation
window.loadTransportationPage = () => loadPage('transportation/vehicles.html', '../../js/transportation.js', 'trans-script'); // Default entry
window.loadTransVehiclesPage = () => loadPage('transportation/vehicles.html', '../../js/transportation.js', 'trans-script');
window.loadTransRoutesPage = () => loadPage('transportation/routes.html', '../../js/transportation.js', 'trans-script');
window.loadTransDriversPage = () => loadPage('transportation/drivers.html', '../../js/transportation.js', 'trans-script');
window.loadTransAllocationPage = () => loadPage('transportation/students.html', '../../js/transportation.js', 'trans-script');

// Hostel
window.loadHostelPage = () => loadPage('hostel/hostels.html', '../../js/hostel.js', 'hostel-script'); // Default entry
window.loadHostelBuildingsPage = () => loadPage('hostel/hostels.html', '../../js/hostel.js', 'hostel-script');
window.loadHostelRoomsPage = () => loadPage('hostel/rooms.html', '../../js/hostel.js', 'hostel-script');
window.loadHostelAllocationPage = () => loadPage('hostel/allocations.html', '../../js/hostel.js', 'hostel-script');
window.loadHostelAttendancePage = () => loadPage('hostel/attendance.html', '../../js/hostel.js', 'hostel-script');

window.loadReportsPage = () => loadPage('reports.html', '../../js/reports.js', 'reports-script');

// Import Users
window.loadImportUsersPage = () => loadPage('import-users/import-users.html', '../../js/import-users.js', 'import-users-script');


// ============================================
// SETTINGS SECTION
// ============================================
window.loadSettingsPage = () => loadPage('settings/profile.html', '../../js/settings.js', 'settings-script');
window.loadSettingsProfilePage = () => loadPage('settings/profile.html', '../../js/settings.js', 'settings-script');
window.loadSettingsUsersPage = () => loadPage('settings/users.html', '../../js/users.js', 'users-script');
window.loadThemeSettingsPage = () => loadPage('settings/theme.html', '../../js/theme-settings.js', 'theme-settings-script');

