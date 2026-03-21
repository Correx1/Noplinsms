// Result Sheets Core Logic
(function() {
    console.log('Result Sheets initialized');

    let classesData = [];
    let subjectsData = [];
    let gradingStructuresData = [];
    let gradeBoundariesData = [];
    let currentBroadsheetData = []; 
    let evalDomainsDb = JSON.parse(localStorage.getItem('evalDomainsDb')) || {}; 

    async function initialize() {
        try {
            const [clsRes, subRes] = await Promise.all([
                fetch('../../data/classes-data.json'),
                fetch('../../data/subjects-data.json')
            ]);
            classesData = await clsRes.json();
            subjectsData = await subRes.json();

            const structMap = localStorage.getItem('gradingStructuresData');
            if(structMap && JSON.parse(structMap).length > 0) {
                let parsed = JSON.parse(structMap);
                parsed.forEach(p => { if(p.classes) p.classes = p.classes.map(c => c.replace(/\s+/g, '')); });
                gradingStructuresData = parsed;
            } else {
                gradingStructuresData = [
                    {
                        id: 'STR-Fallback',
                        name: 'System Default',
                        classes: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'],
                        components: [
                            { id: 'C1', name: 'CA 1', weight: 20 },
                            { id: 'C2', name: 'CA 2', weight: 20 },
                            { id: 'C3', name: 'EXAM', weight: 60 }
                        ]
                    }
                ];
            }

            const boundsMap = localStorage.getItem('gradeBoundariesData');
            if(boundsMap) {
                gradeBoundariesData = JSON.parse(boundsMap);
            } else {
                gradeBoundariesData = [
                    { id: '1', grade: 'A', min: 75, max: 100, remark: 'Excellent' },
                    { id: '2', grade: 'B', min: 60, max: 74, remark: 'Very Good' },
                    { id: '3', grade: 'C', min: 50, max: 59, remark: 'Credit' },
                    { id: '4', grade: 'D', min: 40, max: 49, remark: 'Pass' },
                    { id: '5', grade: 'F', min: 0, max: 39, remark: 'Fail' }
                ];
            }
            gradeBoundariesData.sort((a,b) => b.min - a.min);

            const classSelect = document.getElementById('rs-class');
            if(classSelect) {
                classSelect.innerHTML = '<option value="">-- Select Target Class --</option>';
                classesData.forEach(c => {
                    classSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
                });
            }
        } catch(e) {
            console.error(e);
        }
    }

    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    window.loadBroadsheet = function() {
        const clsValue = document.getElementById('rs-class').value;
        const sectionValue = document.getElementById('rs-section').value;
        const sessionValue = document.getElementById('rs-session').value;
        const termValue = document.getElementById('rs-term').value;

        if(!clsValue || !termValue || !sessionValue) {
            alert("Please select Class, Session and Term");
            return;
        }

        const fullClassName = sectionValue !== 'All Sections' ? `${clsValue} ${sectionValue}` : clsValue;

        let activeStruct = gradingStructuresData.find(s => s.classes.includes(clsValue));
        if(!activeStruct) {
            activeStruct = {
                id: 'STR-GenericDefault',
                name: 'System Default',
                classes: [clsValue],
                components: [
                    { id: 'C_D1', name: 'CA 1', weight: 20 },
                    { id: 'C_D2', name: 'CA 2', weight: 20 },
                    { id: 'C_D3', name: 'Exam', weight: 60 }
                ]
            };
        }

        let students = Array.from({length: 10}, (_, i) => ({
            id: `STD-M-${i+1}`,
            name: `Student Model ${i+1}`,
            class: fullClassName,
            session: sessionValue,
            term: termValue,
            roll: `00${i+1}`
        }));

        let activeSubjects = subjectsData.slice(0, 12).map(s => s.name);
        let records = [];

        students.forEach(student => {
            let studentTotalAllSubjects = 0;
            let subjectResults = [];

            activeSubjects.forEach(subject => {
                let currentSubScore = { subject: subject, components: {}, total: 0 };
                let baseSkill = 0.4 + (Math.random() * 0.5); 
                
                // Force failing scores for 4 students to demonstrate the promotion rule logic
                if (['STD-M-7', 'STD-M-8', 'STD-M-9', 'STD-M-10'].includes(student.id)) {
                    baseSkill = 0.15 + (Math.random() * 0.25); // Guaranteed to average < 40%
                }
                
                activeStruct.components.forEach(comp => {
                    let w = parseInt(comp.weight) || 0;
                    let variance = (Math.random() * 0.2) - 0.1;
                    let m = Math.round(w * (baseSkill + variance));
                    if(m > w) m = w;
                    if(m < 0) m = 0;
                    currentSubScore.components[comp.name] = { score: m, max: w };
                    currentSubScore.total += m;
                });

                let bnd = gradeBoundariesData.find(b => currentSubScore.total >= b.min && currentSubScore.total <= b.max);
                currentSubScore.grade = bnd ? bnd.grade : '-';
                currentSubScore.remark = bnd ? bnd.remark : '-';
                
                subjectResults.push(currentSubScore);
                studentTotalAllSubjects += currentSubScore.total;
            });

            records.push({
                student: student,
                subjects: subjectResults,
                grandTotal: studentTotalAllSubjects,
                average: (studentTotalAllSubjects / activeSubjects.length).toFixed(1),
                structure: activeStruct
            });
        });

        records.sort((a,b) => b.grandTotal - a.grandTotal);
        records.forEach((rec, idx) => { 
            rec.positionInt = idx + 1; 
            rec.position = getOrdinal(idx + 1) + ` out of ${records.length}`;
            // Mock section position & average
            rec.sectionPositionInt = Math.ceil((idx + 1) / 3);
            if(rec.sectionPositionInt === 0) rec.sectionPositionInt = 1;
            
            // Assume 3 sections roughly equal in size for this mock
            const sectionSize = Math.ceil(records.length / 3);
            rec.sectionPosition = getOrdinal(rec.sectionPositionInt) + ` out of ${sectionSize}`;
            
            rec.sectionAverage = (parseFloat(rec.average) + (Math.random() * 4 - 2)).toFixed(1);
            if(rec.sectionAverage > 100) rec.sectionAverage = 100.0;
        });

        activeSubjects.forEach(sub => {
            let isolated = records.map(r => {
                let sRes = r.subjects.find(s => s.subject === sub);
                return { id: r.student.id, score: sRes.total };
            });
            isolated.sort((a,b) => b.score - a.score);
            let high = isolated[0].score;
            let low = isolated[isolated.length - 1].score;
            
            isolated.forEach((iso, idx) => {
                let rec = records.find(r => r.student.id === iso.id);
                let sr = rec.subjects.find(s => s.subject === sub);
                sr.highest = high;
                sr.lowest = low;
                sr.position = getOrdinal(idx + 1);
            });
        });

        currentBroadsheetData = records;

        const tbody = document.getElementById('rs-tbody');
        tbody.innerHTML = '';
        records.forEach(rec => {
            let tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            
            // Domain Evaluation Visual Status
            let isEvaluated = evalDomainsDb[rec.student.id] ? true : false;
            let evalBtnClass = isEvaluated 
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300' 
                : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300';
            let evalBtnText = isEvaluated ? '<i class="fas fa-check-circle mr-1"></i> Domains Graded' : '<i class="fas fa-edit mr-1"></i> Add Domains';

            tr.innerHTML = `
                <td class="px-3 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">${rec.student.name}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4 font-black text-primary-600 bg-primary-50/50 whitespace-nowrap w-24">
                    <span class="badge bg-primary-100 text-primary-800 px-2 py-1 rounded shadow-sm text-xs sm:text-sm border border-primary-200">${rec.position}</span>
                </td>
                <td class="px-3 py-3 sm:px-6 sm:py-4 text-right">
                    <div class="flex items-center justify-end gap-2 flex-wrap">
                        <button type="button" onclick="window.openDomainsModal('${rec.student.id}')" class="text-white ${evalBtnClass} font-medium rounded-lg text-xs px-2.5 py-1.5 sm:text-sm sm:px-3 sm:py-1.5 shadow-sm transition-colors whitespace-nowrap">
                            ${evalBtnText}
                        </button>
                        <button type="button" onclick="window.previewSingleResult('${rec.student.id}')" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-xs px-2.5 py-1.5 sm:text-sm sm:px-3 sm:py-1.5 shadow-sm transition-colors whitespace-nowrap">
                            <i class="fas fa-eye mr-1"></i> Preview
                        </button>
                        <button onclick="window.printSingleReport('${rec.student.id}')" class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-xs px-2.5 py-1.5 sm:text-sm sm:px-3 sm:py-1.5 shadow-sm transition-colors whitespace-nowrap">
                            <i class="fas fa-print mr-1"></i> Print PDF
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('rs-title').textContent = `${clsValue} Broadsheet`;
        document.getElementById('rs-broadsheet-container').classList.remove('hidden');
    };

    function getGlobalSettings() {
        let set = localStorage.getItem('globalResultSettings');
        if(set) return JSON.parse(set);
        return {
            session: "2024/2025",
            resumption: "9th September, 2025",
            principalName: "",
            headteacherName: "",
            principalSign: null,
            headteacherSign: null,
            activeTemplate: "classic",
            domains: [
                "Discipline", "Neatness", "Attentiveness", "Punctuality", 
                "Logical", "Leadership", "Teamwork", "Attendance", "Sports"
            ],
            psychomotorDomains: [
                "Handwriting", "Drawing & Painting", "Verbal Fluency", "Sports & Games", "Handling Tools"
            ]
        };
    }

    // -------------------------------------------------------------
    // DOMAINS MODAL SYSTEM
    // -------------------------------------------------------------
    window.openDomainsModal = function(studentId) {
        const student = currentBroadsheetData.find(r => r.student.id === studentId);
        if(!student) return;

        document.getElementById('evalTargetStudentId').value = studentId;
        const nameEl = document.getElementById('domains-student-name');
        if(nameEl) nameEl.textContent = `Evaluation for: ${student.student.name}`;

        const settings = getGlobalSettings();
        const existingEval = evalDomainsDb[studentId] || { 
            remark: "", headTeacherRemark: "", principalRemark: "", 
            domains: {}, psychomotor: {}, 
            attendance: {timesPresent: '', timesAbsent: ''},
            bills: {feePaid: '', arrears: ''}
        };

        const tplId = settings.activeTemplate || 'classic';
        const cap = window.TEMPLATE_REGISTRY && window.TEMPLATE_REGISTRY[tplId] ? window.TEMPLATE_REGISTRY[tplId].capabilities : {};

        // 1. Remarks
        let elHTRem = document.getElementById('evalHeadTeacherRemark'), elPRem = document.getElementById('evalPrincipalRemark'), elTRem = document.getElementById('evalTeacherRemark');
        if(elTRem) elTRem.value = existingEval.remark || '';
        if(elHTRem) elHTRem.value = existingEval.headTeacherRemark || '';
        if(elPRem) elPRem.value = existingEval.principalRemark || '';
        
        let tRemCon = document.getElementById('modal-teacher-remark-container');
        let hRemCon = document.getElementById('modal-headteacher-remark-container');
        let pRemCon = document.getElementById('modal-principal-remark-container');
        
        if(tRemCon) cap.teacherRemark ? tRemCon.classList.remove('hidden') : tRemCon.classList.add('hidden');
        if(hRemCon) cap.headTeacherRemark ? hRemCon.classList.remove('hidden') : hRemCon.classList.add('hidden');
        if(pRemCon) cap.principalRemark ? pRemCon.classList.remove('hidden') : pRemCon.classList.add('hidden');

        // 2. Affective Domains
        let affCon = document.getElementById('modal-affective-container');
        if(affCon) cap.affectiveDomains ? affCon.classList.remove('hidden') : affCon.classList.add('hidden');
        
        const container = document.getElementById('domains-inputs-container');
        if(container && settings.domains) {
            let html = '';
            settings.domains.forEach((dom) => {
                let score = (existingEval.domains && existingEval.domains[dom]) ? existingEval.domains[dom] : 3;
                html += `
                    <div>
                        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="${dom}">${dom}</label>
                        <select class="domain-score-eval bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" data-domain="${dom}">
                            <option value="5" ${score == 5 ? 'selected':''}>5 - Excellent</option>
                            <option value="4" ${score == 4 ? 'selected':''}>4 - Good</option>
                            <option value="3" ${score == 3 ? 'selected':''}>3 - Fair</option>
                            <option value="2" ${score == 2 ? 'selected':''}>2 - Poor</option>
                            <option value="1" ${score == 1 ? 'selected':''}>1 - Very Poor</option>
                        </select>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        // 3. Psychomotor Domains
        let psyCon = document.getElementById('modal-psychomotor-container');
        if(psyCon) cap.psychomotorDomains ? psyCon.classList.remove('hidden') : psyCon.classList.add('hidden');
        
        const psyContainer = document.getElementById('psychomotor-inputs-container');
        if(psyContainer && settings.psychomotorDomains) {
            let html = '';
            settings.psychomotorDomains.forEach((dom) => {
                let score = (existingEval.psychomotor && existingEval.psychomotor[dom]) ? existingEval.psychomotor[dom] : 3;
                html += `
                    <div>
                        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="${dom}">${dom}</label>
                        <select class="psychomotor-score-eval bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" data-domain="${dom}">
                            <option value="5" ${score == 5 ? 'selected':''}>5 - Excellent</option>
                            <option value="4" ${score == 4 ? 'selected':''}>4 - Good</option>
                            <option value="3" ${score == 3 ? 'selected':''}>3 - Fair</option>
                            <option value="2" ${score == 2 ? 'selected':''}>2 - Poor</option>
                            <option value="1" ${score == 1 ? 'selected':''}>1 - Very Poor</option>
                        </select>
                    </div>
                `;
            });
            psyContainer.innerHTML = html;
        }

        // 4. Bills
        let billCon = document.getElementById('modal-bills-container');
        if(billCon) cap.schoolBills ? billCon.classList.remove('hidden') : billCon.classList.add('hidden');
        let feePaidEl = document.getElementById('evalFeePaid'), feeArrEl = document.getElementById('evalFeeArrears');
        if(feePaidEl) feePaidEl.value = existingEval.bills?.feePaid || '';
        if(feeArrEl) feeArrEl.value = existingEval.bills?.arrears || '';

        // 5. Attendance Override
        let attCon = document.getElementById('modal-attendance-container');
        if(attCon) cap.attendance ? attCon.classList.remove('hidden') : attCon.classList.add('hidden');
        let tpEl = document.getElementById('evalTimesPresent'), taEl = document.getElementById('evalTimesAbsent');
        if(tpEl) tpEl.value = existingEval.attendance?.timesPresent || '';
        if(taEl) taEl.value = existingEval.attendance?.timesAbsent || '';

        const modal = document.getElementById('domains-eval-modal');
        if(modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    };

    window.closeDomainsModal = function() {
        const modal = document.getElementById('domains-eval-modal');
        if(modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    window.saveDomainEvaluations = function() {
        let elStd = document.getElementById('evalTargetStudentId');
        if(!elStd) return;
        const studentId = elStd.value;
        
        const remark = document.getElementById('evalTeacherRemark') ? document.getElementById('evalTeacherRemark').value : '';
        const headTeacherRemark = document.getElementById('evalHeadTeacherRemark') ? document.getElementById('evalHeadTeacherRemark').value : '';
        const principalRemark = document.getElementById('evalPrincipalRemark') ? document.getElementById('evalPrincipalRemark').value : '';
        
        const selects = document.querySelectorAll('.domain-score-eval');
        let domainsObj = {};
        selects.forEach(sel => { domainsObj[sel.getAttribute('data-domain')] = parseInt(sel.value); });
        
        const psySelects = document.querySelectorAll('.psychomotor-score-eval');
        let psychomotorObj = {};
        psySelects.forEach(sel => { psychomotorObj[sel.getAttribute('data-domain')] = parseInt(sel.value); });

        const timesPresent = document.getElementById('evalTimesPresent') ? document.getElementById('evalTimesPresent').value : '';
        const timesAbsent = document.getElementById('evalTimesAbsent') ? document.getElementById('evalTimesAbsent').value : '';
        
        const feePaid = document.getElementById('evalFeePaid') ? document.getElementById('evalFeePaid').value : '';
        const arrears = document.getElementById('evalFeeArrears') ? document.getElementById('evalFeeArrears').value : '';

        evalDomainsDb[studentId] = { 
            remark, headTeacherRemark, principalRemark, 
            domains: domainsObj, 
            psychomotor: psychomotorObj,
            attendance: {timesPresent, timesAbsent},
            bills: {feePaid, arrears}
        };
        
        localStorage.setItem('evalDomainsDb', JSON.stringify(evalDomainsDb));

        window.closeDomainsModal();
        
        // Soft-update the specific button visually to avoid destroying and regenerating the whole mock table
        const btn = document.querySelector(`button[onclick="window.openDomainsModal('${studentId}')"]`);
        if (btn) {
            btn.className = 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-300 font-medium rounded-lg text-xs px-2.5 py-1.5 sm:text-sm sm:px-3 sm:py-1.5 shadow-sm transition-colors whitespace-nowrap';
            btn.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Domains Graded';
        }
        
        // Use a less intrusive notification
        const rsToast = document.createElement('div');
        rsToast.className = 'fixed bottom-5 right-5 z-[999] bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl font-medium slide-up';
        rsToast.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Domains saved successfully.';
        document.body.appendChild(rsToast);
        setTimeout(() => rsToast.remove(), 3000);
    };

    // -------------------------------------------------------------
    // PDF GENERATION ENGINE
    // -------------------------------------------------------------
        function generatePrintTemplate(rec) {
        const settings = getGlobalSettings();
        const evals = evalDomainsDb[rec.student.id] || { remark: "No remark provided yet.", domains: {} };
        const clsValue = document.getElementById('rs-class').value || rec.student.class;
        const termValue = document.getElementById('rs-term').value || rec.student.term;
        const tpl = settings.activeTemplate || 'classic';

        const profile = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');

        const payload = window.buildPrintPayload(rec, {
            settings: settings,
            profile: profile,
            evals: evals,
            mode: 'term',
            classValue: clsValue,
            termValue: termValue,
            sessionValue: settings.session
        });
        payload._templateId = tpl;

        const innerHtml = window.renderTemplate(payload);
        return `<div class="result-pdf-wrapper relative w-[210mm] h-[296mm] overflow-hidden bg-white mx-auto py-[10mm] px-[15mm] box-border font-sans text-black">${innerHtml}</div>`;
    }





    // Modal Display Logic Connectors
    window.previewSingleResult = function(studentId) {
        if(currentBroadsheetData.length === 0) return;
        const rec = currentBroadsheetData.find(r => r.student.id === studentId);
        window.activePreviewStudentId = studentId;

        document.getElementById('rs-preview-title').textContent = `${rec.student.name} - Result Preview`;
        const previewContainer = document.getElementById('rs-preview-body');
        previewContainer.innerHTML = generatePrintTemplate(rec);
        
        // Dynamically scale the UI so it fits directly inside mobile & PC screens responsively!
        const scale = Math.min(1, (window.innerWidth - 30) / 794); // 794px ~ 210mm
        previewContainer.style.transform = `scale(${scale})`;
        const scaledHeight = 1122 * scale; // 1122px ~ 297mm
        previewContainer.parentElement.style.height = `${scaledHeight + 100}px`; // Provide scroll padding
        
        const modal = document.getElementById('rs-preview-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    };

    window.closePreviewModal = function() {
        document.getElementById('rs-preview-modal').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    window.printSinglePDF = function() {
        if(window.activePreviewStudentId) {
            window.printSingleReport(window.activePreviewStudentId);
        }
    };

    window.printSingleReport = function(studentId) {
        if(currentBroadsheetData.length === 0) return;
        const rec = currentBroadsheetData.find(r => r.student.id === studentId);
        buildPrintContainer([rec]);
        window.print();
    };

    window.printAllReports = function() {
        if(currentBroadsheetData.length === 0) return;
        buildPrintContainer(currentBroadsheetData);
        window.print();
    };

    function buildPrintContainer(recordsToPrint) {
        const container = document.getElementById('print-container');
        container.innerHTML = '';
        recordsToPrint.forEach((rec) => {
            const page = document.createElement('div');
            page.className = 'print-page-break';
            page.innerHTML = generatePrintTemplate(rec);
            container.appendChild(page);
        });
    }

    setTimeout(initialize, 100);
})();
