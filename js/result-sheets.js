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
        const termValue = document.getElementById('rs-term').value;

        if(!clsValue) return;

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
            class: clsValue,
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
        records.forEach((rec, idx) => { rec.positionInt = idx + 1; rec.position = getOrdinal(idx + 1); });

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
            domains: [
                "Discipline", "Neatness", "Attentiveness", "Punctuality", 
                "Logical", "Leadership", "Teamwork", "Attendance", "Sports"
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
        document.getElementById('domains-student-name').textContent = `Evaluation for: ${student.student.name}`;

        const settings = getGlobalSettings();
        const existingEval = evalDomainsDb[studentId] || { remark: "", domains: {} };

        document.getElementById('evalTeacherRemark').value = existingEval.remark;

        const container = document.getElementById('domains-inputs-container');
        let html = '';
        settings.domains.forEach((dom) => {
            let score = existingEval.domains[dom] || 3;
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

        document.getElementById('domains-eval-modal').classList.remove('hidden');
        document.getElementById('domains-eval-modal').classList.add('flex');
    };

    window.closeDomainsModal = function() {
        document.getElementById('domains-eval-modal').classList.add('hidden');
        document.getElementById('domains-eval-modal').classList.remove('flex');
    };

    window.saveDomainEvaluations = function() {
        const studentId = document.getElementById('evalTargetStudentId').value;
        const remark = document.getElementById('evalTeacherRemark').value;
        const selects = document.querySelectorAll('.domain-score-eval');
        
        let domainsObj = {};
        selects.forEach(sel => {
            domainsObj[sel.getAttribute('data-domain')] = parseInt(sel.value);
        });

        evalDomainsDb[studentId] = { remark, domains: domainsObj };
        localStorage.setItem('evalDomainsDb', JSON.stringify(evalDomainsDb));

        window.closeDomainsModal();
        window.loadBroadsheet(); // Refresh Broadsheet so the button visually updates to Graded / Green immediately
        
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

        let html = `
        <div class="result-pdf-wrapper" style="width: 210mm; height: 297mm; max-height: 297mm; overflow: hidden; background: white; margin: 0 auto; padding: 10mm 15mm; page-break-after: always; box-sizing: border-box; font-family: 'Inter', sans-serif;">
            
            <!-- HEADER -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px;">
                <img src="../../assets/images/logo.png" style="height: 60px;">
                <div style="text-align: center;">
                    <h1 style="color: #1e3a8a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase;">St. Augustine College</h1>
                    <p style="margin: 0; font-size: 11px; color: #4b5563;">123 Education Boulevard, Excellence City</p>
                    <p style="margin: 0; font-size: 11px; color: #4b5563;">info@staugustine.edu | www.staugustine.edu</p>
                </div>
                <div style="width: 60px; height: 75px; border: 1px solid #d1d5db; display: flex; align-items: center; justify-content: center; background: #f3f4f6; font-size: 10px; color: #9ca3af; overflow: hidden;">
                    <img src="https://ui-avatars.com/api/?name=${rec.student.name}&background=1e3a8a&color=fff" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>

            <!-- TITLE -->
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="font-size: 15px; font-weight: 800; text-decoration: underline; margin: 0; padding: 4px; background: #1e3a8a; color: white; display: inline-block;">TERMLY STUDENT PROGRESS REPORT</h2>
            </div>
            
            <!-- STUDENT BIO DATA -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1; width: 15%;">Student Name:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1; width: 35%;">${rec.student.name}</td>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1; width: 15%;">Admission No:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1; width: 35%;">ADM-${rec.student.roll}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1;">Class:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${clsValue}</td>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1;">Academic Session:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${settings.session}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1;">Term:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${termValue}</td>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1;">Position in Class:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: 900;">${rec.position}</td>
                </tr>
            </table>
        `;

        let thHtml = `<th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left; width: 22%;">SUBJECT</th>`;
        rec.structure.components.forEach(c => {
            thHtml += `<th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${c.name.toUpperCase()} /${c.weight}</th>`;
        });
        thHtml += `
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">TOTAL</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">GRD</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">REMARK</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">HIGH</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">LOW</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">POS</th>
        `;

        let tbodyHtml = '';
        rec.subjects.forEach((sub, subIdx) => {
            let trHtml = `<td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${sub.subject}</td>`;
            rec.structure.components.forEach(c => {
                trHtml += `<td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${sub.components[c.name].score}</td>`;
            });
            trHtml += `
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900;">${sub.total}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${sub.grade}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: left; font-size: 10px;">${sub.remark}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${sub.highest}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${sub.lowest}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${sub.position}</td>
            `;
            tbodyHtml += `<tr style="font-size: 11px;">${trHtml}</tr>`;
        });

        html += `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <thead style="background: #f1f5f9; font-size: 10px;"><tr>${thHtml}</tr></thead>
                <tbody>${tbodyHtml}</tbody>
                <tfoot style="background: #e2e8f0; font-weight: bold; font-size: 12px;">
                    <tr>
                        <td colspan="${rec.structure.components.length + 1}" style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">OVERALL TOTAL:</td>
                        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; color: #1e3a8a;">${rec.grandTotal}</td>
                        <td colspan="5" style="border: 1px solid #cbd5e1;"></td>
                    </tr>
                </tfoot>
            </table>
        `;

        // DYNAMIC DOMAINS 
        const doms = settings.domains;
        const half = Math.ceil(doms.length / 2);
        const leftDoms = doms.slice(0, half);
        const rightDoms = doms.slice(half);

        let leftRows = leftDoms.map(d => `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 2px;">${d}</td><td style="text-align: right; font-weight: bold; width: 25px;">${evals.domains[d] || 3}</td></tr>`).join('');
        let rightRows = rightDoms.map(d => `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 2px;">${d}</td><td style="text-align: right; font-weight: bold; width: 25px;">${evals.domains[d] || 3}</td></tr>`).join('');

        // Signature checks
        let prinSignHtml = settings.principalSign ? `<img src="${settings.principalSign}" style="max-height: 25px; object-fit: contain; margin-bottom: 2px;">` : `<div style="height: 25px;"></div>`;
        let headSignHtml = settings.headteacherSign ? `<img src="${settings.headteacherSign}" style="max-height: 25px; object-fit: contain; margin-bottom: 2px;">` : `<div style="height: 25px;"></div>`;

        html += `
            <div style="display: flex; gap: 15px; margin-top: auto;">
                <div style="flex: 1;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
                        <thead style="background: #1e3a8a; color: white;"><tr><th colspan="2" style="padding: 4px; text-align: left;">AFFECTIVE & PSYCHOMOTOR</th></tr></thead>
                        <tbody>
                            <tr>
                                <td style="padding: 2px 4px; border-right: 1px solid #cbd5e1; vertical-align: top; width: 50%;">
                                    <table style="width: 100%; border-collapse: collapse;">${leftRows}</table>
                                </td>
                                <td style="padding: 2px 4px; vertical-align: top; width: 50%;">
                                    <table style="width: 100%; border-collapse: collapse;">${rightRows}</table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size: 8px; color: #64748b; margin-top: 3px; text-align: center;">Scale: 5 (Excellent), 4 (Good), 3 (Fair), 2 (Poor), 1 (Very Poor)</div>
                </div>

                <div style="flex: 2; border: 1px solid #cbd5e1; padding: 10px; background: #f8fafc; font-size: 11px; display: flex; flex-direction: column;">
                    <div style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: auto; min-height: 40px;">
                        <span style="font-weight: bold;">Teacher's Remark:</span> ${evals.remark}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px;">
                        <div style="text-align: center;">
                            ${headSignHtml}
                            <div style="border-top: 1px solid black; width: 100px; padding-top: 3px;">
                                <b style="font-size: 10px;">${settings.headteacherName}</b><br><span style="font-size: 9px;">Head Teacher</span>
                            </div>
                        </div>
                        <div style="text-align: center; color: #b91c1c; font-weight: bold; font-size: 10px; background: #fee2e2; padding: 4px 8px; border-radius: 4px;">
                            Resumption: ${settings.resumption}
                        </div>
                        <div style="text-align: center;">
                            ${prinSignHtml}
                            <div style="border-top: 1px solid black; width: 100px; padding-top: 3px;">
                                <b style="font-size: 10px;">${settings.principalName}</b><br><span style="font-size: 9px;">Principal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('../../assets/images/logo.png'); background-position: center; background-repeat: no-repeat; opacity: 0.03; pointer-events: none; z-index: -1;"></div>
        </div>
        `;
        return html;
    }

    // Modal Display Logic Connectors
    window.previewSingleResult = function(studentId) {
        if(currentBroadsheetData.length === 0) return;
        const rec = currentBroadsheetData.find(r => r.student.id === studentId);
        window.activePreviewStudentId = studentId;

        document.getElementById('rs-preview-title').textContent = `${rec.student.name} - Result Preview`;
        const previewContainer = document.getElementById('rs-preview-body'); // Changed to strictly target inner content box
        previewContainer.innerHTML = generatePrintTemplate(rec);
        
        document.getElementById('rs-preview-modal').classList.remove('hidden');
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
