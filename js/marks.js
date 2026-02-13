// Marks View Module
(function() {
    console.log('Marks View Script Loaded');

    const examSelect = document.getElementById('marks-exam-select');
    const classSelect = document.getElementById('marks-class-select');
    const subjectSelect = document.getElementById('marks-subject-select');
    const btnView = document.getElementById('btn-view-marks');
    const tableBody = document.getElementById('marks-table-body');
    const container = document.getElementById('marks-container');

    init();

    async function init() {
        // Load Exams
        const examsData = JSON.parse(localStorage.getItem('examsData') || '[]');
        const assessmentsData = JSON.parse(localStorage.getItem('assessmentsData') || '[]');
        
        examSelect.innerHTML = '<option value="">Select Exam / Assessment</option>';
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
        } catch(e) {}

        btnView.addEventListener('click', loadMarks);
    }

    async function loadMarks() {
        const examId = examSelect.value;
        const cls = classSelect.value;
        const subject = subjectSelect.value;

        if(!examId || !cls) { alert('Please select Exam and Class'); return; }

        container.classList.remove('hidden');
        tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">Loading...</td></tr>';

        // 1. Fetch Students
        let students = [];
        try {
            const res = await fetch('../../data/students-data.json');
            const all = await res.json();
            students = all.filter(s => s.class === cls);
        } catch(e) {}

        // 2. Fetch Scores
        const storageKey = `scores_${examId}_${cls}_${subject}`;
        const scores = JSON.parse(localStorage.getItem(storageKey) || '{}');

        // 3. Render
        tableBody.innerHTML = '';
        if(students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">No students found.</td></tr>';
            return;
        }

        students.sort((a,b) => (parseInt(a.roll)||0) - (parseInt(b.roll)||0));

        let hasData = false;
        students.forEach(s => {
            const score = scores[s.id];
            if(!score) return; // Only show students with entries? Or all? User said "Display all entered marks". Let's show all and highlight missing.
            
            // Actually usually marks register shows everyone.
            const t = parseFloat(score.theory) || 0;
            const p = parseFloat(score.prac) || 0;
            // Only consider it "entered" if raw values exist
            const isEntered = (score.theory !== '' || score.prac !== '');
            if(isEntered) hasData = true;

            const total = isEntered ? t + p : '-';
            const grade = isEntered ? getGrade(total) : '-';

            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 ' + (isEntered ? '' : 'opacity-50');
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    ${s.name} <span class="text-xs text-gray-500 ml-2">(${s.roll})</span>
                </td>
                <td class="px-6 py-4">${score.theory || '-'}</td>
                <td class="px-6 py-4">${score.prac || '-'}</td>
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-gray-200">${total}</td>
                <td class="px-6 py-4">
                     ${grade !== '-' ? `<span class="px-2 py-1 rounded ${getGradeColor(grade)} text-xs font-bold">${grade}</span>` : '-'}
                </td>
                <td class="px-6 py-4 truncate max-w-xs">${score.remarks || '-'}</td>
            `;
            tableBody.appendChild(tr);
        });

        if(!hasData) {
             tableBody.innerHTML += '<tr><td colspan="6" class="p-4 text-center text-yellow-600">No marks entered yet for this selection.</td></tr>';
        }
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

    function getGradeColor(grade) {
        if (['A+', 'A'].includes(grade)) return 'bg-green-100 text-green-800';
        if (['B+', 'B'].includes(grade)) return 'bg-primary-100 text-primary-800';
        if (['C', 'D'].includes(grade)) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }

})();
