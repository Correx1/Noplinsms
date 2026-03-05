// Examinations Module Logic
(function() {
    const KEY = 'sms_exams';

    // Seed Data with realistic dummy exams + questions
    const SEED = [
        {
            id: 'EXM001',
            name: 'First Term Examination 2024/2025',
            type: 'Terminal',
            session: '2024/2025 First Term',
            startDate: '2024-11-25',
            endDate: '2024-12-06',
            classes: ['JSS1A','JSS1B','JSS2A','JSS2B','JSS3A','SSS1A','SSS1B','SSS2A','SSS2B','SSS3A'],
            description: 'End of first term examinations for all classes.',
            status: 'Completed',
            questions: {
                'Mathematics': [
                    { q:'What is 15 + 27?', a:'42', b:'38', c:'41', d:'43', ans:'A' },
                    { q:'Find the HCF of 12 and 18', a:'3', b:'6', c:'9', d:'12', ans:'B' },
                    { q:'Simplify: 3(x + 4) - 2x', a:'x + 4', b:'x + 12', c:'5x + 4', d:'x + 7', ans:'B' },
                ],
                'English Language': [
                    { q:'Which of these is a noun?', a:'Run', b:'Beautiful', c:'Teacher', d:'Quickly', ans:'C' },
                    { q:'The antonym of "ancient" is?', a:'old', b:'modern', c:'huge', d:'weak', ans:'B' },
                ]
            }
        },
        {
            id: 'EXM002',
            name: 'Second Term Mid-Term Assessment',
            type: 'Mid-Term',
            session: '2024/2025 Second Term',
            startDate: '2025-02-10',
            endDate: '2025-02-14',
            classes: ['SSS1A','SSS1B','SSS2A','SSS2B','SSS3A','SSS3B'],
            description: 'Mid-term assessment for all Senior Secondary classes.',
            status: 'Upcoming',
            questions: {
                'Physics': [
                    { q:'What is the unit of force?', a:'Joule', b:'Watt', c:'Newton', d:'Pascal', ans:'C' },
                    { q:'Speed = Distance / ?', a:'Mass', b:'Time', c:'Volume', d:'Area', ans:'B' },
                ],
                'Chemistry': [
                    { q:'What is the chemical symbol for Gold?', a:'Go', b:'Gd', c:'Au', d:'Ag', ans:'C' },
                    { q:'Water is made up of?', a:'H2O2', b:'H2O', c:'HO', d:'H3O', ans:'B' },
                ]
            }
        },
        {
            id: 'EXM003',
            name: 'Second Term Final Examination',
            type: 'Terminal',
            session: '2024/2025 Second Term',
            startDate: '2025-03-20',
            endDate: '2025-04-02',
            classes: ['JSS1A','JSS2A','JSS3A','SSS1A','SSS2A','SSS3A'],
            description: 'End of second term main examinations.',
            status: 'Upcoming',
            questions: {}
        },
        {
            id: 'EXM004',
            name: 'WAEC Mock Examination',
            type: 'Mock/External',
            session: '2024/2025',
            startDate: '2025-01-15',
            endDate: '2025-01-30',
            classes: ['SSS3A','SSS3B'],
            description: 'WAEC preparation mock examination for final year students.',
            status: 'Completed',
            questions: {
                'Mathematics': [
                    { q:'If 2x + 5 = 13, find x', a:'3', b:'4', c:'9', d:'6', ans:'B' },
                    { q:'Evaluate log₁₀(1000)', a:'2', b:'4', c:'3', d:'10', ans:'C' },
                ],
                'English Language': [
                    { q:'Choose the correct spelling:', a:'Accomodate', b:'Accommodate', c:'Acommodate', d:'Acomodate', ans:'B' },
                ]
            }
        }
    ];

    function loadExams() {
        const d = localStorage.getItem(KEY);
        if (!d) { localStorage.setItem(KEY, JSON.stringify(SEED)); return SEED; }
        return JSON.parse(d);
    }

    function saveExams(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

    function statusBadge(s) {
        const m = { Completed:'bg-green-100 text-green-800', Upcoming:'bg-blue-100 text-blue-800', Ongoing:'bg-yellow-100 text-yellow-800' };
        return `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${m[s]||'bg-gray-100 text-gray-700'}">${s}</span>`;
    }

    // =================== LIST PAGE ===================
    const tableBody = document.getElementById('exams-table-body');
    if (tableBody) {
        const exams = loadExams();
        if (exams.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-400">No examinations found. Create one to get started.</td></tr>';
        } else {
            tableBody.innerHTML = exams.map(e => `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${e.name}</td>
                    <td class="px-6 py-4">${e.type}<br><span class="text-xs text-gray-500">${e.session}</span></td>
                    <td class="px-6 py-4 text-sm">${e.startDate}<br><span class="text-gray-500">to ${e.endDate}</span></td>
                    <td class="px-6 py-4 text-xs">${e.classes.slice(0,4).join(', ')}${e.classes.length>4?` +${e.classes.length-4} more`:''}</td>
                    <td class="px-6 py-4">${statusBadge(e.status)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="window.examActions.view('${e.id}')" class="mr-2 text-xs px-3 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200">
                            <i class="fas fa-eye mr-1"></i>View
                        </button>
                        <button onclick="window.examActions.del('${e.id}')" class="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </td>
                </tr>`).join('');
        }

        window.examActions = {
            view(id) { localStorage.setItem('viewExamId', id); loadViewExamPage(); },
            del(id) {
                if (!confirm('Delete this exam? This cannot be undone.')) return;
                const d = loadExams().filter(e => e.id !== id);
                saveExams(d); location.reload();
            }
        };
    }

    // =================== VIEW PAGE ===================
    const viewExamName = document.getElementById('view-exam-name');
    if (viewExamName) {
        const examId = localStorage.getItem('viewExamId');
        const exams = loadExams();
        const exam = exams.find(e => e.id === examId);
        if (exam) {
            document.getElementById('view-exam-name').textContent = exam.name;
            document.getElementById('view-exam-id').textContent   = 'ID: ' + exam.id;
            document.getElementById('view-exam-type').textContent = exam.type;
            document.getElementById('view-exam-session').textContent = exam.session;
            document.getElementById('view-exam-classes').textContent = exam.classes.join(', ');
            document.getElementById('view-exam-start').textContent   = exam.startDate;
            document.getElementById('view-exam-end').textContent     = exam.endDate;
            const sb = document.getElementById('view-exam-status-badge');
            if (sb) sb.innerHTML = statusBadge(exam.status);

            // Render question bank summary
            const qSection = document.getElementById('view-exam-questions');
            if (qSection) {
                const subjects = Object.keys(exam.questions || {});
                if (subjects.length === 0) {
                    qSection.innerHTML = '<p class="text-sm text-gray-500 italic">No questions added yet.</p>';
                } else {
                    qSection.innerHTML = subjects.map(subj => `
                        <div class="mb-4">
                            <h4 class="font-semibold text-gray-800 dark:text-white mb-2">${subj} — ${exam.questions[subj].length} question(s)</h4>
                            <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                ${exam.questions[subj].map(q => `
                                    <li>${q.q}
                                        <ul class="mt-1 ml-4 list-none grid grid-cols-2 gap-1">
                                            ${['a','b','c','d'].map(opt => `<li class="${q.ans===opt.toUpperCase()?'font-bold text-green-700 dark:text-green-400':''}"><span class="uppercase">${opt})</span> ${q[opt]}</li>`).join('')}
                                        </ul>
                                    </li>`).join('')}
                            </ol>
                        </div>`).join('');
                }
            }
        }
    }

    // =================== CREATE PAGE ===================
    // Handled by create-examination.html inline (it has its own MCQ builder app)

})();
