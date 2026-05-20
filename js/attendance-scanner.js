// NFC Smart Scanner Core Script — Mode routing, Keyboard Wedge Interceptor, Web NFC mobile API, and Web Audio Synths
(function() {
    let currentMode = 'gate'; // Options: gate, library, bursar
    let allStudents = [];
    
    // Wedge input interceptor buffer
    let wedgeBuffer = "";
    let wedgeTimeout = null;

    // Web Audio Synthesizer chimes for feedback chimes (No external assets required!)
    const SoundEffects = {
        playSuccess() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Low pleasant fundamental note
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc1.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5
                
                gain1.gain.setValueAtTime(0.15, ctx.currentTime);
                gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start();
                osc1.stop(ctx.currentTime + 0.4);
            } catch (e) {
                console.warn("Audio Context failed to start:", e);
            }
        },

        playError() {
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
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                
                osc1.start();
                osc2.start();
                osc1.stop(ctx.currentTime + 0.5);
                osc2.stop(ctx.currentTime + 0.5);
            } catch (e) {
                console.warn("Audio Context failed to start:", e);
            }
        }
    };

    function loadDatabase() {
        allStudents = JSON.parse(localStorage.getItem('sms_students') || '[]');
        renderSimulatorList();
    }

    // ── Render Tap Simulator Sidebar ─────────────────────────────────────
    function renderSimulatorList() {
        const container = document.getElementById('sim-students-list');
        if (!container) return;

        if (allStudents.length === 0) {
            container.innerHTML = `<div class="text-center py-6 text-gray-400 text-xs">No student database found. Create students in the ID Cards section first.</div>`;
            return;
        }

        // Display a clean subset of students for interactive simulation
        container.innerHTML = allStudents.map(s => {
            const hasCard = !!s.nfc_uid;
            const badge = hasCard
                ? `<span class="text-[9px] bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-mono font-bold">${s.nfc_uid}</span>`
                : `<span class="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">Unlinked</span>`;

            const btn = hasCard
                ? `<button onclick="window.nfcScannerApp.mockScan('${s.nfc_uid}')" class="text-xs px-2.5 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 font-semibold transition-all shadow-sm">Tap Card</button>`
                : `<button disabled class="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded cursor-not-allowed">Tap Card</button>`;

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

    // ── Process Scanned NFC Card UID ──────────────────────────────────────────
    function processScannedCard(uid) {
        const student = allStudents.find(s => s.nfc_uid === uid);
        const panel = document.getElementById('scanner-result-panel');
        const radarRing = document.getElementById('scanner-radar-ring');
        if (!panel) return;

        // Visual flash animation on radar target ring
        if (radarRing) {
            radarRing.classList.remove('bg-primary-50', 'dark:bg-primary-950/40', 'border-primary-500');
            if (student) {
                radarRing.classList.add('bg-green-50', 'dark:bg-green-950/50', 'border-green-500');
            } else {
                radarRing.classList.add('bg-red-50', 'dark:bg-red-950/50', 'border-red-500');
            }

            setTimeout(() => {
                radarRing.className = "w-32 h-32 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center relative shadow-inner";
            }, 800);
        }

        if (!student) {
            SoundEffects.playError();
            panel.innerHTML = `
            <div class="text-center space-y-4 py-8 animate-fade-in">
                <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-2xl animate-bounce"></i>
                </div>
                <div class="space-y-1">
                    <h3 class="font-extrabold text-red-600 dark:text-red-400 text-lg">Card Not Recognized</h3>
                    <p class="text-sm text-gray-500">Card Serial Number: <strong class="font-mono">${uid}</strong></p>
                </div>
                <div class="text-xs text-gray-400 max-w-xs mx-auto border-t pt-3 dark:border-gray-700">
                    This tag has not been associated with a student. Go to the **ID Cards Hub** directory to link this card.
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

            const statusBadge = isLate 
                ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-full"><span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Late Check-In</span>`
                : `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-300 rounded-full"><span class="w-2 h-2 rounded-full bg-green-500"></span> Present (On Time)</span>`;

            contextDetailsHtml = `
            <div class="w-full border-t dark:border-gray-700 pt-4 text-left space-y-3">
                <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border">
                    <span class="text-xs text-gray-500">Gate Timestamp</span>
                    <strong class="text-base text-gray-800 dark:text-white font-mono">${currentTime}</strong>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">Tracking Status</span>
                    ${statusBadge}
                </div>
            </div>`;
        } else if (currentMode === 'library') {
            // Mock dynamic borrowed list
            const mockBorrowed = [
                { title: 'Essential Mathematics for JSS1', due: '2 Days Overdue', late: true },
                { title: 'Integrated Science Basics', due: 'Due in 5 Days', late: false }
            ];

            const loanList = mockBorrowed.map(b => `
                <div class="flex justify-between items-center text-xs p-2 rounded bg-gray-50 dark:bg-gray-700/20 border">
                    <span class="truncate font-semibold text-gray-700 dark:text-gray-300 max-w-[200px]">${b.title}</span>
                    <span class="${b.late ? 'text-red-500 font-bold' : 'text-gray-500'}">${b.due}</span>
                </div>
            `).join('');

            contextDetailsHtml = `
            <div class="w-full border-t dark:border-gray-700 pt-4 text-left space-y-3">
                <h5 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Book Loans</h5>
                <div class="space-y-1.5">
                    ${loanList}
                </div>
                <button class="w-full py-2 bg-primary-600 text-white font-semibold text-xs rounded-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                    <i class="fas fa-plus"></i> Issue New Book Catalog
                </button>
            </div>`;
        } else if (currentMode === 'bursar') {
            // Mock finance balance lookup
            contextDetailsHtml = `
            <div class="w-full border-t dark:border-gray-700 pt-4 text-left space-y-3">
                <h5 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fee Collection Statement</h5>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="p-2 border rounded-xl bg-gray-50 dark:bg-gray-700/20">
                        <div class="text-[9px] text-gray-400 uppercase font-bold">Total Bill</div>
                        <strong class="text-xs text-gray-800 dark:text-white font-mono">₦150,000</strong>
                    </div>
                    <div class="p-2 border rounded-xl bg-green-50 dark:bg-green-950/20 border-green-200">
                        <div class="text-[9px] text-green-600 dark:text-green-400 uppercase font-bold">Paid</div>
                        <strong class="text-xs text-green-700 dark:text-green-400 font-mono">₦100,000</strong>
                    </div>
                    <div class="p-2 border rounded-xl bg-red-50 dark:bg-red-950/20 border-red-200">
                        <div class="text-[9px] text-red-600 dark:text-red-400 uppercase font-bold">Balance</div>
                        <strong class="text-xs text-red-700 dark:text-red-400 font-mono">₦50,000</strong>
                    </div>
                </div>
                <button class="w-full py-2 bg-green-600 text-white font-semibold text-xs rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                    <i class="fas fa-receipt"></i> Log Fee Payment Receipt
                </button>
            </div>`;
        }

        panel.innerHTML = `
        <div class="w-full animate-fade-in flex flex-col items-center">
            <!-- Mode tag indicator -->
            <span class="text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 mb-4 border">
                ${currentMode} scan successful
            </span>

            <div class="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center overflow-hidden border-2 border-primary-300 flex-shrink-0 mb-3 shadow-inner">
                ${photoHtml}
            </div>

            <div class="space-y-1 mb-4 text-center">
                <h3 class="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">${student.name}</h3>
                <p class="text-xs text-gray-500 font-medium">Class: <strong class="text-primary-600 dark:text-primary-400">${student.className}</strong> | ID: ${student.id}</p>
            </div>

            ${contextDetailsHtml}
        </div>`;
    }

    window.nfcScannerApp = {
        switchMode(mode) {
            currentMode = mode;
            
            // Update Active Tab Class UI buttons
            const modeIds = ['gate', 'library', 'bursar'];
            modeIds.forEach(m => {
                const btn = document.getElementById(`scanner-mode-btn-${m}`);
                if (!btn) return;
                
                if (m === mode) {
                    btn.className = "flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm bg-primary-50 dark:bg-primary-950 border-primary-500 text-primary-800 dark:text-primary-200 shadow-sm";
                } else {
                    btn.className = "flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all font-bold text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50";
                }
            });

            // Update radar status prompt
            const prompt = document.getElementById('scanner-focus-prompt');
            if (prompt) {
                prompt.textContent = `Auto-focused. Tap card for ${mode} processing.`;
            }

            // Reset result screen to active default check state
            const panel = document.getElementById('scanner-result-panel');
            if (panel) {
                panel.innerHTML = `
                <div class="space-y-4 text-gray-400 dark:text-gray-500 py-12">
                    <i class="fas fa-id-badge text-6xl opacity-20 block"></i>
                    <div>
                        <h4 class="font-bold text-gray-700 dark:text-gray-300 text-sm">Waiting for Scan</h4>
                        <p class="text-xs mt-0.5">Please scan student card for ${mode} lookup.</p>
                    </div>
                </div>`;
            }

            maintainFocus();
        },

        mockScan(uid) {
            processScannedCard(uid);
        },

        startWebNfcScanner() {
            const badge = document.getElementById('nfc-mobile-badge');
            if ('NDEFReader' in window) {
                try {
                    const ndef = new NDEFReader();
                    ndef.scan().then(() => {
                        if (badge) {
                            badge.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 flex items-center gap-2 transition-all";
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
    document.addEventListener('click', () => {
        setTimeout(maintainFocus, 100);
    });

    // Global Key Interceptor buffer Wedge Readers
    document.addEventListener('keydown', (e) => {
        const currentTime = Date.now();
        if (currentTime - wedgeTimeout > 50) {
            wedgeBuffer = "";
        }
        wedgeTimeout = currentTime;

        if (e.key.length === 1) {
            wedgeBuffer += e.key;
        }

        if (e.key === 'Enter') {
            if (wedgeBuffer.length >= 6) {
                e.preventDefault();
                console.log("Wedge Scanner scan intercepted:", wedgeBuffer);
                processScannedCard(wedgeBuffer);
                wedgeBuffer = "";
            }
        }
    });

    // Run Android Web NFC check on startup
    window.nfcScannerApp.startWebNfcScanner();
})();
