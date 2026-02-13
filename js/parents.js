// Parents Module Logic
(function() {
    console.log('Parents script loaded!');
    // Determine context
    const parentsTableBody = document.getElementById('parents-table-body');
    // alert('DEBUG: parents.js running. Table body: ' + parentsTableBody); // DEBUG LINE

    const addParentForm = document.getElementById('addParentForm'); // Assuming ID for Add/Edit form
    
    // === LIST VIEW LOGIC ===
    if (parentsTableBody) {
        let allParents = [];
        let filteredParents = [];
        let studentsData = [];
        const itemsPerPage = 10;
        let currentPage = 1;

        // Fetch Data
        Promise.all([
            fetch('../../data/parents-data.json').then(res => res.json()),
            fetch('../../data/students-data.json').then(res => res.json())
        ])
        .then(([parents, students]) => {
            // Load from localStorage if present to persist changes
            // Load from localStorage if present AND not empty
            const storedParents = localStorage.getItem('parentsData');
            if (storedParents && JSON.parse(storedParents).length > 0) {
                allParents = JSON.parse(storedParents);
            } else {
                allParents = parents;
                // Seed localStorage so it's consistent
                localStorage.setItem('parentsData', JSON.stringify(parents));
            }
            filteredParents = allParents;
            studentsData = students;
            
            renderTable();
            setupFilters();
        })
        .catch(err => console.error('Error loading data:', err));

        function renderTable() {
            parentsTableBody.innerHTML = '';
            
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filteredParents.slice(start, end);

            if (paginatedItems.length === 0) {
                 parentsTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-gray-500">No parents found.</td></tr>';
                 updatePagination(0, 0, 0);
                 return;
            }

            paginatedItems.forEach(parent => {
                // Resolve linked students names
                const studentNames = parent.linkedStudents.map(sid => {
                    const s = studentsData.find(st => st.id === sid);
                    return s ? s.name : sid;
                }).join(', ');

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-100 dark:hover:bg-gray-700';
                tr.innerHTML = `
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${parent.id}</td>
                    <td class="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                        <img class="w-10 h-10 rounded-full" src="${parent.photo}" alt="${parent.name} avatar">
                        <div class="text-sm font-normal text-gray-500 dark:text-gray-400">
                            <div class="text-base font-semibold text-gray-900 dark:text-white">${parent.name}</div>
                            <div class="text-xs font-normal text-gray-500 dark:text-gray-400">${parent.email}</div>
                        </div>
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${parent.relation}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${studentNames}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">${parent.phone}</td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <span class="${getStatusColor(parent.status)} text-xs font-medium px-2.5 py-0.5 rounded">
                            ${parent.status}
                        </span>
                    </td>
                    <td class="p-4 space-x-2 whitespace-nowrap">
                        <button onclick="window.loadAddParentPage('${parent.id}')" type="button" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <i class="fas fa-edit mr-2"></i> Edit
                        </button>
                        <button onclick="window.deleteParent('${parent.id}')" type="button" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                            <i class="fas fa-trash-alt mr-2"></i> Delete
                        </button>
                    </td>
                `;
                parentsTableBody.appendChild(tr);
            });

            updatePagination(start + 1, Math.min(end, filteredParents.length), filteredParents.length);
        }

        function getStatusColor(status) {
            return status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }

        function updatePagination(start, end, total) {
            document.getElementById('showing-start').textContent = start;
            document.getElementById('showing-end').textContent = end;
            document.getElementById('total-records').textContent = total;
            
            // Logic to disable/enable buttons based on page could be added here
        }

        function setupFilters() {
            const searchInput = document.getElementById('parents-search');
            const relationFilter = document.getElementById('relation-filter');
            const statusFilter = document.getElementById('status-filter');

            function applyFilters() {
                const term = searchInput.value.toLowerCase();
                const rel = relationFilter.value;
                const stat = statusFilter.value;

                filteredParents = allParents.filter(p => {
                    const matchesSearch = p.name.toLowerCase().includes(term) || p.phone.includes(term) || p.email.toLowerCase().includes(term);
                    const matchesRel = rel ? p.relation === rel : true;
                    const matchesStat = stat ? p.status === stat : true;
                    return matchesSearch && matchesRel && matchesStat;
                });

                currentPage = 1;
                renderTable();
            }

            if(searchInput) searchInput.addEventListener('input', applyFilters);
            if(relationFilter) relationFilter.addEventListener('change', applyFilters);
            if(statusFilter) statusFilter.addEventListener('change', applyFilters);
            
            document.getElementById('prev-btn').addEventListener('click', () => {
                if (currentPage > 1) { currentPage--; renderTable(); }
            });
            document.getElementById('next-btn').addEventListener('click', () => {
                if (currentPage * itemsPerPage < filteredParents.length) { currentPage++; renderTable(); }
            });
        }

        window.deleteParent = function(id) {
            if(confirm('Are you sure you want to delete this parent?')) {
                allParents = allParents.filter(p => p.id !== id);
                localStorage.setItem('parentsData', JSON.stringify(allParents));
                // Re-apply filters to refresh view
                // For simplicity, just reload or re-filter
                location.reload(); // Or re-trigger filter logic
            }
        };
    }
    
    // === ADD/EDIT LOGIC handled in separate block or file usually, but can be here ===

})();
