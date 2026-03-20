// js/session-results.js
(function() {
    console.log('Session Results initiated');

    let classesData = [];
    let subjectsData = [];
    let gradeBoundariesData = [];
    let currentSessionData = [];

    async function initialize() {
        try {
            const [clsRes, subRes] = await Promise.all([
                fetch('../../data/classes-data.json'),
                fetch('../../data/subjects-data.json')
            ]);
            classesData = await clsRes.json();
            subjectsData = await subRes.json();

            const boundsMap = localStorage.getItem('gradeBoundariesData');
            if(boundsMap) {
                gradeBoundariesData = JSON.parse(boundsMap);
            } else {
                gradeBoundariesData = [
                    { id: '1', grade: 'A', min: 75, max: 100, remark: 'Excellent', color: 'text-green-600' },
                    { id: '2', grade: 'B', min: 60, max: 74, remark: 'Very Good', color: 'text-blue-600' },
                    { id: '3', grade: 'C', min: 50, max: 59, remark: 'Credit', color: 'text-yellow-600' },
                    { id: '4', grade: 'D', min: 40, max: 49, remark: 'Pass', color: 'text-orange-500' },
                    { id: '5', grade: 'F', min: 0, max: 39, remark: 'Fail', color: 'text-red-600' }
                ];
            }
            gradeBoundariesData.sort((a,b) => b.min - a.min);

            const classSelect = document.getElementById('sr-class');
            if(classSelect) {
                classSelect.innerHTML = '<option value="">-- Select Target Class --</option>';
                classesData.forEach(c => {
                    classSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
                });
            }
        } catch(e) { console.error(e); }
    }

    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function getRandScore() { return Math.floor(30 + Math.random() * 70); }

    function getGradeDetails(score) {
        let bnd = gradeBoundariesData.find(b => score >= b.min && score <= b.max);
        if(!bnd) return { grade: 'F', remark: 'Fail', color: 'text-red-600 bg-red-50', badge: 'bg-red-100 text-red-800' };
        
        let c = 'text-gray-800 bg-gray-50'; let b = 'bg-gray-100 text-gray-800';
        if(bnd.grade.includes('A')) { c = 'text-green-700 bg-green-50'; b = 'bg-green-100 text-green-800'; }
        else if(bnd.grade.includes('B')) { c = 'text-blue-700 bg-blue-50'; b = 'bg-blue-100 text-blue-800'; }
        else if(bnd.grade.includes('C')) { c = 'text-yellow-700 bg-yellow-50'; b = 'bg-yellow-100 text-yellow-800'; }
        
        return { grade: bnd.grade, remark: bnd.remark, color: c, badge: b };
    }

    // Engine: Generates Matrix
    window.loadSessionBroadsheet = function() {
        const clsValue = document.getElementById('sr-class').value;
        const sectionValue = document.getElementById('sr-section').value;
        const sessionValue = document.getElementById('sr-session').value;

        if(!clsValue || !sessionValue) {
            alert("Please select Class and Session");
            return;
        }

        const fullClassName = sectionValue !== 'All Sections' ? `${clsValue} ${sectionValue}` : clsValue;

        let students = Array.from({length: 10}, (_, i) => ({
            id: `STD-S-${i+1}`,
            name: `Student Model ${i+1}`,
            class: fullClassName,
            session: sessionValue,
            roll: `00${i+1}`
        }));

        let activeSubjects = subjectsData.slice(0, 15).map(s => s.name);
        let records = [];

        students.forEach(student => {
            let studentTotalAllSubjects = 0;
            let subjectResults = [];

            activeSubjects.forEach(subject => {
                let t1 = getRandScore();
                let t2 = getRandScore();
                let t3 = getRandScore();
                
                if (['STD-S-7', 'STD-S-8', 'STD-S-9', 'STD-S-10'].includes(student.id)) {
                    t1 = Math.round(t1 * 0.3);
                    t2 = Math.round(t2 * 0.3);
                    t3 = Math.round(t3 * 0.3);
                }
                
                let cum = Math.round((t1 + t2 + t3) / 3);

                let gradeMetrics = getGradeDetails(cum);

                subjectResults.push({
                    subject: subject,
                    t1: t1,
                    t2: t2,
                    t3: t3,
                    annual: cum,
                    grade: gradeMetrics.grade,
                    remark: gradeMetrics.remark,
                    color: gradeMetrics.color,
                    badge: gradeMetrics.badge
                });
                studentTotalAllSubjects += cum;
            });

            records.push({
                student: student,
                subjects: subjectResults,
                grandTotal: studentTotalAllSubjects,
                average: (studentTotalAllSubjects / activeSubjects.length).toFixed(1)
            });
        });

        // 1. Sort students comprehensively by Grand Annual Total
        records.sort((a,b) => b.grandTotal - a.grandTotal);
        records.forEach((rec, idx) => { rec.positionInt = idx + 1; rec.position = getOrdinal(idx + 1); });

        // 2. Determine highest & positions dynamically per subject computed across all 10 students horizontally
        activeSubjects.forEach(sub => {
            let isolated = records.map(r => {
                let sRes = r.subjects.find(s => s.subject === sub);
                return { id: r.student.id, annualScore: sRes.annual };
            });
            isolated.sort((a,b) => b.annualScore - a.annualScore);
            let high = isolated[0].annualScore;
            
            isolated.forEach((iso, idx) => {
                let rec = records.find(r => r.student.id === iso.id);
                let sr = rec.subjects.find(s => s.subject === sub);
                sr.highest = high;
                sr.position = getOrdinal(idx + 1);
            });
        });

        currentSessionData = records;

        const tbody = document.getElementById('sr-tbody');
        tbody.innerHTML = '';
        records.forEach(rec => {
            let tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            
            tr.innerHTML = `
                <td class="px-3 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">${rec.student.name}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4 font-black text-primary-600 bg-primary-50/50 whitespace-nowrap w-24">
                    <span class="badge bg-primary-100 text-primary-800 px-2 py-1 rounded shadow-sm text-xs sm:text-sm border border-primary-200">${rec.position}</span>
                </td>
                <td class="px-3 py-3 sm:px-6 sm:py-4 text-right">
                    <div class="flex items-center justify-end gap-2 flex-wrap">
                        <button type="button" onclick="window.previewSingleSessionReportCard('${rec.student.id}')" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-xs px-2.5 py-1.5 sm:text-sm sm:px-3 sm:py-1.5 shadow-sm transition-colors whitespace-nowrap">
                            <i class="fas fa-eye mr-1"></i> Preview
                        </button>
                        <button onclick="window.printSingleSessionReport('${rec.student.id}')" class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-xs px-2.5 py-1.5 sm:text-sm sm:px-3 sm:py-1.5 shadow-sm transition-colors whitespace-nowrap">
                            <i class="fas fa-print mr-1"></i> Print PDF
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('sr-title').textContent = `${clsValue} Annual Broadsheet`;
        document.getElementById('sr-broadsheet-container').classList.remove('hidden');
    };

    function getGlobalSettings() {
        let set = localStorage.getItem('globalResultSettings');
        if(set) return JSON.parse(set);
        return {
            session: "2024/2025", resumption: "9th September, 2025", 
            principalName: "", headteacherName: "",
            principalSign: null, headteacherSign: null
        };
    }

    // Generator 
        function generateSessionPrintTemplate(rec) {
        const settings = getGlobalSettings();
        const clsValue = document.getElementById('sr-class').value || rec.student.class;
        const sessionValue = document.getElementById('sr-session').value || settings.session;
        const tpl = settings.activeTemplate || 'classic';

        const profile = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');
        const schName = profile.name || "St. Augustine College";
        const schAddress = profile.address || "123 Education Boulevard, Excellence City";
        const schContact = `${profile.email || 'info@school.com'} | ${profile.website || 'www.school.com'}`;
        const schMotto = profile.motto || "Knowledge is Power";
        const schLogo = profile.logo || "../../assets/images/logo.png";

        let html = '';

        // --- DATA BUILDERS (SHARED) ---
        let thHtml = `
            <th class="p-1.5 border border-slate-300 text-left w-1/5 text-[11px] text-gray-800">SUBJECT</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-yellow-600 bg-yellow-50/50">TERM 1</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-blue-600 bg-blue-50/50">TERM 2</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-green-600 bg-green-50/50">TERM 3</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-gray-900 bg-gray-100 font-bold">ANNUAL</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-gray-600">GRADE</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-gray-600">REMARK</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-gray-600">HIGHEST</th>
            <th class="p-1.5 border border-slate-300 text-center text-[10px] text-gray-600">POSITION</th>
        `;

        let tbodyHtml = '';
        rec.subjects.forEach(sub => {
            tbodyHtml += `
                <tr class="text-[12px] border-b border-slate-300">
                    <td class="p-1.5 border border-slate-300 font-semibold text-gray-700">${sub.subject}</td>
                    <td class="p-1.5 border border-slate-300 text-center bg-yellow-50/30 text-yellow-800">${sub.t1}</td>
                    <td class="p-1.5 border border-slate-300 text-center bg-blue-50/30 text-blue-800">${sub.t2}</td>
                    <td class="p-1.5 border border-slate-300 text-center bg-green-50/30 text-green-800">${sub.t3}</td>
                    <td class="p-1.5 border border-slate-300 text-center font-black bg-gray-100 text-gray-900">${sub.annual}</td>
                    <td class="p-1.5 border border-slate-300 text-center font-extrabold text-green-700"><span class="bg-green-50 px-1.5 rounded-full">${sub.grade}</span></td>
                    <td class="p-1.5 border border-slate-300 text-center text-[11px] text-gray-600">${sub.remark}</td>
                    <td class="p-1.5 border border-slate-300 text-center text-gray-800">${sub.highest}</td>
                    <td class="p-1.5 border border-slate-300 text-center text-gray-600">${sub.position}</td>
                </tr>
            `;
        });

        let prinSignHtml = settings.principalSign ? `<img src="${settings.principalSign}" class="max-h-[25px] object-contain mb-[2px]">` : `<div class="h-[25px]"></div>`;
        let headSignHtml = settings.headteacherSign ? `<img src="${settings.headteacherSign}" class="max-h-[25px] object-contain mb-[2px]">` : `<div class="h-[25px]"></div>`;

        // BASE WRAPPER
        html += `<div class="result-pdf-wrapper relative w-[210mm] h-[296mm] overflow-hidden bg-white mx-auto py-[10mm] px-[15mm] box-border font-sans text-black">`;

        
        const promoteRule = parseInt(localStorage.getItem('sms_promotion_rule') || 50);
        const isPromoted = rec.average >= promoteRule;
        const pBadge = isPromoted 
            ? `<span class="px-2 py-0.5 ml-2 border border-green-300 rounded text-[9px] font-black text-green-700 bg-green-50 shadow-sm uppercase print:text-green-700 print:bg-transparent">PROMOTED</span>`
            : `<span class="px-2 py-0.5 ml-2 border border-red-300 rounded text-[9px] font-black text-red-700 bg-red-50 shadow-sm uppercase print:text-red-700 print:bg-transparent">FAILED</span>`;
        
        const pStatus = isPromoted ? "PROMOTED TO NEXT CLASS" : "REPEATED";

        // TEMPLATE SWITCHER (ANNUAL)
        if(tpl === 'modern') {
            html += `
            <div class="flex items-center gap-4 bg-primary-800 text-white p-4 rounded-t-xl mb-4 shadow-sm">
                <img src="${schLogo}" class="h-16 w-16 object-contain bg-white rounded p-1 shadow-inner">
                <div class="flex-1">
                    <h1 class="text-2xl font-black uppercase tracking-wide m-0 drop-shadow-sm">${schName}</h1>
                    <p class="text-xs text-primary-100 m-0">${schContact}</p>
                    <p class="text-xs text-primary-200 capitalize italic mt-1 font-semibold">${schMotto}</p>
                </div>
            </div>
            <div class="text-center mb-4"><h2 class="text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-100 py-1 inline-block px-4 rounded-full border border-gray-300 shadow-sm">Annual Cumulated Report</h2></div>
            <div class="grid grid-cols-4 gap-2 mb-4 text-[10px]">
                <div class="bg-gray-50 border border-gray-200 p-2 rounded shadow-sm"><div class="text-gray-500 uppercase font-bold text-[8px]">Student Name</div><div class="font-bold text-sm truncate">${rec.student.name}</div></div>
                <div class="bg-gray-50 border border-gray-200 p-2 rounded shadow-sm"><div class="text-gray-500 uppercase font-bold text-[8px]">Admission No</div><div class="font-bold text-sm">ADM-${rec.student.roll}</div></div>
                <div class="bg-gray-50 border border-gray-200 p-2 rounded shadow-sm"><div class="text-gray-500 uppercase font-bold text-[8px]">Class & Session</div><div class="font-bold text-sm">${clsValue} | ${sessionValue}</div></div>
                <div class="bg-primary-50 border border-primary-200 p-2 rounded shadow-sm"><div class="text-primary-600 uppercase font-bold text-[8px]">Annual Avg & Pos</div><div class="font-black text-primary-800 text-sm">${rec.average}% &nbsp;|&nbsp; ${rec.position} ${pBadge}</div></div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="bg-primary-50/50 text-primary-900 border-t border-b border-primary-200"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="bg-gray-50 font-bold text-xs border-t border-gray-300"><tr><td colspan="4" class="p-1.5 text-right">OVERALL ANNUAL TOTAL:</td><td class="p-1.5 text-center text-primary-700">${rec.grandTotal}</td><td colspan="4"></td></tr></tfoot></table>
            `;
        
        } else if(tpl === 'radiant') {
            let radTh = `
                <th class="p-1.5 border border-gray-400 text-left font-bold align-bottom w-[30%]">Subject</th>
                <th class="border border-gray-400 align-bottom h-[80px] w-10"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Term 1</div></th>
                <th class="border border-gray-400 align-bottom h-[80px] w-10"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Term 2</div></th>
                <th class="border border-gray-400 align-bottom h-[80px] w-10"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Term 3</div></th>
                <th class="border border-gray-400 align-bottom h-[80px] w-12"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold text-blue-800">Annual Total</div></th>
                <th class="border border-gray-400 align-bottom h-[80px] w-10"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Grade</div></th>
                <th class="border border-gray-400 align-bottom h-[80px] w-10"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Position</div></th>
                <th class="p-1.5 border border-gray-400 align-bottom font-bold text-center">Remark</th>
            `;
            let radTb = '';
            rec.subjects.forEach(sub => {
                radTb += `
                <tr class="text-[11px] border-b border-gray-400">
                    <td class="p-1.5 border border-gray-400 font-bold">${sub.subject}</td>
                    <td class="p-1.5 border border-gray-400 text-center">${sub.t1}</td>
                    <td class="p-1.5 border border-gray-400 text-center">${sub.t2}</td>
                    <td class="p-1.5 border border-gray-400 text-center">${sub.t3}</td>
                    <td class="p-1.5 border border-gray-400 text-center font-black text-blue-800">${sub.annual}</td>
                    <td class="p-1.5 border border-gray-400 text-center font-bold">${sub.grade}</td>
                    <td class="p-1.5 border border-gray-400 text-center">${sub.position}</td>
                    <td class="p-1.5 border border-gray-400 text-center text-[10px]">${sub.remark}</td>
                </tr>`;
            });

            html += `
            <div class="h-[296mm] border-[2px] border-blue-900/20 p-[5mm] box-border relative bg-white text-black print:border-none print:p-0 flex flex-col">
                <div class="flex items-center justify-between border-b-[3px] border-blue-800 pb-[10px] mb-[10px]">
                    <img src="${schLogo}" class="h-[75px] w-[80px] object-contain object-left">
                    <div class="flex-1 text-center px-4 shrink-0">
                        <h1 class="text-[26px] font-black tracking-wide m-0" style="color: #1e3a8a;">${schName}</h1>
                        <p class="text-[11px] font-bold text-blue-900 m-0">${schAddress}</p>
                        <p class="text-[10px] text-gray-600 mt-[2px] font-medium">Motto: ${schMotto}</p>
                        <div class="text-[14px] font-extrabold mt-[5px] uppercase tracking-widest text-gray-800">Annual Academic Report</div>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=${rec.student.name}&background=1e3a8a&color=fff" class="h-[80px] w-[70px] object-cover border-2 border-gray-300 rounded shadow-sm">
                </div>
                
                <div class="text-[10px] font-bold text-gray-800 leading-tight space-y-1 mb-[10px]">
                    <div>Registration number: <span class="font-normal border-b border-dotted border-gray-400 pb-[1px] uppercase">ADM-${rec.student.roll}</span></div>
                    <div>Name: <span class="font-normal border-b border-dotted border-gray-400 pb-[1px] uppercase">${rec.student.name}</span></div>
                    <div>Academic session: <span class="font-normal">${settings.session}</span> &nbsp;&nbsp; Class: <span class="font-normal">${clsValue}</span></div>
                </div>

                <div class="flex-1">
                    <table class="w-full border-collapse text-[10px]">
                        <thead class="bg-blue-900 text-white border-2 border-blue-900">
                            <tr>${radTh}</tr>
                        </thead>
                        <tbody class="border-2 border-gray-500">
                            ${radTb}
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-[10px] border border-green-700 rounded overflow-hidden shadow-sm">
                    <div class="bg-green-700/10 text-green-800 px-2 py-0.5 text-[9px] font-bold border-b border-green-700">Key to Grades:</div>
                    <div class="p-1 px-2 text-[8px] text-gray-700 leading-snug">
                        PV (Fail) = Below 40%, E8 (Pass) = 40% ≤ 45%, D7 (Pass) = 45% ≤ 50%, C6 (Credit) = 50% ≤ 60%, C5 (Credit) = 60% ≤ 65%, C4 (Credit) = 65% ≤ 70%, B3 (Distinction) = 70% ≤ 75%, B2 (Distinction) = 75% ≤ 80%, A1 (Excellent) = 80% & Above.
                    </div>
                </div>

                <div class="border-[2px] border-blue-900/30 rounded p-[5mm] mt-[10px] text-[10px] relative">
                    <div class="font-bold flex gap-[20px] mb-2">
                        <span>Cumulative Score: <span class="font-normal border-b border-dotted border-gray-400">${rec.grandTotal}</span></span>
                        <span>Annual Average: <span class="font-normal border-b border-dotted border-gray-400">${rec.average}</span></span>
                        <span>Session Position: <span class="font-normal border-b border-dotted border-gray-400 text-lg font-black text-blue-900 px-2">${rec.position}</span></span>
                    </div>
                    <div class="mb-4">
                        <span class="font-bold text-blue-900">Principal's Recommendation:</span> 
                        <span class="italic text-gray-700 border-b border-dotted border-gray-400">PROMOTED TO NEXT CLASS. OUTSTANDING OVERALL ACADEMIC PERFORMANCE.</span>
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
            let chartTh = `
                <th class="p-1 border border-gray-400 text-center w-6">S/N</th>
                <th class="p-1 border border-gray-400 text-left">SUBJECT</th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">TERM 1</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">TERM 2</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">TERM 3</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1 font-bold">ANNUAL(300)</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1 font-bold">AVG</div></th>
                <th class="p-1 border border-gray-400 text-center font-bold">GRADE</th>
                <th class="p-1 border border-gray-400 text-center font-bold">REMARK</th>
            `;
            let chartTb = '';
            let chartBars = '';
            rec.subjects.forEach((sub, idx) => {
                let subAvg = (sub.annual / 3).toFixed(1);
                chartTb += `
                <tr class="text-[10px] border-b border-gray-400 hover:bg-gray-50">
                    <td class="p-1 border border-gray-400 text-center">${idx + 1}</td>
                    <td class="p-1 border border-gray-400 font-bold">${sub.subject}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.t1}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.t2}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.t3}</td>
                    <td class="p-1 border border-gray-400 text-center font-black">${sub.annual}</td>
                    <td class="p-1 border border-gray-400 text-center">${subAvg}</td>
                    <td class="p-1 border border-gray-400 text-center font-bold">${sub.grade}</td>
                    <td class="p-1 border border-gray-400 text-left text-[9px] font-bold">${sub.remark}</td>
                </tr>`;
                
                let h = Math.min(100, (sub.annual / 3));
                let subName = sub.subject.substring(0, 4).toUpperCase();
                chartBars += `
                <div class="flex flex-col items-center justify-end h-full w-[25px] flex-shrink-0 group">
                    <div class="text-[7px] mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">${subAvg}%</div>
                    <div class="w-full bg-gradient-to-t from-gray-600 to-gray-400 border border-gray-500 shadow-sm transition-all" style="height: ${h}%;"></div>
                    <div class="text-[7px] font-bold mt-1 w-full text-center truncate" title="${sub.subject}">${subName}</div>
                </div>`;
            });

            html += `
            <div class="h-[296mm] border-[1px] border-gray-300 p-[10mm] box-border relative font-sans flex flex-col bg-white text-black print:border-none print:p-0">
                <div class="flex items-center justify-between border-b-2 border-double border-gray-800 pb-2 mb-4">
                    <img src="${schLogo}" class="h-16 w-16 object-contain">
                    <div class="flex-1 text-center">
                        <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ministry of Education</div>
                        <h1 class="text-2xl font-black text-gray-900 tracking-wider m-0 uppercase">${schName}</h1>
                        <p class="text-[10px] text-gray-700 italic font-semibold">MOTTO: ${schMotto}</p>
                    </div>
                </div>
                
                <h2 class="text-center text-[13px] font-extrabold pb-1 mb-4 border-b border-gray-400 tracking-wider">ANNUAL STUDENT CUMULATIVE RECORD</h2>
                
                <div class="grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-800 mb-4 px-2">
                    <div class="space-y-1">
                        <div>NAME: <span class="font-normal border-b border-dotted border-gray-500 min-w-[150px] inline-block uppercase text-[11px]">${rec.student.name}</span></div>
                        <div>CUMULATIVE AVERAGE: <span class="font-normal text-[12px] text-gray-900">${rec.average}</span></div>
                    </div>
                    <div class="space-y-1">
                        <div>SESSION: <span class="font-normal">${settings.session}</span></div>
                        <div>CLASS: <span class="font-normal border-b border-dotted border-gray-500 min-w-[100px] inline-block">${clsValue}</span></div>
                    </div>
                    <div class="space-y-1">
                        <div>ANNUAL POSITION: <span class="font-normal text-[12px] text-gray-900">${rec.position}</span></div>
                        <div>TOTAL ANNUAL SCORE: <span class="font-normal font-black text-[12px] text-gray-900">${rec.grandTotal}</span></div>
                    </div>
                </div>

                <div class="text-center font-bold text-[11px] bg-gray-100 border border-gray-400 py-1 uppercase tracking-widest border-b-0 mt-2">Academic Performance History</div>
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
                    <div class="col-span-2 mt-2">Principal: <span class="font-bold border-b border-dotted border-gray-600 inline-block min-w-[200px] uppercase text-[10px] pb-0.5">${settings.principalName}</span></div>
                </div>

                <div class="mt-auto border-2 border-gray-400 bg-gray-50 h-[120px] relative rounded shadow-inner p-2 w-full max-w-[90%] mx-auto">
                    <div class="absolute top-1 left-2 font-bold text-[8px] bg-gray-600 text-white px-2 py-0.5 rounded shadow-sm opacity-80">Annual Performance Chart</div>
                    
                    <div class="absolute inset-0 top-6 bottom-4 flex flex-col justify-between px-2 pt-1 z-[1] select-none text-[6px] text-gray-400">
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">100</span></div>
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">75</span></div>
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">50</span></div>
                        <div class="border-b border-gray-300 w-full absolute bottom-0"><span class="absolute -left-3 -top-1.5">0</span></div>
                    </div>
                    
                    <div class="flex items-end justify-center gap-2 h-full pt-[20px] pb-[16px] z-[2] relative overflow-hidden">
                        ${chartBars}
                    </div>
                </div>
            </div>
            `;
            
        } else if(tpl === 'comprehensive') {
            let compTb = '';
            rec.subjects.forEach(sub => {
                let clr = "text-black";
                if(sub.grade.includes('A')) clr = "text-green-700 font-black";
                else if(sub.grade.includes('B')) clr = "text-green-600 font-bold";
                else if(sub.grade.includes('C')) clr = "text-blue-600 font-bold";
                else if(sub.grade.includes('D')) clr = "text-orange-600 font-bold";
                else if(sub.grade.includes('E') || sub.grade.includes('F')) clr = "text-red-700 font-black";

                let subAvg = (sub.annual / 3).toFixed(1);

                compTb += `
                <tr class="border-b-[1.5px] border-black text-[10px]">
                    <td class="p-1 border-[1.5px] border-black font-extrabold uppercase text-[9px]">${sub.subject}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-gray-600">${sub.t1}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-gray-600">${sub.t2}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-gray-600">${sub.t3}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-black">${sub.annual}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold">${subAvg}</td>
                    <td class="p-1 border-[1.5px] border-black text-center ${clr}">${sub.grade}</td>
                    <td class="p-1 border-[1.5px] border-black text-center text-[8px] uppercase ${clr}">${sub.remark}</td>
                </tr>`;
            });

            html += `
            <div class="h-[296mm] border-none p-[5mm] box-border relative font-sans flex flex-col bg-white text-black overflow-hidden print:m-0 print:p-0">
                <div class="flex items-center justify-between pb-1 mb-2">
                    <img src="${schLogo}" class="h-16 w-16 object-contain self-start">
                    <div class="flex-1 text-center">
                        <h1 class="text-[20px] font-black tracking-wide m-0 text-blue-800 uppercase" style="text-shadow: 1px 1px 0px rgba(0,0,0,0.1); font-family: 'Times New Roman', serif;">${schName}</h1>
                        <p class="text-[10px] font-bold text-blue-900 m-0 leading-tight">${schAddress}</p>
                        <h2 class="text-[15px] font-bold text-red-700 mt-1 uppercase tracking-widest">ANNUAL SUMMARY REPORT</h2>
                    </div>
                </div>
                
                <div class="bg-black text-white text-center font-bold uppercase tracking-widest text-[12px] py-1 mb-1">
                    ${settings.session} ACADEMIC SESSION
                </div>
                
                <table class="w-full border-collapse border-[2px] border-black text-[10px] mb-2 font-bold">
                    <tr>
                        <td class="p-1 border-[1.5px] border-black w-1/2 uppercase">Name of Student: <span class="text-[12px] ml-1">${rec.student.name}</span></td>
                        <td class="p-1 border-[1.5px] border-black w-1/3">ADMISSION NO.: <span class="text-[11px] ml-1">${rec.student.roll}</span></td>
                        <td class="p-1 border-[1.5px] border-black w-1/6">CLASS: <span class="text-[11px] ml-1">${clsValue}</span></td>
                    </tr>
                </table>

                <div class="bg-black text-white text-center font-bold text-[10px] uppercase tracking-widest py-0.5">ACADEMIC RESULT HISTORY</div>
                
                <table class="w-full border-collapse border-[2px] border-black text-[10px] mb-2 flex-1">
                    <thead class="bg-gray-100">
                        <tr>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[11px]">SUBJECTS</td>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[9px] w-[6%]">1ST TERM</td>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[9px] w-[6%]">2ND TERM</td>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[9px] w-[6%]">3RD TERM</td>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[9px] w-[6%]">CUM T.</td>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[9px] w-[6%]">AVG</td>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[9px] w-[6%]">GRD</td>
                            <td class="p-1 border-[1.5px] border-black text-center font-bold text-[9px] w-[15%]">REMARK</td>
                        </tr>
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
                        <div class="bg-black text-white text-center font-bold text-[9px] uppercase tracking-widest py-0.5 border-b-[2px] border-black">CUMULATIVE RESULT SUMMARY</div>
                        <div class="flex flex-1 items-center">
                            <div class="w-1/2 p-2 border-r-[1.5px] border-black flex flex-col justify-center h-full">
                                <div class="text-[9px]">TOTAL SCORE: <span class="font-black text-[12px] ml-1">${rec.grandTotal}</span></div>
                                <div class="text-[9px] mt-1">PERCENTAGE AVG: <span class="font-black text-[12px] ml-1">${rec.average}%</span></div>
                            </div>
                            <div class="w-1/2 p-2 text-center text-[11px] font-semibold">
                                RANK THIS SESSION:<br/><span class="font-black text-[14px]">${rec.position}</span>
                            </div>
                        </div>
                    </div>
                    <div class="w-[30%] flex flex-col border-l-[2px] border-black bg-green-50/30">
                        <div class="flex-1 p-2 text-center flex flex-col justify-center border-b-[1.5px] border-black">
                            <span class="font-bold text-[10px]">CUMULATIVE RESULT STATUS:</span>
                            <span class="font-black text-[16px] text-green-700 mt-1 uppercase tracking-wider">PROMOTED</span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 border-[2px] border-black flex flex-col mt-2">
                    <div class="bg-black text-white text-center font-bold text-[9px] uppercase py-0.5 border-b-[2px] border-black">PRINCIPAL'S COMMENT</div>
                    <div class="p-2 text-[10px] italic flex-1 relative min-h-[70px]">
                        Highly recommended for promotion to the next logical classroom. Exceptional behavior and grades throughout the academic session.
                        
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
                <div class="mt-2 text-xs font-bold uppercase tracking-widest text-gray-800">Annual Academic Record</div>
            </div>
            <div class="flex justify-between items-end border-b-2 border-gray-900 pb-2 mb-4 text-[11px] font-medium text-gray-800">
                <div>
                    <div><span class="text-gray-500 w-16 inline-block">Name:</span> <b>${rec.student.name}</b></div>
                    <div><span class="text-gray-500 w-16 inline-block">Class:</span> <b>${clsValue}</b></div>
                </div>
                <div class="text-right">
                    <div><span class="text-gray-500">Session:</span> <b>${sessionValue}</b></div>
                    <div><span class="text-gray-500">Annual Avg / Pos:</span> <b class="text-lg">${rec.average}%</b> / <b>${rec.position}</b></div>
                </div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="border-b-2 border-gray-900 text-[10px]"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="font-bold text-[11px] border-t-2 border-gray-900"><tr><td colspan="4" class="p-1.5 text-right">OVERALL ANNUAL TOTAL:</td><td class="p-1.5 text-center">${rec.grandTotal}</td><td colspan="4"></td></tr></tfoot></table>
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
            <div class="bg-gray-100 border border-gray-300 p-2 mb-4 text-center font-bold text-sm tracking-widest uppercase">Annual Performance Statement</div>
            <table class="w-full mb-4 text-[11px] border border-gray-300 shadow-sm">
                <tr class="border-b border-gray-300"><td class="p-1.5 bg-gray-50 font-bold w-1/6 border-r border-gray-300">Student Name</td><td class="p-1.5 w-2/6 border-r border-gray-300">${rec.student.name}</td><td class="p-1.5 bg-gray-50 font-bold w-1/6 border-r border-gray-300">Admission No</td><td class="p-1.5">${rec.student.roll}</td></tr>
                <tr class="border-b border-gray-300"><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Class & Session</td><td class="p-1.5 border-r border-gray-300">${clsValue} - ${sessionValue}</td><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Total Score</td><td class="p-1.5 font-bold text-primary-800">${rec.grandTotal}</td></tr>
                <tr><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Average Score</td><td class="p-1.5 border-r border-gray-300 font-black">${rec.average}%</td><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Class Position</td><td class="p-1.5 font-bold">${rec.position}</td></tr>
            </table>
            <table class="w-full border-collapse mb-4 border border-gray-300"><thead class="bg-gray-800 text-white"><tr>${thHtml.replace(/text-gray-800|text-gray-900|text-[a-z]+-600|bg-[a-z]+-50\/50/g, '')}</tr></thead><tbody>${tbodyHtml}</tbody></table>
            `;
        } else if(tpl === 'elegant') {
            html += `
            <div class="text-center mb-6">
                <img src="${schLogo}" class="h-12 w-12 object-contain mx-auto mb-2 mix-blend-multiply">
                <h1 class="text-2xl font-serif text-primary-900 m-0 leading-tight">${schName}</h1>
                <p class="text-[11px] text-gray-600 italic font-serif mt-1 border-b border-gray-200 inline-block pb-1">${schMotto}</p>
            </div>
            <div class="text-center mb-4"><span class="text-[10px] uppercase font-bold tracking-widest text-primary-700 border-y border-primary-200 py-1 px-8 inline-block">Annual Assessment Report</span></div>
            <div class="flex justify-between items-end mb-4 text-xs font-serif text-gray-800 px-4">
                <div class="space-y-1">
                    <div><span class="text-gray-500">Student:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${rec.student.name}</span></div>
                    <div><span class="text-gray-500">Class:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${clsValue}</span></div>
                </div>
                <div class="text-right space-y-1">
                    <div><span class="text-gray-500">Session:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${sessionValue}</span></div>
                    <div><span class="text-gray-500">Average | Pos:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5 text-primary-700">${rec.average}% | ${rec.position}</span></div>
                </div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="bg-primary-50 text-primary-800 border-t border-b border-primary-200"><tr>${thHtml.replace(/border-slate-300|bg-[a-z]+-50\/50/g, 'border-primary-100')}</tr></thead><tbody class="font-serif">${tbodyHtml.replace(/border border-slate-300/g, 'border-b border-dashed border-gray-200').replace(/bg-[a-z]+-50\/30/g, '')}</tbody><tfoot class="font-bold text-[11px] border-t border-primary-200 bg-primary-50/30"><tr><td colspan="4" class="p-1.5 text-right font-serif">OVERALL TOTAL:</td><td class="p-1.5 text-center text-primary-800">${rec.grandTotal}</td><td colspan="4"></td></tr></tfoot></table>
            `;
        } else {
            // CLASSIC (Fallback/Original Structure matched closely to image logic)
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
                <h2 class="text-[15px] font-extrabold underline m-0 p-1 bg-primary-900 text-white inline-block uppercase">ANNUAL ACADEMIC PROGRESS REPORT</h2>
            </div>
            <table class="w-full border-collapse mb-[15px] text-[11px] shadow-sm">
                <tr>
                    <td class="py-1.5 px-2 font-bold bg-slate-50 border border-slate-300 w-[15%]">Student Name:</td>
                    <td class="py-1.5 px-2 border border-slate-300 w-[35%]">${rec.student.name}</td>
                    <td class="py-1.5 px-2 font-bold bg-slate-50 border border-slate-300 w-[15%]">Admission No:</td>
                    <td class="py-1.5 px-2 border border-slate-300 w-[35%]">ADM-${rec.student.roll}</td>
                </tr>
                <tr>
                    <td class="py-1.5 px-2 font-bold bg-slate-50 border border-slate-300">Class:</td>
                    <td class="py-1.5 px-2 border border-slate-300">${clsValue}</td>
                    <td class="py-1.5 px-2 font-bold bg-slate-50 border border-slate-300">Academic Session:</td>
                    <td class="py-1.5 px-2 border border-slate-300">${sessionValue}</td>
                </tr>
                <tr>
                    <td class="py-1.5 px-2 font-bold bg-slate-50 border border-slate-300">Total Score:</td>
                    <td class="py-1.5 px-2 border border-slate-300 text-primary-800 font-extrabold">${rec.grandTotal}</td>
                    <td class="py-1.5 px-2 font-bold bg-slate-50 border border-slate-300">Class Position:</td>
                    <td class="py-1.5 px-2 border border-slate-300 text-red-700 font-black">${rec.position}</td>
                </tr>
                <tr>
                    <td class="py-1.5 px-2 font-bold bg-slate-50 border border-slate-300">Average:</td>
                    <td class="py-1.5 px-2 border border-slate-300 font-bold">${rec.average}%</td>
                    <td colspan="2" class="py-1.5 px-2 border border-slate-300"></td>
                </tr>
            </table>
            <table class="w-full border-collapse mb-[10px]"><thead class="bg-green-50/50"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody></table>
            `;
        }

        // SHARED FOOTER
        html += `
            <div class="mt-auto border border-slate-300 p-[15px] bg-slate-50 text-[12px] flex flex-col shadow-sm">
                <div class="font-bold mb-[15px] text-center text-[13px] text-primary-900 tracking-wide uppercase">FINAL PROMOTION STATUS: <span class="text-green-600 border-b-2 border-green-600 ml-2">PROMOTED TO NEXT CLASS</span></div>
                
                <div class="flex justify-between items-end mt-[15px]">
                    <div class="text-center">
                        ${headSignHtml}
                        <div class="border-t border-black w-[150px] pt-[5px]">
                            <b class="text-[11px]">${settings.headteacherName}</b><br><span class="text-[10px]">Head Teacher</span>
                        </div>
                    </div>
                    <div class="text-center text-red-700 font-bold text-[11px] bg-red-100 p-1.5 px-3 rounded border border-red-200 shadow-sm mx-4">
                        Next Session Resumes: <br/>${settings.resumption}
                    </div>
                    <div class="text-center">
                        ${prinSignHtml}
                        <div class="border-t border-black w-[150px] pt-[5px]">
                            <b class="text-[11px]">${settings.principalName}</b><br><span class="text-[10px]">Principal</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="absolute inset-0 bg-center bg-no-repeat opacity-[0.03] pointer-events-none -z-10" style="background-image: url('${schLogo}');"></div>
        </div>
        `;
        return html;
    }


    window.previewSingleSessionReportCard = function(studentId) {
        if(currentSessionData.length === 0) return;
        const rec = currentSessionData.find(r => r.student.id === studentId);
        window.activePreviewSessionStudentId = studentId;

        document.getElementById('sr-preview-title').textContent = `${rec.student.name} - Annual Preview`;
        const previewContainer = document.getElementById('sr-preview-body');
        previewContainer.innerHTML = generateSessionPrintTemplate(rec);
        
        // Dynamically scale the UI so it fits directly inside mobile & PC screens responsively!
        const scale = Math.min(1, (window.innerWidth - 30) / 794); // 794px ~ 210mm
        previewContainer.style.transform = `scale(${scale})`;
        const scaledHeight = 1122 * scale; // 1122px ~ 297mm
        previewContainer.parentElement.style.height = `${scaledHeight + 100}px`; // Provide scroll padding
        
        const modal = document.getElementById('sr-preview-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    };

    window.closeSessionPreviewModal = function() {
        document.getElementById('sr-preview-modal').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    window.printSingleSessionReportCard = function() {
        if(window.activePreviewSessionStudentId) {
            window.printSingleSessionReport(window.activePreviewSessionStudentId);
        }
    };

    window.printSingleSessionReport = function(studentId) {
        if(currentSessionData.length === 0) return;
        const rec = currentSessionData.find(r => r.student.id === studentId);
        buildSessionPrintContainer([rec]);
        window.print();
    };

    window.printAllSessionReports = function() {
        if(currentSessionData.length === 0) return;
        buildSessionPrintContainer(currentSessionData);
        window.print();
    };

    function buildSessionPrintContainer(recordsToPrint) {
        const container = document.getElementById('sr-print-container');
        container.innerHTML = '';
        recordsToPrint.forEach((rec) => {
            const page = document.createElement('div');
            page.className = 'print-page-break';
            page.innerHTML = generateSessionPrintTemplate(rec);
            container.appendChild(page);
        });
    }

    setTimeout(initialize, 100);
})();
