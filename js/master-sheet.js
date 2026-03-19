// Single Term Master Sheet Module
(function() {
    const SUBJECTS = ['Mathematics','English Language','Physics','Chemistry','Biology','Economics','Government','Civic Education','Computer Science','Literature'];

    function getRandScore() { return Math.floor(40 + Math.random() * 60); }

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

    function buildSheet(cls, term) {
        let students = JSON.parse(localStorage.getItem('sms_students') || '[]');
        if (cls) students = students.filter(s => (s.className || s.class || '') === cls);
        if (students.length === 0) {
            const demoNames = ['Adaeze Okonkwo','Emeka Nwosu','Fatima Ibrahim','Chidi Eze','Blessing Adeyemi',
                'Solomon Obi','Grace Nwachukwu','Ahmed Bello','Ngozi Okafor','Taiwo Adegoke'];
            students = demoNames.map((name, i) => ({
                id: 'STU' + String(i+1).padStart(3,'0'),
                name,
                className: cls || 'SSS1A',
                admissionNo: 'ADM' + String(1000 + i)
            }));
        }

        return students.slice(0, 40).map(s => {
            const scores = SUBJECTS.map(() => getRandScore());
            const total = scores.reduce((a, b) => a + b, 0);
            const avg = Math.round(total / scores.length);
            return { ...s, scores, total, avg, grade: grade(avg) };
        });
    }

    let _data = [];
    let _filtered = [];

    window.msApp = {
        load() {
            const cls  = document.getElementById('cms-class')?.value  || '';
            const term = document.getElementById('cms-term')?.value   || '';
            _data = buildSheet(cls, term);
            _filtered = [..._data];
            this.render(cls, term);
        },

        filter() {
            const q = (document.getElementById('cms-search')?.value || '').toLowerCase();
            _filtered = q ? _data.filter(s => s.name.toLowerCase().includes(q) || (s.admissionNo||'').toLowerCase().includes(q)) : [..._data];
            const cls  = document.getElementById('cms-class')?.value  || '';
            const term = document.getElementById('cms-term')?.value   || '';
            this.render(cls, term);
        },

        render(cls, term) {
            const wrapper = document.getElementById('cms-table-wrapper');
            if (!wrapper) return;

            if (_filtered.length === 0) {
                wrapper.innerHTML = '<div class="p-10 text-center text-gray-400 text-sm">No students found for the selected filters.</div>';
                return;
            }

            const avgs = _filtered.map(s => s.avg);
            const classAvg = Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length);
            document.getElementById('cms-total').textContent = _filtered.length;
            document.getElementById('cms-avg').textContent = classAvg + '%';
            document.getElementById('cms-distinction').textContent = avgs.filter(a => a >= 70).length;
            document.getElementById('cms-below').textContent = avgs.filter(a => a < 50).length;
            document.getElementById('cms-label').textContent = `${cls || 'All Classes'} — ${term || 'All Terms'} Term Master Sheet`;

            const subjectHeaders = SUBJECTS.map(s => `<th class="px-3 py-3 whitespace-nowrap">${s}</th>`).join('');
            
            // Generate highest/lowest arrays for subject columns
            let subjectHighest = new Array(SUBJECTS.length).fill(0);
            let subjectLowest = new Array(SUBJECTS.length).fill(100);
            let subjectAverages = new Array(SUBJECTS.length).fill(0);
            
            _filtered.forEach(s => {
                s.scores.forEach((sc, i) => {
                    if(sc > subjectHighest[i]) subjectHighest[i] = sc;
                    if(sc < subjectLowest[i]) subjectLowest[i] = sc;
                    subjectAverages[i] += sc;
                });
            });
            subjectAverages = subjectAverages.map(sum => Math.round(sum / _filtered.length));

            const rows = _filtered.map((s, idx) => {
                const scoreCells = s.scores.map(sc => {
                    const g = grade(sc);
                    return `<td class="px-3 py-2.5 text-center text-xs border-r dark:border-gray-700 last:border-r-0"><span class="${g.c} font-bold text-[13px]">${sc}</span><br><span class="text-[10px] text-gray-500">${g.g}</span></td>`;
                }).join('');
                
                const pos = idx + 1;
                const posClass = pos === 1 ? 'text-yellow-600 font-bold' : pos <= 3 ? 'text-blue-600 font-semibold' : 'text-gray-600';
                
                return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-3 py-2.5 text-xs font-bold ${posClass} text-center border-r dark:border-gray-700">${pos}</td>
                    <td class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">${s.admissionNo || s.id}</td>
                    <td class="px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap border-r dark:border-gray-700">${s.name}</td>
                    ${scoreCells}
                    <td class="px-3 py-2.5 text-center font-black text-gray-900 dark:text-white border-l border-r dark:border-gray-700">${s.total}</td>
                    <td class="px-3 py-2.5 text-center font-bold ${grade(s.avg).c} border-r dark:border-gray-700 text-[14px]">${s.avg}%</td>
                    <td class="px-3 py-2.5 text-center text-xs font-bold ${grade(s.avg).c} border-r dark:border-gray-700">${grade(s.avg).g}</td>
                    <td class="px-3 py-2.5 text-center text-xs border-r dark:border-gray-700 whitespace-nowrap">${grade(s.avg).r}</td>
                </tr>`;
            }).join('');

            const statRows = `
                <tr class="bg-gray-50 dark:bg-gray-800 font-bold border-t-2 border-primary-500">
                    <td colspan="3" class="px-3 py-3 text-right text-xs uppercase text-primary-600 border-r dark:border-gray-700">Subject Average</td>
                    ${subjectAverages.map(avg => `<td class="px-3 py-3 text-center text-primary-600 text-[13px] border-r dark:border-gray-700">${avg}</td>`).join('')}
                    <td colspan="4"></td>
                </tr>
                <tr class="bg-green-50/50 dark:bg-green-900/10 font-bold border-t dark:border-gray-700">
                    <td colspan="3" class="px-3 py-3 text-right text-xs uppercase text-green-600 border-r dark:border-gray-700">Highest Score</td>
                    ${subjectHighest.map(h => `<td class="px-3 py-3 text-center text-green-600 text-[13px] border-r dark:border-gray-700">${h}</td>`).join('')}
                    <td colspan="4"></td>
                </tr>
                <tr class="bg-red-50/50 dark:bg-red-900/10 font-bold border-t border-b dark:border-gray-700">
                    <td colspan="3" class="px-3 py-3 text-right text-xs uppercase text-red-600 border-r dark:border-gray-700">Lowest Score</td>
                    ${subjectLowest.map(l => `<td class="px-3 py-3 text-center text-red-600 text-[13px] border-r dark:border-gray-700">${l}</td>`).join('')}
                    <td colspan="4"></td>
                </tr>
            `;

            wrapper.innerHTML = `
                <table class="w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                    <thead class="text-xs uppercase bg-primary-700 text-white sticky top-0 z-10">
                        <tr>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Pos</th>
                            <th class="px-3 py-3 whitespace-nowrap border-r border-primary-600">ID</th>
                            <th class="px-3 py-3 whitespace-nowrap border-r border-primary-600">Student Name</th>
                            ${SUBJECTS.map(s => `<th class="px-3 py-3 whitespace-nowrap text-center border-r border-primary-600" title="${s}">${s.substring(0,6)}.</th>`).join('')}
                            <th class="px-3 py-3 text-center border-r border-primary-600">Total</th>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Avg</th>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Grade</th>
                            <th class="px-3 py-3 whitespace-nowrap border-r border-primary-600">Remark</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800">
                        ${rows}
                        ${statRows}
                    </tbody>
                </table>`;
        },

        exportCSV() {
            if (_filtered.length === 0) { alert('Generate data first by selecting filters and clicking Retrieve.'); return; }
            const cls  = document.getElementById('cms-class')?.value  || 'All';
            const term = document.getElementById('cms-term')?.value   || 'All';
            const headers = ['Pos','Adm No','Name', ...SUBJECTS,'Total','Average %','Grade','Remark'];
            const rows = _filtered.map((s, i) => [
                i+1, s.admissionNo||s.id, `"${s.name}"`, 
                ...s.scores, s.total, s.avg, grade(s.avg).g, grade(s.avg).r
            ]);
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Termly_MasterSheet_${cls}_${term.replace(/\//g,'-') || 'All'}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // Auto-load if class is set natively
    document.getElementById('cms-class') && document.getElementById('cms-class').addEventListener('change', () => window.msApp.load());

})();
