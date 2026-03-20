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
        const tpl = settings.activeTemplate || 'classic';

        const profile = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');
        const schName = profile.name || "St. Augustine College";
        const schAddress = profile.address || "123 Education Boulevard, Excellence City";
        const schContact = `${profile.email || 'info@school.com'} | ${profile.website || 'www.school.com'}`;
        const schMotto = profile.motto || "Knowledge is Power";
        const schLogo = profile.logo || "../../assets/images/logo.png";

        let thHtml = `<th class="p-1.5 border border-slate-300 text-left w-[22%]">SUBJECT</th>`;
        rec.structure.components.forEach(c => {
            thHtml += `<th class="p-1.5 border border-slate-300 text-center">${c.name.toUpperCase()} /${c.weight}</th>`;
        });
        thHtml += `
            <th class="p-1.5 border border-slate-300 text-center">TOTAL</th>
            <th class="p-1.5 border border-slate-300 text-center">GRD</th>
            <th class="p-1.5 border border-slate-300 text-left">REMARK</th>
            <th class="p-1.5 border border-slate-300 text-center">HIGH</th>
            <th class="p-1.5 border border-slate-300 text-center">LOW</th>
            <th class="p-1.5 border border-slate-300 text-center">POS</th>`;

        let tbodyHtml = '';
        rec.subjects.forEach((sub) => {
            let trHtml = `<td class="p-1.5 border border-slate-300 font-bold">${sub.subject}</td>`;
            rec.structure.components.forEach(c => {
                trHtml += `<td class="p-1.5 border border-slate-300 text-center">${sub.components[c.name].score}</td>`;
            });
            trHtml += `
                <td class="p-1.5 border border-slate-300 text-center font-black">${sub.total}</td>
                <td class="p-1.5 border border-slate-300 text-center font-bold">${sub.grade}</td>
                <td class="p-1.5 border border-slate-300 text-left text-[10px]">${sub.remark}</td>
                <td class="p-1.5 border border-slate-300 text-center">${sub.highest}</td>
                <td class="p-1.5 border border-slate-300 text-center">${sub.lowest}</td>
                <td class="p-1.5 border border-slate-300 text-center">${sub.position}</td>`;
            tbodyHtml += `<tr class="text-[11px]">${trHtml}</tr>`;
        });

        const doms = settings.domains;
        const half = Math.ceil(doms.length / 2);
        const leftRows = doms.slice(0, half).map(d => `<tr class="border-b border-slate-200"><td class="p-0.5">${d}</td><td class="text-right font-bold w-[25px]">${evals.domains[d] || 3}</td></tr>`).join('');
        const rightRows = doms.slice(half).map(d => `<tr class="border-b border-slate-200"><td class="p-0.5">${d}</td><td class="text-right font-bold w-[25px]">${evals.domains[d] || 3}</td></tr>`).join('');

        let prinSignHtml = settings.principalSign ? `<img src="${settings.principalSign}" class="max-h-[25px] object-contain mb-[2px]">` : `<div class="h-[25px]"></div>`;
        let headSignHtml = settings.headteacherSign ? `<img src="${settings.headteacherSign}" class="max-h-[25px] object-contain mb-[2px]">` : `<div class="h-[25px]"></div>`;

        // BASE WRAPPER
        let html = `<div class="result-pdf-wrapper relative w-[210mm] h-[296mm] overflow-hidden bg-white mx-auto py-[10mm] px-[15mm] box-border font-sans text-black">`;
        
        
        const promoteRule = parseInt(localStorage.getItem('sms_promotion_rule') || 50);
        const isPromoted = rec.average >= promoteRule;
        const pBadge = isPromoted 
            ? `<span class="px-2 py-0.5 ml-2 border border-green-300 rounded text-[9px] font-black text-green-700 bg-green-50 shadow-sm uppercase print:text-green-700 print:bg-transparent">PROMOTED</span>`
            : `<span class="px-2 py-0.5 ml-2 border border-red-300 rounded text-[9px] font-black text-red-700 bg-red-50 shadow-sm uppercase print:text-red-700 print:bg-transparent">FAILED</span>`;
        
        const pStatus = isPromoted ? "PROMOTED TO NEXT CLASS" : "REPEATED";

        // TEMPLATE SWITCHER
        if(tpl === 'modern') {
            html += `
            <div class="flex items-center gap-4 bg-primary-800 text-white p-4 rounded-t-xl mb-4">
                <img src="${schLogo}" class="h-16 w-16 object-contain bg-white rounded p-1">
                <div class="flex-1">
                    <h1 class="text-2xl font-black uppercase tracking-wide m-0">${schName}</h1>
                    <p class="text-xs text-primary-100 m-0">${schContact}</p>
                    <p class="text-xs text-primary-200 capitalize italic mt-1 font-semibold">${schMotto}</p>
                </div>
            </div>
            <div class="text-center mb-4"><h2 class="text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-100 py-1 inline-block px-4 rounded-full border border-gray-300">Termly Academic Report</h2></div>
            <div class="grid grid-cols-4 gap-2 mb-4 text-[10px]">
                <div class="bg-gray-50 border border-gray-200 p-2 rounded"><div class="text-gray-500 uppercase font-bold text-[8px]">Student Name</div><div class="font-bold text-sm truncate">${rec.student.name}</div></div>
                <div class="bg-gray-50 border border-gray-200 p-2 rounded"><div class="text-gray-500 uppercase font-bold text-[8px]">Admission No</div><div class="font-bold">ADM-${rec.student.roll}</div></div>
                <div class="bg-gray-50 border border-gray-200 p-2 rounded"><div class="text-gray-500 uppercase font-bold text-[8px]">Class & Term</div><div class="font-bold">${clsValue} | ${termValue}</div></div>
                <div class="bg-primary-50 border border-primary-200 p-2 rounded flex flex-col justify-center">
                    <div class="font-black text-primary-800 text-[9px] leading-tight">Overall: ${rec.position} (${rec.average}%)</div>
                    <div class="font-black text-primary-800 text-[9px] leading-tight mb-1">Section: ${rec.sectionPosition} (${rec.sectionAverage}%)</div>
                    <div>${pBadge}</div>
                </div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="bg-primary-50 text-[10px] text-primary-900 border-t-2 border-b-2 border-primary-300"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="bg-gray-50 font-bold text-xs border-t-2 border-gray-300"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right">OVERALL TOTAL:</td><td class="p-1.5 text-center text-primary-700">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        
        } else if(tpl === 'radiant') {
            // Radiant requires custom table generator for vertical headers
            let radTh = `<th class="p-1.5 border border-gray-400 text-left font-bold align-bottom w-[20%]">Subject</th>`;
            rec.structure.components.forEach(c => {
                radTh += `<th class="border border-gray-400 align-bottom h-[100px] w-8">
                            <div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold whitespace-nowrap">${c.name} (${c.weight}%)</div>
                          </th>`;
            });
            radTh += `
                <th class="border border-gray-400 align-bottom h-[100px] w-8"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Total Score</div></th>
                <th class="border border-gray-400 align-bottom h-[100px] w-8"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Grade</div></th>
                <th class="border border-gray-400 align-bottom h-[100px] w-8"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Position</div></th>
                <th class="p-1.5 border border-gray-400 align-bottom font-bold text-center">Remark</th>
            `;

            let radTb = '';
            rec.subjects.forEach(sub => {
                let tr = `<td class="p-1.5 border border-gray-400 font-bold">${sub.subject}</td>`;
                rec.structure.components.forEach(c => {
                    tr += `<td class="p-1.5 border border-gray-400 text-center">${sub.components[c.name] ? sub.components[c.name].score : ''}</td>`;
                });
                tr += `
                    <td class="p-1.5 border border-gray-400 text-center font-black">${sub.total}</td>
                    <td class="p-1.5 border border-gray-400 text-center font-bold">${sub.grade}</td>
                    <td class="p-1.5 border border-gray-400 text-center">${sub.position}</td>
                    <td class="p-1.5 border border-gray-400 text-center text-[10px]">${sub.remark}</td>
                `;
                radTb += `<tr class="text-[11px] border-b border-gray-400">${tr}</tr>`;
            });

            html += `
            <div class="h-full border-[2px] border-blue-900/20 p-[5mm] box-border relative">
                <div class="flex items-center justify-between border-b-[3px] border-blue-800 pb-[10px] mb-[10px]">
                    <img src="${schLogo}" class="h-[75px] w-[80px] object-contain object-left">
                    <div class="flex-1 text-center px-4 shrink-0">
                        <h1 class="text-[26px] font-black tracking-wide m-0" style="color: #1e3a8a;">${schName}</h1>
                        <p class="text-[11px] font-bold text-blue-900 m-0">${schAddress}</p>
                        <p class="text-[10px] text-gray-600 mt-[2px] font-medium">Motto: ${schMotto}</p>
                        <div class="text-[14px] font-extrabold mt-[5px] uppercase tracking-widest text-gray-800">Termly Academic Report</div>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=${rec.student.name}&background=1e3a8a&color=fff" class="h-[80px] w-[70px] object-cover border-2 border-gray-300 rounded shadow-sm">
                </div>
                
                <div class="text-[10px] font-bold text-gray-800 leading-tight space-y-1 mb-[10px]">
                    <div>Registration number: <span class="font-normal border-b border-dotted border-gray-400 pb-[1px] uppercase">ADM-${rec.student.roll}</span></div>
                    <div>Name: <span class="font-normal border-b border-dotted border-gray-400 pb-[1px] uppercase">${rec.student.name}</span></div>
                    <div>Academic session: <span class="font-normal">${settings.session}</span> &nbsp;&nbsp; Term: <span class="font-normal">${termValue}</span> &nbsp;&nbsp; Class: <span class="font-normal">${clsValue}</span></div>
                </div>

                <div class="flex-1">
                    <table class="w-full border-collapse text-[10px]">
                        <thead class="bg-gray-600 text-white border-2 border-gray-600">
                            <tr>${radTh}</tr>
                        </thead>
                        <tbody class="border-2 border-gray-500">
                            ${radTb}
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-[10px] border border-green-700 rounded overflow-hidden">
                    <div class="bg-green-700/10 text-green-800 px-2 py-0.5 text-[9px] font-bold border-b border-green-700">Key to Grades:</div>
                    <div class="p-1 px-2 text-[8px] text-gray-700 leading-snug">
                        PV (Fail) = Below 40%, E8 (Pass) = 40% ≤ 45%, D7 (Pass) = 45% ≤ 50%, C6 (Credit) = 50% ≤ 60%, C5 (Credit) = 60% ≤ 65%, C4 (Credit) = 65% ≤ 70%, B3 (Distinction) = 70% ≤ 75%, B2 (Distinction) = 75% ≤ 80%, A1 (Excellent) = 80% & Above.
                    </div>
                </div>

                <div class="border-[2px] border-blue-900/30 rounded p-[8mm] mt-[10px] text-[10px] relative">
                    <div class="font-bold flex gap-[15px] mb-2 flex-wrap">
                        <span>Total: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.grandTotal}</span></span>
                        <span>Overall Avg: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.average}%</span></span>
                        <span>Overall Pos: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.position}</span></span>
                        <span>Class Avg: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.sectionAverage}%</span></span>
                        <span>Class Pos: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.sectionPosition}</span></span>
                        ${pBadge}
                    </div>
                    <div class="mb-3">
                        <span class="font-bold text-blue-900">Form Teacher's Remark:</span> 
                        <span class="italic text-gray-700 border-b border-dotted border-gray-400">${evals.remark}</span>
                    </div>
                    
                    <div class="flex justify-between mt-6">
                        <div class="text-center w-[150px]">
                            ${headSignHtml}
                            <div class="border-t border-black pt-1 font-bold text-[10px]">${settings.headteacherName}</div>
                            <div class="italic text-[9px] text-gray-500 uppercase">Form Teacher</div>
                        </div>
                        <div class="text-center w-[150px]">
                            ${prinSignHtml}
                            <div class="border-t border-black pt-1 font-bold text-[10px]">${settings.principalName}</div>
                            <div class="italic text-[9px] text-gray-500 uppercase">Principal</div>
                        </div>
                    </div>
                </div>
                <!-- Watermark -->
                <div class="absolute inset-0 pointer-events-none opacity-[0.04] bg-center bg-no-repeat bg-[length:60%] z-[-1]" style="background-image: url('${schLogo}');"></div>
            </div>
            `;
        
        } else if(tpl === 'chart') {
            let chartTh = `<th class="p-1 border border-gray-400 text-center w-6">S/N</th><th class="p-1 border border-gray-400 text-left">SUBJECT</th>`;
            rec.structure.components.forEach(c => {
                chartTh += `<th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">${c.name}(${c.weight})</div></th>`;
            });
            chartTh += `
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1 font-bold">TOTAL</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">CLASS HIGHEST</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">CLASS LOWEST</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">POSITION</div></th>
                <th class="p-1 border border-gray-400 text-center font-bold">GRADE</th>
                <th class="p-1 border border-gray-400 text-center font-bold">REMARK</th>
            `;

            let chartTb = '';
            let chartBars = '';
            rec.subjects.forEach((sub, idx) => {
                let tr = `<td class="p-1 border border-gray-400 text-center">${idx + 1}</td><td class="p-1 border border-gray-400 font-bold">${sub.subject}</td>`;
                rec.structure.components.forEach(c => {
                    tr += `<td class="p-1 border border-gray-400 text-center">${sub.components[c.name] ? sub.components[c.name].score : ''}</td>`;
                });
                tr += `
                    <td class="p-1 border border-gray-400 text-center font-black">${sub.total}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.highest}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.lowest}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.position}</td>
                    <td class="p-1 border border-gray-400 text-center font-bold">${sub.grade}</td>
                    <td class="p-1 border border-gray-400 text-left text-[9px] font-bold">${sub.remark}</td>
                `;
                chartTb += `<tr class="text-[10px] border-b border-gray-400 hover:bg-gray-50">${tr}</tr>`;
                
                // Chart builder
                let h = sub.total;
                let subName = sub.subject.substring(0, 4).toUpperCase();
                chartBars += `
                <div class="flex flex-col items-center justify-end h-full w-[25px] flex-shrink-0 group">
                    <div class="text-[7px] mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">${h}%</div>
                    <div class="w-full bg-gradient-to-t from-gray-600 to-gray-400 border border-gray-500 shadow-sm transition-all" style="height: ${h}%;"></div>
                    <div class="text-[7px] font-bold mt-1 w-full text-center truncate" title="${sub.subject}">${subName}</div>
                </div>`;
            });

            html += `
            <div class="h-[296mm] border-[1px] border-gray-300 p-[10mm] box-border relative font-sans flex flex-col bg-white print:border-none print:p-0">
                <div class="flex items-center justify-between border-b-2 border-double border-gray-800 pb-2 mb-4">
                    <img src="${schLogo}" class="h-16 w-16 object-contain">
                    <div class="flex-1 text-center">
                        <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ministry of Education</div>
                        <h1 class="text-2xl font-black text-gray-900 tracking-wider m-0 uppercase">${schName}</h1>
                        <p class="text-[10px] text-gray-700 italic font-semibold">MOTTO: ${schMotto}</p>
                    </div>
                </div>
                
                <h2 class="text-center text-[13px] font-extrabold pb-1 mb-4 border-b border-gray-400 tracking-wider">STUDENT TERMLY CONTINUOUS ASSESSMENT RECORD</h2>
                
                <div class="grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-800 mb-4 px-2">
                    <div class="space-y-1">
                        <div>NAME: <span class="font-normal border-b border-dotted border-gray-500 min-w-[150px] inline-block uppercase text-[11px]">${rec.student.name}</span></div>
                        <div>SESSION: <span class="font-normal">${settings.session}</span></div>
                        <div>OVERALL AVG: <span class="font-normal text-[12px] text-gray-900">${rec.average}%</span></div>
                        <div>OVERALL POS: <span class="font-normal text-[12px] text-gray-900">${rec.position}</span></div>
                    </div>
                    <div class="space-y-1">
                        <div>TERM: <span class="font-normal border-b border-dotted border-gray-500 min-w-[100px] inline-block">${termValue}</span></div>
                        <div>TOTAL SCORE: <span class="font-normal font-black text-[12px] text-gray-900">${rec.grandTotal}</span></div>
                    </div>
                    <div class="space-y-1">
                        <div>CLASS: <span class="font-normal border-b border-dotted border-gray-500 min-w-[100px] inline-block">${clsValue}</span></div>
                        <div>CLASS AVG: <span class="font-normal text-[12px] text-gray-900">${rec.sectionAverage}%</span></div>
                        <div>CLASS POS: <span class="font-normal text-[12px] text-gray-900">${rec.sectionPosition}</span></div>
                        <div class="mt-1">${pBadge}</div>
                    </div>
                </div>

                <div class="text-center font-bold text-[11px] bg-gray-100 border border-gray-400 py-1 uppercase tracking-widest border-b-0">Academic Performance</div>
                <table class="w-full border-collapse text-[10px] mb-2 flex-1">
                    <thead class="bg-gray-100 border-2 border-gray-600">
                        <tr>${chartTh}</tr>
                    </thead>
                    <tbody class="border-2 border-gray-500 font-medium">
                        ${chartTb}
                    </tbody>
                </table>
                
                <div class="text-[8px] font-bold text-gray-700 mb-2 px-1 tracking-tight">
                    Grade Scale: 70-100: A, 60-69: B, 50-59: C, 45-49: D, 40-44: E, 0-39: F
                </div>
                
                <div class="grid grid-cols-2 text-[9px] font-bold text-gray-800 mb-4 px-2">
                    <div>Vacation Date: <span class="font-normal min-w-[100px] border-b border-dotted border-gray-400 inline-block"></span></div>
                    <div>Resumption Date: <span class="font-normal min-w-[100px] border-b border-dotted border-gray-400 inline-block">${settings.resumption}</span></div>
                    <div class="col-span-2 mt-3">Principal: <span class="font-bold border-b border-dotted border-gray-600 inline-block min-w-[200px] uppercase text-[10px] pb-0.5">${settings.principalName}</span></div>
                </div>

                <!-- Performance Chart Component! -->
                <div class="mt-auto border-2 border-gray-400 bg-gray-50 h-[100px] relative rounded shadow-inner p-2 w-full max-w-[80%] mx-auto">
                    <div class="absolute top-1 left-2 font-bold text-[8px] bg-gray-600 text-white px-2 py-0.5 rounded shadow-sm opacity-80">Performance Chart</div>
                    
                    <!-- Y axis lines purely visual -->
                    <div class="absolute inset-0 top-6 bottom-4 flex flex-col justify-between px-2 pt-1 z-[1] select-none text-[6px] text-gray-400">
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">100</span></div>
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">75</span></div>
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">50</span></div>
                        <div class="border-b border-gray-300 w-full absolute bottom-0"><span class="absolute -left-3 -top-1.5">0</span></div>
                    </div>
                    
                    <!-- Graph Plot -->
                    <div class="flex items-end justify-center gap-1.5 h-full pt-[20px] pb-[16px] z-[2] relative overflow-hidden">
                        ${chartBars}
                    </div>
                </div>
                
            </div>
            `;
        
        } else if(tpl === 'comprehensive') {
            
            let compTh = `<th class="p-1 border-[1.5px] border-black text-left w-[20%] text-[10px]">SUBJECTS</th>`;
            rec.structure.components.forEach(c => {
                compTh += `<th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">${c.name.toUpperCase()}</th>`;
            });
            compTh += `
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">TOTAL</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">GRADE</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[10%]">REMARK</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">RANK</th>
                
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">1ST TERM</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">2ND TERM</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">3RD TERM</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">CUM. TOTAL</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">CUM. AVG</th>
            `;

            let compTb = '';
            rec.subjects.forEach((sub, idx) => {
                // Determine CSS colors for grades (e.g. A is green, D is orange)
                let clr = "text-black";
                if(sub.grade.includes('A')) clr = "text-green-700 font-black";
                else if(sub.grade.includes('B')) clr = "text-green-600 font-bold";
                else if(sub.grade.includes('C')) clr = "text-blue-600 font-bold";
                else if(sub.grade.includes('D')) clr = "text-orange-600 font-bold";
                else if(sub.grade.includes('E') || sub.grade.includes('F')) clr = "text-red-700 font-black";

                let tr = `<td class="p-1 border-[1.5px] border-black font-extrabold text-[9px] uppercase">${sub.subject}</td>`;
                rec.structure.components.forEach(c => {
                    tr += `<td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">${sub.components[c.name] ? sub.components[c.name].score : ''}</td>`;
                });
                tr += `
                    <td class="p-1 border-[1.5px] border-black text-center font-black text-[10px]">${sub.total}</td>
                    <td class="p-1 border-[1.5px] border-black text-center text-[10px] ${clr}">${sub.grade}</td>
                    <td class="p-1 border-[1.5px] border-black text-center text-[8px] uppercase ${clr}">${sub.remark}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">${sub.position}</td>
                    
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px] text-gray-500">-</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px] text-gray-500">-</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">${sub.total}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">-</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">-</td>
                `;
                compTb += `<tr class="border-b-[1.5px] border-black">${tr}</tr>`;
            });

            html += `
            <div class="h-[296mm] border-none p-[5mm] box-border relative font-sans flex flex-col bg-white overflow-hidden text-black print:m-0 print:p-0">
                <!-- Header Component -->
                <div class="flex items-center justify-between pb-1 mb-2">
                    <img src="${schLogo}" class="h-16 w-16 object-contain self-start">
                    <div class="flex-1 text-center">
                        <h1 class="text-[20px] font-black tracking-wide m-0 text-blue-800 uppercase" style="text-shadow: 1px 1px 0px rgba(0,0,0,0.1); font-family: 'Times New Roman', serif;">${schName}</h1>
                        <p class="text-[10px] font-bold text-blue-900 m-0 leading-tight">${schAddress}</p>
                        <p class="text-[10px] text-blue-900 leading-tight">Tel: ${schContact}</p>
                        <h2 class="text-[15px] font-bold text-red-700 mt-1 uppercase tracking-widest">STUDENT GRADE REPORT</h2>
                    </div>
                </div>
                
                <div class="bg-black text-white text-center font-bold uppercase tracking-widest text-[12px] py-1 mb-1">
                    ${termValue.toUpperCase()} - ${settings.session} ACADEMIC SESSION
                </div>
                
                <table class="w-full border-collapse border-[2px] border-black text-[10px] mb-1 font-bold">
                    <tr>
                        <td class="p-1 border-[1.5px] border-black w-1/2 uppercase">Name of Student: <span class="text-[12px] ml-1">${rec.student.name}</span></td>
                        <td class="p-1 border-[1.5px] border-black w-1/3">ADMISSION NO.: <span class="text-[11px] ml-1">${rec.student.roll}</span></td>
                        <td class="p-1 border-[1.5px] border-black w-1/6">GENDER: <span class="text-[11px] ml-1">-</span></td>
                    </tr>
                    <tr>
                        <td colspan="2" class="p-1 border-[1.5px] border-black uppercase text-[11px]">School Section: <span class="ml-1">SECONDARY</span></td>
                        <td class="p-1 border-[1.5px] border-black uppercase text-[11px]">Class: <span class="ml-1">${clsValue}</span></td>
                    </tr>
                </table>
                
                <div class="bg-black text-white text-center font-bold text-[10px] uppercase tracking-widest py-0.5">ATTENDANCE RECORD</div>
                <table class="w-full border-collapse border-[2px] border-black text-[9px] mb-1 font-bold text-center">
                    <tr class="bg-gray-100">
                        <td class="p-1 border-[1.5px] border-black w-1/5">TIMES SCHOOL OPENED</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">DAYS PRESENT</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">DAYS ABSENT</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">THIS TERM ENDS</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">NEXT TERM BEGINS</td>
                    </tr>
                    <tr>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">${settings.resumption}</td>
                    </tr>
                </table>

                <div class="bg-black text-white text-center font-bold text-[10px] uppercase tracking-widest py-0.5">ACADEMIC ASSESSMENT</div>
                
                <table class="w-full border-collapse border-[2px] border-black text-[10px] mb-1">
                    <thead class="bg-gray-100">
                        <tr>
                            <td colspan="${rec.structure.components.length + 4}" class="p-1 border-[1.5px] border-black text-center font-bold text-[11px]">TERMLY RESULT</td>
                            <td colspan="5" class="p-1 border-[1.5px] border-black text-center font-bold text-[11px] bg-gray-200">CUMULATIVE RESULT</td>
                        </tr>
                        <tr>${compTh}</tr>
                    </thead>
                    <tbody class="border-[1.5px] border-black">
                        ${compTb}
                    </tbody>
                </table>
                
                <div class="bg-black text-white text-center font-bold text-[9px] uppercase tracking-widest py-0.5">KEYS TO GRADING</div>
                <table class="w-full border-collapse border-[2px] border-black text-[8px] font-bold text-center mb-1">
                    <tr>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-green-700">EXCELLENT:</span><br/>100 - 80 => A</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-green-600">GOOD:</span><br/>79 - 60 => B</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-blue-600">SATISFACTORY:</span><br/>59 - 50 => C</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-orange-600">PASS:</span><br/>49 - 40 => D</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-red-700">FAIL:</span><br/>39 - 0 => E/F</td>
                    </tr>
                </table>
                
                <div class="flex border-[2px] border-black mb-1">
                    <div class="flex-1 flex flex-col">
                        <div class="bg-black text-white text-center font-bold text-[9px] uppercase tracking-widest py-0.5 border-b-[2px] border-black">TERMLY RESULT SUMMARY</div>
                        <div class="flex flex-1 items-center">
                            <div class="w-1/2 p-2 border-r-[1.5px] border-black flex flex-col justify-center h-full">
                                <div class="text-[9px]">TOTAL SCORE: <span class="font-black text-[10px] ml-1">${rec.grandTotal}</span></div>
                                <div class="text-[9px] mt-1">OVERALL AVG: <span class="font-black text-[10px] ml-1">${rec.average}%</span></div>
                                <div class="text-[9px] mt-1">CLASS AVG: <span class="font-black text-[10px] ml-1">${rec.sectionAverage}%</span></div>
                            </div>
                            <div class="w-1/2 p-2 text-center text-[9px] font-semibold flex flex-col justify-center">
                                OVERALL RANK:<br/><span class="font-black text-[12px]">${rec.position}</span>
                                <div class="mt-1 border-t border-black pt-1">CLASS RANK:<br/><span class="font-black text-[12px]">${rec.sectionPosition}</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="w-[25%] flex flex-col border-l-[2px] border-black">
                        <div class="flex-1 p-2 text-center flex flex-col justify-center items-center">
                            <span class="font-bold text-[10px]">CUMULATIVE RESULT STATUS:</span>
                            <div class="mt-2">${pBadge}</div>
                        </div>
                    </div>
                </div>

                <div class="flex border-[2px] border-black mb-1 h-[80px]">
                    <div class="flex-1 border-r-[2px] border-black flex flex-col">
                        <div class="bg-black text-white text-center font-bold text-[9px] uppercase py-0.5">EXTRACURRICULAR / AFFECTIVE</div>
                        <div class="p-2 text-[9px] grid grid-cols-2 gap-x-4 gap-y-1">
                            ${leftRows.replace(/<td class="p-0.5">/g, '<td class="p-0.5 uppercase tracking-tight text-gray-700">').replace(/w-\[25px\]/g, 'text-black')}
                        </div>
                    </div>
                    <div class="w-[45%] flex flex-col text-[8.5px] font-bold bg-green-50/20">
                        <div class="bg-black text-white text-center font-bold text-[9px] uppercase py-0.5 border-b-[2px] border-black">CUMULATIVE PASSING CRITERIA</div>
                        <div class="p-2 h-full flex justify-center flex-col">
                            <div>MUST PASS ANY OF THE COMPULSORY SUBJECTS:</div>
                            <div class="pl-2 mt-1">1. MATHEMATICS => <span class="text-green-700 font-extrabold">YOU PASSED.</span></div>
                            <div class="pl-2">2. ENGLISH LANGUAGE => <span class="text-green-700 font-extrabold">YOU PASSED.</span></div>
                            <div class="mt-2 tracking-wide border-t border-gray-400 pt-1">PASS PERCENTAGE => 50%. <span class="text-green-700 font-extrabold ml-1">YOU GOT => ${rec.average}%</span></div>
                        </div>
                    </div>
                </div>

                <div class="flex-1 border-[2px] border-black flex flex-col">
                    <div class="bg-black text-white text-center font-bold text-[9px] uppercase py-0.5 border-b-[2px] border-black">FORM TEACHER'S COMMENT</div>
                    <div class="p-2 text-[10px] italic flex-1 relative">
                        ${evals.remark}
                        
                        <div class="absolute bottom-2 left-10 text-center">
                            ${headSignHtml}
                            <div class="border-t border-black font-bold text-[9px] uppercase pt-0.5 w-[150px] mx-auto">${settings.headteacherName}</div>
                            <div class="text-[8px] text-gray-600">CLASS TEACHER</div>
                        </div>
                        <div class="absolute bottom-2 right-10 text-center">
                            ${prinSignHtml}
                            <div class="border-t border-black font-bold text-[9px] uppercase pt-0.5 w-[150px] mx-auto">${settings.principalName}</div>
                            <div class="text-[8px] text-gray-600">PRINCIPAL</div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        } else if(tpl === 'minimalist') {
            html += `
            <div class="text-center mb-6">
                <h1 class="text-xl font-black uppercase tracking-widest text-gray-900 mb-1">${schName}</h1>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-300 pb-2 inline-block">${schAddress}</p>
                <div class="mt-2 text-xs font-bold uppercase tracking-widest text-gray-800">Termly Progress Report</div>
            </div>
            <div class="flex justify-between items-end border-b-2 border-gray-900 pb-2 mb-4 text-[11px] font-medium text-gray-800">
                <div>
                    <div><span class="text-gray-500 w-16 inline-block">Name:</span> <b>${rec.student.name}</b></div>
                    <div><span class="text-gray-500 w-16 inline-block">Class:</span> <b>${clsValue}</b></div>
                </div>
                <div class="text-right">
                    <div><span class="text-gray-500">Term:</span> <b>${termValue}</b></div>
                    <div><span class="text-gray-500">Overall Avg/Pos:</span> <b class="text-[12px]">${rec.average}%</b> / <b>${rec.position}</b></div>
                    <div><span class="text-gray-500">Class Avg/Pos:</span> <b class="text-[12px]">${rec.sectionAverage}%</b> / <b>${rec.sectionPosition}</b></div>
                    <div class="mt-1">${pBadge}</div>
                </div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="border-b-2 border-gray-900 text-[10px]"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="font-bold text-xs border-t-2 border-gray-900"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right">OVERALL TOTAL:</td><td class="p-1.5 text-center">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        } else if(tpl === 'corporate') {
            html += `
            <div class="flex justify-between items-center border-b-4 border-gray-800 pb-4 mb-4">
                <img src="${schLogo}" class="h-16 object-contain">
                <div class="text-right">
                    <h1 class="text-2xl font-serif font-bold text-gray-900 m-0">${schName}</h1>
                    <p class="text-xs text-gray-600 m-0">${schAddress}</p>
                    <p class="text-[10px] text-gray-500 italic mt-1 font-serif">"${schMotto}"</p>
                </div>
            </div>
            <div class="bg-gray-100 border border-gray-300 p-2 mb-4 text-center font-bold text-sm tracking-widest uppercase">Termly Result Statement</div>
            <table class="w-full mb-4 text-[11px] border border-gray-300">
                <tr class="border-b border-gray-300"><td class="p-1.5 bg-gray-50 font-bold w-1/6 border-r border-gray-300">Student Name</td><td class="p-1.5 w-2/6 border-r border-gray-300">${rec.student.name}</td><td class="p-1.5 bg-gray-50 font-bold w-1/6 border-r border-gray-300">Admission No</td><td class="p-1.5">${rec.student.roll}</td></tr>
                <tr class="border-b border-gray-300"><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Class & Term</td><td class="p-1.5 border-r border-gray-300">${clsValue} - ${termValue}</td><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Academic Session</td><td class="p-1.5">${settings.session}</td></tr>
                <tr class="border-b border-gray-300"><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Overall Avg / Pos</td><td class="p-1.5 border-r border-gray-300 text-primary-700 font-bold">${rec.average}% / ${rec.position}</td><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Class Avg / Pos</td><td class="p-1.5 font-bold text-primary-700">${rec.sectionAverage}% / ${rec.sectionPosition}</td></tr>
                <tr><td colspan="4" class="p-1.5 text-center">${pBadge}</td></tr>
            </table>
            <table class="w-full border-collapse mb-4 border border-gray-300"><thead class="bg-gray-800 text-white text-[10px]"><tr>${thHtml.replace(/border-slate-300/g, 'border-gray-700')}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="bg-gray-200 font-bold text-xs border-t-2 border-gray-400"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right">OVERALL TOTAL:</td><td class="p-1.5 text-center">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        } else if(tpl === 'elegant') {
            html += `
            <div class="text-center mb-6">
                <img src="${schLogo}" class="h-12 w-12 object-contain mx-auto mb-2 mix-blend-multiply">
                <h1 class="text-2xl font-serif text-primary-900 m-0 leading-tight">${schName}</h1>
                <p class="text-[11px] text-gray-600 italic font-serif mt-1 border-b border-gray-200 inline-block pb-1">${schMotto}</p>
            </div>
            <div class="text-center mb-4"><span class="text-[10px] uppercase font-bold tracking-widest text-primary-700 border-y border-primary-200 py-1 px-8 inline-block">Termly Assessment Report</span></div>
            <div class="flex justify-between items-end mb-4 text-xs font-serif text-gray-800 px-4">
                <div class="space-y-1">
                    <div><span class="text-gray-500">Student:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${rec.student.name}</span></div>
                    <div><span class="text-gray-500">Class:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${clsValue}</span></div>
                </div>
                <div class="text-right space-y-1">
                    <div><span class="text-gray-500">Session/Term:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${settings.session} - ${termValue}</span></div>
                    <div><span class="text-gray-500">Overall Avg/Pos:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5 text-primary-700">${rec.average}% | ${rec.position}</span></div>
                    <div><span class="text-gray-500">Class Avg/Pos:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5 text-primary-700">${rec.sectionAverage}% | ${rec.sectionPosition}</span></div>
                    <div class="mt-1">${pBadge}</div>
                </div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="bg-primary-50/50 text-[10px] text-primary-800 border-t border-b border-primary-200"><tr>${thHtml.replace(/border-slate-300/g, 'border-primary-100')}</tr></thead><tbody class="font-serif">${tbodyHtml.replace(/border border-slate-300/g, 'border-b border-dashed border-gray-200')}</tbody><tfoot class="font-bold text-xs border-t border-primary-200 bg-primary-50/30"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right font-serif">OVERALL TOTAL:</td><td class="p-1.5 text-center text-primary-800">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        } else {
            // CLASSIC (Fallback & Original structure)
            html += `
            <div class="flex items-center justify-between border-b-2 border-primary-900 pb-[10px] mb-[15px]">
                <img src="${schLogo}" class="h-[60px] object-contain">
                <div class="text-center">
                    <h1 class="text-primary-900 text-2xl font-black m-0 uppercase">${schName}</h1>
                    <p class="m-0 text-[11px] text-gray-600">${schAddress}</p>
                    <p class="m-0 text-[11px] text-gray-600">${schContact}</p>
                    <p class="m-0 text-[10px] text-gray-500 italic mt-0.5">Motto: ${schMotto}</p>
                </div>
                <div class="w-[60px] h-[75px] border border-gray-300 flex items-center justify-center bg-gray-100 text-[10px] text-gray-400 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=${rec.student.name}&background=1e3a8a&color=fff" class="w-full h-full object-cover">
                </div>
            </div>
            <div class="text-center mb-[15px]">
                <h2 class="text-[15px] font-extrabold underline m-0 p-1 bg-primary-900 text-white inline-block uppercase">TERMLY STUDENT PROGRESS REPORT</h2>
            </div>
            <table class="w-full border-collapse mb-[15px] text-[11px]">
                <tr>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300 w-[15%]">Student Name:</td>
                    <td class="py-1 px-2 border border-slate-300 w-[35%]">${rec.student.name}</td>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300 w-[15%]">Admission No:</td>
                    <td class="py-1 px-2 border border-slate-300 w-[35%]">ADM-${rec.student.roll}</td>
                </tr>
                <tr>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Class:</td>
                    <td class="py-1 px-2 border border-slate-300">${clsValue}</td>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Academic Session:</td>
                    <td class="py-1 px-2 border border-slate-300">${settings.session}</td>
                </tr>
                <tr>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Term:</td>
                    <td class="py-1 px-2 border border-slate-300">${termValue}</td>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Overall Avg | Pos:</td>
                    <td class="py-1 px-2 border border-slate-300 text-red-700 font-black">${rec.average}% | ${rec.position}</td>
                </tr>
                <tr>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Status:</td>
                    <td class="py-1 px-2 border border-slate-300">${pBadge}</td>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Class Avg | Pos:</td>
                    <td class="py-1 px-2 border border-slate-300 text-red-700 font-black">${rec.sectionAverage}% | ${rec.sectionPosition}</td>
                </tr>
            </table>
            <table class="w-full border-collapse mb-[10px]"><thead class="bg-slate-100 text-[10px]"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="bg-slate-200 font-bold text-xs"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 border border-slate-300 text-right">OVERALL TOTAL:</td><td class="p-1.5 border border-slate-300 text-center text-primary-900">${rec.grandTotal}</td><td colspan="5" class="border border-slate-300"></td></tr></tfoot></table>
            `;
        }

        // SHARED FOOTER
        html += `
            <div class="flex gap-[15px] mt-auto">
                <div class="flex-1">
                    <table class="w-full border-collapse text-[10px] border border-slate-300">
                        <thead class="bg-primary-900 text-white"><tr><th colspan="2" class="p-1 text-left">AFFECTIVE & PSYCHOMOTOR</th></tr></thead>
                        <tbody>
                            <tr>
                                <td class="p-0.5 border-r border-slate-300 align-top w-1/2"><table class="w-full border-collapse">${leftRows}</table></td>
                                <td class="p-0.5 align-top w-1/2"><table class="w-full border-collapse">${rightRows}</table></td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="text-[8px] text-slate-500 mt-1 text-center font-medium">Scale: 5 (Excellent), 4 (Good), 3 (Fair), 2 (Poor), 1 (Very Poor)</div>
                </div>

                <div class="flex-[2] border border-slate-300 p-2.5 bg-slate-50 text-[11px] flex flex-col">
                    <div class="border-b border-dashed border-slate-300 pb-2 mb-auto min-h-[40px]">
                        <span class="font-bold">Teacher's Remark:</span> ${evals.remark}
                    </div>
                    
                    <div class="flex justify-between items-end mt-2.5">
                        <div class="text-center">
                            ${headSignHtml}
                            <div class="border-t border-black w-[100px] pt-1">
                                <b class="text-[10px]">${settings.headteacherName}</b><br><span class="text-[9px]">Head Teacher</span>
                            </div>
                        </div>
                        <div class="text-center text-red-700 font-bold text-[10px] bg-red-100 p-1 px-2 rounded">
                            Resumption: <br/>${settings.resumption}
                        </div>
                        <div class="text-center">
                            ${prinSignHtml}
                            <div class="border-t border-black w-[100px] pt-1">
                                <b class="text-[10px]">${settings.principalName}</b><br><span class="text-[9px]">Principal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="absolute inset-0 bg-center bg-no-repeat opacity-[0.03] pointer-events-none -z-10" style="background-image: url('${schLogo}');"></div>
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
