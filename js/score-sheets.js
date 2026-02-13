// Score Sheets Module
(function() {
    console.log('Score Sheets Script Loaded');

    // --- DOM ELEMENTS ---
    const examSelect = document.getElementById('score-exam-select');
    const classSelect = document.getElementById('score-class-select');
    const sectionSelect = document.getElementById('score-section-select');
    const btnLoad = document.getElementById('btn-load-scores');
    const summaryCard = document.getElementById('score-summary-card');
    const sheetContainer = document.getElementById('score-sheet-container');
    const tableBody = document.getElementById('score-table-body');
    
    // Stats Elements
    const statTotal = document.getElementById('stat-total');
    const statEntered = document.getElementById('stat-entered');
    const statAvg = document.getElementById('stat-avg');

    let currentScores = {}; // Memory cache for current session

    // --- INITIALIZATION ---
    loadDropdowns();
    setupListeners();

    async function loadDropdowns() {
        // Load Exams
        const examsData = JSON.parse(localStorage.getItem('examsData') || '[]');
        const assessmentsData = JSON.parse(localStorage.getItem('assessmentsData') || '[]');
        
        examSelect.innerHTML = '<option value="">Select Exam / Assessment</option>';
        
        // Group Exams
        if (examsData.length > 0) {
            const grp = document.createElement('optgroup');
            grp.label = 'Formal Examinations';
            examsData.forEach(e => {
                const opt = document.createElement('option');
                opt.value = `EXAM:${e.id}`;
                opt.textContent = e.name;
                grp.appendChild(opt);
            });
            examSelect.appendChild(grp);
        }

        // Group Assessments
        if (assessmentsData.length > 0) {
            const grp = document.createElement('optgroup');
            grp.label = 'Assessments';
            assessmentsData.forEach(a => {
                const opt = document.createElement('option');
                opt.value = `ASSESS:${a.id}`;
                opt.textContent = a.title;
                grp.appendChild(opt);
            });
            examSelect.appendChild(grp);
        }

        // Load Classes
        try {
            const res = await fetch('../../data/classes-data.json');
            const classes = await res.json();
            classSelect.innerHTML = '<option value="">Select Class</option>';
            classes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = c.name;
                classSelect.appendChild(opt);
            });

            // Section Listener
            classSelect.addEventListener('change', () => {
                const clsName = classSelect.value;
                const clsObj = classes.find(c => c.name === clsName);
                sectionSelect.innerHTML = '<option value="">All Sections</option>';
                if(clsObj && clsObj.sections){
                    clsObj.sections.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s.name;
                        opt.textContent = 'Section ' + s.name;
                        sectionSelect.appendChild(opt);
                    });
                }
            });
        } catch(e) {}
    }

    function setupListeners() {
        btnLoad.addEventListener('click', loadScoreSheet);
    }

    // --- MAIN LOGIC ---
    async function loadScoreSheet() {
        const examId = examSelect.value;
        const cls = classSelect.value;
        const sec = sectionSelect.value;
        const subject = document.getElementById('score-subject-select').value;

        if(!examId || !cls) {
            alert('Please select Exam and Class');
            return;
        }

        // Fetch Students
        let students = [];
        try {
            const res = await fetch('../../data/students-data.json');
            const allStudents = await res.json();
            students = allStudents.filter(s => s.class === cls);
            if(sec) students = students.filter(s => s.section === sec);
            
            // Mock empty if needed
            if(students.length === 0) {
                alert('No students found for this class.');
                return;
            }
        } catch(e) { console.error(e); }

        // Fetch Existing Scores
        const storageKey = `scores_${examId}_${cls}_${subject}`; // Simplified Key
        const savedScores = JSON.parse(localStorage.getItem(storageKey) || '{}');
        currentScores = savedScores;

        // Render IO
        renderTable(students, savedScores);
        updateStats(students.length, savedScores);
        
        summaryCard.classList.remove('hidden');
        summaryCard.classList.add('grid');
        sheetContainer.classList.remove('hidden');
        document.getElementById('sheet-title').textContent = `${document.getElementById('score-subject-select').value} Scores - ${cls}`;
    }

    function renderTable(students, scores) {
        tableBody.innerHTML = '';
        students.sort((a,b) => (parseInt(a.roll)||0) - (parseInt(b.roll)||0));

        students.forEach(student => {
            const sid = student.id;
            const score = scores[sid] || { theory: '', prac: '', remarks: '' };
            const total = calculateRowTotal(score.theory, score.prac);
            const grade = getGrade(total);

         const tr = document.createElement('tr');
tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700';
tr.innerHTML = `
    <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${student.roll}</td>
    <td class="px-4 py-3 flex items-center">
        <img class="w-8 h-8 rounded-full mr-3" src="${student.photo}" alt="">
        <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">${student.name}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${sid}</div>
        </div>
    </td>
    <td class="px-4 py-3">
        <input type="number" min="0" max="70" 
            class="inp-theory bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded focus:ring-primary-500 focus:border-primary-500 block w-full p-1" 
            value="${score.theory}" data-sid="${sid}" onchange="updateRow(this)">
    </td>
    <td class="px-4 py-3">
        <input type="number" min="0" max="30" 
            class="inp-prac bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded focus:ring-primary-500 focus:border-primary-500 block w-full p-1" 
            value="${score.prac}" data-sid="${sid}" onchange="updateRow(this)">
    </td>
    <td class="px-4 py-3 font-bold text-gray-900 dark:text-white" id="total-${sid}">${total || '-'}</td>
    <td class="px-4 py-3" id="grade-${sid}">
        ${grade ? `<span class="px-2 py-1 rounded ${getGradeColor(grade)} text-xs font-bold">${grade}</span>` : '-'}
    </td>
    <td class="px-4 py-3">
        <input type="text" 
            class="inp-remarks bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded block w-full p-1" 
            value="${score.remarks}" placeholder="Good..." data-sid="${sid}">
    </td>
`;
tableBody.appendChild(tr);
        });
    }

    // --- CALCULATIONS ---
    window.updateRow = function(input) {
        const sid = input.dataset.sid;
        const row = input.closest('tr');
        const theory = row.querySelector('.inp-theory').value;
        const prac = row.querySelector('.inp-prac').value;
        const maxTheory = 70;
        const maxPrac = 30;

        // Validation
        if(theory > maxTheory) { alert(`Theory max is ${maxTheory}`); row.querySelector('.inp-theory').value = maxTheory; return; }
        if(prac > maxPrac) { alert(`Practical max is ${maxPrac}`); row.querySelector('.inp-prac').value = maxPrac; return; }

        const total = calculateRowTotal(theory, prac);
        const grade = getGrade(total);

        document.getElementById(`total-${sid}`).textContent = total;
        const gradeCell = document.getElementById(`grade-${sid}`);
        gradeCell.innerHTML = `<span class="px-2 py-1 rounded ${getGradeColor(grade)} text-xs font-bold">${grade}</span>`;

        // Update Stats dynamically (simplified: just call updateStats)
    };

    function calculateRowTotal(t, p) {
        const tVal = parseFloat(t) || 0;
        const pVal = parseFloat(p) || 0;
        if (!t && !p) return '';
        return tVal + pVal;
    }

    function getGrade(score) {
        if (score === '' || score === null) return '';
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    }

    function getGradeColor(grade) {
        if (['A+', 'A'].includes(grade)) return 'bg-green-100 text-green-800';
        if (['B+', 'B'].includes(grade)) return 'bg-primary-100 text-primary-800';
        if (['C', 'D'].includes(grade)) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }

    function updateStats(totalStudents, scoresObj) {
        const enteredCount = Object.keys(scoresObj).length;
        statTotal.textContent = totalStudents;
        statEntered.textContent = enteredCount;

        let sum = 0;
        let count = 0;
        Object.values(scoresObj).forEach(s => {
            const t = calculateRowTotal(s.theory, s.prac);
            if(t !== '') {
                sum += t;
                count++;
            }
        });
        statAvg.textContent = count > 0 ? (sum / count).toFixed(1) + '%' : '0%';
    }

    // --- ACTIONS ---
    window.saveScores = function() {
        const examId = examSelect.value;
        const cls = classSelect.value;
        const subject = document.getElementById('score-subject-select').value;
        const storageKey = `scores_${examId}_${cls}_${subject}`;

        const newData = {};
        document.querySelectorAll('#score-table-body tr').forEach(row => {
            const sid = row.querySelector('.inp-theory').dataset.sid;
            const theory = row.querySelector('.inp-theory').value;
            const prac = row.querySelector('.inp-prac').value;
            const remarks = row.querySelector('.inp-remarks').value;
            
            if(theory || prac) { // Only save if data exists
                newData[sid] = { theory, prac, remarks };
            }
        });

        localStorage.setItem(storageKey, JSON.stringify(newData));
        alert('Scores Saved Successfully!');
        
        // Refresh stats
        const studentCount = document.querySelectorAll('#score-table-body tr').length;
        updateStats(studentCount, newData);
    };

    window.downloadExcelTemplate = function() {
        const subject = document.getElementById('score-subject-select').value;
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Student ID,Student Name,Theory Score (70),Practical Score (30),Remarks\n"
            + "STD001,John Doe,60,25,Excellent\n"
            + "STD002,Jane Smith,55,20,Good";
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${subject}_Score_Template.csv`);
        document.body.appendChild(link);
        link.click();
    };

})();
