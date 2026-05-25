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
        const students = JSON.parse(localStorage.getItem('sms_students') || '[]');
        // We inject mock staff/parents for the scanner demo
        const mockStaff = [
            { id: 'STF-001', name: 'Dr. John Doe', className: 'Staff - Principal', photo: '', emoji: '👨‍🏫', nfc_uid: 'STF1001' },
            { id: 'STF-002', name: 'Mrs. Jane Smith', className: 'Staff - Teacher', photo: '', emoji: '👩‍🏫', nfc_uid: 'STF1002' }
        ];
        allStudents = [...students, ...mockStaff];
        renderSimulatorList();
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
    function maintainFocus() {
        const inp = document.getElementById('scanner-focus-field');
        if (inp) {
            inp.focus();
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

    // ── Process Scanned NFC Card UID ──────────────────────────────────────────
    function processScannedCard(uid) {
        const student = allStudents.find(s => s.nfc_uid === uid);
        const panel = document.getElementById('scanner-result-panel');
        const radarRing = document.getElementById('scanner-radar-ring');
        const stateTitle = document.getElementById('scanner-state-title');
        if (!panel) return;

        // Visual flash animation on radar target ring
        if (radarRing) {
            radarRing.classList.remove('bg-primary-50', 'dark:bg-primary-950/20', 'border-primary-100/50');
            if (student) {
                radarRing.classList.add('bg-green-50', 'dark:bg-green-950/50', 'border-green-500');
                if (stateTitle) {
                    stateTitle.innerHTML = `<span class="text-green-600 dark:text-green-400 flex items-center gap-2 justify-center"><i class="fas fa-check"></i> Authorized</span>`;
                }
            } else {
                radarRing.classList.add('bg-red-50', 'dark:bg-red-950/50', 'border-red-500');
                if (stateTitle) {
                    stateTitle.innerHTML = `<span class="text-red-600 dark:text-red-400 flex items-center gap-2 justify-center"><i class="fas fa-times"></i> Unrecognized</span>`;
                }
            }

            setTimeout(() => {
                radarRing.className = "w-44 h-44 rounded-full bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center relative shadow-inner border border-primary-100/50 dark:border-primary-900/30";
                if (stateTitle) {
                    stateTitle.textContent = "Scan Reader Active";
                }
            }, 1200);
        }

        if (!student) {
            SoundEffects.playError();
            addToLedger(null, `Unlinked Card Read: ${uid}`, 'unrecognized');
            panel.innerHTML = `
            <div class="text-center space-y-5 py-8 animate-fade-in w-full">
                <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-2xl animate-bounce"></i>
                </div>
                <div class="space-y-1">
                    <h3 class="font-black text-red-600 dark:text-red-400 text-lg">Card Not Recognized</h3>
                    <p class="text-xs text-gray-500">Unregistered Smart Tag: <strong class="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-red-500">${uid}</strong></p>
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto border-t border-dashed pt-4 leading-relaxed">
                    This credential badge hardware ID is not currently registered. Please associate this smart card to a student under the <strong class="text-primary-500">ID Cards administrative desk</strong> first.
                </div>
            </div>`;
            return;
        }

        // Success Feedback
        SoundEffects.playSuccess();

        // Render card results dynamically based on Section Mode
        const photoHtml = student.photo 
            ? `<img src="${student.photo}" class="w-full h-full object-cover">` 
            : `<div class="text-4xl">${student.emoji || '👤'}</div>`;

        let contextDetailsHtml = "";

        if (currentMode === 'gate') {
            // Check-in and check-out timestamp layouts
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            // Set dynamic lateness based on standard 8:00 AM settings check
            const hours = new Date().getHours();
            const mins = new Date().getMinutes();
            const isLate = (hours > 8 || (hours === 8 && mins > 0)); // Late if after 8:00 AM

            const statusClass = isLate ? 'late' : 'present';
            addToLedger(student, `Gate Entry: ${isLate ? 'Late Check-In' : 'Authorized'}`, statusClass);

            const statusBadge = isLate 
                ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-300 rounded-full"><span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Late Check-In</span>`
                : `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-900 text-green-700 dark:text-green-300 rounded-full"><span class="w-2 h-2 rounded-full bg-green-500"></span> Present (On Time)</span>`;

            contextDetailsHtml = `
            <div class="w-full border-t border-dashed dark:border-gray-700 pt-5 text-left space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border dark:border-gray-700">
                        <span class="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Terminal ID</span>
                        <strong class="text-sm text-gray-800 dark:text-white font-mono">GATE-01-A</strong>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border dark:border-gray-700">
                        <span class="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Timestamp</span>
                        <strong class="text-sm text-gray-800 dark:text-white font-mono">${currentTime}</strong>
                    </div>
                </div>
                <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-900/20 p-3.5 rounded-2xl border border-gray-150 dark:border-gray-750">
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Authorized Access</span>
                    ${statusBadge}
                </div>
                <!-- Simulated Gate Open Bar Animation -->
                <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <div class="h-full bg-green-500 animate-pulse w-full"></div>
                </div>
                <span class="text-[10px] text-green-500 font-bold flex items-center justify-center gap-1.5"><i class="fas fa-door-open"></i> Virtual barrier open. Welcome to Campus!</span>
            </div>`;
        } else if (currentMode === 'library') {
            addToLedger(student, `Library Access Verification`, 'present');
            // Mock dynamic borrowed list
            const mockBorrowed = [
                { title: 'Essential Mathematics for JSS1', due: '2 Days Overdue', late: true },
                { title: 'Integrated Science Basics', due: 'Due in 5 Days', late: false }
            ];

            const loanList = mockBorrowed.map(b => `
                <div class="flex justify-between items-center text-xs p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border dark:border-gray-750">
                    <span class="truncate font-extrabold text-gray-700 dark:text-gray-300 max-w-[200px]">${b.title}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.late ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-450'}">${b.due}</span>
                </div>
            `).join('');

            contextDetailsHtml = `
            <div class="w-full border-t border-dashed dark:border-gray-700 pt-5 text-left space-y-4">
                <div class="flex justify-between items-center">
                    <h5 class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Book Loans Ledger</h5>
                    <span class="text-[9px] bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 px-2 py-0.5 rounded font-black font-mono">2 Checked Out</span>
                </div>
                <div class="space-y-2">
                    ${loanList}
                </div>
                <button class="w-full py-2.5 bg-primary-600 hover:bg-primary-750 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95">
                    <i class="fas fa-plus"></i> Process New Borrow / Return Receipt
                </button>
            </div>`;
        } else if (currentMode === 'bursar') {
            addToLedger(student, `Bursary Balance Statement Checked`, 'present');
            // Mock finance balance lookup
            contextDetailsHtml = `
            <div class="w-full border-t border-dashed dark:border-gray-700 pt-5 text-left space-y-4">
                <h5 class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Fee Ledger Invoice</h5>
                <div class="grid grid-cols-3 gap-2.5 text-center">
                    <div class="p-3 border dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/40">
                        <div class="text-[8px] text-gray-400 uppercase font-black tracking-wider mb-1">Total Bill</div>
                        <strong class="text-sm text-gray-850 dark:text-white font-mono">₦150,000</strong>
                    </div>
                    <div class="p-3 border border-green-200 dark:border-green-950 rounded-2xl bg-green-50/50 dark:bg-green-950/20">
                        <div class="text-[8px] text-green-600 dark:text-green-400 uppercase font-black tracking-wider mb-1">Paid</div>
                        <strong class="text-sm text-green-700 dark:text-green-300 font-mono">₦120,000</strong>
                    </div>
                    <div class="p-3 border border-red-200 dark:border-red-950 rounded-2xl bg-red-50/50 dark:bg-red-950/20">
                        <div class="text-[8px] text-red-600 dark:text-red-400 uppercase font-black tracking-wider mb-1">Balance</div>
                        <strong class="text-sm text-red-700 dark:text-red-300 font-mono">₦30,000</strong>
                    </div>
                </div>
                <button class="w-full py-2.5 bg-green-600 hover:bg-green-750 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95">
                    <i class="fas fa-receipt"></i> Authorize / Log School Fee Payment
                </button>
            </div>`;
        } else if (currentMode === 'disciplinary') {
            addToLedger(student, `Disciplinary Clearance Checked`, 'present');
            
            // Dynamic mock discipline state
            const merits = student.className.includes('SS') ? 14 : 28;
            const demerits = student.className.includes('SS') ? 1 : 0;
            const rating = demerits > 0 ? 'Good Standing' : 'Exemplary Conduct';
            
            contextDetailsHtml = `
            <div class="w-full border-t border-dashed dark:border-gray-700 pt-5 text-left space-y-4">
                <h5 class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Behavioral & Merit Record</h5>
                <div class="grid grid-cols-3 gap-2.5 text-center">
                    <div class="p-3 border dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/40">
                        <div class="text-[8px] text-gray-400 uppercase font-black tracking-wider mb-1">Merits</div>
                        <strong class="text-sm text-green-600 dark:text-green-400 font-mono">+${merits}</strong>
                    </div>
                    <div class="p-3 border dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/40">
                        <div class="text-[8px] text-gray-400 uppercase font-black tracking-wider mb-1">Demerits</div>
                        <strong class="text-sm text-red-600 dark:text-red-400 font-mono">${demerits}</strong>
                    </div>
                    <div class="p-3 border border-green-200 dark:border-green-950 rounded-2xl bg-green-50/50 dark:bg-green-950/20 col-span-1">
                        <div class="text-[8px] text-green-600 dark:text-green-400 uppercase font-black tracking-wider mb-1">Rating</div>
                        <strong class="text-xs text-green-700 dark:text-green-300 truncate block">${rating}</strong>
                    </div>
                </div>
                <div class="p-3 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/30 rounded-xl text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <i class="fas fa-certificate text-xs animate-pulse"></i>
                    <span>Eligible for Student Leadership Council candidacy.</span>
                </div>
                <button class="w-full py-2.5 bg-red-600 hover:bg-red-750 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm transform active:scale-95">
                    <i class="fas fa-exclamation-triangle"></i> Log Incident / File Demerit Report
                </button>
            </div>`;
        } else if (currentMode === 'staff') {
            addToLedger(student, `Staff Clock-In Verified`, 'present');
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            contextDetailsHtml = `
            <div class="w-full border-t border-dashed dark:border-gray-700 pt-5 text-left space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border dark:border-gray-700">
                        <span class="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Terminal ID</span>
                        <strong class="text-sm text-gray-800 dark:text-white font-mono">STAFF-ENTRY</strong>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border dark:border-gray-700">
                        <span class="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Timestamp</span>
                        <strong class="text-sm text-gray-800 dark:text-white font-mono">${currentTime}</strong>
                    </div>
                </div>
                <div class="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3.5 rounded-2xl border border-green-200 dark:border-green-800">
                    <span class="text-xs font-bold text-green-800 dark:text-green-300">Clock-In Successful</span>
                    <i class="fas fa-check-circle text-green-500 text-lg"></i>
                </div>
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
            const modeIds = ['gate', 'library', 'bursar', 'disciplinary', 'staff'];
            modeIds.forEach(m => {
                const btn = document.getElementById(`scanner-mode-btn-${m}`);
                if (!btn) return;
                
                if (m === mode) {
                    btn.className = "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300";
                } else {
                    btn.className = "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50";
                }
            });

            // Re-initialize SmartScanner with correct biometric rules for this mode
            const storedConfig = localStorage.getItem('sms_nfc_config');
            let reqBio = false;
            if (storedConfig) {
                const conf = JSON.parse(storedConfig);
                if (mode === 'gate' && conf.studentAttendance) reqBio = conf.studentAttendance.bio;
                else if (mode === 'staff' && conf.staffAttendance) reqBio = conf.staffAttendance.bio;
                else if (mode === 'library' && conf.library) reqBio = conf.library.bio;
                else if (mode === 'disciplinary' && conf.discipline) reqBio = conf.discipline.bio;
                // Bursary never requires bio.
            }
            
            if (window.SmartScanner) {
                window.SmartScanner.stop();
                window.SmartScanner.start({
                    requireBiometric: reqBio,
                    onSuccess: processScannedCard,
                    onFail: (reason) => { console.log('Kiosk scan failed:', reason); }
                });
            }

            // Update radar status prompt
            const prompt = document.getElementById('scanner-focus-prompt');
            if (prompt) {
                prompt.textContent = `Hardware Auto-focused. Tap card directly now to process ${mode} check.`;
            }

            // Reset result screen to active default check state
            const panel = document.getElementById('scanner-result-panel');
            if (panel) {
                panel.innerHTML = `
                <div class="space-y-4 text-gray-400 dark:text-gray-500 py-16">
                    <div class="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-750 flex items-center justify-center mx-auto shadow-inner border border-gray-150/40">
                        <i class="fas fa-id-badge text-4xl opacity-30"></i>
                    </div>
                    <div>
                        <h4 class="font-black text-gray-800 dark:text-gray-200 text-base">Waiting for Scan</h4>
                        <p class="text-xs mt-1">Please scan student card for ${mode} processing.</p>
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
            // Close Sandbox Simulator Modal
            document.getElementById('sim-modal-container').classList.add('hidden');
            processScannedCard(uid);
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

    // Set Global input auto focus locking (legacy)
    maintainFocus();
    document.addEventListener('click', () => {
        setTimeout(maintainFocus, 100);
    });

    // Initialize Smart Scanner for the default 'gate' mode
    setTimeout(() => {
        window.nfcScannerApp.switchMode('gate');
    }, 500);

    // Run Android Web NFC check on startup
    window.nfcScannerApp.startWebNfcScanner();
})();
