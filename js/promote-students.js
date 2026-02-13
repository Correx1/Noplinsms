// Promote Students Logic
(function() {
    console.log('Promote Script Loaded');

    // DOM Elements
    const fromClassSelect = document.getElementById('promote-from-class');
    const toClassSelect = document.getElementById('promote-to-class');
    const loadBtn = document.getElementById('btn-load-promotion-list');
    const promotionArea = document.getElementById('promotion-area');
    const tableBody = document.getElementById('promotion-table-body');
    const selectAllCheckbox = document.getElementById('checkbox-all-promotions');
    
    // Preview Modal Elements
    const previewBtn = document.getElementById('btn-preview-promotion');
    const finalizeBtn = document.getElementById('btn-finalize-promotion');
    const previewModalEl = document.getElementById('preview-promotion-modal');
    
    // State
    let classesData = [];
    let currentStudents = [];
    let previewModal;

    // Initialization
    if (fromClassSelect && toClassSelect) {
        initPromotionPage();
    }

    async function initPromotionPage() {
        // Init Modal
        if (typeof Modal !== 'undefined') {
            previewModal = new Modal(previewModalEl);
        }

        // Fetch Classes
        try {
            const res = await fetch('../../data/classes-data.json');
            classesData = await res.json();
            populateClassDropdowns();
        } catch (e) { console.error(e); }

        // Event Listeners
        loadBtn.addEventListener('click', loadStudentsForPromotion);
        selectAllCheckbox.addEventListener('change', toggleAllCheckboxes);
        
        document.getElementById('btn-bulk-promote').addEventListener('click', () => bulkSetStatus('Promote'));
        document.getElementById('btn-bulk-hold').addEventListener('click', () => bulkSetStatus('Hold'));
        
        previewBtn.addEventListener('click', showPreview);
        finalizeBtn.addEventListener('click', finalizePromotion);
    }

    function populateClassDropdowns() {
        const populate = (sel) => {
            sel.innerHTML = '<option value="">Select Class</option>';
            classesData.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name; // Using name as ID logic for now
                opt.textContent = c.name;
                sel.appendChild(opt);
            });
        };
        populate(fromClassSelect);
        populate(toClassSelect);
    }

    async function loadStudentsForPromotion() {
        const fromClass = fromClassSelect.value;
        const toClass = toClassSelect.value;
        const toSession = document.getElementById('new-session').value;

        if (!fromClass || !toClass) {
            alert('Please select both From Class and To Class.');
            return;
        }

        promotionArea.classList.remove('hidden');
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading...</td></tr>';

        // Fetch Students (Mock filter)
        try {
             const res = await fetch('../../data/students-data.json');
             const allStudents = await res.json();
             
             // Filter loosely for demo (In real app, filter strictly by class ID)
             // Using 'includes' for SS3 vs SS 3 mismatch handling
             currentStudents = allStudents.filter(s => s.class && fromClass.includes(s.class) || s.class === fromClass);
             
             // If local mock data mismatch, just take first 5 for demo
             if (currentStudents.length === 0) currentStudents = allStudents.slice(0, 5);

             renderPromotionTable(toClass);
        } catch (e) {
            console.error(e);
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-500">Error loading students</td></tr>';
        }
    }

    function renderPromotionTable(targetClassName) {
        tableBody.innerHTML = '';
        
        // Find target class object for section dropdowns
        const targetClassObj = classesData.find(c => c.name === targetClassName) || { sections: [{name: 'A'}] };

        currentStudents.forEach((student, index) => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            
            // Auto-calculate new roll
            const nextRoll = (parseInt(student.roll) || 0) + 1; // Dummy logic

            tr.innerHTML = `
                <td class="w-4 p-4">
                    <div class="flex items-center">
                        <input type="checkbox" class="promote-checkbox w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    </div>
                </td>
                <td class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <img class="w-10 h-10 rounded-full" src="${student.photo}" alt="${student.name}">
                    <div class="ps-3">
                        <div class="text-base font-semibold">${student.name}</div>
                        <div class="font-normal text-gray-500">${student.id}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium">${student.class} - ${student.section}</div>
                    <div class="text-xs text-gray-500">Roll: ${student.roll}</div>
                </td>
                <td class="px-6 py-4">
                    <select class="status-select bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="Promote" selected>Promote</option>
                        <option value="Hold" class="text-yellow-600">Hold / Repeat</option>
                        <option value="Transfer" class="text-red-600">Transfer Out</option>
                    </select>
                </td>
                <td class="px-6 py-4">
                    <div class="grid grid-cols-2 gap-2">
                        <select class="new-section-select bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                             ${targetClassObj.sections.map(s => `<option value="${s.name}" ${s.name === student.section ? 'selected' : ''}>Sec ${s.name}</option>`).join('')}
                        </select>
                        <input type="text" value="${student.roll}" class="new-roll-input bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Roll No">
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function toggleAllCheckboxes(e) {
        document.querySelectorAll('.promote-checkbox').forEach(cb => cb.checked = e.target.checked);
    }

    function bulkSetStatus(status) {
        document.querySelectorAll('tr').forEach(row => {
            const cb = row.querySelector('.promote-checkbox');
            if (cb && cb.checked) {
                const select = row.querySelector('.status-select');
                if (select) select.value = status;
            }
        });
    }

    function showPreview() {
        let promote = 0, hold = 0, transfer = 0;
        
        document.querySelectorAll('.status-select').forEach(sel => {
            if (sel.value === 'Promote') promote++;
            if (sel.value === 'Hold') hold++;
            if (sel.value === 'Transfer') transfer++;
        });

        document.getElementById('summary-promote-count').textContent = promote;
        document.getElementById('summary-hold-count').textContent = hold;
        document.getElementById('summary-transfer-count').textContent = transfer;

        if (previewModal) previewModal.show();
    }

    function finalizePromotion() {
        // Here we would effectively gather all data and POST to backend
        alert('Promotion Finalized Successfully!\n\nRecords have been updated for the new session.');
        if (previewModal) previewModal.hide();
        fromClassSelect.value = '';
        toClassSelect.value = '';
        promotionArea.classList.add('hidden');
    }

})();
