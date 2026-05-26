// NFC Smart Scanner Core Script — Mode routing, Keyboard Wedge Interceptor, Web NFC mobile API, and Web Audio Synths
(function() {
    let currentMode = 'gate'; // Options: gate, library, bursar, disciplinary
    let allStudents = [];
    let isSoundOn = true;
    let recentScans = []; // Ledger scan sessions
    
    // Wedge input interceptor buffer
    let wedgeBuffer = "";
    let wedgeTimeout = null;

    // Web Audio Synthesizer chimes for feedback chimes (No external assets required!)
    const SoundEffects = {
        playSuccess() {
            if (!isSoundOn) return;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Low pleasant fundamental note
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc1.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12); // A5
                
                gain1.gain.setValueAtTime(0.15, ctx.currentTime);
                gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start();
                osc1.stop(ctx.currentTime + 0.35);
            } catch (e) {
                console.warn("Audio Context failed to start:", e);
            }
        },

        playError() {
            if (!isSoundOn) return;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Harsh dual detuned square wave buzz
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc1.type = 'sawtooth';
                osc2.type = 'sawtooth';
                
                osc1.frequency.setValueAtTime(150, ctx.currentTime);
                osc2.frequency.setValueAtTime(155, ctx.currentTime);
                
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                
                osc1.start();
                osc2.start();
                osc1.stop(ctx.currentTime + 0.45);
                osc2.stop(ctx.currentTime + 0.45);
            } catch (e) {
                console.warn("Audio Context failed to start:", e);
            }
        }
    };

    function loadDatabase() {
        const poll = setInterval(() => {
            if (!window.SchoolDatabase) return;
            clearInterval(poll);
            const students = (window.SchoolDatabase.students || []).map(s => ({
                ...s, nfc_uid: s.id, className: s.class + (s.section ? ' ' + s.section : ''), emoji: '🎓'
            }));
            const staff = (window.SchoolDatabase.staff || []).map(s => ({
                ...s, nfc_uid: s.id, className: s.role || s.department || 'Staff', emoji: '👨‍🏫'
            }));
            allStudents = [...students, ...staff];
            renderSimulatorList();
        }, 50);
    }

    // ── Render Tap Simulator Sidebar ─────────────────────────────────────
    function renderSimulatorList(filterText = "") {
        const container = document.getElementById('sim-students-list');
        if (!container) return;

        if (allStudents.length === 0) {
            container.innerHTML = `<div class="text-center py-6 text-gray-400 text-xs">No student database found. Create students in the ID Cards section first.</div>`;
            return;
        }

        const filtered = allStudents.filter(s => 
            s.name.toLowerCase().includes(filterText.toLowerCase()) || 
            s.id.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-center py-6 text-gray-400 text-xs">No matching sandbox students found.</div>`;
            return;
        }

        // Display a clean subset of students for interactive simulation
        container.innerHTML = filtered.map(s => {
            const hasCard = !!s.nfc_uid;
            const badge = hasCard
                ? `<span class="text-[9px] bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-mono font-bold">${s.nfc_uid}</span>`
                : `<span class="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">Unlinked</span>`;

            const btn = hasCard
                ? `<button onclick="window.nfcScannerApp.mockScan('${s.nfc_uid}')" class="text-xs px-2.5 py-1.5 bg-primary-600 hover:bg-primary-750 text-white rounded-xl font-bold transition-all shadow-sm">Tap Card</button>`
                : `<button disabled class="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-xl cursor-not-allowed font-bold">Tap Card</button>`;

            return `
            <div class="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">
                        ${s.photo ? `<img src="${s.photo}" class="w-full h-full object-cover rounded-full">` : s.emoji || '👤'}
                    </div>
                    <div class="text-left min-w-0">
                        <div class="font-bold text-xs text-gray-900 dark:text-white truncate leading-none mb-1">${s.name}</div>
                        ${badge}
                    </div>
                </div>
                ${btn}
            </div>`;
        }).join('');
    }

    // ── Keep Input field focused for Keyboard-Wedge Readers ─────────────────
    // Only refocus the hidden wedge field if the user clicked outside a real text input
    function maintainFocus() {
        const active = document.activeElement;
        const isRealInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        if (isRealInput) return;   // don't steal focus from manual search / sim search
        const inp = document.getElementById('scanner-focus-field');
        if (inp) inp.focus();
    }

    // ── Read NFC config biometric flag for current mode ───────────────────────
    function modeRequiresBiometric() {
        try {
            const cfg = JSON.parse(localStorage.getItem('sms_nfc_config') || '{}');
            const map = { gate: 'studentAttendance', staff: 'staffAttendance', library: 'library', disciplinary: 'discipline', bursar: 'bursary' };
            const key = map[currentMode];
            return key && cfg[key] ? !!cfg[key].bio : false;
        } catch(e) { return false; }
    }

    // ── Central card read handler: biometric gate → processScannedCard ─────────
    function handleCardRead(uid) {
        if (modeRequiresBiometric() && window.SmartScanner) {
            // Show biometric modal first; only process if fingerprint passes
            window.SmartScanner.start({
                requireBiometric: true,
                // Pass the already-scanned UID so SmartScanner just shows the bio step
                prefillUid: uid,
                onSuccess: (resolvedId) => {
                    // SmartScanner may return its own id; prefer our uid
                    processScannedCard(uid || resolvedId);
                },
                onFail: () => {
                    const panel = document.getElementById('scanner-result-panel');
                    if (panel) panel.innerHTML = `<div class="text-center py-10 space-y-3">
                        <i class="fas fa-fingerprint text-4xl text-red-400"></i>
                        <p class="font-bold text-red-600">Biometric Verification Failed</p>
                        <p class="text-xs text-gray-400">Please try again or use manual override.</p>
                    </div>`;
                }
            });
        } else {
            processScannedCard(uid);
        }
    }

    // ── Update Session Activity Ledger ──────────────────────────────────────
    function addToLedger(student, actionDesc, statusClass) {
        recentScans.unshift({
            name: student ? student.name : "Unknown Card",
            id: student ? student.id : "N/A",
            action: actionDesc,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: statusClass,
            photo: student ? student.photo : null,
            emoji: student ? student.emoji : '❓'
        });

        // Limit to last 15 scans
        if (recentScans.length > 15) {
            recentScans.pop();
        }

        renderLedger();
    }

    function renderLedger() {
        const container = document.getElementById('scanned-ledger-list');
        if (!container) return;

        if (recentScans.length === 0) {
            container.innerHTML = `
            <div class="text-center py-8 text-gray-400 text-xs">
                <i class="fas fa-stream block text-2xl opacity-20 mb-2"></i>
                No scans recorded during this workspace session.
            </div>`;
            return;
        }

        container.innerHTML = recentScans.map(item => {
            let statusIcon = '<i class="fas fa-check-circle text-green-500"></i>';
            if (item.status === 'late') statusIcon = '<i class="fas fa-exclamation-circle text-amber-500"></i>';
            if (item.status === 'unrecognized') statusIcon = '<i class="fas fa-times-circle text-red-500"></i>';

            return `
            <div class="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-2xl animate-fade-in">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 text-sm">
                        ${item.photo ? `<img src="${item.photo}" class="w-full h-full object-cover">` : item.emoji}
                    </div>
                    <div class="text-left min-w-0">
                        <div class="font-extrabold text-xs text-gray-800 dark:text-white truncate">${item.name}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5">${item.action}</div>
                    </div>
                </div>
                <div class="text-right flex items-center gap-2 flex-shrink-0">
                    <span class="text-[10px] font-mono text-gray-400 dark:text-gray-500">${item.timestamp}</span>
                    ${statusIcon}
                </div>
            </div>`;
        }).join('');
    }

    function processScannedCard(uid) {
        // Look up by id (nfc_uid === id in our DB mapping)
        const student = allStudents.find(s => s.id === uid || s.nfc_uid === uid);
        const panel = document.getElementById('scanner-result-panel');
        const radarRing = document.getElementById('scanner-radar-ring');
        const stateTitle = document.getElementById('scanner-state-title');
        if (!panel) return;

        if (radarRing) {
            radarRing.classList.remove('bg-primary-50', 'dark:bg-primary-950/20', 'border-primary-100/50');
            if (student) {
                radarRing.classList.add('bg-green-50', 'dark:bg-green-950/50', 'border-green-500');
                if (stateTitle) stateTitle.innerHTML = `<span class="text-green-600 dark:text-green-400 flex items-center gap-2 justify-center"><i class="fas fa-check"></i> Authorized</span>`;
            } else {
                radarRing.classList.add('bg-red-50', 'dark:bg-red-950/50', 'border-red-500');
                if (stateTitle) stateTitle.innerHTML = `<span class="text-red-600 dark:text-red-400 flex items-center gap-2 justify-center"><i class="fas fa-times"></i> Unrecognized</span>`;
            }
            setTimeout(() => {
                radarRing.className = "w-44 h-44 rounded-full bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center relative shadow-inner border border-primary-100/50 dark:border-primary-900/30";
                if (stateTitle) stateTitle.textContent = "Scan Reader Active";
            }, 1200);
        }

        if (!student) {
            SoundEffects.playError();
            addToLedger(null, `Unlinked Card: ${uid}`, 'unrecognized');
            panel.innerHTML = `<div class="text-center space-y-5 py-8 animate-fade-in w-full">
                <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-200"><i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i></div>
                <h3 class="font-black text-red-600 text-lg">Card Not Recognized</h3>
                <p class="text-xs text-gray-500">UID: <strong class="font-mono">${uid}</strong></p>
            </div>`;
            return;
        }

        SoundEffects.playSuccess();

        const photoHtml = student.photo
            ? `<img src="${student.photo}" class="w-full h-full object-cover">`
            : `<div class="text-4xl">${student.emoji || '👤'}</div>`;

        // ── Helper: lateness check from settings ──────────────────────────
        function getLatenessStatus(type) {
            const defaultSched = { startTime: '07:00', lateThreshold: '08:15' };
            const sched = JSON.parse(localStorage.getItem('sms_attendance_config') || '{}');
            const cfg = (sched[type] || defaultSched);
            const now = new Date();
            const [lH, lM] = cfg.lateThreshold.split(':').map(Number);
            const lateMs = lH * 60 + lM;
            const nowMs  = now.getHours() * 60 + now.getMinutes();
            return nowMs >= lateMs;
        }

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        let contextDetailsHtml = '';

        if (currentMode === 'gate') {
            const isLate = getLatenessStatus('student');
            const statusClass = isLate ? 'late' : 'present';
            addToLedger(student, `Gate Entry: ${isLate ? 'Late Check-In' : 'On Time'}`, statusClass);
            const statusBadge = isLate
                ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-amber-50 border border-amber-300 text-amber-700 rounded-full"><span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Late Check-In</span>`
                : `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-green-50 border border-green-300 text-green-700 rounded-full"><span class="w-2 h-2 rounded-full bg-green-500"></span> Present (On Time)</span>`;
            contextDetailsHtml = `<div class="w-full border-t border-dashed pt-5 text-left space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gray-50 p-3 rounded-2xl border"><span class="text-[10px] text-gray-400 uppercase font-black block">Terminal</span><strong class="text-sm font-mono">GATE-01-A</strong></div>
                    <div class="bg-gray-50 p-3 rounded-2xl border"><span class="text-[10px] text-gray-400 uppercase font-black block">Time</span><strong class="text-sm font-mono">${currentTime}</strong></div>
                </div>
                <div class="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl border"><span class="text-xs font-bold">Status</span>${statusBadge}</div>
                <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-green-500 animate-pulse w-full"></div></div>
                <span class="text-[10px] text-green-500 font-bold flex items-center justify-center gap-1.5"><i class="fas fa-door-open"></i> Welcome to Campus!</span>
            </div>`;
        } else if (currentMode === 'library') {
            addToLedger(student, 'Library Desk - Member Verified', 'present');
            const libTrans = (window.SchoolDatabase?.libraryTransactions || []).filter(t => t.memberId === student.id && (t.status === 'Issued' || t.status === 'Overdue'));
            const loanList = libTrans.length > 0
                ? libTrans.map(b => { const over = new Date(b.dueDate) < new Date(); return `<div class="flex justify-between items-center text-xs p-3 rounded-xl bg-gray-50 border"><span class="truncate font-bold max-w-[160px]">${b.bookTitle}</span><span class="px-2 py-0.5 rounded text-[10px] font-bold ${over ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}">${b.dueDate}</span></div>`; }).join('')
                : `<p class="text-xs text-gray-400 italic text-center py-2">No books currently borrowed.</p>`;
            contextDetailsHtml = `<div class="w-full border-t border-dashed pt-5 text-left space-y-3">
                <div class="flex justify-between items-center"><h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Borrowed Books</h5><span class="text-[9px] bg-primary-100 text-primary-800 px-2 py-0.5 rounded font-black">${libTrans.length} Active</span></div>
                <div class="space-y-2">${loanList}</div>
                <button onclick="window._libScanId='${student.id}'; if(window.loadIssueReturnPage) loadIssueReturnPage();" class="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5">
                    <i class="fas fa-book-open"></i> Go to Issue / Return Desk
                </button>
            </div>`;
        } else if (currentMode === 'bursar') {
            addToLedger(student, 'Bursary - Fee Lookup', 'present');
            const feeRec = (window.SchoolDatabase?.feeRecords || []).find(f => f.studentId === student.id);
            const total = feeRec?.totalFee || 0, paid = feeRec?.paidAmount || 0, bal = total - paid;
            const fmt = n => '₦' + n.toLocaleString();
            contextDetailsHtml = `<div class="w-full border-t border-dashed pt-5 text-left space-y-4">
                <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee Ledger</h5>
                <div class="grid grid-cols-3 gap-2.5 text-center">
                    <div class="p-3 border rounded-2xl bg-gray-50"><div class="text-[8px] text-gray-400 uppercase font-black mb-1">Total</div><strong class="text-sm font-mono">${fmt(total)}</strong></div>
                    <div class="p-3 border border-green-200 rounded-2xl bg-green-50"><div class="text-[8px] text-green-600 uppercase font-black mb-1">Paid</div><strong class="text-sm text-green-700 font-mono">${fmt(paid)}</strong></div>
                    <div class="p-3 border border-red-200 rounded-2xl bg-red-50"><div class="text-[8px] text-red-600 uppercase font-black mb-1">Balance</div><strong class="text-sm text-red-700 font-mono">${fmt(bal)}</strong></div>
                </div>
                <button onclick="if(window.loadFeeCollectionPage){ window._feeFilterId='${student.id}'; loadFeeCollectionPage(); }" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5">
                    <i class="fas fa-receipt"></i> Open Fee Collection Page
                </button>
            </div>`;
        } else if (currentMode === 'disciplinary') {
            addToLedger(student, 'Discipline Desk - Checked', 'present');
            const discRecs = (window.SchoolDatabase?.disciplineRecords || []).filter(r => r.studentId === student.id);
            const open = discRecs.filter(r => r.status === 'Open' || r.status === 'Pending').length;
            const total_d = discRecs.length;
            contextDetailsHtml = `<div class="w-full border-t border-dashed pt-5 text-left space-y-3">
                <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discipline Record</h5>
                <div class="grid grid-cols-2 gap-3 text-center">
                    <div class="p-3 border rounded-2xl bg-gray-50"><div class="text-[8px] text-gray-400 uppercase font-black mb-1">Total Incidents</div><strong class="text-sm font-mono">${total_d}</strong></div>
                    <div class="p-3 border ${open > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'} rounded-2xl"><div class="text-[8px] ${open > 0 ? 'text-red-600' : 'text-green-600'} uppercase font-black mb-1">Open Cases</div><strong class="text-sm ${open > 0 ? 'text-red-700' : 'text-green-700'} font-mono">${open}</strong></div>
                </div>
                <button onclick="window.editingIncidentId=null; window._disciplineStudentId='${student.id}'; if(window.loadAddIncidentPage) loadAddIncidentPage();" class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5">
                    <i class="fas fa-exclamation-triangle"></i> Log New Incident for ${student.name}
                </button>
            </div>`;
        } else if (currentMode === 'staff') {
            const isLateStaff = getLatenessStatus('staff');
            addToLedger(student, `Staff Clock-In: ${isLateStaff ? 'Late' : 'On Time'}`, isLateStaff ? 'late' : 'present');
            const staffBadge = isLateStaff
                ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-amber-50 border border-amber-300 text-amber-700 rounded-full"><span class="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span> Late</span>`
                : `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-green-50 border border-green-300 text-green-700 rounded-full"><span class="w-2 h-2 bg-green-500 rounded-full"></span> On Time</span>`;
            contextDetailsHtml = `<div class="w-full border-t border-dashed pt-5 text-left space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gray-50 p-3 rounded-2xl border"><span class="text-[10px] text-gray-400 uppercase font-black block">Terminal</span><strong class="text-sm font-mono">STAFF-ENTRY</strong></div>
                    <div class="bg-gray-50 p-3 rounded-2xl border"><span class="text-[10px] text-gray-400 uppercase font-black block">Time</span><strong class="text-sm font-mono">${currentTime}</strong></div>
                </div>
                <div class="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl border"><span class="text-xs font-bold">Clock-In Status</span>${staffBadge}</div>
            </div>`;
        }

        panel.innerHTML = `
        <div class="w-full animate-fade-in flex flex-col items-center">
            <!-- Mode tag indicator -->
            <span class="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-primary-50 text-primary-750 dark:bg-primary-950/40 dark:text-primary-350 mb-5 border border-primary-200/50">
                ${currentMode} scan authorized
            </span>

            <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center overflow-hidden border-4 border-primary-250 dark:border-primary-900 flex-shrink-0 mb-4 shadow-md relative">
                ${photoHtml}
            </div>

            <div class="space-y-1 mb-5 text-center">
                <h3 class="font-black text-gray-900 dark:text-white text-xl tracking-tight">${student.name}</h3>
                <p class="text-xs text-gray-550 dark:text-gray-400 font-semibold">
                    Class: <span class="text-primary-600 dark:text-primary-400 font-bold">${student.className || 'None'}</span> 
                    <span class="mx-1.5 text-gray-300">|</span> 
                    ID: <span class="font-mono">${student.id}</span>
                </p>
            </div>

            ${contextDetailsHtml}
        </div>`;
    }

    // ── Manual Search Filters ───────────────────────────────────────────────
    window.nfcScannerApp = {
        switchMode(mode) {
            currentMode = mode;
            
            // Update Active Tab Class UI buttons
            const modeIds = ['gate', 'hostel', 'library', 'bursar', 'disciplinary', 'staff'];
            modeIds.forEach(m => {
                const btn = document.getElementById(`scanner-mode-btn-${m}`);
                if (!btn) return;
                
                if (m === mode) {
                    btn.className = "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300";
                } else {
                    btn.className = "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50";
                }
            });

            // Re-initialize SmartScanner with correct NFC + biometric rules for this mode
            const storedConfig = localStorage.getItem('sms_nfc_config');
            let reqNFC = true, reqBio = false;
            if (storedConfig) {
                try {
                    const conf = JSON.parse(storedConfig);
                    const modeMap = {
                        gate:         conf.studentAttendance,
                        hostel:       conf.hostelAttendance,
                        staff:        conf.staffAttendance,
                        library:      conf.library,
                        disciplinary: conf.discipline,
                        bursar:       conf.bursary
                    };
                    const modeCfg = modeMap[mode];
                    if (modeCfg) {
                        reqNFC = modeCfg.nfc !== false; // default true
                        reqBio = !!modeCfg.bio;
                    }
                    // Bursary never requires bio regardless of setting
                    if (mode === 'bursar') reqBio = false;
                } catch(e) {}
            }

            const panel = document.getElementById('scanner-result-panel');

            if (!reqNFC && !reqBio) {
                // Both disabled — stop scanner and show notice
                if (window.SmartScanner) window.SmartScanner.stop();
                if (panel) panel.innerHTML = `
                <div class="space-y-3 text-center py-16">
                    <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
                        <i class="fas fa-ban text-3xl text-gray-400"></i>
                    </div>
                    <h4 class="font-black text-gray-700 dark:text-gray-300">Scanner Disabled</h4>
                    <p class="text-xs text-gray-400">Both NFC and Biometric are turned off for <strong>${mode}</strong> in Settings → NFC & Biometric.</p>
                    <a href="#" onclick="window.loadPage && loadPage('settings/nfc.html','../../js/settings.js','settings-script')" class="inline-block text-xs text-primary-600 underline">Go to Settings</a>
                </div>`;
                maintainFocus();
                return; // don't start SmartScanner
            }

            if (window.SmartScanner) {
                window.SmartScanner.stop();
                window.SmartScanner.start({
                    requireNFC: reqNFC,
                    requireBiometric: reqBio,
                    onSuccess: processScannedCard,
                    onFail: (reason) => { console.log('Kiosk scan failed:', reason); }
                });
            }

            // Update radar status prompt
            const prompt = document.getElementById('scanner-focus-prompt');
            if (prompt) {
                const modeLabel = { gate: 'Student Attendance', hostel: 'Hostel', staff: 'Staff Clock-In', library: 'Library Desk', bursar: 'Bursary', disciplinary: 'Discipline' }[mode] || mode;
                const scanType = reqNFC ? 'Tap card' : 'Enter ID manually';
                prompt.textContent = `${scanType} to process ${modeLabel} check.`;
            }

            // Reset result panel to waiting state
            if (panel) {
                panel.innerHTML = `
                <div class="space-y-4 text-gray-400 dark:text-gray-500 py-16">
                    <div class="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-750 flex items-center justify-center mx-auto shadow-inner border border-gray-150/40">
                        <i class="fas fa-id-badge text-4xl opacity-30"></i>
                    </div>
                    <div>
                        <h4 class="font-black text-gray-800 dark:text-gray-200 text-base">Waiting for Scan</h4>
                        <p class="text-xs mt-1">${reqNFC ? 'Scan card' : 'Enter ID manually'} in the scanner panel${reqBio ? ', then verify fingerprint' : ''} to continue.</p>
                    </div>
                </div>`;
            }

            maintainFocus();
        },

        html5QrCode: null,
        webcamActive: false,

        toggleWebcamScanner() {
            const container = document.getElementById('webcam-scanner-container');
            const btn = document.getElementById('webcam-toggle-btn');
            
            if (!this.webcamActive) {
                container.classList.remove('hidden');
                btn.innerHTML = `<i class="fas fa-times mr-1"></i> Close Webcam Scanner`;
                
                if (!this.html5QrCode) {
                    this.html5QrCode = new window.Html5Qrcode("html5-qrcode-reader");
                }
                
                this.html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 200, height: 200 } },
                    (decodedText, decodedResult) => {
                        console.log(`Webcam Scan Code: ${decodedText}`);
                        // Avoid double scanning within 2 seconds
                        if (Date.now() - wedgeTimeout > 2000) {
                            wedgeTimeout = Date.now();
                            processScannedCard(decodedText);
                        }
                    },
                    (errorMessage) => {
                        // ignore background errors
                    }
                ).catch((err) => {
                    console.error("Failed to start scanner", err);
                    alert("Failed to start webcam. Please ensure camera permissions are granted.");
                    container.classList.add('hidden');
                    btn.innerHTML = `<i class="fas fa-camera mr-1"></i> Switch to Webcam Barcode Scanner`;
                });
                
                this.webcamActive = true;
            } else {
                if (this.html5QrCode) {
                    this.html5QrCode.stop().then(() => {
                        container.classList.add('hidden');
                        btn.innerHTML = `<i class="fas fa-camera mr-1"></i> Switch to Webcam Barcode Scanner`;
                        this.webcamActive = false;
                    }).catch(err => console.error("Failed to stop scanner", err));
                }
            }
        },

        mockScan(uid) {
            document.getElementById('sim-modal-container').classList.add('hidden');
            // Feed the uid into the EXISTING SmartScanner session.
            // switchMode() already started SmartScanner with the correct requireBiometric
            // value from settings. processNFCScan checks that flag and shows the fingerprint
            // modal automatically when biometric is required.
            if (window.SmartScanner && window.SmartScanner.isActive) {
                window.SmartScanner.processNFCScan(uid);
            } else {
                // Fallback: SmartScanner not active, process directly
                processScannedCard(uid);
            }
        },

        toggleSound() {
            isSoundOn = !isSoundOn;
            const btn = document.getElementById('sound-mute-btn');
            if (btn) {
                btn.innerHTML = isSoundOn 
                    ? `<i class="fas fa-volume-up"></i> Sound On` 
                    : `<i class="fas fa-volume-mute"></i> Muted`;
                btn.className = isSoundOn 
                    ? "flex items-center gap-1 hover:text-primary-500 transition-all font-bold text-gray-450"
                    : "flex items-center gap-1 hover:text-primary-500 transition-all font-bold text-red-500 dark:text-red-400";
            }
        },

        toggleSimulator() {
            const modal = document.getElementById('sim-modal-container');
            if (modal) {
                modal.classList.toggle('hidden');
                if (!modal.classList.contains('hidden')) {
                    // Populate on display
                    renderSimulatorList();
                    document.getElementById('sim-search-input').focus();
                }
            }
        },

        filterSimList() {
            const query = document.getElementById('sim-search-input').value;
            renderSimulatorList(query);
        },

        filterManualSearch() {
            const val = document.getElementById('manual-student-search').value.toLowerCase();
            const resultsBox = document.getElementById('manual-search-results');
            if (!resultsBox) return;

            if (val.trim().length < 1) {
                resultsBox.innerHTML = "";
                resultsBox.classList.add('hidden');
                return;
            }

            const matches = allStudents.filter(s => 
                s.name.toLowerCase().includes(val) || 
                s.id.toLowerCase().includes(val)
            );

            if (matches.length === 0) {
                resultsBox.innerHTML = `<div class="p-3 text-center text-xs text-gray-400">No students found</div>`;
                resultsBox.classList.remove('hidden');
                return;
            }

            resultsBox.innerHTML = matches.map(s => {
                return `
                <div class="flex items-center justify-between p-2 hover:bg-gray-55 dark:hover:bg-gray-700/60 rounded-lg cursor-pointer transition-all border border-gray-100 dark:border-gray-800" onclick="window.nfcScannerApp.triggerManualScan('${s.nfc_uid || ''}', '${s.id}', '${s.name}')">
                    <span class="text-xs font-bold text-gray-800 dark:text-white">${s.name} (${s.id})</span>
                    <span class="text-[10px] px-2 py-0.5 bg-primary-55 text-primary-700 dark:bg-primary-950 dark:text-primary-300 rounded font-black">Manual Access</span>
                </div>`;
            }).join('');
            resultsBox.classList.remove('hidden');
        },

        triggerManualScan(nfcUid, studentId, studentName) {
            const resultsBox = document.getElementById('manual-search-results');
            if (resultsBox) {
                resultsBox.classList.add('hidden');
                document.getElementById('manual-student-search').value = "";
            }

            if (!nfcUid) {
                // If they don't have an NFC card registered, warn them
                const panel = document.getElementById('scanner-result-panel');
                SoundEffects.playError();
                panel.innerHTML = `
                <div class="text-center space-y-4 py-8 animate-fade-in w-full">
                    <div class="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-900">
                        <i class="fas fa-exclamation-triangle text-amber-500 text-2xl animate-pulse"></i>
                    </div>
                    <div class="space-y-1">
                        <h3 class="font-black text-amber-600 dark:text-amber-400 text-lg">No Linked Smart Card</h3>
                        <p class="text-xs text-gray-500">Student: <strong class="text-gray-700 dark:text-white">${studentName}</strong></p>
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-550 max-w-sm mx-auto border-t border-dashed pt-4 leading-relaxed">
                        This student doesn't have a registered NFC card UID. Go to the <strong class="text-primary-500">ID Cards Hub</strong> to register their card first before attempting automated scan authorization.
                    </div>
                </div>`;
                return;
            }

            processScannedCard(nfcUid);
        },

        startWebNfcScanner() {
            const badge = document.getElementById('nfc-mobile-badge');
            if ('NDEFReader' in window) {
                try {
                    const ndef = new NDEFReader();
                    ndef.scan().then(() => {
                        if (badge) {
                            badge.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-900 flex items-center gap-2 transition-all";
                            badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span> Mobile Web NFC Active`;
                        }

                        ndef.addEventListener("reading", ({ message, serialNumber }) => {
                            // Extract hardware hex UID
                            const parsedUid = serialNumber.replace(/:/g, "").toUpperCase();
                            console.log("Mobile NFC Scan Event:", parsedUid);
                            processScannedCard(parsedUid);
                        });
                    });
                } catch (e) {
                    console.warn("Mobile Web NFC registration failed:", e);
                }
            } else {
                console.log("Mobile Web NFC NDEFReader API not supported on this browser.");
            }
        }
    };

    // Initialize Database
    loadDatabase();

    // Set Global input auto focus locking
    maintainFocus();
    document.addEventListener('click', (e) => {
        // Only regrab focus if the click target is not inside a real input
        const tag = e.target?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.target?.isContentEditable) {
            setTimeout(maintainFocus, 100);
        }
    });

    // Initialize Smart Scanner for the default 'gate' mode
    setTimeout(() => {
        window.nfcScannerApp.switchMode('gate');
    }, 500);

    // Run Android Web NFC check on startup
    window.nfcScannerApp.startWebNfcScanner();
})();
