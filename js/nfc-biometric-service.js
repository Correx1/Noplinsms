/**
 * NFC & Biometric Service
 * Provides a universal keyboard-wedge interceptor and interactive Biometric UI modal.
 */

class SmartScannerService {
    constructor() {
        this.inputBuffer = '';
        this.lastKeyTime = 0;
        this.isActive = false;
        
        this.currentConfig = {
            requireBiometric: false,
            onSuccess: null,
            onFail: null
        };
        
        this.scannedIdPending = null;
        this.currentState = 'nfc';
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.initUI();
    }

    initUI() {
        // Prevent duplicate initialization
        if (document.getElementById('smart-scanner-modal-overlay')) return;

        const styles = `
            #smart-scanner-modal-overlay {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(8px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            #smart-scanner-modal-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }
            .scanner-box {
                background: #ffffff;
                border-radius: 24px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                max-width: 400px;
                width: 90%;
                transform: scale(0.95);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #smart-scanner-modal-overlay.active .scanner-box {
                transform: scale(1);
            }
            .dark .scanner-box {
                background: #1e293b;
                color: #f8fafc;
                border: 1px solid #334155;
            }
            
            .scanner-icon-container {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: #f1f5f9;
                border: 4px solid #cbd5e1;
                margin: 24px auto;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            .dark .scanner-icon-container {
                background: #0f172a;
                border-color: #475569;
            }
            .scanner-icon-container i {
                font-size: 50px;
                color: #94a3b8;
                transition: color 0.3s ease;
                z-index: 2;
            }
            
            /* NFC State */
            .scanner-icon-container.state-nfc {
                border-color: #3b82f6;
                animation: pulse-nfc 2s infinite;
            }
            .scanner-icon-container.state-nfc i {
                color: #3b82f6;
            }
            @keyframes pulse-nfc {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }

            /* Biometric State */
            .scanner-icon-container.state-bio:hover {
                border-color: #8b5cf6;
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
            }
            .scanner-icon-container.state-bio i {
                color: #8b5cf6;
            }

            /* Scanning Animation */
            .scanner-icon-container.scanning::after {
                content: '';
                position: absolute;
                top: -50%;
                left: 0;
                width: 100%;
                height: 50%;
                background: linear-gradient(to bottom, rgba(139,92,246,0) 0%, rgba(139,92,246,0.8) 100%);
                animation: scan-line 1.5s linear infinite;
                z-index: 1;
            }
            @keyframes scan-line {
                0% { top: -50%; }
                100% { top: 100%; }
            }
            
            /* Success State */
            .scanner-icon-container.success {
                border-color: #10b981;
                background: #ecfdf5;
                animation: none;
                box-shadow: none;
            }
            .dark .scanner-icon-container.success {
                background: rgba(16, 185, 129, 0.1);
            }
            .scanner-icon-container.success i {
                color: #10b981;
            }
            
            /* Fail State */
            .scanner-icon-container.fail {
                border-color: #ef4444;
                background: #fef2f2;
                animation: shake 0.4s ease-in-out;
            }
            .dark .scanner-icon-container.fail {
                background: rgba(239, 68, 68, 0.1);
            }
            .scanner-icon-container.fail i {
                color: #ef4444;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                75% { transform: translateX(8px); }
            }
            
            .scanner-status-text {
                font-size: 16px;
                font-weight: 600;
                color: #64748b;
                margin-top: 16px;
            }
            .dark .scanner-status-text {
                color: #94a3b8;
            }
            .scanner-cancel-btn {
                margin-top: 24px;
                background: none;
                border: none;
                color: #ef4444;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                padding: 8px 16px;
                border-radius: 8px;
            }
            .scanner-cancel-btn:hover {
                background: #fee2e2;
            }
            .dark .scanner-cancel-btn:hover {
                background: rgba(239, 68, 68, 0.1);
            }
            
            /* Hidden simulator input (NOW VISIBLE FOR TESTING) */
            .sim-container {
                margin-top: 20px;
                padding: 10px;
                background: #f8fafc;
                border: 1px dashed #cbd5e1;
                border-radius: 8px;
            }
            .dark .sim-container {
                background: #0f172a;
                border-color: #334155;
            }
            .sim-title {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: bold;
                color: #94a3b8;
                margin-bottom: 8px;
            }
            #nfc-sim-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 14px;
                text-align: center;
                background: #ffffff;
                color: #334155;
            }
            .dark #nfc-sim-input {
                background: #1e293b;
                border-color: #475569;
                color: #f8fafc;
            }
            .sim-btn {
                margin-top: 8px;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                border: none;
            }
            .btn-pass { background: #10b981; color: white; }
            .btn-fail { background: #ef4444; color: white; margin-left: 8px; }
        `;

        const styleTag = document.createElement('style');
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);

