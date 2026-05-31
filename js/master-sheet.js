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

    // Tally function to count grades
    function calculateGradeTally(scores) {
        const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
        scores.forEach(sc => {
            const gStr = grade(sc).g;
            const letter = gStr.charAt(0);
            if (counts[letter] !== undefined) counts[letter]++;
        });
        const parts = [];
        if(counts.A) parts.push(`${counts.A}A`);
        if(counts.B) parts.push(`${counts.B}B`);
        if(counts.C) parts.push(`${counts.C}C`);
        if(counts.D) parts.push(`${counts.D}D`);
        if(counts.E) parts.push(`${counts.E}E`);
        if(counts.F) parts.push(`${counts.F}F`);
        return parts.join(', ') || '-';
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
            const tally = calculateGradeTally(scores);
            return { ...s, scores, total, avg, grade: grade(avg), tally, subjectsOffered: scores.length };
        });
    }

    let _data = [];
    let _filtered = [];

    window.msApp = {
        load() {
            const cls  = document.getElementById('cms-class')?.value  || '';
            const sec  = document.getElementById('cms-section')?.value || '';
            const fullCls = (cls && sec && sec !== 'All Sections') ? `${cls}${sec}` : cls;
            const term = document.getElementById('cms-term')?.value   || '';
            _data = buildSheet(fullCls, term);
            _filtered = [..._data];
            this.render(fullCls, term);
        },

        filter() {
            const q = (document.getElementById('cms-search')?.value || '').toLowerCase();
            _filtered = q ? _data.filter(s => s.name.toLowerCase().includes(q) || (s.admissionNo||'').toLowerCase().includes(q)) : [..._data];
            const cls  = document.getElementById('cms-class')?.value  || '';
            const sec  = document.getElementById('cms-section')?.value || '';
            const fullCls = (cls && sec && sec !== 'All Sections') ? `${cls}${sec}` : cls;
            const term = document.getElementById('cms-term')?.value   || '';
            this.render(fullCls, term);
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

            // Best & Least student
            const sorted = [..._filtered].sort((a, b) => b.avg - a.avg);
            const best   = sorted[0];
            const least  = sorted[sorted.length - 1];
            const passCount = avgs.filter(a => a >= 50).length;
            const passRate  = Math.round((passCount / avgs.length) * 100);

            document.getElementById('cms-total').textContent = _filtered.length;
            document.getElementById('cms-best-score').textContent  = best  ? `${best.avg}%`  : '—';
            document.getElementById('cms-best-name').textContent   = best  ? best.name        : '—';
            document.getElementById('cms-least-score').textContent = least ? `${least.avg}%`  : '—';
            document.getElementById('cms-least-name').textContent  = least ? least.name       : '—';
            document.getElementById('cms-pass-rate').textContent   = `${passRate}%`;
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
                    <td class="px-3 py-2.5 text-center font-bold text-gray-600 dark:text-gray-400 border-l border-r dark:border-gray-700">${s.subjectsOffered}</td>
                    <td class="px-3 py-2.5 text-center font-black text-gray-900 dark:text-white border-r dark:border-gray-700">${s.total}</td>
                    <td class="px-3 py-2.5 text-center font-bold ${grade(s.avg).c} border-r dark:border-gray-700 text-[14px]">${s.avg}%</td>
                    <td class="px-3 py-2.5 text-center text-xs font-bold ${grade(s.avg).c} border-r dark:border-gray-700">${grade(s.avg).g}</td>
                    <td class="px-3 py-2.5 text-center text-xs font-bold text-gray-600 dark:text-gray-400 border-r dark:border-gray-700">${s.tally}</td>
                    <td class="px-3 py-2.5 text-center text-xs border-r dark:border-gray-700 whitespace-nowrap">${grade(s.avg).r}</td>
                </tr>`;
            }).join('');

            const statRows = `
                <tr class="bg-gray-50 dark:bg-gray-800 font-bold border-t-2 border-primary-500">
                    <td colspan="3" class="px-3 py-3 text-right text-xs uppercase text-primary-600 border-r dark:border-gray-700">Subject Average</td>
                    ${subjectAverages.map(avg => `<td class="px-3 py-3 text-center text-primary-600 text-[13px] border-r dark:border-gray-700">${avg}</td>`).join('')}
                    <td colspan="6"></td>
                </tr>
                <tr class="bg-green-50/50 dark:bg-green-900/10 font-bold border-t dark:border-gray-700">
                    <td colspan="3" class="px-3 py-3 text-right text-xs uppercase text-green-600 border-r dark:border-gray-700">Highest Score</td>
                    ${subjectHighest.map(h => `<td class="px-3 py-3 text-center text-green-600 text-[13px] border-r dark:border-gray-700">${h}</td>`).join('')}
                    <td colspan="6"></td>
                </tr>
                <tr class="bg-red-50/50 dark:bg-red-900/10 font-bold border-t border-b dark:border-gray-700">
                    <td colspan="3" class="px-3 py-3 text-right text-xs uppercase text-red-600 border-r dark:border-gray-700">Lowest Score</td>
                    ${subjectLowest.map(l => `<td class="px-3 py-3 text-center text-red-600 text-[13px] border-r dark:border-gray-700">${l}</td>`).join('')}
                    <td colspan="6"></td>
                </tr>
            `;

            wrapper.innerHTML = `
                <table class="w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                    <thead class="text-xs uppercase bg-primary-700 text-white sticky top-0 z-10">
                        <tr>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Pos</th>
                            <th class="px-3 py-3 whitespace-nowrap border-r border-primary-600">Adm No</th>
                            <th class="px-3 py-3 whitespace-nowrap border-r border-primary-600">Student Name</th>
                            ${SUBJECTS.map(s => `<th class="px-3 py-3 whitespace-nowrap text-center border-r border-primary-600" title="${s}">${s.substring(0,6)}.</th>`).join('')}
                            <th class="px-3 py-3 text-center border-r border-primary-600">Subs</th>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Total</th>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Avg</th>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Grade</th>
                            <th class="px-3 py-3 text-center border-r border-primary-600">Tally</th>
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

            const headers = ['Pos', 'Adm No', 'Student Name', ...SUBJECTS, 'Subs Offered', 'Total', 'Average %', 'Grade', 'Grade Tally', 'Remark'];

            const rows = _filtered.map((s, i) => {
                const subjectCells = s.scores.map(sc => {
                    const g = grade(sc);
                    return `"${sc} (${g.g})"`;   // e.g. "83 (A1)"
                });
                return [
                    i + 1,
                    `"${s.admissionNo || s.id}"`,
                    `"${s.name}"`,
                    ...subjectCells,
                    s.subjectsOffered,
                    s.total,
                    `${s.avg}%`,
                    grade(s.avg).g,
                    `"${s.tally}"`,
                    grade(s.avg).r
                ];
            });

            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Termly_MasterSheet_${cls}_${(term || 'All').replace(/\//g, '-')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        },

        printTable() {
            if (_filtered.length === 0) { alert('Generate data first by selecting filters and clicking Retrieve.'); return; }
            const cls  = document.getElementById('cms-class')?.value  || 'All Classes';
            const term = document.getElementById('cms-term')?.value   || 'All Terms';
            const label = `${cls} — ${term} Term Master Sheet`;

            // Build plain table HTML (no Tailwind classes — just clean inline styles for print)
            const subjectThs = SUBJECTS.map(s => `<th style="border:1px solid #ccc;padding:6px 2px;font-size:10px;background:#1e429f;color:#fff;writing-mode: vertical-rl;text-orientation: mixed;">${s}</th>`).join('');

            const bodyRows = _filtered.map((s, idx) => {
                const scoreCells = s.scores.map(sc => {
                    const g = grade(sc);
                    const color = sc >= 70 ? '#15803d' : sc >= 50 ? '#1d4ed8' : sc >= 45 ? '#ca8a04' : '#dc2626';
                    return `<td style="border:1px solid #ccc;padding:5px 2px;text-align:center;font-size:11px;color:${color};font-weight:600;">${sc}<br><span style="font-size:9px;color:#666;">${g.g}</span></td>`;
                }).join('');
                const avg = s.avg;
                const g   = grade(avg);
                const color = avg >= 70 ? '#15803d' : avg >= 50 ? '#1d4ed8' : avg >= 45 ? '#ca8a04' : '#dc2626';
                return `<tr style="background:${idx % 2 === 0 ? '#fff' : '#f9fafb'}">
                    <td style="border:1px solid #ccc;padding:5px 2px;text-align:center;font-size:11px;font-weight:700;">${idx+1}</td>
                    <td style="border:1px solid #ccc;padding:5px 4px;font-size:10px;color:#555;text-align:center;">${s.admissionNo||s.id}</td>
                    <td style="border:1px solid #ccc;padding:5px 6px;font-size:11px;font-weight:600;white-space:nowrap;">${s.name}</td>
                    ${scoreCells}
                    <td style="border:1px solid #ccc;padding:5px 2px;text-align:center;font-size:11px;font-weight:600;">${s.subjectsOffered}</td>
                    <td style="border:1px solid #ccc;padding:5px 2px;text-align:center;font-weight:800;font-size:12px;">${s.total}</td>
                    <td style="border:1px solid #ccc;padding:5px 2px;text-align:center;font-weight:700;color:${color};font-size:12px;">${avg}%</td>
                    <td style="border:1px solid #ccc;padding:5px 2px;text-align:center;font-weight:700;color:${color};font-size:11px;">${g.g}</td>
                    <td style="border:1px solid #ccc;padding:5px 4px;text-align:center;font-size:10px;font-weight:600;white-space:nowrap;">${s.tally}</td>
                    <td style="border:1px solid #ccc;padding:5px 2px;text-align:center;font-size:10px;">${g.r}</td>
                </tr>`;
            }).join('');

            const html = `<!DOCTYPE html><html><head><title>${label}</title>
                <style>body{font-family:Arial,sans-serif;margin:15px;}h2{font-size:15px;margin-bottom:8px;}table{border-collapse:collapse;width:100%;}@media print{@page{size:landscape;margin:10mm;}}</style>
            </head><body>
                <h2>${label}</h2>
                <table>
                    <thead><tr>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">#</th>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">Adm No</th>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">Student Name</th>
                        ${subjectThs}
                        <th style="border:1px solid #ccc;padding:6px 2px;font-size:10px;background:#1e429f;color:#fff;writing-mode: vertical-rl;text-orientation: mixed;">Subs</th>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">Total</th>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">Avg%</th>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">Grade</th>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">Tally</th>
                        <th style="border:1px solid #ccc;padding:6px;font-size:11px;background:#1e429f;color:#fff;">Remark</th>
                    </tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </body></html>`;

            const win = window.open('', '_blank', 'width=1200,height=800');
            win.document.write(html);
            win.document.close();
            win.focus();
            setTimeout(() => win.print(), 500);
        }
    };

    // Auto-load if class or section is set natively
    document.getElementById('cms-class') && document.getElementById('cms-class').addEventListener('change', () => window.msApp.load());
    document.getElementById('cms-section') && document.getElementById('cms-section').addEventListener('change', () => window.msApp.load());

})();
