// Cumulative Master Sheet Module
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
        // Pull students from localStorage or use demo data
        let students = JSON.parse(localStorage.getItem('sms_students') || '[]');
        if (cls) students = students.filter(s => (s.className || s.class || '') === cls);
        // If no real data, generate demo rows
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

        return students.slice(0, 40).map(s => {
            const scores = SUBJECTS.map(() => getRandScore());
            const total = scores.reduce((a, b) => a + b, 0);
            const avg = Math.round(total / scores.length);
            return { ...s, scores, total, avg, grade: grade(avg) };
        });
    }

    let _data = [];
    let _filtered = [];

    window.cmsApp = {
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

            // Stats
            const avgs = _filtered.map(s => s.avg);
            const classAvg = Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length);
            document.getElementById('cms-total').textContent = _filtered.length;
            document.getElementById('cms-avg').textContent = classAvg + '%';
            document.getElementById('cms-distinction').textContent = avgs.filter(a => a >= 70).length;
            document.getElementById('cms-below').textContent = avgs.filter(a => a < 50).length;
            document.getElementById('cms-label').textContent = `${cls || 'All Classes'} — ${term || 'All Terms'}`;

            // Table
            const subjectHeaders = SUBJECTS.map(s => `<th class="px-3 py-3 whitespace-nowrap">${s.replace(' Language','').replace(' Education','')}</th>`).join('');
            const rows = _filtered.map((s, idx) => {
                const scoreCells = s.scores.map(sc => {
                    const g = grade(sc);
                    return `<td class="px-3 py-2.5 text-center text-xs"><span class="${g.c} font-semibold">${sc}</span><br><span class="text-[10px] text-gray-400">${g.g}</span></td>`;
                }).join('');
                const pos = idx + 1;
                const posClass = pos === 1 ? 'text-yellow-600 font-bold' : pos <= 3 ? 'text-blue-600 font-semibold' : 'text-gray-600';
                return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-3 py-2.5 text-xs font-bold ${posClass} text-center">${pos}</td>
                    <td class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">${s.admissionNo || s.id}</td>
                    <td class="px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">${s.name}</td>
                    <td class="px-3 py-2.5 text-xs text-center">${s.className || cls}</td>
                    ${scoreCells}
                    <td class="px-3 py-2.5 text-center font-bold text-gray-900 dark:text-white">${s.total}</td>
                    <td class="px-3 py-2.5 text-center font-bold ${grade(s.avg).c}">${s.avg}%</td>
                    <td class="px-3 py-2.5 text-center text-xs font-bold ${grade(s.avg).c}">${grade(s.avg).g}</td>
                    <td class="px-3 py-2.5 text-center text-xs">${grade(s.avg).r}</td>
                </tr>`;
            }).join('');

            wrapper.innerHTML = `
                <table class="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                    <thead class="text-xs uppercase bg-primary-700 text-white sticky top-0 z-10">
                        <tr>
                            <th class="px-3 py-3 text-center">#</th>
                            <th class="px-3 py-3 whitespace-nowrap">Adm. No.</th>
                            <th class="px-3 py-3 whitespace-nowrap">Student Name</th>
                            <th class="px-3 py-3 text-center">Class</th>
                            ${subjectHeaders}
                            <th class="px-3 py-3 text-center">Total</th>
                            <th class="px-3 py-3 text-center">Average</th>
                            <th class="px-3 py-3 text-center">Grade</th>
                            <th class="px-3 py-3 whitespace-nowrap">Remark</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800">
                        ${rows}
                    </tbody>
                </table>`;
        },

        exportCSV() {
            if (_filtered.length === 0) { alert('Generate data first by selecting filters and clicking Generate.'); return; }
            const cls  = document.getElementById('cms-class')?.value  || 'All';
            const term = document.getElementById('cms-term')?.value   || 'All';
            const headers = ['Pos','Adm No','Name','Class',...SUBJECTS,'Total','Average %','Grade','Remark'];
            const rows = _filtered.map((s, i) => [
                i+1, s.admissionNo||s.id, `"${s.name}"`, s.className||cls,
                ...s.scores, s.total, s.avg, grade(s.avg).g, grade(s.avg).r
            ]);
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CumulativeMasterSheet_${cls}_${term.replace(/\//g,'-') || 'All'}_${new Date().toLocaleDateString('en-GB').replace(/\//g,'-')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // Auto-load on page open with defaults if class is set
    document.getElementById('cms-class') && document.getElementById('cms-class').addEventListener('change', () => window.cmsApp.load());

})();
