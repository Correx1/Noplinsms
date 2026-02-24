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
                    <span class="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800">
                        Level ${cls.level}
                    </span>
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
                    <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Section Teacher</label>
                    <select class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white teacher-select">
                        <option value="">Select Teacher</option>
                    </select>
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
        }
        
        // Populate new dropdowns
        const newSelects = container.querySelectorAll('.teacher-select');
        newSelects.forEach(sel => {
             teachersData.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                sel.appendChild(opt);
            });
        });
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
                 const sTeacher = tData.find(t => t.id === s.teacherId);
                 return `
                    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-lg font-bold text-gray-900 dark:text-white">Section ${s.name}</span>
                            <span class="text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-1">${s.room}</span>
                        </div>
                        <div class="text-sm text-gray-500 mb-1">Students: <span class="font-semibold text-gray-900 dark:text-white">${s.studentCount}/${s.capacity}</span></div>
                        <div class="text-sm text-gray-500">Teacher: <span class="font-medium text-primary-600">${sTeacher ? sTeacher.name : 'None'}</span></div>
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
            
            // Populate Dropdown Options
            const select = clonedForm.querySelector('#newSectionTeacher');
            if(select && select.options.length <= 1) {
                tData.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.id;
                    opt.textContent = t.name;
                    select.appendChild(opt);
                });
            }

            clonedForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameSelect = document.getElementById('newSectionName').value;
                const teacherSelect = document.getElementById('newSectionTeacher').value;
                const capacitySelect = document.getElementById('newSectionCapacity').value;
                const roomSelect = document.getElementById('newSectionRoom').value;
                
                cls.sections.push({
                    name: nameSelect,
                    capacity: parseInt(capacitySelect),
                    room: roomSelect,
                    teacherId: teacherSelect,
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
