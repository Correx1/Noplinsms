// Teacher Dashboard Logic

// Load teacher-pages.js for page-specific functionality
const script = document.createElement('script');
script.src = '../../js/teacher-pages.js';
document.head.appendChild(script);

// Basic Navigation Loading
async function loadTeacherContent(file, scriptPath = null, scriptId = null) {
    const contentDiv = document.getElementById('main-content');
    contentDiv.innerHTML = '<div class="flex justify-center p-10"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i></div>';
    
    try {
        const response = await fetch(file);
        const html = await response.text();
        contentDiv.innerHTML = html;
        
        // Dynamically load associated script if provided
        if (scriptPath && scriptId && typeof loadScript === 'function') {
            loadScript(scriptPath + '?v=' + Date.now(), scriptId);
        }

        // Initialize page-specific functionality based on loaded file
        setTimeout(() => {
            if(file.includes('mark-attendance') && typeof window.initAttendancePage === 'function') {
                window.initAttendancePage();
            } else if(file.includes('grade-book') && typeof window.initGradeBookPage === 'function') {
                window.initGradeBookPage();
            } else if(file.includes('exams') && typeof window.initExamsPage === 'function') {
                window.initExamsPage();
            } else if(file.includes('students')) {
                // Students page message modal is already set up with onclick handlers
                const form = document.getElementById('messageForm');
                if(form) {
                    form.addEventListener('submit', window.sendMessage);
                }
            }
            
            // Re-init flowbite if needed
            if(typeof initFlowbite === 'function') initFlowbite();
        }, 100);
    } catch(e) { 
        console.error(e);
        contentDiv.innerHTML = '<div class="p-10 text-center text-red-600">Error loading page: ' + file + '</div>';
    }
}

function setActive(element) {
    // Admin uses active-nav-link logic in sidebar.js, so we hook into that instead of bg-gray-100 here.
    if(typeof window.setActiveLink === 'function') {
        window.setActiveLink(element);
    }
}

// Navigation Functions
// Navigation Functions
window.loadTeacherHome = function() {
    window.location.reload(); 
};

window.loadMyClasses = function() {
    loadTeacherContent('my-classes.html');
};

window.loadTeacherTimetable = function() {
    loadTeacherContent('timetable.html');
};

window.loadTeacherStudents = function() {
    loadTeacherContent('students.html');
};

window.loadTeacherAttendance = function() {
    loadTeacherContent('mark-attendance.html', '../../js/teacher-attendance.js', 'teacher-attendance-script');
};

window.loadTeacherAssignments = function() {
    loadTeacherContent('assignments.html');
};

window.loadGradeBook = function() {
    loadTeacherContent('grade-book.html');
};

window.loadTeacherExams = function() {
    loadTeacherContent('exams.html');
};

window.loadTeacherMessages = function() {
    loadTeacherContent('messages.html');
};

window.loadTeacherReports = function() {
    loadTeacherContent('reports.html');
};

window.loadTeacherProfile = function() {
    // Note: If you have a specific teacher profile, use that. Or fallback to settings profile.
    loadTeacherContent('profile.html');
};

// ==================== NEW ADMIN/HR/CROSS-MODULE LINKS ====================
// These are added to allow Teachers & Staff to access HR and Library modules 
// embedded in the teacher's dashboard wrapper.

window.loadStaffLeavePage = function() {
    loadTeacherContent('../admin/hr/leave.html', '../../js/hr.js', 'hr-script');
};

window.loadPayslipsPage = function() {
    loadTeacherContent('../admin/hr/payroll.html', '../../js/hr.js', 'hr-script');
};

window.loadLibraryBooksPage = function() {
    loadTeacherContent('../admin/library/books.html', '../../js/library.js', 'library-script'); 
};

window.loadNoticesList = function() {
    loadTeacherContent('../admin/communication/notices-list.html', '../../js/notices.js', 'notices-script');
};

window.loadEventsPage = function() {
    loadTeacherContent('../admin/events.html', '../../js/events.js', 'events-script');
};

window.loadCreateNoticePage = function() {
    loadTeacherContent('../admin/communication/create-notice.html', '../../js/notices.js', 'notices-script');
};

window.loadAssessmentsPage = function() { // Actually Marks Entry based on sidebar binding
    loadTeacherContent('../admin/academics/marks/marks.html', '../../js/marks.js', 'marks-script');
};

// Logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm('Log out?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userRole');
                window.location.href = '../../index.html';
            }
        });
    }
});
