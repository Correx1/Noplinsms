/**
 * Period Attendance Management Logic
 * Handles 4 Views: Dashboard, Take Attendance, Student Attendance, Teacher Details
 */

window.periodicAttendanceController = {
    currentTeacherDetails: null,

    // ------------------------------------------------------------------------
    // Initialization & View Switching
    // ------------------------------------------------------------------------
    init: function() {
        this.switchView('dashboard');
        this.populateClasses();
        this.populateTeachers();
    },

    switchView: function(viewId) {
        // Hide all views
        ['view-dashboard', 'view-take-attendance', 'view-student-attendance', 'view-teacher-details'].forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });

        // Show selected
        const target = document.getElementById(`view-${viewId}`);
        if(target) target.classList.remove('hidden');

        // View specific initializations
        if (viewId === 'dashboard') {
            this.loadDashboard();
        } else if (viewId === 'take-attendance') {
            this.initTakeAttendance();
        } else if (viewId === 'student-attendance') {
            this.resetStudentAttendance();
        }
    },

    // ------------------------------------------------------------------------
    // Populate Dropdowns
    // ------------------------------------------------------------------------
    populateClasses: function() {
        const mockClasses = ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
        
        ['takeAttClass', 'studentAttClass'].forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            while(select.options.length > 1) { select.remove(1); }
            mockClasses.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls;
                option.textContent = cls;
                select.appendChild(option);
            });
        });
    },

    populateTeachers: function() {
        const mockTeachers = [
            'Akwari Ngozi', 'Alaebuka Promise', 'Alagwu Chisom', 'Amechi Obumse', 
            'Anoribe Innocent', 'Chiejina Doris', 'Chima Justine Uchenna', 
            'Daniel Ijeoma', 'Emodi Ifeoma', 'ENEMUO CHINYERE'
        ];
        const select = document.getElementById('filterTeacher');
        
        if(select) {
            while(select.options.length > 1) { select.remove(1); }
            mockTeachers.forEach(t => {
                const option = document.createElement('option');
                option.value = t;
                option.textContent = t;
                select.appendChild(option);
            });
        }
    },

    onClassChange: function() {
        const classSelect = document.getElementById('takeAttClass');
        const subjectSelect = document.getElementById('takeAttSubject');
        if (!classSelect || !subjectSelect) return;

        const val = classSelect.value;
        while(subjectSelect.options.length > 1) { subjectSelect.remove(1); }
        
        if (!val) {
            subjectSelect.disabled = true;
            return;
        }

        subjectSelect.disabled = false;
        let subjects = ['Mathematics', 'English Language', 'Basic Science', 'Igbo Language'];
        if (val.startsWith('SSS')) {
            subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Further Math', 'Igbo Language'];
        }

        subjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subjectSelect.appendChild(option);
        });
    },

    // ------------------------------------------------------------------------
    // VIEW 1: DASHBOARD
    // ------------------------------------------------------------------------
    loadDashboard: function() {
        const tbody = document.getElementById('dashboardTableBody');
        if(!tbody) return;
        tbody.innerHTML = '';

        const filterTeacher = document.getElementById('filterTeacher').value;
        let mockTeachers = [
            'Akwari Ngozi', 'Alaebuka Promise', 'Alagwu Chisom', 'Amechi Obumse', 
            'Anoribe Innocent', 'Chiejina Doris', 'Chima Justine Uchenna', 
            'Daniel Ijeoma', 'Emodi Ifeoma', 'ENEMUO CHINYERE'
        ];

        if (filterTeacher) {
            mockTeachers = mockTeachers.filter(t => t === filterTeacher);
        }

        if (mockTeachers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No records found</td></tr>`;
            return;
        }

        mockTeachers.forEach((teacher, idx) => {
            // Generate some random stats for demonstration
            const total = Math.floor(Math.random() * 5);
            const attended = total > 0 ? Math.floor(Math.random() * (total + 1)) : 0;
            const missed = total - attended;
            const rate = total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0";

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">${idx + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap">${teacher}</td>
                <td class="px-6 py-4">${total}</td>
                <td class="px-6 py-4 text-green-600">${attended}</td>
                <td class="px-6 py-4 text-red-500">${missed}</td>
                <td class="px-6 py-4">${rate}%</td>
                <td class="px-6 py-4">
                    <button onclick="window.periodicAttendanceController.viewTeacherDetails('${teacher}')" class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                        View Details
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // ------------------------------------------------------------------------
    // VIEW 2: TAKE ATTENDANCE
    // ------------------------------------------------------------------------
    initTakeAttendance: function() {
        const dateInput = document.getElementById('takeAttDate');
        if(dateInput && !dateInput.value) {
            dateInput.valueAsDate = new Date();
        }
        
        // Hide roster grid until loaded
        document.getElementById('rosterContainer').classList.add('hidden');
    },

    loadRosterForTakingAttendance: function() {
        const cls = document.getElementById('takeAttClass').value;
        const sec = document.getElementById('takeAttSection').value;
        const sub = document.getElementById('takeAttSubject').value;
        const date = document.getElementById('takeAttDate').value;
        const period = document.getElementById('takeAttPeriod').value;

        if(!cls || !sec || !sub || !date || !period) {
            Swal.fire({icon: 'warning', title: 'Missing Fields', text: 'Please fill all fields (Class, Section, Subject, Date, Period) before taking attendance.'});
            return;
        }

        // Show Grid
        document.getElementById('rosterContainer').classList.remove('hidden');
        
        // Load Students (Mock based on class & section)
        const tbody = document.getElementById('takeAttTableBody');
        tbody.innerHTML = '';
        
        const students = this.generateMockStudents(`${cls} ${sec}`);
        
        students.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700 group";
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">${s.rollNo}</td>
                <td class="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">${s.name}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center cursor-pointer">
                            <input type="radio" name="att_${s.id}" value="present" class="w-4 h-4 text-green-600 focus:ring-green-500">
                            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Present</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="radio" name="att_${s.id}" value="absent" class="w-4 h-4 text-red-600 focus:ring-red-500" checked>
                            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Absent</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="radio" name="att_${s.id}" value="late" class="w-4 h-4 text-yellow-500 focus:ring-yellow-500">
                            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Late</span>
                        </label>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <input type="text" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Remarks...">
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    markAllPresent: function() {
        const radios = document.querySelectorAll('#takeAttTableBody input[type="radio"][value="present"]');
        radios.forEach(r => r.checked = true);
    },

    saveAttendance: function() {
        Swal.fire({
            icon: 'success',
            title: 'Attendance Saved',
            text: 'Period attendance has been successfully recorded.',
            confirmButtonColor: '#3b82f6'
        }).then(() => {
            this.switchView('dashboard');
        });
    },

    // ------------------------------------------------------------------------
    // VIEW 3: STUDENT PERIOD ATTENDANCE
    // ------------------------------------------------------------------------
    resetStudentAttendance: function() {
        document.getElementById('studentAttEmptyState').classList.remove('hidden');
        document.getElementById('studentAttResults').classList.add('hidden');
        document.getElementById('studentAttClass').value = '';
        document.getElementById('studentAttSection').value = '';
    },

    filterStudentAttendance: function() {
        const cls = document.getElementById('studentAttClass').value;
        const sec = document.getElementById('studentAttSection').value;

        if(!cls || !sec) {
            Swal.fire('Error', 'Please select both Class and Section', 'error');
            return;
        }

        document.getElementById('studentAttEmptyState').classList.add('hidden');
        document.getElementById('studentAttResults').classList.remove('hidden');
        const btnExport = document.getElementById('btnExportStudentAtt');
        if (btnExport) btnExport.classList.remove('hidden');

        const tbody = document.getElementById('studentAttTableBody');
        tbody.innerHTML = '';
        
        const students = this.generateMockStudents(`${cls} ${sec}`);
        
        students.forEach((s) => {
            const total = 40 + Math.floor(Math.random() * 10);
            const absent = Math.floor(Math.random() * 5);
            const late = Math.floor(Math.random() * 3);
            const present = total - absent - late;
            const percentage = ((present / total) * 100).toFixed(1);

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${s.name}</td>
                <td class="px-6 py-4">${total}</td>
                <td class="px-6 py-4 text-green-600">${present}</td>
                <td class="px-6 py-4 text-red-500">${absent}</td>
                <td class="px-6 py-4 text-yellow-600">${late}</td>
                <td class="px-6 py-4 font-bold ${percentage < 75 ? 'text-red-500' : 'text-green-600'}">${percentage}%</td>
            `;
            tbody.appendChild(tr);
        });
    },

    // ------------------------------------------------------------------------
    // VIEW 4: TEACHER DETAILS
    // ------------------------------------------------------------------------
    viewTeacherDetails: function(teacherName) {
        this.currentTeacherDetails = teacherName;
        const titleEl = document.getElementById('teacherDetailsTitle');
        if(titleEl) {
            titleEl.textContent = `Teacher Period Attendance - ${teacherName}`;
        }
        
        this.switchView('teacher-details');
        this.loadTeacherDetails();
    },

    loadTeacherDetails: function() {
        const tbody = document.getElementById('teacherDetailsTableBody');
        if(!tbody) return;
        tbody.innerHTML = '';

        // Generate mock history for this teacher
        const mockClasses = ['JSS 1 A', 'JSS 3 B', 'SSS 1 C'];
        const mockSubjects = ['Mathematics', 'English', 'Biology'];
        
        let hasData = false;
        
        for (let i = 1; i <= 3; i++) {
            hasData = true;
            const cls = mockClasses[i-1];
            const sub = mockSubjects[i-1];
            const startTime = `0${7 + i}:00 AM`;
            const endTime = `0${8 + i}:00 AM`;
            const clockIn = `0${7 + i}:05 AM`;
            const clockOut = `0${8 + i}:02 AM`;

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4">${i}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date().toLocaleDateString()}</td>
                <td class="px-6 py-4">${cls.split(' ')[0] + ' ' + cls.split(' ')[1]}</td>
                <td class="px-6 py-4">${cls.split(' ')[2]}</td>
                <td class="px-6 py-4">${sub}</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs font-mono">${startTime} - ${endTime}</td>
                <td class="px-6 py-4 text-green-600 text-xs font-mono"><i class="fas fa-rss text-[10px] mr-1"></i>${clockIn}</td>
                <td class="px-6 py-4 text-red-500 text-xs font-mono"><i class="fas fa-rss text-[10px] mr-1"></i>${clockOut}</td>
                <td class="px-6 py-4"><span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Present</span></td>
            `;
            tbody.appendChild(tr);
        }

        if (!hasData) {
            tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-8 text-center text-gray-500">No data found</td></tr>`;
        }
    },

    // ------------------------------------------------------------------------
    // Utilities
    // ------------------------------------------------------------------------
    generateMockStudents: function(className) {
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Daniel', 'Olivia', 'James', 'Sophia'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        
        const count = 5 + Math.floor(Math.random() * 10);
        const students = [];
        for(let i=0; i<count; i++) {
            const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
            students.push({
                id: `STU${1000 + i}`,
                name: `${fName} ${lName}`,
                class: className,
                rollNo: `${(i+1)}`
            });
        }
        return students;
    },

    exportTableToExcel: function(tableId, filename = '') {
        // Find the table inside the container
        let table = document.getElementById(tableId);
        if(!table) return;
        
        if (table.tagName !== 'TABLE') {
            table = table.querySelector('table');
        }

        if(!table) {
            Swal.fire('Error', 'Table data not found', 'error');
            return;
        }

        const cloneTable = table.cloneNode(true);
        // Clean up action buttons or inputs from clone
        const inputs = cloneTable.querySelectorAll('input');
        inputs.forEach(i => i.remove());
        const buttons = cloneTable.querySelectorAll('button');
        buttons.forEach(b => b.remove());

        const html = cloneTable.outerHTML;
        const url = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(html);
        
        const downloadLink = document.createElement("a");
        document.body.appendChild(downloadLink);
        
        const dateStr = new Date().toISOString().split('T')[0];
        downloadLink.href = url;
        downloadLink.download = `${filename}_${dateStr}.xls`;
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.periodicAttendanceController.init());
} else {
    window.periodicAttendanceController.init();
}
