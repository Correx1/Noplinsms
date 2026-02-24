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
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Code: ${sub.code}</p>
                    
                    <div class="mb-4">
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
                    s.name.toLowerCase().includes(term) || 
                    s.code.toLowerCase().includes(term)
                );
                renderSubjectsGrid(filtered);
            });
        }
    }


    // === 2. ADD SUBJECT FORM LOGIC ===
    async function initAddSubjectForm() {
        if (window.editingSubjectId) {
            const h1 = document.querySelector('h1');
            if(h1) h1.textContent = 'Edit Subject';
            const btn = document.querySelector('#add-subject-form button[type="submit"]');
            if(btn) btn.textContent = 'Update Subject';
            
            const data = await fetchSubjectsData();
            const subject = data.find(s => s.id === window.editingSubjectId);
            if (subject) {
                document.getElementById('subjectName').value = subject.name;
                document.getElementById('subjectCode').value = subject.code;
                document.getElementById('subjectType').value = subject.type;
                
                const descEl = document.getElementById('subjectDescription');
                if(descEl && subject.description) descEl.value = subject.description;

                const checkboxes = document.querySelectorAll('#assignedClassesGroup input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    if (subject.classes.includes(cb.value)) cb.checked = true;
                });
            }
        }

        addSubjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('subjectName').value;
            const code = document.getElementById('subjectCode').value;
            
            if(name && code) {
                alert(window.editingSubjectId ? 'Subject updated successfully! (Mock)' : 'Subject added successfully! (Mock)');
                if(window.loadSubjectsPage) {
                    window.loadSubjectsPage();
                }
            }
        });
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
