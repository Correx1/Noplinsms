// Master Results Matrix Logic
(function() {
    console.log('Results Matrix initialized');

    let classesData = [];
    let subjectsData = [];
    let gradeBoundariesData = [];

    async function initialize() {
        try {
            const [clsRes, subRes] = await Promise.all([
                fetch('../../data/classes-data.json'),
                fetch('../../data/subjects-data.json')
            ]);
            classesData = await clsRes.json();
            subjectsData = await subRes.json();

            // Load Grade Boundaries to attach Grade pills
            const boundsMap = localStorage.getItem('gradeBoundariesData');
            if(boundsMap) {
                gradeBoundariesData = JSON.parse(boundsMap);
            } else {
                gradeBoundariesData = [
                    { grade: 'A', min: 75, max: 100 },
                    { grade: 'B', min: 60, max: 74 },
                    { grade: 'C', min: 50, max: 59 },
                    { grade: 'D', min: 40, max: 49 },
                    { grade: 'F', min: 0, max: 39 }
                ];
            }
            gradeBoundariesData.sort((a,b) => b.min - a.min);

            // Populate Checkboxes
            const classSelect = document.getElementById('mr-class');
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

    function getGrade(score) {
        let bnd = gradeBoundariesData.find(b => score >= b.min && score <= b.max);
        return bnd ? bnd.grade : '-';
    }

    function getGradeColor(grade) {
        if(grade === 'A') return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        if(grade === 'B') return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        if(grade === 'C') return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        if(grade === 'D' || grade === 'E') return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
        if(grade === 'F') return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }

    window.loadMasterResults = function() {
        const clsValue = document.getElementById('mr-class').value;
        const termValue = document.getElementById('mr-term').value;
        if(!clsValue) return;

        // Generate exactly 10 mock students (like Result Sheets)
        const sectionsList = ['A', 'B', 'C', 'D'];
        let students = Array.from({length: 10}, (_, i) => ({
            id: `STD-M-${i+1}`,
            name: `Student Model ${i+1}`,
            roll: `00${i+1}`,
            section: sectionsList[i % sectionsList.length]
        }));

        // Limit to 12 active subjects for visual feasibility
        let activeSubs = subjectsData.slice(0, 12).map(s => s.name);

        // Build generic aggregated matrix mock data
        let records = [];
        students.forEach(student => {
            let userGrandTotal = 0;
            let subs = {};
            let baseSkill = 0.4 + (Math.random() * 0.5); // 40% to 90%
            
            activeSubs.forEach(sub => {
                let variance = (Math.random() * 0.2) - 0.1;
                let score = Math.round(100 * (baseSkill + variance));
                if(score > 100) score = 100;
                if(score < 0) score = 0;
                
                subs[sub] = score;
                userGrandTotal += score;
            });

            records.push({
                student: student,
                subjects: subs,
                grandTotal: userGrandTotal,
                average: (userGrandTotal / activeSubs.length).toFixed(1)
            });
        });

        // Sort by grand total (Position)
        records.sort((a,b) => b.grandTotal - a.grandTotal);

        // Render Table Headers
        const thead = document.getElementById('mr-thead');
        let thHtml = `
            <tr>
                <th scope="col" class="px-6 py-4 sticky left-0 z-20 bg-gray-200 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 text-left w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Student Info</th>
        `;
        activeSubs.forEach(sub => {
            thHtml += `<th scope="col" class="px-4 py-4 min-w-[120px] border-r border-gray-300 dark:border-gray-600 truncate max-w-[150px]" title="${sub}">${sub}</th>`;
        });
        thHtml += `
                <th scope="col" class="px-6 py-4 border-r border-gray-300 dark:border-gray-600 text-primary-700 dark:text-primary-400 font-bold min-w-[100px]">Total Score</th>
                <th scope="col" class="px-6 py-4 text-primary-700 dark:text-primary-400 font-bold min-w-[100px]">Average</th>
            </tr>
        `;
        thead.innerHTML = thHtml;

        // Render Table Body
        const tbody = document.getElementById('mr-tbody');
        tbody.innerHTML = '';
        records.forEach((rec, index) => {
            let position = index + 1;
            let rowClass = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/80';
            
            let html = `
                <tr class="${rowClass} border-b border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                    <td class="px-6 py-3 font-medium text-gray-900 dark:text-white sticky left-0 z-20 ${rowClass} border-r border-gray-200 dark:border-gray-600 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div class="flex flex-col">
                            <span class="truncate block w-40 font-bold text-sm" title="${rec.student.name}">${rec.student.name}</span>
                            <span class="text-xs text-gray-500 font-normal">Pos: <span class="badge bg-primary-100 text-primary-800 px-1 py-0.5 rounded font-bold">${position}</span> &nbsp;|&nbsp; Roll: ${rec.student.roll}</span>
                            <span class="text-xs mt-0.5"><span class="inline-block bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold text-[10px]">Section ${rec.student.section}</span></span>
                        </div>
                    </td>
            `;

            activeSubs.forEach(sub => {
                let score = rec.subjects[sub];
                let grade = getGrade(score);
                let gColor = getGradeColor(grade);
                
                html += `
                    <td class="px-4 py-3 border-r border-gray-200 dark:border-gray-700 relative group">
                        <span class="font-bold text-sm text-gray-700 dark:text-gray-300 block">${score}</span>
                        <span class="inline-block mt-0.5 ${gColor} text-[10px] font-bold px-1.5 py-0.5 rounded-sm">${grade}</span>
                    </td>
                `;
            });

            html += `
                    <td class="px-6 py-3 border-r border-gray-200 dark:border-gray-700 font-black text-primary-600 dark:text-primary-400 text-base bg-primary-50/50 dark:bg-primary-900/10">${rec.grandTotal}</td>
                    <td class="px-6 py-3 font-bold ${rec.average >= 50 ? 'text-green-600' : 'text-red-500'} bg-primary-50/50 dark:bg-primary-900/10">${rec.average}%</td>
                </tr>
            `;
            tbody.innerHTML += html;
        });

        document.getElementById('mr-title').textContent = `${clsValue} - Master Results Matrix`;
        document.getElementById('mr-matrix-container').classList.remove('hidden');
    };

    setTimeout(initialize, 100);
})();
