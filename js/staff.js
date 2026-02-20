// Staff Module Logic
(function() {
    // Determine context (List or Add/Edit) based on element existence
    const staffTableBody = document.getElementById('staff-table-body');
    const addStaffForm = document.getElementById('addStaffForm');

    // === LIST VIEW LOGIC ===
    if (staffTableBody) {
        let allStaff = [];
        let filteredStaff = [];
        const itemsPerPage = 10;
        let currentPage = 1;

        // Fetch Data
        fetch('../../data/staff-data.json')
            .then(res => res.json())
            .then(data => {
                allStaff = data;
                filteredStaff = data;
                renderTable();
                setupFilters();
            })
            .catch(err => console.error('Error loading staff:', err));

        function renderTable() {
            staffTableBody.innerHTML = '';
            
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filteredStaff.slice(start, end);

            if (paginatedItems.length === 0) {
                 staffTableBody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-gray-500">No staff found.</td></tr>';
                 return;
            }

            paginatedItems.forEach(staff => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-100 dark:hover:bg-gray-700';
                tr.innerHTML = `
                    <td class="w-4 p-4">
                        <div class="flex items-center">
                            <input id="checkbox-${staff.id}" type="checkbox" class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        </div>
                    </td>
                    <td class="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                        <img class="w-10 h-10 rounded-full" src="${staff.photo}" alt="${staff.name} avatar">
                        <div class="text-sm font-normal text-gray-500 dark:text-gray-400">
                            <div class="text-base font-semibold text-gray-900 dark:text-white">${staff.name}</div>
                            <div class="text-xs font-normal text-gray-500 dark:text-gray-400">${staff.email}</div>
                        </div>
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${staff.id}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${staff.employment.department}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                            ${staff.employment.designation}
                        </span>
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${staff.phone}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <div class="flex items-center">
                            <div class="h-2.5 w-2.5 rounded-full ${getStatusColor(staff.status)} mr-2"></div> ${staff.status}
                        </div>
                    </td>
                    <td class="p-4 space-x-2 whitespace-nowrap">
                        <button onclick="window.loadAddStaffPage('${staff.id}')" type="button" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <i class="fas fa-edit mr-2"></i> Edit
                        </button>
                        <button type="button" onclick="window.prepareDeleteStaff('${staff.id}')" data-modal-target="deleteStaffModal" data-modal-toggle="deleteStaffModal" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                            <i class="fas fa-trash-alt mr-2"></i> Delete
                        </button>
                    </td>
                `;
                staffTableBody.appendChild(tr);
            });

            updatePagination(start + 1, Math.min(end, filteredStaff.length), filteredStaff.length);
        }

        function getStatusColor(status) {
            if (status === 'Active') return 'bg-green-500';
            if (status === 'On Leave') return 'bg-yellow-500';
            return 'bg-red-500';
        }

        function updatePagination(start, end, total) {
            document.getElementById('staff-showing-start').textContent = total === 0 ? 0 : start;
            document.getElementById('staff-showing-end').textContent = end;
            document.getElementById('staff-total-records').textContent = total;

            const totalPages = Math.ceil(total / itemsPerPage);
            const container = document.getElementById('staff-pagination-controls');
            container.innerHTML = '';

            // Prev
            container.innerHTML += `
                <li>
                    <a href="#" onclick="changeStaffPage(${currentPage - 1})" class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}">Previous</a>
                </li>
            `;

            // Next
            container.innerHTML += `
                <li>
                    <a href="#" onclick="changeStaffPage(${currentPage + 1})" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === totalPages || total === 0 ? 'pointer-events-none opacity-50' : ''}">Next</a>
                </li>
            `;
        }

        function setupFilters() {
            const searchInput = document.getElementById('staff-search');
            const deptFilter = document.getElementById('filter-department');
            const statusFilter = document.getElementById('filter-staff-status');

            function applyFilters() {
                const term = searchInput.value.toLowerCase();
                const dept = deptFilter.value;
                const stat = statusFilter.value;

                filteredStaff = allStaff.filter(s => {
                    const matchesSearch = s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
                    const matchesDept = dept ? s.employment.department === dept : true;
                    const matchesStat = stat ? s.status === stat : true;
                    return matchesSearch && matchesDept && matchesStat;
                });

                currentPage = 1;
                renderTable();
            }

            searchInput.addEventListener('input', applyFilters);
            deptFilter.addEventListener('change', applyFilters);
            statusFilter.addEventListener('change', applyFilters);
        }

        // Global Pagination Helper
        window.changeStaffPage = function(page) {
            if (page < 1) return;
            currentPage = page;
            renderTable();
        };

        window.prepareDeleteStaff = function(id) {
            const btn = document.getElementById('confirm-delete-staff-btn');
            btn.onclick = () => {
                allStaff = allStaff.filter(s => s.id !== id);
                filteredStaff = filteredStaff.filter(s => s.id !== id);
                renderTable();
            };
        };
    }

    // === ADD/EDIT VIEW LOGIC ===
    if (addStaffForm) {
        
        // Tab Switching
        window.switchStaffTab = function(tabId) {
             const tabs = ['staff-personal', 'staff-employment', 'staff-documents'];
             
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
        const photoInput = document.getElementById('staff-photo');
        if(photoInput) {
            photoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => document.getElementById('staff-photo-preview').src = e.target.result;
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }

        // EDIT MODE CHECK
        if (window.editingStaffId) {
            document.querySelector('h1').textContent = 'Edit Staff';
            document.getElementById('save-staff-btn').textContent = 'Update Staff';
            
            // Fetch Mock Data
            fetch('../../data/staff-data.json')
                .then(res => res.json())
                .then(data => {
                    const staff = data.find(s => s.id === window.editingStaffId);
                    if(staff) populateStaffForm(staff);
                });
        }

        function populateStaffForm(data) {
            document.getElementById('staff_first_name').value = data.name.split(' ')[0];
            document.getElementById('staff_last_name').value = data.name.split(' ')[1] || '';
            document.getElementById('staff_dob').value = data.dob;
            document.getElementById('staff_email').value = data.email;
            document.getElementById('staff_phone').value = data.phone;
            document.getElementById('staff_address').value = data.address;
            
            if(data.gender === 'Male') document.getElementById('staff-gender-male').checked = true;
            else document.getElementById('staff-gender-female').checked = true;

            document.getElementById('staff-photo-preview').src = data.photo;

            // Employment
            document.getElementById('staff_joining_date').value = data.employment.joining_date;
            document.getElementById('staff_qualification').value = data.employment.qualification;
            document.getElementById('staff_salary').value = data.employment.salary;
            document.getElementById('staff_department').value = data.employment.department;
            document.getElementById('staff_designation').value = data.employment.designation;
            
            if(data.employment.type === 'Full-time') document.getElementById('staff-type-full').checked = true;
            else document.getElementById('staff-type-part').checked = true;
        }

        // Form Submit
        addStaffForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('save-staff-btn');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            setTimeout(() => {
                document.getElementById('toast-staff').classList.remove('hidden');
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                setTimeout(() => {
                    document.getElementById('toast-staff').classList.add('hidden');
                    if(!window.editingStaffId) {
                        addStaffForm.reset();
                        document.getElementById('staff-photo-preview').src = "https://ui-avatars.com/api/?name=New+Staff&background=random";
                        window.switchStaffTab('staff-personal');
                    }
                }, 2000);
            }, 1000);
        });
    }

})();
