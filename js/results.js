// Results Module
(function() {
    console.log('Results Script Loaded');

    const examSelect = document.getElementById('res-exam-select');
    const classSelect = document.getElementById('res-class-select');
    const btnGenerate = document.getElementById('btn-generate-results');
    const summaryCard = document.getElementById('results-summary');
    const resultsContainer = document.getElementById('results-container');
    const tableHead = document.getElementById('results-table-header');
    const tableBody = document.getElementById('results-table-body');

    // Shared State
    let studentsData = [];
    let processedResults = [];

    // Subjects List (Mock or Configurable)
    const SUBJECTS = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Computer Science'];

    init();

    async function init() {
        console.log('Results init() called');
        console.log('examSelect:', examSelect);
        console.log('classSelect:', classSelect);
        console.log('btnGenerate:', btnGenerate);
        
        if (!examSelect || !classSelect || !btnGenerate) {
            console.error('ERROR: One or more elements not found!');
            console.error('examSelect:', examSelect);
            console.error('classSelect:', classSelect);
            console.error('btnGenerate:', btnGenerate);
            return;
        }
        
         // Load Exams
        const examsData = JSON.parse(localStorage.getItem('examsData') || '[]');
        console.log('Loaded examsData:', examsData);
        
        examSelect.innerHTML = '<option value="">Select Exam</option>';
        examsData.forEach(e => {
            const opt = document.createElement('option');
            opt.value = `EXAM:${e.id}`; // Consistent with Scores and Marks
            opt.textContent = e.name;
            examSelect.appendChild(opt);
        });

        // Load Classes
        try {
            const res = await fetch('../../data/classes-data.json');
            const classes = await res.json();
            console.log('Loaded classes:', classes);
            
            classSelect.innerHTML = '<option value="">Select Class</option>';
            classes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = c.name;
                classSelect.appendChild(opt);
            });
        } catch(e) {
            console.error('Error loading classes:', e);
        }

        console.log('Adding click listener to button...');
        btnGenerate.addEventListener('click', function() {
            console.log('Button clicked!');
            generateResults();
        });
        console.log('Init complete!');
    }

    async function generateResults() {
        console.log('=== generateResults() called ===');
        const examId = examSelect.value;
        const cls = classSelect.value;
        console.log('examId:', examId);
        console.log('cls:', cls);

        if(!examId || !cls) { 
            console.warn('Missing exam or class selection');
            alert('Select Exam and Class'); 
            return; 
        }

        console.log('Fetching students...');
        // 1. Fetch Students
        try {
            const res = await fetch('../../data/students-data.json');
            const all = await res.json();
            studentsData = all.filter(s => s.class === cls);
            console.log('Students found:', studentsData.length);
        } catch(e) { 
            console.error('Error fetching students:', e);
            studentsData = []; 
        }

        if(studentsData.length === 0) { alert('No students found'); return; }

        // 2. Fetch Scores for All Subjects
        // We iterate through known subjects and construct the cache keys: scores_{examId}_{cls}_{subj}
        const classScores = {}; // Map: subject -> { studentId: {total: X} }
        
        SUBJECTS.forEach(sub => {
            const key = `scores_${examId}_${cls}_${sub}`;
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            // Normalize: Ensure we just get the total
            const subMap = {};
            Object.keys(data).forEach(sid => {
                const s = data[sid];
                const t = (parseFloat(s.theory)||0) + (parseFloat(s.prac)||0);
                if(s.theory !== '' || s.prac !== '') subMap[sid] = t; 
            });
            classScores[sub] = subMap;
        });

        // 3. Process Each Student
        processedResults = studentsData.map(student => {
            let totalMarks = 0;
            let subjectsCount = 0;
            const subjectMarks = {};

            SUBJECTS.forEach(sub => {
                const val = classScores[sub]?.[student.id];
                subjectMarks[sub] = val !== undefined ? val : '-';
                if(val !== undefined) {
                    totalMarks += val;
                    subjectsCount++;
                }
            });

            const avg = subjectsCount > 0 ? (totalMarks / subjectsCount).toFixed(1) : 0;
            
            // Pass Logic: e.g., Pass if Avg >= 40 
            const isPass = avg >= 40; 
            
            return {
                ...student,
                subjectMarks,
                totalMarks,
                avg: parseFloat(avg),
                isPass,
                grade: getGrade(avg)
            };
        });

        // 4. Rank
        processedResults.sort((a,b) => b.avg - a.avg);
        processedResults.forEach((r, idx) => r.rank = idx + 1);

        // 5. Render
        renderUI(processedResults, SUBJECTS);
        updateStats(processedResults);
    }

    function renderUI(results, subjects) {
        summaryCard.classList.remove('hidden');
        summaryCard.classList.add('grid');
        resultsContainer.classList.remove('hidden');

        // Dynamic Header
        let thHTML = `<th class="px-4 py-3">Rank</th><th class="px-4 py-3">Student</th>`;
        subjects.forEach(sub => {
            thHTML += `<th class="px-4 py-3">${sub.substring(0,3)}</th>`;
        });
        thHTML += `<th class="px-4 py-3">Total</th><th class="px-4 py-3">Avg</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Report</th>`;
        tableHead.innerHTML = thHTML;

        // Rows
        tableBody.innerHTML = '';
        results.forEach(r => {
            let trHTML = `
                <td class="px-4 py-3 font-bold">${getRankBadge(r.rank)}</td>
                <td class="px-4 py-3 flex items-center">
                    <img src="${r.photo}" class="w-8 h-8 rounded-full mr-2">
                    <div>
                        <div class="font-semibold text-gray-900 dark:text-white">${r.name}</div>
                        <div class="text-xs text-gray-500">${r.id}</div>
                    </div>
                </td>
            `;

            subjects.forEach(sub => {
                const m = r.subjectMarks[sub];
                // Color code low marks
                const color = (m !== '-' && m < 40) ? 'text-red-500 font-bold' : '';
                trHTML += `<td class="px-4 py-3 ${color}">${m}</td>`;
            });

            trHTML += `
                <td class="px-4 py-3 font-bold">${r.totalMarks}</td>
                <td class="px-4 py-3 font-bold text-gray-600 dark:text-gray-200">${r.avg}%</td>
                <td class="px-4 py-3">
                    ${r.isPass 
                        ? '<span class="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded">PASS</span>'
                        : '<span class="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded">FAIL</span>'}
                </td>
                <td class="px-4 py-3">
                    <button onclick="generateStudentResult('${r.id}')" class="text-xs text-white bg-primary-600 hover:bg-primary-700 font-medium rounded px-2.5 py-1.5 whitespace-nowrap">
                        <i class="fas fa-id-card mr-1"></i>Result
                    </button>
                </td>
            `;

            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50';
            tr.innerHTML = trHTML;
            tableBody.appendChild(tr);
        });
    }

    function updateStats(results) {
        document.getElementById('card-total').textContent = results.length;
        const passed = results.filter(r => r.isPass).length;
        document.getElementById('card-passed').textContent = passed;
        document.getElementById('card-failed').textContent = results.length - passed;
        
        const perc = ((passed / results.length) * 100).toFixed(1);
        document.getElementById('card-percentage').textContent = perc + '%';

        const classAvg = (results.reduce((acc, curr) => acc + curr.avg, 0) / results.length).toFixed(1);
        document.getElementById('card-avg').textContent = classAvg + '%';

        if(results.length > 0) {
            document.getElementById('card-highest').textContent = `${results[0].avg}% (${results[0].name})`;
        }
    }

    window.exportResultsCSV = function() {
        if(processedResults.length === 0) return;
        
        let csv = 'Rank,ID,Name,';
        SUBJECTS.forEach(s => csv += s + ',');
        csv += 'Total,Average,Status\n';

        processedResults.forEach(r => {
            csv += `${r.rank},${r.id},${r.name},`;
            SUBJECTS.forEach(s => csv += (r.subjectMarks[s] === '-' ? '' : r.subjectMarks[s]) + ',');
            csv += `${r.totalMarks},${r.avg},${r.isPass ? 'PASS' : 'FAIL'}\n`;
        });

        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'Class_Results.csv');
        document.body.appendChild(link);
        link.click();
    };

    window.generateStudentResult = function(studentId) {
        const student = processedResults.find(r => r.id === studentId);
        if (!student) return;

        const examLabel = examSelect.options[examSelect.selectedIndex]?.text || 'Examination';
        const yearVal = document.getElementById('res-year-select')?.value || '';

        // Populate header fields
        document.getElementById('rp-exam-title').textContent = examLabel;
        document.getElementById('rp-student-name').textContent = student.name;
        document.getElementById('rp-student-id').textContent = 'ID: ' + student.id;
        document.getElementById('rp-class').textContent = classSelect.value;
        document.getElementById('rp-term').textContent = examLabel;
        document.getElementById('rp-total').textContent = student.totalMarks;
        document.getElementById('rp-average').textContent = student.avg + '%';
        document.getElementById('rp-position').textContent = student.rank + getOrdinalSuffix(student.rank) + ' / ' + processedResults.length;
        document.getElementById('rp-status').textContent = student.isPass ? 'PROMOTED' : 'REFERRED';
        document.getElementById('rp-status').className = 'font-bold ' + (student.isPass ? 'text-green-600' : 'text-red-600');
        document.getElementById('rp-subject-count').textContent = SUBJECTS.length;
        document.getElementById('rp-class-size').textContent = processedResults.length;
        document.getElementById('rp-year').textContent = yearVal;
        document.getElementById('rp-date').textContent = new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'});

        // Populate scores table
        const tbody = document.getElementById('rp-scores-body');
        tbody.innerHTML = '';
        SUBJECTS.forEach(sub => {
            const score = student.subjectMarks[sub];
            if (score === '-' || score === undefined) return;
            const ca = Math.round(score * 0.4);
            const exam = Math.round(score * 0.6);
            const grade = getGrade(score);
            const remark = score >= 50 ? 'CREDIT' : score >= 40 ? 'PASS' : 'FAIL';
            const rowColor = score < 40 ? 'bg-red-50' : '';
            tbody.innerHTML += `
                <tr class="border-b ${rowColor}">
                    <td class="px-4 py-2 font-medium text-gray-800">${sub}</td>
                    <td class="px-4 py-2 text-center">${ca}</td>
                    <td class="px-4 py-2 text-center">${exam}</td>
                    <td class="px-4 py-2 text-center font-bold">${score}</td>
                    <td class="px-4 py-2 text-center font-bold text-primary-700">${grade}</td>
                    <td class="px-4 py-2 text-center text-sm ${score < 40 ? 'text-red-600 font-bold' : 'text-green-700'}">${remark}</td>
                </tr>
            `;
        });

        // Show modal
        const modal = document.getElementById('studentResultModal');
        modal.classList.remove('hidden');
        modal.scrollTop = 0;
    };

    function getOrdinalSuffix(n) {
        if (n === 1) return 'st';
        if (n === 2) return 'nd';
        if (n === 3) return 'rd';
        return 'th';
    }

    function getRankBadge(rank) {
        if(rank === 1) return '🥇 1st';
        if(rank === 2) return '🥈 2nd';
        if(rank === 3) return '🥉 3rd';
        return rank + 'th';
    }

    function getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    }
})();
