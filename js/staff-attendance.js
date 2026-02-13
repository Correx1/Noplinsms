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

        // Path adjusted for pages/admin/attendance/ level
        fetch('../../../data/teachers-data.json')
            .then(res => res.json())
            .then(data => {
                console.log('Staff data loaded:', data.length);
                // Filter Logic
                let filtered = data;
                if(selectedDept) {
                    // For now, we don't have department field in teachers-data.json
                    // So we'll just load all staff regardless of filter
                    // You can add department filtering later when the data structure supports it
                }
                
                console.log('Filtered staff:', filtered.length);
                renderRows(filtered);
            })
            .catch(err => console.error('Error loading staff:', err));
    }

    function renderRows(items) {
        tableBody.innerHTML = '';
        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">No staff found for selection.</td></tr>';
            return;
        }

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600';
            
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
                            <input type="radio" name="status-${item.id}" value="Present" class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                            <span class="text-sm text-green-600 font-medium">P</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Absent" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                            <span class="text-sm text-red-600 font-medium">A</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Late" class="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                            <span class="text-sm text-yellow-600 font-medium">L</span>
                        </label>
                         <label class="cursor-pointer flex items-center space-x-1">
                            <input type="radio" name="status-${item.id}" value="Leave" class="w-4 h-4 text-purple-500 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
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

})();