        const modalHTML = `
            <div id="smart-scanner-modal-overlay">
                <div class="scanner-box">
                    <h3 class="text-xl font-extrabold text-slate-800 dark:text-white mb-2" id="scanner-modal-title">Smart Scanner</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400" id="scanner-user-info" style="display:none;">ID Identified: <span id="scanner-scanned-id" class="font-bold text-slate-800 dark:text-slate-200"></span></p>
                    
                    <div class="scanner-icon-container state-nfc" id="scanner-action-btn">
                        <i class="fas fa-id-card" id="scanner-icon"></i>
                    </div>
                    
                    <p class="scanner-status-text" id="scanner-status-message">Awaiting Card Scan...</p>
                    
                    <!-- Simulator helpers (VISIBLE FOR DEMO) -->
                    <div class="sim-container" id="sim-container-box">
                        <p class="sim-title" id="sim-title-text">Demo Simulator: Enter ID and press Enter</p>
                        <input type="text" id="nfc-sim-input" autocomplete="off" placeholder="e.g. STU001 or STF001" />
                        
                        <div id="bio-sim-actions" style="display:none; margin-top: 10px;">
                            <button class="sim-btn btn-pass" id="bio-simulate-pass-btn">Pass Bio</button>
                            <button class="sim-btn btn-fail" id="bio-simulate-fail-btn">Fail Bio</button>
                        </div>
                    </div>
                    
                    <button class="scanner-cancel-btn" onclick="window.SmartScanner.stop()">Close / Stop Scanning</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Bind simulation events
        document.getElementById('scanner-action-btn').addEventListener('click', () => {
            if (this.currentState === 'bio') {
                this.simulateFingerprint(true);
            } else if (this.currentState === 'nfc') {
                // To help with manual testing if they don't have a wedge scanner, focus the hidden input
                document.getElementById('nfc-sim-input').focus();
            }
        });
        
        document.getElementById('bio-simulate-pass-btn').addEventListener('click', () => {
            if (this.currentState === 'bio') {
                this.simulateFingerprint(true);
            }
        });
        
        document.getElementById('bio-simulate-fail-btn').addEventListener('click', () => {
            if (this.currentState === 'bio') {
                this.simulateFingerprint(false);
            }
        });
        
        // Listen to the hidden input for direct simulation
        document.getElementById('nfc-sim-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val.length > 0) {
                    this.processNFCScan(val);
                }
                e.target.value = '';
            }
        });
    }

    start(config = {}) {
        this.currentConfig = {
            requireNFC: config.requireNFC !== false, // default true
            requireBiometric: config.requireBiometric || false,
            onSuccess: config.onSuccess || (() => {}),
            onFail: config.onFail || (() => {})
        };
        
        if (!this.isActive) {
            document.addEventListener('keydown', this.handleKeyDown);
            this.isActive = true;
        }
        
        // If NFC is disabled but biometric is on → fingerprint-first mode
        if (!this.currentConfig.requireNFC && this.currentConfig.requireBiometric) {
            this.setFingerprintFirstState();
        } else {
            this.setNFCState();
        }
        
        document.getElementById('smart-scanner-modal-overlay').classList.add('active');
        
        setTimeout(() => {
            const simInput = document.getElementById('nfc-sim-input');
            if(simInput) simInput.focus();
        }, 100);
    }

    stop() {
        if (this.isActive) {
            document.removeEventListener('keydown', this.handleKeyDown);
            this.isActive = false;
        }
        document.getElementById('smart-scanner-modal-overlay').classList.remove('active');
        
        // Attempt to uncheck any toggle switches that might have opened this
        const toggle = document.getElementById('toggle-smart-scan');
        if (toggle && toggle.checked) {
            toggle.checked = false;
            if(typeof window.toggleSmartScanner === 'function') {
                window.toggleSmartScanner(false);
            }
        }
    }

    setNFCState() {
        this.currentState = 'nfc';
        this.scannedIdPending = null;
        
        document.getElementById('scanner-modal-title').innerText = 'Smart Scanner';
        document.getElementById('scanner-user-info').style.display = 'none';
        
        const btn = document.getElementById('scanner-action-btn');
        btn.className = 'scanner-icon-container state-nfc';
        document.getElementById('scanner-icon').className = 'fas fa-id-card';
        
        document.getElementById('scanner-status-message').innerText = 'Awaiting Card Scan...';
        document.getElementById('scanner-status-message').style.color = '';
        
        // Update Simulator UI
        document.getElementById('nfc-sim-input').style.display = 'block';
        document.getElementById('bio-sim-actions').style.display = 'none';
        document.getElementById('sim-title-text').innerText = 'Demo Simulator: Enter ID and press Enter';
    }

    // Fingerprint-first mode: NFC disabled, biometric required
    // Attendant manually enters the person's ID, then fingerprint verifies
    setFingerprintFirstState() {
        this.currentState = 'nfc'; // still 'nfc' so handleKeyDown works for ID entry
        this.scannedIdPending = null;

        document.getElementById('scanner-modal-title').innerText = 'Fingerprint Verification';
        document.getElementById('scanner-user-info').style.display = 'none';

        const btn = document.getElementById('scanner-action-btn');
        btn.className = 'scanner-icon-container state-bio';
        document.getElementById('scanner-icon').className = 'fas fa-fingerprint';

        document.getElementById('scanner-status-message').innerText = 'NFC disabled — enter ID manually to begin fingerprint check';
        document.getElementById('scanner-status-message').style.color = '';

        // Show the ID input (same sim input, different label)
        document.getElementById('nfc-sim-input').style.display = 'block';
        document.getElementById('bio-sim-actions').style.display = 'none';
        document.getElementById('sim-title-text').innerText = 'Enter Person ID manually, then press Enter';
    }

    setBioState(scannedId) {
        this.currentState = 'bio';
        this.scannedIdPending = scannedId;
        
        document.getElementById('scanner-modal-title').innerText = 'Biometric Verification';
        document.getElementById('scanner-user-info').style.display = 'block';
        document.getElementById('scanner-scanned-id').innerText = scannedId;
        
        const btn = document.getElementById('scanner-action-btn');
        btn.className = 'scanner-icon-container state-bio';
        document.getElementById('scanner-icon').className = 'fas fa-fingerprint';
        
        document.getElementById('scanner-status-message').innerText = 'Place finger on scanner';
        document.getElementById('scanner-status-message').style.color = '';
        
        // Update Simulator UI
        document.getElementById('nfc-sim-input').style.display = 'none';
        document.getElementById('bio-sim-actions').style.display = 'block';
        document.getElementById('sim-title-text').innerText = 'Demo Simulator: Biometric';
    }

    handleKeyDown(e) {
        if (!this.isActive || this.currentState !== 'nfc') return;
        
        // Ignore if typing in an input field (EXCEPT our own simulator)
        if (e.target.tagName === 'INPUT' && e.target.id !== 'nfc-sim-input') {
            return;
        }
        if (e.target.tagName === 'TEXTAREA') return;

        const currentTime = new Date().getTime();
        
        if (currentTime - this.lastKeyTime > 50) {
            this.inputBuffer = '';
        }
        
        this.lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (this.inputBuffer.length > 2) {
                e.preventDefault();
                this.processNFCScan(this.inputBuffer);
            }
            this.inputBuffer = '';
        } else if (e.key.length === 1) {
            this.inputBuffer += e.key;
        }
    }

    processNFCScan(scannedData) {
        if (this.currentConfig.requireBiometric) {
            this.setBioState(scannedData);
        } else {
            this.showSuccessAndNext(scannedData, 'Card Scanned Successfully!');
        }
    }

    simulateFingerprint(isSuccess) {
        if (this.currentState !== 'bio') return;
        
        const btn = document.getElementById('scanner-action-btn');
        const statusText = document.getElementById('scanner-status-message');
        
        if (btn.classList.contains('scanning')) return;
        
        btn.className = 'scanner-icon-container state-bio scanning';
        statusText.innerText = 'Scanning Fingerprint...';
        
        setTimeout(() => {
            if (isSuccess) {
                this.showSuccessAndNext(this.scannedIdPending, 'Match Confirmed');
            } else {
                btn.className = 'scanner-icon-container fail';
                statusText.innerText = 'Verification Denied';
                statusText.style.color = '#ef4444';
                
                setTimeout(() => {
                    this.currentConfig.onFail('Biometric mismatch');
                    // Reset to NFC state for next attempt
                    this.setNFCState();
                }, 1500);
            }
        }, 1200);
    }
    
    showSuccessAndNext(scannedData, message) {
        const btn = document.getElementById('scanner-action-btn');
        const statusText = document.getElementById('scanner-status-message');
        
        btn.className = 'scanner-icon-container success';
        document.getElementById('scanner-icon').className = 'fas fa-check';
        statusText.innerText = message;
        statusText.style.color = '#10b981';
        
        setTimeout(() => {
            // Trigger success callback
            this.currentConfig.onSuccess(scannedData);
            
            // Immediately get ready for the next scan (batch flow)
            this.setNFCState();
            const simInput = document.getElementById('nfc-sim-input');
            if(simInput) simInput.focus();
        }, 1000); // 1 second delay to see success state
    }
}

// Initialize Global Singleton
window.SmartScanner = new SmartScannerService();

// processNFCScan is already a class method — confirm it's accessible externally
// (no action needed; class methods are on the prototype and accessible on instances)
