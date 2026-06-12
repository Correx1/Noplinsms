(function() {
    // === Tab Logic ===
    window.switchSettingsTab = function(tabId) {
        document.querySelectorAll('#settings-tabs button').forEach(btn => {
            btn.classList.remove('text-primary-600', 'border-primary-600', 'active-tab-btn');
            btn.classList.add('border-transparent');
            if(btn.id === `${tabId}-tab`) {
                btn.classList.add('text-primary-600', 'border-primary-600', 'active-tab-btn');
                btn.classList.remove('border-transparent');
            }
        });
        document.querySelectorAll('#settings-content > div').forEach(div => div.classList.add('hidden'));
        document.getElementById(tabId).classList.remove('hidden');
    };

    // === Backup Logic ===
    window.createBackup = function() {
        const btn = document.querySelector('button[onclick="createBackup()"]');
        const progress = document.getElementById('backup-progress');
        const bar = progress.querySelector('div');
        btn.disabled = true;
        progress.classList.remove('hidden');
        let width = 0;
        const interval = setInterval(() => {
            width += 10;
            bar.style.width = width + '%';
            if(width >= 100) {
                clearInterval(interval);
                btn.disabled = false;
                progress.classList.add('hidden');
                const tbody = document.getElementById('backup-history-body');
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4">${new Date().toLocaleString()}</td>
                    <td class="px-6 py-4">backup_${Date.now()}.sql</td>
                    <td class="px-6 py-4">3.1 MB</td>
                    <td class="px-6 py-4"><a href="#" class="text-primary-600 hover:underline">Download</a></td>
                `;
                tbody.prepend(tr);
                showToast('Backup created successfully!');
            }
        }, 300);
    };

    // === Messages ===
    window.testEmail = function() {
        const originalText = event.target.textContent;
        event.target.textContent = 'Sending...';
        setTimeout(() => { showToast('Test Email sent successfully!'); event.target.textContent = originalText; }, 1500);
    };
    window.testSMS = function() {
        const originalText = event.target.textContent;
        event.target.textContent = 'Sending...';
        setTimeout(() => { showToast('Test SMS sent successfully!'); event.target.textContent = originalText; }, 1500);
    };

    function showToast(msg) {
        const toast = document.getElementById('toast-settings');
        if (toast) {
            toast.querySelector('.font-normal').textContent = msg;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        } else if (typeof window.showToast === 'function') {
            window.showToast('Settings', msg, 'success');
        }
    }

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Settings saved successfully!');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // NFC & BIOMETRIC SETTINGS  (used by settings/nfc.html)
    // ══════════════════════════════════════════════════════════════════
    const DEFAULT_NFC_CONFIG = {
        studentAttendance: { nfc: true, bio: true },
        staffAttendance:   { nfc: true, bio: true },
        hostelAttendance:  { nfc: true, bio: true },
        library:           { nfc: true, bio: true },
        discipline:        { nfc: true, bio: true },
        bursary:           { nfc: true, bio: false }
    };
    const DEFAULT_ATT_SCHED = {
        student: { startTime: '07:00', lateThreshold: '08:15' },
        staff:   { startTime: '06:30', lateThreshold: '07:45' }
    };

    window.loadNFCSettings = function() {
        const cfg = JSON.parse(localStorage.getItem('sms_nfc_config') || 'null') || DEFAULT_NFC_CONFIG;
        const set = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };
        set('nfc-student-attendance', cfg.studentAttendance.nfc);
        set('bio-student-attendance', cfg.studentAttendance.bio);
        set('nfc-staff-attendance',   cfg.staffAttendance.nfc);
        set('bio-staff-attendance',   cfg.staffAttendance.bio);
        set('nfc-hostel-attendance',  (cfg.hostelAttendance || DEFAULT_NFC_CONFIG.hostelAttendance).nfc);
        set('bio-hostel-attendance',  (cfg.hostelAttendance || DEFAULT_NFC_CONFIG.hostelAttendance).bio);
        set('nfc-library',            cfg.library.nfc);
        set('bio-library',            cfg.library.bio);
        set('nfc-discipline',         cfg.discipline.nfc);
        set('bio-discipline',         cfg.discipline.bio);
        set('nfc-bursary',            cfg.bursary.nfc);

        const sched = JSON.parse(localStorage.getItem('sms_attendance_config') || 'null') || DEFAULT_ATT_SCHED;
        const setV = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        setV('student-start-time', sched.student.startTime);
        setV('student-late-time',  sched.student.lateThreshold);
        setV('student-out-time',   sched.student.expectedOut || '14:00');
        setV('student-register-hours', localStorage.getItem('sms_school_register_hours') || '5');
        setV('staff-start-time',   sched.staff.startTime);
        setV('staff-late-time',    sched.staff.lateThreshold);
    };

    window.saveNFCSettings = function() {
        const chk = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
        const cfg = {
            studentAttendance: { nfc: chk('nfc-student-attendance'), bio: chk('bio-student-attendance') },
            staffAttendance:   { nfc: chk('nfc-staff-attendance'),   bio: chk('bio-staff-attendance') },
            hostelAttendance:  { nfc: chk('nfc-hostel-attendance'),  bio: chk('bio-hostel-attendance') },
            library:           { nfc: chk('nfc-library'),            bio: chk('bio-library') },
            discipline:        { nfc: chk('nfc-discipline'),         bio: chk('bio-discipline') },
            bursary:           { nfc: chk('nfc-bursary'),            bio: false }
        };
        localStorage.setItem('sms_nfc_config', JSON.stringify(cfg));
        showToast('Settings saved');
    };

    window.saveAttendanceSchedule = function() {
        const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
        const sched = {
            student: { startTime: val('student-start-time'), lateThreshold: val('student-late-time'), expectedOut: val('student-out-time') || '14:00' },
            staff:   { startTime: val('staff-start-time'),   lateThreshold: val('staff-late-time'),   expectedOut: val('staff-out-time')    || '15:00' }
        };
        localStorage.setItem('sms_attendance_config', JSON.stringify(sched));
        localStorage.setItem('sms_school_register_hours', val('student-register-hours') || '5');
        showToast('Settings saved');
    };

    // Auto-load NFC settings if the nfc page elements exist
    if (document.getElementById('nfc-student-attendance')) {
        window.loadNFCSettings();
    }

    // Init (only if general tab exists on current page)
    if (document.getElementById('general')) switchSettingsTab('general');

})();
