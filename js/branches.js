// Run immediately
(function() {
    // Mock Data State
    let branches = [
        { id: 'b1', name: 'Main Campus', address: '14 Unity Road, Ikeja', established: '2010', status: 'Active', isContext: true },
        { id: 'b2', name: 'Lekki Annex', address: 'Plot 42 Admiralty Way, Lekki Phase 1', established: '2017', status: 'Active', isContext: false },
        { id: 'b3', name: 'Abuja Branch', address: 'No 5 Wuse Zone 2, FCT Abuja', established: '2021', status: 'Warning', isContext: false },
        { id: 'b4', name: 'Port Harcourt Campus', address: '12 Trans Amadi Ind. Layout', established: '2015', status: 'Active', isContext: false },
        { id: 'b5', name: 'GRA Primary Section', address: '7B GRA Phase 2', established: '2019', status: 'Active', isContext: false },
        { id: 'b6', name: 'Ibadan Extension', address: 'Ring Road, Ibadan', established: '2023', status: 'Warning', isContext: false }
    ];

    // Read stored context or default
    const storedContext = localStorage.getItem('sms_active_branch');
    if (storedContext) {
        branches.forEach(b => b.isContext = false);
        const activeB = branches.find(b => b.id === storedContext);
        if(activeB) activeB.isContext = true;
    }

    const tbody = document.getElementById('branches-tbody');
    const badge = document.getElementById('active-context-badge');

    function renderBranches() {
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const activeBranch = branches.find(b => b.isContext) || branches[0];
        if (badge) badge.innerText = `Current Context: ${activeBranch.name}`;

        branches.forEach(branch => {
            const tr = document.createElement('tr');
            tr.className = `border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${branch.isContext ? 'bg-green-50/30 dark:bg-green-900/10' : 'bg-white dark:bg-gray-800'}`;
            
            tr.innerHTML = `
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <i class="fas fa-building text-gray-400"></i> ${branch.name}
                        ${branch.isContext ? '<span class="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm ml-2 font-bold uppercase tracking-wide animate-pulse">Live Context</span>' : ''}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${branch.address}</div>
                </td>
                <td class="px-6 py-4">${branch.established}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        ${!branch.isContext ? `<button type="button" onclick="switchContext('${branch.id}')" class="text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded disabled:opacity-50">Switch Context</button>` : `<button type="button" disabled class="text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded cursor-not-allowed"><i class="fas fa-check"></i> Active</button>`}
                        <button type="button" onclick="editBranch('${branch.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-2 py-1.5 rounded transition-colors" title="Edit Branch">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" onclick="deleteBranch('${branch.id}')" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-2 py-1.5 rounded transition-colors" ${branch.isContext ? 'disabled title="Cannot delete active context"' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Assign globally to be called by onclick
    window.switchContext = (id) => {
        const branch = branches.find(b => b.id === id);
        if(!branch) return;
        localStorage.setItem('sms_active_branch', id);
        localStorage.setItem('sms_currentBranchName', branch.name);
        
        // Show realistic loading state then reload
        if (typeof showToast === 'function') {
            showToast('Switching Admin context...', 'info');
        }
        setTimeout(() => {
            if (typeof showToast === 'function') showToast(`Context Switched: You are now managing ${branch.name}`, 'success');
            branches.forEach(b => b.isContext = false);
            branch.isContext = true;
            renderBranches();
        }, 800);
    };

    window.deleteBranch = (id) => {
        if(confirm("Are you sure you want to delete this branch? All associated local data will be orphaned.")) {
            branches = branches.filter(b => b.id !== id);
            renderBranches();
            if (typeof showToast === 'function') showToast('Branch deleted successfully.', 'success');
        }
    };

    let editingBranchId = null;
    const editModal = document.getElementById('editBranchModal');
    const editForm = document.getElementById('editBranchForm');

    window.editBranch = (id) => {
        const branch = branches.find(b => b.id === id);
        if(!branch || !editModal) return;
        editingBranchId = id;
        document.getElementById('ebname').value = branch.name;
        document.getElementById('ebaddress').value = branch.address;
        document.getElementById('ebestablished').value = branch.established;
        
        editModal.classList.remove('hidden');
        editModal.classList.add('flex');
    };

    function hideEditModal() {
        if(editModal) {
            editModal.classList.add('hidden');
            editModal.classList.remove('flex');
        }
    }

    if(editModal) {
        editModal.querySelectorAll('[data-modal-toggle]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener('click', hideEditModal);
        });
    }

    if(editForm) {
        const newEForm = editForm.cloneNode(true);
        editForm.parentNode.replaceChild(newEForm, editForm);
        newEForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const bname = document.getElementById('ebname').value;
            const baddr = document.getElementById('ebaddress').value;
            const bestab = document.getElementById('ebestablished').value;
            
            const tgt = branches.find(b => b.id === editingBranchId);
            if(tgt) {
                tgt.name = bname;
                tgt.address = baddr;
                tgt.established = bestab;
                renderBranches();
                hideEditModal();
                if (typeof showToast === 'function') showToast(`Branch "${bname}" updated!`, 'success');
            }
        });
    }

    renderBranches();

    // Modal Logic
    const addBtn = document.getElementById('addBranchBtn');
    const modal = document.getElementById('addBranchModal');
    const form = document.getElementById('addBranchForm');

    function hideModal() {
        if(modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    if(addBtn && modal) {
        addBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });

        modal.querySelectorAll('[data-modal-toggle]').forEach(el => {
            // Replace old listeners to prevent duplication
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener('click', hideModal);
        });
    }

    if(form) {
        // Clone form to clear any old event listeners hanging around from re-renders
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const bname = document.getElementById('bname').value;
            const baddr = document.getElementById('baddress').value;
            const bestab = document.getElementById('bestablished').value;
            
            const newB = {
                id: 'b' + Date.now(),
                name: bname,
                address: baddr,
                established: bestab,
                status: 'Active',
                isContext: false
            };
            
            branches.push(newB);
            hideModal();
            renderBranches();
            newForm.reset();
            if (typeof showToast === 'function') showToast(`Branch "${bname}" added!`, 'success');
        });
    }
})();
