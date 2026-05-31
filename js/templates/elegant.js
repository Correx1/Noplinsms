// ============================================================
// ELEGANT TEMPLATE — Austica Memorial College Replica
// Perfect tracking, darker borders, dynamic subject rows
// Bugfixes: Removed duplicate EXAM, robust domain fallbacks
// ============================================================
(function() {

    function hexToRgbA(hex, alpha) {
        let h = hex.replace('#', '');
        if(h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
        let r = parseInt(h.substring(0,2), 16);
        let g = parseInt(h.substring(2,4), 16);
        let b = parseInt(h.substring(4,6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    window.TEMPLATE_REGISTRY.elegant = {
        id: 'elegant',
        name: 'Elegant Series',
        description: 'Austica-style double-border report with sharp dark borders and exact font layout.',

        capabilities: {
            studentPhoto:       true,
            dateOfBirth:        false,
            attendance:         false,
            closingDate:        true,
            resumptionDate:     true,
            affectiveDomains:   true,
            psychomotorDomains: true,
            schoolBills:        true,
            keysToGrading:      true,
            keysToRating:       false,
            teacherRemark:      true,
            headTeacherRemark:  true,
            principalRemark:    true,
            signatures:         false,
            subjectPosition:    true,
            subjectHighLow:     false
        },

        renderTerm: function(p) {
            const t = Object.assign({
                showSubjectsOffered: true,
                showGradeTally: true,
                showTermStatus: true,
                showPromotionStatus: true,
                showAttendance: true,
                showFees: true,
                showQRCode: true,
                showGradingKey: true,
                showAffective: true,
                showPsychomotor: true,
                showTeacherComment: true,
                showHeadTeacherComment: true,
                showPrincipalComment: true,
                showNotice: true,
                showStamp: true
            }, p.toggles || {});

            const tc = p.school.themeColor || '#0a195c';
            const lightTc = tc !== '#000000' ? hexToRgbA(tc, 0.1) : '#f0f0f0';
            const tableBorder = '1px solid #000'; 

            // Header mapping for Academic Table
            let thColsTop = `<th rowspan="2" style="border:${tableBorder};padding:5px 4px;text-align:left;font-size:10px;font-weight:900;">Subjects</th>`;
            let thColsBottom = `<td style="border:${tableBorder};padding:4px;text-align:right;font-size:9px;color:#555;">Marks Obtainable</td>`;
            
            p.structure.components.forEach((c) => {
                let colName = c.name;
                if(colName.length > 5 && colName.toLowerCase() !== 'exam') colName = colName.split(' ').map(w=>w[0]).join(''); 
                thColsTop += `<th style="border:${tableBorder};padding:5px 2px;text-align:center;font-size:9px;font-weight:800;color:#333;">${c.name}</th>`;
                thColsBottom += `<td style="border:${tableBorder};padding:4px 2px;text-align:center;font-size:9px;font-weight:700;color:#333;">${c.weight}</td>`;
            });

            thColsTop += `
                <th style="border:${tableBorder};padding:5px 2px;text-align:center;font-size:9px;font-weight:800;color:#333;">Total</th>
                <th style="border:${tableBorder};padding:5px 2px;text-align:center;font-size:9px;font-weight:800;color:#333;">Grade</th>
                <th rowspan="2" style="border:${tableBorder};padding:5px 2px;text-align:center;font-size:9px;font-weight:800;color:#333;">Subject<br>Position</th>
                <th rowspan="2" style="border:${tableBorder};padding:5px 4px;text-align:center;font-size:9px;font-weight:800;color:#333;">Teacher's<br>Remarks</th>`;
            thColsBottom += `
                             <td style="border:${tableBorder};padding:4px 2px;text-align:center;font-size:9px;font-weight:700;color:#333;">100</td>
                             <td style="border:${tableBorder};padding:4px 2px;text-align:center;font-size:9px;font-weight:700;color:#333;"></td>`;

            let tbRows = `<tr>${thColsBottom}</tr>`;
            p.subjects.forEach(sub => {
                let tr = `<td style="border:${tableBorder};padding:6px 4px;text-align:left;font-size:10px;font-weight:900;color:${tc};text-transform:uppercase;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '-';
                    tr += `<td style="border:${tableBorder};padding:6px 2px;text-align:center;font-size:10px;font-weight:600;color:#000;">${sc}</td>`;
                });
                tr += `<td style="border:${tableBorder};padding:6px 2px;text-align:center;font-size:10px;font-weight:900;color:#000;">${sub.total}</td>`;
                tr += `<td style="border:${tableBorder};padding:6px 2px;text-align:center;font-size:10px;font-weight:800;color:#444;">${sub.grade}</td>`;
                tr += `<td style="border:${tableBorder};padding:6px 2px;text-align:center;font-size:10px;font-weight:600;color:#000;">${sub.position || '-'}</td>`;
                
                let rmColor = '#4caf50'; 
                if(sub.remark && (sub.remark.toLowerCase().includes('fail') || sub.remark.toLowerCase().includes('poor'))) rmColor = '#d32f2f';
                
                tr += `<td style="border:${tableBorder};padding:6px 4px;text-align:center;font-size:10px;font-weight:700;color:${rmColor};">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });

            const getCheck = (val, target) => {
                const v = parseInt(val) || 0;
                return (v === target) ? '&#10003;' : '-';
            };

            // SAFE DOMAINS LIST RETRIEVAL
            const defAff = ['Neatness', 'Honesty', 'Punctuality', 'Attentiveness', 'Politeness'];
            const safeAffList = (p.domainsList && p.domainsList.length > 0) ? p.domainsList : defAff;
            
            const defPsy = ['Sports', 'Handwriting', 'Musical Skills', 'Fluency', 'Artworks'];
            const safePsyList = (p.psychomotorList && p.psychomotorList.length > 0) ? p.psychomotorList : ((p.psychomotorsList && p.psychomotorsList.length > 0) ? p.psychomotorsList : defPsy);

            const domKeys = Object.keys(p.evaluation.affectiveDomains || {});
            const domList = domKeys.length > 0 ? domKeys : safeAffList.slice(0, 5);
            let affRows = '';
            domList.forEach(d => {
                const val = (p.evaluation.affectiveDomains || {})[d] || '';
                affRows += `<tr>
                    <td style="border:${tableBorder};padding:4px 6px;text-align:left;font-size:10px;font-weight:700;color:#4caf50;">${d}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 5)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 4)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 3)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 2)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 1)}</td>
                </tr>`;
            });

            const psyKeys = Object.keys(p.evaluation.psychomotorDomains || {});
            const psyList = psyKeys.length > 0 ? psyKeys : safePsyList.slice(0, 5);
            let psyRows = '';
            psyList.forEach(d => {
                const val = (p.evaluation.psychomotorDomains || {})[d] || '';
                psyRows += `<tr>
                    <td style="border:${tableBorder};padding:4px 6px;text-align:left;font-size:10px;font-weight:700;color:#4caf50;">${d}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 5)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 4)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 3)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 2)}</td>
                    <td style="border:${tableBorder};text-align:center;font-size:10px;font-weight:900;color:#000;">${getCheck(val, 1)}</td>
                </tr>`;
            });

            let gradingLine = '';
            p.gradingKeys.forEach(g => {
                gradingLine += `${g.min} - ${g.max} : ${g.grade} (${g.remark.toUpperCase()}) | `;
            });
            gradingLine = gradingLine.replace(/ \| $/, ''); 

            // --- Bills ---
            let billHtml = '';
            if (t.showFees !== false) {
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
                    billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:600;text-transform:uppercase;color:#000;">${bf.label}</td><td style="border:1px solid #000;padding:3px 4px;text-align:right;font-size:9px;color:#000;">${p.bills[bf.key] || ''}</td></tr>`;
                });
                billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:600;color:#000;text-transform:uppercase;">OUTSTANDING BILL</td><td style="border:1px solid #000;padding:3px 4px;text-align:right;font-size:9px;font-weight:700;color:#000;">${p.bills.outstanding || ''}</td></tr>`;
                billRows += `<tr><td style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:800;color:#000;text-transform:uppercase;">TOTAL</td><td style="border:1px solid #000;padding:3px 4px;text-align:right;font-size:10px;font-weight:800;color:#000;">₦ ${p.bills.total || '-'}</td></tr>`;
                
                billHtml = `
                <table style="width:100%; border-collapse:collapse; margin-bottom:8px; border:${tableBorder};">
                    <thead><tr><th colspan="2" style="border:1px solid #000;padding:4px;font-size:10px;font-weight:800;text-align:center;background:#f0f0f0;">SCHOOL BILLS</th></tr></thead>
                    <tbody>${billRows}</tbody>
                </table>`;
            }

            const principalSigImg = p.signatories.principal.signature ? `<img src="${p.signatories.principal.signature}" style="max-height:25px;object-fit:contain;">` : '';

            return `
            <div style="font-family: Arial, Tahoma, sans-serif;width:100%;height:100%;color:#000;background:#fff;padding:10px;box-sizing:border-box;">
                
                <div style="border:1px solid ${tc}; padding:2px; box-sizing:border-box; height:100%; display:flex; flex-direction:column;">
                    <div style="border:3px solid ${tc}; padding:4px; display:flex; flex-direction:column; box-sizing:border-box; flex-grow:1;">
                    
                    <div style="display:flex;justify-content:space-between;align-items:stretch;margin-bottom:4px;">
                        <div style="width:85px;height:90px;border:1px solid ${tc};padding:2px;flex-shrink:0;">
                            <img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;">
                        </div>
                        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;background:-webkit-linear-gradient(top, ${lightTc}, #fff);padding:6px 15px;margin:0 8px;border-bottom:2px solid #333;">
                            <div style="font-size:26px;font-weight:900;text-transform:uppercase;color:${tc};font-family:'Times New Roman', Georgia, serif;line-height:1.1;letter-spacing:1px;text-align:center;text-shadow:1px 1px 0px rgba(255,255,255,0.8);">${p.school.name}</div>
                            <div style="font-size:13px;font-weight:600;color:#222;font-style:italic;margin-top:4px;">${p.school.motto}</div>
                        </div>
                        ${t.showQRCode !== false ? `
                        <div style="width:70px;height:70px;border:1px solid #ccc;padding:2px;flex-shrink:0;margin-right:8px;align-self:center;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('VERIFIED: '+p.student.name)}" style="width:100%;height:100%;">
                        </div>` : ''}
                        <div style="width:80px;height:90px;border:1px solid #ccc;padding:2px;flex-shrink:0;">
                            ${p.student.photo ? `<img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;background:#eee;display:flex;align-items:center;justify-content:center;color:#999;font-size:8px;">PHOTO</div>'}
                        </div>
                    </div>

                    <div style="text-align:center;color:#d32f2f;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;margin-top:2px;">
                        ${p.context.term} REPORT
                    </div>

                    <table style="width:100%; border-collapse:collapse; font-size:10px; color:#000; margin-bottom:0; border:${tableBorder};border-bottom:none;">
                        <tr>
                            <td style="border-right:${tableBorder};padding:5px 6px;width:55%;font-weight:800;color:${tc};line-height:1.3;">NAME OF STUDENT: &nbsp;&nbsp;<span style="font-weight:900;color:#000;text-transform:uppercase;">${p.student.name}</span></td>
                            <td style="border-right:${tableBorder};padding:5px 6px;width:30%;font-weight:800;color:${tc};">ADMISSION NO.: &nbsp;&nbsp;<span style="font-weight:900;color:#000;">${p.student.roll}</span></td>
                            <td style="padding:5px 6px;width:15%;font-weight:800;color:${tc};">CLASS: &nbsp;&nbsp;<span style="font-weight:900;color:#000;">${p.student.class}</span></td>
                        </tr>
                    </table>
                    <table style="width:100%; border-collapse:collapse; font-size:10px; color:#000; margin-bottom:0; border:${tableBorder}; border-bottom:none;">
                        <tr>
                            <td style="border-right:${tableBorder};padding:5px 6px;width:25%;font-weight:800;color:${tc};">NUMBER IN CLASS:&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#000;">${p.context.noInClass}</span></td>
                            <td style="border-right:${tableBorder};padding:5px 6px;width:25%;font-weight:800;color:${tc};">TERM :&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#000;">${p.context.term}</span></td>
                            <td style="border-right:${tableBorder};padding:5px 6px;width:25%;font-weight:800;color:${tc};">SESSION :&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#000;">${p.context.session}</span></td>
                            <td style="padding:5px 6px;width:25%;font-weight:800;color:${tc};">${t.showTermStatus !== false ? `STATUS :&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#2e7d32;">${p.summary.isPromoted ? 'Passed' : 'Failed'}</span>` : ''}</td>
                        </tr>
                    </table>
                    <table style="width:100%; border-collapse:collapse; font-size:10px; color:#000; margin-bottom:6px; border:${tableBorder};">
                        <tr>
                            ${t.showGradeTally !== false ? `
                            <td style="border-right:${tableBorder};padding:5px 6px;width:30%;font-weight:800;color:${tc};">TOTAL MARKS OBTAINABLE:&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#000;">${p.subjects.length * 100}</span></td>
                            <td style="border-right:${tableBorder};padding:5px 6px;width:30%;font-weight:800;color:${tc};">TOTAL MARKS OBTAINED:&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#000;">${p.summary.grandTotal}</span></td>
                            ` : `<td style="border-right:${tableBorder};padding:5px 6px;width:60%;" colspan="2"></td>`}
                            <td style="border-right:${tableBorder};padding:5px 6px;width:20%;font-weight:800;color:${tc};">AVERAGE :&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#000;">${p.summary.average}</span></td>
                            <td style="padding:5px 6px;width:20%;font-weight:800;color:${tc};">POSITION :&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;color:#000;">${p.summary.position}</span></td>
                        </tr>
                    </table>

                    <div style="background:#4caf50;color:#fff;text-align:center;padding:4px 0;font-size:11px;font-weight:800;letter-spacing:1px;margin-bottom:0;">
                        COGNITIVE DOMAIN
                    </div>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:6px; border:${tableBorder};">
                        <thead>
                            <tr>${thColsTop}</tr>
                        </thead>
                        <tbody>
                            ${tbRows}
                        </tbody>
                    </table>

                    ${billHtml}

                    <div style="background:#4caf50;color:#fff;text-align:center;padding:4px 0;font-size:11px;font-weight:800;letter-spacing:1px;margin-bottom:0;">
                        REMARKS, AFFECTIVE AND PSYCHOMOTOR DOMAINS
                    </div>

                    <table style="width:100%; border-collapse:collapse; margin-bottom:8px; border:${tableBorder};">
                        <tr>
                            <!-- LEFT PANEL (Remarks & Analysis) -->
                            <td style="border:${tableBorder};vertical-align:top;padding:0;width:50%;">
                                <table style="width:100%; border-collapse:collapse; font-size:10px;">
                                    ${t.showTeacherComment !== false ? `
                                    <tr>
                                        <td style="border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;width:35%;color:#444;">Class Teacher Remarks:</td>
                                        <td style="border-bottom:${tableBorder};padding:5px 6px;font-weight:700;color:#111;">${p.evaluation.teacherRemark}</td>
                                    </tr>` : ''}
                                    ${t.showHeadTeacherComment !== false ? `
                                    <tr>
                                        <td style="border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;width:35%;color:#444;">Head Teacher Remarks:</td>
                                        <td style="border-bottom:${tableBorder};padding:5px 6px;font-weight:700;color:#111;">${p.evaluation.headTeacherRemark || ''}</td>
                                    </tr>` : ''}
                                    ${t.showAttendance !== false ? `
                                    <tr>
                                        <td style="border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;color:#444;">Attendance:</td>
                                        <td style="border-bottom:${tableBorder};padding:5px 6px;font-weight:700;color:#111;">Times Opened: ${p.attendance.timesOpened} | Present: ${p.attendance.timesPresent} | Absent: ${p.attendance.timesAbsent || '0'}</td>
                                    </tr>` : ''}
                                    <tr>
                                        <td style="border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;color:#444;">Vacation Date:</td>
                                        <td style="border-bottom:${tableBorder};padding:5px 6px;font-weight:700;color:#111;">${p.dates.closingDate || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;color:#444;">Resumption Date:</td>
                                        <td style="border-bottom:${tableBorder};padding:5px 6px;font-weight:700;color:#111;">${p.dates.resumptionDate || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;color:#444;vertical-align:top;">
                                            Result<br>Analysis:<br>(Criteria<br>for<br>passing)
                                        </td>
                                        <td style="border-bottom:${tableBorder};padding:5px 6px;color:#4caf50;font-weight:600;line-height:1.5;vertical-align:top;position:relative;">
                                            • Promotion score is ${parseInt(localStorage.getItem('sms_promotion_rule') || 50)}, you scored ${p.summary.average}.<br>
                                            ${t.showPromotionStatus !== false ? `• You ${p.summary.isPromoted ? 'passed' : 'failed'} the promotion criteria.<br>` : ''}
                                            ${t.showSubjectsOffered !== false ? `• Minimum subject to offer is ${p.subjects.length}.<br>` : ''}
                                            ${t.showPrincipalComment !== false ? `• ${p.evaluation.principalRemark}` : ''}
                                            ${principalSigImg && t.showStamp !== false ? `<div style="position:absolute;bottom:2px;right:2px;opacity:0.8;">${principalSigImg}</div>` : ''}
                                        </td>
                                    </tr>
                                    ${t.showGradingKey !== false ? `
                                    <tr>
                                        <td style="border-right:${tableBorder};padding:5px 6px;color:#444;">GRADING:</td>
                                        <td style="padding:5px 6px;color:#333;font-weight:700;line-height:1.4;">
                                            • ${gradingLine}
                                        </td>
                                    </tr>` : ''}
                                </table>
                            </td>

                            <!-- RIGHT PANEL (Checkmark Domains) -->
                            <td style="border:${tableBorder};vertical-align:top;padding:0;width:50%;">
                                <table style="width:100%; border-collapse:collapse; font-size:10px;">
                                    ${t.showAffective !== false ? `
                                    <tr>
                                        <th style="border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;text-align:left;color:#d32f2f;font-weight:900;width:40%;">AFFECTIVE DOMAIN</th>
                                        <th style="border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;width:12%;text-align:center;">Excel.</th>
                                        <th style="border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;width:12%;text-align:center;">V.Good</th>
                                        <th style="border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;width:12%;text-align:center;">Good</th>
                                        <th style="border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;width:12%;text-align:center;">Poor</th>
                                        <th style="border-bottom:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;width:12%;text-align:center;">V.Poor</th>
                                    </tr>
                                    ${affRows}` : ''}
                                    ${t.showPsychomotor !== false ? `
                                    <tr>
                                        <th style="border-top:${tableBorder};border-bottom:${tableBorder};border-right:${tableBorder};padding:5px 6px;text-align:left;color:#d32f2f;font-weight:900;">PSYCHOMOTOR<br>DOMAIN</th>
                                        <th style="border-top:${tableBorder};border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;text-align:center;vertical-align:bottom;">Excel.</th>
                                        <th style="border-top:${tableBorder};border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;text-align:center;vertical-align:bottom;">V.Good</th>
                                        <th style="border-top:${tableBorder};border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;text-align:center;vertical-align:bottom;">Good</th>
                                        <th style="border-top:${tableBorder};border-bottom:${tableBorder};border-right:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;text-align:center;vertical-align:bottom;">Poor</th>
                                        <th style="border-top:${tableBorder};border-bottom:${tableBorder};padding:3px;color:#d32f2f;font-weight:800;font-size:9px;text-align:center;vertical-align:bottom;">V.Poor</th>
                                    </tr>
                                    ${psyRows}` : ''}
                                </table>
                            </td>
                        </tr>
                    </table>

                    ${t.showNotice !== false && p.noticeMessage ? `
                    <div style="border:1px solid #d32f2f; padding:6px; margin-bottom:8px; background:#fff5f5; text-align:center; font-style:italic; font-size:10px; color:#d32f2f; font-weight:600;">
                        <span style="font-weight:900;text-transform:uppercase;margin-right:6px;">Notice:</span> ${p.noticeMessage}
                    </div>` : ''}

                    <div style="text-align:center;font-size:10px;font-weight:800;color:#555;font-style:italic;margin-top:auto;padding-bottom:2px;padding-top:4px;">
                        © ${p.school.name} (${p.school.website || p.school.email || ''}) - powered by Noplin SMS.
                    </div>
                    </div>
                </div>
            </div>`;
        },

        renderSession: function(p) { return this.renderTerm(p); } 
    };

})();
