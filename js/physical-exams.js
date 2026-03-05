// Physical Exams Module
(function() {
    const KEY = 'sms_physical_exams';
    let papers = JSON.parse(localStorage.getItem(KEY) || '[]');

    // In-modal question state
    let _objQs = [];
    let _theoryQs = [];
    let _editingId = null;
    let _viewPaperId = null;

    const SEED = [
        {
            id:'PH001', subject:'Mathematics', className:'SSS3A', exam:'First Term 2024/2025',
            date:'2024-11-25T09:00', duration:120, marks:100,
            instructions:'Answer ALL questions in Section A. Answer THREE questions from Section B.',
            status:'Ready',
            objQs:[
                { q:'Find x if 3x - 9 = 0', a:'0', b:'3', c:'-3', d:'9', ans:'B' },
                { q:'The value of √144 is?', a:'11', b:'14', c:'12', d:'13', ans:'C' },
                { q:'Simplify: (2³ × 2²)', a:'2⁵', b:'2⁶', c:'4⁶', d:'8⁵', ans:'A' },
            ],
            theoryQs:[
                { q:'A man walks 3km North, then 4km East. Find the resultant displacement.', marks:10 },
                { q:'Solve the quadratic equation: x² - 5x + 6 = 0', marks:10 },
                { q:'A rectangle has perimeter 36cm. If its length is twice its width, find both dimensions.', marks:10 },
            ]
        },
        {
            id:'PH002', subject:'English Language', className:'JSS3A', exam:'First Term 2024/2025',
            date:'2024-11-26T09:00', duration:120, marks:100,
            instructions:'Attempt all questions.',
            status:'Draft',
            objQs:[
                { q:'Choose the correct spelling:', a:'Accomodate', b:'Accommodate', c:'Acommodate', d:'Acomodate', ans:'B' },
                { q:'The antonym of "ancient" is:', a:'old', b:'new', c:'tiny', d:'modern', ans:'D' },
            ],
            theoryQs:[
                { q:'Write a letter to your principal requesting permission for a school trip. (150 words)', marks:20 },
                { q:'Read the passage and answer the comprehension questions that follow.', marks:20 },
            ]
        },
        {
            id:'PH003', subject:'Physics', className:'SSS2A', exam:'Mid-Term Assessment',
            date:'2025-02-10T08:00', duration:90, marks:50,
            instructions:'Do not open until told to begin.',
            status:'Pending',
            objQs:[], theoryQs:[]
        }
    ];

    if (papers.length === 0) { papers = SEED; save(); }

    function save() { localStorage.setItem(KEY, JSON.stringify(papers)); }

    function statusBadge(s) {
        const m = { Ready:'bg-green-100 text-green-800', Draft:'bg-blue-100 text-blue-800', Pending:'bg-yellow-100 text-yellow-800' };
        return `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${m[s]||'bg-gray-100 text-gray-700'}">${s}</span>`;
    }

    function render() {
        const el = id => document.getElementById(id);
        if(el('ph-total'))   el('ph-total').textContent   = papers.length;
        if(el('ph-withq'))   el('ph-withq').textContent   = papers.filter(p=>(p.objQs||[]).length+(p.theoryQs||[]).length>0).length;
        if(el('ph-pending')) el('ph-pending').textContent = papers.filter(p=>p.status==='Pending'||p.status==='Draft').length;
        if(el('ph-ready'))   el('ph-ready').textContent   = papers.filter(p=>p.status==='Ready').length;

        const tbody = el('ph-table-body');
        if (!tbody) return;
        if (papers.length === 0) { tbody.innerHTML = '<tr><td colspan="9" class="px-4 py-8 text-center text-gray-400">No exam papers yet.</td></tr>'; return; }
        tbody.innerHTML = papers.map(p => `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${p.subject}</td>
                <td class="px-4 py-3 text-sm">${p.exam}</td>
                <td class="px-4 py-3">${p.className}</td>
                <td class="px-4 py-3 text-sm">${p.date ? new Date(p.date).toLocaleString() : '—'}</td>
                <td class="px-4 py-3">${p.duration} min</td>
                <td class="px-4 py-3">
                    <span class="font-semibold text-blue-700 dark:text-blue-400">${(p.objQs||[]).length}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="font-semibold text-purple-700 dark:text-purple-400">${(p.theoryQs||[]).length}</span>
                </td>
                <td class="px-4 py-3">${statusBadge(p.status)}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-1 flex-wrap">
                        <button onclick="window.physApp.viewQuestions('${p.id}')" class="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700" title="View Questions">
                            <i class="fas fa-eye mr-1"></i><span class="hidden sm:inline">View</span>
                        </button>
                        <button onclick="window.physApp.edit('${p.id}')" class="text-xs px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.physApp.printPaper('${p.id}')" class="text-xs px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-800" title="Print Paper">
                            <i class="fas fa-print"></i>
                        </button>
                        <button onclick="window.physApp.del('${p.id}')" class="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`).join('');
    }

    function renderObjQs() {
        const el = document.getElementById('ph-obj-list');
        const countEl = document.getElementById('ph-obj-count');
        if (countEl) countEl.textContent = `(${_objQs.length} question${_objQs.length!==1?'s':''})`;
        if (!el) return;
        if (_objQs.length === 0) { el.innerHTML = '<div class="text-sm text-gray-400 italic text-center py-3">No objective questions yet.</div>'; return; }
        el.innerHTML = _objQs.map((q,i) => `
            <div class="border border-blue-100 dark:border-gray-600 rounded-lg p-3 bg-blue-50/50 dark:bg-gray-700/40">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-blue-700 dark:text-blue-300">Q${i+1}</span>
                    <button onclick="window.physApp._removeObjQ(${i})" class="text-xs text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </div>
                <textarea rows="2" class="w-full text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1.5 mb-2"
                    placeholder="Question text…" oninput="window.physApp._updateObjQ(${i},'q',this.value)">${q.q}</textarea>
                <div class="grid grid-cols-2 gap-1.5 mb-2">
                    ${['a','b','c','d'].map(opt=>`
                    <div class="flex items-center gap-1.5">
                        <span class="text-xs font-bold text-gray-500 uppercase w-5 text-center">${opt})</span>
                        <input type="text" value="${q[opt]||''}" placeholder="Option ${opt.toUpperCase()}"
                            class="flex-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1"
                            oninput="window.physApp._updateObjQ(${i},'${opt}',this.value)">
                    </div>`).join('')}
                </div>
                <div class="flex flex-wrap items-center gap-3 text-xs">
                    <span class="text-gray-500 font-medium">Correct:</span>
                    ${['A','B','C','D'].map(opt=>`
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="ph-obj-ans-${i}" value="${opt}" ${q.ans===opt?'checked':''} onchange="window.physApp._updateObjQ(${i},'ans','${opt}')">
                        <span class="font-bold ${q.ans===opt?'text-green-700':'text-gray-500'}">${opt}</span>
                    </label>`).join('')}
                </div>
            </div>`).join('');
    }

    function renderTheoryQs() {
        const el = document.getElementById('ph-theory-list');
        const countEl = document.getElementById('ph-theory-count');
        if (countEl) countEl.textContent = `(${_theoryQs.length} question${_theoryQs.length!==1?'s':''})`;
        if (!el) return;
        if (_theoryQs.length === 0) { el.innerHTML = '<div class="text-sm text-gray-400 italic text-center py-3">No theory questions yet.</div>'; return; }
        el.innerHTML = _theoryQs.map((q,i) => `
            <div class="border border-purple-100 dark:border-gray-600 rounded-lg p-3 bg-purple-50/50 dark:bg-gray-700/40">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-purple-700 dark:text-purple-300">Question ${i+1}</span>
                    <button onclick="window.physApp._removeTheoryQ(${i})" class="text-xs text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </div>
                <textarea rows="3" class="w-full text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1.5 mb-2"
                    placeholder="Theory question / essay prompt…" oninput="window.physApp._updateTheoryQ(${i},'q',this.value)">${q.q}</textarea>
                <div class="flex items-center gap-2 text-xs">
                    <span class="text-gray-500">Marks:</span>
                    <input type="number" value="${q.marks||0}" min="0" class="w-16 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1"
                        oninput="window.physApp._updateTheoryQ(${i},'marks',+this.value)">
                </div>
            </div>`).join('');
    }

    window.physApp = {
        openModal(type) {
            _objQs = []; _theoryQs = []; _editingId = null;
            document.getElementById('ph-id').value = '';
            // Reset form fields
            ['ph-subject','ph-exam','ph-date','ph-duration','ph-marks','ph-instructions'].forEach(id => {
                const el = document.getElementById(id); if(el) el.value = id==='ph-duration'?90:id==='ph-marks'?100:'';
            });
            // Uncheck all class checkboxes
            document.querySelectorAll('input[name="ph-classes"]').forEach(cb => cb.checked = false);
            document.getElementById('ph-modal-title').textContent = 'Create Exam Paper';
            this._populateSyllabusDd('ph-ai-syllabus-obj');
            this._populateSyllabusDd('ph-ai-syllabus-theory');
            document.getElementById('phModal').classList.remove('hidden');
            renderObjQs(); renderTheoryQs();
        },
        closeModal() { document.getElementById('phModal').classList.add('hidden'); },
        addObjQ() { _objQs.push({ q:'', a:'', b:'', c:'', d:'', ans:'A' }); renderObjQs(); },
        addTheoryQ() { _theoryQs.push({ q:'', marks:10 }); renderTheoryQs(); },
        _updateObjQ(i, field, val) { if(_objQs[i]) _objQs[i][field]=val; },
        _updateTheoryQ(i, field, val) { if(_theoryQs[i]) _theoryQs[i][field]=val; },
        _removeObjQ(i) { _objQs.splice(i,1); renderObjQs(); },
        _removeTheoryQ(i) { _theoryQs.splice(i,1); renderTheoryQs(); },
        save() {
            const subj = document.getElementById('ph-subject').value;
            if (!subj) { alert('Select a subject.'); return; }
            const className = Array.from(document.querySelectorAll('input[name="ph-classes"]:checked')).map(c=>c.value).join(', ') || 'All';
            const obj = {
                id: _editingId || 'PH'+Date.now(),
                subject: subj,
                className,
                exam: document.getElementById('ph-exam').value,
                date: document.getElementById('ph-date').value,
                duration: +document.getElementById('ph-duration').value,
                marks: +document.getElementById('ph-marks').value,
                instructions: document.getElementById('ph-instructions').value,
                status: _objQs.length+_theoryQs.length > 0 ? 'Ready' : 'Draft',
                objQs: _objQs,
                theoryQs: _theoryQs
            };
            if (_editingId) { const i=papers.findIndex(p=>p.id===_editingId); papers[i]={...papers[i],...obj}; }
            else papers.push(obj);
            save(); this.closeModal(); render();
            if(typeof window.showToast==='function') window.showToast('success','Exam paper saved.');
        },
        edit(id) {
            const p = papers.find(x=>x.id===id); if(!p) return;
            _editingId = id; _objQs = JSON.parse(JSON.stringify(p.objQs||[])); _theoryQs = JSON.parse(JSON.stringify(p.theoryQs||[]));
            document.getElementById('ph-id').value = id;
            document.getElementById('ph-subject').value = p.subject;
            // Restore class checkboxes
            const selectedClasses = (p.className || '').split(', ').map(s=>s.trim());
            document.querySelectorAll('input[name="ph-classes"]').forEach(cb => {
                cb.checked = selectedClasses.includes(cb.value);
            });
            document.getElementById('ph-exam').value = p.exam;
            document.getElementById('ph-date').value = p.date;
            document.getElementById('ph-duration').value = p.duration;
            document.getElementById('ph-marks').value = p.marks;
            document.getElementById('ph-instructions').value = p.instructions||'';
            document.getElementById('ph-modal-title').textContent = 'Edit Exam Paper';
            this._populateSyllabusDd('ph-ai-syllabus-obj');
            this._populateSyllabusDd('ph-ai-syllabus-theory');
            document.getElementById('phModal').classList.remove('hidden');
            renderObjQs(); renderTheoryQs();
        },
        _populateSyllabusDd(selectId) {
            const sel = document.getElementById(selectId); if(!sel) return;
            const syllabi = JSON.parse(localStorage.getItem('sms_syllabi')||'[]');
            sel.innerHTML = '<option value="">— select from syllabus —</option>' +
                syllabi.map(s=>`<option value="${s.id||s.title}" data-title="${s.title||''}" data-subject="${s.subject||''}">${s.title} (${s.subject||''}${s.class?' · '+s.class:''})</option>`).join('');
        },
        aiGenerateObj() {
            const sel = document.getElementById('ph-ai-syllabus-obj');
            const count = +document.getElementById('ph-ai-count-obj').value || 5;
            const subject = document.getElementById('ph-subject')?.value || 'Mathematics';
            let topic = subject;
            if (sel && sel.value) { const opt = sel.options[sel.selectedIndex]; topic = opt.dataset.title || opt.text || subject; }
            const BANKS = {
                Mathematics:[{q:'If 5x = 25, find x',a:'4',b:'5',c:'3',d:'6',ans:'B'},{q:'Find the LCM of 6 and 8',a:'48',b:'24',c:'12',d:'6',ans:'B'},{q:'Simplify 3(x+2) − 2x',a:'x+6',b:'x+2',c:'5x+6',d:'2x+6',ans:'A'},{q:'Area of a triangle with base 6cm and height 8cm',a:'48cm²',b:'24cm²',c:'14cm²',d:'12cm²',ans:'B'},{q:'What is 0.5 as a fraction?',a:'1/5',b:'1/4',c:'1/2',d:'5/10',ans:'C'}],
                Physics:[{q:'Work done = Force × ?',a:'Mass',b:'Distance',c:'Speed',d:'Time',ans:'B'},{q:'Which is NOT a vector?',a:'Force',b:'Velocity',c:'Speed',d:'Displacement',ans:'C'},{q:'Unit of electrical potential',a:'Ampere',b:'Ohm',c:'Volt',d:'Watt',ans:'C'},{q:'Power = Work / ?',a:'Force',b:'Distance',c:'Mass',d:'Time',ans:'D'},{q:'Wavelength × Frequency = ?',a:'Amplitude',b:'Speed',c:'Period',d:'Energy',ans:'B'}],
                default:[{q:`Q1: What is the main concept of ${topic}?`,a:'A',b:'B',c:'C',d:'D',ans:'A'},{q:`Q2: Give an example of ${topic}`,a:'A',b:'B',c:'C',d:'D',ans:'B'},{q:`Q3: ${topic} is best described as:`,a:'A',b:'B',c:'C',d:'D',ans:'C'},{q:`Q4: Which applies to ${topic}?`,a:'A',b:'B',c:'C',d:'D',ans:'A'},{q:`Q5: State a law/rule about ${topic}`,a:'A',b:'B',c:'C',d:'D',ans:'D'}]
            };
            const pool = BANKS[subject] || BANKS.default;
            const generated = [];
            for(let i=0; i<Math.min(count,10); i++) generated.push({...pool[i % pool.length]});
            _objQs = [..._objQs, ...generated];
            renderObjQs();
            alert(`✅ ${generated.length} MCQ questions generated from "${topic}" and added to Section A.`);
        },
        aiGenerateTheory() {
            const sel = document.getElementById('ph-ai-syllabus-theory');
            const count = +document.getElementById('ph-ai-count-theory').value || 3;
            const subject = document.getElementById('ph-subject')?.value || 'Mathematics';
            let topic = subject;
            if (sel && sel.value) { const opt = sel.options[sel.selectedIndex]; topic = opt.dataset.title || opt.text || subject; }
            const THEORY = [
                `Explain in detail the concept of ${topic} with relevant examples. [10 marks]`,
                `State and prove any two important principles of ${topic}. [10 marks]`,
                `Give three real-world applications of ${topic} and explain how each applies. [10 marks]`,
                `A student claims that ${topic} is not relevant in everyday life. Do you agree? Justify your answer with examples. [10 marks]`,
                `With the aid of a diagram/graph where applicable, describe the main features of ${topic}. [10 marks]`,
            ];
            const generated = [];
            for(let i=0; i<Math.min(count,5); i++) generated.push({ q: THEORY[i % THEORY.length], marks: 10 });
            _theoryQs = [..._theoryQs, ...generated];
            renderTheoryQs();
            alert(`✅ ${generated.length} theory questions generated from "${topic}" and added to Section B.`);
        },
        del(id) {
            if(!confirm('Delete this exam paper?')) return;
            papers = papers.filter(p=>p.id!==id); save(); render();
        },
        viewQuestions(id) {
            const p = papers.find(x=>x.id===id); if(!p) return;
            _viewPaperId = id;
            document.getElementById('ph-view-title').textContent = `${p.subject} — ${p.exam} (${p.className})`;
            const c = document.getElementById('ph-view-content');
            const objHtml = (p.objQs||[]).length===0 ? '<p class="text-gray-400 text-sm italic">No objective questions.</p>' :
                `<ol class="list-decimal list-inside space-y-3 text-sm text-gray-800 dark:text-gray-200">
                    ${(p.objQs||[]).map((q,i)=>`
                    <li class="mb-1"><span class="font-medium">${q.q}</span>
                        <ul class="mt-1 grid grid-cols-2 gap-0.5 ml-4">
                            ${['a','b','c','d'].map(opt=>`<li class="${q.ans===opt.toUpperCase()?'font-bold text-green-700 dark:text-green-400':'text-gray-600 dark:text-gray-400'}"><span class="uppercase">${opt})</span> ${q[opt]}</li>`).join('')}
                        </ul>
                    </li>`).join('')}
                </ol>`;
            const theoryHtml = (p.theoryQs||[]).length===0 ? '<p class="text-gray-400 text-sm italic">No theory questions.</p>' :
                `<ol class="list-decimal list-inside space-y-3 text-sm text-gray-800 dark:text-gray-200">
                    ${(p.theoryQs||[]).map((q,i)=>`<li class="leading-relaxed">${q.q} <span class="text-xs text-gray-500 ml-2">[${q.marks||0} marks]</span></li>`).join('')}
                </ol>`;
            c.innerHTML = `
                <div class="mb-5">
                    <p class="text-xs text-gray-500 mb-3">${p.instructions||''}</p>
                    <h4 class="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <span class="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full">A</span>
                        Section A — Objective (${(p.objQs||[]).length} Questions)
                    </h4>
                    ${objHtml}
                </div>
                <hr class="dark:border-gray-700 my-4">
                <div>
                    <h4 class="font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                        <span class="w-5 h-5 flex items-center justify-center bg-purple-600 text-white text-xs rounded-full">B</span>
                        Section B — Theory (${(p.theoryQs||[]).length} Questions)
                    </h4>
                    ${theoryHtml}
                </div>`;
            document.getElementById('phViewModal').classList.remove('hidden');
        },
        printPaper(id) {
            const pid = id || _viewPaperId;
            const p = papers.find(x=>x.id===pid); if(!p) return;
            const win = window.open('','_blank','width=794,height=1123');
            win.document.write(`<!DOCTYPE html><html><head><title>${p.subject} Exam Paper</title>
            <style>
                body{font-family:Arial,sans-serif;padding:40px;font-size:13px;color:#111}
                h1{text-align:center;font-size:16px;margin-bottom:4px}
                .meta{text-align:center;font-size:12px;color:#555;margin-bottom:28px}
                .section-title{font-weight:bold;font-size:14px;border-bottom:2px solid #333;padding-bottom:4px;margin:20px 0 12px}
                ol li{margin-bottom:12px;line-height:1.7}
                .options{display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-top:4px;margin-left:16px;font-size:12px}
                .theory-q{margin-bottom:16px}
                .lines{border-bottom:1px solid #ccc;height:60px;margin-top:6px}
                @media print{body{padding:20px}}
            </style></head><body>
            <h1>GREENFIELD HIGH SCHOOL</h1>
            <div class="meta">
                <strong>${p.exam}</strong> &nbsp;|&nbsp; <strong>${p.subject}</strong> &nbsp;|&nbsp; Class: ${p.className}<br>
                Duration: ${p.duration} minutes &nbsp;|&nbsp; Total Marks: ${p.marks}<br>
                <em>${p.instructions||''}</em>
            </div>
            ${(p.objQs||[]).length>0?`
            <div class="section-title">SECTION A — OBJECTIVE (Answer ALL Questions)</div>
            <ol>${(p.objQs||[]).map((q,i)=>`
                <li>${q.q}
                    <div class="options">
                        <span>A) ${q.a}</span><span>B) ${q.b}</span>
                        <span>C) ${q.c}</span><span>D) ${q.d}</span>
                    </div>
                </li>`).join('')}
            </ol>`:''}
            ${(p.theoryQs||[]).length>0?`
            <div class="section-title">SECTION B — THEORY (Answer ${Math.min(3,p.theoryQs.length)} Questions)</div>
            <ol>${(p.theoryQs||[]).map(q=>`
                <li class="theory-q">${q.q} <em style="font-size:11px;color:#666">(${q.marks||0} marks)</em>
                    <div class="lines"></div>
                </li>`).join('')}
            </ol>`:''}
            </body></html>`);
            win.document.close();
            setTimeout(()=>win.print(), 400);
        }
    };

    render();
})();
