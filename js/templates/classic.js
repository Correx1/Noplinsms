// ============================================================
// CLASSIC TEMPLATE — Pinnacle of Success Model School Style
// Simple header, info grid with underlines, 3-column footer
// ============================================================
(function() {

    window.TEMPLATE_REGISTRY.classic = {
        id: 'classic',
        name: 'Classic Style',
        description: 'Traditional report sheet with bordered info grid, domains, grading keys, and school bills.',

        capabilities: {
            studentPhoto:       true,
            dateOfBirth:        true,
            attendance:         true,
            closingDate:        true,
            resumptionDate:     true,
            affectiveDomains:   true,
            psychomotorDomains: false,
            schoolBills:        true,
            keysToGrading:      true,
            keysToRating:       true,
            teacherRemark:      true,
            headTeacherRemark:  true,
            principalRemark:    false,
            signatures:         true,
            subjectPosition:    true,
            subjectHighLow:     false
        },

        renderTerm: function(p) {
            const tc = p.school.themeColor || '#1a237e';

            // Academic Table
            let thCols = `<th style="border:1.5px solid #000;padding:4px 3px;text-align:left;font-size:9px;font-weight:700;background:#fff;color:#000;">SUBJECT</th>`;
            p.structure.components.forEach(c => {
                thCols += `<th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:7px;font-weight:700;background:#fff;color:#000;">${c.name.toUpperCase()} %</th>`;
            });
            thCols += `
                <th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TOTAL<br>100%</th>
                <th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">GRADE</th>
                <th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:7px;font-weight:700;background:#fff;color:#000;">SUBJECT<br>POSITION</th>
                <th style="border:1.5px solid #000;padding:4px 3px;text-align:left;font-size:8px;font-weight:700;background:#fff;color:#000;">REMARKS</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                let tr = `<td style="border:1.5px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:700;color:#000;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '';
                    tr += `<td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sc}</td>`;
                });
                tr += `<td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.total}</td>`;
                tr += `<td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:#000;">${sub.grade}</td>`;
                tr += `<td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sub.position || ''}</td>`;
                tr += `<td style="border:1.5px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;color:#000;">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });
            // Empty rows for padding
            for (let i = 0; i < 2; i++) {
                tbRows += `<tr><td style="border:1.5px solid #000;padding:3px 4px;">&nbsp;</td>${p.structure.components.map(() => `<td style="border:1.5px solid #000;"></td>`).join('')}<td style="border:1.5px solid #000;"></td><td style="border:1.5px solid #000;"></td><td style="border:1.5px solid #000;"></td><td style="border:1.5px solid #000;"></td></tr>`;
            }

            // --- Domains ---
            const domKeys = Object.keys(p.evaluation.affectiveDomains);
            const domList = domKeys.length > 0 ? domKeys : p.domainsList;
            let domRows = '';
            domList.forEach(d => {
                const val = p.evaluation.affectiveDomains[d] || '';
                domRows += `<tr><td style="border:1.5px solid #000;padding:2px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${d}</td><td style="border:1.5px solid #000;padding:2px 4px;text-align:center;font-size:9px;font-weight:700;color:#000;">${val}</td></tr>`;
            });

            // --- Grading Keys ---
            let gradingRows = '';
            p.gradingKeys.forEach(g => {
                gradingRows += `<tr><td style="border:1.5px solid #000;padding:1px 4px;font-size:8px;color:#000;text-align:center;">${g.min}${g.max === 100 ? '& Above' : '-' + g.max} ${g.grade}=${g.remark}</td></tr>`;
            });

            // --- Bills ---
            const billFields = [
                { label: 'TUITION FEE', key: 'tuition' },
                { label: 'EXAMINATION FEE', key: 'examination' },
                { label: 'SPORT WEAR FEE', key: 'sports' },
                { label: 'LESSON FEE', key: 'lesson' }
            ];
            let billRows = '';
            billFields.forEach(bf => {
                billRows += `<tr><td style="border:1.5px solid #000;padding:2px 4px;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${bf.label}</td><td style="border:1.5px solid #000;padding:2px 4px;text-align:right;font-size:8px;color:#000;">₦ ${p.bills[bf.key] || ''}</td></tr>`;
            });
            billRows += `<tr><td style="border:1.5px solid #000;padding:2px 4px;font-size:8px;font-weight:600;color:#000;">OUTSTANDING BILL</td><td style="border:1.5px solid #000;padding:2px 4px;text-align:right;font-size:8px;font-weight:700;color:#000;">₦ ${p.bills.outstanding || ''}</td></tr>`;
            billRows += `<tr><td style="border:1.5px solid #000;padding:2px 4px;font-size:8px;font-weight:800;color:#000;">TOTAL</td><td style="border:1.5px solid #000;padding:2px 4px;text-align:right;font-size:9px;font-weight:800;color:#000;">₦ ${p.bills.total || ''}</td></tr>`;

            return `
            <div style="font-family:Arial,Helvetica,sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;padding-top:4px;">

                <!-- HEADER -->
                <div style="display:flex;align-items:flex-start;margin-bottom:4px;">
                    <div style="width:75px;height:80px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 8px;">
                        <div style="font-size:22px;font-weight:900;text-transform:uppercase;color:${tc};font-family:'Arial Black',Impact,sans-serif;line-height:1.1;">${p.school.name}</div>
                        <div style="font-size:9px;font-weight:600;color:#444;margin-top:2px;">${p.school.address}</div>
                        <div style="font-size:8px;font-weight:600;color:#555;margin-top:1px;">${p.school.email}${p.school.phone ? ', ' + p.school.phone : ''}</div>
                        <div style="font-size:10px;font-weight:900;color:${tc};text-transform:uppercase;margin-top:3px;">MOTTO: ${p.school.motto}</div>
                    </div>
                    <div style="width:70px;height:80px;flex-shrink:0;">
                        <img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;border:1px solid #ccc;">
                    </div>
                </div>

                <!-- TITLE -->
                <div style="border:2px solid #000;text-align:center;padding:4px 0;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">${p.context.term} REPORT SHEET</div>

                <!-- INFO GRID (line-based) -->
                <div style="font-size:9px;font-weight:700;margin-bottom:6px;line-height:2;">
                    <div style="display:flex;gap:8px;">
                        <span>NAME <span style="border-bottom:1.5px solid #000;padding:0 20px;font-weight:400;">${p.student.name}</span></span>
                        <span>CLASS <span style="border-bottom:1.5px solid #000;padding:0 12px;font-weight:400;">${p.student.class}</span></span>
                        <span>GENDER <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:400;">${p.student.gender}</span></span>
                        <span>TERM <span style="border-bottom:1.5px solid #000;padding:0 12px;font-weight:400;">${p.context.term}</span></span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <span>SESSION <span style="border-bottom:1.5px solid #000;padding:0 12px;font-weight:400;">${p.context.session}</span></span>
                        <span>NO IN CLASS <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:400;">${p.context.noInClass}</span></span>
                        <span>DATE OF BIRTH <span style="border-bottom:1.5px solid #000;padding:0 12px;font-weight:400;">${p.student.dob}</span></span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <span>NO OF TIMES SCHOOL OPENED <span style="border-bottom:1.5px solid #000;padding:0 8px;font-weight:400;">${p.attendance.timesOpened}</span></span>
                        <span>NO OF TIMES PRESENT <span style="border-bottom:1.5px solid #000;padding:0 8px;font-weight:400;">${p.attendance.timesPresent}</span></span>
                        <span>NO OF TIMES ABSENT <span style="border-bottom:1.5px solid #000;padding:0 8px;font-weight:400;">${p.attendance.timesAbsent}</span></span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <span>CLOSING DATE <span style="border-bottom:1.5px solid #000;padding:0 18px;font-weight:400;">${p.dates.closingDate}</span></span>
                        <span>RESUMPTION DATE <span style="border-bottom:1.5px solid #000;padding:0 18px;font-weight:400;">${p.dates.resumptionDate}</span></span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <span>OVERALL TOTAL <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.grandTotal}</span></span>
                        <span>AVERAGE <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.average}</span></span>
                        <span>PERCENTAGE <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.percentage}%</span></span>
                        <span>POSITION <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.position}</span></span>
                    </div>
                </div>

                <!-- PUPIL'S ACADEMIC PERFORMANCE -->
                <table style="border-collapse:collapse;width:100%;margin-bottom:4px;">
                    <thead>
                        <tr><th colspan="${p.structure.components.length + 5}" style="border:1.5px solid #000;padding:3px;text-align:center;font-size:9px;font-weight:700;text-transform:uppercase;">PUPIL'S ACADEMIC PERFORMANCE ( ${p.student.class.toUpperCase()} CATEGORY )</th></tr>
                        <tr>${thCols}</tr>
                    </thead>
                    <tbody>${tbRows}</tbody>
                </table>

                <!-- FOOTER: 3-COLUMN -->
                <div style="display:flex;gap:6px;align-items:flex-start;margin-top:2px;">
                    <div style="width:30%;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;width:70%;">DOMAINS</th><th style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">RATING</th></tr></thead>
                            <tbody>${domRows}</tbody>
                        </table>
                    </div>
                    <div style="width:35%;display:flex;flex-direction:column;gap:4px;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">KEYS TO GRADING</th></tr></thead>
                            <tbody>${gradingRows}</tbody>
                        </table>
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">KEYS TO RATING</th></tr></thead>
                            <tbody>
                                <tr><td style="border:1.5px solid #000;padding:1px 4px;font-size:8px;">5= Excellent, 4= Very Good</td></tr>
                                <tr><td style="border:1.5px solid #000;padding:1px 4px;font-size:8px;">3= Good, 2= Poor</td></tr>
                                <tr><td style="border:1.5px solid #000;padding:1px 4px;font-size:8px;">1= Very Poor</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="width:35%;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="2" style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">SCHOOL BILL</th></tr></thead>
                            <tbody>${billRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- REMARKS -->
                <div style="margin-top:auto;padding-top:6px;font-size:9px;font-weight:700;line-height:2;">
                    <div>CLASS TEACHER'S REMARK <span style="border-bottom:1.5px solid #000;font-weight:400;font-style:italic;padding:0 40px;">${p.evaluation.teacherRemark}</span></div>
                    <div>HEAD TEACHER'S REMARK <span style="border-bottom:1.5px solid #000;font-weight:400;font-style:italic;padding:0 40px;">${p.evaluation.headTeacherRemark}</span></div>
                    <div style="display:flex;gap:10px;">
                        <span>DATE <span style="border-bottom:1.5px solid #000;padding:0 20px;font-weight:400;">${p.dates.closingDate}</span></span>
                        <span style="flex:1;text-align:right;">SIGNATURE <span style="border-bottom:1.5px solid #000;padding:0 40px;">${p.signatories.teacher.signature ? `<img src="${p.signatories.teacher.signature}" style="max-height:18px;vertical-align:bottom;">` : ''}</span></span>
                    </div>
                </div>
            </div>`;
        },

        renderSession: function(p) {
            const tc = p.school.themeColor || '#1a237e';
            // Annual version uses T1/T2/T3/Annual columns
            let thCols = `<th style="border:1.5px solid #000;padding:4px 3px;text-align:left;font-size:9px;font-weight:700;">SUBJECT</th>`;
            thCols += `<th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;">TERM 1</th>`;
            thCols += `<th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;">TERM 2</th>`;
            thCols += `<th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;">TERM 3</th>`;
            thCols += `<th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;">ANNUAL</th>`;
            thCols += `<th style="border:1.5px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;">GRADE</th>`;
            thCols += `<th style="border:1.5px solid #000;padding:4px 3px;text-align:left;font-size:8px;font-weight:700;">REMARKS</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                tbRows += `<tr>
                    <td style="border:1.5px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:700;color:#000;">${sub.subject}</td>
                    <td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${sub.t1 || ''}</td>
                    <td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${sub.t2 || ''}</td>
                    <td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;">${sub.t3 || ''}</td>
                    <td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;">${sub.annual || sub.total || ''}</td>
                    <td style="border:1.5px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;">${sub.grade}</td>
                    <td style="border:1.5px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;">${sub.remark || ''}</td>
                </tr>`;
            });

            // Reuse domains/keys/bills from term version
            const domKeys = Object.keys(p.evaluation.affectiveDomains);
            const domList = domKeys.length > 0 ? domKeys : p.domainsList;
            let domRows = '';
            domList.forEach(d => {
                domRows += `<tr><td style="border:1.5px solid #000;padding:2px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;">${d}</td><td style="border:1.5px solid #000;padding:2px 4px;text-align:center;font-size:9px;font-weight:700;">${p.evaluation.affectiveDomains[d] || ''}</td></tr>`;
            });

            let gradingRows = '';
            p.gradingKeys.forEach(g => {
                gradingRows += `<tr><td style="border:1.5px solid #000;padding:1px 4px;font-size:8px;text-align:center;">${g.min}${g.max===100?'& Above':'-'+g.max} ${g.grade}=${g.remark}</td></tr>`;
            });

            return `
            <div style="font-family:Arial,Helvetica,sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;padding-top:4px;">
                <div style="display:flex;align-items:flex-start;margin-bottom:4px;">
                    <div style="width:75px;height:80px;flex-shrink:0;"><img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;"></div>
                    <div style="flex:1;text-align:center;padding:0 8px;">
                        <div style="font-size:22px;font-weight:900;text-transform:uppercase;color:${tc};font-family:'Arial Black',Impact,sans-serif;line-height:1.1;">${p.school.name}</div>
                        <div style="font-size:9px;font-weight:600;color:#444;margin-top:2px;">${p.school.address}</div>
                        <div style="font-size:10px;font-weight:900;color:${tc};text-transform:uppercase;margin-top:3px;">MOTTO: ${p.school.motto}</div>
                    </div>
                    <div style="width:70px;height:80px;flex-shrink:0;"><img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;border:1px solid #ccc;"></div>
                </div>
                <div style="border:2px solid #000;text-align:center;padding:4px 0;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">ANNUAL REPORT SHEET</div>
                <div style="font-size:9px;font-weight:700;margin-bottom:6px;line-height:2;">
                    <div style="display:flex;gap:8px;">
                        <span>NAME <span style="border-bottom:1.5px solid #000;padding:0 20px;font-weight:400;">${p.student.name}</span></span>
                        <span>CLASS <span style="border-bottom:1.5px solid #000;padding:0 12px;font-weight:400;">${p.student.class}</span></span>
                        <span>SESSION <span style="border-bottom:1.5px solid #000;padding:0 12px;font-weight:400;">${p.context.session}</span></span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <span>OVERALL TOTAL <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.grandTotal}</span></span>
                        <span>AVERAGE <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.average}</span></span>
                        <span>PERCENTAGE <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.percentage}%</span></span>
                        <span>POSITION <span style="border-bottom:1.5px solid #000;padding:0 10px;font-weight:900;">${p.summary.position}</span></span>
                    </div>
                </div>
                <table style="border-collapse:collapse;width:100%;margin-bottom:4px;">
                    <thead><tr><th colspan="7" style="border:1.5px solid #000;padding:3px;text-align:center;font-size:9px;font-weight:700;text-transform:uppercase;">ANNUAL ACADEMIC PERFORMANCE</th></tr><tr>${thCols}</tr></thead>
                    <tbody>${tbRows}</tbody>
                </table>
                <div style="display:flex;gap:6px;align-items:flex-start;margin-top:2px;">
                    <div style="width:30%;"><table style="border-collapse:collapse;width:100%;"><thead><tr><th style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;width:70%;">DOMAINS</th><th style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">RATING</th></tr></thead><tbody>${domRows}</tbody></table></div>
                    <div style="width:35%;"><table style="border-collapse:collapse;width:100%;text-align:center;"><thead><tr><th style="border:1.5px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">KEYS TO GRADING</th></tr></thead><tbody>${gradingRows}</tbody></table></div>
                </div>
                <div style="margin-top:auto;padding-top:6px;font-size:9px;font-weight:700;line-height:2;">
                    <div>CLASS TEACHER'S REMARK <span style="border-bottom:1.5px solid #000;font-weight:400;font-style:italic;padding:0 40px;">${p.evaluation.teacherRemark}</span></div>
                    <div>HEAD TEACHER'S REMARK <span style="border-bottom:1.5px solid #000;font-weight:400;font-style:italic;padding:0 40px;">${p.evaluation.headTeacherRemark}</span></div>
                    <div>DATE <span style="border-bottom:1.5px solid #000;padding:0 20px;font-weight:400;">${p.dates.closingDate}</span> &nbsp;&nbsp; SIGNATURE <span style="border-bottom:1.5px solid #000;padding:0 60px;"></span></div>
                </div>
            </div>`;
        }
    };

    console.log('Classic template registered.');
})();
