// Global state for discipline module
let disciplineData = [];
let filteredDiscipline = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let sortColumn = 'date';
let sortDirection = 'desc';

// DOM Elements - List
const searchInput = document.getElementById('discipline-search');
const categoryFilter = document.getElementById('discipline-filter-category');
const statusFilter = document.getElementById('discipline-filter-status');
const tableBody = document.getElementById('discipline-table-body');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
let itemToDelete = null;

// Initialize the module
async function initDisciplineModule() {
    try {
        const response = await fetch('../../data/discipline-data.json');
        if (!response.ok) throw new Error('Failed to load discipline data');
        disciplineData = await response.json();
        
        // Form initialization if on add/edit page
        const form = document.getElementById('discipline-form');
        if (form) {
            initForm();
        } else {
            // List initialization
            filteredDiscipline = [...disciplineData];
            initFilters();
            setupSorting();
            renderTable();
        }
    } catch (error) {
        console.error('Error initializing discipline module:', error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Failed to load discipline records.</td></tr>`;
        }
    }
}

// ---------------------------------------------------
// List Page Functions
// ---------------------------------------------------

function initFilters() {
    if (!searchInput) return;

    const filterData = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const status = statusFilter.value;

        filteredDiscipline = disciplineData.filter(item => {
            const matchesSearch = item.student_name.toLowerCase().includes(searchTerm) || 
                                  item.student_id.toLowerCase().includes(searchTerm) ||
                                  item.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || item.category === category;
            const matchesStatus = !status || item.status === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        currentPage = 1;
        sortData();
        renderTable();
    };

    searchInput.addEventListener('input', filterData);
    categoryFilter.addEventListener('change', filterData);
    statusFilter.addEventListener('change', filterData);
}

function setupSorting() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }

            // Update icons
            document.querySelectorAll('th[data-sort] i').forEach(icon => {
                icon.className = 'fas fa-sort text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300';
            });
            const icon = th.querySelector('i');
            icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} text-primary-600 dark:text-primary-400`;

            sortData();
            renderTable();
        });
    });
}

function sortData() {
    filteredDiscipline.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (sortColumn === 'date') {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function renderTable() {
    if (!tableBody) return;

    if (filteredDiscipline.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center justify-center">
                        <i class="fas fa-gavel text-4xl mb-3 text-gray-300 dark:text-gray-600"></i>
                        <p>No discipline records found matching your criteria</p>
                    </div>
                </td>
            </tr>
        `;
        renderPagination(0, 0, 0);
        return;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredDiscipline.length);
    const paginatedData = filteredDiscipline.slice(startIndex, endIndex);

    tableBody.innerHTML = paginatedData.map(item => `
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                    ${new Date(item.date).toLocaleDateString()}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-white">${item.student_name}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${item.student_id}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                    ${item.category}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title="${item.action_taken || 'None'}">
                ${item.action_taken || '<span class="italic text-gray-400">None recorded</span>'}
            </td>
            <td class="px-6 py-4">
                <span class="px-2.5 py-1 text-xs font-medium rounded-full ${
                    item.status === 'Resolved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }">
                    ${item.status}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="editItem('${item.id}')" class="text-primary-600 hover:text-primary-900 dark:text-primary-500 dark:hover:text-primary-400 mr-3 transition-colors" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteItem('${item.id}')" class="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(startIndex + 1, endIndex, filteredDiscipline.length);
}

function renderPagination(start, end, total) {
    document.getElementById('showing-start').textContent = total === 0 ? 0 : start;
    document.getElementById('showing-end').textContent = end;
    document.getElementById('total-records').textContent = total;

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination-controls');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = `
        <li>
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <li>
                    <button onclick="changePage(${i})" class="flex items-center justify-center px-3 h-8 leading-tight ${
                        currentPage === i 
                        ? 'text-primary-600 border border-gray-300 bg-primary-50 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' 
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    }">${i}</button>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<li><span class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span></li>`;
        }
    }

    html += `
        <li>
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </li>
    `;

    paginationContainer.innerHTML = html;
}

window.changePage = (page) => {
    const totalPages = Math.ceil(filteredDiscipline.length / ITEMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
};

window.editItem = (id) => {
    if (typeof window.loadAddIncidentPage === 'function') {
        window.loadAddIncidentPage(id);
    } else {
        console.error('loadAddIncidentPage function not found');
    }
};

window.deleteItem = (id) => {
    itemToDelete = id;
    if (typeof toggleModal === 'function') {
        toggleModal('deleteModal');
    } else if (deleteModal) {
        deleteModal.classList.remove('hidden');
        deleteModal.classList.add('flex');
    }
};

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
        if (itemToDelete) {
            disciplineData = disciplineData.filter(item => item.id !== itemToDelete);
            
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            if (searchTerm) {
                 const inputEvent = new Event('input');
                 searchInput.dispatchEvent(inputEvent);
            } else {
                 filteredDiscipline = [...disciplineData];
                 renderTable();
            }

            if (typeof toggleModal === 'function') {
                toggleModal('deleteModal');
            } else if (deleteModal) {
                deleteModal.classList.add('hidden');
                deleteModal.classList.remove('flex');
            }
            // Add notification logic here if available
        }
    });
}


// ---------------------------------------------------
// Form Page Functions (Add/Edit Incident)
// ---------------------------------------------------

function initForm() {
    const form = document.getElementById('discipline-form');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    // Check if editing
    const editingId = window.editingIncidentId;
    if (editingId) {
        const itemToEdit = disciplineData.find(i => i.id === editingId);
        if (itemToEdit) {
            if (pageTitle) pageTitle.textContent = 'Edit Incident';
            if (pageSubtitle) pageSubtitle.textContent = 'Update details for this incident record.';
            
            document.getElementById('incident-student').value = `${itemToEdit.student_id} (${itemToEdit.student_name})`;
            document.getElementById('incident-date').value = itemToEdit.date;
            document.getElementById('incident-category').value = itemToEdit.category;
            document.getElementById('incident-desc').value = itemToEdit.description;
            document.getElementById('incident-action').value = itemToEdit.action_taken || '';
            document.getElementById('incident-status').value = itemToEdit.status;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Form submission simulation
        // In a real app, this would be an API call
        alert('Incident record saved successfully!');
        
        // Reset ID and go back to list
        window.editingIncidentId = null;
        if (typeof window.loadDisciplinePage === 'function') {
            window.loadDisciplinePage();
        }
    });

    // Clean up window.editingIncidentId on back button/cancel click
    const backBtn = document.querySelector('button[onclick="window.loadDisciplinePage()"]');
    if(backBtn) {
        backBtn.addEventListener('click', () => { window.editingIncidentId = null; });
    }
}

// Initialize when script loads
document.addEventListener('DOMContentLoaded', initDisciplineModule);
// Also initialize immediately in case script is loaded dynamically after DOMContentLoaded
initDisciplineModule();
