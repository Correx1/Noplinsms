// Classes Module Logic
(function() {
    console.log('Classes script loaded');

    // DOM Elements
    const classesGrid = document.getElementById('classes-grid');
    const addClassForm = document.getElementById('add-class-form');
    const viewClassTitle = document.getElementById('view-class-title');
    const generateSectionsBtn = document.getElementById('generate-sections-btn');

    // Context Detection
    if (classesGrid) initClassesList();
    if (addClassForm) initAddClassForm();
    if (viewClassTitle) initViewClass();

    // Data Store (Simple Cache)
    let classesData = [];
    let teachersData = [];

    // === 1. LIST PAGE LOGIC ===
    async function initClassesList() {
        try {
            const [cData, tData] = await fetchData();
            classesData = cData || [];
            teachersData = tData || [];
            renderClassesGrid();
        } catch (e) {
            console.error('Error init classes list:', e);
            classesGrid.innerHTML = '<p class="text-red-500">Error loading classes.</p>';
        }
    }

    function renderClassesGrid() {
        classesGrid.innerHTML = '';
        if (classesData.length === 0) {
            classesGrid.innerHTML = '<p class="text-gray-500 col-span-3 text-center">No classes found.</p>';
            return;
        }

        classesData.forEach(cls => {
            const teacher = teachersData.find(t => t.id === cls.classTeacherId) || { name: 'Unassigned', photo: '../../assets/images/default-avatar.png' };
            const sectionNames = cls.sections.map(s => s.name).join(', ');

            const card = document.createElement('div');
            card.className = 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow';
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">${cls.name}</h3>
                    <div class="flex items-center gap-2">
                         ${cls.department && cls.department !== 'General' ? `<span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">${cls.department}</span>` : ''}
                         <span class="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800">
                             Level ${cls.level}
                         </span>
                    </div>
                </div>
                <div class="mb-4 space-y-2">
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <i class="fas fa-layer-group w-5"></i>
                        <span class="font-medium text-gray-900 dark:text-white mr-1">${cls.sections.length} Sections:</span>
                        <span>${sectionNames}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <i class="fas fa-users w-5"></i>
                        <span class="font-medium text-gray-900 dark:text-white mr-1">Students:</span>
                        <span>${cls.totalStudents}</span>
                    </div>
                     <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <img src="${teacher.photo}" class="w-6 h-6 rounded-full mr-2" alt="Teacher">
                        <span>${teacher.name}</span>
                    </div>
                </div>
                <button onclick="window.loadViewClassPage('${cls.id}')" class="w-full text-primary-700 hover:text-white border border-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-primary-500 dark:text-primary-500 dark:hover:text-white dark:hover:bg-primary-500 dark:focus:ring-primary-800">
                    View Details
                </button>
            `;
            classesGrid.appendChild(card);
        });
    }

    // === 2. ADD CLASS FORM LOGIC ===
    async function initAddClassForm() {
        const [cData, tData] = await fetchData();
        teachersData = tData || [];
        populateTeacherDropdown('class-teacher');

        if (generateSectionsBtn) {
            generateSectionsBtn.addEventListener('click', generateSectionFields);
            generateSectionFields(); // Initial run
        }

        addClassForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Mock Save Logic
            alert('Class saved successfully! (Mock)');
            loadClassesPage(); // Go back
        });

    }

    function populateTeacherDropdown(elementId) {
        const select = document.getElementById(elementId);
        if (!select) return;
        select.innerHTML = '<option value="">Select Teacher</option>';
        teachersData.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            select.appendChild(opt);
        });
    }

    // Build a custom checkbox-based multi-select dropdown
    function buildMultiSelect(container, teachers, uniqueId) {
        container.innerHTML = '';
        container.setAttribute('data-multi-ids', '[]');

        const wrapper = document.createElement('div');
        wrapper.className = 'relative';

        // Trigger button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'multi-select-btn w-full text-left bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white flex justify-between items-center';
        btn.innerHTML = '<span class="multi-select-label text-gray-400">Select teachers...</span><i class="fas fa-chevron-down text-xs"></i>';

        // Dropdown panel
        const panel = document.createElement('div');
        panel.className = 'multi-select-panel hidden absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-700 dark:border-gray-600 max-h-48 overflow-y-auto';

        teachers.forEach(t => {
            const item = document.createElement('label');
            item.className = 'flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer';
            item.innerHTML = `
                <input type="checkbox" value="${t.id}" class="multi-check w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500">
                <span class="text-sm text-gray-900 dark:text-white">${t.name}</span>
            `;
            const cb = item.querySelector('input');
            cb.addEventListener('change', () => updateMultiSelectLabel(container, btn));
            panel.appendChild(item);
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other open panels
            document.querySelectorAll('.multi-select-panel').forEach(p => {
                if (p !== panel) p.classList.add('hidden');
            });
            panel.classList.toggle('hidden');
        });

        document.addEventListener('click', () => panel.classList.add('hidden'), { capture: false });

        wrapper.appendChild(btn);
        wrapper.appendChild(panel);
        container.appendChild(wrapper);
    }

    function updateMultiSelectLabel(container, btn) {
        const checked = container.querySelectorAll('.multi-check:checked');
        const ids = Array.from(checked).map(cb => cb.value);
        container.setAttribute('data-multi-ids', JSON.stringify(ids));

        const label = btn.querySelector('.multi-select-label');
        if (ids.length === 0) {
            label.textContent = 'Select teachers...';
            label.classList.add('text-gray-400');
            label.classList.remove('text-gray-900', 'dark:text-white');
        } else {
            const names = Array.from(checked).map(cb => cb.closest('label').querySelector('span').textContent);
            label.textContent = names.join(', ');
            label.classList.remove('text-gray-400');
            label.classList.add('text-gray-900', 'dark:text-white');
        }
    }

    function getMultiSelectIds(container) {
        try { return JSON.parse(container.getAttribute('data-multi-ids') || '[]'); }
        catch { return []; }
    }

    function generateSectionFields() {
        const count = document.getElementById('section-count').value;
        const container = document.getElementById('sections-container');
        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const letter = String.fromCharCode(65 + i); // A, B, C...
            const row = document.createElement('div');
            row.className = 'grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600';
            row.innerHTML = `
                <div class="col-span-12 md:col-span-2">
                    <label class="block mb-1 text-xs font-medium text-gray-500 uppercase">Section</label>
                    <input type="text" value="${letter}" class="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" readonly>
                </div>
                <div class="col-span-12 md:col-span-5">
                    <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Section Teachers</label>
                    <div class="teacher-multi-select"></div>
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Max Capacity</label>
                    <input type="number" value="30" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                </div>
                <div class="col-span-12 md:col-span-2">
                    <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Room</label>
                    <input type="text" placeholder="Map..." class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                </div>
            `;
            container.appendChild(row);

            // Build multi-select for this row
            const msContainer = row.querySelector('.teacher-multi-select');
            buildMultiSelect(msContainer, teachersData, `section-teachers-${i}`);
        }
    }

    // === 3. VIEW CLASS LOGIC ===
    async function initViewClass() {
        if (!window.viewingClassId) return;

        const [cData, tData] = await fetchData();
        const cls = cData.find(c => c.id === window.viewingClassId);
        
        if (!cls) {
            alert('Class not found!');
            loadClassesPage();
            return;
        }

        // Populate Info
        document.getElementById('view-class-name').textContent = cls.name;
        document.getElementById('view-student-count').textContent = cls.totalStudents;
        
        const teacher = tData.find(t => t.id === cls.classTeacherId);
        document.getElementById('view-class-teacher').innerHTML = teacher ? 
            `<img src="${teacher.photo}" class="w-8 h-8 rounded-full mr-2"> ${teacher.name}` : 'Unassigned';

        function renderOverview() {
            document.getElementById('view-sections-list').textContent = cls.sections.map(s => s.name).join(', ');
            const overviewGrid = document.getElementById('overview-sections-grid');
            overviewGrid.innerHTML = cls.sections.map(s => {
                // Support both old `teacherId` string and new `teacherIds` array
                const teacherIds = s.teacherIds || (s.teacherId ? [s.teacherId] : []);
                const teachers = teacherIds.map(tid => tData.find(t => t.id === tid)).filter(Boolean);
                const teacherDisplay = teachers.length > 0
                    ? teachers.map(t => `<span class="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">${t.name}</span>`).join(' ')
                    : '<span class="text-gray-400">None</span>';

                return `
                    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-lg font-bold text-gray-900 dark:text-white">Section ${s.name}</span>
                            <span class="text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-1">${s.room}</span>
                        </div>
                        <div class="text-sm text-gray-500 mb-1">Students: <span class="font-semibold text-gray-900 dark:text-white">${s.studentCount}/${s.capacity}</span></div>
                        <div class="text-sm text-gray-500 mb-1">Teachers:</div>
                        <div class="flex flex-wrap gap-1">${teacherDisplay}</div>
                    </div>
                `;
            }).join('');
        }

        renderOverview();

        // Populate Students Table (Mock for now)
        const studentsBody = document.getElementById('class-students-body');
        // In real app, we'd filter studentsData by classId
        studentsBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Student list simulation (requires students data linking)</td></tr>`;
        
        // Populate Subjects
        const subjectList = document.getElementById('class-subjects-list');
        if(cls.subjects) {
            subjectList.innerHTML = cls.subjects.map(sub => `<li>${sub}</li>`).join('');
        }

        // Form Logic
        const formAddSection = document.getElementById('form-add-section');
        if(formAddSection) {
            // Clone to avoid duplicate event listeners
            const clonedForm = formAddSection.cloneNode(true);
            formAddSection.parentNode.replaceChild(clonedForm, formAddSection);
            
            // Build multi-select for section teachers
            const teacherContainer = clonedForm.querySelector('#newSectionTeacherContainer');
            if(teacherContainer) {
                buildMultiSelect(teacherContainer, tData, 'modal-section-teachers');
            }

            clonedForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameVal = document.getElementById('newSectionName').value;
                const teacherContainer = clonedForm.querySelector('#newSectionTeacherContainer');
                const selectedTeacherIds = getMultiSelectIds(teacherContainer);
                const capacityVal = document.getElementById('newSectionCapacity').value;
                const roomVal = document.getElementById('newSectionRoom').value;
                
                cls.sections.push({
                    name: nameVal,
                    capacity: parseInt(capacityVal),
                    room: roomVal,
                    teacherIds: selectedTeacherIds,
                    studentCount: 0
                });
                
                alert('Success: New Section added to Class ' + cls.name);
                window.closeAddSectionModal();
                
                // Immediately refresh view elements with the local updated cls object
                renderOverview();
            });
        }
    }

    // Modal Helpers
    window.openAddSectionModal = function() {
        const modal = document.getElementById('add-section-modal');
        if(modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    };

    window.closeAddSectionModal = function() {
        const modal = document.getElementById('add-section-modal');
        if(modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            const form = document.getElementById('form-add-section');
            if(form) form.reset();
        }
    };

    // Shared: Fetch Data
    async function fetchData() {
        try {
            const [cRes, tRes] = await Promise.all([
                fetch('../../data/classes-data.json'),
                fetch('../../data/teachers-data.json')
            ]);
            return await Promise.all([cRes.json(), tRes.json()]);
        } catch (e) {
            console.error('Fetch error:', e);
            return [[], []];
        }
    }

    // Global Tab Switcher
    window.switchClassTab = function(tabName) {
        // Hide all content
        ['overview', 'students', 'subjects', 'timetable'].forEach(t => {
            document.getElementById(`content-${t}`).classList.add('hidden');
            document.getElementById(`tab-${t}`).classList.remove('text-primary-600', 'border-primary-600', 'dark:text-primary-500', 'dark:border-primary-500');
            document.getElementById(`tab-${t}`).classList.add('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300');
        });

        // Show selected
        document.getElementById(`content-${tabName}`).classList.remove('hidden');
        const activeTab = document.getElementById(`tab-${tabName}`);
        activeTab.classList.remove('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300');
        activeTab.classList.add('text-primary-600', 'border-primary-600', 'dark:text-primary-500', 'dark:border-primary-500');
    };

})();
