// Discipline Module - fully scoped to avoid re-declaration errors on dynamic reload
(function () {
    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------
    let disciplineData = [];
    let filteredDiscipline = [];
    let currentPage = 1;
    const ITEMS_PER_PAGE = 10;
    let sortColumn = 'date';
    let sortDirection = 'desc';
    let itemToDelete = null;
    let discNfcConfig = { nfc: true, bio: true };
    let isDiscScanning = false;

    // -----------------------------------------------------------------------
    // Boot — wait for SchoolDatabase then decide which page we're on
    // -----------------------------------------------------------------------
    async function boot() {
        // Robust wait: poll until window.SchoolDatabase is populated
        let attempts = 0;
        while (!window.SchoolDatabase && attempts < 100) {
            await new Promise(r => setTimeout(r, 50));
            attempts++;
        }

        if (!window.SchoolDatabase) {
            const tb = document.getElementById('discipline-table-body');
            if (tb) tb.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-500 font-semibold">Database not found. Please refresh.</td></tr>`;
            return;
        }

        disciplineData = window.SchoolDatabase.discipline || [];

        const form = document.getElementById('discipline-form');
        if (form) {
            // ---- Add / Edit Incident page ----
            initForm();
            initNFC();
        } else {
            // ---- Discipline List page ----
            filteredDiscipline = [...disciplineData];
            initFilters();
            setupSorting();
            renderTable();
            initNFC();
        }
    }

    // Run immediately (script is injected dynamically after DOMContentLoaded)
    boot();

    // -----------------------------------------------------------------------
    // List Page — Filters
    // -----------------------------------------------------------------------
    function initFilters() {
        const searchInput   = document.getElementById('discipline-search');
        const categoryFilter = document.getElementById('discipline-filter-category');
        const statusFilter  = document.getElementById('discipline-filter-status');
        if (!searchInput) return;

        const filterData = () => {
            const term     = searchInput.value.toLowerCase();
            const category = categoryFilter ? categoryFilter.value : '';
            const status   = statusFilter   ? statusFilter.value   : '';

            filteredDiscipline = disciplineData.filter(item => {
                const matchSearch   = item.student_name.toLowerCase().includes(term) ||
                                      item.student_id.toLowerCase().includes(term)   ||
                                      item.description.toLowerCase().includes(term);
                const matchCategory = !category || item.category === category;
                const matchStatus   = !status   || item.status   === status;
                return matchSearch && matchCategory && matchStatus;
            });
            currentPage = 1;
            sortData();
            renderTable();
        };

        searchInput.addEventListener('input', filterData);
        if (categoryFilter) categoryFilter.addEventListener('change', filterData);
        if (statusFilter)   statusFilter.addEventListener('change', filterData);
    }

    // -----------------------------------------------------------------------
    // List Page — Sorting
    // -----------------------------------------------------------------------
    function setupSorting() {
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.sort;
                sortDirection = (sortColumn === col && sortDirection === 'asc') ? 'desc' : 'asc';
                sortColumn = col;

                document.querySelectorAll('th[data-sort] i').forEach(icon => {
                    icon.className = 'fas fa-sort text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300';
                });
                const icon = th.querySelector('i');
                if (icon) icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} text-primary-600`;

                sortData();
                renderTable();
            });
        });
    }

    function sortData() {
        filteredDiscipline.sort((a, b) => {
            let A = a[sortColumn], B = b[sortColumn];
            if (sortColumn === 'date') { A = new Date(A); B = new Date(B); }
            if (A < B) return sortDirection === 'asc' ? -1 : 1;
            if (A > B) return sortDirection === 'asc' ?  1 : -1;
            return 0;
        });
    }

    // -----------------------------------------------------------------------
    // List Page — Table render
    // -----------------------------------------------------------------------
    function renderTable() {
        const tableBody = document.getElementById('discipline-table-body');
        if (!tableBody) return;

        if (filteredDiscipline.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                        <div class="flex flex-col items-center gap-2">
                            <i class="fas fa-gavel text-4xl text-gray-300 dark:text-gray-600"></i>
                            <p>No discipline records found.</p>
                        </div>
                    </td>
                </tr>`;
            renderPagination(0, 0, 0);
            return;
        }

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end   = Math.min(start + ITEMS_PER_PAGE, filteredDiscipline.length);
        const page  = filteredDiscipline.slice(start, end);

        tableBody.innerHTML = page.map(item => `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${new Date(item.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900 dark:text-white">${item.student_name}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${item.student_id}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${item.category}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title="${item.action_taken || ''}">
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
                    <button onclick="window.editDisciplineItem('${item.id}')" class="text-primary-600 hover:text-primary-900 dark:text-primary-500 mr-3" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="window.deleteDisciplineItem('${item.id}')" class="text-red-600 hover:text-red-900 dark:text-red-500" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        renderPagination(start + 1, end, filteredDiscipline.length);
    }

    function renderPagination(start, end, total) {
        const startEl = document.getElementById('showing-start');
        const endEl   = document.getElementById('showing-end');
        const totalEl = document.getElementById('total-records');
        const ctrl    = document.getElementById('pagination-controls');

        if (startEl) startEl.textContent = total === 0 ? 0 : start;
        if (endEl)   endEl.textContent   = end;
        if (totalEl) totalEl.textContent = total;
        if (!ctrl)   return;

        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        if (totalPages <= 1) { ctrl.innerHTML = ''; return; }

        let html = `<li><button onclick="window.disciplineChangePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}
            class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 disabled:opacity-50">Prev</button></li>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<li><button onclick="window.disciplineChangePage(${i})"
                    class="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === i ? 'bg-primary-50 text-primary-600 font-bold' : 'bg-white text-gray-500 hover:bg-gray-100'}">${i}</button></li>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<li><span class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>`;
            }
        }

        html += `<li><button onclick="window.disciplineChangePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 disabled:opacity-50">Next</button></li>`;

        ctrl.innerHTML = html;
    }

    window.disciplineChangePage = (page) => {
        const totalPages = Math.ceil(filteredDiscipline.length / ITEMS_PER_PAGE);
        if (page >= 1 && page <= totalPages) { currentPage = page; renderTable(); }
    };

    window.editDisciplineItem = (id) => {
        if (typeof window.loadAddIncidentPage === 'function') window.loadAddIncidentPage(id);
    };

    window.deleteDisciplineItem = (id) => {
        itemToDelete = id;
        const modal = document.getElementById('deleteModal');
        if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    };

    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!itemToDelete) return;
            disciplineData    = disciplineData.filter(i => i.id !== itemToDelete);
            filteredDiscipline = filteredDiscipline.filter(i => i.id !== itemToDelete);
            itemToDelete = null;
            renderTable();
            const modal = document.getElementById('deleteModal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
        });
    }

    // -----------------------------------------------------------------------
    // Add / Edit Incident Page — Form
    // -----------------------------------------------------------------------
    function initForm() {
        const form      = document.getElementById('discipline-form');
        const editingId = window.editingIncidentId;

        if (editingId) {
            const rec = disciplineData.find(i => i.id === editingId);
            if (rec) {
                const t = (id) => document.getElementById(id);
                if (t('page-title'))      t('page-title').textContent    = 'Edit Incident';
                if (t('incident-student')) t('incident-student').value   = `${rec.student_id} (${rec.student_name})`;
                if (t('incident-date'))   t('incident-date').value       = rec.date;
                if (t('incident-category')) t('incident-category').value = rec.category;
                if (t('incident-desc'))   t('incident-desc').value       = rec.description;
                if (t('incident-action')) t('incident-action').value     = rec.action_taken || '';
                if (t('incident-status')) t('incident-status').value     = rec.status;
            }
        }

        // Pre-fill if coming from NFC scan on the list page
        if (window.pendingIncidentScannedId) {
            const inp = document.getElementById('incident-student');
            if (inp) inp.value = window.pendingIncidentScannedId;
            window.pendingIncidentScannedId = null;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Incident record saved successfully!');
            window.editingIncidentId = null;
            if (typeof window.loadDisciplinePage === 'function') window.loadDisciplinePage();
        });
    }

    // -----------------------------------------------------------------------
    // NFC Integration
    // -----------------------------------------------------------------------
    function initNFC() {
        // Read config
        try {
            const raw = localStorage.getItem('sms_nfc_config');
            discNfcConfig = raw ? (JSON.parse(raw).discipline || { nfc: true, bio: true }) : { nfc: true, bio: true };
        } catch (e) {
            discNfcConfig = { nfc: true, bio: true };
        }

        const bothOff = !discNfcConfig.nfc && !discNfcConfig.bio;

        // Show header button (always shown on list page)
        const headerBtn = document.getElementById('discipline-nfc-btn-header');
        if (headerBtn) {
            headerBtn.classList.remove('hidden');
            headerBtn.classList.add('inline-flex');
            headerBtn.disabled = bothOff;
            if (bothOff) { headerBtn.classList.add('opacity-50', 'cursor-not-allowed'); headerBtn.title = 'NFC & Biometric both disabled in settings'; }
            else         { headerBtn.classList.remove('opacity-50', 'cursor-not-allowed'); headerBtn.title = ''; }
        }

        // Show inline button on form page
        const nfcBtn      = document.getElementById('discipline-nfc-btn');
        const studentInput = document.getElementById('incident-student');
        if (nfcBtn) {
            nfcBtn.classList.remove('hidden');
            nfcBtn.classList.add('flex');
            nfcBtn.disabled = bothOff;
            if (bothOff) { nfcBtn.classList.add('opacity-50', 'cursor-not-allowed'); nfcBtn.title = 'NFC & Biometric both disabled in settings'; }
            else         { nfcBtn.classList.remove('opacity-50', 'cursor-not-allowed'); nfcBtn.title = ''; }
            if (studentInput) {
                studentInput.classList.remove('rounded-lg');
                studentInput.classList.add('rounded-l-lg', 'rounded-r-none');
            }
        }
    }

    // ---- Header NFC button (on list page) ----
    window.startDisciplineNFCHeader = function () {
        const btn = document.getElementById('discipline-nfc-btn-header');

        if (isDiscScanning) {
            isDiscScanning = false;
            if (btn) { btn.classList.remove('animate-pulse'); btn.innerHTML = '<i class="fas fa-wifi"></i> Scan Student'; }
            if (window.SmartScanner) window.SmartScanner.stop();
            return;
        }

        if (!window.SmartScanner) { alert('Scanner service not loaded. Please refresh.'); return; }

        isDiscScanning = true;
        if (btn) { btn.classList.add('animate-pulse'); btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...'; }

        window.SmartScanner.start({
            requireNFC: discNfcConfig.nfc,
            requireBiometric: discNfcConfig.bio,
            onSuccess: (scannedId) => {
                isDiscScanning = false;
                if (btn) { btn.classList.remove('animate-pulse'); btn.innerHTML = '<i class="fas fa-wifi"></i> Scan Student'; }

                // Resolve name
                let displayName = scannedId;
                try {
                    const students = window.SchoolDatabase?.students || [];
                    const student  = students.find(s => s.id === scannedId);
                    if (student) displayName = `${scannedId} - ${student.name}`;
                } catch (e) {}

                // Navigate to add incident page and pre-fill
                window.pendingIncidentScannedId = displayName;
                if (typeof window.loadAddIncidentPage === 'function') window.loadAddIncidentPage();
            },
            onFail: () => {
                isDiscScanning = false;
                if (btn) { btn.classList.remove('animate-pulse'); btn.innerHTML = '<i class="fas fa-wifi"></i> Scan Student'; }
            }
        });
    };

    // ---- Inline NFC button (on add-incident form page) ----
    window.startDisciplineNFC = function () {
        const btn = document.getElementById('discipline-nfc-btn');

        if (isDiscScanning) {
            isDiscScanning = false;
            if (btn) { btn.classList.remove('animate-pulse'); btn.innerHTML = '<i class="fas fa-wifi mr-1"></i> Scan'; }
            if (window.SmartScanner) window.SmartScanner.stop();
            return;
        }

        if (!window.SmartScanner) { alert('Scanner service not loaded. Please refresh.'); return; }

        isDiscScanning = true;
        if (btn) { btn.classList.add('animate-pulse'); btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Wait'; }

        window.SmartScanner.start({
            requireNFC: discNfcConfig.nfc,
            requireBiometric: discNfcConfig.bio,
            onSuccess: (scannedId) => {
                isDiscScanning = false;
                if (btn) { btn.classList.remove('animate-pulse'); btn.innerHTML = '<i class="fas fa-wifi mr-1"></i> Scan'; }

                let displayName = scannedId;
                try {
                    const students = window.SchoolDatabase?.students || [];
                    const student  = students.find(s => s.id === scannedId);
                    if (student) displayName = `${scannedId} - ${student.name}`;
                } catch (e) {}

                const inp = document.getElementById('incident-student');
                if (inp) inp.value = displayName;
            },
            onFail: () => {
                isDiscScanning = false;
                if (btn) { btn.classList.remove('animate-pulse'); btn.innerHTML = '<i class="fas fa-wifi mr-1"></i> Scan'; }
            }
        });
    };

})();
