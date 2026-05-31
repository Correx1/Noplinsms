// ============================================================
// MODERN TEMPLATE — AMB International School Replica
// Fixed Wrapper Overflow, Perfect A4 Scaling, Blank Rows
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

    function getPrintedDate() {
        const d = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        return d.toLocaleDateString('en-US', options);
    }

    window.TEMPLATE_REGISTRY.modern = {
        id: 'modern',
        name: 'Modern Series',
        description: 'AMB International layout featuring zero-whitespace strict A4 fitting without border overflow.',

        capabilities: {
            studentPhoto:       true,
            dateOfBirth:        true,
            attendance:         true,
            closingDate:        true,
            resumptionDate:     true,
            affectiveDomains:   true,
            psychomotorDomains: true,
            schoolBills:        true,
            keysToGrading:      true,
            keysToRating:       true,
            teacherRemark:      true,
            headTeacherRemark:  true,
            principalRemark:    true,
            signatures:         true,
            subjectPosition:    true,
            subjectHighLow:     true
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

            const tc = p.school.themeColor || '#006400'; 
            const borderThin = '1px solid #000';
            const borderThick = '2px solid #000';
            
            // Generate exact headers
            let thCols = `<th style="border:${borderThin};padding:2px 4px;text-align:center;font-size:8px;font-weight:900;">SUBJECT</th>`;
            p.structure.components.forEach(c => {
                let colName = c.name.toUpperCase();
                thCols += `<th style="border:${borderThin};padding:2px;text-align:center;font-size:8px;font-weight:900;">${colName}</th>`;
            });
            thCols += `
                <th style="border:${borderThin};padding:2px;text-align:center;font-size:8px;font-weight:900;">TOTAL</th>
                <th style="border:${borderThin};padding:2px;text-align:center;font-size:8px;font-weight:900;">SUBJECT<br>RANK</th>
                <th style="border:${borderThin};padding:2px;text-align:center;font-size:8px;font-weight:900;">MAX<br>MARKS</th>
                <th style="border:${borderThin};padding:2px;text-align:center;font-size:8px;font-weight:900;">MIN<br>MARKS</th>
                <th style="border:${borderThin};padding:2px;text-align:center;font-size:8px;font-weight:900;">GRADE</th>
                <th style="border:${borderThin};padding:2px 4px;text-align:center;font-size:8px;font-weight:900;">REMARK</th>`;

            let subHeaders = `<td style="border:${borderThin};text-align:center;padding:1px;"></td>`;
            p.structure.components.forEach(c => {
                subHeaders += `<td style="border:${borderThin};text-align:center;font-size:9px;font-weight:800;padding:1px;">${c.weight}</td>`;
            });
            subHeaders += `
                <td style="border:${borderThin};text-align:center;font-size:9px;font-weight:800;padding:1px;">100</td>
                <td style="border:${borderThin};text-align:center;font-size:9px;font-weight:800;padding:1px;"></td>
                <td style="border:${borderThin};text-align:center;font-size:9px;font-weight:800;padding:1px;"></td>
                <td style="border:${borderThin};text-align:center;font-size:9px;font-weight:800;padding:1px;"></td>
                <td style="border:${borderThin};text-align:center;font-size:9px;font-weight:800;padding:1px;"></td>
                <td style="border:${borderThin};text-align:center;font-size:9px;font-weight:800;padding:1px;"></td>
            `;

            let tbRows = `<tr>${subHeaders}</tr>`;
            
            // Print actual subjects
            p.subjects.forEach(sub => {
                let tr = `<td style="border:${borderThin};padding:2px 4px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '0';
                    tr += `<td style="border:${borderThin};padding:1px;text-align:center;font-size:9px;font-weight:600;color:#d32f2f;">${sc}</td>`;
                });
                tr += `<td style="border:${borderThin};padding:1px;text-align:center;font-size:9px;font-weight:800;color:#d32f2f;">${sub.total}</td>`;
                tr += `<td style="border:${borderThin};padding:1px;text-align:center;font-size:9px;font-weight:700;">${sub.position || '1'}</td>`;
                tr += `<td style="border:${borderThin};padding:1px;text-align:center;font-size:9px;font-weight:700;color:#d32f2f;">${sub.highest || '0'}</td>`;
                tr += `<td style="border:${borderThin};padding:1px;text-align:center;font-size:9px;font-weight:700;">${sub.lowest || '0'}</td>`;
                tr += `<td style="border:${borderThin};padding:1px;text-align:center;font-size:9px;font-weight:800;">${sub.grade}</td>`;
                tr += `<td style="border:${borderThin};padding:1px 4px;text-align:left;font-size:8px;font-weight:600;">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });

            // TOTAL ROW
            tbRows += `<tr style="font-weight:900;">
                <td style="border:${borderThin};padding:2px 4px;text-align:center;font-size:9px;text-transform:uppercase;">TOTAL</td>`;
            p.structure.components.forEach(c => {
                tbRows += `<td style="border:${borderThin};padding:2px 1px;text-align:center;font-size:9px;">0</td>`;
            });
            tbRows += `
                <td style="border:${borderThin};padding:2px 1px;text-align:center;font-size:10px;color:#d32f2f;">${p.summary.grandTotal}</td>
                <td colspan="5" style="border:${borderThin};padding:2px 6px;text-align:left;font-size:9px;">
                    &nbsp;&nbsp;&nbsp;TERM AVERAGE MARKS <span style="display:inline-block;float:right;margin-right:20px;">${p.summary.average}</span>
                </td>
            </tr>`;

            // GRADING KEYS
            let gradingLine = 'Academic Perfomance Keys: ';
            p.gradingKeys.forEach(g => {
                gradingLine += `>=${g.min},"${g.grade}", `;
            });
            gradingLine = gradingLine.slice(0, -2);
            if(t.showGradingKey !== false) {
                tbRows += `<tr><td colspan="${p.structure.components.length + 7}" style="border:${borderThin};padding:1px 6px;text-align:center;font-size:7.5px;font-style:italic;font-weight:600;">${gradingLine}</td></tr>`;
            }


            // SAFE DOMAINS LIST
            const safeAffList = (p.domainsList && p.domainsList.length > 0) ? p.domainsList : Object.keys(p.evaluation.affectiveDomains || {});
            const safePsyList = (p.psychomotorList && p.psychomotorList.length > 0) ? p.psychomotorList : ((p.psychomotorsList && p.psychomotorsList.length > 0) ? p.psychomotorsList : Object.keys(p.evaluation.psychomotorDomains || {}));

            const domKeys = Object.keys(p.evaluation.affectiveDomains || {});
            const domList = domKeys.length > 0 ? domKeys : safeAffList.slice(0, 6);
            let affRows = '';
            domList.forEach(d => {
                const val = (p.evaluation.affectiveDomains || {})[d] || '';
                affRows += `<tr>
                    <td style="border:${borderThin};text-align:center;font-size:8px;font-weight:900;padding:1px;width:25%;">${val}</td>
                    <td style="border:${borderThin};padding:1px 4px;text-align:right;font-size:8px;font-weight:600;text-transform:uppercase;width:75%;">${d}</td>
                </tr>`;
            });
            for(let i=0; i<6 - domList.length; i++) {
                 affRows += `<tr><td style="border:${borderThin};padding:1px;height:12px;"></td><td style="border:${borderThin};"></td></tr>`;
            }

            const psyKeys = Object.keys(p.evaluation.psychomotorDomains || {});
            const psyList = psyKeys.length > 0 ? psyKeys : safePsyList.slice(0, 6);
            let psyRows = '';
            psyList.forEach(d => {
                const val = (p.evaluation.psychomotorDomains || {})[d] || '';
                psyRows += `<tr>
                    <td style="border:${borderThin};padding:1px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;width:75%;">${d}</td>
                    <td style="border:${borderThin};text-align:center;font-size:8px;font-weight:900;padding:1px;width:25%;">${val}</td>
                </tr>`;
            });
            for(let i=0; i<6 - psyList.length; i++) {
                 psyRows += `<tr><td style="border:${borderThin};padding:1px;height:12px;"></td><td style="border:${borderThin};"></td></tr>`;
            }

            // DYNAMIC FEES
            let billRows = '';
            let totalBill = 0;
            if(t.showFees !== false && p.dynamicFees && p.dynamicFees.length > 0) {
                p.dynamicFees.forEach(fee => {
                    if (fee.classes && fee.classes.includes(p.student.class)) {
                        let amt = fee.amount;
                        if (fee.overrides && fee.overrides[p.student.class]) amt = fee.overrides[p.student.class];
                        totalBill += Number(amt);
                        billRows += `<tr><td style="border:${borderThin};padding:1px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;">${fee.name}</td><td style="border:${borderThin};padding:1px 4px;text-align:right;font-size:8px;font-weight:800;">₦ ${Number(amt).toLocaleString()}</td></tr>`;
                    }
                });
                const arr = Number(p.bills?.arrears || 0);
                totalBill += arr;
                if(arr > 0) billRows += `<tr><td style="border:${borderThin};padding:1px 4px;text-align:left;font-size:8px;font-weight:600;text-transform:uppercase;">ARREARS</td><td style="border:${borderThin};padding:1px 4px;text-align:right;font-size:8px;font-weight:800;">₦ ${arr.toLocaleString()}</td></tr>`;
                billRows += `<tr><td style="border:${borderThin};padding:1px 4px;text-align:left;font-size:8px;font-weight:900;text-transform:uppercase;">TOTAL DUE</td><td style="border:${borderThin};padding:1px 4px;text-align:right;font-size:9px;font-weight:900;">₦ ${totalBill.toLocaleString()}</td></tr>`;
            } else if (t.showFees !== false) {
                billRows += `<tr><td style="border:${borderThin};padding:1px 4px;text-align:center;font-size:8px;font-weight:600;" colspan="2">NO BILLS RECORDED</td></tr>`;
            }

            const subStr = encodeURIComponent("Stu:"+p.student.roll+"|Avg:"+p.summary.average);
            const qrUrl = p.student.roll ? `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${subStr}&margin=0` : '';
            const qrImg = qrUrl ? `<img src="${qrUrl}" style="width:45px;height:45px;object-fit:contain;">` : `<div style="width:45px;height:45px;background:#eee;border:1px solid #ccc;font-size:6px;display:flex;align-items:center;justify-content:center;">QR CODE</div>`;

            // IMPORTANT: Removed 'height: 100%' from outer div to let the content expand naturally and push the border down securely.
            return `
            <div style="font-family: Arial, Tahoma, sans-serif;width:100%;min-height:280mm;color:#000;background:#fff;padding:6px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-start;border:2px solid #000;">
                
                <div style="text-align:center; font-family:'Arial Black', 'Impact', sans-serif; font-size:24px; font-weight:900; color:${tc}; margin-bottom: 2px; letter-spacing:1px;line-height:1;margin-top:2px;">
                    ${p.school.name.toUpperCase()}
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;border-top:${borderThick};border-bottom:${borderThick};padding:4px 0;margin-bottom:6px;">
                    <div style="width:70px;height:70px;flex-shrink:0;text-align:center;display:flex;align-items:center;justify-content:center;">
                        <img src="${p.school.logo}" style="max-width:100%;max-height:100%;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 10px;">
                        <div style="font-size:14px;font-weight:800;color:#d32f2f;font-style:italic;font-family:Georgia, serif;margin-bottom:4px;">
                            ...${p.school.motto || 'inspiring your child for a greater future'}
                        </div>
                        <div style="font-size:11px;font-weight:900;color:#000;">
                            ${p.school.address}
                        </div>
                        <div style="font-size:9px;font-weight:800;color:#000;margin-top:1px;">
                            Tel: ${p.school.phone}
                        </div>
                        <div style="font-size:9px;font-weight:800;color:#000;margin-top:1px;">
                            Email: ${p.school.email}
                        </div>
                    </div>
                    <div style="width:70px;height:70px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                         ${p.student.photo ? `<img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;">` : `<svg viewBox="0 0 24 24" fill="none" class="w-10 h-10 text-gray-400" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`}
                    </div>
                </div>

                <div style="text-align:center;font-size:14px;font-weight:900;text-transform:uppercase;margin-bottom:6px;font-family:'Times New Roman', serif;letter-spacing:0.5px;">
                     ${p.context.term} PERFORMANCE RESULT SHEET
                </div>

                <!-- PRECISE INFO GRID MATCHING AMB LAYOUT -->
                <table style="width:100%; border-collapse:collapse; font-size:9px; font-weight:700; margin-bottom:6px; border:none;line-height:1.2;">
                    <tr>
                        <td style="padding:1px 2px;width:15%;font-weight:600;">NAME</td>
                        <td style="padding:1px 2px;width:25%;font-weight:900;text-align:center;">${p.student.name}</td>
                        <td style="padding:1px 2px;width:18%;font-weight:600;padding-left:15px;">NO IN CLASS</td>
                        <td style="padding:1px 2px;width:12%;font-weight:900;text-align:center;">${p.context.noInClass}</td>
                        <td style="padding:1px 2px;width:15%;font-weight:600;padding-left:20px;">TERM</td>
                        <td style="padding:1px 2px;width:15%;font-weight:900;text-align:right;">${p.context.term}</td>
                    </tr>
                    <tr>
                        <td style="padding:1px 2px;font-weight:600;">ADMISSION NO</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:center;">${p.student.roll}</td>
                        <td style="padding:1px 2px;font-weight:600;padding-left:15px;">DATE OF BIRTH</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:center;white-space:nowrap;">${p.student.dob || '-'}</td>
                        <td style="padding:1px 2px;font-weight:600;padding-left:20px;">SESSION</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:right;">${p.context.session}</td>
                    </tr>
                    <tr>
                        <td style="padding:1px 2px;font-weight:600;">CLASS</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:center;">${p.student.class}</td>
                        <td style="padding:1px 2px;font-weight:600;padding-left:15px;">AGE</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:center;">-</td>
                        <td style="padding:1px 2px;font-weight:600;padding-left:20px;">DATE</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:right;">${p.dates.closingDate || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding:1px 2px;font-weight:600;">GENDER</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:center;">${p.student.gender}</td>
                        <td style="padding:1px 2px;font-weight:600;padding-left:15px;">NEXT TERM BEGINS</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:center;white-space:nowrap;">${p.dates.resumptionDate || '-'}</td>
                        <td style="padding:1px 2px;font-weight:600;padding-left:20px;">GRADE</td>
                        <td style="padding:1px 2px;font-weight:900;text-align:right;">${p.summary.grade || '#DIV/0!'}</td>
                    </tr>
                </table>

                <table style="width:100%; border-collapse:collapse; border:${borderThick};">
                    <thead><tr>${thCols}</tr></thead>
                    <tbody>${tbRows}</tbody>
                </table>
                <div style="flex:1;"></div>

                <!-- MIDDLE SUMMARY BLOCKS -->
                <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:6px; margin-top:8px;">
                    ${t.showGradeTally !== false ? `
                    <table style="flex:1.2; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800;">
                        <tr><td style="border:${borderThin};padding:2px 4px;">NO OF SUBJECTS ON OFFER</td><td style="border:${borderThin};padding:2px 4px;text-align:center;font-weight:900;font-size:10px;width:30px;">${p.subjects.length}</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;">MARKS OBTAINABLE</td><td style="border:${borderThin};padding:2px 4px;text-align:center;font-weight:900;font-size:10px;">${p.subjects.length * 100}</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;">MARKS OBTAINED</td><td style="border:${borderThin};padding:2px 4px;text-align:center;font-weight:900;font-size:10px;">${p.summary.grandTotal}</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;">NO OF SUBJECTS OFFERED</td><td style="border:${borderThin};padding:2px 4px;text-align:center;font-weight:900;font-size:10px;">${p.subjects.length}</td></tr>
                    </table>
                    ` : ''}

                    <table style="flex:0.8; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800; text-align:center;">
                        <tr><th colspan="2" style="border:${borderThin};padding:2px;">SESSION AVERAGES</th></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;width:50%;">1ST</td><td style="border:${borderThin};padding:2px 4px;font-weight:900;color:#d32f2f;">0.00</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;">2ND</td><td style="border:${borderThin};padding:2px 4px;font-weight:900;color:#d32f2f;">0.00</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;">3RD</td><td style="border:${borderThin};padding:2px 4px;font-weight:900;color:#d32f2f;">0.00</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;">CUM AVERAGE</td><td style="border:${borderThin};padding:2px 4px;font-weight:900;">#DIV/0!</td></tr>
                    </table>

                    <table style="flex:1.2; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800;">
                        <tr><td style="border:${borderThin};padding:2px 4px;text-align:center;width:30%;font-weight:900;font-size:10px;">0</td><td style="border:${borderThin};padding:2px 4px;text-align:center;width:70%;">CLASS HIGHEST MARKS</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;text-align:center;font-weight:900;font-size:10px;">0</td><td style="border:${borderThin};padding:2px 4px;text-align:center;">CLASS LOWEST MARKS</td></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;text-align:center;font-weight:900;font-size:10px;">0</td><td style="border:${borderThin};padding:2px 4px;text-align:center;">CUMULATIVE AVERAGE REMARK</td></tr>
                    </table>
                </div>

                <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:6px;">
                    ${t.showTermStatus !== false ? `
                    <div style="flex:1; display:flex; align-items:center; justify-content:center; border:${borderThick}; font-size:9px; font-weight:900;">
                        ${p.toggles?.isPassedTerm ? 'PASSED' : 'TO REPEAT'}
                    </div>` : ''}
                    
                    <table style="flex:2; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800;">
                        <tr><th colspan="2" style="border:${borderThin};padding:2px;text-align:center;">Test/Examination Summary</th></tr>
                        <tr><td style="border:${borderThin};padding:2px 4px;text-align:center;">Tests/Exams Not Taken/Absent</td><td style="border:${borderThin};padding:2px 4px;text-align:center;font-weight:900;font-size:10px;width:35px;">0</td></tr>
                        <tr><td colspan="2" style="border:${borderThin};padding:2px 4px;text-align:center;">Tests/Exams Taken &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${p.subjects.length}</td></tr>
                    </table>

                    ${t.showAttendance !== false ? `
                    <table style="flex:1.2; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800;">
                        <tr><th colspan="2" style="border:${borderThin};padding:2px;text-align:center;">ATTENDANCE SUMMARY</th></tr>
                        <tr><td style="border:${borderThin};padding:1px 4px;">TIME SCHOOL OPENED</td><td style="border:${borderThin};padding:1px 4px;text-align:center;font-weight:900;font-size:10px;width:30px;">${p.attendance.timesOpened}</td></tr>
                        <tr><td style="border:${borderThin};padding:1px 4px;">NO OF TIMES PRESENT</td><td style="border:${borderThin};padding:1px 4px;text-align:center;font-weight:900;font-size:10px;">${p.attendance.timesPresent}</td></tr>
                        <tr><td style="border:${borderThin};padding:1px 4px;">NO OF TIMES ABSENT</td><td style="border:${borderThin};padding:1px 4px;text-align:center;font-weight:900;font-size:10px;">${p.attendance.timesAbsent}</td></tr>
                    </table>
                    ` : ''}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:stretch; margin-bottom:2px;">
                    ${t.showPsychomotor !== false ? `
                    <table style="flex:1; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800;height:100%;">
                        <tr><th style="border:${borderThin};padding:2px;text-align:center;width:75%;">PSYCHOMOTOR DOMAIN</th><th style="border:${borderThin};padding:2px;text-align:center;width:25%;">RATING</th></tr>
                        ${psyRows}
                    </table>
                    ` : '<div style="flex:1;"></div>'}

                    ${t.showQRCode !== false ? `
                    <div style="width:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 8px;">
                        ${qrImg}
                        <div style="font-size:4.5px;font-weight:900;color:${tc};margin-top:2px;text-align:center;line-height:1.2;">
                            ${p.school.name.toUpperCase()}
                        </div>
                    </div>` : '<div style="width:110px;"></div>'}

                    ${t.showFees !== false ? `
                    <table style="flex:1; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800;height:100%;margin:0 4px;">
                        <tr><th colspan="2" style="border:${borderThin};padding:2px;text-align:center;">SCHOOL BILLS</th></tr>
                        ${billRows}
                    </table>
                    ` : ''}

                    ${t.showAffective !== false ? `
                    <table style="flex:1; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800;height:100%;">
                        <tr><th style="border:${borderThin};padding:2px;text-align:center;width:25%;">RATING</th><th style="border:${borderThin};padding:2px;text-align:center;width:75%;">AFFECTIVE DOMAIN</th></tr>
                        ${affRows}
                    </table>
                    ` : '<div style="flex:1;"></div>'}
                </div>

                <div style="text-align:center;font-size:8px;font-weight:900;margin-bottom:6px;font-variant-numeric: tabular-nums;">
                    Domain Keys: 5 -> "Excellent", 4 -> "Very Good", 3 -> "Good", 2 -> "Fair", 1 -> "Weak"
                </div>

                ${t.showNotice !== false && p.noticeMessage ? `
                <div style="border:1px solid #d32f2f; padding:4px 6px; margin-bottom:4px; text-align:center; font-style:italic; font-size:8.5px; color:#d32f2f; font-weight:700;">
                    <span style="font-weight:900;text-transform:uppercase;">Notice:</span> ${p.noticeMessage}
                </div>` : ''}

                <table style="width:100%; border-collapse:collapse; border:${borderThick}; font-size:9px; font-weight:800; line-height:1.2;">
                    ${t.showTeacherComment !== false ? `
                    <tr>
                        <td style="border:${borderThin};padding:6px 6px;vertical-align:top;width:25%;font-weight:900;">CLASS TEACHER'S REMARK</td>
                        <td style="border:${borderThin};padding:6px 6px;vertical-align:top;font-weight:600;font-style:italic;width:75%;">${p.evaluation.teacherRemark || ''}</td>
                    </tr>` : ''}
                    ${t.showHeadTeacherComment !== false ? `
                    <tr>
                        <td style="border:${borderThin};padding:6px 6px;vertical-align:top;width:25%;font-weight:900;">HEAD TEACHER'S REMARK</td>
                        <td style="border:${borderThin};padding:6px 6px;vertical-align:top;font-weight:600;font-style:italic;width:75%;">${p.evaluation.headTeacherRemark || ''}</td>
                    </tr>` : ''}
                    ${t.showPrincipalComment !== false ? `
                    <tr>
                        <td style="border:${borderThin};padding:6px 6px;vertical-align:top;font-weight:900;">PRINCIPAL'S COMMENT</td>
                        <td style="border:${borderThin};padding:6px 6px;vertical-align:top;position:relative;">
                            <span style="font-weight:600;font-style:italic;">${p.evaluation.principalRemark || ''}</span>
                            ${p.signatories.principal.signature && t.showStamp !== false ? `<img src="${p.signatories.principal.signature}" style="position:absolute;right:20px;bottom:2px;max-height:30px;opacity:0.8;border-radius:50%;">` : ''}
                        </td>
                    </tr>` : ''}
                </table>

                <div style="display:flex;justify-content:space-between;align-items:center;font-size:8px;font-weight:700;font-style:italic;margin-top:4px;color:#000;">
                    <span>Any alteration whatsoever on this document renders it invalid!</span>
                    <span>Printed &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-weight:900;">${getPrintedDate()}</span></span>
                </div>

            </div>`;
        },

        renderSession: function(p) { return this.renderTerm(p); } 
    };

})();
