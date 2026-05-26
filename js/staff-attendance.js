(function() {
    console.log('Staff Attendance Script Loaded');

    const SESSIONS_KEY = 'sms_staff_att_sessions';
    let forcedScanDirection = null;

    const dateInput   = document.getElementById('staff-att-date');
    const dateDisplay = document.getElementById('current-date-display');
    const form        = document.getElementById('staff-attendance-filter-form');
    const tableBody   = document.getElementById('staff-table-body');
    const container   = document.getElementById('staff-attendance-container');

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
            return cfg.staff || { startTime: '06:30', lateThreshold: '07:45', expectedOut: '15:00' };
        } catch(e) { return { startTime: '06:30', lateThreshold: '07:45', expectedOut: '15:00' }; }
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
        if (timeToMin(timeIn) > timeToMin(schedule.lateThreshold || '07:45')) return 'Late';
        if (timeOut && timeToMin(timeOut) < timeToMin(schedule.expectedOut || '15:00')) return 'Early Out';
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
        tr.id        = `staff-row-${item.id}`;
        tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer';
        tr.innerHTML = `
            <td class="px-4 py-3" onclick="event.stopPropagation()">
                <input type="checkbox" class="staff-row-check w-4 h-4 text-primary-600 rounded cursor-pointer"
                    data-id="${item.id}" onchange="window._onStaffCheckChange()">
            </td>
            <td class="px-4 py-3 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">${item.id}</td>
            <td class="px-4 py-3">
                <img class="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" src="${item.photo || 'assets/img/default-avatar.png'}" alt="">
            </td>
            <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">${item.name}</td>
            <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">${item.subject || item.dept || 'N/A'}</td>
            <td class="px-4 py-3 text-center">
                <span id="sin-${item.id}" class="text-sm font-mono font-bold ${session.timeIn ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}">${session.timeIn || '—'}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <span id="sout-${item.id}" class="text-sm font-mono font-bold ${session.timeOut ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}">${session.timeOut || '—'}</span>
            </td>
            <td class="px-4 py-3 text-center" id="sstatus-cell-${item.id}">${statusBadge(status)}</td>
            <td class="px-4 py-3">
                <input type="text" id="sremark-${item.id}" value="${session.remark || ''}"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Remarks..." onclick="event.stopPropagation()">
            </td>
        `;
        tr.addEventListener('click', () => {
            const cb = tr.querySelector('.staff-row-check');
            if (cb) { cb.checked = !cb.checked; window._onStaffCheckChange(); }
        });
        applyRowColor(tr, status);
        return tr;
    }

    // ── Update single row display ──────────────────────────────────────────
    function updateRowDisplay(id, session) {
        const schedule   = getSchedule();
        const status     = computeStatus(session.timeIn, session.timeOut, schedule, session.override || '');
        const inEl       = document.getElementById(`sin-${id}`);
        const outEl      = document.getElementById(`sout-${id}`);
        const statusCell = document.getElementById(`sstatus-cell-${id}`);
        const row        = document.getElementById(`staff-row-${id}`);

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
        return [...document.querySelectorAll('.staff-row-check:checked')].map(cb => cb.dataset.id);
    }

    window._onStaffCheckChange = function() {
        const ids    = getSelectedIds();
        const count  = ids.length;
        const selBar = document.getElementById('staff-selection-bar');
        const cntEl  = document.getElementById('staff-selected-count');
        const allCb  = document.getElementById('select-all-staff');

        if (selBar) selBar.classList.toggle('hidden', count === 0);
        if (cntEl)  cntEl.textContent = count;
        if (allCb) {
            const total = document.querySelectorAll('.staff-row-check').length;
            allCb.checked       = count === total && total > 0;
            allCb.indeterminate = count > 0 && count < total;
        }
        hideNotice();
    };

    window.selectAllStaff = function(checked) {
        document.querySelectorAll('.staff-row-check').forEach(cb => cb.checked = checked);
        window._onStaffCheckChange();
    };

    function requireSelection() {
        const ids = getSelectedIds();
        if (!ids.length) { showNotice(); return null; }
        hideNotice();
        return ids;
    }

    function showNotice() {
        const el = document.getElementById('staff-no-selection-notice');
        if (el) { el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 3000); }
    }
    function hideNotice() {
        const el = document.getElementById('staff-no-selection-notice');
        if (el) el.classList.add('hidden');
    }

    // ── Bulk actions (selected rows only) ─────────────────────────────────
    window.setAsStaffClockIn = function() {
        forcedScanDirection = 'in';
        window.startStaffNFC();
    };

    window.setAsStaffClockOut = function() {
        forcedScanDirection = 'out';
        window.startStaffNFC();
    };

    window.resetTodayStaffAttendance = function() {
        if (!confirm('Clear ALL staff attendance for ' + currentDate + '?')) return;
        const sessions = getSessions();
        const prefix   = currentDate + '_';
        Object.keys(sessions).forEach(k => { if (k.startsWith(prefix)) delete sessions[k]; });
        saveSessions(sessions);
        renderRows(staffData);
    };

    window.markStaffAs = function(status) {
        const ids = requireSelection();
        if (!ids) return;
        const sessions = getSessions();
        ids.forEach(id => {
            const sk = sessionKey(currentDate, id);
            const session = sessions[sk] || {};
            session.timeIn = ''; session.timeOut = ''; session.override = status;
            sessions[sk] = session;
            updateRowDisplay(id, session);
        });
        saveSessions(sessions);
    };

    // ── Load / Render ──────────────────────────────────────────────────────
    let currentDate = today;
    let staffData   = [];

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            currentDate = dateInput ? dateInput.value : today;
            container.classList.remove('hidden');
            tableBody.innerHTML = '<tr><td colspan="9" class="p-6 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary-600"></i></td></tr>';
            setTimeout(loadStaff, 400);
        });
    }

    function loadStaff() {
        const checkDb = setInterval(() => {
            if (window.SchoolDatabase) {
                clearInterval(checkDb);
                staffData = window.SchoolDatabase.staff || [];
                renderRows(staffData);
            }
        }, 50);
    }

    function renderRows(items) {
        tableBody.innerHTML = '';
        if (!items.length) {
            tableBody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-gray-500">No staff found.</td></tr>';
            return;
        }
        items.forEach(item => tableBody.appendChild(buildRow(item, currentDate)));
        window._onStaffCheckChange();
    }

    // ── Save ───────────────────────────────────────────────────────────────
    window.saveStaffAttendance = function(print = false) {
        const sessions = getSessions();
        staffData.forEach(item => {
            const sk = sessionKey(currentDate, item.id);
            const session = sessions[sk] || {};
            const remarkEl = document.getElementById(`sremark-${item.id}`);
            if (remarkEl) session.remark = remarkEl.value;
            sessions[sk] = session;
        });
        saveSessions(sessions);
        const toast = document.getElementById('toast-staff-attendance');
        if (toast) { toast.classList.remove('hidden'); setTimeout(() => { toast.classList.add('hidden'); if (print) window.print(); }, 2000); }
    };

    // ── NFC / SmartScanner ─────────────────────────────────────────────────
    let staffNfcConfig = { nfc: true, bio: true };
    let isStaffScanning = false;

    (function initNFC() {
        try {
            const raw = localStorage.getItem('sms_nfc_config');
            staffNfcConfig = raw ? (JSON.parse(raw).staffAttendance || { nfc: true, bio: true }) : { nfc: true, bio: true };
        } catch(e) {}
        const btn = document.getElementById('staff-nfc-btn');
        if (!btn) return;
        btn.classList.remove('hidden');
        btn.classList.add('inline-flex');
        const bothOff = !staffNfcConfig.nfc && !staffNfcConfig.bio;
        btn.disabled = bothOff;
        btn.classList.toggle('opacity-50', bothOff);
        btn.classList.toggle('cursor-not-allowed', bothOff);
        btn.title = bothOff ? 'NFC & Biometric both disabled in settings' : '';
    })();

    window.startStaffNFC = function() {
        const btn = document.getElementById('staff-nfc-btn');
        if (!btn) return;
        if (isStaffScanning) {
            isStaffScanning = false;
            btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Card';
            btn.classList.remove('bg-green-100','text-green-600','border-green-300','animate-pulse');
            if (window.SmartScanner) window.SmartScanner.stop();
            return;
        }
        isStaffScanning = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Scanning...';
        btn.classList.add('bg-green-100','text-green-600','border-green-300','animate-pulse');
        if (window.SmartScanner) {
            window.SmartScanner.start({
                requireNFC:       staffNfcConfig.nfc,
                requireBiometric: staffNfcConfig.bio,
                onSuccess: (id)  => handleStaffScan(id),
                onFail:    ()    => resetBtn()
            });
        }
    };

    function resetBtn() {
        isStaffScanning = false;
        const btn = document.getElementById('staff-nfc-btn');
        if (btn) { btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Card'; btn.classList.remove('bg-green-100','text-green-600','border-green-300','animate-pulse'); }
    }

    async function handleStaffScan(scannedId) {
        resetBtn();
        if (container) container.classList.remove('hidden');

        if (!staffData.length) {
            while (!window.SchoolDatabase) await new Promise(r => setTimeout(r, 50));
            staffData = window.SchoolDatabase.staff || [];
        }

        const staff    = staffData.find(s => s.id === scannedId);
        const schedule = getSchedule();
        const sessions = getSessions();
        const sk       = sessionKey(currentDate, scannedId);
        const now      = new Date().toTimeString().slice(0, 5);

        let session   = sessions[sk] || { timeIn: '', timeOut: '', override: '' };
        let direction;

        // Clock-out enforces same SmartScanner authentication as clock-in
        // forcedScanDirection lets the Set As Clock-In/Out buttons force direction
        if (forcedScanDirection === 'in') {
            session.timeIn   = now;
            session.override = '';
            direction = 'in';
        } else if (forcedScanDirection === 'out') {
            session.timeOut  = now;
            session.override = '';
            direction = 'out';
        } else if (!session.timeIn) {
            session.timeIn = now; session.override = ''; direction = 'in';
        } else if (!session.timeOut) {
            session.timeOut = now; session.override = ''; direction = 'out';
        } else {
            direction = 'done';
        }
        forcedScanDirection = null;

        session.status = computeStatus(session.timeIn, session.timeOut, schedule, '');
        sessions[sk]   = session;
        saveSessions(sessions);

        let row = document.getElementById(`staff-row-${scannedId}`);
        if (!row && staff) {
            if (!staffData.find(s => s.id === scannedId)) staffData.push(staff);
            const newRow = buildRow(staff, currentDate);
            tableBody.insertBefore(newRow, tableBody.firstChild);
            row = newRow;
        } else {
            updateRowDisplay(scannedId, session);
        }

        showBanner(staff, direction, session, now);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showBanner(staff, direction, session, time) {
        const banner = document.getElementById('staff-scan-banner');
        if (!banner) return;
        const config = {
            in:   { icon: '🟢', label: 'CLOCKED IN',   border: 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-800' },
            out:  { icon: '🔵', label: 'CLOCKED OUT',  border: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800' },
            done: { icon: '⚪', label: 'ALREADY DONE', border: 'border-gray-300 bg-gray-50 dark:bg-gray-700/40 dark:border-gray-600' },
        };
        const c    = config[direction] || config.done;
        const name = staff ? staff.name : `ID: ?`;
        banner.className = `mb-4 p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${c.border}`;
        banner.innerHTML = `
            <div class="text-3xl">${c.icon}</div>
            <div class="flex-1">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">${c.label}</p>
                <p class="text-lg font-black text-gray-900 dark:text-white">${name}</p>
                <p class="text-sm text-gray-500">${time} &nbsp;·&nbsp; ${statusBadge(session.status || 'Absent')}</p>
            </div>
            <div class="text-right text-xs text-gray-400 leading-6">
                Clock-In: <strong class="text-green-600">${session.timeIn  || '—'}</strong><br>
                Clock-Out: <strong class="text-blue-600">${session.timeOut || '—'}</strong>
            </div>`;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 7000);
    }

})();
