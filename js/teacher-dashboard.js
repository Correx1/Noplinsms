// Teacher Dashboard Logic

// Load teacher-pages.js for page-specific functionality
const script = document.createElement('script');
script.src = '../../js/teacher-pages.js';
document.head.appendChild(script);

// Basic Navigation Loading
async function loadTeacherContent(file) {
    const contentDiv = document.getElementById('main-content');
    contentDiv.innerHTML = '<div class="flex justify-center p-10"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i></div>';
    
    try {
        const response = await fetch(file);
        const html = await response.text();
        contentDiv.innerHTML = html;
        
        // Initialize page-specific functionality based on loaded file
        setTimeout(() => {
            if(file.includes('mark-attendance')) {
                if(typeof window.initAttendancePage === 'function') {
                    window.initAttendancePage();
                }
            } else if(file.includes('grade-book')) {
                if(typeof window.initGradeBookPage === 'function') {
                    window.initGradeBookPage();
                }
            } else if(file.includes('exams')) {
                if(typeof window.initExamsPage === 'function') {
                    window.initExamsPage();
                }
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
    document.querySelectorAll('#logo-sidebar a').forEach(el => el.classList.remove('bg-gray-100'));
    if(element) element.classList.add('bg-gray-100');
}

// Navigation Functions
window.loadTeacherHome = function() {
    window.location.reload(); 
};

window.loadMyClasses = function() {
    loadTeacherContent('my-classes.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherTimetable = function() {
    loadTeacherContent('timetable.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherStudents = function() {
    loadTeacherContent('students.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherAttendance = function() {
    loadTeacherContent('mark-attendance.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherAssignments = function() {
    loadTeacherContent('assignments.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadGradeBook = function() {
    loadTeacherContent('grade-book.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherExams = function() {
    loadTeacherContent('exams.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherMessages = function() {
    loadTeacherContent('messages.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherReports = function() {
    loadTeacherContent('reports.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadTeacherProfile = function() {
    loadTeacherContent('profile.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
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
