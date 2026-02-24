// View Student Logic
(function() {
    console.log("View Student Script Loaded");

    // Global Tab Switcher (similar to robust Add Student logic)
    window.switchViewTab = function(tabId) {
        // 1. Hide all contents
        const allContents = document.querySelector('#viewStudentTabContent').children;
        Array.from(allContents).forEach(content => {
            content.classList.add('hidden');
            content.style.display = 'none';
        });

        // 2. Deactivate buttons
        const allButtons = document.querySelectorAll('#viewStudentTabs button');
        allButtons.forEach(btn => {
            btn.className = "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300";
        });

        // 3. Show target
        const target = document.getElementById(tabId);
        if (target) {
            target.classList.remove('hidden');
            target.style.display = 'block';
        }

        // 4. Activate button
        const btn = document.getElementById(tabId + '-tab');
        if (btn) {
            btn.className = "inline-block p-4 border-b-2 rounded-t-lg text-primary-600 border-primary-600 active dark:text-primary-500 dark:border-primary-500";
        }
    };

    // Load Data
    fetch('../../data/student-details.json')
        .then(response => response.json())
        .then(data => {
            populateHeader(data);
            populateProfile(data);
            populateAttendance(data.attendance);
            populateMarks(data.marks);
            populateFees(data.fees);
            populateDocuments(data.documents);
        })
        .catch(err => console.error('Error loading student details:', err));

    // --- Populators ---

    function populateHeader(data) {
        document.getElementById('view-student-name').textContent = data.name;
        document.getElementById('view-student-id').textContent = data.id;
        document.getElementById('view-student-photo').src = data.photo;
        document.getElementById('view-student-class').textContent = data.academic.class;
        document.getElementById('view-student-section').textContent = data.academic.section;
        document.getElementById('view-student-roll').textContent = data.academic.roll_no;
        document.getElementById('view-student-gender').textContent = data.personal.gender;
        
        const statusEl = document.getElementById('view-student-status');
        statusEl.textContent = data.status;
        if(data.status !== 'Active') {
            statusEl.className = "absolute bottom-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400";
        }
    }

    function populateProfile(data) {
        // Personal
        document.getElementById('view-dob').textContent = data.personal.dob;
        document.getElementById('view-blood').textContent = data.personal.blood_group;
        document.getElementById('view-religion').textContent = data.personal.religion;
        document.getElementById('view-phone').textContent = data.personal.phone;
        document.getElementById('view-email').textContent = data.personal.email;
        document.getElementById('view-address').textContent = `${data.personal.address}, ${data.personal.city}, ${data.personal.state}`;

        // Academic
        document.getElementById('view-academic-year').textContent = data.academic.academic_year;
        document.getElementById('view-admission-date').textContent = data.academic.admission_date;

        // Parent
        document.getElementById('view-father-name').textContent = data.parents.father.name;
        document.getElementById('view-father-phone').textContent = data.parents.father.phone;
        document.getElementById('view-mother-name').textContent = data.parents.mother.name;
        document.getElementById('view-emergency').textContent = data.parents.emergency_contact;
    }

    function populateAttendance(data) {
        document.getElementById('att-present').textContent = data.stats.present;
        document.getElementById('att-absent').textContent = data.stats.absent;
        document.getElementById('att-percent').textContent = data.stats.percentage + '%';
        
        // Simple Calendar Renderer (Mock for now, could be expanded to real date logic)
        const calendarEl = document.getElementById('attendance-calendar');
        calendarEl.innerHTML = '';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            calendarEl.innerHTML += `<div class="font-bold text-gray-400 py-1">${day}</div>`;
        });
        
        // Mocking Days 1-28 for Feb
        for(let i=1; i<=29; i++) {
            let statusClass = "bg-gray-100 text-gray-400"; // Default/Future
            
            // Check formatted date string match
            // Hardcoding matching for demo based on json '2024-02-0X'
            const dateStr = `2024-02-${i.toString().padStart(2, '0')}`;
            const record = data.calendar.find(r => r.date === dateStr);
            
            if (record) {
                if (record.status === 'Present') statusClass = "bg-green-100 text-green-700 font-bold border border-green-200";
                if (record.status === 'Absent') statusClass = "bg-red-100 text-red-700 font-bold border border-red-200";
                if (record.status === 'Late') statusClass = "bg-yellow-100 text-yellow-700 font-bold border border-yellow-200";
            } else if (i < 10) {
                 // assume rest are present for visually filling the grid in this mock
                 statusClass = "bg-gray-50 text-gray-300";
            }

            calendarEl.innerHTML += `<div class="p-2 rounded ${statusClass}">${i}</div>`;
        }
    }

    function populateMarks(data) {
        const select = document.getElementById('exam-select');
        select.innerHTML = '';
        data.forEach((exam, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = exam.exam_name;
            select.appendChild(opt);
        });

        // Render first exam by default
        renderMarksTable(data[0]);
        
        select.addEventListener('change', (e) => {
            renderMarksTable(data[e.target.value]);
        });
    }

    function renderMarksTable(exam) {
        const tbody = document.getElementById('marks-table-body');
        tbody.innerHTML = '';
        exam.subjects.forEach(sub => {
            const tr = document.createElement('tr');
            tr.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700";
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${sub.subject}</td>
                <td class="px-6 py-4 text-center">${sub.theory || '-'}</td>
                <td class="px-6 py-4 text-center">${sub.practical || '-'}</td>
                <td class="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">${sub.total}</td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">${sub.grade}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function populateFees(data) {
        // Progress
        const percent = Math.round((data.paid_amount / data.total_fees) * 100);
        document.getElementById('fee-progress').style.width = percent + '%';
        document.getElementById('fee-paid').textContent = 'Paid: ₦' + data.paid_amount.toLocaleString();
        document.getElementById('fee-pending').textContent = 'Pending: ₦' + data.pending_amount.toLocaleString();

        // Structure
        const structBody = document.getElementById('fee-structure-body');
        data.structure.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = "bg-white border-b";
            let statusColor = item.status === 'Paid' ? 'text-green-600' : 'text-red-500';
            tr.innerHTML = `
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${item.type}</td>
                <td class="px-4 py-3 text-right">₦${item.amount.toLocaleString()}</td>
                <td class="px-4 py-3 ${statusColor}">${item.status}</td>
            `;
            structBody.appendChild(tr);
        });

        // History
        const histBody = document.getElementById('fee-history-body');
        data.history.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = "bg-white border-b";
            tr.innerHTML = `
                <td class="px-4 py-3">${item.date}</td>
                <td class="px-4 py-3 font-medium">₦${item.amount.toLocaleString()}</td>
                 <td class="px-4 py-3">
                    <button class="text-primary-600 hover:underline">Download</button>
                 </td>
            `;
            histBody.appendChild(tr);
        });
    }

    function populateDocuments(data) {
        const grid = document.getElementById('documents-grid');
        grid.innerHTML = '';
        data.forEach(doc => {
            let iconClass = 'fa-file-alt text-gray-500';
            if(doc.icon === 'pdf') iconClass = 'fa-file-pdf text-red-500';
            if(doc.icon === 'image') iconClass = 'fa-file-image text-purple-500';

            const card = document.createElement('div');
            card.className = "bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-gray-600";
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div class="p-2 bg-gray-100 rounded-lg dark:bg-gray-600">
                        <i class="fas ${iconClass} text-xl"></i>
                    </div>
                    <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-600 dark:text-gray-300">${doc.type}</span>
                </div>
                <h5 class="mb-2 text-md font-bold tracking-tight text-gray-900 dark:text-white truncate" title="${doc.name}">${doc.name}</h5>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 text-xs">Size: ${doc.size} • ${doc.upload_date}</p>
                <button class="inline-flex items-center text-primary-600 hover:underline font-medium text-sm">
                    Download <i class="fas fa-arrow-down ml-1"></i>
                </button>
            `;
            grid.appendChild(card);
        });
    }

    // Initialize Default Tab
    window.switchViewTab('profile');

})();
