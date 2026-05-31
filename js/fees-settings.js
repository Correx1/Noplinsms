// fees-settings.js

const AVAILABLE_CLASSES = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];

function initFeesSettings() {
    console.log("Initializing Fees Settings...");
    loadFeesData();
    renderClassCheckboxes();
    
    // Listen for form submit if user hits enter
    const form = document.getElementById('feeForm');
    if(form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            saveFeeForm();
        };
    }
}

function getFees() {
    return JSON.parse(localStorage.getItem('sms_dynamic_fees') || '[]');
}

function saveFeesToStorage(fees) {
    localStorage.setItem('sms_dynamic_fees', JSON.stringify(fees));
}

function loadFeesData() {
    const fees = getFees();
    const tbody = document.getElementById('feesListBody');
    const emptyState = document.getElementById('emptyFeesState');
    const tableDiv = document.querySelector('.overflow-x-auto');

    if (!tbody || !emptyState || !tableDiv) return;

    if (fees.length === 0) {
        emptyState.classList.remove('hidden');
        tableDiv.classList.add('hidden');
        tbody.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');
    tableDiv.classList.remove('hidden');

    tbody.innerHTML = fees.map((fee, index) => {
        let classesDisplay = 'All Classes';
        if (fee.classes && fee.classes.length > 0 && !fee.classes.includes('ALL')) {
            classesDisplay = fee.classes.join(', ');
        }
        if (fee.classes && fee.classes.length === AVAILABLE_CLASSES.length) {
            classesDisplay = 'All Classes';
        }
        if (!fee.classes || fee.classes.length === 0) {
            classesDisplay = '<span class="text-red-400">No classes assigned</span>';
        }

        const showBadge = fee.showOnResult 
            ? `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400 dark:bg-gray-700 dark:border-green-500 dark:text-green-400">Visible</span>`
            : `<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-400 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-400">Hidden</span>`;

        let amountDisplay = `<div class="font-bold">₦${Number(fee.amount).toLocaleString()}</div>`;
        if (fee.overrides && Object.keys(fee.overrides).length > 0) {
            let overrideList = Object.entries(fee.overrides)
                .map(([cls, amt]) => `<span class="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-primary-700 dark:text-primary-400 text-[11px] px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800 mr-1 mt-1 font-medium whitespace-nowrap">${cls}: ₦${Number(amt).toLocaleString()}</span>`)
                .join('');
            amountDisplay += `<div class="mt-1 flex flex-wrap max-w-[200px]">${overrideList}</div>`;
        }

        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">${fee.name}</td>
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">${amountDisplay}</td>
                <td class="px-6 py-4 max-w-xs truncate" title="${fee.classes?.join(', ')}">${classesDisplay}</td>
                <td class="px-6 py-4 text-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" ${fee.showOnResult ? 'checked' : ''} onchange="toggleFeeVisibility(${index}, this.checked)">
                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                    </label>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                    <button onclick="editFee(${index})" class="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-600 p-2 rounded transition-colors mr-1" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteFee(${index})" class="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 p-2 rounded transition-colors" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderClassCheckboxes() {
    const container = document.getElementById('feeClassCheckboxes');
    if (!container) return;
    
    container.innerHTML = AVAILABLE_CLASSES.map(cls => `
        <div class="flex items-center">
            <input type="checkbox" value="${cls}" id="chk_${cls.replace(/\s/g, '')}" class="fee-class-chk w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onchange="handleClassSelectionChange()">
            <label for="chk_${cls.replace(/\s/g, '')}" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 w-full cursor-pointer">${cls}</label>
        </div>
    `).join('');
}

function selectAllFeeClasses(selectAll) {
    document.querySelectorAll('.fee-class-chk').forEach(chk => {
        chk.checked = selectAll;
    });
    handleClassSelectionChange();
}

function handleClassSelectionChange() {
    const section = document.getElementById('customAmountsSection');
    const container = document.getElementById('customAmountsContainer');
    const baseAmount = document.getElementById('feeAmount').value || 0;
    
    const selectedCheckboxes = Array.from(document.querySelectorAll('.fee-class-chk:checked'));
    
    if (selectedCheckboxes.length > 0) {
        section.classList.remove('hidden');
        
        // Preserve existing values if re-rendering
        const existingValues = {};
        container.querySelectorAll('input').forEach(inp => {
            existingValues[inp.dataset.class] = inp.value;
        });

        container.innerHTML = selectedCheckboxes.map(chk => {
            const cls = chk.value;
            const val = existingValues[cls] || '';
            return `
                <div class="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-300 w-16">${cls}</span>
                    <div class="relative w-full">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <span class="text-gray-500 dark:text-gray-400">₦</span>
                        </div>
                        <input type="number" data-class="${cls}" value="${val}" placeholder="Same as Base (₦${baseAmount})" class="custom-amt-input bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary-600 focus:border-primary-600 block w-full ps-8 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                    </div>
                </div>
            `;
        }).join('');
    } else {
        section.classList.add('hidden');
        container.innerHTML = '';
    }
}

// Update placeholders when base amount changes
document.addEventListener('input', function(e) {
    if(e.target && e.target.id === 'feeAmount') {
        const base = e.target.value;
        document.querySelectorAll('.custom-amt-input').forEach(inp => {
            inp.placeholder = `Same as Base (₦${base})`;
        });
    }
});

function openFeeDrawer() {
    document.getElementById('feeForm').reset();
    document.getElementById('feeId').value = '';
    document.getElementById('feeDrawerTitle').textContent = 'Add New Fee';
    
    selectAllFeeClasses(false);
    document.getElementById('feeShowOnResult').checked = true;
    
    const drawer = document.getElementById('feeDrawer');
    const overlay = document.getElementById('feeDrawerOverlay');
    
    overlay.classList.remove('hidden');
    // slight delay to allow display block to apply before animating opacity
    setTimeout(() => overlay.classList.add('opacity-100'), 10);
    drawer.classList.remove('translate-x-full');
}

function closeFeeDrawer() {
    const drawer = document.getElementById('feeDrawer');
    const overlay = document.getElementById('feeDrawerOverlay');
    
    drawer.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    setTimeout(() => overlay.classList.add('hidden'), 300);
}

window.saveFeeForm = function() {
    const id = document.getElementById('feeId').value;
    const name = document.getElementById('feeName').value;
    const amount = document.getElementById('feeAmount').value;
    const showOnResult = document.getElementById('feeShowOnResult').checked;
    
    const selectedClasses = Array.from(document.querySelectorAll('.fee-class-chk:checked')).map(chk => chk.value);
    
    if (!name || !amount) {
        if (typeof showToast === 'function') showToast("Fee Name and Base Amount are required.", "error");
        else alert("Fee Name and Base Amount are required.");
        return;
    }

    if (selectedClasses.length === 0) {
        if (typeof showToast === 'function') showToast("Please select at least one applicable class.", "error");
        else alert("Please select at least one applicable class.");
        return;
    }

    // Collect custom overrides
    const overrides = {};
    document.querySelectorAll('.custom-amt-input').forEach(inp => {
        if (inp.value && inp.value.trim() !== '') {
            overrides[inp.dataset.class] = Number(inp.value);
        }
    });

    const fee = {
        name,
        amount: Number(amount),
        classes: selectedClasses,
        overrides: overrides,
        showOnResult
    };

    const fees = getFees();

    if (id !== '') {
        fees[parseInt(id)] = fee;
        if (typeof showToast === 'function') showToast("Fee updated successfully", "success");
    } else {
        fees.push(fee);
        if (typeof showToast === 'function') showToast("Fee added successfully", "success");
    }

    saveFeesToStorage(fees);
    closeFeeDrawer();
    loadFeesData();
};

function editFee(index) {
    const fees = getFees();
    const fee = fees[index];
    
    document.getElementById('feeId').value = index;
    document.getElementById('feeName').value = fee.name;
    document.getElementById('feeAmount').value = fee.amount;
    document.getElementById('feeShowOnResult').checked = fee.showOnResult;
    
    // Check classes
    document.querySelectorAll('.fee-class-chk').forEach(chk => {
        chk.checked = fee.classes.includes(chk.value);
    });
    
    // Render custom override inputs
    handleClassSelectionChange();
    
    // Fill custom overrides if any
    if (fee.overrides) {
        document.querySelectorAll('.custom-amt-input').forEach(inp => {
            const cls = inp.dataset.class;
            if (fee.overrides[cls] !== undefined) {
                inp.value = fee.overrides[cls];
            }
        });
    }

    document.getElementById('feeDrawerTitle').textContent = 'Edit Fee';
    
    const drawer = document.getElementById('feeDrawer');
    const overlay = document.getElementById('feeDrawerOverlay');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('opacity-100'), 10);
    drawer.classList.remove('translate-x-full');
}

function deleteFee(index) {
    if (confirm("Are you sure you want to delete this fee?")) {
        const fees = getFees();
        fees.splice(index, 1);
        saveFeesToStorage(fees);
        loadFeesData();
        if (typeof showToast === 'function') showToast("Fee deleted.", "success");
    }
}

function toggleFeeVisibility(index, isVisible) {
    const fees = getFees();
    fees[index].showOnResult = isVisible;
    saveFeesToStorage(fees);
    if (typeof showToast === 'function') showToast("Visibility updated.", "success");
}

// Call init immediately when script loads in SPA framework
initFeesSettings();
