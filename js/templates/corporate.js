// ============================================================
// CORPORATE TEMPLATE — Gold Spring Academy Replica
// Pixel-perfect replica with strict inline-border data fields
// ============================================================
(function() {

    window.TEMPLATE_REGISTRY.corporate = {
        id: 'corporate',
        name: 'Corporate Form',
        description: 'Traditional school report with Excel-style inline bottom-bordered fields, domains, and school bills.',

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
                thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:9px;font-weight:700;background:#fff;color:#000;">${c.name}</th>`;
            });
            thCols += `
                <th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:9px;font-weight:700;background:#fff;color:#000;">Total</th>
                <th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:9px;font-weight:700;background:#fff;color:#000;">Grade</th>
                <th style="border:1px solid #000;padding:4px 4px;text-align:left;font-size:9px;font-weight:700;background:#fff;color:#000;">Remarks</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                let tr = `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:10px;font-weight:600;color:#000;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '';
                    tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sc}</td>`;
                });
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.total}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:#000;">${sub.grade}</td>`;
                tr += `<td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;color:#000;">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });
            // Empty row at the bottom
            tbRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:10px;color:#000;">&nbsp;</td>${p.structure.components.map(() => `<td style="border:1px solid #000;padding:3px 2px;text-align:center;"></td>`).join('')}<td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td></tr>`;

            // --- Domains ---
            const domKeys = Object.keys(p.evaluation.affectiveDomains);
            const domList = domKeys.length > 0 ? domKeys : p.domainsList;
            let domRows = '';
            domList.forEach(d => {
                const val = p.evaluation.affectiveDomains[d] || '';
                domRows += `<tr><td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${d}</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9px;font-weight:700;color:#000;">${val}</td></tr>`;
            });

            // --- Grading Keys ---
            let gradingRows = '';
            p.gradingKeys.forEach(g => {
                gradingRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;color:#000;text-align:center;">${g.min}% & Above \u00A0 ${g.grade ? g.grade : ''} = ${g.remark}</td></tr>`;
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
                billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;width:60%;">${bf.label}</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:8px;color:#000;width:40%;">${p.bills[bf.key] || ''}</td></tr>`;
            });
            billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:8px;font-weight:600;color:#000;text-transform:uppercase;height:24px;vertical-align:bottom;">OUTSTANDING BILL</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:8px;font-weight:700;color:#000;vertical-align:bottom;">${p.bills.outstanding || ''}</td></tr>`;
            billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:8px;font-weight:800;color:#000;text-transform:uppercase;">TOTAL</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9px;font-weight:800;color:#000;">₦ ${p.bills.total || '-'}</td></tr>`;

            // --- Signatures ---
            const teacherSigImg = p.signatories.teacher.signature ? `<img src="${p.signatories.teacher.signature}" style="max-height:20px;object-fit:contain;">` : '';
            const principalSigImg = p.signatories.principal.signature ? `<img src="${p.signatories.principal.signature}" style="max-height:20px;object-fit:contain;">` : '';

            // Render output
            return `
            <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;padding-top:4px;box-sizing:border-box;">

                <!-- HEADER ZONE -->
                <div style="display:flex;align-items:center;margin-bottom:8px;border-bottom:1px solid #ddd;padding-bottom:6px;">
                    <div style="width:85px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;max-height:90px;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 10px;">
                        <div style="font-size:28px;font-weight:900;text-transform:uppercase;color:${tc};font-family:Arial, sans-serif;line-height:1;margin:0;">${p.school.name}</div>
                        <div style="font-size:10px;font-weight:700;color:#333;text-transform:uppercase;margin-top:4px;">${p.school.address}</div>
                        <div style="font-size:10px;font-weight:700;color:#2b4c7e;margin-top:2px;text-decoration:underline;">${p.school.email}, ${p.school.phone}</div>
                        <div style="font-size:13px;font-weight:800;color:#cc0000;text-transform:uppercase;margin-top:4px;">MOTTO: ${p.school.motto}</div>
                    </div>
                    <div style="width:85px;height:100px;border:1px solid #ccc;flex-shrink:0;padding:2px;box-sizing:border-box;">
                        <img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;">
                    </div>
                </div>

                <!-- INFO GRID (UNDERLINE STYLE) -->
                <div style="border:2px solid #000; padding:2px; text-align:center; font-weight:900; font-size:12px; margin-bottom:8px; text-transform:uppercase;">
                    ${p.context.term} REPORT SHEET
                </div>

                <div style="font-size:10px;font-weight:700;display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
                    <div style="display:flex;align-items:flex-end;gap:4px;">
                        <div style="white-space:nowrap;">NAME</div>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.name}</div>
                        <div style="white-space:nowrap;">CLASS</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.class}</div>
                        <div style="white-space:nowrap;">GENDER</div>
                        <div style="width:60px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.gender.charAt(0)}</div>
                        <div style="white-space:nowrap;">TERM</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.context.term}</div>
                    </div>

                    <div style="display:flex;align-items:flex-end;gap:4px;">
                        <div style="white-space:nowrap;">SESSION</div>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.context.session}</div>
                        <div style="white-space:nowrap;">NO IN CLASS</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.context.noInClass}</div>
                        <div style="flex:1;"></div>
                        <div style="white-space:nowrap;">DATE OF BIRTH</div>
                        <div style="flex:1.5;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.dob}</div>
                    </div>

                    <div style="display:flex;align-items:flex-end;gap:4px;">
                        <div style="white-space:nowrap;">NO OF TIMES SCHOOL OPENED</div>
                        <div style="width:60px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.attendance.timesOpened}</div>
                        <div style="flex:1;"></div>
                        <div style="white-space:nowrap;">NO OF TIMES PRESENT</div>
                        <div style="width:60px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.attendance.timesPresent}</div>
                        <div style="flex:1;"></div>
                        <div style="white-space:nowrap;">NO OF TIMES ABSENT</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.attendance.timesAbsent || 'NIL'}</div>
                    </div>

                    <div style="display:flex;align-items:flex-end;gap:4px;">
                        <div style="white-space:nowrap;">CLOSING DATE</div>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.dates.closingDate}</div>
                        <div style="flex:0.5;"></div>
                        <div style="white-space:nowrap;">RESUMPTION DATE</div>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.dates.resumptionDate}</div>
                    </div>
                </div>

                <!-- OVERALL SUMMARY BLOCKS -->
                <div style="display:flex;justify-content:space-between;align-items:stretch;margin-bottom:8px;font-size:10px;font-weight:700;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>OVERALL TOTAL</span>
                        <div style="border:2px solid #000;width:80px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.grandTotal}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>AVERAGE</span>
                        <div style="border:2px solid #000;width:70px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.average}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>PERCENTAGE</span>
                        <div style="border:2px solid #000;width:70px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.percentage}%</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>POSITION</span>
                        <div style="border:2px solid #000;width:70px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.position}</div>
                    </div>
                </div>

                <!-- ACADEMIC TABLE -->
                <table style="border-collapse:collapse;width:100%;margin-bottom:8px;">
                    <thead>
                        <tr><th colspan="${p.structure.components.length + 4}" style="border:1px solid #000;padding:4px;text-align:center;font-size:9px;font-weight:700;background:#fff;color:#000;text-transform:uppercase;">STUDENT'S ACADEMIC PERFORMANCE (JUNIOR SECONDARY CATEGORY)</th></tr>
                        <tr>${thCols}</tr>
                    </thead>
                    <tbody>${tbRows}</tbody>
                </table>

                <!-- BOTTOM 3-COLUMN LAYOUT -->
                <div style="display:flex;gap:15px;align-items:flex-start;margin-bottom:8px;">
                    <!-- DOMAINS -->
                    <div style="flex:1;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr>
                                <th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;">DOMAINS</th>
                                <th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;">RATING</th>
                            </tr></thead>
                            <tbody>${domRows}</tbody>
                        </table>
                    </div>

                    <!-- KEYS -->
                    <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:900;color:red;text-decoration:underline;">KEYS TO GRADING</th></tr></thead>
                            <tbody>${gradingRows}</tbody>
                        </table>
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:900;color:red;text-decoration:underline;">KEYS TO RATING</th></tr></thead>
                            <tbody>
                                <tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;">5= Excellent, 4= Very Good</td></tr>
                                <tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;">3= Good, 2= Poor</td></tr>
                                <tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;">1= Very Poor</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- SCHOOL BILLS -->
                    <div style="flex:1;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center;">SCHOOL BILL</th></tr></thead>
                            <tbody>${billRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- FOOTER REMARKS -->
                <div style="margin-top:auto;font-size:9px;font-weight:700;color:#000;">
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;">
                        <span style="white-space:nowrap;text-transform:uppercase;margin-right:8px;">FORM TEACHER'S COMMENTS</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;min-height:14px;">${p.evaluation.teacherRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:8px;">
                        <span style="text-transform:uppercase;">NAME</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;">${p.signatories.teacher.name}</div>
                        <span style="text-transform:uppercase;">SIGNATURE</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;position:relative;min-height:14px;">${teacherSigImg}</div>
                        <span style="text-transform:uppercase;">DATE</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;">${p.dates.closingDate}</div>
                    </div>
                    
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;">
                        <span style="white-space:nowrap;text-transform:uppercase;margin-right:8px;">REMARKS BY PRINCIPAL</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;min-height:14px;">${p.evaluation.principalRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;gap:8px;">
                        <span style="white-space:nowrap;text-transform:uppercase;">NAME & SIGNATURE, DATE & STAMP</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;position:relative;min-height:14px;display:flex;justify-content:center;align-items:flex-end;">
                            <span style="z-index:2;background:#fff;padding:0 4px;">${p.signatories.principal.name}</span>
                            ${principalSigImg ? `<span style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);z-index:1;">${principalSigImg}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        },

        // ==============================
        // SESSION RENDERER
        // ==============================
        renderSession: function(p) {
            const tc = p.school.themeColor || '#0b2265';
            
            let thCols = `<th style="border:1px solid #000;padding:4px 3px;text-align:left;font-size:9px;font-weight:700;background:#fff;color:#000;">SUBJECT</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TERM 1</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TERM 2</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">TERM 3</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">ANNUAL TOTAL</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">AVERAGE</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 2px;text-align:center;font-size:8px;font-weight:700;background:#fff;color:#000;">GRADE</th>`;
            thCols += `<th style="border:1px solid #000;padding:4px 4px;text-align:left;font-size:8px;font-weight:700;background:#fff;color:#000;">REMARKS</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                tbRows += `<tr>
                    <td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:10px;font-weight:600;color:#000;">${sub.subject}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sub.t1 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sub.t2 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;color:#000;">${sub.t3 || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.annual || sub.total || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:#000;">${sub.average || ''}</td>
                    <td style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:10px;font-weight:700;color:#000;">${sub.grade || ''}</td>
                    <td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:9px;font-weight:600;color:#000;">${sub.remark || ''}</td>
                </tr>`;
            });
            // Empty spacer row
            tbRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:10px;color:#000;">&nbsp;</td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td></tr>`;

            // --- Domains ---
            const domKeys = Object.keys(p.evaluation.affectiveDomains);
            const domList = domKeys.length > 0 ? domKeys : p.domainsList;
            let domRows = '';
            domList.forEach(d => {
                const val = p.evaluation.affectiveDomains[d] || '';
                domRows += `<tr><td style="border:1px solid #000;padding:3px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;">${d}</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9px;font-weight:700;color:#000;">${val}</td></tr>`;
            });

            // --- Grading Keys ---
            let gradingRows = '';
            p.gradingKeys.forEach(g => {
                gradingRows += `<tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;color:#000;text-align:center;">${g.min}% & Above \u00A0 ${g.grade ? g.grade : ''} = ${g.remark}</td></tr>`;
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
                billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:8px;font-weight:600;text-transform:uppercase;color:#000;width:60%;">${bf.label}</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:8px;color:#000;width:40%;">${p.bills[bf.key] || ''}</td></tr>`;
            });
            billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:8px;font-weight:600;color:#000;text-transform:uppercase;height:24px;vertical-align:bottom;">OUTSTANDING BILL</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:8px;font-weight:700;color:#000;vertical-align:bottom;">${p.bills.outstanding || ''}</td></tr>`;
            billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:8px;font-weight:800;color:#000;text-transform:uppercase;">TOTAL</td><td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9px;font-weight:800;color:#000;">₦ ${p.bills.total || '-'}</td></tr>`;

            // --- Signatures ---
            const teacherSigImg = p.signatories.teacher.signature ? `<img src="${p.signatories.teacher.signature}" style="max-height:20px;object-fit:contain;">` : '';
            const principalSigImg = p.signatories.principal.signature ? `<img src="${p.signatories.principal.signature}" style="max-height:20px;object-fit:contain;">` : '';

            return `
            <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;width:100%;height:100%;color:#000;background:#fff;display:flex;flex-direction:column;padding-top:4px;box-sizing:border-box;">

                <!-- HEADER ZONE -->
                <div style="display:flex;align-items:center;margin-bottom:8px;border-bottom:1px solid #ddd;padding-bottom:6px;">
                    <div style="width:85px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;max-height:90px;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 10px;">
                        <div style="font-size:28px;font-weight:900;text-transform:uppercase;color:${tc};font-family:Arial, sans-serif;line-height:1;margin:0;">${p.school.name}</div>
                        <div style="font-size:10px;font-weight:700;color:#333;text-transform:uppercase;margin-top:4px;">${p.school.address}</div>
                        <div style="font-size:10px;font-weight:700;color:#2b4c7e;margin-top:2px;text-decoration:underline;">${p.school.email}, ${p.school.phone}</div>
                        <div style="font-size:13px;font-weight:800;color:#cc0000;text-transform:uppercase;margin-top:4px;">MOTTO: ${p.school.motto}</div>
                    </div>
                    <div style="width:85px;height:100px;border:1px solid #ccc;flex-shrink:0;padding:2px;box-sizing:border-box;">
                        <img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;">
                    </div>
                </div>

                <!-- INFO GRID (UNDERLINE STYLE) -->
                <div style="border:2px solid #000; padding:2px; text-align:center; font-weight:900; font-size:12px; margin-bottom:8px; text-transform:uppercase;">
                    ANNUAL CUMULATIVE REPORT SHEET
                </div>

                <div style="font-size:10px;font-weight:700;display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
                    <div style="display:flex;align-items:flex-end;gap:4px;">
                        <div style="white-space:nowrap;">NAME</div>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.name}</div>
                        <div style="white-space:nowrap;">CLASS</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.class}</div>
                        <div style="white-space:nowrap;">GENDER</div>
                        <div style="width:60px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.gender.charAt(0)}</div>
                        <div style="white-space:nowrap;">SESSION</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.context.session}</div>
                    </div>

                    <div style="display:flex;align-items:flex-end;gap:4px;">
                        <div style="white-space:nowrap;">NO IN CLASS</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.context.noInClass}</div>
                        <div style="flex:1;"></div>
                        <div style="white-space:nowrap;">DATE OF BIRTH</div>
                        <div style="flex:1.5;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.student.dob}</div>
                        <div style="flex:1;"></div>
                    </div>

                    <div style="display:flex;align-items:flex-end;gap:4px;">
                        <div style="white-space:nowrap;">NO OF TIMES SCHOOL OPENED</div>
                        <div style="width:60px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.attendance.timesOpened}</div>
                        <div style="flex:1;"></div>
                        <div style="white-space:nowrap;">NO OF TIMES PRESENT</div>
                        <div style="width:60px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.attendance.timesPresent}</div>
                        <div style="flex:1;"></div>
                        <div style="white-space:nowrap;">NO OF TIMES ABSENT</div>
                        <div style="width:80px;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;">${p.attendance.timesAbsent || 'NIL'}</div>
                    </div>
                </div>

                <!-- OVERALL SUMMARY BLOCKS -->
                <div style="display:flex;justify-content:space-between;align-items:stretch;margin-bottom:8px;font-size:10px;font-weight:700;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>OVERALL TOTAL</span>
                        <div style="border:2px solid #000;width:80px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.grandTotal}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>AVERAGE</span>
                        <div style="border:2px solid #000;width:70px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.average}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>PERCENTAGE</span>
                        <div style="border:2px solid #000;width:70px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.percentage}%</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>POSITION</span>
                        <div style="border:2px solid #000;width:70px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:900;">${p.summary.position}</div>
                    </div>
                </div>

                <!-- ACADEMIC TABLE -->
                <table style="border-collapse:collapse;width:100%;margin-bottom:8px;">
                    <thead>
                        <tr><th colspan="8" style="border:1px solid #000;padding:4px;text-align:center;font-size:9px;font-weight:700;background:#fff;color:#000;text-transform:uppercase;">STUDENT'S ANNUAL ACADEMIC PERFORMANCE</th></tr>
                        <tr>${thCols}</tr>
                    </thead>
                    <tbody>${tbRows}</tbody>
                </table>

                <!-- BOTTOM 3-COLUMN LAYOUT -->
                <div style="display:flex;gap:15px;align-items:flex-start;margin-bottom:8px;">
                    <div style="flex:1;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr>
                                <th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;">DOMAINS</th>
                                <th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;">RATING</th>
                            </tr></thead>
                            <tbody>${domRows}</tbody>
                        </table>
                    </div>

                    <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:900;color:red;text-decoration:underline;">KEYS TO GRADING</th></tr></thead>
                            <tbody>${gradingRows}</tbody>
                        </table>
                        <table style="border-collapse:collapse;width:100%;text-align:center;">
                            <thead><tr><th style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:900;color:red;text-decoration:underline;">KEYS TO RATING</th></tr></thead>
                            <tbody>
                                <tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;">5= Excellent, 4= Very Good</td></tr>
                                <tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;">3= Good, 2= Poor</td></tr>
                                <tr><td style="border:1px solid #000;padding:2px 4px;font-size:8px;">1= Very Poor</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="flex:1;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center;">SCHOOL BILL</th></tr></thead>
                            <tbody>${billRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- FOOTER REMARKS -->
                <div style="margin-top:auto;font-size:9px;font-weight:700;color:#000;">
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;">
                        <span style="white-space:nowrap;text-transform:uppercase;margin-right:8px;">FORM TEACHER'S COMMENTS</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;min-height:14px;">${p.evaluation.teacherRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:8px;">
                        <span style="text-transform:uppercase;">NAME</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;">${p.signatories.teacher.name}</div>
                        <span style="text-transform:uppercase;">SIGNATURE</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;position:relative;min-height:14px;">${teacherSigImg}</div>
                        <span style="text-transform:uppercase;">DATE</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;">${p.dates.closingDate || '___________'}</div>
                    </div>
                    
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;">
                        <span style="white-space:nowrap;text-transform:uppercase;margin-right:8px;">REMARKS BY PRINCIPAL</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:2px;font-weight:600;min-height:14px;">${p.evaluation.principalRemark}</div>
                    </div>
                    <div style="display:flex;align-items:flex-end;gap:8px;">
                        <span style="white-space:nowrap;text-transform:uppercase;">NAME & SIGNATURE, DATE & STAMP</span>
                        <div style="flex:1;border-bottom:2px solid #000;text-align:center;padding-bottom:1px;font-weight:600;position:relative;min-height:14px;display:flex;justify-content:center;align-items:flex-end;">
                            <span style="z-index:2;background:#fff;padding:0 4px;">${p.signatories.principal.name}</span>
                            ${principalSigImg ? `<span style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);z-index:1;">${principalSigImg}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        }
    };

})();
