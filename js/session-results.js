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
        const sessionValue = document.getElementById('sr-session').value;

        if(!clsValue) return;

        let students = Array.from({length: 10}, (_, i) => ({
            id: `STD-S-${i+1}`,
            name: `Student Model ${i+1}`,
            class: clsValue,
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

        let html = `
        <div class="result-pdf-wrapper" style="width: 210mm; min-height: 297mm; overflow: hidden; background: white; margin: 0 auto; padding: 10mm 15mm; page-break-after: always; box-sizing: border-box; font-family: 'Inter', sans-serif;">
            
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
                <h2 style="font-size: 15px; font-weight: 800; text-decoration: underline; margin: 0; padding: 4px; background: #1e3a8a; color: white; display: inline-block;">ANNUAL ACADEMIC PROGRESS REPORT</h2>
            </div>
            
            <!-- STUDENT BIO DATA -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
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
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${sessionValue}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1;">Total Score:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-weight: 900; color: #1e3a8a;">${rec.grandTotal}</td>
                    <td style="padding: 4px 8px; font-weight: bold; background: #f8fafc; border: 1px solid #cbd5e1;">Annual Class Position:</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: 900;">${rec.position}</td>
                </tr>
            </table>

            <!-- CORE MATRIX TABLE -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <thead style="background: #f0fdf4;">
                    <tr>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; width: 20%; font-size: 11px; color: #1f2937;">SUBJECT</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #ca8a04; background: #fefce8;">TERM 1</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #2563eb; background: #eff6ff;">TERM 2</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #16a34a; background: #f0fdf4;">TERM 3</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #111827; background: #f3f4f6;">ANNUAL</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #4b5563;">GRADE</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #4b5563;">REMARK</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #4b5563;">HIGHEST</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #4b5563;">POSITION</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rec.subjects.forEach(sub => {
            html += `
                <tr style="font-size: 12px; border-bottom: 1px solid #cbd5e1;">
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 600; color: #374151;">${sub.subject}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; background: #fefce8; color: #854d0e;">${sub.t1}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; background: #eff6ff; color: #1e40af;">${sub.t2}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; background: #f0fdf4; color: #166534;">${sub.t3}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900; background: #f3f4f6; color: #111827;">${sub.annual}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: #15803d;"><span style="background: #ecfdf5; padding: 2px 6px; border-radius: 999px; display: inline-block;">${sub.grade}</span></td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #4b5563;">${sub.remark}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #1f2937;">${sub.highest}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #4b5563;">${sub.position}</td>
                </tr>
            `;
        });

        let prinSignHtml = settings.principalSign ? `<img src="${settings.principalSign}" style="max-height: 25px; object-fit: contain; margin-bottom: 2px;">` : `<div style="height: 25px;"></div>`;
        let headSignHtml = settings.headteacherSign ? `<img src="${settings.headteacherSign}" style="max-height: 25px; object-fit: contain; margin-bottom: 2px;">` : `<div style="height: 25px;"></div>`;

        html += `
                </tbody>
            </table>

            <!-- SIGNATORIES BOILERPLATE -->
            <div style="margin-top: auto; border: 1px solid #cbd5e1; padding: 15px; background: #f8fafc; font-size: 12px; display: flex; flex-direction: column;">
                <div style="font-weight: bold; margin-bottom: 15px; text-align: center; font-size: 13px; color: #1e3a8a;">FINAL PROMOTION STATUS: <span style="color: #16a34a; border-bottom: 2px solid #16a34a;">PROMOTED TO NEXT CLASS</span></div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px;">
                    <div style="text-align: center;">
                        ${headSignHtml}
                        <div style="border-top: 1px solid black; width: 150px; padding-top: 5px;">
                            <b style="font-size: 11px;">${settings.headteacherName}</b><br><span style="font-size: 10px;">Head Teacher</span>
                        </div>
                    </div>
                    <div style="text-align: center; color: #b91c1c; font-weight: bold; font-size: 11px; background: #fee2e2; padding: 6px 12px; border-radius: 4px; border: 1px solid #fecaca;">
                        Next Session Resumes: ${settings.resumption}
                    </div>
                    <div style="text-align: center;">
                        ${prinSignHtml}
                        <div style="border-top: 1px solid black; width: 150px; padding-top: 5px;">
                            <b style="font-size: 11px;">${settings.principalName}</b><br><span style="font-size: 10px;">Principal</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('../../assets/images/logo.png'); background-position: center; background-repeat: no-repeat; opacity: 0.03; pointer-events: none; z-index: -1;"></div>
        </div>
        `;
        return html;
    }

    window.previewSingleSessionReportCard = function(studentId) {
        if(currentSessionData.length === 0) return;
        const rec = currentSessionData.find(r => r.student.id === studentId);
        window.activePreviewSessionStudentId = studentId;

        document.getElementById('sr-preview-title').textContent = `${rec.student.name} - Annual Preview`;
        document.getElementById('sr-preview-body').innerHTML = generateSessionPrintTemplate(rec);
        
        document.getElementById('sr-preview-modal').classList.remove('hidden');
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
