// Online Exams Module
(function() {
    const KEY = 'sms_online_exams';
    let exams = JSON.parse(localStorage.getItem(KEY) || '[]');
    let filtered = [];

    const SEED = [
        { id:'OE001', title:'First Term Mathematics', className:'SSS2', subject:'Mathematics', start:'2024-11-18T09:00', duration:60, questions:40, passmark:50, status:'Upcoming', instructions:'Answer all questions. No negative marking.', shuffle:true, showResult:true },
        { id:'OE002', title:'English Language Mid-Term', className:'JSS3', subject:'English Language', start:'2024-11-19T10:00', duration:45, questions:30, passmark:45, status:'Active', instructions:'Read each question carefully.', shuffle:false, showResult:true },
        { id:'OE003', title:'Physics Practical Theory', className:'SSS3', subject:'Physics', start:'2024-10-10T08:00', duration:90, questions:50, passmark:50, status:'Completed', instructions:'Show workings where applicable.', shuffle:true, showResult:false },
    ];

    if (exams.length === 0) { exams = SEED.map(e => ({...e, createdAt: new Date().toISOString()})); save(); }

    function save() { localStorage.setItem(KEY, JSON.stringify(exams)); }

    function statusBadge(s) {
        const m = { Active:'bg-green-100 text-green-800', Upcoming:'bg-yellow-100 text-yellow-800', Completed:'bg-gray-100 text-gray-700', Draft:'bg-blue-100 text-blue-800' };
        return `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${m[s]||m.Draft}">${s}</span>`;
    }

    function render() {
        const active    = exams.filter(e => e.status === 'Active').length;
        const upcoming  = exams.filter(e => e.status === 'Upcoming').length;
        const completed = exams.filter(e => e.status === 'Completed').length;
        const s = id => document.getElementById(id);
        if(s('oe-stat-total'))    s('oe-stat-total').textContent    = exams.length;
        if(s('oe-stat-active'))   s('oe-stat-active').textContent   = active;
        if(s('oe-stat-upcoming')) s('oe-stat-upcoming').textContent = upcoming;
        if(s('oe-stat-completed'))s('oe-stat-completed').textContent= completed;

        const tbody = document.getElementById('oe-table-body');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">No exams found.</td></tr>'; return; }
        tbody.innerHTML = filtered.map(e => `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${e.title}</td>
                <td class="px-4 py-3">${e.className}</td>
                <td class="px-4 py-3">${e.subject}</td>
                <td class="px-4 py-3">${e.duration} min</td>
                <td class="px-4 py-3">${new Date(e.start).toLocaleString()}</td>
                <td class="px-4 py-3">${e.questions}</td>
                <td class="px-4 py-3">${statusBadge(e.status)}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button onclick="window.onlineExamApp.edit('${e.id}')" class="text-xs px-2.5 py-1 rounded bg-primary-50 text-primary-700 hover:bg-primary-100"><i class="fas fa-edit"></i></button>
                        <button onclick="window.onlineExamApp.toggleStatus('${e.id}')" class="text-xs px-2.5 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"><i class="fas fa-power-off"></i></button>
                        <button onclick="window.onlineExamApp.del('${e.id}')" class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('');
    }

    window.onlineExamApp = {
        filter(q) { filtered = exams.filter(e => (e.title+e.className+e.subject).toLowerCase().includes(q.toLowerCase())); render(); },
        openCreateModal() {
            document.getElementById('oe-form').reset();
            document.getElementById('oe-id').value = '';
            document.getElementById('oe-modal-title').textContent = 'Create Online Exam';
            document.getElementById('oeCreateModal').classList.remove('hidden');
        },
        closeCreateModal() { document.getElementById('oeCreateModal').classList.add('hidden'); },
        save() {
            const id = document.getElementById('oe-id').value;
            const obj = {
                id: id || 'OE' + Date.now(),
                title: document.getElementById('oe-title').value,
                className: document.getElementById('oe-class').value,
                subject: document.getElementById('oe-subject').value,
                start: document.getElementById('oe-start').value,
                duration: +document.getElementById('oe-duration').value,
                questions: +document.getElementById('oe-questions').value,
                passmark: +document.getElementById('oe-passmark').value,
                instructions: document.getElementById('oe-instructions').value,
                shuffle: document.getElementById('oe-shuffle').checked,
                showResult: document.getElementById('oe-show-result').checked,
                status: 'Upcoming',
                createdAt: new Date().toISOString()
            };
            if (id) { const i = exams.findIndex(e => e.id === id); exams[i] = {...exams[i], ...obj}; }
            else exams.push(obj);
            filtered = [...exams];
            save(); this.closeCreateModal(); render();
            if (typeof window.showToast === 'function') window.showToast('success', 'Exam saved.');
        },
        edit(id) {
            const e = exams.find(x => x.id === id); if (!e) return;
            document.getElementById('oe-id').value = e.id;
            document.getElementById('oe-title').value = e.title;
            document.getElementById('oe-class').value = e.className;
            document.getElementById('oe-subject').value = e.subject;
            document.getElementById('oe-start').value = e.start;
            document.getElementById('oe-duration').value = e.duration;
            document.getElementById('oe-questions').value = e.questions;
            document.getElementById('oe-passmark').value = e.passmark;
            document.getElementById('oe-instructions').value = e.instructions || '';
            document.getElementById('oe-shuffle').checked = !!e.shuffle;
            document.getElementById('oe-show-result').checked = !!e.showResult;
            document.getElementById('oe-modal-title').textContent = 'Edit Online Exam';
            document.getElementById('oeCreateModal').classList.remove('hidden');
        },
        toggleStatus(id) {
            const e = exams.find(x => x.id === id); if (!e) return;
            const cycle = { Upcoming:'Active', Active:'Completed', Completed:'Upcoming', Draft:'Upcoming' };
            e.status = cycle[e.status] || 'Upcoming';
            filtered = [...exams]; save(); render();
        },
        del(id) { if (!confirm('Delete this exam?')) return; exams = exams.filter(e => e.id !== id); filtered = [...exams]; save(); render(); }
    };

    filtered = [...exams];
    render();
})();
