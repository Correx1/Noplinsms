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

    // Tally function to count grades
    function calculateGradeTally(cumulativeScores) {
        const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
        cumulativeScores.forEach(sc => {
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

        // Fetch Global Promotion Setting
        let promotionSettings = { minAvg: 45 };
        try {
            const settingsRaw = localStorage.getItem('globalResultSettings');
            if (settingsRaw) {
                const settings = JSON.parse(settingsRaw);
                if (settings.promotion) promotionSettings = settings.promotion;
            }
        } catch(e) {}
        const passMark = parseFloat(promotionSettings.minAvg) || 45;

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
            const cumulativeScoresArray = subjectsAggregates.map(sg => sg.cum);
            const tally = calculateGradeTally(cumulativeScoresArray);
            
            return { 
                ...s, 
                subs: subjectsAggregates, 
                grandCum: totalCumScore, 
                avgCum: avgCum, 
                grade: grade(avgCum),
                tally: tally,
                subjectsOffered: SUBJECTS.length,
                promotion: avgCum >= passMark ? 'PROMOTED' : 'REPEATED'
            };
        });
    }

    let _data = [];
    let _filtered = [];

    window.cmsApp = {
        load() {
            const cls  = document.getElementById('cms-class')?.value  || '';
            const sec  = document.getElementById('cms-section')?.value || '';
            const fullCls = (cls && sec && sec !== 'All Sections') ? `${cls}${sec}` : cls;
            const session = document.getElementById('cms-term')?.value || ''; // Interpreting term as session generically
            _data = buildSheet(fullCls, session);
            _filtered = [..._data];
            
            // Sort by cumulative grand total
            _filtered.sort((a,b) => b.grandCum - a.grandCum);

            this.render(fullCls, session);
        },

        filter() {
            const q = (document.getElementById('cms-search')?.value || '').toLowerCase();
            _filtered = q ? _data.filter(s => s.name.toLowerCase().includes(q) || (s.admissionNo||'').toLowerCase().includes(q)) : [..._data];
            const cls  = document.getElementById('cms-class')?.value  || '';
            const sec  = document.getElementById('cms-section')?.value || '';
            const fullCls = (cls && sec && sec !== 'All Sections') ? `${cls}${sec}` : cls;
            const session = document.getElementById('cms-term')?.value || '';
            this.render(fullCls, session);
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

            // Best & Least student
            const sorted = [..._filtered].sort((a, b) => b.avgCum - a.avgCum);
            const best   = sorted[0];
            const least  = sorted[sorted.length - 1];
            const passCount = avgs.filter(a => a >= 50).length;
            const passRate  = Math.round((passCount / avgs.length) * 100);

            document.getElementById('cms-total').textContent = _filtered.length;
            document.getElementById('cms-best-score').textContent  = best  ? `${best.avgCum}%`  : '—';
            document.getElementById('cms-best-name').textContent   = best  ? best.name           : '—';
            document.getElementById('cms-least-score').textContent = least ? `${least.avgCum}%`  : '—';
            document.getElementById('cms-least-name').textContent  = least ? least.name          : '—';
            document.getElementById('cms-pass-rate').textContent   = `${passRate}%`;
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

                const promoColor = s.promotion === 'PROMOTED' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                return `<tr class="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-3 py-2 text-xs font-bold ${posClass} text-center border-r-2 border-primary-500 bg-white dark:bg-gray-800 sticky left-0 z-10">${pos}</td>
                    <td class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap border-r-2 border-primary-500 bg-white dark:bg-gray-800 sticky left-[42px] z-10">${s.admissionNo || s.id}</td>
                    <td class="px-3 py-2 text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap border-r-2 border-primary-500 bg-white dark:bg-gray-800 sticky left-[122px] z-10">${s.name}</td>
                    
                    ${subjectScoresHtml}
                    
                    <td class="px-3 py-2 text-center text-[13px] font-bold text-gray-600 dark:text-gray-400 border-l-2 border-r dark:border-gray-700">${s.subjectsOffered}</td>
                    <td class="px-3 py-2 text-center text-[14px] font-black text-gray-900 dark:text-white border-r dark:border-gray-700">${s.grandCum}</td>
                    <td class="px-3 py-2 text-center text-[14px] font-black ${s.grade.c} border-r dark:border-gray-700 shadow-sm">${s.avgCum}%</td>
                    <td class="px-3 py-2 text-center text-xs font-bold ${s.grade.c} border-r dark:border-gray-700">${s.grade.g}</td>
                    <td class="px-3 py-2 text-center text-[11px] font-bold text-gray-600 dark:text-gray-400 border-r dark:border-gray-700 whitespace-nowrap">${s.tally}</td>
                    <td class="px-3 py-2 text-center text-xs font-medium border-r dark:border-gray-700">${s.grade.r}</td>
                    <td class="px-3 py-2 text-center text-[11px] font-black uppercase ${promoColor} whitespace-nowrap shadow-sm">${s.promotion}</td>
                </tr>`;
            }).join('');

            wrapper.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                        <thead class="text-xs uppercase bg-primary-700 text-white">
                            <tr>
                                <th rowspan="2" class="px-3 py-3 text-center border-r-2 border-primary-500 bg-primary-700 sticky left-0 z-20 w-10 shadow-sm">Pos</th>
                                <th rowspan="2" class="px-3 py-3 whitespace-nowrap border-r-2 border-primary-500 bg-primary-700 sticky left-[42px] z-20 shadow-sm w-20">Adm No</th>
                                <th rowspan="2" class="px-3 py-3 whitespace-nowrap border-r-2 border-primary-500 bg-primary-700 sticky left-[122px] z-20 shadow-sm">Student Name</th>
                                ${groupedHeaders}
                                <th rowspan="2" class="px-3 py-3 text-center border-l-2 border-r border-primary-500 shadow-sm">Subs</th>
                                <th rowspan="2" class="px-3 py-3 text-center border-r border-primary-600 shadow-sm">Total<br>Cum</th>
                                <th rowspan="2" class="px-3 py-3 text-center border-r border-primary-600 shadow-sm">Avg<br>%</th>
                                <th rowspan="2" class="px-3 py-3 text-center border-r border-primary-600 shadow-sm">Grade</th>
                                <th rowspan="2" class="px-3 py-3 text-center border-r border-primary-600 shadow-sm">Tally</th>
                                <th rowspan="2" class="px-3 py-3 whitespace-nowrap border-r border-primary-600 shadow-sm">Remark</th>
                                <th rowspan="2" class="px-3 py-3 text-center shadow-sm whitespace-nowrap">Promotion</th>
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
            const cls     = document.getElementById('cms-class')?.value  || 'All';
            const session = document.getElementById('cms-term')?.value   || 'All';

            // Row 1: group headers — subject name then 3 blank cells (mirrors colspan="4" on screen)
            const groupRow1 = ['Pos', 'Adm No', 'Student Name'];
            SUBJECTS.forEach(sub => {
                groupRow1.push(`"${sub}"`, '', '', '');   // subject + 3 empty = 4 cols
            });
            groupRow1.push('Subs Offered', 'Total Cum', 'Avg %', 'Grade', 'Grade Tally', 'Remark', 'Promotion Status');

            // Row 2: sub-column headers
            const groupRow2 = ['', '', ''];
            SUBJECTS.forEach(() => {
                groupRow2.push('T1', 'T2', 'T3', 'CUM');
            });
            groupRow2.push('', '', '', '', '', '', '');

            // Data rows — CUM shows "score (grade)", T1/T2/T3 show plain score
            const rows = _filtered.map((s, i) => {
                const row = [i + 1, `"${s.admissionNo || s.id}"`, `"${s.name}"`];
                s.subs.forEach(sg => {
                    const g = grade(sg.cum);
                    row.push(sg.t1, sg.t2, sg.t3, `"${sg.cum} (${g.g})"`);
                });
                const ag = grade(s.avgCum);
                row.push(s.subjectsOffered, s.grandCum, `${s.avgCum}%`, ag.g, `"${s.tally}"`, ag.r, s.promotion);
                return row;
            });

            const csv = [groupRow1, groupRow2, ...rows].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = `CumulativeMasterSheet_${cls}_${(session || 'All').replace(/\//g, '-')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        },

        printTable() {
            if (_filtered.length === 0) { alert('Generate data first.'); return; }
            const cls     = document.getElementById('cms-class')?.value || 'All Classes';
            const session = document.getElementById('cms-term')?.value  || '2024/2025';
            const label   = `${cls} — Cumulative Session: ${session}`;

            const thStyle = 'border:1px solid #ccc;padding:5px 2px;font-size:9px;background:#1e429f;color:#fff;text-align:center;';
            const thCumStyle = 'border:1px solid #ccc;padding:5px 2px;font-size:9px;background:#1e3a8a;color:#fff;text-align:center;font-weight:900;';

            // Group headers (one per subject, spanning 4 sub-cols)
            const groupThs = SUBJECTS.map(s =>
                `<th colspan="4" style="${thStyle}">${s}</th>`
            ).join('');

            // Sub-column headers (T1 T2 T3 CUM × number of subjects)
            const subThs = SUBJECTS.map(() =>
                `<th style="${thStyle}">T1</th><th style="${thStyle}">T2</th><th style="${thStyle}">T3</th><th style="${thCumStyle}">CUM</th>`
            ).join('');

            const bodyRows = _filtered.map((s, idx) => {
                const g = grade(s.avgCum);
                const color = s.avgCum >= 70 ? '#15803d' : s.avgCum >= 50 ? '#1d4ed8' : s.avgCum >= 45 ? '#ca8a04' : '#dc2626';
                const promoColor = s.promotion === 'PROMOTED' ? '#15803d' : '#dc2626';

                const subCells = s.subs.map(sg => {
                    const cg = grade(sg.cum);
                    const cc = sg.cum >= 70 ? '#15803d' : sg.cum >= 50 ? '#1d4ed8' : sg.cum >= 45 ? '#ca8a04' : '#dc2626';
                    return `<td style="border:1px solid #eee;padding:4px 2px;text-align:center;font-size:9px;">${sg.t1}</td>
                            <td style="border:1px solid #eee;padding:4px 2px;text-align:center;font-size:9px;">${sg.t2}</td>
                            <td style="border:1px solid #eee;padding:4px 2px;text-align:center;font-size:9px;">${sg.t3}</td>
                            <td style="border:2px solid #1e429f;padding:4px 2px;text-align:center;font-size:10px;font-weight:900;color:${cc};">${sg.cum}</td>`;
                }).join('');

                return `<tr style="background:${idx%2===0?'#fff':'#f9fafb'}">
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-size:10px;font-weight:700;">${idx+1}</td>
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-size:9px;color:#555;">${s.admissionNo||s.id}</td>
                    <td style="border:1px solid #ccc;padding:4px 4px;font-size:10px;font-weight:600;white-space:nowrap;">${s.name}</td>
                    ${subCells}
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-weight:700;font-size:10px;">${s.subjectsOffered}</td>
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-weight:800;font-size:11px;">${s.grandCum}</td>
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-weight:700;color:${color};font-size:11px;">${s.avgCum}%</td>
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-weight:700;color:${color};font-size:10px;">${g.g}</td>
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-weight:600;font-size:9px;white-space:nowrap;">${s.tally}</td>
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-size:10px;">${g.r}</td>
                    <td style="border:1px solid #ccc;padding:4px 2px;text-align:center;font-size:10px;font-weight:900;color:${promoColor};">${s.promotion}</td>
                </tr>`;
            }).join('');

            const html = `<!DOCTYPE html><html><head><title>${label}</title>
                <style>body{font-family:Arial,sans-serif;margin:10px;}h2{font-size:14px;margin-bottom:6px;}table{border-collapse:collapse;width:100%;font-size:9px;}@media print{@page{size:landscape;margin:8mm;}}</style>
            </head><body>
                <h2>${label}</h2>
                <table>
                    <thead>
                        <tr>
                            <th rowspan="2" style="${thStyle}">Pos</th>
                            <th rowspan="2" style="${thStyle}">Adm No</th>
                            <th rowspan="2" style="${thStyle}">Student Name</th>
                            ${groupThs}
                            <th rowspan="2" style="${thStyle}">Subs</th>
                            <th rowspan="2" style="${thStyle}">Total Cum</th>
                            <th rowspan="2" style="${thStyle}">Avg%</th>
                            <th rowspan="2" style="${thStyle}">Grade</th>
                            <th rowspan="2" style="${thStyle}">Tally</th>
                            <th rowspan="2" style="${thStyle}">Remark</th>
                            <th rowspan="2" style="${thStyle}">Promotion</th>
                        </tr>
                        <tr>${subThs}</tr>
                    </thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </body></html>`;

            const win = window.open('', '_blank', 'width=1400,height=900');
            win.document.write(html);
            win.document.close();
            win.focus();
            setTimeout(() => win.print(), 500);
        }
    };

    // Auto-load
    document.getElementById('cms-class') && document.getElementById('cms-class').addEventListener('change', () => window.cmsApp.load());
    document.getElementById('cms-section') && document.getElementById('cms-section').addEventListener('change', () => window.cmsApp.load());

})();
