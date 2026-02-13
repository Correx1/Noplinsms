// Student Dashboard Navigation Logic

// Basic Navigation Loading
async function loadStudentContent(file) {
    const contentDiv = document.getElementById('main-content');
    contentDiv.innerHTML = '<div class="flex justify-center p-10"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i></div>';
    
    try {
        const response = await fetch(file);
        const html = await response.text();
        contentDiv.innerHTML = html;
        
        // Initialize page-specific functionality
        setTimeout(() => {
            if(file.includes('library')) {
                if(typeof window.initLibraryPage === 'function') {
                    window.initLibraryPage();
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
window.loadStudentHome = function() {
    window.location.reload(); 
};

window.loadMyProfile = function() {
    loadStudentContent('my-profile.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadStudentAttendance = function() {
    loadStudentContent('attendance.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadStudentMarks = function() {
    loadStudentContent('marks.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadStudentAssignments = function() {
    loadStudentContent('assignments.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadStudentFees = function() {
    loadStudentContent('fees.html');
    if(event && event.currentTarget) setActive(event.currentTarget);
};

window.loadStudentLibrary = function() {
    loadStudentContent('library.html');
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
