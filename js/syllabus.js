// Syllabus Module Logic
(function() {
    let syllabusData = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let sortColumn = 'title';
    let sortDirection = 'asc';
    let deleteTargetId = null;

    // Detect context (list or add/edit form)
    const isList = document.getElementById('syllabus-table-body') !== null;
    const isForm = document.getElementById('syllabus-form') !== null;

    init();

    function init() {
        // Fetch or init data
        const stored = localStorage.getItem('syllabusData');
        if (stored) {
            syllabusData = JSON.parse(stored);
            proceed();
        } else {
            fetch('../../data/syllabus-data.json')
                .then(r => r.json())
                .then(data => {
                    syllabusData = data;
                    localStorage.setItem('syllabusData', JSON.stringify(data));
                    proceed();
                })
                .catch(err => {
                    console.error('Error fetching default syllabus data', err);
                    proceed(); // Fallback to empty
                });
        }
    }

    function proceed() {
        if (isList) {
            setupListView();
        } else if (isForm) {
            setupFormView();
        }
    }

    // =============================
    // LIST VIEW LOGIC
    // =============================
    function setupListView() {
        setTimeout(() => {
            const searchInput = document.getElementById('syllabus-search');
            const deptFilter = document.getElementById('syllabus-filter-department');
            
            if(searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
            if(deptFilter) deptFilter.addEventListener('change', () => { currentPage = 1; renderTable(); });

            // Delete Confirm
            const delBtn = document.getElementById('confirm-delete-btn');
            if(delBtn) {
                delBtn.addEventListener('click', confirmDelete);
            }

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
                    
                    // Update Icons
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

            renderTable();
        }, 100);
    }

    function renderTable() {
        const tbody = document.getElementById('syllabus-table-body');
        if (!tbody) return;

        const searchInput = document.getElementById('syllabus-search');
        const deptFilter = document.getElementById('syllabus-filter-department');
        const search = searchInput ? searchInput.value.toLowerCase() : '';
        const dept = deptFilter ? deptFilter.value : '';

        // Filter
        let filteredData = syllabusData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(search) || 
                                  item.subject.toLowerCase().includes(search) || 
                                  item.class.toLowerCase().includes(search);
            const matchesDept = dept ? item.department === dept : true;
            return matchesSearch && matchesDept;
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

        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filteredData.slice(start, end);

        // Update counts
        const startEl = document.getElementById('showing-start');
        const endEl = document.getElementById('showing-end');
        const totalEl = document.getElementById('total-records');
        if(startEl) startEl.innerText = totalItems > 0 ? start + 1 : 0;
        if(endEl) endEl.innerText = Math.min(end, totalItems);
        if(totalEl) totalEl.innerText = totalItems;

        // Render
        if (pageData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No syllabus found</td></tr>`;
        } else {
            tbody.innerHTML = pageData.map(item => `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        ${item.title}
                        <div class="text-xs text-gray-500 font-normal truncate max-w-xs mt-1 dark:text-gray-400" title="${item.description}">${item.description || ''}</div>
                    </td>
                    <td class="px-6 py-4">${item.subject}</td>
                    <td class="px-6 py-4">
                        <div class="flex flex-col gap-1 items-start">
                            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">${item.class}</span>
                            ${item.department && item.department !== 'General' ? `<span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800">${item.department}</span>` : ''}
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <a href="#" class="inline-flex items-center text-primary-600 hover:underline hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                            <i class="fas fa-file-pdf text-red-500 mr-2"></i> ${item.file || 'No file'}
                        </a>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex flex-nowrap items-center justify-end gap-2">
                             <button onclick="window.loadAddSyllabusPage('${item.id}')" class="font-medium text-blue-600 dark:text-blue-500 hover:underline" title="Edit Syllabus">
                                 <i class="fas fa-pen"></i>
                             </button>
                             <button onclick="window.prepareDeleteSyllabus('${item.id}')" data-modal-target="deleteModal" data-modal-toggle="deleteModal" class="font-medium text-red-600 dark:text-red-500 hover:underline" title="Delete Syllabus">
                                 <i class="fas fa-trash"></i>
                             </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        renderPagination(totalPages);
        initFlowbite();
    }

    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination-controls');
        if(!pagination) return;
        let html = `<li><a href="#" onclick="changeSyllabusPage(${currentPage - 1}); return false;" class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'transition-colors'}">Previous</a></li>`;

        for (let i = 1; i <= totalPages; i++) {
            html += `<li><a href="#" onclick="changeSyllabusPage(${i}); return false;" class="flex items-center justify-center px-3 h-8 leading-tight transition-colors ${currentPage === i ? 'text-primary-600 border border-gray-300 bg-primary-50 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}">${i}</a></li>`;
        }
        html += `<li><a href="#" onclick="changeSyllabusPage(${currentPage + 1}); return false;" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'transition-colors'}">Next</a></li>`;
        pagination.innerHTML = html;
    }

    window.changeSyllabusPage = (page) => {
        currentPage = page;
        renderTable();
    };

    window.prepareDeleteSyllabus = (id) => {
        deleteTargetId = id;
    };

    function confirmDelete() {
        if(deleteTargetId) {
            syllabusData = syllabusData.filter(s => s.id !== deleteTargetId);
            localStorage.setItem('syllabusData', JSON.stringify(syllabusData));
            
            // Clean modal
            const modalEl = document.getElementById('deleteModal');
            if (modalEl) {
                 const modal = new Modal(modalEl);
                 modal.hide();
            }
            document.body.classList.remove('overflow-hidden');
            document.querySelectorAll('[modal-backdrop]').forEach(bd => bd.remove());
            
            showToast('Syllabus deleted successfully', 'success');
            renderTable();
            deleteTargetId = null;
        }
    }


    // =============================
    // FORM VIEW LOGIC
    // =============================
    function setupFormView() {
        const form = document.getElementById('syllabus-form');
        const editingId = window.editingSyllabusId;

        if (editingId) {
            document.getElementById('page-title').innerText = 'Edit Syllabus';
            document.getElementById('page-subtitle').innerText = 'Modify existing syllabus entry.';
            
            if (existing) {
                document.getElementById('syllabus-title').value = existing.title;
                document.getElementById('syllabus-subject').value = existing.subject;
                const clsSelect = document.getElementById('syllabus-class');
                clsSelect.value = existing.class;
                document.getElementById('syllabus-desc').value = existing.description || '';
                
                // Trigger department logic
                const deptContainer = document.getElementById('syllabus-department-container');
                const deptSelect = document.getElementById('syllabus-department');
                if (existing.class.startsWith('SSS') && deptContainer) {
                    deptContainer.classList.remove('hidden');
                    if(deptSelect) deptSelect.value = existing.department || 'General';
                }
            }
        }

        const clsSelect = document.getElementById('syllabus-class');
        const deptContainer = document.getElementById('syllabus-department-container');
        const deptSelect = document.getElementById('syllabus-department');
        
        if (clsSelect && deptContainer) {
            clsSelect.addEventListener('change', (e) => {
                if (e.target.value.startsWith('SSS')) {
                    deptContainer.classList.remove('hidden');
                } else {
                    deptContainer.classList.add('hidden');
                    if (deptSelect) deptSelect.value = 'General';
                }
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('syllabus-title').value;
            const subject = document.getElementById('syllabus-subject').value;
            const cls = document.getElementById('syllabus-class').value;
            const desc = document.getElementById('syllabus-desc').value;
            const department = document.getElementById('syllabus-department') ? document.getElementById('syllabus-department').value : 'General';
            const fileInput = document.getElementById('syllabus-file');
            
            let fileName = 'No file attached';
            if (fileInput.files.length > 0) {
                fileName = fileInput.files[0].name;
            }

            if (editingId) {
                // Update
                const idx = syllabusData.findIndex(s => s.id === editingId);
                if (idx !== -1) {
                    syllabusData[idx].title = title;
                    syllabusData[idx].subject = subject;
                    syllabusData[idx].class = cls;
                    syllabusData[idx].department = department;
                    syllabusData[idx].description = desc;
                    // Mock file handling: if a new file is uploaded, use its name, otherwise keep old text
                    if(fileInput.files.length > 0) {
                        syllabusData[idx].file = fileName;
                    }
                }
                showToast('Syllabus updated successfully', 'success');
            } else {
                // Create
                const newEntry = {
                    id: 'SYL' + Date.now().toString().slice(-4),
                    title: title,
                    subject: subject,
                    class: cls,
                    department: department,
                    description: desc,
                    file: fileName
                };
                syllabusData.push(newEntry);
                showToast('Syllabus created successfully', 'success');
            }

            localStorage.setItem('syllabusData', JSON.stringify(syllabusData));
            window.editingSyllabusId = null; // Clear context
            window.loadSyllabusPage(); // Auto-redirect back to list
        });
    }

})();
