// Online Exams Module — questions live inside the create modal
(function() {
    const KEY = 'sms_online_exams';
    let exams = JSON.parse(localStorage.getItem(KEY) || '[]');
    let filtered = [];

    // In-modal question state
    let _modalQs = [];

    const SEED = [
        { id:'OE001', title:'First Term Mathematics Online Exam', className:'SSS2', subject:'Mathematics', start:'2024-11-18T09:00', duration:60, passmark:50, status:'Upcoming', instructions:'Answer all questions. No negative marking.', shuffle:true, showResult:true,
          qBank:[
            { q:'Simplify: 4x + 2x - 3x', a:'3x', b:'4x', c:'5x', d:'2x', ans:'A' },
            { q:'Area of a rectangle with length 8cm and width 5cm?', a:'40cm', b:'13cm²', c:'40cm²', d:'80cm²', ans:'C' },
            { q:'Solve: 2x - 6 = 10', a:'2', b:'8', c:'4', d:'6', ans:'B' },
          ]
        },
        { id:'OE002', title:'English Language Mid-Term Online Test', className:'JSS3', subject:'English Language', start:'2024-11-19T10:00', duration:45, passmark:45, status:'Active', instructions:'Read each question carefully.', shuffle:false, showResult:true,
          qBank:[
            { q:'Which word is a verb?', a:'Beauty', b:'Quickly', c:'Runs', d:'Lovely', ans:'C' },
            { q:'Choose the correctly spelled word:', a:'Recieve', b:'Receive', c:'Recive', d:'Receeve', ans:'B' },
          ]
        },
        { id:'OE003', title:'Physics Theory Online Test', className:'SSS3', subject:'Physics', start:'2024-10-10T08:00', duration:90, passmark:50, status:'Completed', instructions:'Calculator not allowed.', shuffle:true, showResult:false,
          qBank:[
            { q:'Unit of electrical resistance is?', a:'Ampere', b:'Volt', c:'Ohm', d:'Watt', ans:'C' },
            { q:'Which is a scalar quantity?', a:'Velocity', b:'Force', c:'Speed', d:'Acceleration', ans:'C' },
          ]
        },
    ];

    if (exams.length === 0) { exams = SEED; save(); }

    function save() { localStorage.setItem(KEY, JSON.stringify(exams)); }

    function statusBadge(s) {
        const m = { Active:'bg-green-100 text-green-800', Upcoming:'bg-yellow-100 text-yellow-800', Completed:'bg-gray-100 text-gray-700', Draft:'bg-blue-100 text-blue-800' };
        return `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${m[s]||m.Draft}">${s}</span>`;
    }

    function render() {
        const el = id => document.getElementById(id);
        if(el('oe-stat-total'))    el('oe-stat-total').textContent    = exams.length;
        if(el('oe-stat-active'))   el('oe-stat-active').textContent   = exams.filter(e=>e.status==='Active').length;
        if(el('oe-stat-upcoming')) el('oe-stat-upcoming').textContent = exams.filter(e=>e.status==='Upcoming').length;
        if(el('oe-stat-completed'))el('oe-stat-completed').textContent= exams.filter(e=>e.status==='Completed').length;

        const tbody = el('oe-table-body');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">No exams found.</td></tr>'; return; }
        tbody.innerHTML = filtered.map(e => `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">${e.title}</td>
                <td class="px-4 py-3">${e.className}</td>
                <td class="px-4 py-3">${e.subject}</td>
                <td class="px-4 py-3">${e.duration} min</td>
                <td class="px-4 py-3 text-sm">${e.start ? new Date(e.start).toLocaleString() : '—'}</td>
                <td class="px-4 py-3">
                    <span class="font-semibold text-primary-700 dark:text-primary-400">${(e.qBank||[]).length}</span>
                    <span class="text-gray-400 text-xs ml-0.5">Q</span>
                </td>
                <td class="px-4 py-3">${statusBadge(e.status)}</td>
                <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                        <button onclick="window.onlineExamApp.viewQs('${e.id}')" class="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700" title="View Questions">
                            <i class="fas fa-eye mr-1"></i><span class="hidden sm:inline">Questions</span>
                        </button>
                        <button onclick="window.onlineExamApp.startExam('${e.id}')" class="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700" title="Start Exam">
                            <i class="fas fa-play"></i><span class="hidden sm:inline ml-1">Start</span>
                        </button>
                        <button onclick="window.onlineExamApp.edit('${e.id}')" class="text-xs px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.onlineExamApp.toggleStatus('${e.id}')" class="text-xs px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40" title="Toggle Status">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button onclick="window.onlineExamApp.del('${e.id}')" class="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`).join('');
    }

    function renderModalQs() {
        const el = document.getElementById('oe-modal-qlist');
        const countEl = document.getElementById('oe-modal-q-count');
        if (countEl) countEl.textContent = `(${_modalQs.length} question${_modalQs.length!==1?'s':''})`;
        if (!el) return;
        if (_modalQs.length === 0) { el.innerHTML = '<div class="text-sm text-gray-400 italic text-center py-4">No questions yet. Click "+ Add Question" above.</div>'; return; }
        el.innerHTML = _modalQs.map((q,i) => `
            <div class="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700/40">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">Q${i+1}</span>
                    <button type="button" onclick="window.onlineExamApp._removeModalQ(${i})" class="text-xs text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </div>
                <textarea rows="2" class="w-full text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1.5 mb-2"
                    placeholder="Question text…" oninput="window.onlineExamApp._updateModalQ(${i},'q',this.value)">${q.q}</textarea>
                <div class="grid grid-cols-2 gap-1.5 mb-2">
                    ${['a','b','c','d'].map(opt=>`
                    <div class="flex items-center gap-1">
                        <span class="text-xs font-bold text-gray-500 uppercase w-5 text-center">${opt})</span>
                        <input type="text" value="${q[opt]||''}" placeholder="Option ${opt.toUpperCase()}"
                            class="flex-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1"
                            oninput="window.onlineExamApp._updateModalQ(${i},'${opt}',this.value)">
                    </div>`).join('')}
                </div>
                <div class="flex flex-wrap items-center gap-3 text-xs border-t dark:border-gray-600 pt-2">
                    <span class="text-gray-500 font-medium">Correct Answer:</span>
                    ${['A','B','C','D'].map(opt=>`
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="oe-ans-${i}" value="${opt}" ${q.ans===opt?'checked':''} onchange="window.onlineExamApp._updateModalQ(${i},'ans','${opt}')">
                        <span class="font-bold ${q.ans===opt?'text-green-700 dark:text-green-400':'text-gray-500'}">${opt}</span>
                    </label>`).join('')}
                </div>
            </div>`).join('');
    }

    window.onlineExamApp = {
        filter(q) { filtered = exams.filter(e=>(e.title+e.className+e.subject).toLowerCase().includes(q.toLowerCase())); render(); },
    _populateSyllabusDd(selectId) {
        const sel = document.getElementById(selectId); if(!sel) return;
        const syllabi = JSON.parse(localStorage.getItem('sms_syllabi')||'[]');
        const existing = sel.querySelector('option[value=""]')?.outerHTML || '<option value="">— select from syllabus —</option>';
        sel.innerHTML = existing + syllabi.map(s=>`<option value="${s.id||s.title}" data-subject="${s.subject||''}" data-title="${s.title||''}">${s.title} (${s.subject||''}${s.class?' · '+s.class:''})</option>`).join('');
    },
        openCreateModal() {
            _modalQs = [];
            document.getElementById('oe-form').reset();
            document.getElementById('oe-id').value = '';
            document.getElementById('oe-modal-title').textContent = 'Create Online Exam';
            this._populateSyllabusDd('oe-ai-syllabus');
            document.getElementById('oeCreateModal').classList.remove('hidden');
            renderModalQs();
        },
        closeCreateModal() { document.getElementById('oeCreateModal').classList.add('hidden'); },
        addModalQ() { _modalQs.push({ q:'', a:'', b:'', c:'', d:'', ans:'A' }); renderModalQs(); },
        _updateModalQ(i, field, val) { if(_modalQs[i]) _modalQs[i][field]=val; },
        _removeModalQ(i) { _modalQs.splice(i,1); renderModalQs(); },
        save() {
            const id = document.getElementById('oe-id').value;
            const obj = {
                id: id || 'OE'+Date.now(),
                title: document.getElementById('oe-title').value,
                className: Array.from(document.querySelectorAll('input[name="oe-classes"]:checked')).map(c=>c.value).join(', ') || 'All',
                subject: document.getElementById('oe-subject').value,
                start: document.getElementById('oe-start').value,
                duration: +document.getElementById('oe-duration').value,
                passmark: +document.getElementById('oe-passmark').value,
                instructions: document.getElementById('oe-instructions').value,
                shuffle: document.getElementById('oe-shuffle').checked,
                showResult: document.getElementById('oe-show-result').checked,
                status: 'Upcoming', createdAt: new Date().toISOString(),
                qBank: JSON.parse(JSON.stringify(_modalQs))
            };
            if (!obj.title) { alert('Title is required.'); return; }
            if (id) { const i=exams.findIndex(e=>e.id===id); exams[i]={...exams[i],...obj}; }
            else exams.push(obj);
            filtered=[...exams]; save(); this.closeCreateModal(); render();
        },
        edit(id) {
            const e = exams.find(x=>x.id===id); if(!e) return;
            _modalQs = JSON.parse(JSON.stringify(e.qBank||[]));
            document.getElementById('oe-id').value = e.id;
            document.getElementById('oe-title').value = e.title;
            document.querySelectorAll('input[name="oe-classes"]').forEach(cb => {
                cb.checked = (e.className || '').split(', ').includes(cb.value);
            });
            document.getElementById('oe-subject').value = e.subject;
            document.getElementById('oe-start').value = e.start||'';
            document.getElementById('oe-duration').value = e.duration;
            document.getElementById('oe-passmark').value = e.passmark;
            document.getElementById('oe-instructions').value = e.instructions||'';
            document.getElementById('oe-shuffle').checked = !!e.shuffle;
            document.getElementById('oe-show-result').checked = !!e.showResult;
            document.getElementById('oe-modal-title').textContent = 'Edit Online Exam';
            this._populateSyllabusDd('oe-ai-syllabus');
            document.getElementById('oeCreateModal').classList.remove('hidden');
            renderModalQs();
        },
        aiGenerate() {
            const sel = document.getElementById('oe-ai-syllabus');
            const count = +document.getElementById('oe-ai-count').value || 5;
            const subject = document.getElementById('oe-subject')?.value || 'Mathematics';
            let topic = subject;
            if (sel && sel.value) { const opt = sel.options[sel.selectedIndex]; topic = opt.dataset.title || opt.text || subject; }
            const BANKS = {
                Mathematics:[{q:'Simplify: 4x + 2y − 2x + y',a:'2x + 3y',b:'2x − 3y',c:'6x + y',d:'4x + y',ans:'A'},{q:'Find x if 3x − 9 = 0',a:'9',b:'0',c:'3',d:'−3',ans:'C'},{q:'Area of a circle with radius 7 (π=22/7)',a:'154',b:'144',c:'176',d:'140',ans:'A'},{q:'LCM of 12 and 8',a:'24',b:'48',c:'4',d:'96',ans:'A'},{q:'Solve: x² = 49',a:'7',b:'−7',c:'±7',d:'14',ans:'C'}],
                Physics:[{q:'SI unit of force',a:'Joule',b:'Watt',c:'Newton',d:'Pascal',ans:'C'},{q:'Speed = Distance / ?',a:'Mass',b:'Time',c:'Velocity',d:'Acceleration',ans:'B'},{q:'Which is a vector?',a:'Mass',b:'Speed',c:'Temperature',d:'Displacement',ans:'D'},{q:'Unit of work done',a:'Newton',b:'Watt',c:'Joule',d:'Volt',ans:'C'},{q:'Speed of light ≈ ?',a:'3×10⁸ m/s',b:'3×10⁶ m/s',c:'3×10⁴ m/s',d:'3×10¹⁰ m/s',ans:'A'}],
                default:[{q:`Q1: Key concept in ${topic}?`,a:'Option A',b:'Option B',c:'Option C',d:'Option D',ans:'A'},{q:`Q2: Definition in ${topic}?`,a:'Option A',b:'Option B',c:'Option C',d:'Option D',ans:'B'},{q:`Q3: Application of ${topic}?`,a:'Option A',b:'Option B',c:'Option C',d:'Option D',ans:'C'},{q:`Q4: Example from ${topic}?`,a:'Option A',b:'Option B',c:'Option C',d:'Option D',ans:'A'},{q:`Q5: Principle of ${topic}?`,a:'Option A',b:'Option B',c:'Option C',d:'Option D',ans:'D'}],
            };
            const pool = BANKS[subject] || BANKS.default;
            const generated = [];
            for(let i=0; i<Math.min(count,10); i++) generated.push({...pool[i % pool.length]});
            _modalQs = [..._modalQs, ...generated];
            renderModalQs();
            alert(`✅ ${generated.length} AI questions generated from "${topic}" and added below. Review and edit as needed.`);
        },
        toggleStatus(id) {
            const e=exams.find(x=>x.id===id); if(!e) return;
            const cycle={Upcoming:'Active',Active:'Completed',Completed:'Upcoming',Draft:'Upcoming'};
            e.status=cycle[e.status]||'Upcoming'; filtered=[...exams]; save(); render();
        },
        del(id) { if(!confirm('Delete this exam?')) return; exams=exams.filter(e=>e.id!==id); filtered=[...exams]; save(); render(); },
        viewQs(id) {
            const e=exams.find(x=>x.id===id); if(!e) return;
            document.getElementById('oe-view-title').textContent = e.title + ` — ${(e.qBank||[]).length} Questions`;
            const qs = e.qBank||[];
            document.getElementById('oe-view-content').innerHTML = qs.length===0
                ? '<p class="text-gray-400 text-sm italic">No questions added yet.</p>'
                : `<ol class="list-decimal list-inside space-y-4 text-sm">${qs.map((q,i)=>`
                    <li class="text-gray-800 dark:text-gray-200 font-medium">${q.q}
                        <ul class="mt-1.5 grid grid-cols-2 gap-1 ml-4">
                            ${['a','b','c','d'].map(opt=>`
                            <li class="${q.ans===opt.toUpperCase()?'font-bold text-green-700 dark:text-green-400':'text-gray-600 dark:text-gray-400'}">
                                <span class="uppercase">${opt})</span> ${q[opt]||'—'}
                                ${q.ans===opt.toUpperCase()?'<i class="fas fa-check ml-1 text-green-600"></i>':''}
                            </li>`).join('')}
                        </ul>
                    </li>`).join('')}</ol>`;
            document.getElementById('oeViewModal').classList.remove('hidden');
        },
        startExam(id) {
            const e=exams.find(x=>x.id===id); if(!e) return;
            if(e.status==='Completed') { alert('This exam is already completed.'); return; }
            if(!(e.qBank||[]).length) { alert('Cannot start exam — no questions added yet.'); return; }
            if(!confirm(`Start exam: "${e.title}"?\nStudents in ${e.className} will be able to attempt this exam.`)) return;
            e.status='Active'; save(); render();
            if(typeof window.showToast==='function') window.showToast('success', 'Exam is now ACTIVE.');
        }
    };

    filtered=[...exams];
    render();
})();
