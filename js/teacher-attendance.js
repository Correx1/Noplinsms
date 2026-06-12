/**
 * Teacher Attendance Portal Controller
 * Manages 3 Views: Periodic Attendance, Biometric Scan Simulator, and Stats Reports
 */

window.teacherAttendanceController = {
    activeTab: 'periodic',
    periodicRecords: {}, // Cached periodic records
    currentRoster: [],

    init: function() {
        this.switchTab('periodic');
        
        // Set dates to today
        const today = new Date().toISOString().split('T')[0];
        const scannerDate = document.getElementById('scannerDate');
        if (scannerDate) scannerDate.value = today;

        const periodicDate = document.getElementById('periodicDate');
        if (periodicDate) periodicDate.value = today;
        
        // Load existing periodic records from localStorage if present
        try {
            const saved = localStorage.getItem('sms_periodic_attendance_records');
            if (saved) {
                this.periodicRecords = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading periodic attendance records:', e);
        }

        // Initialize Daily scanner list
        this.loadDailyScannerLogs();
    },

    // ------------------------------------------------------------------------
    // Tab switching
    // ------------------------------------------------------------------------
    switchTab: function(tabId) {
        this.activeTab = tabId;
        
        // Update tab buttons visually
        ['periodic', 'scanner', 'reports'].forEach(t => {
            const btn = document.getElementById(`tab-${t}`);
            const content = document.getElementById(`content-${t}`);
            if (btn) {
                if (t === tabId) {
                    btn.className = "inline-block p-4 border-b-2 rounded-t-lg text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500 transition-all";
                } else {
                    btn.className = "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-gray-500 dark:text-gray-400 transition-all";
                }
            }
            if (content) {
                if (t === tabId) {
                    content.classList.remove('hidden');
                    content.classList.add('block');
                } else {
                    content.classList.remove('block');
                    content.classList.add('hidden');
                }
            }
        });

        // Trigger updates on tab click
        if (tabId === 'scanner') {
            this.loadDailyScannerLogs();
        }
    },

    // ------------------------------------------------------------------------
    // Tab 1: Periodic (Subject) Attendance logic
    // ------------------------------------------------------------------------
    onClassChange: function() {
        const classVal = document.getElementById('periodicClass').value;
        const subSelect = document.getElementById('periodicSubject');
        if (!subSelect) return;

        while (subSelect.options.length > 1) { subSelect.remove(1); }

        if (!classVal) {
            subSelect.disabled = true;
            return;
        }

        subSelect.disabled = false;
        let subjects = ['Mathematics', 'English Language', 'Basic Science', 'Igbo Language', 'Social Studies'];
        if (classVal.startsWith('SS')) {
            subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Geography', 'Civic Education'];
        }

        subjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subSelect.appendChild(option);
        });
    },

    fetchPeriodicRoster: function() {
        const cls = document.getElementById('periodicClass').value;
        const sec = document.getElementById('periodicSection').value;
        const sub = document.getElementById('periodicSubject').value;
        const period = document.getElementById('periodicPeriod').value;
        const todayStr = document.getElementById('periodicDate').value || new Date().toISOString().split('T')[0];

        if (!cls || !sec || !sub || !period) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please select Class, Section, Subject, and Period.'
            });
            return;
        }

        // Hide empty state and show roster container
        document.getElementById('periodicEmptyState').style.display = 'none';
        const container = document.getElementById('periodicRosterContainer');
        container.classList.remove('hidden');

        document.getElementById('periodicActiveHeader').textContent = `${cls} ${sec} - ${sub} (${period})`;

        const tbody = document.getElementById('periodicRosterTableBody');
        tbody.innerHTML = '';

        // Get students from database
        const students = (window.SchoolDatabase && window.SchoolDatabase.students) || [];
        const filtered = students.filter(s => s.class === cls && s.section === sec);

        this.currentRoster = filtered;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No students registered in ${cls} Section ${sec}</td></tr>`;
            this.updatePeriodicCounts();
            return;
        }

        // Try load existing record for this combination
        const recordKey = `${cls}_${sec}_${sub}_${todayStr}_${period}`;
        const existingRecord = this.periodicRecords[recordKey] || {};

        filtered.forEach(student => {
            const status = existingRecord[student.id] ? existingRecord[student.id].status : 'present';
            const remark = existingRecord[student.id] ? existingRecord[student.id].remark : '';

            const isPresentChecked = status === 'present' ? 'checked' : '';
            const isAbsentChecked = status === 'absent' ? 'checked' : '';

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">${student.roll}</td>
                <td class="px-6 py-4">
                    <img class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600" src="${student.photo || 'https://i.pravatar.cc/150'}" alt="">
                </td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${student.name}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-6">
                        <label class="flex items-center cursor-pointer group">
                            <input type="radio" name="p_att_${student.id}" value="present" ${isPresentChecked} onchange="window.teacherAttendanceController.updatePeriodicCounts()" class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500">
                            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 group-hover:text-green-600 transition-colors">✅ Present</span>
                        </label>
                        <label class="flex items-center cursor-pointer group">
                            <input type="radio" name="p_att_${student.id}" value="absent" ${isAbsentChecked} onchange="window.teacherAttendanceController.updatePeriodicCounts()" class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500">
                            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 group-hover:text-red-500 transition-colors">❌ Absent</span>
                        </label>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <input type="text" id="p_remark_${student.id}" value="${remark}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Add remark...">
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.updatePeriodicCounts();
    },

    markAll: function(state) {
        if (!this.currentRoster.length) return;
        this.currentRoster.forEach(student => {
            const radio = document.querySelector(`input[name="p_att_${student.id}"][value="${state}"]`);
            if (radio) radio.checked = true;
        });
        this.updatePeriodicCounts();
    },

    updatePeriodicCounts: function() {
        let present = 0;
        let absent = 0;

        if (this.currentRoster.length) {
            this.currentRoster.forEach(student => {
                const presentRadio = document.querySelector(`input[name="p_att_${student.id}"][value="present"]`);
                if (presentRadio && presentRadio.checked) {
                    present++;
                } else {
                    absent++;
                }
            });
        }

        document.getElementById('periodicPresentCount').textContent = present;
        document.getElementById('periodicAbsentCount').textContent = absent;
        document.getElementById('periodicTotalCount').textContent = present + absent;
    },

    savePeriodicAttendance: function() {
        const cls = document.getElementById('periodicClass').value;
        const sec = document.getElementById('periodicSection').value;
        const sub = document.getElementById('periodicSubject').value;
        const period = document.getElementById('periodicPeriod').value;
        const todayStr = document.getElementById('periodicDate').value || new Date().toISOString().split('T')[0];

        if (!cls || !sec || !sub || !period || !this.currentRoster.length) return;

        const recordKey = `${cls}_${sec}_${sub}_${todayStr}_${period}`;
        const recordData = {};

        this.currentRoster.forEach(student => {
            const presentRadio = document.querySelector(`input[name="p_att_${student.id}"][value="present"]`);
            const status = (presentRadio && presentRadio.checked) ? 'present' : 'absent';
            const remark = document.getElementById(`p_remark_${student.id}`).value;
            recordData[student.id] = { status, remark, name: student.name };
        });

        this.periodicRecords[recordKey] = recordData;
        
        // Save back to localStorage
        localStorage.setItem('sms_periodic_attendance_records', JSON.stringify(this.periodicRecords));

        Swal.fire({
            icon: 'success',
            title: 'Attendance Saved',
            text: 'Periodic subject attendance recorded successfully.',
            confirmButtonColor: '#0284c7'
        });
    },

    // ------------------------------------------------------------------------
    // Tab 2: Daily Scanner Simulation logic
    // ------------------------------------------------------------------------
    loadDailyScannerLogs: function() {
        const dateVal = document.getElementById('scannerDate').value;
        const classVal = document.getElementById('scannerClass').value;
        const sectionVal = document.getElementById('scannerSection').value;

        if (!dateVal) return;

        // Get daily sessions from localStorage
        let sessions = {};
        try {
            sessions = JSON.parse(localStorage.getItem('sms_student_att_sessions') || '{}');
        } catch(e) {}

        const tbody = document.getElementById('scannerLogTableBody');
        tbody.innerHTML = '';

        // Get student list
        const students = (window.SchoolDatabase && window.SchoolDatabase.students) || [];
        let filtered = students;
        if (classVal) filtered = filtered.filter(s => s.class === classVal);
        if (sectionVal) filtered = filtered.filter(s => s.section === sectionVal);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No students match filter criteria.</td></tr>`;
            return;
        }

        filtered.forEach(student => {
            const sk = `${dateVal}_${student.id}`;
            const session = sessions[sk] || { timeIn: '', timeOut: '', override: '' };

            const isChecked = session.timeIn ? 'checked' : '';
            
            // Calculate calculated status
            let status = 'Absent';
            if (session.override) {
                status = session.override;
            } else if (session.timeIn) {
                status = 'Present';
                // Check lateness
                const inMin = this.timeToMinutes(session.timeIn);
                if (inMin > this.timeToMinutes('08:15')) {
                    status = 'Late';
                }
                // Check early out
                if (session.timeOut) {
                    const outMin = this.timeToMinutes(session.timeOut);
                    if (outMin < this.timeToMinutes('14:00')) {
                        status = 'Early Out';
                    }
                }
            }

            const statusBadges = {
                'Present': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                'Late': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                'Early Out': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                'Absent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                'Leave': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            };

            const badge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold ${statusBadges[status] || 'bg-gray-100'}">${status}</span>`;

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";
            tr.innerHTML = `
                <td class="px-4 py-3">
                    <input type="checkbox" class="scanner-row-checkbox w-4 h-4 text-primary-600 rounded cursor-pointer" data-id="${student.id}">
                </td>
                <td class="px-6 py-4 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">${student.id}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${student.name}</td>
                <td class="px-6 py-4">${student.class} ${student.section}</td>
                <td class="px-6 py-4 text-center font-mono font-bold text-green-600 dark:text-green-400">${session.timeIn || '—'}</td>
                <td class="px-6 py-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">${session.timeOut || '—'}</td>
                <td class="px-6 py-4 text-center">${badge}</td>
            `;
            tbody.appendChild(tr);
        });

        // Reset checkall
        const selectAll = document.getElementById('scannerSelectAll');
        if (selectAll) selectAll.checked = false;
    },

    selectAllScannerRows: function(checked) {
        document.querySelectorAll('.scanner-row-checkbox').forEach(cb => cb.checked = checked);
    },

    getSelectedScannerIds: function() {
        return [...document.querySelectorAll('.scanner-row-checkbox:checked')].map(cb => cb.dataset.id);
    },

    timeToMinutes: function(t) {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    },

    bulkSetClock: function(direction) {
        const ids = this.getSelectedScannerIds();
        if (ids.length === 0) {
            Swal.fire('No Selection', 'Please select one or more students using the checkboxes.', 'warning');
            return;
        }

        const dateVal = document.getElementById('scannerDate').value;
        let sessions = {};
        try {
            sessions = JSON.parse(localStorage.getItem('sms_student_att_sessions') || '{}');
        } catch(e) {}

        const nowTime = new Date().toTimeString().slice(0, 5);

        ids.forEach(id => {
            const sk = `${dateVal}_${id}`;
            const session = sessions[sk] || { timeIn: '', timeOut: '', override: '' };

            if (direction === 'in') {
                session.timeIn = nowTime;
                session.override = '';
            } else if (direction === 'out') {
                session.timeOut = nowTime;
                session.override = '';
            } else {
                session.timeIn = '';
                session.timeOut = '';
                session.override = 'Absent';
            }
            sessions[sk] = session;
        });

        localStorage.setItem('sms_student_att_sessions', JSON.stringify(sessions));
        this.loadDailyScannerLogs();
        
        Swal.fire({
            icon: 'success',
            title: 'Bulk Update',
            text: `Successfully updated attendance logs for ${ids.length} students.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
    },

    triggerScanSim: function() {
        const dateVal = document.getElementById('scannerDate').value;
        const classVal = document.getElementById('scannerClass').value;
        const sectionVal = document.getElementById('scannerSection').value;

        const students = (window.SchoolDatabase && window.SchoolDatabase.students) || [];
        let filtered = students;
        if (classVal) filtered = filtered.filter(s => s.class === classVal);
        if (sectionVal) filtered = filtered.filter(s => s.section === sectionVal);

        if (filtered.length === 0) {
            Swal.fire('Empty List', 'No students match the current filters to perform scan.', 'warning');
            return;
        }

        // Select a random student
        const randStudent = filtered[Math.floor(Math.random() * filtered.length)];

        let sessions = {};
        try {
            sessions = JSON.parse(localStorage.getItem('sms_student_att_sessions') || '{}');
        } catch(e) {}

        const sk = `${dateVal}_${randStudent.id}`;
        const session = sessions[sk] || { timeIn: '', timeOut: '', override: '' };

        let action = 'Clock In';
        const nowTime = new Date().toTimeString().slice(0, 5);

        if (!session.timeIn) {
            session.timeIn = nowTime;
            session.override = '';
            action = 'Clock In';
        } else if (!session.timeOut) {
            session.timeOut = nowTime;
            session.override = '';
            action = 'Clock Out';
        } else {
            // Re-clock in for test purposes
            session.timeIn = nowTime;
            session.timeOut = '';
            session.override = '';
            action = 'Clock In (Reset)';
        }

        sessions[sk] = session;
        localStorage.setItem('sms_student_att_sessions', JSON.stringify(sessions));

        // Render banner
        const banner = document.getElementById('scanDisplayBanner');
        banner.className = `mt-4 p-4 rounded-xl border flex items-center justify-between transition-all ${
            action.includes('In') 
                ? 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800 text-green-800 dark:text-green-300' 
                : 'border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 text-blue-800 dark:text-blue-300'
        }`;
        banner.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas ${action.includes('In') ? 'fa-sign-in-alt' : 'fa-sign-out-alt'} text-xl"></i>
                <div>
                    <span class="text-xs uppercase tracking-wider font-bold">Simulated ${action}</span>
                    <h5 class="text-sm font-black">${randStudent.name} (${randStudent.id})</h5>
                </div>
            </div>
            <div class="text-right text-xs font-mono">
                Timestamp: <strong>${nowTime}</strong>
            </div>
        `;
        banner.classList.remove('hidden');

        this.loadDailyScannerLogs();

        // Audio feedback (synthetic beep)
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = action.includes('In') ? 1200 : 800;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch(err) {}
    },

    saveScannerLogs: function() {
        Swal.fire({
            icon: 'success',
            title: 'Saved Successfully',
            text: 'Daily logs committed to storage database.',
            confirmButtonColor: '#0284c7'
        });
    },

    // ------------------------------------------------------------------------
    // Tab 3: Reports logic
    // ------------------------------------------------------------------------
    generateReport: function() {
        const cls = document.getElementById('reportClass').value;
        const sec = document.getElementById('reportSection').value;

        if (!cls || !sec) {
            Swal.fire('Missing Criteria', 'Please select Class and Section to run statistical audit.', 'warning');
            return;
        }

        document.getElementById('reportsEmptyState').style.display = 'none';
        const container = document.getElementById('reportContainer');
        container.classList.remove('hidden');
        document.getElementById('btnExportReport').classList.remove('hidden');

        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = '';

        const students = (window.SchoolDatabase && window.SchoolDatabase.students) || [];
        const filtered = students.filter(s => s.class === cls && s.section === sec);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No student matching selected parameters.</td></tr>`;
            return;
        }

        filtered.forEach(student => {
            // Simulate statistical aggregation based on actual records + base random seed
            let presentCount = 20 + Math.floor(Math.random() * 15);
            let absentCount = Math.floor(Math.random() * 5);
            
            // Audit actual saved records for this student in periodicRecords
            Object.keys(this.periodicRecords).forEach(key => {
                const record = this.periodicRecords[key];
                if (record[student.id]) {
                    if (record[student.id].status === 'present') {
                        presentCount++;
                    } else {
                        absentCount++;
                    }
                }
            });

            const total = presentCount + absentCount;
            const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '0.0';

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${student.name}</td>
                <td class="px-6 py-4">${total}</td>
                <td class="px-6 py-4 text-green-600 font-bold">${presentCount}</td>
                <td class="px-6 py-4 text-red-500 font-bold">${absentCount}</td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
                        parseFloat(rate) >= 85 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30' 
                            : parseFloat(rate) >= 70
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                    }">${rate}%</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    exportReportExcel: function() {
        const table = document.getElementById('reportsExcelTable');
        if(!table) return;

        const html = table.outerHTML;
        const url = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(html);
        const downloadLink = document.createElement("a");
        document.body.appendChild(downloadLink);
        downloadLink.href = url;
        downloadLink.download = `Student_Period_Attendance_Report_${new Date().toISOString().split('T')[0]}.xls`;
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
};

// Auto Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.teacherAttendanceController.init());
} else {
    window.teacherAttendanceController.init();
}
