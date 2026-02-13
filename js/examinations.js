// Examinations Module Logic
(function() {
    console.log('Examinations Script Loaded');

    // --- DOM ELEMENTS ---
    const tableBody = document.getElementById('exams-table-body');
    const createForm = document.getElementById('create-exam-form');
    // Views
    const scheduleClassList = document.getElementById('schedule-class-list');
    const scheduleTableBody = document.getElementById('schedule-table-body');
    const viewExamName = document.getElementById('view-exam-name');
    const admitCardClassSelect = document.getElementById('admit-card-class');
    const admitCardGrid = document.getElementById('admit-cards-grid');

    // --- STATE ---
    let examsData = [];
    let classesData = [];

    // --- INITIALIZATION ---
    // Detect Page
    if (tableBody) initListPage();
    else if (createForm) initCreatePage();
    else if (scheduleClassList) initSchedulePage();
    else if (viewExamName) initViewPage();
    else if (admitCardClassSelect) initAdmitCardPage();

    // --- LIST PAGE ---
    async function initListPage() {
        await loadExamsData();
        renderTable(examsData);
    }

    async function loadExamsData() {
        try {
            const stored = localStorage.getItem('examsData');
            if (stored) {
                examsData = JSON.parse(stored);
            } else {
                const res = await fetch('../../data/examinations-data.json');
                examsData = await res.json();
                localStorage.setItem('examsData', JSON.stringify(examsData));
            }
        } catch (e) { console.error(e); }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">No exams found.</td></tr>';
            return;
        }

        data.forEach(exam => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50';
            
            // Status Badge
            const statusColors = {
                'Upcoming': 'blue',
                'Ongoing': 'yellow',
                'Completed': 'green'
            };
            const color = statusColors[exam.status] || 'gray';
            const badge = `<span class="bg-${color}-100 text-${color}-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-${color}-900 dark:text-${color}-300">${exam.status}</span>`;

            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${exam.name}</td>
                <td class="px-6 py-4">${exam.type}<br><span class="text-xs text-gray-500">${exam.session}</span></td>
                <td class="px-6 py-4">${exam.startDate} to ${exam.endDate}</td>
                <td class="px-6 py-4 text-xs max-w-xs truncate">${exam.classes.join(', ')}</td>
                <td class="px-6 py-4">${badge}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="viewExam('${exam.id}')" class="text-primary-600 hover:underline mr-2">View</button>
                    <button onclick="scheduleExam('${exam.id}')" class="text-green-600 hover:underline mr-2">Schedule</button>
                    <button onclick="deleteExam('${exam.id}')" class="text-red-600 hover:underline">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- CREATE PAGE ---
    async function initCreatePage() {
        // Load Classes for Checkbox List
        const container = document.getElementById('exam-classes-container');
        try {
            const res = await fetch('../../data/classes-data.json');
            classesData = await res.json();
            container.innerHTML = '';
            classesData.forEach(c => {
                 const label = document.createElement('label');
                 label.className = 'inline-flex items-center p-2 bg-white border border-gray-200 rounded cursor-pointer hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600';
                 label.innerHTML = `
                    <input type="checkbox" value="${c.name}" name="classes" class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">${c.name}</span>
                 `;
                 container.appendChild(label);
            });
        } catch(e) {}

        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedClasses = Array.from(document.querySelectorAll('input[name="classes"]:checked')).map(cb => cb.value);
            
            if (selectedClasses.length === 0) {
                alert('Please select at least one class');
                return;
            }

            const newExam = {
                id: 'EXM' + Date.now(),
                name: document.getElementById('exam-name').value,
                type: document.getElementById('exam-type').value,
                session: document.getElementById('exam-session').value,
                startDate: document.getElementById('exam-start-date').value,
                endDate: document.getElementById('exam-end-date').value,
                classes: selectedClasses,
                description: document.getElementById('exam-description').value,
                status: 'Upcoming' // Logic could check dates
            };

            // Save
            const existing = localStorage.getItem('examsData') ? JSON.parse(localStorage.getItem('examsData')) : [];
            existing.push(newExam);
            localStorage.setItem('examsData', JSON.stringify(existing));

            // Redirect to Schedule
            localStorage.setItem('currentScheduleExamId', newExam.id);
            loadExamSchedulePage();
        });
    }

    // --- SCHEDULE PAGE ---
    function initSchedulePage() {
        const examId = localStorage.getItem('currentScheduleExamId');
        if (!examId) { loadExaminationsPage(); return; }

        // Fetch Exam
        const exams = JSON.parse(localStorage.getItem('examsData') || '[]');
        const exam = exams.find(e => e.id === examId);
        if (!exam) return;

        document.getElementById('schedule-exam-name-display').textContent = exam.name;
        
        // Render Sidebar
        scheduleClassList.innerHTML = '';
        exam.classes.forEach((clsName, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<button class="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${index === 0 ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : ''}" onclick="selectScheduleClass(this, '${clsName}')">${clsName}</button>`;
            scheduleClassList.appendChild(li);
        });

        // Initialize with first class
        if (exam.classes.length > 0) loadScheduleForClass(examId, exam.classes[0]);

        // Add Row Handler
        document.getElementById('btn-add-schedule-row').addEventListener('click', () => addScheduleRow());
        
        // Save Handler
        document.getElementById('btn-save-schedule').addEventListener('click', () => {
             saveSchedule(examId, window.currentScheduleClass);
        });
    }

    window.selectScheduleClass = function(btn, className) {
        // UI updates
        document.querySelectorAll('#schedule-class-list button').forEach(b => {
             b.classList.remove('bg-primary-50', 'text-primary-700', 'dark:bg-primary-900', 'dark:text-primary-300');
        });
        btn.classList.add('bg-primary-50', 'text-primary-700', 'dark:bg-primary-900', 'dark:text-primary-300');
        
        // Logic
        loadScheduleForClass(localStorage.getItem('currentScheduleExamId'), className);
    };

    function loadScheduleForClass(examId, className) {
        window.currentScheduleClass = className;
        document.getElementById('schedule-class-name-title').textContent = `Schedule for ${className}`;
        scheduleTableBody.innerHTML = '';

        // Fetch saved schedule
        const allSchedules = JSON.parse(localStorage.getItem('examSchedules') || '{}');
        const examSchedule = allSchedules[examId] || {};
        const classSchedule = examSchedule[className] || [];

        if (classSchedule.length === 0) {
            // Default empty row
            addScheduleRow();
        } else {
            classSchedule.forEach(sub => addScheduleRow(sub));
        }
    }

    function addScheduleRow(data = {}) {
        const tr = document.createElement('tr');
        tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
        tr.innerHTML = `
            <td class="px-4 py-2">
                <input type="text" value="${data.subject || ''}" class="sch-subject bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg block w-full p-2" placeholder="Subject">
            </td>
            <td class="px-4 py-2">
                <input type="date" value="${data.date || ''}" class="sch-date bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg block w-full p-2">
            </td>
            <td class="px-4 py-2">
                <input type="time" value="${data.time || ''}" class="sch-time bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg block w-full p-2">
            </td>
            <td class="px-4 py-2">
                <input type="text" value="${data.room || ''}" class="sch-room bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg block w-full p-2" placeholder="Room/Hall">
            </td>
            <td class="px-4 py-2 text-center">
                <button onclick="this.closest('tr').remove()" class="text-red-600 hover:underline text-xs">Remove</button>
            </td>
        `;
        scheduleTableBody.appendChild(tr);
    }

    function saveSchedule(examId, className) {
        const rows = document.querySelectorAll('#schedule-table-body tr');
        const schedule = [];
        rows.forEach(row => {
            schedule.push({
                subject: row.querySelector('.sch-subject').value,
                date: row.querySelector('.sch-date').value,
                time: row.querySelector('.sch-time').value,
                room: row.querySelector('.sch-room').value
            });
        });

        // Save to LocalStorage
        const allSchedules = JSON.parse(localStorage.getItem('examSchedules') || '{}');
        if (!allSchedules[examId]) allSchedules[examId] = {};
        allSchedules[examId][className] = schedule.filter(s => s.subject); // Filter empty
        
        localStorage.setItem('examSchedules', JSON.stringify(allSchedules));
        alert('Schedule saved for ' + className);
    }

    // --- VIEW PAGE ---
    function initViewPage() {
        const examId = localStorage.getItem('viewExamId');
        if (!examId) return;

        const exams = JSON.parse(localStorage.getItem('examsData') || '[]');
        const exam = exams.find(e => e.id === examId);
        if(!exam) return;

        document.getElementById('view-exam-name').textContent = exam.name;
        document.getElementById('view-exam-id').textContent = 'ID: ' + exam.id;
        document.getElementById('view-exam-type').textContent = exam.type;
        document.getElementById('view-exam-session').textContent = exam.session;
        document.getElementById('view-exam-classes').textContent = exam.classes.join(', ');
        document.getElementById('view-exam-start').textContent = exam.startDate;
        document.getElementById('view-exam-end').textContent = exam.endDate;
        // Simple badge injection...
        const statusEl = document.getElementById('view-exam-status-badge');
        statusEl.innerHTML = `<span class="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded">${exam.status}</span>`;
    }

    // --- ADMIT CARD PAGE ---
    async function initAdmitCardPage() {
        const examId = localStorage.getItem('viewExamId'); // Reusing context
        if (!examId) return;
        
        const exams = JSON.parse(localStorage.getItem('examsData') || '[]');
        const exam = exams.find(e => e.id === examId);
        if(!exam) return;

        document.getElementById('admit-card-exam-name').textContent = exam.name;

        // Populate Class Dropdown
        exam.classes.forEach(c => {
             const opt = document.createElement('option');
             opt.value = c;
             opt.textContent = c;
             admitCardClassSelect.appendChild(opt);
        });

        document.getElementById('btn-generate-admit-cards').addEventListener('click', async () => {
             const cls = admitCardClassSelect.value;
             if(!cls) return alert('Select a class');
             
             // Fetch Students of that class
             let students = [];
             try {
                const res = await fetch('../../data/students-data.json');
                const all = await res.json();
                students = all.filter(s => s.class === cls);
                // Mock limit
                if (students.length === 0) students = all.slice(0, 5); 
             } catch(e) {}

             renderAdmitCardPreviews(students);
             
             // Setup print
             const btnPrint = document.getElementById('btn-print-admit-cards');
             btnPrint.classList.remove('hidden');
             btnPrint.onclick = () => printAdmitCards(exam, students, cls);
        });
    }

    function renderAdmitCardPreviews(students) {
        admitCardGrid.innerHTML = '';
        students.forEach(s => {
            const div = document.createElement('div');
            div.className = 'bg-white border border-gray-200 rounded p-4 flex items-center shadow-sm dark:bg-gray-800 dark:border-gray-700';
            div.innerHTML = `
                <img src="${s.photo}" class="w-16 h-16 rounded-full border border-gray-300">
                <div class="ml-4">
                    <h4 class="font-bold text-gray-900 dark:text-white">${s.name}</h4>
                    <p class="text-sm text-gray-500">Roll: ${s.roll} | ID: ${s.id}</p>
                    <span class="text-xs bg-green-100 text-green-800 px-2 rounded">Eligible</span>
                </div>
            `;
            admitCardGrid.appendChild(div);
        });
    }

    function printAdmitCards(exam, students, cls) {
        // Fetch Schedule for that class
        const allSchedules = JSON.parse(localStorage.getItem('examSchedules') || '{}');
        const examSchedule = allSchedules[exam.id] || {};
        const classSchedule = examSchedule[cls] || [];

        // Simplified schedule object map
        const scheduleMap = {};
        scheduleMap[cls] = classSchedule;

        const iframe = document.getElementById('print-frame');
        iframe.src = 'academics/print-admit-card.html';
        iframe.onload = () => {
            iframe.contentWindow.postMessage({
               type: 'PRINT_DATA',
               exam: exam,
               students: students,
               schedule: scheduleMap,
               schoolName: 'SPRINGFIELD HIGH SCHOOL'
            }, '*');
        };
    }

    // --- GLOBAL ACTIONS ---
    window.scheduleExam = function(id) {
        localStorage.setItem('currentScheduleExamId', id);
        loadExamSchedulePage();
    };
    
    window.viewExam = function(id) {
        localStorage.setItem('viewExamId', id);
        loadViewExamPage(); // Updated name in Sidebar mapping
    };

    window.deleteExam = function(id) {
        if(confirm('Delete this exam?')) {
            const data = JSON.parse(localStorage.getItem('examsData') || '[]');
            const newData = data.filter(e => e.id !== id);
            localStorage.setItem('examsData', JSON.stringify(newData));
            initListPage();
        }
    };

})();
