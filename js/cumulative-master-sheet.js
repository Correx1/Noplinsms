// 3-TERM CUMULATIVE MASTER SHEET MATRIX ENGINE
(function() {
    const SUBJECTS = ['Mathematics','English Language','Physics','Chemistry','Biology','Economics','Civic Edu'];

    function getRandScore() { return Math.floor(30 + Math.random() * 70); }

    function grade(score) {
        if (score >= 75) return { g: 'A1', r: 'Excellent', c: 'text-green-700 dark:text-green-400' };
        if (score >= 70) return { g: 'B2', r: 'Very Good', c: 'text-green-600' };
        if (score >= 65) return { g: 'B3', r: 'Good', c: 'text-blue-600' };
        if (score >= 60) return { g: 'C4', r: 'Credit', c: 'text-blue-500' };
        if (score >= 55) return { g: 'C5', r: 'Credit', c: 'text-blue-400' };
        if (score >= 50) return { g: 'C6', r: 'Credit', c: 'text-blue-300' };
        if (score >= 45) return { g: 'D7', r: 'Pass', c: 'text-yellow-600' };
        if (score >= 40) return { g: 'E8', r: 'Pass', c: 'text-yellow-500' };
        return { g: 'F9', r: 'Fail', c: 'text-red-600 dark:text-red-400' };
    }

    // Engine constructs the comprehensive 3-Term mapping
    function buildSheet(cls, sessionStr) {
        let students = JSON.parse(localStorage.getItem('sms_students') || '[]');
        if (cls) students = students.filter(s => (s.className || s.class || '') === cls);
        if (students.length === 0) {
            const demoNames = ['Adaeze Okonkwo','Emeka Nwosu','Fatima Ibrahim','Chidi Eze','Blessing Adeyemi',
                'Solomon Obi','Grace Nwachukwu','Ahmed Bello','Ngozi Okafor','Taiwo Adegoke',
                'Chioma Uche','Kunle Adesanya','Amaka Okonjo','Seun Badmus','Ifunanya Obi'];
            students = demoNames.map((name, i) => ({
                id: 'STU' + String(i+1).padStart(3,'0'),
                name,
                className: cls || 'SSS1A',
                admissionNo: 'ADM' + String(1000 + i)
            }));
        }

        // Generate 3 sets of Term scores per subject per student
        return students.slice(0, 40).map(s => {
            let subjectsAggregates = [];
            let totalCumScore = 0;
            let totalCumulativePoints = 0; // for average

            SUBJECTS.forEach(sub => {
                let term1 = getRandScore();
                let term2 = getRandScore();
                let term3 = getRandScore();
                let cumAgg = Math.round((term1 + term2 + term3) / 3);

                subjectsAggregates.push({
                    name: sub,
                    t1: term1,
                    t2: term2,
                    t3: term3,
                    cum: cumAgg
                });

                totalCumScore += cumAgg;
                totalCumulativePoints += 100; // Since average of 3 terms is over 100
            });

            const avgCum = Math.round((totalCumScore / totalCumulativePoints) * 100);
            return { 
                ...s, 
                subs: subjectsAggregates, 
                grandCum: totalCumScore, 
                avgCum: avgCum, 
                grade: grade(avgCum) 
            };
        });
    }

    let _data = [];
    let _filtered = [];

    window.cmsApp = {
        load() {
            const cls  = document.getElementById('cms-class')?.value  || '';
            const session = document.getElementById('cms-term')?.value || ''; // Interpreting term as session generically
            _data = buildSheet(cls, session);
            _filtered = [..._data];
            
            // Sort by cumulative grand total
            _filtered.sort((a,b) => b.grandCum - a.grandCum);

            this.render(cls, session);
        },

        filter() {
            const q = (document.getElementById('cms-search')?.value || '').toLowerCase();
            _filtered = q ? _data.filter(s => s.name.toLowerCase().includes(q) || (s.admissionNo||'').toLowerCase().includes(q)) : [..._data];
            const cls  = document.getElementById('cms-class')?.value  || '';
            const session = document.getElementById('cms-term')?.value || '';
            this.render(cls, session);
        },

        render(cls, session) {
            const wrapper = document.getElementById('cms-table-wrapper');
            if (!wrapper) return;

            if (_filtered.length === 0) {
                wrapper.innerHTML = '<div class="p-10 text-center text-gray-400 text-sm">No students found.</div>';
                return;
            }

            // High-level Stats
            const avgs = _filtered.map(s => s.avgCum);
            const classAvg = Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length);
            document.getElementById('cms-total').textContent = _filtered.length;
            document.getElementById('cms-avg').textContent = classAvg + '%';
            document.getElementById('cms-distinction').textContent = avgs.filter(a => a >= 70).length;
            document.getElementById('cms-below').textContent = avgs.filter(a => a < 50).length;
            document.getElementById('cms-label').textContent = `${cls || 'All Classes'} — CUMULATIVE SESSION: ${session || '2024/2025'}`;

            // Build Matrix Headers (T1, T2, T3, CUM per Subject)
            let groupedHeaders = SUBJECTS.map(s => `
                <th colspan="4" class="px-2 py-2 text-center text-[11px] border-r-2 border-primary-600 bg-primary-800 text-white truncate" title="${s}">${s.substring(0,8)}.</th>
            `).join('');

            let subHeaders = SUBJECTS.map(() => `
                <th class="px-2 py-1 text-center text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 border-r dark:border-gray-700" title="1st Term">T1</th>
                <th class="px-2 py-1 text-center text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 border-r dark:border-gray-700" title="2nd Term">T2</th>
                <th class="px-2 py-1 text-center text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 border-r dark:border-gray-700" title="3rd Term">T3</th>
                <th class="px-2 py-1 text-center text-[11px] font-bold bg-primary-200 dark:bg-primary-800/50 text-primary-900 dark:text-white border-r-2 border-primary-500" title="Cumulative Avg">CUM</th>
            `).join('');

            // Rows data
            const rows = _filtered.map((s, idx) => {
                const pos = idx + 1;
                const posClass = pos === 1 ? 'text-yellow-600 font-bold' : pos <= 3 ? 'text-blue-600 font-semibold' : 'text-gray-600';
                
                let subjectScoresHtml = s.subs.map(subGroup => {
                    const cGrade = grade(subGroup.cum);
                    return `
                        <td class="px-2 py-2 text-center text-xs text-gray-600 dark:text-gray-400 border-r dark:border-gray-700">${subGroup.t1}</td>
                        <td class="px-2 py-2 text-center text-xs text-gray-600 dark:text-gray-400 border-r dark:border-gray-700">${subGroup.t2}</td>
                        <td class="px-2 py-2 text-center text-xs text-gray-600 dark:text-gray-400 border-r dark:border-gray-700">${subGroup.t3}</td>
                        <td class="px-2 py-2 text-center text-xs font-black ${cGrade.c} bg-gray-50 dark:bg-gray-800 border-r-2 border-primary-500">${subGroup.cum}</td>
                    `;
                }).join('');

                return `<tr class="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-3 py-2 text-xs font-bold ${posClass} text-center border-r-2 border-primary-500 bg-white dark:bg-gray-800 sticky left-0 z-10">${pos}</td>
                    <td class="px-3 py-2 text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap border-r-2 border-primary-500 bg-white dark:bg-gray-800 sticky left-[42px] z-10">${s.name}</td>
                    
                    ${subjectScoresHtml}
                    
                    <td class="px-3 py-2 text-center text-[14px] font-black text-gray-900 dark:text-white border-l-2 border-primary-500">${s.grandCum}</td>
                    <td class="px-3 py-2 text-center text-[14px] font-black ${s.grade.c} border-r dark:border-gray-700 shadow-sm">${s.avgCum}%</td>
                    <td class="px-3 py-2 text-center text-xs font-bold ${s.grade.c}">${s.grade.g}</td>
                    <td class="px-3 py-2 text-center text-xs font-medium">${s.grade.r}</td>
                </tr>`;
            }).join('');

            wrapper.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                        <thead class="text-xs uppercase bg-primary-700 text-white">
                            <tr>
                                <th rowspan="2" class="px-3 py-3 text-center border-r-2 border-primary-500 bg-primary-700 sticky left-0 z-20 w-10 shadow-sm">Pos</th>
                                <th rowspan="2" class="px-3 py-3 whitespace-nowrap border-r-2 border-primary-500 bg-primary-700 sticky left-[42px] z-20 shadow-sm">Student Name</th>
                                ${groupedHeaders}
                                <th rowspan="2" class="px-3 py-3 text-center border-l-2 border-primary-500 shadow-sm">Total<br>Cum</th>
                                <th rowspan="2" class="px-3 py-3 text-center border-r border-primary-600 shadow-sm">Avg<br>%</th>
                                <th rowspan="2" class="px-3 py-3 text-center shadow-sm">Grade</th>
                                <th rowspan="2" class="px-3 py-3 whitespace-nowrap shadow-sm">Remark</th>
                            </tr>
                            <tr class="whitespace-nowrap">
                                ${subHeaders}
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 relative">
                            ${rows}
                        </tbody>
                    </table>
                </div>
            `;
        },

        exportCSV() {
            if (_filtered.length === 0) { alert('Generate data first.'); return; }
            const cls = document.getElementById('cms-class')?.value || 'All';
            const session = document.getElementById('cms-term')?.value || 'All';
            
            let headers = ['Pos', 'Student Name'];
            SUBJECTS.forEach(sub => {
                headers.push(`${sub} (T1)`, `${sub} (T2)`, `${sub} (T3)`, `${sub} (CUM)`);
            });
            headers.push('Total Cum', 'Avg Cum %', 'Grade', 'Remark');

            const rows = _filtered.map((s, i) => {
                let row = [i+1, `"${s.name}"`];
                s.subs.forEach(sg => row.push(sg.t1, sg.t2, sg.t3, sg.cum));
                row.push(s.grandCum, s.avgCum, grade(s.avgCum).g, grade(s.avgCum).r);
                return row;
            });

            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `3-Term-CumulativeMasterSheet_${cls}_${session.replace(/\//g,'-')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // Auto-load
    document.getElementById('cms-class') && document.getElementById('cms-class').addEventListener('change', () => window.cmsApp.load());

})();
