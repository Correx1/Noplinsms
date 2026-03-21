// Subjects Module Logic
(function() {
    console.log('Subjects script loaded');

    // DOM Elements
    const subjectsGrid = document.getElementById('subjects-grid');
    const addSubjectForm = document.getElementById('add-subject-form');

    // Context Detection
    if (subjectsGrid) initSubjectsList();
    if (addSubjectForm) initAddSubjectForm();

    // Data Store
    let subjectsData = [];

    // === 1. LIST PAGE LOGIC ===
    async function initSubjectsList() {
        try {
            window.editingSubjectId = null; // Clear any active edit session
            subjectsData = await fetchSubjectsData();
            renderSubjectsGrid(subjectsData);
            setupSearchAndFilter();
        } catch (e) {
            console.error('Error init subjects list:', e);
            if(subjectsGrid) subjectsGrid.innerHTML = '<p class="text-red-500 col-span-full">Error loading subjects.</p>';
        }
    }

    function renderSubjectsGrid(data) {
        if (!subjectsGrid) return;
        subjectsGrid.innerHTML = '';
        
        if (data.length === 0) {
            subjectsGrid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No subjects found.</div>';
            return;
        }

        data.forEach(sub => {
            const classLabels = sub.classes.slice(0, 3).map(c => 
                `<span class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">${c}</span>`
            ).join('');
            
            const extraCount = sub.classes.length > 3 ? `<span class="text-xs text-gray-500">+${sub.classes.length - 3} more</span>` : '';

            const card = document.createElement('div');
            card.className = 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col justify-between';
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${sub.name}</h3>
                        <span class="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800">
                            ${sub.type}
                        </span>
                    </div>
                    
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Assigned Classes</p>
                        <div class="flex flex-wrap gap-y-2 items-center">
                            ${classLabels} ${extraCount}
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                     <button onclick="editSubject('${sub.id}')" class="flex-1 text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors dark:text-primary-400 dark:bg-gray-700 dark:hover:bg-gray-600">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button onclick="deleteSubject('${sub.id}')" class="flex-1 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50">
                        <i class="fas fa-trash-alt mr-1"></i> Delete
                    </button>
                </div>
            `;
            subjectsGrid.appendChild(card);
        });
    }

    function setupSearchAndFilter() {
        const searchInput = document.getElementById('search-subject');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = subjectsData.filter(s => 
                    s.name.toLowerCase().includes(term)
                );
                renderSubjectsGrid(filtered);
            });
        }
    }


    // === 2. ADD SUBJECT FORM LOGIC ===
    async function initAddSubjectForm() {
        // Load teachers for the multi-select
        let teachersData = [];
        try {
            const res = await fetch('../../data/teachers-data.json');
            teachersData = await res.json();
        } catch(e) { console.error('Could not load teachers:', e); }

        // Build multi-select in the container
        const container = document.getElementById('subjectTeachersContainer');
        if (container) buildSubjectTeacherMultiSelect(container, teachersData);

        if (window.editingSubjectId) {
            const h1 = document.querySelector('h1');
            if(h1) h1.textContent = 'Edit Subject';
            const btn = document.querySelector('#add-subject-form button[type="submit"]');
            if(btn) btn.textContent = 'Update Subject';
            
            const data = await fetchSubjectsData();
            const subject = data.find(s => s.id === window.editingSubjectId);
            if (subject) {
                document.getElementById('subjectName').value = subject.name;
                document.getElementById('subjectType').value = subject.type;
                const deptSelect = document.getElementById('subjectDepartment');
                if (deptSelect && subject.department) deptSelect.value = subject.department;

                const checkboxes = document.querySelectorAll('#assignedClassesGroup input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    if (subject.classes.includes(cb.value)) cb.checked = true;
                });

                // Pre-select saved teachers
                if (subject.teacherIds && container) {
                    subject.teacherIds.forEach(tid => {
                        const cb = container.querySelector(`input[value="${tid}"]`);
                        if (cb) {
                            cb.checked = true;
                            const btn = container.querySelector('.multi-select-btn');
                            updateSubjectTeacherLabel(container, btn);
                        }
                    });
                }
            }
        }

        addSubjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('subjectName').value;
            const teacherIds = getSubjectTeacherIds(container);
            
            if(name) {
                alert(window.editingSubjectId ? 'Subject updated successfully! (Mock)' : 'Subject added successfully! (Mock)');
                if(window.loadSubjectsPage) {
                    window.loadSubjectsPage();
                }
            }
        });
    }

    function buildSubjectTeacherMultiSelect(container, teachers) {
        container.innerHTML = '';
        container.setAttribute('data-multi-ids', '[]');

        const wrapper = document.createElement('div');
        wrapper.className = 'relative';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'multi-select-btn w-full text-left bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white flex justify-between items-center';
        btn.innerHTML = '<span class="multi-select-label text-gray-400">Select teachers...</span><i class="fas fa-chevron-down text-xs"></i>';

        const panel = document.createElement('div');
        panel.className = 'multi-select-panel hidden absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-700 dark:border-gray-600 max-h-52 overflow-y-auto';

        teachers.forEach(t => {
            const item = document.createElement('label');
            item.className = 'flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer';
            item.innerHTML = `
                <input type="checkbox" value="${t.id}" class="subject-teacher-check w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500">
                <span class="text-sm text-gray-900 dark:text-white">${t.name}</span>
            `;
            const cb = item.querySelector('input');
            cb.addEventListener('change', () => updateSubjectTeacherLabel(container, btn));
            panel.appendChild(item);
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.multi-select-panel').forEach(p => { if (p !== panel) p.classList.add('hidden'); });
            panel.classList.toggle('hidden');
        });
        document.addEventListener('click', () => panel.classList.add('hidden'));

        wrapper.appendChild(btn);
        wrapper.appendChild(panel);
        container.appendChild(wrapper);
    }

    function updateSubjectTeacherLabel(container, btn) {
        const checked = container.querySelectorAll('.subject-teacher-check:checked');
        const ids = Array.from(checked).map(cb => cb.value);
        container.setAttribute('data-multi-ids', JSON.stringify(ids));
        const label = btn.querySelector('.multi-select-label');
        if (ids.length === 0) {
            label.textContent = 'Select teachers...';
            label.className = 'multi-select-label text-gray-400';
        } else {
            label.textContent = Array.from(checked).map(cb => cb.closest('label').querySelector('span').textContent).join(', ');
            label.className = 'multi-select-label text-gray-900 dark:text-white';
        }
    }

    function getSubjectTeacherIds(container) {
        if (!container) return [];
        try { return JSON.parse(container.getAttribute('data-multi-ids') || '[]'); }
        catch { return []; }
    }

    // Shared: Fetch Data
    async function fetchSubjectsData() {
        try {
            const res = await fetch('../../data/subjects-data.json');
            return await res.json();
        } catch (e) {
            console.error('Fetch subjects error:', e);
            return [];
        }
    }

    // Global Action Handlers (Mock)
    window.editSubject = function(id) {
        window.editingSubjectId = id;
        if (window.loadAddSubjectPage) {
            window.loadAddSubjectPage();
        }
    };

    window.deleteSubject = function(id) {
        if(confirm('Are you sure you want to delete this subject?')) {
            alert('Subject deleted (Mock). ID: ' + id);
        }
    };

})();
