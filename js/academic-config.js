// Academic Configuration Module Logic
(function() {
    
    let configData = {
        academicYears: [],
        terms: [],
        classGroups: [],
        subjectGroups: []
    };

    init();

    async function init() {
        configData = await fetchConfigData();

        renderAcademicYears();
        renderTerms();
        renderClassGroups();
        renderSubjectGroups();

        setupTabs();
        
        bindForm('form-add-academic-year', saveAcademicYear);
        bindForm('form-add-term', saveTerm);
        bindForm('form-add-class-group', saveClassGroup);
        bindForm('form-add-subject-group', saveSubjectGroup);
    }

    // --- TABS LOGIC ---
    function setupTabs() {
        const tabs = [
            { btn: 'academic-years-tab', pane: 'academic-years' },
            { btn: 'terms-tab', pane: 'terms' },
            { btn: 'class-groups-tab', pane: 'class-groups' },
            { btn: 'subject-groups-tab', pane: 'subject-groups' }
        ];

        tabs.forEach(tab => {
            const btn = document.getElementById(tab.btn);
            if(btn) {
                btn.addEventListener('click', () => {
                    // Reset all
                    tabs.forEach(t => {
                        const b = document.getElementById(t.btn);
                        const p = document.getElementById(t.pane);
                        if(b) {
                            b.classList.remove('text-primary-600', 'dark:text-primary-500', 'bg-gray-100', 'dark:bg-gray-700');
                        }
                        if(p) {
                            p.classList.add('hidden');
                        }
                    });
                    
                    // Activate clicked
                    btn.classList.add('text-primary-600', 'dark:text-primary-500', 'bg-gray-100', 'dark:bg-gray-700');
                    document.getElementById(tab.pane).classList.remove('hidden');
                });
            }
        });
    }

    // --- RENDERERS ---

    function renderAcademicYears() {
        const tbody = document.getElementById('tbody-academic-years');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (configData.academicYears.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center dark:text-gray-300">No academic years found.</td></tr>';
            return;
        }

        configData.academicYears.forEach(ay => {
            const statusColor = getStatusColor(ay.status);
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${ay.name}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${ay.startDate}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${ay.endDate}</td>
                <td class="px-6 py-4"><span class="bg-${statusColor}-100 text-${statusColor}-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-${statusColor}-900 dark:text-${statusColor}-300">${ay.status}</span></td>
                <td class="px-6 py-4 text-right">
                    <button onclick="editAcadConfig('academicYears', '${ay.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline mr-3"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteAcadConfig('academicYears', '${ay.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderTerms() {
        const tbody = document.getElementById('tbody-terms');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (configData.terms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center dark:text-gray-300">No terms found.</td></tr>';
            return;
        }

        configData.terms.forEach(term => {
            const statusColor = getStatusColor(term.status);
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${term.name}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${term.academicYear}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${term.startDate}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${term.endDate}</td>
                <td class="px-6 py-4"><span class="bg-${statusColor}-100 text-${statusColor}-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-${statusColor}-900 dark:text-${statusColor}-300">${term.status}</span></td>
                <td class="px-6 py-4 text-right">
                    <button onclick="editAcadConfig('terms', '${term.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline mr-3"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteAcadConfig('terms', '${term.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderClassGroups() {
        const tbody = document.getElementById('tbody-class-groups');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (configData.classGroups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center dark:text-gray-300">No class groups found.</td></tr>';
            return;
        }

        configData.classGroups.forEach(cg => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${cg.name}</td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">${cg.description}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${cg.classesCount || 0} Classes</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="editAcadConfig('classGroups', '${cg.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline mr-3"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteAcadConfig('classGroups', '${cg.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderSubjectGroups() {
        const tbody = document.getElementById('tbody-subject-groups');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (configData.subjectGroups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center dark:text-gray-300">No subject groups found.</td></tr>';
            return;
        }

        configData.subjectGroups.forEach(sg => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${sg.name}</td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">${sg.description}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${sg.subjectsCount || 0} Subjects</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="editAcadConfig('subjectGroups', '${sg.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline mr-3"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteAcadConfig('subjectGroups', '${sg.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- FORM SUBMIT HANDLERS ---
    
    function saveAcademicYear() {
        const id = document.getElementById('ayId').value;
        const payload = {
            id: id || 'AY' + Date.now().toString().slice(-4),
            name: document.getElementById('ayName').value,
            startDate: document.getElementById('ayStart').value,
            endDate: document.getElementById('ayEnd').value,
            status: document.getElementById('ayStatus').value
        };
        
        saveOrUpdateArrayItem('academicYears', id, payload);
        renderAcademicYears();
        window.closeModal('add-academic-year-modal');
    }

    function saveTerm() {
        const id = document.getElementById('termId').value;
        const payload = {
            id: id || 'TM' + Date.now().toString().slice(-4),
            name: document.getElementById('termName').value,
            academicYear: document.getElementById('termAY').value,
            startDate: document.getElementById('termStart').value,
            endDate: document.getElementById('termEnd').value,
            status: document.getElementById('termStatus').value
        };
        
        saveOrUpdateArrayItem('terms', id, payload);
        renderTerms();
        window.closeModal('add-term-modal');
    }

    function saveClassGroup() {
        const id = document.getElementById('cgId').value;
        const payload = {
            id: id || 'CG' + Date.now().toString().slice(-4),
            name: document.getElementById('cgName').value,
            description: document.getElementById('cgDesc').value,
            classesCount: 0 // Mock default
        };
        
        saveOrUpdateArrayItem('classGroups', id, payload);
        renderClassGroups();
        window.closeModal('add-class-group-modal');
    }

    function saveSubjectGroup() {
        const id = document.getElementById('sgId').value;
        const payload = {
            id: id || 'SG' + Date.now().toString().slice(-4),
            name: document.getElementById('sgName').value,
            description: document.getElementById('sgDesc').value,
            subjectsCount: 0 // Mock default
        };
        
        saveOrUpdateArrayItem('subjectGroups', id, payload);
        renderSubjectGroups();
        window.closeModal('add-subject-group-modal');
    }

    function saveOrUpdateArrayItem(collectionName, id, payload) {
        const index = configData[collectionName].findIndex(x => x.id === id);
        if(index > -1) {
            configData[collectionName][index] = { ...configData[collectionName][index], ...payload };
        } else {
            configData[collectionName].push(payload);
        }
    }

    // --- GLOBAL ACTIONS ---
    window.editAcadConfig = function(type, id) {
        const item = configData[type].find(x => x.id === id);
        if(!item) return;

        if(type === 'academicYears') {
            document.getElementById('ayId').value = item.id;
            document.getElementById('ayName').value = item.name;
            document.getElementById('ayStart').value = item.startDate;
            document.getElementById('ayEnd').value = item.endDate;
            document.getElementById('ayStatus').value = item.status;
            document.getElementById('modal-title-ay').innerText = "Update Academic Year";
            window.openModal('add-academic-year-modal');
        } 
        else if (type === 'terms') {
            document.getElementById('termId').value = item.id;
            document.getElementById('termName').value = item.name;
            document.getElementById('termAY').value = item.academicYear;
            document.getElementById('termStart').value = item.startDate;
            document.getElementById('termEnd').value = item.endDate;
            document.getElementById('termStatus').value = item.status;
            document.getElementById('modal-title-term').innerText = "Update Term";
            window.openModal('add-term-modal');
        }
        else if (type === 'classGroups') {
            document.getElementById('cgId').value = item.id;
            document.getElementById('cgName').value = item.name;
            document.getElementById('cgDesc').value = item.description;
            document.getElementById('modal-title-cg').innerText = "Update Class Group";
            window.openModal('add-class-group-modal');
        }
        else if (type === 'subjectGroups') {
            document.getElementById('sgId').value = item.id;
            document.getElementById('sgName').value = item.name;
            document.getElementById('sgDesc').value = item.description;
            document.getElementById('modal-title-sg').innerText = "Update Subject Group";
            window.openModal('add-subject-group-modal');
        }
    };

    window.deleteAcadConfig = function(type, id) {
        if(confirm(`Are you sure you want to delete this configuration?`)) {
            configData[type] = configData[type].filter(x => x.id !== id);
            
            if(type === 'academicYears') renderAcademicYears();
            if(type === 'terms') renderTerms();
            if(type === 'classGroups') renderClassGroups();
            if(type === 'subjectGroups') renderSubjectGroups();
        }
    };

    // Modal Helpers specific to loaded scope if Flowbite gets messy
    window.openModal = function(modalId) {
        const m = document.getElementById(modalId);
        if(m) {
            m.classList.remove('hidden');
            m.classList.add('flex');
            // Reset form behavior slightly on open if form is adding (id is empty)
            const inputId = m.querySelector('input[type="hidden"]');
            if(inputId && !inputId.value) {
                 const form = m.querySelector('form');
                 if(form) form.reset();
                 // reset titles
                 if(modalId === 'add-academic-year-modal') document.getElementById('modal-title-ay').innerText = 'Add Academic Year';
                 if(modalId === 'add-term-modal') document.getElementById('modal-title-term').innerText = 'Add Term';
                 if(modalId === 'add-class-group-modal') document.getElementById('modal-title-cg').innerText = 'Add Class Group';
                 if(modalId === 'add-subject-group-modal') document.getElementById('modal-title-sg').innerText = 'Add Subject Group';
            }
        }
    };

    window.closeModal = function(modalId) {
        const m = document.getElementById(modalId);
        if(m) {
            m.classList.add('hidden');
            m.classList.remove('flex');
            const inputId = m.querySelector('input[type="hidden"]');
            if(inputId) inputId.value = ''; // clear id on close
        }
    };

    // --- UTILS ---

    async function fetchConfigData() {
        try {
            const res = await fetch('../../data/academic-config.json');
            return await res.json();
        } catch (e) {
            console.error('Fetch error:', e);
            return { academicYears: [], terms: [], classGroups: [], subjectGroups: [] };
        }
    }

    function getStatusColor(status) {
        if(status === 'Active') return 'green';
        if(status === 'Past') return 'gray';
        if(status === 'Upcoming') return 'blue';
        return 'green';
    }

    function bindForm(formId, callback) {
        const formElement = document.getElementById(formId);
        if(formElement) {
            formElement.addEventListener('submit', (e) => {
                e.preventDefault();
                callback();
            });
        }
    }

})();
