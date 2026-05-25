(function() {
    console.log('Staff Attendance Script Loaded');
    
    // === Variables & Setup ===
    const dateInput = document.getElementById('staff-att-date');
    const dateDisplay = document.getElementById('current-date-display');
    const form = document.getElementById('staff-attendance-filter-form');
    const tableBody = document.getElementById('staff-table-body');
    const container = document.getElementById('staff-attendance-container');

    // Set Default Date
    const today = new Date().toISOString().split('T')[0];
    if(dateInput) dateInput.value = today;
    if(dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // === Fetch & Load Data ===
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted - loading staff');
            
            // Show loading
            container.classList.remove('hidden');
            tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary-600"></i></td></tr>';

            // Simulate Network Delay
            setTimeout(() => {
                loadStaff();
            }, 600);
        });
    }

    function loadStaff() {
        const selectedDept = document.getElementById('staff-att-dept').value;

        console.log('Loading staff for department:', selectedDept);

        const checkDb = setInterval(() => {
            if(window.SchoolDatabase) {
                clearInterval(checkDb);
                const data = window.SchoolDatabase.staff || [];
                console.log('Staff data loaded:', data.length);
                let filtered = data;
                if(selectedDept) {
                    // For now, we don't have department field in teachers-data.json
                    // So we'll just load all staff regardless of filter
                }
                
                console.log('Filtered staff:', filtered.length);
                renderRows(filtered);
            }
        }, 50);
    }

    function renderRows(items) {
        tableBody.innerHTML = '';
        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">No staff found for selection.</td></tr>';
            return;
        }

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.id = `staff-row-${item.id}`;
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition-colors';
            
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.id}</td>
                <td class="px-6 py-4">
                    <img class="w-10 h-10 rounded-full object-cover" src="${item.photo}" alt="Avatar">
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.name}</td>
                <td class="px-6 py-4 text-gray-500 dark:text-gray-400">${item.subject || 'N/A'}</td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center space-x-3">
                        <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Present" class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${item.id}', this.value)">
                            <span class="text-sm text-green-600 font-medium">P</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Absent" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${item.id}', this.value)">
                            <span class="text-sm text-red-600 font-medium">A</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Late" class="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${item.id}', this.value)">
                            <span class="text-sm text-yellow-600 font-medium">L</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Leave" class="w-4 h-4 text-purple-500 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${item.id}', this.value)">
                            <span class="text-sm text-purple-600 font-medium">Lv</span>
                        </label>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Remarks...">
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // === Global Actions ===
    window.markAllStaff = function(status) {
        const radios = document.querySelectorAll(`input[type="radio"][value="${status}"]`);
        radios.forEach(r => r.checked = true);
    };

    window.copyYesterdayStaff = function() {
        // Placeholder for copying yesterday's attendance
        alert('Copy Yesterday feature - to be implemented with backend');
    };

    window.saveStaffAttendance = function(print = false) {
        // Collect Data
        // For visual confirmation only
        const toast = document.getElementById('toast-staff-attendance');
        if(toast) {
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
                if (print) {
                    window.print();
                }
            }, 2000);
        }
    }

    // === NFC & Biometric Integration ===
    let nfcConfig = null;
    let staffData = [];
    let isStaffScanning = false;

    function initStaffAttendanceNFC() {
        const storedConfig = localStorage.getItem('sms_nfc_config');
        if (storedConfig) {
            try {
                const parsed = JSON.parse(storedConfig);
                staffNfcConfig = parsed.staffAttendance || { nfc: true, bio: true };
            } catch (e) {
                staffNfcConfig = { nfc: true, bio: true };
            }
        } else {
            staffNfcConfig = { nfc: true, bio: true };
        }
        
        const nfcBtn = document.getElementById('staff-nfc-btn');
        
        if (staffNfcConfig && staffNfcConfig.nfc && nfcBtn) {
            nfcBtn.classList.remove('hidden');
            nfcBtn.classList.add('inline-flex');
        }
    }

    // Call init on script load
    initStaffAttendanceNFC();

    window.startStaffNFC = function() {
        const btn = document.getElementById('staff-nfc-btn');
        const icon = btn.querySelector('i');
        
        if (isStaffScanning) {
            isStaffScanning = false;
            btn.classList.remove('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
            btn.classList.add('bg-primary-100', 'text-primary-700', 'border-primary-200');
            icon.className = 'fas fa-wifi mr-2';
            btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Attendance';
            if (window.SmartScanner) window.SmartScanner.stop();
            return;
        }

        isStaffScanning = true;
        btn.classList.add('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
        btn.classList.remove('bg-primary-100', 'text-primary-700', 'border-primary-200');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Scanning...';

        if (window.SmartScanner) {
            window.SmartScanner.start({
                requireBiometric: staffNfcConfig.bio,
                onSuccess: (scannedId) => {
                    handleSuccessfulScan(scannedId);
                },
                onFail: (reason) => {
                    console.error('Scan failed:', reason);
                }
            });
        }
    };

    async function handleSuccessfulScan(scannedId) {
        // Ensure container is visible
        const container = document.getElementById('staff-attendance-container');
        if (container) container.classList.remove('hidden');

        // Find the staff row
        let row = document.getElementById(`staff-row-${scannedId}`);
        
        // If row doesn't exist, try to load data and create it
        if (!row) {
            try {
                // Fetch staff data if not loaded
                if (staffData.length === 0) {
                    while(!window.SchoolDatabase) { await new Promise(r => setTimeout(r, 50)); }
                    staffData = window.SchoolDatabase.staff || [];
                }
                
                // Find staff
                const staff = staffData.find(s => s.id === scannedId);
                if (staff) {
                    const tableBody = document.getElementById('staff-attendance-table-body');
                    const tr = document.createElement('tr');
                    tr.id = `staff-row-${staff.id}`;
                    tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition-colors';
                    
                    tr.innerHTML = `
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${staff.id}</td>
                        <td class="px-6 py-4">
                            <img class="w-10 h-10 rounded-full object-cover" src="${staff.photo}" alt="Avatar">
                        </td>
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${staff.name}</td>
                        <td class="px-6 py-4 text-gray-500 dark:text-gray-400">${staff.subject || 'N/A'}</td>
                        <td class="px-6 py-4 text-center">
                            <div class="flex items-center justify-center space-x-3">
                                <label class="cursor-pointer flex items-center space-x-1">
                                    <input type="radio" name="status-${staff.id}" value="Present" class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${staff.id}', this.value)">
                                    <span class="text-sm text-green-600 font-medium">P</span>
                                </label>
                                 <label class="cursor-pointer flex items-center space-x-1">
                                    <input type="radio" name="status-${staff.id}" value="Absent" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${staff.id}', this.value)">
                                    <span class="text-sm text-red-600 font-medium">A</span>
                                </label>
                                 <label class="cursor-pointer flex items-center space-x-1">
                                    <input type="radio" name="status-${staff.id}" value="Late" class="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${staff.id}', this.value)">
                                    <span class="text-sm text-yellow-600 font-medium">L</span>
                                </label>
                                 <label class="cursor-pointer flex items-center space-x-1">
                                    <input type="radio" name="status-${staff.id}" value="Leave" class="w-4 h-4 text-purple-500 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateStaffRowColor('${staff.id}', this.value)">
                                    <span class="text-sm text-purple-600 font-medium">Lv</span>
                                </label>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Remarks...">
                        </td>
                    `;
                    // Prepend to top
                    tableBody.insertBefore(tr, tableBody.firstChild);
                    row = tr;
                }
            } catch (error) {
                console.error("Error loading staff data", error);
            }
        }

        if (row) {
            // Update the select dropdown (or radio)
            const radioPresent = row.querySelector(`input[type="radio"][value="Present"]`);
            const selectDropdown = document.getElementById(`status-staff-${scannedId}`);
            
            if (radioPresent) {
                radioPresent.checked = true;
                window.updateStaffRowColor(scannedId, 'Present');
            } else if (selectDropdown) {
                selectDropdown.value = 'Present';
                selectDropdown.dispatchEvent(new Event('change'));
            }
            
            // Visual highlight animation
            row.classList.add('bg-green-50', 'dark:bg-green-900/20');
            setTimeout(() => {
                row.classList.remove('bg-green-50', 'dark:bg-green-900/20');
            }, 1500);

            // Automatically scroll to the row
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert(`Staff ID ${scannedId} not found in database.`);
        }
    }

    // Dummy data functions for demo purposes (used when form submitted)
    window.loadDummyStaffData = function() {
        staffData = [
            { id: 'STF001', name: 'Dr. John Doe', dept: 'Science', photo: '👨‍🏫' },
            { id: 'STF002', name: 'Mrs. Jane Smith', dept: 'Arts', photo: '👩‍🏫' },
            { id: 'STF003', name: 'Mr. Robert Johnson', dept: 'Mathematics', photo: '👨‍🏫' }
        ];
        
        tableBody.innerHTML = staffData.map(s => `
            <tr id="staff-row-${s.id}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <td class="px-6 py-4 font-mono text-xs font-bold">${s.id}</td>
                <td class="px-6 py-4 text-2xl">${s.photo}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${s.name}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${s.dept}</td>
                <td class="px-6 py-4">
                    <select id="status-staff-${s.id}" onchange="updateStaffRowColor('${s.id}')" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="Select">-- Select --</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Leave">On Leave</option>
                    </select>
                </td>
                <td class="px-6 py-4">
                    <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Optional remark">
                </td>
            </tr>
        `).join('');
    };

    window.updateStaffRowColor = function(id, val) {
        const select = document.getElementById(`status-staff-${id}`);
        const row = document.getElementById(`staff-row-${id}`);
        if (!row) return;

        // Reset
        row.classList.remove('bg-green-50', 'bg-red-50', 'bg-yellow-50', 'bg-purple-50', 'dark:bg-green-900/10', 'dark:bg-red-900/10', 'dark:bg-yellow-900/10', 'dark:bg-purple-900/10');
        
        let statusValue = val;
        if (select) statusValue = select.value;
        
        if (statusValue === 'Present') row.classList.add('bg-green-50', 'dark:bg-green-900/10');
        else if (statusValue === 'Absent') row.classList.add('bg-red-50', 'dark:bg-red-900/10');
        else if (statusValue === 'Late') row.classList.add('bg-yellow-50', 'dark:bg-yellow-900/10');
        else if (statusValue === 'Leave') row.classList.add('bg-purple-50', 'dark:bg-purple-900/10');
    };

})();
