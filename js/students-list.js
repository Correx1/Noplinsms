(function() {
    let studentsData = [];
    let filteredData = [];
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
        const filterDepartment = document.getElementById('filter-department');
        const filterStatus = document.getElementById('filter-status');
        const resetBtn = document.getElementById('reset-filters');
        const perPageSelect = document.getElementById('items-per-page');
        const checkboxAll = document.getElementById('checkbox-all');
        const deleteConfirmBtn = document.getElementById('confirm-delete-btn');

        if(searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
        if(filterClass) filterClass.addEventListener('change', () => { currentPage = 1; renderTable(); });
        if(filterSection) filterSection.addEventListener('change', () => { currentPage = 1; renderTable(); });
        if(filterDepartment) filterDepartment.addEventListener('change', () => { currentPage = 1; renderTable(); });
        if(filterStatus) filterStatus.addEventListener('change', () => { currentPage = 1; renderTable(); });
        
        const groupByField = document.getElementById('group-by-field');
        if(groupByField) groupByField.addEventListener('change', () => { currentPage = 1; renderTable(); });
        
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

        // Removed Delete Modal Confirmation per user request.

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
        filteredData = studentsData.filter(student => {
            const search = document.getElementById('student-search').value.toLowerCase();
            const fClass = document.getElementById('filter-class').value;
            const fSection = document.getElementById('filter-section').value;
            const fDepartment = document.getElementById('filter-department').value;
            const fStatus = document.getElementById('filter-status').value || 'Active'; // Default to Active if missing

            const matchesSearch = student.name.toLowerCase().includes(search) || 
                                  student.id.toLowerCase().includes(search) || 
                                  student.phone.includes(search);
            const matchesClass = fClass ? student.class === fClass : true;
            const matchesSection = fSection ? student.section === fSection : true;
            const matchesDepartment = fDepartment ? student.department === fDepartment : true;
            const matchesStatus = fStatus === 'All' ? true : student.status === fStatus;

            return matchesSearch && matchesClass && matchesSection && matchesDepartment && matchesStatus;
        });

        // Dynamic Page Header
        const pageTitleEl = document.getElementById('page-title');
        const fStatusVal = document.getElementById('filter-status').value;
        if(pageTitleEl) {
            if(fStatusVal === 'Inactive') {
                pageTitleEl.innerText = 'Past/Inactive Students';
            } else if(fStatusVal === 'All') {
                pageTitleEl.innerText = 'All Students Records';
            } else {
                pageTitleEl.innerText = 'Students Management';
            }
        }

        // Sort Setup
        const groupBy = document.getElementById('group-by-field') ? document.getElementById('group-by-field').value : '';

        filteredData.sort((a, b) => {
            // If grouping is active, sort by group field first
            if (groupBy) {
                const groupA = (a[groupBy] || '').toLowerCase();
                const groupB = (b[groupBy] || '').toLowerCase();
                if (groupA < groupB) return -1;
                if (groupA > groupB) return 1;
            }
            
            // Secondary sort
            const valA = (a[sortColumn] || '').toLowerCase();
            const valB = (b[sortColumn] || '').toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Pagination
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filteredData.slice(start, end);

        // Update Counts
        document.getElementById('showing-start').innerText = totalItems > 0 ? start + 1 : 0;
        document.getElementById('showing-end').innerText = Math.min(end, totalItems);
        document.getElementById('total-records').innerText = totalItems;

        // Populate Table with Grouping Logic
        let currentGroupValue = null;
        let html = '';

        if (pageData.length === 0) {
            html = '<tr><td colspan="9" class="text-center py-8 text-gray-500">No students found.</td></tr>';
        } else {
            pageData.forEach(student => {
                // Check if we need a group header
                if (groupBy) {
                    const studentGroupValue = student[groupBy] || 'None';
                    if (studentGroupValue !== currentGroupValue) {
                        currentGroupValue = studentGroupValue;
                        const groupLabel = groupBy.charAt(0).toUpperCase() + groupBy.slice(1);
                        html += `
                        <tr class="bg-gray-100 dark:bg-gray-700">
                            <td colspan="9" class="px-6 py-3 font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider border-y border-gray-200 dark:border-gray-600">
                                ${groupLabel}: ${currentGroupValue}
                            </td>
                        </tr>`;
                    }
                }

                // Row HTML
                html += `
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
                    <td class="px-6 py-4">
                        ${student.department === 'Science' ? '<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-300">Science</span>' : ''}
                        ${student.department === 'Art' ? '<span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded dark:bg-purple-900 dark:text-purple-300">Art</span>' : ''}
                        ${student.department === 'Commercial' ? '<span class="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded dark:bg-orange-900 dark:text-orange-300">Commercial</span>' : ''}
                        ${student.department === 'General' ? '<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">General</span>' : ''}
                    </td>
                    <td class="px-6 py-4">${student.section}</td>
                    <td class="px-6 py-4">${student.roll}</td>
                    <td class="px-6 py-4">${student.phone}</td>
                    <td class="px-6 py-4">
                        <select onchange="updateStudentStatus('${student.id}', this.value)" class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                            <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-3">
                            <button onclick="window.loadViewStudentPage('${student.id}')" class="font-medium text-gray-600 dark:text-gray-200 hover:underline" title="View Student">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="window.loadAddStudentPage('${student.id}')" class="font-medium text-blue-600 dark:text-blue-500 hover:underline" title="Edit Student">
                                <i class="fas fa-pen"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
            });
        }
        
        tbody.innerHTML = html;

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

    window.updateStudentStatus = (id, newStatus) => {
        const studentIndex = studentsData.findIndex(s => s.id === id);
        if (studentIndex > -1) {
            studentsData[studentIndex].status = newStatus;
            renderTable();
            if(window.showToast) {
                window.showToast(`Student status updated to ${newStatus}`, 'success');
            }
        }
    };

    window.exportStudentsExcel = function() {
        if (!filteredData || filteredData.length === 0) {
            if(window.showToast) window.showToast('No students to export based on current filters.', 'error');
            else alert("No students to export based on current filters.");
            return;
        }

        const headers = ["Name", "Student ID", "Class", "Department", "Section", "Roll No", "Phone", "Status"];
        
        const rows = filteredData.map(student => [
            `"${student.name || ''}"`,
            `"${student.id || ''}"`,
            `"${student.class || ''}"`,
            `"${student.department || 'General'}"`,
            `"${student.section || ''}"`,
            `"${student.roll || ''}"`,
            `"${student.phone || ''}"`,
            `"${student.status || ''}"`
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        const currentStatus = document.getElementById('filter-status') ? (document.getElementById('filter-status').value || 'active') : 'active';
        link.setAttribute("download", `students_export_${currentStatus.toLowerCase()}_${new Date().toISOString().slice(0,10)}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

})();

