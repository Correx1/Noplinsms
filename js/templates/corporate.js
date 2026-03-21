// ============================================================
// CORPORATE TEMPLATE — Gold Spring Academy / Pinnacle Style
// Pixel-perfect replica with school bills, domains, attendance
// ============================================================
(function() {

    window.TEMPLATE_REGISTRY.corporate = {
        id: 'corporate',
        name: 'Corporate Form',
        description: 'Traditional school report with full info grid, domains, grading keys, and school bills section.',

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
            headTeacherRemark:  false,
            principalRemark:    true,
            signatures:         true,
            subjectPosition:    true,
            subjectHighLow:     false
        },

        // ==============================
        // TERM RENDERER
        // ==============================
        renderTerm: function(p) {
            const tc = p.school.themeColor || '#0b2265';

            // --- Academic Table ---
            let thCols = `<th style="border:1px solid #000;padding:4px 3px;text-align:left;font-size:9px;font-weight:700;background:#fff;color:#000;">SUBJECT</th>`;
            p.structure.components.forEach(c => {
                thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">${c.name.toUpperCase()}</th>`;
            });
            thCols += `
                <th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TOTAL</th>
                <th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">GRADE</th>
                <th style="border:1px solid #000;padding:4px 2px;text-align:left;font-size:8px;font-weight:700;background:#fff;color:#000;">REMARKS</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                let tr = `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:10px;font-weight:600;color:#000;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '';
                    tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sc}</td>`;
                });
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.total}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:${tc};">${sub.grade}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;color:#000;">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });
            // Empty row for French / empty subject
            tbRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:10px;color:#000;">&nbsp;</td>${p.structure.components.map(() => `<td style="border:1px solid #000;padding:3px 2px;text-align:center;"></td>`).join('')}<td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td></tr>`;

            // --- Domains ---
            const domKeys = Object.keys(p.evaluation.affectiveDomains);
            const domList = domKeys.length > 0 ? domKeys : p.domainsList;
            let domRows = '';
            domList.forEach(d => {
                const val = p.evaluation.affectiveDomains[d] || '';
                domRows += `<tr><td style="border:1px solid #000;padding:2px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${d}</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:9px;font-weight:700;color:#000;">${val}</td></tr>`;
            });

            // --- Grading Keys ---
            let gradingRows = '';
            p.gradingKeys.forEach(g => {
                gradingRows += `<tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;color:#000;text-align:center;">${g.min}% ${g.max === 100 ? '& Above' : '- ' + g.max + '%'} ${g.grade ? '= ' + g.grade : ''} = ${g.remark}</td></tr>`;
            });

            // --- Bills ---
            const billFields = [
                { label: 'TUITION FEE',       key: 'tuition' },
                { label: 'EQUIPMENT',          key: 'equipment' },
                { label: 'LIBRARY',            key: 'library' },
                { label: 'PHONICS FEE',        key: 'phonics' },
                { label: 'GAMES / SPORTS LEVY', key: 'sports' },
                { label: 'P.T.A FEE',          key: 'pta' }
            ];
            let billRows = '';
            billFields.forEach(bf => {
                billRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${bf.label}</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:8px;color:#000;">${p.bills[bf.key] || ''}</td></tr>`;
            });
            // spacer + outstanding + total
            billRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;color:#000;text-transform:uppercase;">OUTSTANDING BILL</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:8px;font-weight:700;color:#000;">${p.bills.outstanding || ''}</td></tr>`;
            billRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:800;color:#000;text-transform:uppercase;">TOTAL</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:9px;font-weight:800;color:#000;">₦ ${p.bills.total || ''}</td></tr>`;

            // --- Teacher Sig ---
            const teacherSigImg = p.signatories.teacher.signature
                ? `<img src="${p.signatories.teacher.signature}" style="max-height:20px;object-fit:contain;">`
                : '';
            const principalSigImg = p.signatories.principal.signature
                ? `<img src="${p.signatories.principal.signature}" style="max-height:20px;object-fit:contain;">`
                : '';

            return `
            <div style="font-family:Arial,Helvetica,sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;padding-top:4px;">

                <!-- HEADER -->
                <div style="display:flex;align-items:flex-start;margin-bottom:2px;">
                    <div style="width:80px;height:90px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 6px;">
                        <div style="font-size:28px;font-weight:900;text-transform:uppercase;color:${tc};font-family:'Arial Black',Impact,sans-serif;line-height:1;letter-spacing:1px;margin:0;">${p.school.name}</div>
                        <div style="font-size:9px;font-weight:700;color:#444;text-transform:uppercase;margin-top:4px;letter-spacing:0.5px;">${p.school.address}</div>
                        <div style="font-size:9px;font-weight:600;color:#2b4c7e;margin-top:1px;">${p.school.email}${p.school.phone ? ', ' + p.school.phone : ''}</div>
                        <div style="font-size:11px;font-weight:900;color:${tc};text-transform:uppercase;margin-top:3px;letter-spacing:0.5px;">MOTTO: ${p.school.motto}</div>
                    </div>
                    <div style="width:75px;height:88px;border:1px solid #ccc;flex-shrink:0;padding:2px;">
                        <img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;">
                    </div>
                </div>

                <!-- INFO GRID -->
                <table style="border-collapse:collapse;width:100%;font-size:9px;font-weight:700;color:#000;margin-bottom:4px;">
                    <tr><td colspan="10" style="border:1px solid #000;text-align:center;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:4px 0;">${p.context.term} REPORT SHEET</td></tr>
                    <tr>
                        <td style="border:1px solid #000;padding:2px 4px;width:7%;">NAME</td>
                        <td style="border:1px solid #000;padding:2px 4px;width:33%;font-weight:400;text-transform:uppercase;">${p.student.name}</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:7%;">CLASS</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:14%;font-weight:400;text-transform:uppercase;">${p.student.class}</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:8%;">GENDER</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:5%;font-weight:400;">${p.student.gender}</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:6%;">TERM</td>
                        <td colspan="3" style="border:1px solid #000;padding:2px 4px;text-align:center;width:20%;font-weight:400;">${p.context.term}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000;padding:2px 4px;">SESSION</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.context.session}</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">NO IN CLASS</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.context.noInClass}</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">DATE OF BIRTH</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.student.dob}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">NO OF TIMES SCHOOL OPENED</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.attendance.timesOpened}</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">NO OF TIMES PRESENT</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.attendance.timesPresent}</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:8px;">NO OF TIMES ABSENT</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.attendance.timesAbsent}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">CLOSING DATE</td>
                        <td colspan="4" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.dates.closingDate}</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">RESUMPTION DATE</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.dates.resumptionDate}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000;padding:3px 4px;text-align:right;font-weight:700;">OVERALL TOTAL</td>
                        <td colspan="2" style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:11px;font-weight:900;">${p.summary.grandTotal}</td>
                        <td style="border:1px solid #000;padding:3px 4px;text-align:right;font-weight:700;">AVERAGE</td>
                        <td colspan="2" style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:10px;font-weight:900;">${p.summary.average}</td>
                        <td style="border:1px solid #000;padding:3px 4px;text-align:right;font-weight:700;">PERCENTAGE</td>
                        <td style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:10px;font-weight:900;">${p.summary.percentage}%</td>
                        <td style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:9px;font-weight:900;">POSITION: ${p.summary.position}</td>
                    </tr>
                </table>

                <!-- ACADEMIC TABLE -->
                <table style="border-collapse:collapse;width:100%;margin-bottom:4px;">
                    <thead>
                        <tr><th colspan="${p.structure.components.length + 4}" style="border:1px solid #000;padding:4px;text-align:center;font-size:9px;font-weight:700;background:#fff;color:#000;text-transform:uppercase;">STUDENT'S ACADEMIC PERFORMANCE (JUNIOR SECONDARY CATEGORY)</th></tr>
                        <tr>${thCols}</tr>
                    </thead>
                    <tbody>${tbRows}</tbody>
                </table>

                <!-- FOOTER: 3-COLUMN LAYOUT -->
                <div style="display:flex;gap:6px;align-items:flex-start;margin-top:2px;">

                    <!-- DOMAINS -->
                    <div style="width:30%;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;width:75%;">DOMAINS</th><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">RATING</th></tr></thead>
                            <tbody>${domRows}</tbody>
                        </table>
                    </div>

                    <!-- KEYS -->
                    <div style="width:35%;display:flex;flex-direction:column;gap:4px;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;color:red;text-decoration:underline;">KEYS TO GRADING</th></tr></thead>
                            <tbody>${gradingRows}</tbody>
                        </table>
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;color:red;text-decoration:underline;">KEYS TO RATING</th></tr></thead>
                            <tbody>
                                <tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;">5= Excellent, 4= Very Good</td></tr>
                                <tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;">3= Good, 2= Poor</td></tr>
                                <tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;">1= Very Poor</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- SCHOOL BILLS -->
                    <div style="width:35%;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="2" style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">SCHOOL BILL</th></tr></thead>
                            <tbody>${billRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- REMARKS & SIGNATURES -->
                <div style="margin-top:auto;padding-top:8px;font-size:9px;font-weight:700;color:#000;">
                    <div style="display:flex;align-items:flex-end;margin-bottom:6px;">
                        <span style="margin-right:6px;white-space:nowrap;text-transform:uppercase;">FORM TEACHER'S COMMENTS</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;font-style:italic;min-height:14px;">${p.evaluation.teacherRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:6px;">
                        <span style="text-transform:uppercase;">NAME</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;">${p.signatories.teacher.name}</div>
                        <span style="text-transform:uppercase;">SIGNATURE</span>
                        <div style="width:100px;border-bottom:1px solid #000;text-align:center;padding-bottom:1px;position:relative;min-height:14px;">${teacherSigImg}</div>
                        <span style="text-transform:uppercase;">DATE</span>
                        <div style="width:110px;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;">${p.dates.closingDate}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:6px;">
                        <span style="margin-right:6px;white-space:nowrap;text-transform:uppercase;">REMARKS BY PRINCIPAL</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;font-style:italic;min-height:14px;">${p.evaluation.principalRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;">
                        <span style="margin-right:6px;white-space:nowrap;text-transform:uppercase;">NAME & SIGNATURE, DATE & STAMP</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:1px;font-weight:400;position:relative;min-height:14px;">
                            <span style="position:relative;z-index:1;">${p.signatories.principal.name}</span>
                            ${principalSigImg ? `<span style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.7;">${principalSigImg}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        },

        // ==============================
        // SESSION (ANNUAL) RENDERER
        // ==============================
        renderSession: function(p) {
            const tc = p.school.themeColor || '#0b2265';

            // --- Academic Table for annual (Term 1, 2, 3, Annual, Grade, Remark) ---
            let thCols = `<th style="border:1px solid #000;padding:4px 3px;text-align:left;font-size:9px;font-weight:700;background:#fff;color:#000;">SUBJECT</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TERM 1</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TERM 2</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TERM 3</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">ANNUAL</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">GRADE</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:left;font-size:8px;font-weight:700;background:#fff;color:#000;">REMARK</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                tbRows += `<tr>
                    <td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:10px;font-weight:600;color:#000;">${sub.subject}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sub.t1 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sub.t2 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sub.t3 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.annual || sub.total || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:${tc};">${sub.grade || ''}</td>
                    <td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;color:#000;">${sub.remark || ''}</td>
                </tr>`;
            });

            // --- Domains ---
            const domKeys = Object.keys(p.evaluation.affectiveDomains);
            const domList = domKeys.length > 0 ? domKeys : p.domainsList;
            let domRows = '';
            domList.forEach(d => {
                const val = p.evaluation.affectiveDomains[d] || '';
                domRows += `<tr><td style="border:1px solid #000;padding:2px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${d}</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:9px;font-weight:700;color:#000;">${val}</td></tr>`;
            });

            // --- Grading Keys ---
            let gradingRows = '';
            p.gradingKeys.forEach(g => {
                gradingRows += `<tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;color:#000;text-align:center;">${g.min}% ${g.max === 100 ? '& Above' : '- ' + g.max + '%'} = ${g.grade} = ${g.remark}</td></tr>`;
            });

            // --- Bills ---
            const billFields = [
                { label: 'TUITION FEE', key: 'tuition' },
                { label: 'EQUIPMENT', key: 'equipment' },
                { label: 'LIBRARY', key: 'library' },
                { label: 'PHONICS FEE', key: 'phonics' },
                { label: 'GAMES / SPORTS LEVY', key: 'sports' },
                { label: 'P.T.A FEE', key: 'pta' }
            ];
            let billRows = '';
            billFields.forEach(bf => {
                billRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${bf.label}</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:8px;color:#000;">${p.bills[bf.key] || ''}</td></tr>`;
            });
            billRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">OUTSTANDING BILL</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:8px;font-weight:700;color:#000;">${p.bills.outstanding || ''}</td></tr>`;
            billRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;font-weight:800;text-transform:uppercase;color:#000;">TOTAL</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:9px;font-weight:800;color:#000;">₦ ${p.bills.total || ''}</td></tr>`;

            const teacherSigImg = p.signatories.teacher.signature
                ? `<img src="${p.signatories.teacher.signature}" style="max-height:20px;object-fit:contain;">`
                : '';
            const principalSigImg = p.signatories.principal.signature
                ? `<img src="${p.signatories.principal.signature}" style="max-height:20px;object-fit:contain;">`
                : '';

            return `
            <div style="font-family:Arial,Helvetica,sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;padding-top:4px;">

                <!-- HEADER -->
                <div style="display:flex;align-items:flex-start;margin-bottom:2px;">
                    <div style="width:80px;height:90px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 6px;">
                        <div style="font-size:28px;font-weight:900;text-transform:uppercase;color:${tc};font-family:'Arial Black',Impact,sans-serif;line-height:1;letter-spacing:1px;margin:0;">${p.school.name}</div>
                        <div style="font-size:9px;font-weight:700;color:#444;text-transform:uppercase;margin-top:4px;letter-spacing:0.5px;">${p.school.address}</div>
                        <div style="font-size:9px;font-weight:600;color:#2b4c7e;margin-top:1px;">${p.school.email}${p.school.phone ? ', ' + p.school.phone : ''}</div>
                        <div style="font-size:11px;font-weight:900;color:${tc};text-transform:uppercase;margin-top:3px;letter-spacing:0.5px;">MOTTO: ${p.school.motto}</div>
                    </div>
                    <div style="width:75px;height:88px;border:1px solid #ccc;flex-shrink:0;padding:2px;">
                        <img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;">
                    </div>
                </div>

                <!-- INFO GRID -->
                <table style="border-collapse:collapse;width:100%;font-size:9px;font-weight:700;color:#000;margin-bottom:4px;">
                    <tr><td colspan="10" style="border:1px solid #000;text-align:center;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:4px 0;">ANNUAL CUMULATIVE REPORT SHEET</td></tr>
                    <tr>
                        <td style="border:1px solid #000;padding:2px 4px;width:7%;">NAME</td>
                        <td style="border:1px solid #000;padding:2px 4px;width:33%;font-weight:400;text-transform:uppercase;">${p.student.name}</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:7%;">CLASS</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:14%;font-weight:400;text-transform:uppercase;">${p.student.class}</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:8%;">GENDER</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:5%;font-weight:400;">${p.student.gender}</td>
                        <td style="border:1px solid #000;padding:2px 4px;text-align:center;width:7%;">SESSION</td>
                        <td colspan="3" style="border:1px solid #000;padding:2px 4px;text-align:center;width:19%;font-weight:400;">${p.context.session}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">NO IN CLASS</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.context.noInClass}</td>
                        <td colspan="2" style="border:1px solid #000;padding:2px 4px;text-align:center;">DATE OF BIRTH</td>
                        <td colspan="4" style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:400;">${p.student.dob}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000;padding:3px 4px;text-align:right;font-weight:700;">OVERALL TOTAL</td>
                        <td colspan="2" style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:11px;font-weight:900;">${p.summary.grandTotal}</td>
                        <td style="border:1px solid #000;padding:3px 4px;text-align:right;font-weight:700;">AVERAGE</td>
                        <td colspan="2" style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:10px;font-weight:900;">${p.summary.average}</td>
                        <td style="border:1px solid #000;padding:3px 4px;text-align:right;font-weight:700;">PERCENTAGE</td>
                        <td style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:10px;font-weight:900;">${p.summary.percentage}%</td>
                        <td style="border:2px solid #000;padding:3px 4px;text-align:center;font-size:9px;font-weight:900;">POSITION: ${p.summary.position}</td>
                    </tr>
                </table>

                <!-- ACADEMIC TABLE -->
                <table style="border-collapse:collapse;width:100%;margin-bottom:4px;">
                    <thead>
                        <tr><th colspan="7" style="border:1px solid #000;padding:4px;text-align:center;font-size:9px;font-weight:700;background:#fff;color:#000;text-transform:uppercase;">STUDENT'S ANNUAL ACADEMIC PERFORMANCE</th></tr>
                        <tr>${thCols}</tr>
                    </thead>
                    <tbody>${tbRows}</tbody>
                </table>

                <!-- FOOTER: 3-COLUMN LAYOUT -->
                <div style="display:flex;gap:6px;align-items:flex-start;margin-top:2px;">
                    <div style="width:30%;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;width:75%;">DOMAINS</th><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">RATING</th></tr></thead>
                            <tbody>${domRows}</tbody>
                        </table>
                    </div>
                    <div style="width:35%;display:flex;flex-direction:column;gap:4px;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;color:red;text-decoration:underline;">KEYS TO GRADING</th></tr></thead>
                            <tbody>${gradingRows}</tbody>
                        </table>
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;color:red;text-decoration:underline;">KEYS TO RATING</th></tr></thead>
                            <tbody>
                                <tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;">5= Excellent, 4= Very Good</td></tr>
                                <tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;">3= Good, 2= Poor</td></tr>
                                <tr><td style="border:1px solid #000;padding:1px 4px;font-size:8px;">1= Very Poor</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="width:35%;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="2" style="border:1px solid #000;padding:2px 4px;font-size:9px;font-weight:700;">SCHOOL BILL</th></tr></thead>
                            <tbody>${billRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- REMARKS & SIGNATURES -->
                <div style="margin-top:auto;padding-top:8px;font-size:9px;font-weight:700;color:#000;">
                    <div style="display:flex;align-items:flex-end;margin-bottom:6px;">
                        <span style="margin-right:6px;white-space:nowrap;text-transform:uppercase;">FORM TEACHER'S COMMENTS</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;font-style:italic;min-height:14px;">${p.evaluation.teacherRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:6px;">
                        <span style="text-transform:uppercase;">NAME</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;">${p.signatories.teacher.name}</div>
                        <span style="text-transform:uppercase;">SIGNATURE</span>
                        <div style="width:100px;border-bottom:1px solid #000;text-align:center;padding-bottom:1px;position:relative;min-height:14px;">${teacherSigImg}</div>
                        <span style="text-transform:uppercase;">DATE</span>
                        <div style="width:110px;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;">${p.dates.closingDate}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:6px;">
                        <span style="margin-right:6px;white-space:nowrap;text-transform:uppercase;">REMARKS BY PRINCIPAL</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:2px;font-weight:400;font-style:italic;min-height:14px;">${p.evaluation.principalRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;">
                        <span style="margin-right:6px;white-space:nowrap;text-transform:uppercase;">NAME & SIGNATURE, DATE & STAMP</span>
                        <div style="flex:1;border-bottom:1px solid #000;text-align:center;padding-bottom:1px;font-weight:400;position:relative;min-height:14px;">
                            <span style="position:relative;z-index:1;">${p.signatories.principal.name}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    };

    console.log('Corporate template registered.');
})();
