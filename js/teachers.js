// Teachers Module Logic
(function() {
    // Determine context (List or Add/Edit) based on element existence
    const teachersTableBody = document.getElementById('teachers-table-body');
    const addTeacherForm = document.getElementById('addTeacherForm');

    // === LIST VIEW LOGIC ===
    if (teachersTableBody) {
        let allTeachers = [];
        let filteredTeachers = [];
        const itemsPerPage = 10;
        let currentPage = 1;

        // Fetch Data
        fetch('../../data/teachers-data.json')
            .then(res => res.json())
            .then(data => {
                allTeachers = data;
                filteredTeachers = data;
                renderTable();
                setupFilters();
            })
            .catch(err => console.error('Error loading teachers:', err));

        function renderTable() {
            teachersTableBody.innerHTML = '';
            
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filteredTeachers.slice(start, end);

            if (paginatedItems.length === 0) {
                 teachersTableBody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-gray-500">No teachers found.</td></tr>';
                 return;
            }

            paginatedItems.forEach(teacher => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-100 dark:hover:bg-gray-700';
                tr.innerHTML = `
                    <td class="w-4 p-4">
                        <div class="flex items-center">
                            <input id="checkbox-${teacher.id}" type="checkbox" class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        </div>
                    </td>
                    <td class="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                        <img class="w-10 h-10 rounded-full" src="${teacher.photo}" alt="${teacher.name} avatar">
                        <div class="text-sm font-normal text-gray-500 dark:text-gray-400">
                            <div class="text-base font-semibold text-gray-900 dark:text-white">${teacher.name}</div>
                            <div class="text-xs font-normal text-gray-500 dark:text-gray-400">${teacher.email}</div>
                        </div>
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${teacher.id}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${teacher.employment.specialization.join(', ')}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                            ${teacher.employment.classes_assigned.length} Classes
                        </span>
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${teacher.phone}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <div class="flex items-center">
                            <div class="h-2.5 w-2.5 rounded-full ${getStatusColor(teacher.status)} mr-2"></div> ${teacher.status}
                        </div>
                    </td>
                    <td class="p-4 space-x-2 whitespace-nowrap">
                        <button onclick="window.loadAddTeacherPage('${teacher.id}')" type="button" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <i class="fas fa-edit mr-2"></i> Edit
                        </button>
                        <button type="button" onclick="window.prepareDeleteTeacher('${teacher.id}')" data-modal-target="deleteTeacherModal" data-modal-toggle="deleteTeacherModal" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                            <i class="fas fa-trash-alt mr-2"></i> Delete
                        </button>
                    </td>
                `;
                teachersTableBody.appendChild(tr);
            });

            updatePagination(start + 1, Math.min(end, filteredTeachers.length), filteredTeachers.length);
        }

        function getStatusColor(status) {
            if (status === 'Active') return 'bg-green-500';
            if (status === 'On Leave') return 'bg-yellow-500';
            return 'bg-red-500';
        }

        function updatePagination(start, end, total) {
            document.getElementById('showing-start').textContent = total === 0 ? 0 : start;
            document.getElementById('showing-end').textContent = end;
            document.getElementById('total-records').textContent = total;

            const totalPages = Math.ceil(total / itemsPerPage);
            const container = document.getElementById('pagination-controls');
            container.innerHTML = '';

            // Prev
            container.innerHTML += `
                <li>
                    <a href="#" onclick="changeTeacherPage(${currentPage - 1})" class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}">Previous</a>
                </li>
            `;

            // Next
            container.innerHTML += `
                <li>
                    <a href="#" onclick="changeTeacherPage(${currentPage + 1})" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === totalPages || total === 0 ? 'pointer-events-none opacity-50' : ''}">Next</a>
                </li>
            `;
        }

        function setupFilters() {
            const searchInput = document.getElementById('teachers-search');
            const subFilter = document.getElementById('filter-subject');
            const statusFilter = document.getElementById('filter-status');

            function applyFilters() {
                const term = searchInput.value.toLowerCase();
                const sub = subFilter.value;
                const stat = statusFilter.value;

                filteredTeachers = allTeachers.filter(t => {
                    const matchesSearch = t.name.toLowerCase().includes(term) || t.email.toLowerCase().includes(term);
                    const matchesSub = sub ? t.employment.specialization.includes(sub) : true;
                    const matchesStat = stat ? t.status === stat : true;
                    return matchesSearch && matchesSub && matchesStat;
                });

                currentPage = 1;
                renderTable();
            }

            searchInput.addEventListener('input', applyFilters);
            subFilter.addEventListener('change', applyFilters);
            statusFilter.addEventListener('change', applyFilters);
        }

        // Global Pagination Helper
        window.changeTeacherPage = function(page) {
            if (page < 1) return;
            currentPage = page;
            renderTable();
        };

        window.prepareDeleteTeacher = function(id) {
            const btn = document.getElementById('confirm-delete-teacher-btn');
            btn.onclick = () => {
                allTeachers = allTeachers.filter(t => t.id !== id);
                filteredTeachers = filteredTeachers.filter(t => t.id !== id);
                renderTable();
                // Close modal programmatically if needed, or rely on flowbite
            };
        };
    }

    // === ADD/EDIT VIEW LOGIC ===
    if (addTeacherForm) {
        
        // Tab Switching
        window.switchTeacherTab = function(tabId) {
             const tabs = ['personal', 'employment', 'documents'];
             
             tabs.forEach(t => {
                 document.getElementById(t).classList.add('hidden');
                 const btn = document.getElementById(t + '-tab');
                 btn.classList.remove('text-primary-600', 'border-primary-600', 'active', 'dark:text-primary-500', 'dark:border-primary-500');
                 btn.classList.add('border-transparent');
             });

             document.getElementById(tabId).classList.remove('hidden');
             const activeBtn = document.getElementById(tabId + '-tab');
             activeBtn.classList.add('text-primary-600', 'border-primary-600', 'active', 'dark:text-primary-500', 'dark:border-primary-500');
             activeBtn.classList.remove('border-transparent');
        };

        // Photo Preview
        const photoInput = document.getElementById('teacher-photo');
        if(photoInput) {
            photoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => document.getElementById('photo-preview').src = e.target.result;
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }

        // EDIT MODE CHECK
        if (window.editingTeacherId) {
            document.querySelector('h1').textContent = 'Edit Teacher';
            document.getElementById('save-teacher-btn').textContent = 'Update Teacher';
            
            // Fetch Mock Data
            fetch('../../data/teachers-data.json')
                .then(res => res.json())
                .then(data => {
                    const teacher = data.find(t => t.id === window.editingTeacherId);
                    if(teacher) populateTeacherForm(teacher);
                });
        }

        function populateTeacherForm(data) {
            document.getElementById('first_name').value = data.name.split(' ')[0];
            document.getElementById('last_name').value = data.name.split(' ')[1] || '';
            document.getElementById('dob').value = data.dob;
            document.getElementById('email').value = data.email;
            document.getElementById('phone').value = data.phone;
            document.getElementById('address').value = data.address;
            
            if(data.gender === 'Male') document.getElementById('gender-male').checked = true;
            else document.getElementById('gender-female').checked = true;

            document.getElementById('photo-preview').src = data.photo;

            // Employment
            document.getElementById('joining_date').value = data.employment.joining_date;
            document.getElementById('qualification').value = data.employment.qualification;
            document.getElementById('salary').value = data.employment.salary;
            
            if(data.employment.type === 'Full-time') document.getElementById('type-full').checked = true;
            else document.getElementById('type-part').checked = true;

            // Simple handling for multi-selects (visual selection only for mock)
            const subjectSelect = document.getElementById('subjects');
            Array.from(subjectSelect.options).forEach(opt => {
                if(data.employment.specialization.includes(opt.value)) opt.selected = true;
            });
        }

        // Form Submit
        addTeacherForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('save-teacher-btn');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            setTimeout(() => {
                document.getElementById('toast-teacher').classList.remove('hidden');
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                setTimeout(() => {
                    document.getElementById('toast-teacher').classList.add('hidden');
                    if(!window.editingTeacherId) {
                        addTeacherForm.reset();
                        document.getElementById('photo-preview').src = "https://ui-avatars.com/api/?name=New+Teacher&background=random";
                        window.switchTeacherTab('personal');
                    }
                }, 2000);
            }, 1000);
        });
    }

})();
