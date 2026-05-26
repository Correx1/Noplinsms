(function() {
    console.log('Student Attendance Script Loaded');

    const SESSIONS_KEY = 'sms_student_att_sessions';
    let forcedScanDirection = null; // null = auto, 'in' = force clock-in, 'out' = force clock-out

    // ── DOM refs ───────────────────────────────────────────────────────────
    const dateInput   = document.getElementById('attendance-date');
    const dateDisplay = document.getElementById('current-date-display');
    const form        = document.getElementById('attendance-filter-form');
    const tableBody   = document.getElementById('attendance-table-body');
    const container   = document.getElementById('attendance-container');

    const today = new Date().toISOString().split('T')[0];
    if (dateInput)   dateInput.value = today;
    if (dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // ── Helpers ────────────────────────────────────────────────────────────
    function getSessions() {
        try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}'); } catch(e) { return {}; }
    }
    function saveSessions(s) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)); }
    function sessionKey(date, id) { return `${date}_${id}`; }

    function getSchedule() {
        try {
            const cfg = JSON.parse(localStorage.getItem('sms_attendance_config') || '{}');
            return cfg.student || { startTime: '07:00', lateThreshold: '08:15', expectedOut: '14:00' };
        } catch(e) { return { startTime: '07:00', lateThreshold: '08:15', expectedOut: '14:00' }; }
    }

    function timeToMin(t) {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }

    function computeStatus(timeIn, timeOut, schedule, override) {
        if (override === 'Absent') return 'Absent';
        if (override === 'Leave')  return 'Leave';
        if (!timeIn) return 'Absent';
        if (timeToMin(timeIn) > timeToMin(schedule.lateThreshold || '08:15')) return 'Late';
        if (timeOut && timeToMin(timeOut) < timeToMin(schedule.expectedOut || '14:00')) return 'Early Out';
        return 'Present';
    }

    function statusBadge(status) {
        const map = {
            'Present':   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'Late':      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
            'Absent':    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            'Leave':     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            'Early Out': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        };
        return `<span class="px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}">${status || 'Absent'}</span>`;
    }

    function applyRowColor(row, status) {
        row.classList.remove('bg-green-50','dark:bg-green-900/10','bg-yellow-50','dark:bg-yellow-900/10','bg-red-50','dark:bg-red-900/10','bg-purple-50','dark:bg-purple-900/10','bg-blue-50','dark:bg-blue-900/10');
        const m = { Present: ['bg-green-50','dark:bg-green-900/10'], Late: ['bg-yellow-50','dark:bg-yellow-900/10'], Absent: ['bg-red-50','dark:bg-red-900/10'], Leave: ['bg-purple-50','dark:bg-purple-900/10'], 'Early Out': ['bg-blue-50','dark:bg-blue-900/10'] };
        if (m[status]) row.classList.add(...m[status]);
    }

    // ── Row builder ────────────────────────────────────────────────────────
    function buildRow(item, date) {
        const sessions = getSessions();
        const schedule = getSchedule();
        const sk       = sessionKey(date, item.id);
        const session  = sessions[sk] || { timeIn: '', timeOut: '', override: '' };
        const override = session.override || '';
        const status   = computeStatus(session.timeIn, session.timeOut, schedule, override);

        const tr = document.createElement('tr');
        tr.id        = `student-row-${item.id}`;
        tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer';
        tr.innerHTML = `
            <td class="px-4 py-3" onclick="event.stopPropagation()">
                <input type="checkbox" class="student-row-check w-4 h-4 text-primary-600 rounded cursor-pointer"
                    data-id="${item.id}" onchange="window._onStudentCheckChange()">
            </td>
            <td class="px-4 py-3 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">${item.id}</td>
            <td class="px-4 py-3">
                <img class="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" src="${item.photo || 'assets/img/default-avatar.png'}" alt="">
            </td>
            <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">${item.name}</td>
            <td class="px-4 py-3 text-center">
                <span id="in-${item.id}" class="text-sm font-mono font-bold ${session.timeIn ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}">${session.timeIn || '—'}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <span id="out-${item.id}" class="text-sm font-mono font-bold ${session.timeOut ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}">${session.timeOut || '—'}</span>
            </td>
            <td class="px-4 py-3 text-center" id="status-cell-${item.id}">${statusBadge(status)}</td>
            <td class="px-4 py-3">
                <input type="text" id="remark-${item.id}" value="${session.remark || ''}"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Remarks..." onclick="event.stopPropagation()">
            </td>
        `;
        // Click row to toggle checkbox
        tr.addEventListener('click', () => {
            const cb = tr.querySelector('.student-row-check');
            if (cb) { cb.checked = !cb.checked; window._onStudentCheckChange(); }
        });
        applyRowColor(tr, status);
        return tr;
    }

    // ── Update a single row's display from session data ────────────────────
    function updateRowDisplay(id, session) {
        const schedule = getSchedule();
        const status   = computeStatus(session.timeIn, session.timeOut, schedule, session.override || '');

        const inEl      = document.getElementById(`in-${id}`);
        const outEl     = document.getElementById(`out-${id}`);
        const statusCell= document.getElementById(`status-cell-${id}`);
        const row       = document.getElementById(`student-row-${id}`);

        if (inEl) {
            inEl.textContent = session.timeIn || '—';
            inEl.className = `text-sm font-mono font-bold ${session.timeIn ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`;
        }
        if (outEl) {
            outEl.textContent = session.timeOut || '—';
            outEl.className = `text-sm font-mono font-bold ${session.timeOut ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}`;
        }
        if (statusCell) statusCell.innerHTML = statusBadge(status);
        if (row) applyRowColor(row, status);
    }

    // ── Selection helpers ──────────────────────────────────────────────────
    function getSelectedIds() {
        return [...document.querySelectorAll('.student-row-check:checked')].map(cb => cb.dataset.id);
    }

    window._onStudentCheckChange = function() {
        const ids        = getSelectedIds();
        const count      = ids.length;
        const selBar     = document.getElementById('student-selection-bar');
        const countEl    = document.getElementById('student-selected-count');
        const allCb      = document.getElementById('select-all-students');

        if (selBar)  selBar.classList.toggle('hidden', count === 0);
        if (countEl) countEl.textContent = count;
        if (allCb) {
            const total = document.querySelectorAll('.student-row-check').length;
            allCb.checked       = count === total && total > 0;
            allCb.indeterminate = count > 0 && count < total;
        }
        hideNotice();
    };

    window.selectAllStudents = function(checked) {
        document.querySelectorAll('.student-row-check').forEach(cb => cb.checked = checked);
        window._onStudentCheckChange();
    };

    function requireSelection() {
        const ids = getSelectedIds();
        if (!ids.length) { showNotice(); return null; }
        hideNotice();
        return ids;
    }

    function showNotice() {
        const el = document.getElementById('student-no-selection-notice');
        if (el) { el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 3000); }
    }
    function hideNotice() {
        const el = document.getElementById('student-no-selection-notice');
        if (el) el.classList.add('hidden');
    }

    // ── Bulk action: Set As Clock-In Now → triggers scanner (NFC + biometric required) ──
    window.setAsStudentClockIn = function() {
        forcedScanDirection = 'in';
        window.startAttendanceNFC();
    };

    // ── Bulk action: Set As Clock-Out Now → triggers scanner (NFC + biometric required) ──
    window.setAsStudentClockOut = function() {
        forcedScanDirection = 'out';
        window.startAttendanceNFC();
    };

    // ── Bulk action: Mark As Absent / Leave (selected rows, no scan needed) ─
    window.markStudentAs = function(status) {
        const ids = requireSelection();
        if (!ids) return;
        const sessions = getSessions();
        ids.forEach(id => {
            const sk = sessionKey(currentDate, id);
            const session = sessions[sk] || {};
            session.timeIn   = '';
            session.timeOut  = '';
            session.override = status;
            sessions[sk] = session;
            updateRowDisplay(id, session);
        });
        saveSessions(sessions);
    };

    // ── Reset today's session data ─────────────────────────────────────────
    window.resetTodayAttendance = function() {
        if (!confirm(`Clear ALL attendance data for ${currentDate}? This cannot be undone.`)) return;
        const sessions = getSessions();
        const prefix   = currentDate + '_';
        Object.keys(sessions).forEach(k => { if (k.startsWith(prefix)) delete sessions[k]; });
        saveSessions(sessions);
        renderRows(studentsData); // re-render with empty sessions
    };

    let currentDate  = today;
    let studentsData = [];

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            currentDate = dateInput ? dateInput.value : today;
            container.classList.remove('hidden');
            tableBody.innerHTML = '<tr><td colspan="8" class="p-6 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary-600"></i></td></tr>';
            setTimeout(loadStudents, 400);
        });
    }

    function loadStudents() {
        const selectedClass   = document.getElementById('class-select')?.value   || '';
        const selectedSection = document.getElementById('section-select')?.value || '';
        const checkDb = setInterval(() => {
            if (window.SchoolDatabase) {
                clearInterval(checkDb);
                let data = window.SchoolDatabase.students || [];
                if (selectedClass)   data = data.filter(s => s.class   === selectedClass);
                if (selectedSection) data = data.filter(s => s.section === selectedSection);
                studentsData = data;
                renderRows(data);
            }
        }, 50);
    }

    function renderRows(items) {
        tableBody.innerHTML = '';
        if (!items.length) {
            tableBody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-gray-500">No students found.</td></tr>';
            return;
        }
        items.forEach(item => tableBody.appendChild(buildRow(item, currentDate)));
        window._onStudentCheckChange(); // reset selection bar
    }

    // ── Save ───────────────────────────────────────────────────────────────
    window.saveAttendance = function(print = false) {
        // Flush remarks to sessions
        const sessions = getSessions();
        studentsData.forEach(item => {
            const sk = sessionKey(currentDate, item.id);
            const session = sessions[sk] || {};
            const remarkEl = document.getElementById(`remark-${item.id}`);
            if (remarkEl) session.remark = remarkEl.value;
            sessions[sk] = session;
        });
        saveSessions(sessions);
        const toast = document.getElementById('toast-attendance');
        if (toast) { toast.classList.remove('hidden'); setTimeout(() => { toast.classList.add('hidden'); if (print) window.print(); }, 2000); }
    };

    // ── NFC / SmartScanner ─────────────────────────────────────────────────
    let nfcConfig    = { nfc: true, bio: true };
    let isScanning   = false;

    (function initNFC() {
        try {
            const raw = localStorage.getItem('sms_nfc_config');
            nfcConfig = raw ? (JSON.parse(raw).studentAttendance || { nfc: true, bio: true }) : { nfc: true, bio: true };
        } catch(e) {}
        const btn = document.getElementById('student-nfc-btn');
        if (!btn) return;
        btn.classList.remove('hidden');
        btn.classList.add('inline-flex');
        const bothOff = !nfcConfig.nfc && !nfcConfig.bio;
        btn.disabled = bothOff;
        btn.classList.toggle('opacity-50', bothOff);
        btn.classList.toggle('cursor-not-allowed', bothOff);
        btn.title = bothOff ? 'NFC & Biometric both disabled in settings' : '';
    })();

    window.startAttendanceNFC = function() {
        const btn = document.getElementById('student-nfc-btn');
        if (!btn) return;

        if (isScanning) {
            isScanning = false;
            btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Card';
            btn.classList.remove('bg-green-100','text-green-600','border-green-300','animate-pulse');
            if (window.SmartScanner) window.SmartScanner.stop();
            return;
        }

        isScanning = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Scanning...';
        btn.classList.add('bg-green-100','text-green-600','border-green-300','animate-pulse');

        if (window.SmartScanner) {
            window.SmartScanner.start({
                requireNFC:       nfcConfig.nfc,
                requireBiometric: nfcConfig.bio,
                onSuccess: (id)  => handleScan(id),
                onFail: ()       => resetScanBtn()
            });
        }
    };

    function resetScanBtn() {
        isScanning = false;
        const btn = document.getElementById('student-nfc-btn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Card';
            btn.classList.remove('bg-green-100','text-green-600','border-green-300','animate-pulse');
        }
    }

    async function handleScan(scannedId) {
        resetScanBtn();
        if (container) container.classList.remove('hidden');

        // Ensure student data is loaded
        if (!studentsData.length) {
            while (!window.SchoolDatabase) await new Promise(r => setTimeout(r, 50));
            studentsData = window.SchoolDatabase.students || [];
        }

        const student  = studentsData.find(s => s.id === scannedId);
        const schedule = getSchedule();
        const sessions = getSessions();
        const sk       = sessionKey(currentDate, scannedId);
        const now      = new Date().toTimeString().slice(0, 5);

        let session   = sessions[sk] || { timeIn: '', timeOut: '', override: '' };
        let direction;

        // NFC scan respects forced direction (from Set As Clock-In/Out buttons)
        if (forcedScanDirection === 'in') {
            session.timeIn   = now;
            session.override = '';
            direction = 'in';
        } else if (forcedScanDirection === 'out') {
            session.timeOut  = now;
            session.override = '';
            direction = 'out';
        } else if (!session.timeIn) {
            session.timeIn   = now;
            session.override = '';
            direction = 'in';
        } else if (!session.timeOut) {
            session.timeOut  = now;
            session.override = '';
            direction = 'out';
        } else {
            direction = 'done';
        }
        forcedScanDirection = null; // always reset after one scan

        session.status = computeStatus(session.timeIn, session.timeOut, schedule, '');
        sessions[sk]   = session;
        saveSessions(sessions);

        // Ensure row is in the table
        let row = document.getElementById(`student-row-${scannedId}`);
        if (!row && student) {
            if (!studentsData.find(s => s.id === scannedId)) studentsData.push(student);
            const newRow = buildRow(student, currentDate);
            tableBody.insertBefore(newRow, tableBody.firstChild);
            row = newRow;
        } else {
            updateRowDisplay(scannedId, session);
        }

        showBanner(student, direction, session, now);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showBanner(student, direction, session, time) {
        const banner = document.getElementById('student-scan-banner');
        if (!banner) return;
        const config = {
            in:   { icon: '🟢', label: 'CLOCKED IN',   border: 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-800' },
            out:  { icon: '🔵', label: 'CLOCKED OUT',  border: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800' },
            done: { icon: '⚪', label: 'ALREADY DONE', border: 'border-gray-300 bg-gray-50 dark:bg-gray-700/40 dark:border-gray-600' },
        };
        const c    = config[direction] || config.done;
        const name = student ? student.name : `ID: ${session.id || '?'}`;
        banner.className = `mb-4 p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${c.border}`;
        banner.innerHTML = `
            <div class="text-3xl">${c.icon}</div>
            <div class="flex-1">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">${c.label}</p>
                <p class="text-lg font-black text-gray-900 dark:text-white">${name}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">${time} &nbsp;·&nbsp; ${statusBadge(session.status || 'Absent')}</p>
            </div>
            <div class="text-right text-xs text-gray-400 leading-6">
                Clock-In: <strong class="text-green-600">${session.timeIn || '—'}</strong><br>
                Clock-Out: <strong class="text-blue-600">${session.timeOut || '—'}</strong>
            </div>`;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 7000);
    }

})();
