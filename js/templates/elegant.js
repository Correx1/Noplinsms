// ============================================================
// ELEGANT TEMPLATE — Austica Memorial College Style
// Red/blue accents, cognitive domain, affective & psychomotor
// checkmark grids, result analysis with compulsory pass check
// ============================================================
(function() {

    window.TEMPLATE_REGISTRY.elegant = {
        id: 'elegant',
        name: 'Elegant Series',
        description: 'Refined report with cognitive domain table, separate affective & psychomotor checkmark grids, and result analysis.',

        capabilities: {
            studentPhoto:       false,
            dateOfBirth:        false,
            attendance:         false,
            closingDate:        true,
            resumptionDate:     true,
            affectiveDomains:   true,
            psychomotorDomains: true,
            schoolBills:        false,
            keysToGrading:      true,
            keysToRating:       false,
            teacherRemark:      true,
            headTeacherRemark:  false,
            principalRemark:    false,
            signatures:         false,
            subjectPosition:    true,
            subjectHighLow:     false
        },

        renderTerm: function(p) {
            const tc = p.school.themeColor || '#1a237e';

            // Academic Table — Cognitive Domain
            let thCols = `<th style="border:1px solid #000;padding:3px;text-align:left;font-size:9px;font-weight:700;background:#fff;">Subjects</th>`;
            p.structure.components.forEach(c => {
                thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;">${c.name.toUpperCase()}</th>`;
            });
            thCols += `
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:8px;font-weight:700;">Total</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:8px;font-weight:700;">Grade</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;">Subject<br>Position</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:left;font-size:7px;font-weight:700;">Teacher's<br>Remarks</th>`;

            let tbRows = '';
            // Marks obtainable row
            let moRow = `<td style="border:1px solid #000;padding:3px;font-size:8px;font-weight:700;font-style:italic;">Marks Obtainable</td>`;
            p.structure.components.forEach(c => {
                moRow += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;font-weight:600;">${c.weight}</td>`;
            });
            moRow += `<td style="border:1px solid #000;text-align:center;font-size:9px;font-weight:700;">100</td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td>`;
            tbRows += `<tr>${moRow}</tr>`;

            p.subjects.forEach(sub => {
                let tr = `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '';
                    tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${sc}</td>`;
                });
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;">${sub.total}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:${tc};">${sub.grade}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sub.position || ''}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:8px;font-style:italic;">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });

            // --- Affective Domain checkmark grid ---
            const affective = Object.keys(p.evaluation.affectiveDomains).length > 0
                ? Object.entries(p.evaluation.affectiveDomains)
                : p.domainsList.map(d => [d, '']);
            let affRows = '';
            affective.forEach(([name, val]) => {
                const v = parseInt(val) || 0;
                affRows += `<tr>
                    <td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;text-align:left;">${name}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v >= 5 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v === 4 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v === 3 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v === 2 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v <= 1 && v > 0 ? '✓' : '-'}</td>
                </tr>`;
            });

            // --- Psychomotor Domain checkmark grid ---
            const psycho = Object.keys(p.evaluation.psychomotorDomains).length > 0
                ? Object.entries(p.evaluation.psychomotorDomains)
                : p.psychomotorList.map(d => [d, '']);
            let psyRows = '';
            psycho.forEach(([name, val]) => {
                const v = parseInt(val) || 0;
                psyRows += `<tr>
                    <td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;text-align:left;">${name}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v >= 5 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v === 4 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v === 3 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v === 2 ? '✓' : '-'}</td>
                    <td style="border:1px solid #000;text-align:center;font-size:9px;">${v <= 1 && v > 0 ? '✓' : '-'}</td>
                </tr>`;
            });

            // --- Grading Keys ---
            let gradingLine = '';
            p.gradingKeys.forEach(g => {
                gradingLine += `${g.min} - ${g.max} : ${g.grade} (${g.remark.toUpperCase()})${g.min > 0 ? ' | ' : ''}`;
            });

            return `
            <div style="font-family:'Times New Roman',Georgia,serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;">

                <!-- HEADER -->
                <div style="display:flex;align-items:center;margin-bottom:2px;">
                    <div style="width:80px;height:85px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 8px;">
                        <div style="font-size:22px;font-weight:900;text-transform:uppercase;color:${tc};letter-spacing:1px;">${p.school.name}</div>
                        <div style="font-size:10px;font-weight:600;color:#444;">${p.school.address}</div>
                        <div style="font-size:10px;font-weight:700;font-style:italic;color:${tc};margin-top:2px;">${p.school.motto}</div>
                    </div>
                </div>

                <!-- TERMINAL REPORT BANNER -->
                <div style="background:${tc};color:#fff;text-align:center;padding:4px 0;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin-bottom:6px;">TERMINAL REPORT</div>

                <!-- INFO -->
                <div style="font-size:9px;font-weight:700;margin-bottom:6px;">
                    <div style="display:flex;gap:6px;margin-bottom:3px;">
                        <span>NAME OF STUDENT: <span style="font-weight:400;text-transform:uppercase;border-bottom:1px solid #000;padding:0 12px;">${p.student.name}</span></span>
                        <span>ADMISSION NO.: <span style="font-weight:400;border-bottom:1px solid #000;padding:0 8px;">${p.student.roll}</span></span>
                        <span>CLASS: <span style="font-weight:400;border-bottom:1px solid #000;padding:0 8px;">${p.student.class}</span></span>
                    </div>
                    <div style="display:flex;gap:6px;margin-bottom:3px;">
                        <span>NUMBER IN CLASS: <span style="font-weight:400;border-bottom:1px solid #000;padding:0 8px;">${p.context.noInClass}</span></span>
                        <span>TERM: <span style="font-weight:400;border-bottom:1px solid #000;padding:0 8px;">${p.context.term}</span></span>
                        <span>SESSION: <span style="font-weight:400;border-bottom:1px solid #000;padding:0 8px;">${p.context.session}</span></span>
                        <span>STATUS: <span style="font-weight:400;border-bottom:1px solid #000;padding:0 8px;">${p.summary.isPromoted ? 'Passed' : 'Failed'}</span></span>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <span>TOTAL MARKS OBTAINABLE: <span style="font-weight:900;border-bottom:1px solid #000;padding:0 6px;">${p.subjects.length * 100}</span></span>
                        <span>TOTAL MARKS OBTAINED: <span style="font-weight:900;border-bottom:1px solid #000;padding:0 6px;">${p.summary.grandTotal}</span></span>
                        <span>AVERAGE: <span style="font-weight:900;border-bottom:1px solid #000;padding:0 6px;">${p.summary.average}</span></span>
                        <span>POSITION: <span style="font-weight:900;border-bottom:1px solid #000;padding:0 6px;">${p.summary.position}</span></span>
                    </div>
                </div>

                <!-- COGNITIVE DOMAIN TABLE -->
                <div style="text-align:center;font-size:10px;font-weight:700;color:#fff;background:${tc};padding:2px 0;text-transform:uppercase;margin-bottom:0;">COGNITIVE DOMAIN</div>
                <table style="border-collapse:collapse;width:100%;margin-bottom:6px;">
                    <thead><tr>${thCols}</tr></thead>
                    <tbody>${tbRows}</tbody>
                </table>

                <!-- BOTTOM SECTION: 2 COLUMNS -->
                <div style="display:flex;gap:8px;margin-top:auto;">
                    <!-- LEFT: Remarks + Dates + Analysis + Grading -->
                    <div style="width:50%;font-size:8px;font-weight:700;">
                        <div style="background:${tc};color:#fff;text-align:center;padding:2px 0;font-size:9px;font-weight:700;text-transform:uppercase;">REMARKS, AFFECTIVE AND PSYCHOMOTOR DOMAINS</div>
                        <div style="margin:4px 0;">Class Teacher Remarks: <span style="font-weight:400;font-style:italic;">${p.evaluation.teacherRemark}</span></div>
                        <div>Vacation Date: <span style="font-weight:400;">${p.dates.closingDate}</span></div>
                        <div>Resumption Date: <span style="font-weight:400;">${p.dates.resumptionDate}</span></div>
                        <div style="margin-top:4px;border-top:1px solid #000;padding-top:3px;">
                            <div style="font-weight:700;">Result Analysis</div>
                            <div style="font-weight:400;font-size:7px;line-height:1.5;">
                                • Pass mark is 50<br>
                                • Promotion score is ${parseInt(localStorage.getItem('sms_promotion_rule') || 50)}, you scored ${p.summary.average}
                            </div>
                        </div>
                        <div style="margin-top:4px;font-size:7px;">GRADING: ${gradingLine}</div>
                    </div>

                    <!-- RIGHT: Affective + Psychomotor -->
                    <div style="width:50%;display:flex;flex-direction:column;gap:4px;">
                        <!-- Affective -->
                        <table style="border-collapse:collapse;width:100%;font-size:8px;">
                            <thead><tr>
                                <th style="border:1px solid #000;padding:2px 4px;text-align:left;font-weight:700;">AFFECTIVE DOMAIN</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">Excel.</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">V.Good</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">Good</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">Poor</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">V.Poor</th>
                            </tr></thead>
                            <tbody>${affRows}</tbody>
                        </table>
                        <!-- Psychomotor -->
                        <table style="border-collapse:collapse;width:100%;font-size:8px;">
                            <thead><tr>
                                <th style="border:1px solid #000;padding:2px 4px;text-align:left;font-weight:700;">PSYCHOMOTOR DOMAIN</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">Excel.</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">V.Good</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">Good</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">Poor</th>
                                <th style="border:1px solid #000;padding:2px;text-align:center;font-size:7px;">V.Poor</th>
                            </tr></thead>
                            <tbody>${psyRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        },

        renderSession: function(p) {
            const tc = p.school.themeColor || '#1a237e';
            let thCols = `<th style="border:1px solid #000;padding:3px;text-align:left;font-size:9px;font-weight:700;">Subjects</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:8px;font-weight:700;">Term 1</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:8px;font-weight:700;">Term 2</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:8px;font-weight:700;">Term 3</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:8px;font-weight:700;">Annual</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:8px;font-weight:700;">Grade</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:left;font-size:7px;font-weight:700;">Remarks</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                tbRows += `<tr>
                    <td style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:600;">${sub.subject}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${sub.t1 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${sub.t2 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${sub.t3 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;">${sub.annual || sub.total || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:${tc};">${sub.grade || ''}</td>
                    <td style="border:1px solid #000;padding:3px 4px;font-size:8px;font-style:italic;">${sub.remark || ''}</td>
                </tr>`;
            });

            return `
            <div style="font-family:'Times New Roman',Georgia,serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;">
                <div style="display:flex;align-items:center;margin-bottom:2px;">
                    <div style="width:80px;height:85px;flex-shrink:0;"><img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;"></div>
                    <div style="flex:1;text-align:center;padding:0 8px;">
                        <div style="font-size:22px;font-weight:900;text-transform:uppercase;color:${tc};">${p.school.name}</div>
                        <div style="font-size:10px;font-weight:600;color:#444;">${p.school.address}</div>
                        <div style="font-size:10px;font-weight:700;font-style:italic;color:${tc};margin-top:2px;">${p.school.motto}</div>
                    </div>
                </div>
                <div style="background:${tc};color:#fff;text-align:center;padding:4px 0;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin-bottom:6px;">ANNUAL PERFORMANCE REPORT</div>
                <div style="font-size:9px;font-weight:700;margin-bottom:6px;">
                    <div>NAME: <span style="font-weight:400;text-transform:uppercase;">${p.student.name}</span> &nbsp; CLASS: <span style="font-weight:400;">${p.student.class}</span> &nbsp; SESSION: <span style="font-weight:400;">${p.context.session}</span></div>
                    <div>TOTAL: <span style="font-weight:900;">${p.summary.grandTotal}</span> &nbsp; AVERAGE: <span style="font-weight:900;">${p.summary.average}</span> &nbsp; POSITION: <span style="font-weight:900;">${p.summary.position}</span></div>
                </div>
                <table style="border-collapse:collapse;width:100%;margin-bottom:6px;">
                    <thead><tr>${thCols}</tr></thead>
                    <tbody>${tbRows}</tbody>
                </table>
                <div style="margin-top:auto;font-size:9px;font-weight:700;line-height:1.8;">
                    <div>Class Teacher Remarks: <span style="font-weight:400;font-style:italic;">${p.evaluation.teacherRemark}</span></div>
                    <div>Resumption Date: <span style="font-weight:400;">${p.dates.resumptionDate}</span></div>
                </div>
            </div>`;
        }
    };

    console.log('Elegant template registered.');
})();
