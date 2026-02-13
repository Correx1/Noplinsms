// Students List Logic
(function() {
    let studentsData = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let sortColumn = 'name';
    let sortDirection = 'asc';
    let deleteTargetId = null;

    // Load Data
    fetch('../../data/students-data.json')
        .then(response => response.json())
        .then(data => {
            studentsData = data;
            renderTable();
        })
        .catch(error => console.error('Error loading students data:', error));

    // Event Listeners
    setTimeout(() => {
        const searchInput = document.getElementById('student-search');
        const filterClass = document.getElementById('filter-class');
        const filterSection = document.getElementById('filter-section');
        const filterStatus = document.getElementById('filter-status');
        const resetBtn = document.getElementById('reset-filters');
        const perPageSelect = document.getElementById('items-per-page');
        const checkboxAll = document.getElementById('checkbox-all');
        const deleteConfirmBtn = document.getElementById('confirm-delete-btn');

        if(searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
        if(filterClass) filterClass.addEventListener('change', () => { currentPage = 1; renderTable(); });
        if(filterSection) filterSection.addEventListener('change', () => { currentPage = 1; renderTable(); });
        if(filterStatus) filterStatus.addEventListener('change', () => { currentPage = 1; renderTable(); });
        
        if(resetBtn) resetBtn.addEventListener('click', () => {
             document.querySelector('form').reset();
             currentPage = 1;
             renderTable();
        });

        if(perPageSelect) perPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderTable();
        });

        if(checkboxAll) checkboxAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.student-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });

        // Delete Modal Confirmation
        if(deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', () => {
             if(deleteTargetId) {
                 studentsData = studentsData.filter(student => student.id !== deleteTargetId);
                 renderTable();
                 
                 // Hide Modal
                 const modalEl = document.getElementById('deleteModal');
                 const modal = new Modal(modalEl);
                 modal.hide();
                 
                 // Manually hide backdrop if Flowbite doesn't handle it cleanly in this context
                 document.body.classList.remove('overflow-hidden');
                 const backdrops = document.querySelectorAll('[modal-backdrop]');
                 backdrops.forEach(bd => bd.remove());
                 
                 deleteTargetId = null;
             }
        });

        // Sorting
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                if (sortColumn === column) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = column;
                    sortDirection = 'asc';
                }
                renderTable();
            });
        });

    }, 500); // Small delay to ensure DOM is ready if required

    function renderTable() {
        const tbody = document.getElementById('students-table-body');
        if (!tbody) return;

        // Filter
        let filteredData = studentsData.filter(student => {
            const search = document.getElementById('student-search').value.toLowerCase();
            const fClass = document.getElementById('filter-class').value;
            const fSection = document.getElementById('filter-section').value;
            const fStatus = document.getElementById('filter-status').value;

            const matchesSearch = student.name.toLowerCase().includes(search) || 
                                  student.id.toLowerCase().includes(search) || 
                                  student.phone.includes(search);
            const matchesClass = fClass ? student.class === fClass : true;
            const matchesSection = fSection ? student.section === fSection : true;
            const matchesStatus = fStatus ? student.status === fStatus : true;

            return matchesSearch && matchesClass && matchesSection && matchesStatus;
        });

        // Sort
        filteredData.sort((a, b) => {
            const valA = a[sortColumn].toLowerCase();
            const valB = b[sortColumn].toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Pagination
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filteredData.slice(start, end);

        // Update Counts
        document.getElementById('showing-start').innerText = totalItems > 0 ? start + 1 : 0;
        document.getElementById('showing-end').innerText = Math.min(end, totalItems);
        document.getElementById('total-records').innerText = totalItems;

        // Populate Table
        tbody.innerHTML = pageData.map(student => `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="w-4 p-4">
                    <div class="flex items-center">
                        <input type="checkbox" class="student-checkbox w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label class="sr-only">checkbox</label>
                    </div>
                </td>
                <td class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <img class="w-8 h-8 rounded-full mr-2" src="${student.photo}" alt="${student.name}">
                    <div class="pl-3">
                        <div class="text-base font-semibold">${student.name}</div>
                        <div class="font-normal text-gray-500">${student.gender}</div>
                    </div>  
                </td>
                <td class="px-6 py-4">${student.id}</td>
                <td class="px-6 py-4">${student.class}</td>
                <td class="px-6 py-4">${student.section}</td>
                <td class="px-6 py-4">${student.roll}</td>
                <td class="px-6 py-4">${student.phone}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="h-2.5 w-2.5 rounded-full ${student.status === 'Active' ? 'bg-green-500' : 'bg-red-500'} mr-2"></div> ${student.status}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="window.loadViewStudentPage('${student.id}')" class="font-medium text-gray-600 dark:text-gray-200 hover:underline" title="View Student">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="window.loadAddStudentPage('${student.id}')" class="font-medium text-blue-600 dark:text-blue-500 hover:underline" title="Edit Student">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button onclick="window.prepareDelete('${student.id}')" data-modal-target="deleteModal" data-modal-toggle="deleteModal" class="font-medium text-red-600 dark:text-red-500 hover:underline" title="Delete Student">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Render Pagination
        renderPagination(totalPages);
        
        // Re-init Flowbite for tooltips if needed
        initFlowbite();
    }

    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination-controls');
        let html = `
            <li>
                <a href="#" onclick="changePage(${currentPage - 1})" class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}">Previous</a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li>
                    <a href="#" onclick="changePage(${i})" class="flex items-center justify-center px-3 h-8 leading-tight ${currentPage === i ? 'text-primary-600 border border-gray-300 bg-primary-50 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}">${i}</a>
                </li>
            `;
        }

        html += `
            <li>
                <a href="#" onclick="changePage(${currentPage + 1})" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}">Next</a>
            </li>
        `;

        pagination.innerHTML = html;
    }

    // Expose functions to global scope for HTML inline events
    window.changePage = (page) => {
        currentPage = page;
        renderTable();
    };

    window.prepareDelete = (id) => {
        deleteTargetId = id;
    };
})();
