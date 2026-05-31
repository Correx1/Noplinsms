// ============================================================
// CLASSIC TEMPLATE — Pinnacle of Success Model School Style
// ============================================================
(function() {

    window.TEMPLATE_REGISTRY.classic = {
        id: 'classic',
        name: 'Classic Style',
        description: 'Pinnacle layout featuring colored borders, strict form underlines, and a grid-aligned footer.',

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
            const tc = p.school.themeColor || '#1f4e78';
            const borderLine = `1.5px solid ${tc}`;
            const t = p.toggles || {};
            
            let thCols = `<th style="border:${borderLine};padding:4px 6px;text-align:left;font-size:9px;font-weight:800;color:#000;">SUBJECT</th>`;
            p.structure.components.forEach(c => {
                thCols += `<th style="border:${borderLine};padding:4px 2px;text-align:center;font-size:8px;font-weight:800;color:#000;">${c.name.toUpperCase()}</th>`;
            });
            thCols += `
                <th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">TOTAL</th>
                <th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">GRADE</th>
                <th style="border:${borderLine};padding:4px 6px;text-align:center;font-size:8px;font-weight:800;color:#000;">REMARKS</th>`;
            
            // Optional columns based on master plan
            thCols += `<th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">HIGH</th>`;
            thCols += `<th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">LOW</th>`;
            thCols += `<th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">POS</th>`;

            let tbRows = '';
            let aCount=0, bCount=0, cCount=0, dCount=0, fCount=0;

            p.subjects.forEach(sub => {
                let tr = `<td style="border:${borderLine};padding:4px 6px;text-align:left;font-size:9px;font-weight:800;color:#000;text-transform:uppercase;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '';
                    tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:700;color:#000;">${sc}</td>`;
                });
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:900;color:#000;">${sub.total}</td>`;
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.grade}</td>`;
                tr += `<td style="border:${borderLine};padding:2px 6px;text-align:center;font-size:9px;font-weight:700;color:#000;text-transform:uppercase;">${sub.remark || ''}</td>`;
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.highest || '-'}</td>`;
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.lowest || '-'}</td>`;
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.position || '-'}</td>`;
                
                tbRows += `<tr>${tr}</tr>`;

                if(sub.grade && sub.grade.includes('A')) aCount++;
                if(sub.grade && sub.grade.includes('B')) bCount++;
                if(sub.grade && sub.grade.includes('C')) cCount++;
                if(sub.grade && sub.grade.includes('D')) dCount++;
                if(sub.grade && sub.grade.includes('F')) fCount++;
            });

            // --- Domains (Merged Affective + Psychomotor up to 12 slots) ---
            const affKeys = Object.keys(p.evaluation.affectiveDomains || {});
            const psyKeys = Object.keys(p.evaluation.psychomotorDomains || {});
            const safeAffList = t.showAffective !== false && p.domainsList ? p.domainsList : [];
            const safePsyList = t.showPsychomotor !== false && p.psychomotorList ? p.psychomotorList : [];
            
            const combinedKeys = [...new Set([...affKeys, ...psyKeys, ...safeAffList, ...safePsyList])].slice(0, 12);
            let domRows = '';
            combinedKeys.forEach(d => {
                let val = '';
                if(p.evaluation.affectiveDomains && p.evaluation.affectiveDomains[d]) val = p.evaluation.affectiveDomains[d];
                if(p.evaluation.psychomotorDomains && p.evaluation.psychomotorDomains[d]) val = p.evaluation.psychomotorDomains[d];
                domRows += `<tr><td style="border:${borderLine};padding:2px 4px;text-align:left;font-size:8px;font-weight:800;text-transform:uppercase;color:#000;">${d}</td><td style="border:${borderLine};padding:2px;text-align:center;font-size:9px;font-weight:800;color:#000;">${val}</td></tr>`;
            });
            for(let i=0; i < Math.max(0, 10 - combinedKeys.length); i++) {
                domRows += `<tr><td style="border:${borderLine};padding:2px 4px;height:12px;"></td><td style="border:${borderLine};"></td></tr>`;
            }

            // --- Grading Keys ---
            let gradingRows = '';
            p.gradingKeys.forEach((g, index) => {
                let label = `${g.min}${g.max === 100 ? '& Above' : '-' + g.max}=${g.grade}=${g.remark}`;
                if(index === p.gradingKeys.length - 1) label = `0-${g.max}=${g.grade}=${g.remark}`;
                gradingRows += `<tr><td style="border:none;padding:1px 4px;font-size:9px;font-weight:700;color:#000;text-align:center;">${label}</td></tr>`;
            });

            // --- Dynamic Fees ---
            let billRows = '';
            let totalBill = 0;
            if(p.dynamicFees && p.dynamicFees.length > 0) {
                p.dynamicFees.forEach(fee => {
                    // Only show fees assigned to this student's class
                    if (fee.classes && fee.classes.includes(p.student.class)) {
                        let amt = fee.amount;
                        if (fee.overrides && fee.overrides[p.student.class]) amt = fee.overrides[p.student.class];
                        totalBill += Number(amt);
                        billRows += `<tr><td style="border:${borderLine};padding:2px 4px;font-size:9px;font-weight:700;text-transform:uppercase;color:#000;">${fee.name}</td><td style="border:${borderLine};padding:2px 4px;text-align:center;font-size:9px;font-weight:900;color:#000;width:20px;">₦</td><td style="border:${borderLine};padding:2px 4px;text-align:right;font-size:9px;font-weight:800;color:#000;">${amt.toLocaleString()}</td></tr>`;
                    }
                });
                const arr = Number(p.bills?.arrears || 0);
                totalBill += arr;
                if(arr > 0) billRows += `<tr><td style="border:${borderLine};padding:2px 4px;font-size:9px;font-weight:700;text-transform:uppercase;color:#000;">ARREARS</td><td style="border:${borderLine};padding:2px 4px;text-align:center;font-size:9px;font-weight:900;color:#000;">₦</td><td style="border:${borderLine};padding:2px 4px;text-align:right;font-size:9px;font-weight:800;color:#000;">${arr.toLocaleString()}</td></tr>`;
                
                billRows += `<tr><td colspan="3" style="border:none;height:6px;"></td></tr>`;
                billRows += `<tr><td style="border:${borderLine};padding:2px 4px;font-size:9px;font-weight:800;text-transform:uppercase;color:#000;">TOTAL DUE</td><td style="border:${borderLine};padding:2px 4px;text-align:center;font-size:10px;font-weight:900;color:#000;">₦</td><td style="border:${borderLine};padding:2px 4px;text-align:right;font-size:10px;font-weight:900;color:#000;">${totalBill.toLocaleString()}</td></tr>`;
            } else {
                billRows += `<tr><td style="border:${borderLine};padding:2px 4px;font-size:9px;font-weight:700;text-transform:uppercase;color:#000;text-align:center;" colspan="3">NO BILLS RECORDED</td></tr>`;
            }

            const ulStyle = `border-bottom: 1.5px solid #000; display: inline-block; min-width: 50px; text-align: center; font-weight: 800; font-size: 11px; padding: 0 10px; color:#000;`;
            const labelStyle = `font-weight: 800; font-size: 10px; color: ${tc};`;

            return `
            <div style="font-family:'Trebuchet MS', Arial, sans-serif;width:100%;min-height:280mm;color:#000;background:#fff;display:flex;flex-direction:column;padding:8px 12px;box-sizing:border-box;">

                <!-- TOP HEADER -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <div style="width:100px;height:100px;flex-shrink:0;">
                        <img src="${p.school.logo}" style="width:100%;height:100%;object-fit:contain;">
                    </div>
                    <div style="flex:1;text-align:center;padding:0 10px;position:relative;">
                        ${t.showQRCode !== false ? `
                        <div style="position:absolute;top:0;right:0;width:50px;height:50px;opacity:0.7;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('VERIFIED: '+p.student.name+' '+p.student.class)}" style="width:100%;height:100%;">
                        </div>` : ''}
                        <div style="font-size:24px;font-weight:900;text-transform:uppercase;color:${tc};font-family:'Arial Black', Impact, sans-serif;letter-spacing:0.5px;line-height:1.1;">
                            ${p.school.name}
                        </div>
                        <div style="font-size:11px;font-weight:800;color:#000;margin-top:4px;text-transform:uppercase;">
                            ${p.school.address}
                        </div>
                        <div style="font-size:10px;font-weight:800;color:#000;margin-top:2px;">
                            ${p.school.email ? p.school.email + ', ' : ''}${p.school.phone}
                        </div>
                        <div style="font-size:13px;font-weight:900;color:${tc};text-transform:uppercase;margin-top:4px;letter-spacing:0.5px;">
                            MOTTO: ${p.school.motto || 'KNOWLEDGE IS LIGHT'}
                        </div>
                    </div>
                    <div style="width:80px;height:100px;flex-shrink:0;">
                        ${p.student.photo ? `<img src="${p.student.photo}" style="width:100%;height:100%;object-fit:cover;border:2px solid #000;border-radius:4px;">` : `<svg viewBox="0 0 24 24" fill="#000" style="width:100%;height:100%;border:2px solid #000;border-radius:4px;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`}
                    </div>
                </div>

                <!-- MAIN TITLE -->
                <div style="border:2.5px solid ${tc};text-align:center;padding:6px 0;font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;color:${tc};">
                    ${p.context.term} REPORT SHEET
                </div>

                <!-- INFO GRID -->
                <div style="border:2px solid ${tc}; padding:10px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1.5; display:flex; align-items:flex-end;"><span style="${labelStyle}">NAME</span><div style="${ulStyle}; flex:1; margin-left:8px; text-transform:uppercase;">${p.student.name}</div></div>
                        <div style="flex:0.8; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">CLASS</span><div style="${ulStyle}; flex:1; margin-left:8px; text-transform:uppercase;">${p.student.class}</div></div>
                        <div style="flex:0.8; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">ADM NO</span><div style="${ulStyle}; flex:1; margin-left:8px; text-transform:uppercase;">${p.student.roll}</div></div>
                        <div style="flex:0.6; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">TERM</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.context.term}</div></div>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">SESSION</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.context.session}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:20px;"><span style="${labelStyle}">NO IN CLASS</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.context.noInClass}</div></div>
                        <div style="flex:1.2; display:flex; align-items:flex-end; margin-left:20px;"><span style="${labelStyle}">DATE OF BIRTH</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.student.dob || '-'}</div></div>
                    </div>

                    ${t.showAttendance !== false ? `
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">NO OF TIMES SCHOOL OPENED</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.attendance.timesOpened || '0'}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">NO OF TIMES PRESENT</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.attendance.timesPresent || '0'}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">NO OF TIMES ABSENT</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.attendance.timesAbsent || '0'}</div></div>
                    </div>` : ''}

                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">CLOSING DATE</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.dates.closingDate || '-'}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:40px;"><span style="${labelStyle}">RESUMPTION DATE</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.dates.resumptionDate || '-'}</div></div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">OVERALL TOTAL</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.grandTotal}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">AVERAGE</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.average}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">POSITION</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.position || '-'}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">CLASS POS</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.sectionPosition || '-'}</div></div>
                    </div>
                </div>

                <!-- STATUS ROW -->
                ${(t.showTermStatus !== false || t.showGradeTally !== false || t.showSubjectsOffered !== false) ? `
                <div style="border:2px solid ${tc}; padding:6px 10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                    ${t.showSubjectsOffered !== false ? `<div style="font-size:10px; font-weight:800; color:#000;">SUBJECTS OFFERED: <span style="font-size:12px;">${p.subjects.length}</span></div>` : '<div></div>'}
                    ${t.showGradeTally !== false ? `<div style="font-size:10px; font-weight:800; color:#000;">GRADE TALLY: <span style="font-size:11px;">${aCount}As, ${bCount}Bs, ${cCount}Cs, ${dCount}Ds, ${fCount}Fs</span></div>` : '<div></div>'}
                    ${t.showTermStatus !== false ? `<div style="font-size:10px; font-weight:800; color:#000;">STATUS: <span style="font-size:12px; color:${p.summary.termStatus==='PASS'?'#16a34a':'#dc2626'};">${p.summary.termStatus}</span></div>` : '<div></div>'}
                    ${p.context.mode === 'session' && t.showPromotionStatus !== false ? `<div style="font-size:10px; font-weight:800; color:#000;">PROMOTION: <span style="font-size:12px; color:${p.summary.promotionStatus==='PROMOTED'?'#16a34a':'#dc2626'};">${p.summary.promotionStatus}</span></div>` : ''}
                </div>` : ''}

                <!-- ACADEMIC PERFORMANCE -->
                <table style="border-collapse:collapse;width:100%;">
                    <thead>
                        <tr><th colspan="100" style="border:${borderLine};padding:4px;text-align:center;font-size:11px;font-weight:900;text-transform:uppercase;color:#000;">PUPIL'S ACADEMIC PERFORMANCE ( ${p.student.class.toUpperCase()} CATEGORY )</th></tr>
                        <tr>${thCols}</tr>
                    </thead>
                    <tbody>${tbRows}</tbody>
                </table>
                <div style="flex:1;"></div>

                <!-- NOTICE BLOCK -->
                ${t.showNotice !== false && p.noticeMessage ? `
                <div style="border:2px dashed ${tc}; padding:6px 10px; margin-top:10px; margin-bottom:10px; background:#fdfbe8;">
                    <div style="font-size:10px; font-weight:900; color:${tc}; text-transform:uppercase; margin-bottom:2px;">Important Notice</div>
                    <div style="font-size:11px; font-weight:700; color:#000; font-style:italic;">${p.noticeMessage}</div>
                </div>` : ''}

                <!-- FOOTER 3 COLUMNS -->
                <div style="display:flex;gap:15px;align-items:flex-start;margin-top:4px;">
                    
                    <!-- DOMAINS -->
                    <div style="flex:1.2;">
                        ${(t.showAffective !== false || t.showPsychomotor !== false) ? `
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th style="border:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;">DOMAINS</th><th style="border:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;width:50px;">RATING</th></tr></thead>
                            <tbody>${domRows}</tbody>
                        </table>` : ''}
                    </div>

                    <!-- KEYS -->
                    <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
                        ${t.showGradingKey !== false ? `
                        <table style="border-collapse:collapse;width:100%;text-align:center;border:${borderLine};">
                            <thead><tr><th style="border-bottom:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;">KEYS TO GRADING</th></tr></thead>
                            <tbody>${gradingRows}</tbody>
                        </table>
                        <table style="border-collapse:collapse;width:100%;text-align:center;border:${borderLine};">
                            <thead><tr><th style="border-bottom:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;">KEYS TO RATING</th></tr></thead>
                            <tbody>
                                <tr><td style="border:none;padding:2px 4px;font-size:8px;font-weight:700;color:#000;">5= EXCELLENT, 4= VERY GOOD</td></tr>
                                <tr><td style="border:none;padding:2px 4px;font-size:8px;font-weight:700;color:#000;">3= GOOD, 2= POOR</td></tr>
                                <tr><td style="border:none;padding:2px 4px;font-size:8px;font-weight:700;color:#000;">1= VERY POOR</td></tr>
                            </tbody>
                        </table>` : ''}
                    </div>

                    <!-- SCHOOL BILL -->
                    <div style="flex:1.2;">
                        ${t.showFees !== false ? `
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="3" style="border:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;">NEXT TERM SCHOOL BILL</th></tr></thead>
                            <tbody>${billRows}</tbody>
                        </table>` : ''}
                        
                        ${t.showStamp !== false ? `
                        <div style="margin-top:15px;text-align:center;">
                            <div style="width:70px;height:70px;border:2px dashed #000;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;color:#000;font-size:9px;font-weight:800;opacity:0.3;text-transform:uppercase;">STAMP</div>
                        </div>` : ''}
                    </div>
                </div>

                <!-- SIGNATURES -->
                <div style="margin-top:auto;padding-top:15px;display:flex;flex-direction:column;gap:12px;">
                    ${t.showTeacherComment !== false ? `
                    <div style="display:flex; align-items:flex-end;">
                        <span style="${labelStyle};font-size:11px;">CLASS TEACHER'S REMARK</span>
                        <div style="${ulStyle}; flex:1; margin-left:15px; text-transform:uppercase; font-size:12px;">${p.evaluation.teacherRemark || ' '}</div>
                    </div>` : ''}
                    
                    ${t.showHeadTeacherComment !== false ? `
                    <div style="display:flex; align-items:flex-end;">
                        <span style="${labelStyle};font-size:11px;">HEAD TEACHER'S REMARK</span>
                        <div style="${ulStyle}; flex:1; margin-left:15px; text-transform:uppercase; font-size:12px;">${p.evaluation.headTeacherRemark || ' '}</div>
                    </div>` : ''}
                    
                    ${t.showPrincipalComment !== false ? `
                    <div style="display:flex; align-items:flex-end;">
                        <span style="${labelStyle};font-size:11px;">PRINCIPAL'S REMARK</span>
                        <div style="${ulStyle}; flex:1; margin-left:15px; text-transform:uppercase; font-size:12px;">${p.evaluation.principalRemark || ' '}</div>
                    </div>` : ''}

                    <div style="display:flex; align-items:flex-end; margin-top:10px;">
                        <div style="flex:1; display:flex; align-items:flex-end;">
                            <span style="${labelStyle};font-size:11px;">DATE</span>
                            <div style="${ulStyle}; flex:1; margin-left:15px; font-size:12px;">${p.dates.closingDate || ' '}</div>
                        </div>
                        <div style="flex:1.5; display:flex; align-items:flex-end; margin-left:20px; position:relative;">
                            <span style="${labelStyle};font-size:11px; margin-left:auto;">SIGNATURE</span>
                            <div style="${ulStyle}; width:200px; margin-left:15px; border-bottom:1.5px solid #000; height:15px;"></div>
                            ${p.signatories.teacher.signature ? `<img src="${p.signatories.teacher.signature}" style="position:absolute; right:30px; bottom:2px; max-height:35px; opacity:0.8;">` : ''}
                        </div>
                    </div>
                </div>
                
            </div>`;
        },

        renderSession: function(p) { return this.renderTerm(p); } 
    };

})();
