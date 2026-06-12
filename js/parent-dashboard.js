// Parent Dashboard Navigation Logic

// Advanced Navigation Loading with Script Injection
async function loadParentContent(file, scriptPath = null, scriptId = null) {
    const contentDiv = document.getElementById('main-content');
    contentDiv.innerHTML = '<div class="flex justify-center p-10"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i></div>';
    
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        contentDiv.innerHTML = html;
        
        // Handle Script Injection for Admin Modules
        if (scriptPath && scriptId) {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) existingScript.remove();
            
            const script = document.createElement('script');
            script.src = scriptPath;
            script.id = scriptId;
            document.body.appendChild(script);
        }

        // Re-init flowbite if needed
        setTimeout(() => {
            if(typeof initFlowbite === 'function') initFlowbite();
        }, 100);

    } catch(e) { 
        console.error('Error loading content:', e);
        contentDiv.innerHTML = `<div class="p-10 text-center text-red-600 bg-red-50 rounded-lg">
            <i class="fas fa-exclamation-circle text-2xl mb-2"></i><br>
            Error loading page: ${file}
        </div>`;
    }
}

// Navigation Functions
window.loadParentHome = function() {
    window.location.reload(); 
};

window.loadMyChildren = function() {
    loadParentContent('my-children.html');
};

window.loadParentAttendance = function() {
    loadParentContent('attendance.html', '../../js/parent-attendance.js', 'parent-attendance-script');
};

window.loadParentMarks = function() {
    loadParentContent('marks.html');
};

window.loadParentFees = function() {
    loadParentContent('fees.html');
};

window.loadParentMessages = function() {
    loadParentContent('messages.html');
};
