(function() {
    console.log('Student Attendance Script Loaded');
    
    // === Variables & Setup ===
    const dateInput = document.getElementById('attendance-date');
    const dateDisplay = document.getElementById('current-date-display');
    const form = document.getElementById('attendance-filter-form');
    const tableBody = document.getElementById('attendance-table-body');
    const container = document.getElementById('attendance-container');

    // Set Default Date
    const today = new Date().toISOString().split('T')[0];
    if(dateInput) dateInput.value = today;
    if(dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // === Fetch & Load Data ===
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted - loading students');
            
            // Show loading
            container.classList.remove('hidden');
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary-600"></i></td></tr>';

            // Simulate Network Delay
            setTimeout(() => {
                loadStudents();
            }, 600);
        });
    }

    function loadStudents() {
        const selectedClass = document.getElementById('class-select').value;
        const selectedSection = document.getElementById('section-select').value;

        console.log('Loading students for class:', selectedClass, 'section:', selectedSection);

        const checkDb = setInterval(() => {
            if(window.SchoolDatabase) {
                clearInterval(checkDb);
                const data = window.SchoolDatabase.students || [];
                console.log('Students data loaded:', data.length);
                let filtered = data;
                if(selectedClass) filtered = filtered.filter(s => s.class === selectedClass);
                if(selectedSection) filtered = filtered.filter(s => s.section === selectedSection);
                console.log('Filtered students:', filtered.length);
                renderRows(filtered);
            }
        }, 50);
    }
    function renderRows(items) {
        tableBody.innerHTML = '';
        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No students found for selection.</td></tr>';
            return;
        }

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.id = `student-row-${item.id}`;
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition-colors';
            
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.id}</td>
                <td class="px-6 py-4">
                    <img class="w-10 h-10 rounded-full object-cover" src="${item.photo}" alt="Avatar">
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.name}</td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center space-x-4">
                        <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Present" class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateRowColor('${item.id}', this.value)">
                            <span class="text-sm text-green-600 font-medium">P</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Absent" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateRowColor('${item.id}', this.value)">
                            <span class="text-sm text-red-600 font-medium">A</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Late" class="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateRowColor('${item.id}', this.value)">
                            <span class="text-sm text-yellow-600 font-medium">L</span>
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
    window.markAll = function(status) {
        const radios = document.querySelectorAll(`input[type="radio"][value="${status}"]`);
        radios.forEach(r => r.checked = true);
    };

    window.saveAttendance = function(print = false) {
        // Collect Data
        // For visual confirmation only
        const toast = document.getElementById('toast-attendance');
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
            if (print) {
                window.print();
            }
        }, 2000);
    }

    // === NFC & Biometric Integration ===
    let nfcConfig = null;
    let studentsData = [];

    function initAttendanceNFC() {
        const storedConfig = localStorage.getItem('sms_nfc_config');
        if (storedConfig) {
            try {
                const parsed = JSON.parse(storedConfig);
                nfcConfig = parsed.studentAttendance || { nfc: true, bio: true };
            } catch (e) {
                nfcConfig = { nfc: true, bio: true };
            }
        } else {
            nfcConfig = { nfc: true, bio: true };
        }
        
        const nfcBtn = document.getElementById('student-nfc-btn');
        
        if (nfcConfig && nfcConfig.nfc && nfcBtn) {
            nfcBtn.classList.remove('hidden');
            nfcBtn.classList.add('inline-flex');
        }
    }

    // Call init on script load
    initAttendanceNFC();

    let isAttScanning = false;
    window.startAttendanceNFC = function() {
        const btn = document.getElementById('student-nfc-btn');
        const icon = btn.querySelector('i');
        
        if (isAttScanning) {
            isAttScanning = false;
            btn.classList.remove('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
            btn.classList.add('bg-primary-100', 'text-primary-700', 'border-primary-200');
            icon.className = 'fas fa-wifi mr-2';
            btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Attendance';
            if (window.SmartScanner) window.SmartScanner.stop();
            return;
        }

        isAttScanning = true;
        btn.classList.add('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
        btn.classList.remove('bg-primary-100', 'text-primary-700', 'border-primary-200');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Scanning...';

        if (window.SmartScanner) {
            window.SmartScanner.start({
                requireBiometric: nfcConfig.bio,
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
        const container = document.getElementById('attendance-container');
        if (container) container.classList.remove('hidden');

        // Check if row already exists
        let row = document.getElementById(`student-row-${scannedId}`);
        
        // If row doesn't exist, try to load data and create it
        if (!row) {
            try {
                // Fetch student data if not loaded
                if (studentsData.length === 0) {
                    while(!window.SchoolDatabase) { await new Promise(r => setTimeout(r, 50)); }
                    studentsData = window.SchoolDatabase.students || [];
                }
                
                // Find student
                const student = studentsData.find(s => s.id === scannedId);
                if (student) {
                    const tableBody = document.getElementById('attendance-table-body');
                    const tr = document.createElement('tr');
                    tr.id = `student-row-${student.id}`;
                    tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition-colors';
                    
                    tr.innerHTML = `
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${student.id}</td>
                        <td class="px-6 py-4">
                            <img class="w-10 h-10 rounded-full object-cover" src="${student.photo}" alt="Avatar">
                        </td>
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${student.name}</td>
                        <td class="px-6 py-4 text-center">
                            <div class="flex items-center justify-center space-x-4">
                                <label class="cursor-pointer flex items-center space-x-1">
                                    <input type="radio" name="status-${student.id}" value="Present" class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateRowColor('${student.id}', this.value)">
                                    <span class="text-sm text-green-600 font-medium">P</span>
                                </label>
                                 <label class="cursor-pointer flex items-center space-x-1">
                                    <input type="radio" name="status-${student.id}" value="Absent" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateRowColor('${student.id}', this.value)">
                                    <span class="text-sm text-red-600 font-medium">A</span>
                                </label>
                                 <label class="cursor-pointer flex items-center space-x-1">
                                    <input type="radio" name="status-${student.id}" value="Late" class="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="window.updateRowColor('${student.id}', this.value)">
                                    <span class="text-sm text-yellow-600 font-medium">L</span>
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
                console.error("Error loading student data", error);
            }
        }

        if (row) {
            // Update the radio button or select
            const radioPresent = row.querySelector(`input[type="radio"][value="Present"]`);
            const selectDropdown = document.getElementById(`status-${scannedId}`);
            
            if (radioPresent) {
                radioPresent.checked = true;
                window.updateRowColor(scannedId, 'Present');
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
            alert(`Student ID ${scannedId} not found in database.`);
        }
    }

    // Dummy data functions for demo purposes (used when form submitted)
    window.loadDummyData = function() {
        studentsData = [
            { id: 'STU001', name: 'Ada Okafor', photo: '👧' },
            { id: 'STU002', name: 'Emeka Bello', photo: '👦' },
            { id: 'STU003', name: 'Chidi Adeleke', photo: '👦' },
            { id: 'STU004', name: 'Ngozi Eze', photo: '👧' },
            { id: 'STU005', name: 'Yemi Musa', photo: '👨' }
        ];
        
        tableBody.innerHTML = studentsData.map(s => `
            <tr id="student-row-${s.id}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <td class="px-6 py-4 font-mono text-xs font-bold">${s.id}</td>
                <td class="px-6 py-4 text-2xl">${s.photo}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${s.name}</td>
                <td class="px-6 py-4">
                    <select id="status-${s.id}" onchange="updateRowColor('${s.id}')" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="Select">-- Select --</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </td>
                <td class="px-6 py-4">
                    <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Optional remark">
                </td>
            </tr>
        `).join('');
    };

    window.updateRowColor = function(id, val) {
        const row = document.getElementById(`student-row-${id}`);
        if (!row) return;

        row.classList.remove('bg-green-50', 'dark:bg-green-900/20', 'bg-red-50', 'dark:bg-red-900/20', 'bg-yellow-50', 'dark:bg-yellow-900/20');
        
        if (val === 'Present') {
            row.classList.add('bg-green-50', 'dark:bg-green-900/20');
        } else if (val === 'Absent') {
            row.classList.add('bg-red-50', 'dark:bg-red-900/20');
        } else if (val === 'Late') {
            row.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');
        }
    };

})();
