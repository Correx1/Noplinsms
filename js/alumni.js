// Alumni Module Logic
(function() {
    let alumniData = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let sortColumn = 'name';
    let sortDirection = 'asc';

    // Fetch initial data
    fetch('../../data/alumni-data.json')
        .then(response => response.json())
        .then(data => {
            alumniData = data;
            renderTable();
        })
        .catch(error => {
            console.error('Error loading alumni data:', error);
            document.getElementById('alumni-table-body').innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Failed to load data</td></tr>`;
        });

    // Event Listeners setup
    setTimeout(() => {
        const searchInput = document.getElementById('alumni-search');
        const deptFilter = document.getElementById('filter-department');
        const sessionFilter = document.getElementById('filter-session');
        const resetBtn = document.getElementById('reset-filters');

        if(searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
        if(deptFilter) deptFilter.addEventListener('change', () => { currentPage = 1; renderTable(); });
        if(sessionFilter) sessionFilter.addEventListener('change', () => { currentPage = 1; renderTable(); });
        
        if(resetBtn) resetBtn.addEventListener('click', () => {
             if(searchInput) searchInput.value = '';
             if(deptFilter) deptFilter.value = '';
             if(sessionFilter) sessionFilter.value = '';
             currentPage = 1;
             renderTable();
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
                
                // Update sorting icons
                document.querySelectorAll('th i.fa-sort, th i.fa-sort-up, th i.fa-sort-down').forEach(icon => {
                    icon.className = 'fas fa-sort text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300';
                });
                const icon = th.querySelector('i');
                if(icon) {
                    icon.className = sortDirection === 'asc' ? 'fas fa-sort-up text-primary-600' : 'fas fa-sort-down text-primary-600';
                }

                renderTable();
            });
        });
    }, 100);

    function renderTable() {
        const tbody = document.getElementById('alumni-table-body');
        if (!tbody) return;

        const searchInput = document.getElementById('alumni-search');
        const deptFilter = document.getElementById('filter-department');
        const sessionFilter = document.getElementById('filter-session');

        const search = searchInput ? searchInput.value.toLowerCase() : '';
        const dept = deptFilter ? deptFilter.value : '';
        const session = sessionFilter ? sessionFilter.value : '';

        // Filter
        let filteredData = alumniData.filter(alumni => {
            const matchesSearch = alumni.name.toLowerCase().includes(search) || 
                                  alumni.department.toLowerCase().includes(search) ||
                                  alumni.email.toLowerCase().includes(search) ||
                                  alumni.session.includes(search);
            const matchesDept = dept ? alumni.department === dept : true;
            const matchesSession = session ? alumni.session === session : true;
            return matchesSearch && matchesDept && matchesSession;
        });

        // Sort
        filteredData.sort((a, b) => {
            let valA = a[sortColumn] || '';
            let valB = b[sortColumn] || '';
            
            if(typeof valA === 'string') valA = valA.toLowerCase();
            if(typeof valB === 'string') valB = valB.toLowerCase();

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
        const startEl = document.getElementById('showing-start');
        const endEl = document.getElementById('showing-end');
        const totalEl = document.getElementById('total-records');
        if(startEl) startEl.innerText = totalItems > 0 ? start + 1 : 0;
        if(endEl) endEl.innerText = Math.min(end, totalItems);
        if(totalEl) totalEl.innerText = totalItems;

        // Populate Table
        if (pageData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500 dark:text-gray-400">No alumni records found</td></tr>`;
        } else {
            tbody.innerHTML = pageData.map(alumni => `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <td class="px-6 py-4 text-gray-900 dark:text-white font-medium">
                        <div class="flex items-center gap-3">
                            <img class="w-8 h-8 rounded-full object-cover" src="${alumni.avatar || '../../assets/images/default-avatar.png'}" alt="${alumni.name}">
                            ${alumni.name}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-900 dark:text-white">${alumni.department || '-'}</td>
                    <td class="px-6 py-4">${alumni.contact || '-'}</td>
                    <td class="px-6 py-4">${alumni.email || '-'}</td>
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${alumni.session || '-'}</td>
                </tr>
            `).join('');
        }

        // Render Pagination
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination-controls');
        if(!pagination) return;

        let html = `
            <li>
                <a href="#" onclick="changeAlumniPage(${currentPage - 1}); return false;" class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'transition-colors'}">Previous</a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li>
                    <a href="#" onclick="changeAlumniPage(${i}); return false;" class="flex items-center justify-center px-3 h-8 leading-tight transition-colors ${currentPage === i ? 'text-primary-600 border border-gray-300 bg-primary-50 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}">${i}</a>
                </li>
            `;
        }

        html += `
            <li>
                <a href="#" onclick="changeAlumniPage(${currentPage + 1}); return false;" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'transition-colors'}">Next</a>
            </li>
        `;

        pagination.innerHTML = html;
    }

    // Expose pagination to global scope so inline onclick works
    window.changeAlumniPage = (page) => {
        currentPage = page;
        renderTable();
    };

})();
