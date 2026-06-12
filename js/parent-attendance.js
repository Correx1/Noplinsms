/**
 * Parent Portal Child Attendance Controller
 * Binds active child selector to School Register, Daily Logs, and Periodic tabs
 */

window.parentAttendanceController = {
    activeTab: 'register',
    activeStudentId: 'STU001',
    sessions: {},
    periodicRecords: {},
    regThresholdHours: 5,

    init: function() {
        // Load settings threshold
        const savedThreshold = localStorage.getItem('sms_school_register_hours');
        if (savedThreshold) {
            this.regThresholdHours = parseInt(savedThreshold);
        }
        
        const displayThreshold = document.getElementById('pregThresholdDisplay');
        if (displayThreshold) displayThreshold.textContent = this.regThresholdHours;

        // Set Selector to initial active student
        const selector = document.getElementById('parentChildSelect');
        if (selector) {
            this.activeStudentId = selector.value;
        }

        // Initialize state
        this.loadState();
        this.switchTab('register');
    },

    loadState: function() {
        try {
            this.sessions = JSON.parse(localStorage.getItem('sms_student_att_sessions') || '{}');
            this.periodicRecords = JSON.parse(localStorage.getItem('sms_periodic_attendance_records') || '{}');
        } catch (e) {
            this.sessions = {};
            this.periodicRecords = {};
        }
    },

    onChildChange: function(studentId) {
        this.activeStudentId = studentId;
        this.loadState();
        this.refreshActiveTab();
    },

    switchTab: function(tabId) {
        this.activeTab = tabId;

        // Visual tabs update
        ['register', 'daily', 'periodic'].forEach(t => {
            const btn = document.getElementById(`pstab-${t}`);
            const content = document.getElementById(`pscontent-${t}`);
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

        this.refreshActiveTab();
    },

    refreshActiveTab: function() {
        if (this.activeTab === 'register') {
            this.loadSchoolRegister();
        } else if (this.activeTab === 'daily') {
            this.loadDailyLogs();
        } else if (this.activeTab === 'periodic') {
            this.loadPeriodicLogs();
        }
    },

    timeToMinutes: function(t) {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    },

    // ------------------------------------------------------------------------
    // TAB 1: School Register logic
    // ------------------------------------------------------------------------
    loadSchoolRegister: function() {
        const tbody = document.getElementById('pregLogsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        let totalDays = 0;
        let morningPresents = 0;
        let afternoonPresents = 0;

        const studentId = this.activeStudentId;
        const filterDate = document.getElementById('pregDateFilter')?.value || "";

        let dates = Object.keys(this.sessions)
            .filter(k => k.endsWith(`_${studentId}`))
            .map(k => k.split('_')[0]);

        if (filterDate) {
            dates = dates.filter(d => d === filterDate);
        }

        dates.sort((a, b) => new Date(b) - new Date(a));

        dates.forEach(dateStr => {
            const sk = `${dateStr}_${studentId}`;
            const log = this.sessions[sk];

            totalDays++;
            
            // Morning present if clocked in before 12:00
            const morningPresent = log.timeIn && (this.timeToMinutes(log.timeIn) < this.timeToMinutes('12:00'));
            if (morningPresent) morningPresents++;

            // Afternoon present if they clocked out and duration in school >= threshold settings
            let afternoonPresent = false;
            if (log.timeIn && log.timeOut) {
                const minutesInSchool = this.timeToMinutes(log.timeOut) - this.timeToMinutes(log.timeIn);
                const hoursInSchool = minutesInSchool / 60;
                afternoonPresent = hoursInSchool >= this.regThresholdHours;
            }
            if (afternoonPresent) afternoonPresents++;

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td class="px-6 py-4 text-center text-lg">${morningPresent ? '✅' : '❌'}</td>
                <td class="px-6 py-4 text-center text-lg">${afternoonPresent ? '✅' : '❌'}</td>
            `;
            tbody.appendChild(tr);
        });

        // Update stats
        document.getElementById('pregTotalDays').textContent = totalDays;
        document.getElementById('pregMorningPresent').textContent = morningPresents;
        document.getElementById('pregAfternoonPresent').textContent = afternoonPresents;

        // Calc score
        const totalPossible = totalDays * 2;
        const score = totalPossible > 0 ? (((morningPresents + afternoonPresents) / totalPossible) * 100).toFixed(1) : '0.0';
        const scoreText = document.getElementById('pregScoreText');
        scoreText.textContent = `${score}%`;
        
        if (parseFloat(score) < 75) {
            scoreText.className = "text-3xl font-black text-red-600 mt-1";
        } else {
            scoreText.className = "text-3xl font-black text-green-600 mt-1";
        }
    },

    // ------------------------------------------------------------------------
    // TAB 2: Daily Biometric Logs logic (No Verify Method Column)
    // ------------------------------------------------------------------------
    loadDailyLogs: function() {
        const tbody = document.getElementById('pdailyLogsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const studentId = this.activeStudentId;
        const filterDate = document.getElementById('pdailyDateFilter')?.value || "";

        let dates = Object.keys(this.sessions)
            .filter(k => k.endsWith(`_${studentId}`))
            .map(k => k.split('_')[0]);

        if (filterDate) {
            dates = dates.filter(d => d === filterDate);
        }

        dates.sort((a, b) => new Date(b) - new Date(a));

        let lateCount = 0;
        let earlyCount = 0;

        dates.forEach(dateStr => {
            const sk = `${dateStr}_${studentId}`;
            const log = this.sessions[sk];

            let status = 'Absent';
            if (log.override) {
                status = log.override;
            } else if (log.timeIn) {
                status = 'Present';
                if (this.timeToMinutes(log.timeIn) > this.timeToMinutes('08:15')) {
                    status = 'Late';
                    lateCount++;
                }
                if (log.timeOut && this.timeToMinutes(log.timeOut) < this.timeToMinutes('14:00')) {
                    status = 'Early Out';
                    earlyCount++;
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
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${new Date(dateStr).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-center font-mono font-bold text-green-600">${log.timeIn || '—'}</td>
                <td class="px-6 py-4 text-center font-mono font-bold text-blue-600">${log.timeOut || '—'}</td>
                <td class="px-6 py-4 text-center">${badge}</td>
                <td class="px-6 py-4 text-xs">${log.remark || '—'}</td>
            `;
            tbody.appendChild(tr);
        });

        // Update stats
        document.getElementById('pdailyLateCount').textContent = lateCount;
        document.getElementById('pdailyEarlyCount').textContent = earlyCount;
        
        const totalScans = dates.length;
        const onTime = totalScans - lateCount - earlyCount;
        const rate = totalScans > 0 ? Math.round((onTime / totalScans) * 100) : 100;
        document.getElementById('pdailyPuncRate').textContent = `${rate}%`;
    },

    // ------------------------------------------------------------------------
    // TAB 3: Periodic (Subject) Attendance logic
    // ------------------------------------------------------------------------
    loadPeriodicLogs: function() {
        const studentId = this.activeStudentId;

        // Group actual records by subject
        const subjectStats = {};
        const allSubjects = new Set();

        Object.keys(this.periodicRecords).forEach(pk => {
            const parts = pk.split('_');
            if (parts.length < 5) return;
            
            const sub = parts[2];
            allSubjects.add(sub);

            const studentEntry = this.periodicRecords[pk][studentId];
            if (!studentEntry) return;

            if (!subjectStats[sub]) {
                subjectStats[sub] = { present: 0, total: 0 };
            }

            subjectStats[sub].total++;
            if (studentEntry.status === 'present') {
                subjectStats[sub].present++;
            }
        });

        // Populate dynamic Subject dropdown select for parent page
        const filterSelect = document.getElementById('psubjectSelectFilter');
        if (filterSelect) {
            // Keep first option
            while (filterSelect.options.length > 1) { filterSelect.remove(1); }
            filterSelect.options[0].text = "All Subjects";
            filterSelect.options[0].value = "";
            
            // Add other unique subjects
            Array.from(allSubjects).sort().forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                filterSelect.appendChild(opt);
            });
        }

        // Trigger change handler to update stats card & filter table logs
        this.onSubjectFilterChange();
    },

    onSubjectFilterChange: function() {
        const filterSelect = document.getElementById('psubjectSelectFilter');
        const filterSubject = filterSelect ? filterSelect.value : "";
        const studentId = this.activeStudentId;

        let totalPresent = 0;
        let totalPeriods = 0;

        if (filterSubject) {
            // Compute stats for the single selected subject
            Object.keys(this.periodicRecords).forEach(pk => {
                const parts = pk.split('_');
                if (parts.length < 5) return;
                if (parts[2] !== filterSubject) return;

                const studentEntry = this.periodicRecords[pk][studentId];
                if (!studentEntry) return;

                totalPeriods++;
                if (studentEntry.status === 'present') {
                    totalPresent++;
                }
            });
        } else {
            // Compute combined stats across all subjects
            Object.keys(this.periodicRecords).forEach(pk => {
                const parts = pk.split('_');
                if (parts.length < 5) return;

                const studentEntry = this.periodicRecords[pk][studentId];
                if (!studentEntry) return;

                totalPeriods++;
                if (studentEntry.status === 'present') {
                    totalPresent++;
                }
            });
        }

        const totalAbsent = totalPeriods - totalPresent;
        const rate = totalPeriods > 0 ? Math.round((totalPresent / totalPeriods) * 100) : 0;

        // Update stats card UI elements for parent
        const nameEl = document.getElementById('pstatSubjectName');
        const rateEl = document.getElementById('pstatSubjectRate');
        const progressEl = document.getElementById('pstatSubjectProgressBar');
        const presentEl = document.getElementById('pstatSubjectPresent');
        const absentEl = document.getElementById('pstatSubjectAbsent');

        if (nameEl) nameEl.textContent = filterSubject || "All Subjects";
        if (rateEl) rateEl.textContent = `${rate}%`;
        if (progressEl) {
            progressEl.style.width = `${rate}%`;
            // Color coding based on attendance rate
            if (rate < 75) {
                progressEl.className = "bg-red-500 h-2 rounded-full";
                if (rateEl) rateEl.className = "text-sm font-bold text-red-500";
            } else {
                progressEl.className = "bg-primary-600 h-2 rounded-full";
                if (rateEl) rateEl.className = "text-sm font-bold text-primary-600";
            }
        }
        if (presentEl) presentEl.textContent = `${totalPresent} / ${totalPeriods}`;
        if (absentEl) absentEl.textContent = totalAbsent;

        // Trigger log table update
        this.filterSubjectLogs();
    },

    filterSubjectLogs: function() {
        const filterSelect = document.getElementById('psubjectSelectFilter');
        const filterSubject = filterSelect ? filterSelect.value : "";
        const filterStatusSelect = document.getElementById('psubjectFilterSelect');
        const filterStatus = filterStatusSelect ? filterStatusSelect.value : "";
        const filterDate = document.getElementById('pperiodicDateFilter')?.value || "";
        const tbody = document.getElementById('pperiodicLogsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const studentId = this.activeStudentId;
        let allLogs = [];

        Object.keys(this.periodicRecords).forEach(pk => {
            const parts = pk.split('_');
            if (parts.length < 5) return;
            
            const sub = parts[2];
            const studentEntry = this.periodicRecords[pk][studentId];
            if (!studentEntry) return;

            allLogs.push({
                date: parts[3],
                period: parts[4],
                subject: sub,
                status: studentEntry.status,
                remark: studentEntry.remark
            });
        });

        // Sort descending
        allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Filter
        let filteredLogs = allLogs;
        if (filterSubject) {
            filteredLogs = filteredLogs.filter(l => l.subject === filterSubject);
        }
        if (filterStatus) {
            filteredLogs = filteredLogs.filter(l => l.status === filterStatus);
        }
        if (filterDate) {
            filteredLogs = filteredLogs.filter(l => l.date === filterDate);
        }

        if (filteredLogs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No subject period registers matched. Selected: ${filterSubject || 'All Subjects'}</td></tr>`;
            return;
        }

        filteredLogs.forEach(l => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${new Date(l.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 font-bold text-xs">${l.period}</td>
                <td class="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">${l.subject}</td>
                <td class="px-6 py-4 text-center text-lg">${l.status === 'present' ? '✅' : '❌'}</td>
                <td class="px-6 py-4 text-xs">${l.remark || '—'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};

// Auto Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.parentAttendanceController.init());
} else {
    window.parentAttendanceController.init();
}
