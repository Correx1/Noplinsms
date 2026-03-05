// AI & Automations Module
(function() {

    const TOOLS = {
        questions: {
            title: '🤖 Exam Question Generator',
            render: () => `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Subject</label>
                            <select id="ai-q-subject" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                                <option>Mathematics</option><option>English Language</option><option>Physics</option>
                                <option>Chemistry</option><option>Biology</option><option>Economics</option>
                                <option>Government</option><option>History</option><option>Geography</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Class Level</label>
                            <select id="ai-q-class" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                                <option>JSS1</option><option>JSS2</option><option>JSS3</option>
                                <option>SSS1</option><option>SSS2</option><option>SSS3</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Type</label>
                            <select id="ai-q-type" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                                <option value="mcq">Objective (MCQ)</option>
                                <option value="theory">Theory / Essay</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Topic / Prompt (optional)</label>
                        <input type="text" id="ai-q-topic" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2" placeholder="e.g. Quadratic Equations, Photosynthesis, Nigerian Civil War…">
                    </div>
                    <div>
                        <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Or Select from Syllabus <span class="text-gray-400 font-normal">(auto-fills subject/topic)</span></label>
                        <select id="ai-q-syllabus" onchange="window.aiApp.onSyllabusSelect()" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                            <option value="">— pick a saved syllabus —</option>
                            ${(()=>{ const s=JSON.parse(localStorage.getItem('sms_syllabi')||'[]'); return s.map(x=>`<option value="${x.id||x.title}" data-subject="${x.subject||''}" data-topic="${x.title||''}">${x.title} (${x.subject||''}${x.class?' · '+x.class:''})</option>`).join(''); })()}
                        </select>
                    </div>
                    <div class="flex items-center gap-3">
                        <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Number of Questions:</label>
                        <input type="number" id="ai-q-count" value="5" min="1" max="40" class="w-16 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                    </div>
                    <button onclick="window.aiApp.generate('questions')" class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg">
                        <i class="fas fa-magic"></i> Generate Questions
                    </button>
                    <div id="ai-output" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 space-y-3 max-h-96 overflow-y-auto"></div>
                </div>`
        },
        finance: {
            title: '📊 Financial Insights Report',
            render: () => `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Report Period</label>
                            <select id="ai-fin-period" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                                <option>First Term 2024/2025</option><option>Second Term 2024/2025</option><option>Full Year 2024/2025</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Focus Area</label>
                            <select id="ai-fin-focus" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                                <option>Fee Collection Overview</option><option>Outstanding Payments</option><option>Expense Analysis</option><option>Revenue Trends</option>
                            </select>
                        </div>
                    </div>
                    <button onclick="window.aiApp.generate('finance')" class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg">
                        <i class="fas fa-magic"></i> Generate Financial Report
                    </button>
                    <div id="ai-output" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 space-y-2 max-h-96 overflow-y-auto"></div>
                </div>`
        },
        lesson: {
            title: '📖 Lesson Plan Generator',
            render: () => `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Subject</label>
                            <input type="text" id="ai-lp-subject" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2" placeholder="e.g. Biology">
                        </div>
                        <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Topic</label>
                            <input type="text" id="ai-lp-topic" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2" placeholder="e.g. Cell Structure">
                        </div>
                        <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Duration</label>
                            <select id="ai-lp-dur" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                                <option>40 minutes</option><option>60 minutes</option><option>80 minutes</option>
                            </select>
                        </div>
                    </div>
                    <button onclick="window.aiApp.generate('lesson')" class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg">
                        <i class="fas fa-magic"></i> Generate Lesson Plan
                    </button>
                    <div id="ai-output" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 space-y-2 max-h-96 overflow-y-auto"></div>
                </div>`
        },
        report: {
            title: '🎓 Student Performance Summary',
            render: () => {
                const students = JSON.parse(localStorage.getItem('sms_students')||'[]');
                const opts = students.slice(0,50).map(s=>`<option value="${s.id}">${s.name} (${s.className})</option>`).join('');
                return `<div class="space-y-4">
                    <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Select Student</label>
                        <select id="ai-st-sel" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">${opts||'<option>No students yet</option>'}</select>
                    </div>
                    <button onclick="window.aiApp.generate('report')" class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg">
                        <i class="fas fa-magic"></i> Generate Summary
                    </button>
                    <div id="ai-output" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 space-y-2 max-h-96 overflow-y-auto"></div>
                </div>`;
            }
        },
        notice: {
            title: '📢 Notice / Circular Writer',
            render: () => `
                <div class="space-y-4">
                    <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Notice Type</label>
                        <select id="ai-ntc-type" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                            <option>Exam Timetable Notice</option><option>School Closure Notice</option><option>Parent-Teacher Meeting</option>
                            <option>Fee Payment Reminder</option><option>Sports Day Announcement</option><option>Custom Notice</option>
                        </select>
                    </div>
                    <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Key Details (optional)</label>
                        <textarea id="ai-ntc-details" rows="2" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2" placeholder="e.g. Exams start 20th November, Parents must attend…"></textarea>
                    </div>
                    <button onclick="window.aiApp.generate('notice')" class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">
                        <i class="fas fa-magic"></i> Write Notice
                    </button>
                    <div id="ai-output" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 space-y-2 max-h-96 overflow-y-auto"></div>
                </div>`
        },
        timetable: {
            title: '📅 Timetable Optimizer',
            render: () => `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Class</label>
                            <select id="ai-tt-class" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                                <option>SSS1A</option><option>SSS2A</option><option>SSS3A</option><option>JSS1A</option><option>JSS2A</option><option>JSS3A</option>
                            </select>
                        </div>
                        <div><label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Periods per Day</label>
                            <input type="number" id="ai-tt-periods" value="8" min="4" max="10" class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-2">
                        </div>
                    </div>
                    <button onclick="window.aiApp.generate('timetable')" class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
                        <i class="fas fa-magic"></i> Optimize Timetable
                    </button>
                    <div id="ai-output" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 space-y-2 max-h-96 overflow-y-auto"></div>
                </div>`
        }
    };

    // Simulated AI responses
    const RESPONSES = {
        questions: (form) => {
            const subj = document.getElementById('ai-q-subject')?.value || 'Mathematics';
            const cls = document.getElementById('ai-q-class')?.value || 'SSS1';
            const type = document.getElementById('ai-q-type')?.value || 'mcq';
            const topic = document.getElementById('ai-q-topic')?.value || subj;
            const count = +document.getElementById('ai-q-count')?.value || 5;
            const banks = {
                Mathematics: [
                    {q:'If x + 5 = 12, find x', a:'5', b:'7', c:'6', d:'8', ans:'B'},
                    {q:'Find the area of a circle with radius 7cm (π=22/7)', a:'154cm²', b:'144cm²', c:'22cm²', d:'49cm²', ans:'A'},
                    {q:'Simplify: 3(2x + 4) - 2(x + 1)', a:'4x + 10', b:'4x + 14', c:'8x + 10', d:'6x + 10', ans:'A'},
                    {q:'What is 25% of 200?', a:'25', b:'50', c:'75', d:'100', ans:'B'},
                    {q:'The mean of 4, 6, 8, 10, 12 is?', a:'8', b:'10', c:'9', d:'7', ans:'A'},
                ],
                Physics: [
                    {q:'Unit of power is?', a:'Joule', b:'Newton', c:'Watt', d:'Pascal', ans:'C'},
                    {q:'What is the speed of light in vacuum?', a:'3×10⁸ m/s', b:'3×10⁶ m/s', c:'3×10⁴ m/s', d:'3×10¹⁰ m/s', ans:'A'},
                ],
                default: [
                    {q:`Define the key concept of ${topic} as applied in ${cls}.`, a:'Option A', b:'Option B', c:'Option C', d:'Option D', ans:'A'},
                ]
            };
            const pool = banks[subj] || banks.default;
            const qs = [];
            for (let i = 0; i < Math.min(count, 10); i++) { qs.push(pool[i % pool.length]); }
            if (type === 'mcq' || type === 'mixed') {
                return `<p class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Generated ${qs.length} MCQ Question(s) — ${subj} / ${cls}</p>` +
                    qs.map((q,i)=>`<div class="border dark:border-gray-600 rounded-lg p-3 mb-2 bg-white dark:bg-gray-800">
                        <p class="font-medium mb-1">${i+1}. ${q.q}</p>
                        <div class="grid grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <span class="${q.ans==='A'?'font-bold text-green-700':''}">A) ${q.a}</span>
                            <span class="${q.ans==='B'?'font-bold text-green-700':''}">B) ${q.b}</span>
                            <span class="${q.ans==='C'?'font-bold text-green-700':''}">C) ${q.c}</span>
                            <span class="${q.ans==='D'?'font-bold text-green-700':''}">D) ${q.d}</span>
                        </div>
                        <p class="text-xs text-green-600 font-semibold mt-1">✓ Answer: ${q.ans}</p>
                    </div>`).join('') +
                    `<div class="flex gap-2 mt-3">
                        <button onclick="window.aiApp.copyToClipboard()" class="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">📋 Copy</button>
                        <button onclick="window.aiApp.useInExam()" class="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">➕ Use in Exam Builder</button>
                    </div>`;
            }
            return `<p class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Theory Questions — ${subj} / ${cls}</p>` +
                Array.from({length:Math.min(count,5)},(_,i)=>`<div class="border dark:border-gray-600 rounded-lg p-3 mb-2 bg-white dark:bg-gray-800">
                    <p class="font-medium">${i+1}. Explain with examples the concept of <em>${topic}</em> as studied in ${subj} at ${cls} level. [10 marks]</p>
                </div>`).join('');
        },
        finance: () => {
            const payments = JSON.parse(localStorage.getItem('sms_payments')||'[]');
            const total = payments.reduce((a,p)=>a+(+p.amount||0),0);
            const paid = payments.filter(p=>p.status==='Paid').reduce((a,p)=>a+(+p.amount||0),0);
            return `<div class="space-y-3">
                <h4 class="font-bold text-gray-900 dark:text-white">📊 AI Financial Analysis</h4>
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"><div class="text-xs text-green-600">Total Collected</div><div class="text-lg font-bold text-green-700">₦${paid.toLocaleString()||'1,245,000'}</div></div>
                    <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3"><div class="text-xs text-red-600">Outstanding</div><div class="text-lg font-bold text-red-700">₦${(total-paid).toLocaleString()||'385,000'}</div></div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                    <p class="font-semibold mb-1">AI Insights:</p>
                    <ul class="list-disc list-inside space-y-1 text-xs">
                        <li>Fee collection rate stands at approximately <strong>76%</strong> this term.</li>
                        <li>SSS3 classes show highest compliance; JSS1 has the most outstanding balances.</li>
                        <li>Recommend sending automated reminders to 24% of students with pending fees.</li>
                        <li>Consider an instalment plan policy for families with consistent late payments.</li>
                    </ul>
                </div>
            </div>`;
        },
        lesson: () => {
            const subj = document.getElementById('ai-lp-subject')?.value || 'Biology';
            const topic = document.getElementById('ai-lp-topic')?.value || 'Cell Division';
            const dur = document.getElementById('ai-lp-dur')?.value || '40 minutes';
            return `<div class="space-y-2 text-sm">
                <h4 class="font-bold text-base">${subj}: ${topic}</h4>
                <p class="text-gray-500">Duration: ${dur}</p>
                <div class="border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 space-y-2">
                    <p class="font-semibold text-primary-600">Learning Objectives</p>
                    <ul class="list-disc list-inside text-xs space-y-1 text-gray-700 dark:text-gray-300">
                        <li>Define and explain the key concept of ${topic}</li>
                        <li>Identify the stages/components with real-world examples</li>
                        <li>Apply knowledge to solve related problems</li>
                    </ul>
                </div>
                <div class="border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 space-y-2">
                    <p class="font-semibold text-primary-600">Lesson Activities</p>
                    <div class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                        <p>🕐 0–5 min: <strong>Introduction</strong> — Review prior knowledge with quick Q&A</p>
                        <p>🕐 5–20 min: <strong>Direct Teaching</strong> — Explain ${topic} with diagrams on board</p>
                        <p>🕐 20–30 min: <strong>Group Activity</strong> — Students label diagrams and discuss</p>
                        <p>🕐 30–38 min: <strong>Assessment</strong> — Short quiz (5 questions)</p>
                        <p>🕐 38–40 min: <strong>Summary & Homework</strong> — Assignment on topic</p>
                    </div>
                </div>
            </div>`;
        },
        report: () => {
            const sel = document.getElementById('ai-st-sel');
            const students = JSON.parse(localStorage.getItem('sms_students')||'[]');
            const s = students.find(x=>x.id===sel.value)||students[0]||{name:'Student',className:'SSS2'};
            return `<div class="space-y-2 text-sm">
                <h4 class="font-bold">${s.name} — ${s.className}</h4>
                <p class="text-gray-500 text-xs">AI-generated academic performance summary</p>
                <div class="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg p-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>${s.name} is a student in ${s.className} with an overall satisfactory academic performance this term. Based on available records, the student demonstrates strong interest in core subjects and participates actively in classroom activities.</p>
                    <br><p><strong>Strengths:</strong> Shows particular aptitude in quantitative subjects. Completes assignments consistently and maintains good classroom conduct.</p>
                    <br><p><strong>Areas for Improvement:</strong> Could benefit from additional support in essay writing and analytical comprehension tasks. Attendance should be monitored more closely to prevent gaps in learning.</p>
                    <br><p><strong>Recommendation:</strong> We recommend enrollment in the after-school tutoring programme and regular parent-teacher check-ins to ensure continued progress.</p>
                </div>
            </div>`;
        },
        notice: () => {
            const type = document.getElementById('ai-ntc-type')?.value || 'Exam Timetable Notice';
            const details = document.getElementById('ai-ntc-details')?.value || '';
            return `<div class="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg p-4 text-sm text-gray-800 dark:text-gray-200">
                <p class="text-center font-bold text-base mb-1">GREENFIELD HIGH SCHOOL</p>
                <p class="text-center text-sm font-semibold mb-4">${type.toUpperCase()}</p>
                <p class="mb-3">Dear Parents/Guardians and Students,</p>
                <p class="mb-3">This is to officially inform all stakeholders that the school management has arranged the <strong>${type}</strong> as follows. ${details ? `Additional information: ${details}` : 'Please read carefully and take note of all relevant dates and requirements.'}</p>
                <p class="mb-3">All students are expected to comply fully with the guidelines outlined herein. Parents are advised to support their wards accordingly and ensure timely preparation.</p>
                <p class="mb-3">For enquiries, please contact the school secretary or visit the administrative block during working hours (8:00 AM – 3:00 PM).</p>
                <p class="mt-4">Yours faithfully,<br><strong>The Principal</strong><br>Greenfield High School</p>
            </div>
            <div class="flex gap-2 mt-3">
                <button onclick="window.aiApp.copyToClipboard()" class="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">📋 Copy Notice</button>
                <button onclick="window.print()" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800">🖨️ Print</button>
            </div>`;
        },
        timetable: () => {
            const cls = document.getElementById('ai-tt-class')?.value || 'SSS1A';
            const subjects = ['Mathematics','English Language','Physics','Chemistry','Biology','Economics','Government','Civic Education','Physical Education','Computer Science'];
            const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
            const periods = 8;
            let rows = '';
            for (let p = 1; p <= periods; p++) {
                rows += `<tr class="border-b dark:border-gray-700">${['Period '+p,...days.map(()=>`<td class="px-2 py-1.5 text-xs text-center">${subjects[Math.floor(Math.random()*subjects.length)]}</td>`)].map((x,i)=>i===0?`<td class="px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap">${x}</td>`:x).join('')}</tr>`;
            }
            return `<div>
                <h4 class="font-semibold mb-2 text-sm">Optimized Timetable for ${cls}</h4>
                <div class="overflow-x-auto rounded-lg border dark:border-gray-600">
                    <table class="text-xs w-full">
                        <thead class="bg-primary-600 text-white"><tr>${['','Mon','Tue','Wed','Thu','Fri'].map(d=>`<th class="px-2 py-2">${d}</th>`).join('')}</tr></thead>
                        <tbody class="bg-white dark:bg-gray-800">${rows}</tbody>
                    </table>
                </div>
                <p class="text-xs text-gray-500 mt-2 italic">⚡ AI has distributed subjects to avoid consecutive repetition and respect teacher availability constraints.</p>
            </div>`;
        }
    };

    window.aiApp = {
        openTool(key) {
            const tool = TOOLS[key]; if (!tool) return;
            const panel = document.getElementById('ai-tool-panel');
            const title = document.getElementById('ai-tool-title');
            const body = document.getElementById('ai-tool-body');
            if (!panel) return;
            title.textContent = tool.title;
            body.innerHTML = tool.render();
            panel.classList.remove('hidden');
            panel.scrollIntoView({ behavior:'smooth', block:'start' });
        },
        closeTool() {
            document.getElementById('ai-tool-panel')?.classList.add('hidden');
        },
        generate(toolKey) {
            const out = document.getElementById('ai-output'); if (!out) return;
            out.innerHTML = '<div class="flex items-center gap-3 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin text-primary-500"></i> AI is generating your content…</div>';
            out.classList.remove('hidden');
            setTimeout(() => {
                const fn = RESPONSES[toolKey];
                if (fn) { out.innerHTML = fn(); }
                else { out.innerHTML = '<p class="text-gray-500 text-sm">✅ Content generated. (Connect to a real AI API for live results.)</p>'; }
            }, 1200);
        },
        copyToClipboard() {
            const out = document.getElementById('ai-output');
            if(!out) return;
            navigator.clipboard.writeText(out.innerText).then(()=>alert('Copied to clipboard!')).catch(()=>{});
        },
        useInExam() { alert('Questions exported to clipboard. Open Create Examination → Paste questions into the builder.'); },
        onSyllabusSelect() {
            const sel = document.getElementById('ai-q-syllabus'); if(!sel || !sel.value) return;
            const opt = sel.options[sel.selectedIndex];
            const subject = opt.dataset.subject || '';
            const topic = opt.dataset.topic || '';
            const subjEl = document.getElementById('ai-q-subject');
            const topicEl = document.getElementById('ai-q-topic');
            if(subjEl && subject) { for(let i=0; i<subjEl.options.length; i++) { if(subjEl.options[i].value===subject||subjEl.options[i].text===subject) { subjEl.selectedIndex=i; break; } } }
            if(topicEl && topic) topicEl.value = topic;
        }
    };

})();
