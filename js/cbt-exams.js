// CBT Exams Module
(function() {
    const KEY = 'sms_cbt_sessions';
    let sessions = JSON.parse(localStorage.getItem(KEY) || '[]');
    let currentTab = 'all';

    const SEED = [
        { id:'CBT001', title:'WAEC Mock – Mathematics', type:'mock', className:'SSS3', subject:'Mathematics', questions:50, duration:90, date:'2024-11-10T09:00', passmark:50, shuffle:true, showAns:true, negativeMarking:false, status:'Completed', attempted:42 },
        { id:'CBT002', title:'First Term Real CBT – Physics', type:'real', className:'SSS2', subject:'Physics', questions:40, duration:60, date:'2024-11-20T08:00', passmark:50, shuffle:true, showAns:false, negativeMarking:false, status:'Upcoming', attempted:0 },
        { id:'CBT003', title:'JAMB Practice – Economics', type:'mock', className:'SSS3', subject:'Economics', questions:40, duration:45, date:'2024-11-15T14:00', passmark:45, shuffle:true, showAns:true, negativeMarking:false, status:'Active', attempted:20 },
    ];

    if (sessions.length === 0) { sessions = SEED; save(); }

    function save() { localStorage.setItem(KEY, JSON.stringify(sessions)); }

    function statusBadge(s) {
        const m = { Active:'bg-green-100 text-green-800', Upcoming:'bg-yellow-100 text-yellow-800', Completed:'bg-gray-100 text-gray-700', Draft:'bg-blue-100 text-blue-800' };
        return `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${m[s]||m.Draft}">${s}</span>`;
    }

    function typeBadge(t) {
        return t === 'mock'
            ? `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Mock</span>`
            : `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">Real</span>`;
    }

    function render() {
        const visible = currentTab === 'all' ? sessions : sessions.filter(s => s.type === currentTab);
        const el = id => document.getElementById(id);
        if(el('cbt-total'))     el('cbt-total').textContent     = sessions.length;
        if(el('cbt-mock'))      el('cbt-mock').textContent      = sessions.filter(s => s.type === 'mock').length;
        if(el('cbt-real'))      el('cbt-real').textContent      = sessions.filter(s => s.type === 'real').length;
        if(el('cbt-attempted')) el('cbt-attempted').textContent = sessions.reduce((a, s) => a + (s.attempted || 0), 0);
        if(el('cbt-table-title')) el('cbt-table-title').textContent = currentTab === 'all' ? 'All CBT Sessions' : currentTab === 'mock' ? 'Mock / Practice Sessions' : 'Real Exam Sessions';

        const tbody = el('cbt-table-body');
        if (!tbody) return;
        if (visible.length === 0) { tbody.innerHTML = '<tr><td colspan="9" class="px-4 py-8 text-center text-gray-400">No sessions found.</td></tr>'; return; }
        tbody.innerHTML = visible.map(s => `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${s.title}</td>
                <td class="px-4 py-3">${typeBadge(s.type)}</td>
                <td class="px-4 py-3">${s.className}</td>
                <td class="px-4 py-3">${s.subject}</td>
                <td class="px-4 py-3">${s.questions}</td>
                <td class="px-4 py-3">${s.duration} min</td>
                <td class="px-4 py-3">${new Date(s.date).toLocaleString()}</td>
                <td class="px-4 py-3">${statusBadge(s.status)}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button onclick="window.cbtApp.edit('${s.id}')" class="text-xs px-2.5 py-1 rounded bg-primary-50 text-primary-700 hover:bg-primary-100"><i class="fas fa-edit"></i></button>
                        <button onclick="window.cbtApp.toggleStatus('${s.id}')" class="text-xs px-2.5 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"><i class="fas fa-power-off"></i></button>
                        <button onclick="window.cbtApp.del('${s.id}')" class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('');
    }

    window.cbtApp = {
        setTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.cbt-tab').forEach(b => {
                const active = b.dataset.tab === tab;
                b.classList.toggle('border-primary-600', active);
                b.classList.toggle('text-primary-600', active);
                b.classList.toggle('dark:text-primary-400', active);
                b.classList.toggle('border-transparent', !active);
                b.classList.toggle('text-gray-500', !active);
            });
            render();
        },
        openModal(type) {
            document.getElementById('cbt-form').reset();
            document.getElementById('cbt-id').value = '';
            document.getElementById('cbt-type-input').value = type;
            const isReal = type === 'real';
            const lbl = document.getElementById('cbt-type-label');
            if (lbl) {
                lbl.innerHTML = isReal
                    ? 'Creating a <strong>Real Exam</strong> session. Results are official and final.'
                    : 'Creating a <strong>Mock / Practice</strong> session. Students can retake multiple times.';
                lbl.parentElement.className = `flex items-center gap-2 p-3 rounded-lg border ${isReal ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'}`;
            }
            document.getElementById('cbt-modal-title').textContent = isReal ? 'New Real CBT Exam' : 'New Mock CBT Session';
            document.getElementById('cbtModal').classList.remove('hidden');
        },
        closeModal() { document.getElementById('cbtModal').classList.add('hidden'); },
        save() {
            const id = document.getElementById('cbt-id').value;
            const obj = {
                id: id || 'CBT' + Date.now(),
                title: document.getElementById('cbt-title').value,
                type: document.getElementById('cbt-type-input').value,
                className: document.getElementById('cbt-class').value,
                subject: document.getElementById('cbt-subject').value,
                questions: +document.getElementById('cbt-questions').value,
                duration: +document.getElementById('cbt-duration').value,
                date: document.getElementById('cbt-date').value,
                passmark: +document.getElementById('cbt-passmark').value,
                shuffle: document.getElementById('cbt-shuffle').checked,
                showAns: document.getElementById('cbt-show-ans').checked,
                negativeMarking: document.getElementById('cbt-negative').checked,
                status: 'Upcoming',
                attempted: 0
            };
            if (id) { const i = sessions.findIndex(s => s.id === id); sessions[i] = {...sessions[i], ...obj}; }
            else sessions.push(obj);
            save(); this.closeModal(); render();
            if (typeof window.showToast === 'function') window.showToast('success', 'CBT session saved.');
        },
        edit(id) {
            const s = sessions.find(x => x.id === id); if (!s) return;
            document.getElementById('cbt-id').value = s.id;
            document.getElementById('cbt-type-input').value = s.type;
            document.getElementById('cbt-title').value = s.title;
            document.getElementById('cbt-class').value = s.className;
            document.getElementById('cbt-subject').value = s.subject;
            document.getElementById('cbt-questions').value = s.questions;
            document.getElementById('cbt-duration').value = s.duration;
            document.getElementById('cbt-date').value = s.date;
            document.getElementById('cbt-passmark').value = s.passmark;
            document.getElementById('cbt-shuffle').checked = !!s.shuffle;
            document.getElementById('cbt-show-ans').checked = !!s.showAns;
            document.getElementById('cbt-negative').checked = !!s.negativeMarking;
            document.getElementById('cbt-modal-title').textContent = 'Edit CBT Session';
            document.getElementById('cbtModal').classList.remove('hidden');
        },
        toggleStatus(id) {
            const s = sessions.find(x => x.id === id); if (!s) return;
            const cycle = { Upcoming:'Active', Active:'Completed', Completed:'Upcoming', Draft:'Upcoming' };
            s.status = cycle[s.status] || 'Upcoming';
            save(); render();
        },
        del(id) { if (!confirm('Delete this session?')) return; sessions = sessions.filter(s => s.id !== id); save(); render(); }
    };

    render();
})();
