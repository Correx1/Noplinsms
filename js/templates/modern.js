// ============================================================
// MODERN TEMPLATE — AMB International School Style
// Student photo + QR slot, psychomotor + affective side-by-side,
// session averages, cumulative term scores table
// ============================================================
(function() {

    window.TEMPLATE_REGISTRY.modern = {
        id: 'modern',
        name: 'Modern Artistic',
        description: 'Contemporary report with student photo, session averages, psychomotor & affective columns, cumulative term data.',

        capabilities: {
            studentPhoto:       true,
            dateOfBirth:        true,
            attendance:         true,
            closingDate:        true,
            resumptionDate:     true,
            affectiveDomains:   true,
            psychomotorDomains: true,
            schoolBills:        false,
            keysToGrading:      false,
            keysToRating:       false,
            teacherRemark:      true,
            headTeacherRemark:  false,
            principalRemark:    true,
            signatures:         true,
            subjectPosition:    false,
            subjectHighLow:     false
        },

        renderTerm: function(p) {
            const tc = p.school.themeColor || '#1a237e';

            // Academic Table
            let thCols = `<th style="border:1px solid #000;padding:3px;text-align:left;font-size:8px;font-weight:700;background:#f0f0f0;">SUBJECT</th>`;
            p.structure.components.forEach(c => {
                thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">${c.name.toUpperCase()}<br>${c.weight}</th>`;
            });
            thCols += `
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">TOTAL</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">SUBJECT<br>RANK</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">MAX<br>MARKS</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">MIN<br>MARKS</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">GRADE</th>
                <th style="border:1px solid #000;padding:3px 2px;text-align:left;font-size:7px;font-weight:700;background:#f0f0f0;">REMARK</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                let tr = `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '';
                    tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sc}</td>`;
                });
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;font-weight:800;">${sub.total}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sub.position || ''}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sub.highest || ''}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sub.lowest || ''}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;font-weight:700;">${sub.grade}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:8px;">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });

            // Total row
            tbRows += `<tr style="font-weight:800;">
                <td style="border:1px solid #000;padding:3px 4px;text-align:right;font-size:9px;" colspan="${p.structure.components.length + 1}">TOTAL</td>
                <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${p.summary.grandTotal}</td>
                <td colspan="5" style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9px;">TERM AVERAGE MARKS: <span style="font-weight:900;">${p.summary.average}</span></td>
            </tr>`;

            // Psychomotor + Affective side-by-side
            const psyEntries = Object.keys(p.evaluation.psychomotorDomains).length > 0
                ? Object.entries(p.evaluation.psychomotorDomains)
                : p.psychomotorList.map(d => [d, '']);
            const affEntries = Object.keys(p.evaluation.affectiveDomains).length > 0
                ? Object.entries(p.evaluation.affectiveDomains)
                : p.domainsList.map(d => [d, '']);

            let psyRows = '';
            psyEntries.forEach(([name, val]) => {
                psyRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;">${name}</td><td style="border:1px solid #000;padding:2px;text-align:center;font-size:9px;font-weight:700;">${val || ''}</td></tr>`;
            });
            let affRows = '';
            affEntries.forEach(([name, val]) => {
                affRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;">${name}</td><td style="border:1px solid #000;padding:2px;text-align:center;font-size:9px;font-weight:700;">${val || ''}</td></tr>`;
            });

            const teacherSigImg = p.signatories.teacher.signature
                ? `<img src="${p.signatories.teacher.signature}" style="max-height:18px;object-fit:contain;">`
                : '';

            return `
            <div style="font-family:Arial,Helvetica,sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;">

                <!-- HEADER -->
                <div style="display:flex;align-items:center;margin-bottom:4px;">
                    <div style="width:75px;height:80px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 6px;">
                        <div style="font-size:22px;font-weight:900;text-transform:uppercase;color:${tc};letter-spacing:1px;">${p.school.name}</div>
                        <div style="font-size:8px;font-weight:600;color:#555;">${p.school.address}</div>
                        <div style="font-size:8px;font-weight:600;color:#555;">${p.school.contact}</div>
                        <div style="font-size:8px;font-weight:600;color:#555;">Email: ${p.school.email}</div>
                        <div style="font-size:10px;font-weight:900;font-style:italic;color:${tc};margin-top:2px;">...${p.school.motto}</div>
                    </div>
                    <div style="width:75px;height:80px;flex-shrink:0;">
                        <img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;border:1px solid #ccc;">
                    </div>
                </div>

                <!-- TITLE -->
                <div style="text-align:center;font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:4px;letter-spacing:1px;color:${tc};">${p.context.term} PERFORMANCE RESULT SHEET</div>

                <!-- INFO GRID -->
                <div style="font-size:8px;font-weight:700;margin-bottom:4px;display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;line-height:1.8;">
                    <div>NAME <span style="font-weight:400;margin-left:4px;">${p.student.name}</span></div>
                    <div>NO IN CLASS <span style="font-weight:400;margin-left:4px;">${p.context.noInClass}</span> &nbsp; TERM <span style="font-weight:400;margin-left:4px;">${p.context.term}</span></div>
                    <div>ADMISSION NO <span style="font-weight:400;margin-left:4px;">${p.student.roll}</span></div>
                    <div>DATE OF BIRTH <span style="font-weight:400;margin-left:4px;">${p.student.dob}</span> &nbsp; SESSION <span style="font-weight:400;margin-left:4px;">${p.context.session}</span></div>
                    <div>CLASS <span style="font-weight:400;margin-left:4px;">${p.student.class}</span></div>
                    <div>AGE <span style="font-weight:400;margin-left:4px;"></span> &nbsp; NEXT TERM BEGINS <span style="font-weight:400;margin-left:4px;">${p.dates.resumptionDate}</span></div>
                    <div>GENDER <span style="font-weight:400;margin-left:4px;">${p.student.gender}</span></div>
                    <div>GRADE <span style="font-weight:400;margin-left:4px;"></span></div>
                </div>

                <!-- ACADEMIC TABLE -->
                <table style="border-collapse:collapse;width:100%;margin-bottom:4px;">
                    <thead><tr>${thCols}</tr></thead>
                    <tbody>${tbRows}</tbody>
                </table>

                <!-- PSYCHOMOTOR + AFFECTIVE SIDE-BY-SIDE -->
                <div style="display:flex;gap:8px;margin-bottom:4px;">
                    <div style="width:50%;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="2" style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;text-transform:uppercase;">PSYCHOMOTOR DOMAIN</th><th style="border:1px solid #000;padding:2px;font-size:8px;font-weight:700;">RATING</th></tr></thead>
                            <tbody>${psyRows}</tbody>
                        </table>
                    </div>
                    <div style="width:50%;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="2" style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;text-transform:uppercase;">AFFECTIVE DOMAIN</th><th style="border:1px solid #000;padding:2px;font-size:8px;font-weight:700;">RATING</th></tr></thead>
                            <tbody>${affRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- ATTENDANCE + REMARKS -->
                <div style="font-size:8px;font-weight:700;margin-top:auto;">
                    <div style="display:flex;gap:8px;margin-bottom:4px;">
                        <span>TIME SCHOOL OPENED: <span style="font-weight:400;">${p.attendance.timesOpened}</span></span>
                        <span>NO OF TIMES PRESENT: <span style="font-weight:400;">${p.attendance.timesPresent}</span></span>
                        <span>NO OF TIMES ABSENT: <span style="font-weight:400;">${p.attendance.timesAbsent}</span></span>
                    </div>
                    <div style="margin-bottom:4px;">CLASS TEACHER'S REMARK: <span style="font-weight:400;font-style:italic;">${p.evaluation.teacherRemark}</span></div>
                    <div style="margin-bottom:4px;">PRINCIPAL'S COMMENT: <span style="font-weight:400;font-style:italic;">${p.evaluation.principalRemark}</span></div>
                </div>
            </div>`;
        },

        renderSession: function(p) {
            const tc = p.school.themeColor || '#1a237e';
            let thCols = `<th style="border:1px solid #000;padding:3px;text-align:left;font-size:8px;font-weight:700;background:#f0f0f0;">SUBJECT</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">TERM 1</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">TERM 2</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">TERM 3</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">ANNUAL</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7px;font-weight:700;background:#f0f0f0;">GRADE</th>`;
            thCols += `<th style="border:1px solid #000;padding:3px 2px;text-align:left;font-size:7px;font-weight:700;background:#f0f0f0;">REMARK</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                tbRows += `<tr>
                    <td style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:600;">${sub.subject}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sub.t1 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sub.t2 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;">${sub.t3 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;font-weight:800;">${sub.annual || sub.total || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:9px;font-weight:700;">${sub.grade || ''}</td>
                    <td style="border:1px solid #000;padding:3px 4px;font-size:8px;">${sub.remark || ''}</td>
                </tr>`;
            });

            return `
            <div style="font-family:Arial,Helvetica,sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;">
                <div style="display:flex;align-items:center;margin-bottom:4px;">
                    <div style="width:75px;height:80px;flex-shrink:0;"><img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;"></div>
                    <div style="flex:1;text-align:center;padding:0 6px;">
                        <div style="font-size:22px;font-weight:900;text-transform:uppercase;color:${tc};">${p.school.name}</div>
                        <div style="font-size:8px;font-weight:600;color:#555;">${p.school.address}</div>
                        <div style="font-size:10px;font-weight:900;font-style:italic;color:${tc};margin-top:2px;">...${p.school.motto}</div>
                    </div>
                    <div style="width:75px;height:80px;flex-shrink:0;"><img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;border:1px solid #ccc;"></div>
                </div>
                <div style="text-align:center;font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:4px;color:${tc};">ANNUAL PERFORMANCE RESULT SHEET</div>
                <div style="font-size:8px;font-weight:700;margin-bottom:4px;">
                    <div>NAME: <span style="font-weight:400;">${p.student.name}</span> &nbsp; CLASS: <span style="font-weight:400;">${p.student.class}</span> &nbsp; SESSION: <span style="font-weight:400;">${p.context.session}</span></div>
                    <div>TOTAL: <span style="font-weight:900;">${p.summary.grandTotal}</span> &nbsp; AVERAGE: <span style="font-weight:900;">${p.summary.average}</span> &nbsp; POSITION: <span style="font-weight:900;">${p.summary.position}</span></div>
                </div>
                <table style="border-collapse:collapse;width:100%;margin-bottom:4px;">
                    <thead><tr>${thCols}</tr></thead>
                    <tbody>${tbRows}</tbody>
                </table>
                <div style="margin-top:auto;font-size:8px;font-weight:700;">
                    <div>CLASS TEACHER'S REMARK: <span style="font-weight:400;font-style:italic;">${p.evaluation.teacherRemark}</span></div>
                    <div>PRINCIPAL'S COMMENT: <span style="font-weight:400;font-style:italic;">${p.evaluation.principalRemark}</span></div>
                </div>
            </div>`;
        }
    };

    console.log('Modern template registered.');
})();
