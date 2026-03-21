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

        // 2. Determine highest & positions dynamically per subject
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

    // ─── REGISTRY-BASED SESSION TEMPLATE GENERATOR ─────────────────────────────
    function generateSessionPrintTemplate(rec) {
        const settings = getGlobalSettings();
        const clsValue = document.getElementById('sr-class').value || rec.student.class;
        const sessionValue = document.getElementById('sr-session').value || settings.session;
        const tpl = settings.activeTemplate || 'classic';

        const profile = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');

        const payload = window.buildPrintPayload(rec, {
            settings: settings,
            profile: profile,
            evals: { remark: '', domains: {} },
            mode: 'session',
            classValue: clsValue,
            termValue: '',
            sessionValue: sessionValue
        });
        payload._templateId = tpl;

        const innerHtml = window.renderTemplate(payload);
        return `<div class="result-pdf-wrapper relative w-[210mm] h-[296mm] overflow-hidden bg-white mx-auto py-[10mm] px-[15mm] box-border font-sans text-black">${innerHtml}</div>`;
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
