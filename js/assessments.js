// Assessments Module Logic
(function() {
    console.log('Assessments Script Loaded');

    // DOM Elements (List Page)
    const tableBody = document.getElementById('assessments-table-body');
    const searchInput = document.getElementById('assessment-search');
    const filterType = document.getElementById('filter-type');
    const filterClass = document.getElementById('filter-class');
    const filterStatus = document.getElementById('filter-status');
    const btnApplyFilters = document.getElementById('btn-apply-assessment-filters');

    // DOM Elements (Create Page)
    const createForm = document.getElementById('create-assessment-form');

    // Data State
    let assessmentsData = [];

    // --- INITIALIZATION CHAIN ---
    
    // Determine which page we are on
    if (tableBody) {
        initListPage();
    } else if (createForm) {
        initCreatePage();
    } else if (document.getElementById('view-assessment-title')) {
        initViewPage();
    }

    // --- LIST PAGE LOGIC ---
    async function initListPage() {
        await loadData();
        await loadClassesForFilter(); 
        renderTable(assessmentsData);

        // Event Listeners
        btnApplyFilters.addEventListener('click', applyFilters);
        // Live search optional
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') applyFilters();
        });
    }

    async function loadData() {
        try {
            // In a real app, this would be an API call.
            // Check localStorage first for any new creations
            const stored = localStorage.getItem('assessmentsData');
            if (stored) {
                assessmentsData = JSON.parse(stored);
            } else {
                const res = await fetch('../../data/assessments-data.json');
                assessmentsData = await res.json();
                localStorage.setItem('assessmentsData', JSON.stringify(assessmentsData));
            }
        } catch (e) {
            console.error('Error loading assessments:', e);
            tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500">Error loading data.</td></tr>';
        }
    }
    
    async function loadClassesForFilter() {
        if (!filterClass) return;
        try {
             // Reuse classes data if available or fetch
             const res = await fetch('../../data/classes-data.json');
             const classes = await res.json();
             classes.forEach(c => {
                 const opt = document.createElement('option');
                 opt.value = c.name;
                 opt.textContent = c.name;
                 filterClass.appendChild(opt);
             });
        } catch(e) {}
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">No assessments found.</td></tr>';
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            
            // Status Color
            let statusBadge = '';
            if (item.status === 'Completed') statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Completed</span>';
            else if (item.status === 'Ongoing') statusBadge = '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Ongoing</span>';
            else statusBadge = '<span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">Upcoming</span>';

            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${item.id}</td>
                <td class="px-6 py-4">
                    <div class="font-semibold">${item.title}</div>
                    <span class="text-xs text-gray-500 border border-gray-200 px-1 rounded">${item.type}</span>
                </td>
                <td class="px-6 py-4">
                    <div>${item.class} ${item.section ? '('+item.section.join(',')+')' : ''}</div>
                    <div class="text-xs text-primary-600 dark:text-primary-400">${item.subject}</div>
                </td>
                <td class="px-6 py-4">
                    <div>${item.date}</div>
                    <div class="text-xs text-gray-500">${item.duration || ''}</div>
                </td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4">
                     <button type="button" onclick="viewAssessment('${item.id}')" class="text-blue-600 dark:text-blue-500 hover:underline font-medium text-sm mr-2">View</button>
                     <button type="button" onclick="deleteAssessment('${item.id}')" class="text-red-600 dark:text-red-500 hover:underline font-medium text-sm">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function applyFilters() {
        const term = searchInput.value.toLowerCase();
        const type = filterType.value;
        const cls = filterClass.value;
        const status = filterStatus.value;

        const filtered = assessmentsData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(term) || item.id.toLowerCase().includes(term);
            const matchesType = type ? item.type === type : true;
            const matchesClass = cls ? item.class === cls : true;
            const matchesStatus = status ? item.status === status : true;
            return matchesSearch && matchesType && matchesClass && matchesStatus;
        });

        renderTable(filtered);
    }

    // Expose global actions
    window.viewAssessment = function(id) {
        localStorage.setItem('viewAssessmentId', id);
        loadViewAssessmentPage();
    };

    window.deleteAssessment = function(id) {
        if(confirm('Are you sure you want to delete this assessment?')) {
            assessmentsData = assessmentsData.filter(i => i.id !== id);
            localStorage.setItem('assessmentsData', JSON.stringify(assessmentsData));
            renderTable(assessmentsData);
        }
    };

    // --- CREATE PAGE LOGIC ---
    async function initCreatePage() {
        const classSelect = document.getElementById('assessment-class');
        const sectionContainer = document.getElementById('assessment-sections-container');
        let classes = [];

        // Load Classes for dropdown
        try {
            const res = await fetch('../../data/classes-data.json');
            classes = await res.json();
            classes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = c.name;
                classSelect.appendChild(opt);
            });
        } catch(e) {}

        // Handle Section population
        classSelect.addEventListener('change', () => {
             const selectedClass = classes.find(c => c.name === classSelect.value);
             sectionContainer.innerHTML = '';
             if (selectedClass && selectedClass.sections) {
                 selectedClass.sections.forEach(sec => {
                     // Checkbox for multiple sections
                     const label = document.createElement('label');
                     label.className = 'inline-flex items-center p-2 bg-white border border-gray-200 rounded cursor-pointer hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600';
                     label.innerHTML = `
                        <input type="checkbox" value="${sec.name}" name="sections" class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sec ${sec.name}</span>
                     `;
                     sectionContainer.appendChild(label);
                 });
             } else {
                 sectionContainer.innerHTML = '<span class="text-sm text-gray-500">No sections found</span>';
             }
        });

        // Handle Save
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Gather Data
            const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(cb => cb.value);
            if (sections.length === 0) {
                alert('Please select at least one section');
                return;
            }

            const newAssessment = {
                id: 'ASM' + (Date.now().toString().slice(-4)),
                title: document.getElementById('assessment-title').value,
                type: document.getElementById('assessment-type').value,
                subject: document.getElementById('assessment-subject').value,
                class: document.getElementById('assessment-class').value,
                section: sections,
                date: document.getElementById('assessment-date').value,
                duration: document.getElementById('assessment-duration').value,
                totalMarks: document.getElementById('assessment-total-marks').value,
                passMarks: document.getElementById('assessment-pass-marks').value,
                description: document.getElementById('assessment-description').value,
                instructions: document.getElementById('assessment-instructions').value,
                status: 'Upcoming' // Default
            };

            // Save
            const existing = localStorage.getItem('assessmentsData');
            const data = existing ? JSON.parse(existing) : [];
            data.push(newAssessment);
            localStorage.setItem('assessmentsData', JSON.stringify(data));

            alert('Assessment created successfully!');
            loadAssessmentsPage();
        });
    }

    // --- VIEW PAGE LOGIC ---
    function initViewPage() {
        const id = localStorage.getItem('viewAssessmentId');
        if (!id) {
            loadAssessmentsPage();
            return;
        }

        // Load Data
        const stored = localStorage.getItem('assessmentsData');
        const data = stored ? JSON.parse(stored) : []; // Should strictly fetch if not found
        // Also try fetch fallback if mock data not in local storage yet (edge case)
        
        let assessment = data.find(i => i.id === id);
        
        // Fallback for demo if id not found in local (e.g. from fresh mock load)
        if (!assessment) {
             // Try fetching mock file again just in case initListPage wasn't run
             fetch('../../data/assessments-data.json').then(r=>r.json()).then(d => {
                 assessment = d.find(i => i.id === id);
                 if(assessment) populateView(assessment);
             });
        } else {
            populateView(assessment);
        }
    }

    function populateView(item) {
        document.getElementById('view-assessment-name').textContent = item.title;
        document.getElementById('view-assessment-type').textContent = item.type;
        document.getElementById('view-assessment-status').textContent = item.status;
        document.getElementById('view-assessment-id').textContent = item.id;
        document.getElementById('view-assessment-desc').textContent = item.description;
        document.getElementById('view-assessment-subject').textContent = item.subject;
        document.getElementById('view-assessment-class').textContent = `${item.class} - ${item.section.join(', ')}`;
        document.getElementById('view-assessment-date').textContent = item.date;
        document.getElementById('view-assessment-duration').textContent = item.duration;
        document.getElementById('view-assessment-marks').textContent = item.totalMarks;
        document.getElementById('view-assessment-pass').textContent = item.passMarks;
        document.getElementById('view-assessment-instr').textContent = item.instructions || 'No special instructions.';

        // Populate Mock Students
        const studentsList = document.getElementById('view-assessment-students-list');
        // Just mock some students
        studentsList.innerHTML = `
            <li class="py-3 flex items-center justify-between">
                <div class="flex items-center">
                    <img class="w-8 h-8 rounded-full" src="https://i.pravatar.cc/150?u=12" alt="Student">
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                        <p class="text-xs text-gray-500">Roll: 001</p>
                    </div>
                </div>
                <span class="text-xs text-gray-400">Not Graded</span>
            </li>
            <li class="py-3 flex items-center justify-between">
                <div class="flex items-center">
                    <img class="w-8 h-8 rounded-full" src="https://i.pravatar.cc/150?u=15" alt="Student">
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Jane Smith</p>
                        <p class="text-xs text-gray-500">Roll: 002</p>
                    </div>
                </div>
                <span class="text-xs text-gray-400">Not Graded</span>
            </li>
        `;
    }

})();
