// ==========================================
// HUMAN RESOURCES MODULE LOGIC
// ==========================================

window.hrApp = window.hrApp || (function() {
    // --- State ---
    let currentModule = ''; // 'staff', 'add_staff', 'dept', 'desig', 'leave', 'payroll'
    let hrData = null;
    let filteredData = [];
    let currentPage = 1;
    let itemsPerPage = 8; // Default for grid view
    let currentView = 'grid'; // 'grid' | 'list'
    
    let modalInstance = null;
    let paymentModalInst = null;
    
    const API_URL = '../../data/hr-data.json';

    // --- Init ---
    async function init() {
        // Determine which page we are on based on URL or DOM elements
        if (document.getElementById('staff-container')) currentModule = 'staff';
        if (document.getElementById('add-staff-form')) currentModule = 'add_staff';
        if (document.getElementById('form-name')) currentModule = document.getElementById('form-dept') ? 'desig' : 'dept';
        if (document.getElementById('form-type')) currentModule = 'leave';
        if (document.getElementById('payroll-month-filter')) currentModule = 'payroll';

        if (!hrData) {
            try {
                const response = await fetch(API_URL);
                hrData = await response.json();
            } catch (error) {
                console.error('Error loading HR data:', error);
                // Fallbacks
                hrData = { departments: [], designations: [], leave_applications: [], payroll: [] };
            }
        }

        // Setup Modal
        const modalEl = document.getElementById('crudModal');
        if (modalEl && typeof Modal !== 'undefined') {
            modalInstance = new Modal(modalEl);
        }

        // Setup Event Listeners
        const searchInput = document.getElementById('hr-search');
        if (searchInput) searchInput.addEventListener('input', filterData);
        
        filterData();
        // Populate Dropsdowns for Add Staff
        if (currentModule === 'add_staff') {
            const deptSelect = document.getElementById('staff-dept');
            if (deptSelect && hrData.departments) {
                deptSelect.innerHTML = hrData.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
                // Pre-fill designation based on first dept
                updateAddStaffDesignations();
                deptSelect.addEventListener('change', updateAddStaffDesignations);
            }
        }
        
        // Populate Filters for Staff Directory
        if (currentModule === 'staff') {
            const deptFilter = document.getElementById('staff-dept-filter');
            const roleFilter = document.getElementById('staff-role-filter');
            if (deptFilter && hrData.departments) {
                 deptFilter.innerHTML = '<option value="">All Departments</option>' + hrData.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
            }
            if (roleFilter && hrData.designations) {
                 roleFilter.innerHTML = '<option value="">All Designations</option>' + hrData.designations.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
            }
        }
    }
    
    function updateAddStaffDesignations() {
        const deptName = document.getElementById('staff-dept').value;
        const desigSelect = document.getElementById('staff-designation');
        if (!desigSelect || !hrData.designations) return;
        
        const filteredDesigs = hrData.designations.filter(d => d.department === deptName);
        desigSelect.innerHTML = filteredDesigs.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    }

    // --- Core Logic ---
    function getModuleData() {
        if (!hrData) return [];
        switch(currentModule) {
            case 'staff': return hrData.staff || [];
            case 'dept': return hrData.departments || [];
            case 'desig': return hrData.designations || [];
            case 'leave': return hrData.leave_applications || [];
            case 'payroll': return hrData.payroll || [];
            default: return [];
        }
    }

    function filterData() {
        let data = getModuleData();
        const searchTerm = document.getElementById('hr-search')?.value.toLowerCase() || '';
        
        // Status Filters
        const leaveStatus = document.getElementById('leave-status-filter')?.value;
        const payrollStatus = document.getElementById('payroll-status-filter')?.value;
        const payrollMonth = document.getElementById('payroll-month-filter')?.value;
        const staffDept = document.getElementById('staff-dept-filter')?.value;
        const staffRole = document.getElementById('staff-role-filter')?.value;

        filteredData = data.filter(item => {
            // Text Search
            let matchSearch = true;
            if (searchTerm) {
                const searchStr = Object.values(item).join(' ').toLowerCase();
                matchSearch = searchStr.includes(searchTerm);
            }
            
            // Dropdown Filters
            let matchLeave = !leaveStatus || item.status === leaveStatus;
            let matchPayrollStatus = !payrollStatus || item.status === payrollStatus;
            let matchPayrollMonth = !payrollMonth || item.month === payrollMonth;
            
            let matchStaffDept = !staffDept || item.department === staffDept;
            let matchStaffRole = !staffRole || item.designation === staffRole;

            return matchSearch && matchLeave && matchPayrollStatus && matchPayrollMonth && matchStaffDept && matchStaffRole;
        });

        currentPage = 1;
        renderTable();
    }

    // --- Rendering ---
    function renderTable() {
        if (currentModule === 'staff') {
            renderStaffDirectory();
            return;
        }
        
        const tbody = document.getElementById('hr-table-body');
        if (!tbody) return;
        
        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No records found.</td></tr>`;
            renderPagination(0);
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredData.slice(startIndex, endIndex);

        let html = '';
        paginatedItems.forEach(item => {
            html += `<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">`;
            
            if (currentModule === 'dept') {
                html += `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.id}</td>
                    <td class="px-6 py-4">${item.name}</td>
                    <td class="px-6 py-4">${item.head}</td>
                    <td class="px-6 py-4 truncate max-w-xs">${item.description}</td>
                    <td class="px-6 py-4">${renderStatusBadge(item.status)}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="window.hrApp.editItem('${item.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline mr-3"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="window.hrApp.deleteItem('${item.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
            } else if (currentModule === 'desig') {
                 html += `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.id}</td>
                    <td class="px-6 py-4">${item.name}</td>
                    <td class="px-6 py-4">${item.department}</td>
                    <td class="px-6 py-4">${item.level}</td>
                    <td class="px-6 py-4">${renderStatusBadge(item.status)}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="window.hrApp.editItem('${item.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline mr-3"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="window.hrApp.deleteItem('${item.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
            } else if (currentModule === 'leave') {
                 html += `
                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-900 dark:text-white">${item.staff_name}</div>
                        <div class="text-xs text-gray-500">${item.staff_id}</div>
                    </td>
                    <td class="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">${item.leave_type}</td>
                    <td class="px-6 py-4">
                        <div>${new Date(item.start_date).toLocaleDateString()} - ${new Date(item.end_date).toLocaleDateString()}</div>
                        <div class="text-xs text-gray-500 mt-1">${item.days} Day(s)</div>
                    </td>
                    <td class="px-6 py-4 truncate max-w-xs" title="${item.reason}">${item.reason}</td>
                    <td class="px-6 py-4">${new Date(item.applied_on).toLocaleDateString()}</td>
                    <td class="px-6 py-4">${renderStatusBadge(item.status)}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="window.hrApp.editItem('${item.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline mr-2"><i class="fas fa-eye"></i> Rev</button>
                    </td>
                `;
            } else if (currentModule === 'payroll') {
                 html += `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.id}</td>
                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-900 dark:text-white">${item.staff_name}</div>
                        <div class="text-xs text-gray-500">${item.designation} (${item.staff_id})</div>
                    </td>
                    <td class="px-6 py-4">${item.month}</td>
                    <td class="px-6 py-4 text-xs">
                        <div class="text-green-600">Base: ₦${item.basic_salary.toLocaleString()}</div>
                        <div class="text-blue-600">+ Allow: ₦${item.allowances.toLocaleString()}</div>
                        <div class="text-red-600">- Ded: ₦${item.deductions.toLocaleString()}</div>
                    </td>
                    <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">₦${item.net_salary.toLocaleString()}</td>
                    <td class="px-6 py-4">${renderStatusBadge(item.status)}</td>
                    <td class="px-6 py-4 text-right">
                        ${item.status === 'Pending' ? `<button onclick="window.hrApp.openPaymentModal('${item.id}')" class="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3"><i class="fas fa-money-check-alt"></i> Pay</button>` : ''}
                        <button class="font-medium text-primary-600 dark:text-primary-500 hover:underline"><i class="fas fa-file-invoice"></i> PDF</button>
                    </td>
                `;
            }
            
            html += `</tr>`;
        });

        tbody.innerHTML = html;
        renderPagination(filteredData.length);
    }
    
    function toggleStaffView(viewType) {
        currentView = viewType;
        itemsPerPage = currentView === 'grid' ? 8 : 10;
        currentPage = 1;
        
        const btnGrid = document.getElementById('view-grid');
        const btnList = document.getElementById('view-list');
        
        if (currentView === 'grid') {
             btnGrid.classList.replace('text-gray-500', 'text-primary-600');
             btnGrid.classList.replace('hover:bg-gray-100', 'bg-primary-50');
             btnList.classList.replace('text-primary-600', 'text-gray-500');
             btnList.classList.replace('bg-primary-50', 'hover:bg-gray-100');
        } else {
             btnList.classList.replace('text-gray-500', 'text-primary-600');
             btnList.classList.replace('hover:bg-gray-100', 'bg-primary-50');
             btnGrid.classList.replace('text-primary-600', 'text-gray-500');
             btnGrid.classList.replace('bg-primary-50', 'hover:bg-gray-100');
        }
        
        renderStaffDirectory();
    }
    
    function renderStaffDirectory() {
        const container = document.getElementById('staff-container');
        if (!container) return;
        
        if (filteredData.length === 0) {
             container.innerHTML = `<div class="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">No staff records found.</div>`;
             renderPagination(0);
             return;
        }
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredData.slice(startIndex, endIndex);
        
        let html = '';
        
        if (currentView === 'grid') {
            html += `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">`;
            paginatedItems.forEach(staff => {
                 html += `
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 hover:border-primary-200 transition-all dark:border-gray-700 hover:shadow-md overflow-hidden text-center group">
                        <div class="p-6">
                            <div class="relative inline-block mb-4">
                                <img class="w-20 h-20 rounded-full mx-auto object-cover border-4 border-gray-50 dark:border-gray-700 group-hover:border-primary-100 transition-colors" src="${staff.avatar}" alt="${staff.first_name}">
                                <span class="absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${staff.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}"></span>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">${staff.first_name} ${staff.last_name}</h3>
                            <p class="text-sm text-primary-600 dark:text-primary-400 font-medium mb-1">${staff.designation}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4"><i class="fas fa-building mr-1"></i> ${staff.department}</p>
                            
                            <div class="flex justify-center gap-2 mb-4">
                                <a href="mailto:${staff.email}" class="w-8 h-8 rounded-full bg-gray-50 hover:bg-primary-50 cursor-pointer flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"><i class="fas fa-envelope text-sm"></i></a>
                                <a href="tel:${staff.phone}" class="w-8 h-8 rounded-full bg-gray-50 hover:bg-primary-50 cursor-pointer flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"><i class="fas fa-phone-alt text-sm"></i></a>
                            </div>
                            
                            <button onclick="window.hrApp.viewStaffDetail('${staff.id}')" class="w-full py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600">View Profile</button>
                        </div>
                    </div>
                 `;
            });
            html += `</div>`;
        } else {
             html += `<div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700"><table class="w-full text-sm text-left text-gray-500 dark:text-gray-400"><thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300"><tr><th class="px-6 py-3">Staff</th><th class="px-6 py-3">ID</th><th class="px-6 py-3">Department</th><th class="px-6 py-3">Designation</th><th class="px-6 py-3">Status</th><th class="px-6 py-3 text-right">Action</th></tr></thead><tbody>`;
             paginatedItems.forEach(staff => {
                 html += `
                    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class="px-6 py-4 flex items-center gap-3">
                             <img class="w-10 h-10 rounded-full" src="${staff.avatar}" alt="${staff.first_name}">
                             <div><div class="font-medium text-gray-900 dark:text-white">${staff.first_name} ${staff.last_name}</div><div class="text-xs">${staff.email}</div></div>
                        </td>
                        <td class="px-6 py-4 font-medium">${staff.id}</td>
                        <td class="px-6 py-4">${staff.department}</td>
                        <td class="px-6 py-4">${staff.designation}</td>
                        <td class="px-6 py-4">${renderStatusBadge(staff.status)}</td>
                        <td class="px-6 py-4 text-right">
                             <button onclick="window.hrApp.viewStaffDetail('${staff.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline"><i class="fas fa-eye"></i> View</button>
                        </td>
                    </tr>
                 `;
             });
             html += `</tbody></table></div>`;
        }
        
        container.innerHTML = html;
        renderPagination(filteredData.length);
    }

    function renderStatusBadge(status) {
        if (status === 'Active' || status === 'Approved' || status === 'Paid') {
            return `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">${status}</span>`;
        } else if (status === 'Pending') {
            return `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">${status}</span>`;
        } else {
            return `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">${status}</span>`;
        }
    }

    function renderPagination(totalItems) {
        const pagContainer = document.getElementById('hr-pagination');
        if (!pagContainer) return;

        if (totalItems === 0) {
            pagContainer.classList.add('hidden');
            return;
        }

        pagContainer.classList.remove('hidden');
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        let html = `
            <span class="text-sm text-gray-700 dark:text-gray-400">
                Showing <span class="font-semibold text-gray-900 dark:text-white">${startItem}</span> to <span class="font-semibold text-gray-900 dark:text-white">${endItem}</span> of <span class="font-semibold text-gray-900 dark:text-white">${totalItems}</span>
            </span>
            <div class="inline-flex mt-2 xs:mt-0 gap-2">
                <button ${currentPage === 1 ? 'disabled' : ''} onclick="window.hrApp.changePage(${currentPage - 1})" class="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    Prev
                </button>
                <button ${currentPage === totalPages ? 'disabled' : ''} onclick="window.hrApp.changePage(${currentPage + 1})" class="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                </button>
            </div>
        `;
        pagContainer.innerHTML = html;
    }

    // --- CRUD / Offcanvas Operations ---
    function viewStaffDetail(id) {
        const staff = hrData.staff.find(s => s.id === id);
        if (!staff) return;
        
        document.getElementById('detail-avatar').src = staff.avatar;
        document.getElementById('detail-name').textContent = `${staff.first_name} ${staff.last_name}`;
        document.getElementById('detail-designation').textContent = staff.designation;
        document.getElementById('detail-id').textContent = staff.id;
        document.getElementById('detail-gender').textContent = staff.gender;
        document.getElementById('detail-phone').textContent = staff.phone;
        document.getElementById('detail-email').textContent = staff.email;
        document.getElementById('detail-email').title = staff.email;
        document.getElementById('detail-emerg-name').textContent = staff.emergency_contact.split(' (')[0];
        document.getElementById('detail-emerg-phone').textContent = staff.emergency_contact.split('(')[1]?.replace(')','');
        
        document.getElementById('detail-dept').textContent = staff.department;
        document.getElementById('detail-joined').textContent = new Date(staff.joining_date).toLocaleDateString();
        document.getElementById('detail-status').innerHTML = renderStatusBadge(staff.status);
        
        document.getElementById('detail-bank').textContent = staff.bank_name;
        document.getElementById('detail-acct').textContent = '*'.repeat(6) + staff.account_number.slice(-4);
        
        // Use Modal object if exists, else fallback
        const modalEl = document.getElementById('staffDetailModal');
        if (modalEl && typeof Modal !== 'undefined') {
            if(!window.staffModalInst) window.staffModalInst = new Modal(modalEl);
            window.staffModalInst.show();
        } else if (modalEl) {
             modalEl.classList.remove('hidden');
             modalEl.classList.add('flex');
        }
    }
    
    function addStaff() {
         const btn = document.querySelector('#add-staff-form button[type="submit"]');
         if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
         
         setTimeout(() => {
              if (typeof window.showToast === 'function') {
                  window.showToast('success', 'Staff Member Added Successfully');
              } else {
                  alert("Staff added successfully!");
              }
              window.loadHRStaffDirectoryPage();
         }, 1000);
    }

    function fetchModal(idStr) {
         const el = document.getElementById(idStr);
         if (!el) return null;
         if (typeof Modal !== 'undefined') {
             return new Modal(el);
         }
         return {
             show: () => { el.classList.remove('hidden'); el.classList.add('flex'); },
             hide: () => { el.classList.add('hidden'); el.classList.remove('flex'); }
         };
    }

    function openModal() {
        document.getElementById('crud-form')?.reset();
        document.getElementById('form-id').value = '';
        if(document.getElementById('modal-title')) {
             if(currentModule === 'dept') document.getElementById('modal-title').textContent = 'Add Department';
             if(currentModule === 'desig') document.getElementById('modal-title').textContent = 'Add Designation';
             if(currentModule === 'leave') document.getElementById('modal-title').textContent = 'Record Leave';
        }
        
        if (!modalInstance) modalInstance = fetchModal('crudModal');
        if (modalInstance) modalInstance.show();
    }
    
    function closeModal() {
        if (!modalInstance) modalInstance = fetchModal('crudModal');
        if (modalInstance) modalInstance.hide();
    }
    
    // --- Payroll Payment Logic ---
    function openPaymentModal(paymentId) {
        const record = hrData.payroll.find(p => p.id === paymentId);
        if (!record) return;
        
        // Reset form first
        document.getElementById('payment-form').reset();
        
        // Populate hidden field
        document.getElementById('pay-record-id').value = record.id;
        
        // Transfer Summary
        document.getElementById('pay-amount').textContent = `₦${record.net_salary.toLocaleString()}`;
        document.getElementById('pay-month').textContent = record.month;
        document.getElementById('pay-staff-name').textContent = record.staff_name;
        document.getElementById('pay-designation').textContent = record.designation;
        
        // Bank Details — displayed as read-only in the modal
        document.getElementById('pay-bank-name').textContent = record.bank_name || 'N/A';
        document.getElementById('pay-acct-name').textContent = record.account_name || record.staff_name;
        // Show full account number (it's their salary — they must verify it)
        document.getElementById('pay-acct-num').textContent = record.account_number || 'N/A';
        
        if (!paymentModalInst) paymentModalInst = fetchModal('paymentModal');
        if (paymentModalInst) paymentModalInst.show();
    }
    
    function closePaymentModal() {
        if (!paymentModalInst) paymentModalInst = fetchModal('paymentModal');
        if (paymentModalInst) paymentModalInst.hide();
    }
    
    function confirmPayment() {
        const payId = document.getElementById('pay-record-id').value;
        const method = document.getElementById('pay-method').value;
        const ref = document.getElementById('pay-reference').value;
        
        if(!payId || !method || !ref) return;
        
        const record = hrData.payroll.find(p => p.id === payId);
        if (record) {
             record.status = 'Paid';
             record.payment_method = method;
             record.payment_ref = ref;
             record.paid_on = new Date().toISOString();
        }
        
        if (typeof window.showToast === 'function') {
             window.showToast('success', 'Payment processed successfully.');
        } else {
             alert('Payment processed successfully.');
        }
        
        closePaymentModal();
        filterData(); // Refresh table view to show Paid status
    }

    function editItem(id) {
        const item = getModuleData().find(i => i.id === id);
        if (!item) return;

        openModal();
        
        if(document.getElementById('modal-title')) {
             if(currentModule === 'dept') document.getElementById('modal-title').textContent = 'Edit Department';
             if(currentModule === 'desig') document.getElementById('modal-title').textContent = 'Edit Designation';
             if(currentModule === 'leave') document.getElementById('modal-title').textContent = 'Review Leave';
        }

        document.getElementById('form-id').value = item.id;
        
        if (currentModule === 'dept') {
            document.getElementById('form-name').value = item.name;
            document.getElementById('form-head').value = item.head;
            document.getElementById('form-desc').value = item.description;
            document.getElementById('form-status').value = item.status;
        } else if (currentModule === 'desig') {
            document.getElementById('form-name').value = item.name;
            document.getElementById('form-dept').value = item.department;
            document.getElementById('form-level').value = item.level;
            document.getElementById('form-status').value = item.status;
        } else if (currentModule === 'leave') {
            document.getElementById('form-staff').value = item.staff_name;
            document.getElementById('form-type').value = item.leave_type;
            document.getElementById('form-start').value = item.start_date;
            document.getElementById('form-end').value = item.end_date;
            document.getElementById('form-reason').value = item.reason;
            document.getElementById('form-status').value = item.status;
        }
    }

    function saveItem() {
        const id = document.getElementById('form-id').value;
        const listName = currentModule === 'dept' ? 'departments' : (currentModule === 'desig' ? 'designations' : 'leave_applications');
        let dataList = hrData[listName];
        
        const isNew = !id;
        let itemObj = isNew ? {} : dataList.find(i => i.id === id);

        if (currentModule === 'dept') {
            if(isNew) itemObj.id = 'DEPT' + Math.floor(Math.random()*1000).toString().padStart(3, '0');
            itemObj.name = document.getElementById('form-name').value;
            itemObj.head = document.getElementById('form-head').value;
            itemObj.description = document.getElementById('form-desc').value;
            itemObj.status = document.getElementById('form-status').value;
        } else if (currentModule === 'desig') {
            if(isNew) itemObj.id = 'DES' + Math.floor(Math.random()*1000).toString().padStart(3, '0');
            itemObj.name = document.getElementById('form-name').value;
            itemObj.department = document.getElementById('form-dept').value;
            itemObj.level = document.getElementById('form-level').value;
            itemObj.status = document.getElementById('form-status').value;
        } else if (currentModule === 'leave') {
            if(isNew) {
                itemObj.id = 'LV' + Math.floor(Math.random()*1000).toString().padStart(3, '0');
                itemObj.staff_id = 'TCHXXX'; // mock
                itemObj.days = 3; // mock calc
                itemObj.applied_on = new Date().toISOString().split('T')[0];
            }
            itemObj.staff_name = document.getElementById('form-staff').value;
            itemObj.leave_type = document.getElementById('form-type').value;
            itemObj.start_date = document.getElementById('form-start').value;
            itemObj.end_date = document.getElementById('form-end').value;
            itemObj.reason = document.getElementById('form-reason').value;
            itemObj.status = document.getElementById('form-status').value;
        }

        if (isNew) {
            dataList.push(itemObj);
        }

        closeModal();
        filterData(); // re-render
    }

    function deleteItem(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        
        const listName = currentModule === 'dept' ? 'departments' : (currentModule === 'desig' ? 'designations' : 'leave_applications');
        hrData[listName] = hrData[listName].filter(item => item.id !== id);
        
        filterData();
    }

    return {
        init,
        filterData,
        changePage: (page) => { currentPage = page; renderTable(); },
        toggleStaffView,
        viewStaffDetail,
        addStaff,
        openModal,
        closeModal,
        openPaymentModal,
        closePaymentModal,
        confirmPayment,
        editItem,
        saveItem,
        deleteItem
    };
})();

// Initialize on script load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.hrApp.init();
} else {
    document.addEventListener('DOMContentLoaded', () => window.hrApp.init());
}
