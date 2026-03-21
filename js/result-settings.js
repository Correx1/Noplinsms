// js/result-settings.js
(function() {
    console.log('Result Settings module initialized.');

    let domainsList = [
        "Discipline", "Neatness", "Attentiveness", "Punctuality", 
        "Logical", "Leadership", "Teamwork", "Attendance", "Sports"
    ];

    let psychomotorList = [
        "Handwriting", "Drawing & Painting", "Verbal Fluency", "Sports & Games", "Handling Tools"
    ];

    let b64PrincipalSign = "";
    let b64HeadteacherSign = "";

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

    function triggerDynamicUI(tplId) {
        if(!window.TEMPLATE_REGISTRY || !window.TEMPLATE_REGISTRY[tplId]) return;
        const cap = window.TEMPLATE_REGISTRY[tplId].capabilities;
        
        const attSec = document.getElementById('attendance-config-section');
        const billSec = document.getElementById('school-bills-section');
        const psychoSec = document.getElementById('psychomotor-domains-section');
        
        if(attSec) { cap.attendance ? attSec.classList.remove('hidden') : attSec.classList.add('hidden'); }
        if(billSec) { cap.schoolBills ? billSec.classList.remove('hidden') : billSec.classList.add('hidden'); }
        if(psychoSec) { cap.psychomotorDomains ? psychoSec.classList.remove('hidden') : psychoSec.classList.add('hidden'); }
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('globalResultSettings');
        if(savedSettings) {
            const data = JSON.parse(savedSettings);
            let checkEl = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
            
            checkEl('rs-session', data.session);
            checkEl('rs-resumption', data.resumption);
            checkEl('rs-headteacher-title', data.headteacherTitle);
            checkEl('rs-principal-title', data.principalTitle);
            checkEl('rs-principal-name', data.principalName);
            checkEl('rs-headteacher-name', data.headteacherName);
            
            checkEl('rs-bill-tuition', data.bills?.tuition);
            checkEl('rs-bill-equipment', data.bills?.equipment);
            checkEl('rs-bill-library', data.bills?.library);
            checkEl('rs-bill-sports', data.bills?.sports);
            
            checkEl('rs-times-opened', data.attendance?.timesOpened);
            checkEl('rs-closing-date', data.dates?.closingDate);
            
            if(data.activeTemplate) {
                const radio = document.querySelector(`input[name="rs-template-sel"][value="${data.activeTemplate}"]`);
                if(radio) { radio.checked = true; triggerDynamicUI(data.activeTemplate); }
            } else { triggerDynamicUI('classic'); }
            
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
            triggerDynamicUI('classic');
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

        let getVal = id => document.getElementById(id) ? document.getElementById(id).value : '';

        const data = {
            session: getVal('rs-session'),
            resumption: getVal('rs-resumption'),
            headteacherTitle: getVal('rs-headteacher-title') || 'Head Teacher',
            principalTitle: getVal('rs-principal-title') || 'Principal / Director',
            principalName: getVal('rs-principal-name'),
            headteacherName: getVal('rs-headteacher-name'),
            activeTemplate: activeTemplate,
            domains: domainsList,
            psychomotorDomains: psychomotorList,
            principalSign: b64PrincipalSign,
            headteacherSign: b64HeadteacherSign,
            bills: {
                tuition: getVal('rs-bill-tuition'),
                equipment: getVal('rs-bill-equipment'),
                library: getVal('rs-bill-library'),
                sports: getVal('rs-bill-sports')
            },
            attendance: {
                timesOpened: getVal('rs-times-opened')
            },
            dates: {
                closingDate: getVal('rs-closing-date')
            }
        };

        localStorage.setItem('globalResultSettings', JSON.stringify(data));
        showToast('Settings Saved', 'Result generation globally updated', 'success');
        
        renderDomains(); 
        renderPsychomotorDomains();
    }

    // Dynamic UI listener
    document.addEventListener('change', (e) => {
        if(e.target && e.target.name === 'rs-template-sel') {
            triggerDynamicUI(e.target.value);
        }
    });

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
                class: "JSS 1 Gold", 
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
                {subject: "Basic Science", components: {CA1: {score: 6}, CA2: {score: 7}, Project: {score: 8}, Exam: {score: 55}}, total: 76, grade: "B2", remark: "Very Good", highest: 85, lowest: 35, position: "10th"}
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
            attendance: { timesOpened: settings.attendance?.timesOpened || 110, timesPresent: 108, timesAbsent: 2 },
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
