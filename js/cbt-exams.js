// CBT Exams Module — questions live inside the create modal
(function() {
    const KEY = 'sms_cbt_sessions';
    let sessions = JSON.parse(localStorage.getItem(KEY) || '[]');
    let currentTab = 'all';

    // In-modal question state
    let _modalQs = [];

    const SEED = [
        { id:'CBT001', title:'WAEC Mock – Mathematics', type:'mock', className:'SSS3', subject:'Mathematics', duration:90, date:'2024-11-10T09:00', passmark:50, shuffle:true, showAns:true, negativeMarking:false, status:'Completed', attempted:42,
          qBank:[
            { q:'If 2x + 5 = 13, find x', a:'3', b:'4', c:'9', d:'6', ans:'B' },
            { q:'Evaluate log₁₀(1000)', a:'2', b:'4', c:'3', d:'10', ans:'C' },
            { q:'LCM of 6 and 9', a:'3', b:'18', c:'54', d:'12', ans:'B' },
          ]
        },
        { id:'CBT002', title:'First Term Real CBT – Physics', type:'real', className:'SSS2', subject:'Physics', duration:60, date:'2024-11-20T08:00', passmark:50, shuffle:true, showAns:false, negativeMarking:false, status:'Upcoming', attempted:0,
          qBank:[
            { q:'Unit of force is?', a:'Joule', b:'Watt', c:'Newton', d:'Pascal', ans:'C' },
            { q:'Which is a vector quantity?', a:'Distance', b:'Speed', c:'Mass', d:'Velocity', ans:'D' },
          ]
        },
        { id:'CBT003', title:'JAMB Practice – Economics', type:'mock', className:'SSS3', subject:'Economics', duration:45, date:'2024-11-15T14:00', passmark:45, shuffle:true, showAns:true, negativeMarking:false, status:'Active', attempted:20,
          qBank:[
            { q:'Full form of GDP?', a:'Gross Domestic Product', b:'General Domestic Price', c:'Gross Development Plan', d:'Government Domestic Policy', ans:'A' },
            { q:'When supply increases and demand is constant, price will?', a:'Rise', b:'Fall', c:'Stay same', d:'Double', ans:'B' },
          ]
        },
    ];

    if (sessions.length === 0) { sessions = SEED; save(); }

    function save() { localStorage.setItem(KEY, JSON.stringify(sessions)); }

    function statusBadge(s) {
        const m = { Active:'bg-green-100 text-green-800', Upcoming:'bg-yellow-100 text-yellow-800', Completed:'bg-gray-100 text-gray-700', Draft:'bg-blue-100 text-blue-800' };
        return `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${m[s]||m.Draft}">${s}</span>`;
    }

    function typeBadge(t) {
        return t==='mock'
            ? `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Mock</span>`
            : `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">Real</span>`;
    }

    function render() {
        const visible = currentTab==='all' ? sessions : sessions.filter(s=>s.type===currentTab);
        const el = id => document.getElementById(id);
        if(el('cbt-total'))     el('cbt-total').textContent     = sessions.length;
        if(el('cbt-mock'))      el('cbt-mock').textContent      = sessions.filter(s=>s.type==='mock').length;
        if(el('cbt-real'))      el('cbt-real').textContent      = sessions.filter(s=>s.type==='real').length;
        if(el('cbt-attempted')) el('cbt-attempted').textContent = sessions.reduce((a,s)=>a+(s.attempted||0),0);
        if(el('cbt-table-title')) el('cbt-table-title').textContent = currentTab==='all'?'All CBT Sessions':currentTab==='mock'?'Mock / Practice Sessions':'Real Exam Sessions';

        const tbody = el('cbt-table-body');
        if (!tbody) return;
        if (visible.length===0) { tbody.innerHTML='<tr><td colspan="9" class="px-4 py-8 text-center text-gray-400">No sessions found.</td></tr>'; return; }
        tbody.innerHTML = visible.map(s=>`
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[180px] truncate">${s.title}</td>
                <td class="px-4 py-3">${typeBadge(s.type)}</td>
                <td class="px-4 py-3">${s.className}</td>
                <td class="px-4 py-3">${s.subject}</td>
                <td class="px-4 py-3">
                    <span class="font-semibold text-primary-700 dark:text-primary-400">${(s.qBank||[]).length}</span>
                    <span class="text-gray-400 text-xs ml-0.5">Q</span>
                </td>
                <td class="px-4 py-3">${s.duration} min</td>
                <td class="px-4 py-3 text-sm">${s.date ? new Date(s.date).toLocaleString() : '—'}</td>
                <td class="px-4 py-3">${statusBadge(s.status)}</td>
                <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                        <button onclick="window.cbtApp.viewQs('${s.id}')" class="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700" title="View Questions">
                            <i class="fas fa-eye mr-1"></i><span class="hidden sm:inline">Questions</span>
                        </button>
                        <button onclick="window.cbtApp.startExam('${s.id}')" class="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700" title="Start Exam">
                            <i class="fas fa-play"></i><span class="hidden sm:inline ml-1">Start</span>
                        </button>
                        <button onclick="window.cbtApp.edit('${s.id}')" class="text-xs px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.cbtApp.toggleStatus('${s.id}')" class="text-xs px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40" title="Toggle Status">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button onclick="window.cbtApp.del('${s.id}')" class="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`).join('');
    }

    function renderModalQs() {
        const el = document.getElementById('cbt-modal-qlist');
        const countEl = document.getElementById('cbt-modal-q-count');
        if (countEl) countEl.textContent = `(${_modalQs.length} question${_modalQs.length!==1?'s':''})`;
        if (!el) return;
        if (_modalQs.length===0) { el.innerHTML='<div class="text-sm text-gray-400 italic text-center py-4">No questions yet. Click "+ Add Question" above.</div>'; return; }
        el.innerHTML = _modalQs.map((q,i)=>`
            <div class="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700/40">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">Q${i+1}</span>
                    <button type="button" onclick="window.cbtApp._removeModalQ(${i})" class="text-xs text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button>
                </div>
                <textarea rows="2" class="w-full text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1.5 mb-2"
                    placeholder="Question text…" oninput="window.cbtApp._updateModalQ(${i},'q',this.value)">${q.q}</textarea>
                <div class="grid grid-cols-2 gap-1.5 mb-2">
                    ${['a','b','c','d'].map(opt=>`
                    <div class="flex items-center gap-1">
                        <span class="text-xs font-bold text-gray-500 uppercase w-5 text-center">${opt})</span>
                        <input type="text" value="${q[opt]||''}" placeholder="Option ${opt.toUpperCase()}"
                            class="flex-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-1"
                            oninput="window.cbtApp._updateModalQ(${i},'${opt}',this.value)">
                    </div>`).join('')}
                </div>
                <div class="flex flex-wrap items-center gap-3 text-xs border-t dark:border-gray-600 pt-2">
                    <span class="text-gray-500 font-medium">Correct Answer:</span>
                    ${['A','B','C','D'].map(opt=>`
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="cbt-ans-${i}" value="${opt}" ${q.ans===opt?'checked':''} onchange="window.cbtApp._updateModalQ(${i},'ans','${opt}')">
                        <span class="font-bold ${q.ans===opt?'text-green-700 dark:text-green-400':'text-gray-500'}">${opt}</span>
                    </label>`).join('')}
                </div>
            </div>`).join('');
    }

    window.cbtApp = {
        setTab(tab) {
            currentTab=tab;
            document.querySelectorAll('.cbt-tab').forEach(b=>{
                const active=b.dataset.tab===tab;
                b.classList.toggle('border-primary-600',active); b.classList.toggle('text-primary-600',active);
                b.classList.toggle('dark:text-primary-400',active); b.classList.toggle('border-transparent',!active);
                b.classList.toggle('text-gray-500',!active);
            });
            render();
        },
        _populateSyllabusDd(selectId) {
            const sel = document.getElementById(selectId); if(!sel) return;
            const syllabi = JSON.parse(localStorage.getItem('sms_syllabi')||'[]');
            sel.innerHTML = '<option value="">— select from syllabus —</option>' +
                syllabi.map(s=>`<option value="${s.id||s.title}" data-title="${s.title||''}">${s.title} (${s.subject||''}${s.class?' · '+s.class:''})</option>`).join('');
        },
        openModal(type) {
            _modalQs=[];
            document.getElementById('cbt-form').reset();
            document.getElementById('cbt-id').value='';
            document.getElementById('cbt-type-input').value=type;
            const isReal=type==='real';
            const lbl=document.getElementById('cbt-type-label');
            if(lbl){
                lbl.innerHTML=isReal?'Creating a <strong>Real Exam</strong> session. Results are official and final.':'Creating a <strong>Mock / Practice</strong> session. Students can retake multiple times.';
                lbl.parentElement.className=`flex items-center gap-2 p-3 rounded-lg border ${isReal?'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700':'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'}`;
            }
            document.getElementById('cbt-modal-title').textContent=isReal?'New Real CBT Exam':'New Mock CBT Session';
            this._populateSyllabusDd('cbt-ai-syllabus');
            document.getElementById('cbtModal').classList.remove('hidden');
            renderModalQs();
        },
        closeModal() { document.getElementById('cbtModal').classList.add('hidden'); },
        addModalQ() { _modalQs.push({q:'',a:'',b:'',c:'',d:'',ans:'A'}); renderModalQs(); },
        _updateModalQ(i,field,val) { if(_modalQs[i]) _modalQs[i][field]=val; },
        _removeModalQ(i) { _modalQs.splice(i,1); renderModalQs(); },
        save() {
            const id=document.getElementById('cbt-id').value;
            const obj={
                id: id||'CBT'+Date.now(),
                title: document.getElementById('cbt-title').value,
                type: document.getElementById('cbt-type-input').value,
                className: Array.from(document.querySelectorAll('input[name="cbt-classes"]:checked')).map(c=>c.value).join(', ') || 'All',
                subject: document.getElementById('cbt-subject').value,
                duration: +document.getElementById('cbt-duration').value,
                date: document.getElementById('cbt-date').value,
                passmark: +document.getElementById('cbt-passmark').value,
                shuffle: document.getElementById('cbt-shuffle').checked,
                showAns: document.getElementById('cbt-show-ans').checked,
                negativeMarking: document.getElementById('cbt-negative').checked,
                status: 'Upcoming', attempted: 0,
                qBank: JSON.parse(JSON.stringify(_modalQs))
            };
            if(!obj.title){alert('Title is required.');return;}
            if(id){const i=sessions.findIndex(s=>s.id===id); sessions[i]={...sessions[i],...obj};}
            else sessions.push(obj);
            save(); this.closeModal(); render();
        },
        edit(id) {
            const s=sessions.find(x=>x.id===id); if(!s) return;
            _modalQs=JSON.parse(JSON.stringify(s.qBank||[]));
            document.getElementById('cbt-id').value=s.id;
            document.getElementById('cbt-type-input').value=s.type;
            document.getElementById('cbt-title').value=s.title;
            document.querySelectorAll('input[name="cbt-classes"]').forEach(cb => {
                cb.checked = (s.className || '').split(', ').includes(cb.value);
            });
            document.getElementById('cbt-subject').value=s.subject;
            document.getElementById('cbt-duration').value=s.duration;
            document.getElementById('cbt-date').value=s.date||'';
            document.getElementById('cbt-passmark').value=s.passmark;
            document.getElementById('cbt-shuffle').checked=!!s.shuffle;
            document.getElementById('cbt-show-ans').checked=!!s.showAns;
            document.getElementById('cbt-negative').checked=!!s.negativeMarking;
            document.getElementById('cbt-modal-title').textContent='Edit CBT Session';
            this._populateSyllabusDd('cbt-ai-syllabus');
            document.getElementById('cbtModal').classList.remove('hidden');
            renderModalQs();
        },
        aiGenerate() {
            const sel = document.getElementById('cbt-ai-syllabus');
            const count = +document.getElementById('cbt-ai-count').value || 5;
            const subject = document.getElementById('cbt-subject')?.value || 'Mathematics';
            let topic = subject;
            if (sel && sel.value) { const opt = sel.options[sel.selectedIndex]; topic = opt.dataset.title || opt.text || subject; }
            const BANKS = {
                Mathematics:[{q:'Evaluate: 5² − 4²',a:'3',b:'9',c:'41',d:'5',ans:'B'},{q:'If 4y = 20, y = ?',a:'4',b:'5',c:'80',d:'16',ans:'B'},{q:'HCF of 24 and 36',a:'6',b:'12',c:'18',d:'4',ans:'B'},{q:'Angle sum of a triangle',a:'360°',b:'90°',c:'180°',d:'270°',ans:'C'},{q:'Find x if x/3 = 7',a:'10',b:'21',c:'4',d:'3',ans:'B'}],
                Physics:[{q:'Unit of pressure',a:'Newton',b:'Joule',c:'Pascal',d:'Watt',ans:'C'},{q:'Ohm\'s law: V =?',a:'IR',b:'I/R',c:'I²R',d:'R/I',ans:'A'},{q:'Weight = mass × ?',a:'Speed',b:'Gravity',c:'Density',d:'Volume',ans:'B'},{q:'Unit of electric charge',a:'Volt',b:'Ohm',c:'Watt',d:'Coulomb',ans:'D'},{q:'Longitudinal wave example',a:'Light',b:'X-ray',c:'Sound',d:'Radio',ans:'C'}],
                default:[{q:`Q1: Key concept in ${topic}?`,a:'A',b:'B',c:'C',d:'D',ans:'A'},{q:`Q2: Definition in ${topic}?`,a:'A',b:'B',c:'C',d:'D',ans:'B'},{q:`Q3: Application of ${topic}?`,a:'A',b:'B',c:'C',d:'D',ans:'C'},{q:`Q4: Example from ${topic}?`,a:'A',b:'B',c:'C',d:'D',ans:'A'},{q:`Q5: Principle of ${topic}?`,a:'A',b:'B',c:'C',d:'D',ans:'D'}],
            };
            const pool = BANKS[subject] || BANKS.default;
            const generated = [];
            for(let i=0; i<Math.min(count,10); i++) generated.push({...pool[i % pool.length]});
            _modalQs = [..._modalQs, ...generated];
            renderModalQs();
            alert(`✅ ${generated.length} AI questions generated from "${topic}" and added. Review and edit as needed.`);
        },
        toggleStatus(id) {
            const s=sessions.find(x=>x.id===id); if(!s) return;
            const cycle={Upcoming:'Active',Active:'Completed',Completed:'Upcoming',Draft:'Upcoming'};
            s.status=cycle[s.status]||'Upcoming'; save(); render();
        },
        del(id) { if(!confirm('Delete this session?')) return; sessions=sessions.filter(s=>s.id!==id); save(); render(); },
        viewQs(id) {
            const s=sessions.find(x=>x.id===id); if(!s) return;
            document.getElementById('cbt-view-title').textContent=`${s.title} — ${(s.qBank||[]).length} Questions`;
            const qs=s.qBank||[];
            document.getElementById('cbt-view-content').innerHTML=qs.length===0
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
            document.getElementById('cbtViewModal').classList.remove('hidden');
        },
        startExam(id) {
            const s=sessions.find(x=>x.id===id); if(!s) return;
            if(s.status==='Completed'){alert('This session is already completed.');return;}
            if(!(s.qBank||[]).length){alert('Cannot start — no questions added yet.');return;}
            const typeLabel=s.type==='real'?'🔴 REAL EXAM':'🟡 Mock Session';
            if(!confirm(`${typeLabel}\nStart: "${s.title}"?\n${s.className} — ${(s.qBank||[]).length} questions, ${s.duration} min`)) return;
            s.status='Active'; save(); render();
            if(typeof window.showToast==='function') window.showToast('success','CBT session is now ACTIVE.');
        }
    };

    render();
})();
