// js/result-settings.js
(function() {
    console.log('Result Settings module initialized.');

    const TOGGLES = [
        { id: 'showSubjectsOffered', label: 'Subjects Offered' },
        { id: 'showGradeTally', label: 'Grade Tally Summary' },
        { id: 'showTermStatus', label: 'Term Status (Pass/Fail)' },
        { id: 'showPromotionStatus', label: 'Promotion Status (Third Term)' },
        { id: 'showAttendance', label: 'Attendance Section' },
        { id: 'showFees', label: 'School Fees Section' },
        { id: 'showQRCode', label: 'QR Code Verification' },
        { id: 'showGradingKey', label: 'Grading & Rating Key' },
        { id: 'showAffective', label: 'Affective Domains' },
        { id: 'showPsychomotor', label: 'Psychomotor Domains' },
        { id: 'showTeacherComment', label: 'Teacher\'s Comment' },
        { id: 'showHeadTeacherComment', label: 'Head Teacher\'s Comment' },
        { id: 'showPrincipalComment', label: 'Principal\'s Comment' },
        { id: 'showNotice', label: 'Report Card Notice' },
        { id: 'showStamp', label: 'School Stamp Area' }
    ];

    let domainsList = [
        "Discipline", "Neatness", "Attentiveness", "Punctuality", 
        "Logical", "Leadership", "Teamwork", "Attendance", "Sports"
    ];

    let psychomotorList = [
        "Handwriting", "Drawing & Painting", "Verbal Fluency", "Sports & Games", "Handling Tools"
    ];

    let b64PrincipalSign = "";
    let b64HeadteacherSign = "";

    function renderToggles() {
        const container = document.getElementById('rs-master-toggles');
        if (!container) return;

        let html = '';
        TOGGLES.forEach(t => {
            html += `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 transition-colors">
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-300">${t.label}</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggle-${t.id}" class="sr-only peer rs-feature-toggle" checked onchange="handleToggleChange('${t.id}')">
                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                    </label>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    window.handleToggleChange = function(id) {
        const isChecked = document.getElementById(`toggle-${id}`).checked;
        
        // Show/hide dependent sections based on toggles
        if (id === 'showNotice') {
            document.getElementById('rs-section-notice').classList.toggle('hidden', !isChecked);
        } else if (id === 'showTermStatus') {
            document.getElementById('rs-section-passfail').classList.toggle('hidden', !isChecked);
        } else if (id === 'showPromotionStatus') {
            document.getElementById('rs-section-promotion').classList.toggle('hidden', !isChecked);
        } else if (id === 'showAffective') {
            document.getElementById('rs-section-affective').classList.toggle('hidden', !isChecked);
        } else if (id === 'showPsychomotor') {
            document.getElementById('rs-section-psychomotor').classList.toggle('hidden', !isChecked);
        }
    };

    function renderDomains() {
        const container = document.getElementById('domains-container');
        if(!container) return;
        
        container.innerHTML = '';
        domainsList.forEach((dom, idx) => {
            container.innerHTML += `
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 font-medium w-6 text-right">${idx + 1}.</span>
                    <input type="text" value="${dom}" class="domain-input-val bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                    <button type="button" onclick="window.removeDomainField(${idx})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Domain">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    function renderPsychomotorDomains() {
        const container = document.getElementById('psychomotor-domains-container');
        if(!container) return;
        
        container.innerHTML = '';
        psychomotorList.forEach((dom, idx) => {
            container.innerHTML += `
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 font-medium w-6 text-right">${idx + 1}.</span>
                    <input type="text" value="${dom}" class="psychomotor-input-val bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                    <button type="button" onclick="window.removePsychomotorField(${idx})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Domain">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    window.addNewDomainField = function() {
        domainsList.push("");
        renderDomains();
    };

    window.removeDomainField = function(idx) {
        domainsList.splice(idx, 1);
        renderDomains();
    };

    window.addNewPsychomotorDomainField = function() {
        psychomotorList.push("");
        renderPsychomotorDomains();
    };

    window.removePsychomotorField = function(idx) {
        psychomotorList.splice(idx, 1);
        renderPsychomotorDomains();
    };

    function handleFileUpload(inputId, previewId, setterCallback) {
        const input = document.getElementById(inputId);
        if(!input) return;
        input.addEventListener('change', function() {
            const file = this.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const b64 = e.target.result;
                    setterCallback(b64);
                    const preview = document.getElementById(previewId);
                    if(preview) preview.innerHTML = `<img src="${b64}" class="max-h-full max-w-full object-contain">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function loadSettings() {
        renderToggles(); // Generate the HTML first

        const savedSettings = localStorage.getItem('globalResultSettings');
        if(savedSettings) {
            const data = JSON.parse(savedSettings);
            let checkEl = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
            
            checkEl('rs-session', data.session);
            checkEl('rs-headteacher-title', data.headteacherTitle);
            checkEl('rs-principal-title', data.principalTitle);
            checkEl('rs-principal-name', data.principalName);
            checkEl('rs-headteacher-name', data.headteacherName);
            
            // New fields
            checkEl('rs-custom-notice', data.noticeMessage);
            checkEl('rs-pass-min-avg', data.passFail?.minAvg);
            checkEl('rs-prom-min-avg', data.promotion?.minAvg);
            
            if(data.activeTemplate) {
                const radio = document.querySelector(`input[name="rs-template-sel"][value="${data.activeTemplate}"]`);
                if(radio) { radio.checked = true; }
            }
            
            // Load Toggles
            if (data.toggles) {
                TOGGLES.forEach(t => {
                    const chk = document.getElementById(`toggle-${t.id}`);
                    if (chk) {
                        chk.checked = data.toggles[t.id] !== false; // Default to true if undefined
                        handleToggleChange(t.id); // trigger visibility updates
                    }
                });
            } else {
                // If no saved toggles, trigger all to run their default visible logic
                TOGGLES.forEach(t => handleToggleChange(t.id));
            }

            if(data.domains && Array.isArray(data.domains)) domainsList = data.domains;
            if(data.psychomotorDomains && Array.isArray(data.psychomotorDomains)) psychomotorList = data.psychomotorDomains;

            if(data.principalSign) {
                b64PrincipalSign = data.principalSign;
                const p = document.getElementById('rs-principal-preview');
                if(p) p.innerHTML = `<img src="${b64PrincipalSign}" class="max-h-full max-w-full object-contain">`;
            }
            if(data.headteacherSign) {
                b64HeadteacherSign = data.headteacherSign;
                const h = document.getElementById('rs-headteacher-preview');
                if(h) h.innerHTML = `<img src="${b64HeadteacherSign}" class="max-h-full max-w-full object-contain">`;
            }
        } else {
            // No saved data, run initial UI setup
            TOGGLES.forEach(t => handleToggleChange(t.id));
        }
        
        renderDomains();
        renderPsychomotorDomains();

        // Bind File Uploads
        handleFileUpload('rs-principal-sign', 'rs-principal-preview', (val) => b64PrincipalSign = val);
        handleFileUpload('rs-headteacher-sign', 'rs-headteacher-preview', (val) => b64HeadteacherSign = val);
    }

    function saveSettings(e) {
        e.preventDefault();

        // Capture domains
        const domInputs = document.querySelectorAll('.domain-input-val');
        domainsList = Array.from(domInputs).map(inp => inp.value.trim()).filter(v => v !== "");
        
        const psychoInputs = document.querySelectorAll('.psychomotor-input-val');
        psychomotorList = Array.from(psychoInputs).map(inp => inp.value.trim()).filter(v => v !== "");

        // Capture active template
        const activeTplRadio = document.querySelector('input[name="rs-template-sel"]:checked');
        const activeTemplate = activeTplRadio ? activeTplRadio.value : 'classic';

        // Capture toggles
        const togglesData = {};
        TOGGLES.forEach(t => {
            const chk = document.getElementById(`toggle-${t.id}`);
            if (chk) {
                togglesData[t.id] = chk.checked;
            }
        });

        let getVal = id => document.getElementById(id) ? document.getElementById(id).value : '';

        const data = {
            session: getVal('rs-session'),
            headteacherTitle: getVal('rs-headteacher-title') || 'Head Teacher',
            principalTitle: getVal('rs-principal-title') || 'Principal / Director',
            principalName: getVal('rs-principal-name'),
            headteacherName: getVal('rs-headteacher-name'),
            activeTemplate: activeTemplate,
            toggles: togglesData,
            noticeMessage: getVal('rs-custom-notice'),
            passFail: {
                minAvg: getVal('rs-pass-min-avg')
            },
            promotion: {
                minAvg: getVal('rs-prom-min-avg')
            },
            domains: domainsList,
            psychomotorDomains: psychomotorList,
            principalSign: b64PrincipalSign,
            headteacherSign: b64HeadteacherSign
        };

        localStorage.setItem('globalResultSettings', JSON.stringify(data));
        showToast('Settings Saved', 'Result generation globally updated', 'success');
        
        renderDomains(); 
        renderPsychomotorDomains();
    }

    // --- PREVIEW MODAL LOGIC STRIP ---
    window.previewSelectedTemplate = function() {
        const activeTplRadio = document.querySelector('input[name="rs-template-sel"]:checked');
        const tpl = activeTplRadio ? activeTplRadio.value : 'classic';

        if(!window.TEMPLATE_REGISTRY || !window.TEMPLATE_REGISTRY[tpl] || !window.buildPrintPayload) {
            alert("Error: Template Registry not loaded yet!");
            return;
        }

        // Generate Mock Record
        const mockRec = {
            student: { 
                id: "STD-PRVW",
                name: "John Doe Model", 
                roll: "2024-001", 
                class: "SS 1 A", 
                term: "First Term",
                session: "2024/2025",
                gender: "Male"
            },
            position: "1st", positionInt: 1, average: "89.5", grandTotal: 252,
            structure: {
                components: [
                    {name: "CA1", weight: 10}, {name: "CA2", weight: 10}, 
                    {name: "Project", weight: 10}, {name: "Exam", weight: 70}
                ]
            },
            subjects: [
                {subject: "Mathematics", components: {CA1: {score: 8}, CA2: {score: 9}, Project: {score: 10}, Exam: {score: 65}}, total: 92, grade: "A1", remark: "Excellent", highest: 98, lowest: 45, position: "2nd"},
                {subject: "English Language", components: {CA1: {score: 7}, CA2: {score: 8}, Project: {score: 9}, Exam: {score: 60}}, total: 84, grade: "A2", remark: "Excellent", highest: 90, lowest: 40, position: "5th"},
                {subject: "Basic Science", components: {CA1: {score: 6}, CA2: {score: 7}, Project: {score: 8}, Exam: {score: 55}}, total: 76, grade: "B2", remark: "Very Good", highest: 85, lowest: 35, position: "10th"},
                {subject: "Civic Education", components: {CA1: {score: 8}, CA2: {score: 8}, Project: {score: 8}, Exam: {score: 60}}, total: 84, grade: "A2", remark: "Excellent", highest: 88, lowest: 50, position: "4th"},
                {subject: "Agricultural Science", components: {CA1: {score: 5}, CA2: {score: 6}, Project: {score: 7}, Exam: {score: 50}}, total: 68, grade: "C4", remark: "Good", highest: 75, lowest: 30, position: "12th"},
                {subject: "Business Studies", components: {CA1: {score: 7}, CA2: {score: 7}, Project: {score: 8}, Exam: {score: 58}}, total: 80, grade: "B1", remark: "Very Good", highest: 85, lowest: 42, position: "8th"},
                {subject: "Social Studies", components: {CA1: {score: 9}, CA2: {score: 9}, Project: {score: 9}, Exam: {score: 65}}, total: 92, grade: "A1", remark: "Excellent", highest: 95, lowest: 55, position: "1st"},
                {subject: "Computer Studies", components: {CA1: {score: 6}, CA2: {score: 8}, Project: {score: 8}, Exam: {score: 55}}, total: 77, grade: "B2", remark: "Very Good", highest: 82, lowest: 38, position: "9th"},
                {subject: "Physical & Health Ed.", components: {CA1: {score: 8}, CA2: {score: 8}, Project: {score: 9}, Exam: {score: 60}}, total: 85, grade: "A2", remark: "Excellent", highest: 89, lowest: 48, position: "3rd"},
                {subject: "Christian Rel. Studies", components: {CA1: {score: 7}, CA2: {score: 7}, Project: {score: 7}, Exam: {score: 50}}, total: 71, grade: "C5", remark: "Good", highest: 80, lowest: 35, position: "15th"},
                {subject: "Yoruba Language", components: {CA1: {score: 5}, CA2: {score: 5}, Project: {score: 6}, Exam: {score: 45}}, total: 61, grade: "C6", remark: "Credit", highest: 72, lowest: 28, position: "18th"},
                {subject: "Basic Technology", components: {CA1: {score: 6}, CA2: {score: 7}, Project: {score: 8}, Exam: {score: 55}}, total: 76, grade: "B2", remark: "Very Good", highest: 85, lowest: 40, position: "11th"},
                {subject: "Home Economics", components: {CA1: {score: 8}, CA2: {score: 9}, Project: {score: 8}, Exam: {score: 62}}, total: 87, grade: "A2", remark: "Excellent", highest: 90, lowest: 50, position: "6th"}
            ]
        };

        const settings = JSON.parse(localStorage.getItem('globalResultSettings') || '{}');
        const profile = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');
        
        let mockEvals = {
            remark: "Outstanding performance all round.",
            headTeacherRemark: "Excellent result, keep it up.",
            principalRemark: "An exceptionally bright child. A true leader.",
            domains: { "Punctuality": 5, "Neatness": 5, "Politeness": 4, "Honesty": 5, "Attendance": 5, "Discipline": 5, "Teamwork": 4 },
            psychomotor: { "Handwriting": 5, "Drawing & Painting": 4, "Verbal Fluency": 5, "Sports & Games": 3 },
            attendance: { timesOpened: settings.attendance?.timesOpened || 110, timesPresent: 108, timesAbsent: 2, timesLate: 1, timesEarly: 107 },
            bills: { tuition: settings.bills?.tuition || '50000', equipment: settings.bills?.equipment || '5000', library: settings.bills?.library || '2000', sports: settings.bills?.sports || '3000', arrears: '0' }
        };

        const payload = window.buildPrintPayload(mockRec, {
            settings: settings,
            profile: profile,
            evals: mockEvals,
            mode: 'term',
            classValue: mockRec.student.class,
            termValue: mockRec.student.term,
            sessionValue: mockRec.student.session
        });

        const innerHtml = window.TEMPLATE_REGISTRY[tpl].renderTerm(payload);
        const html = `<div class="result-pdf-wrapper relative w-[210mm] h-[296mm] overflow-hidden bg-white mx-auto py-[10mm] px-[15mm] box-border font-sans text-black">${innerHtml}</div>`;
        
        const previewContainer = document.getElementById('settings-preview-body');
        if(previewContainer) {
            previewContainer.innerHTML = html;
            
            // Scaler
            const scale = Math.min(1, (window.innerWidth - 30) / 794); 
            previewContainer.style.transform = `scale(${scale})`;
            const scaledHeight = 1122 * scale; 
            previewContainer.parentElement.style.height = `${scaledHeight + 100}px`; 
        }
        
        const modal = document.getElementById('settings-preview-modal');
        if(modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        }
    };

    window.closeSettingsPreviewModal = function() {
        const modal = document.getElementById('settings-preview-modal');
        if(modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.classList.remove('overflow-hidden');
        }
    };

    // Bind Form
    setTimeout(() => {
        loadSettings();
        const form = document.getElementById('resultSettingsForm');
        if(form) form.addEventListener('submit', saveSettings);
    }, 100);

})();
