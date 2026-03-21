// ============================================================
// CLASSIC TEMPLATE — Pinnacle of Success Model School Style
// Exact Replica: Border-bottom form lines, colored borders, 3-col footer
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
            principalRemark:    false,
            signatures:         true,
            subjectPosition:    true,
            subjectHighLow:     false
        },

        renderTerm: function(p) {
            const tc = p.school.themeColor || '#1f4e78';
            const borderLine = `1.5px solid ${tc}`;
            
            let thCols = `<th style="border:${borderLine};padding:4px 6px;text-align:left;font-size:9px;font-weight:800;color:#000;">SUBJECT</th>`;
            p.structure.components.forEach(c => {
                thCols += `<th style="border:${borderLine};padding:4px 2px;text-align:center;font-size:8px;font-weight:800;color:#000;">${c.name.toUpperCase()} %</th>`;
            });
            thCols += `
                <th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">TOTAL<br>100%</th>
                <th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">GRADE</th>
                <th style="border:${borderLine};padding:4px 4px;text-align:center;font-size:8px;font-weight:800;color:#000;">SUBJECT<br>POSITION</th>
                <th style="border:${borderLine};padding:4px 6px;text-align:center;font-size:8px;font-weight:800;color:#000;">REMARKS</th>`;

            let tbRows = '';
            p.subjects.forEach(sub => {
                let tr = `<td style="border:${borderLine};padding:4px 6px;text-align:left;font-size:9px;font-weight:800;color:#000;text-transform:uppercase;">${sub.subject}</td>`;
                p.structure.components.forEach(c => {
                    const sc = sub.components && sub.components[c.name] ? sub.components[c.name].score : '';
                    tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:700;color:#000;">${sc}</td>`;
                });
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:900;color:#000;">${sub.total}</td>`;
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.grade}</td>`;
                tr += `<td style="border:${borderLine};padding:2px;text-align:center;font-size:10px;font-weight:800;color:#000;">${sub.position || '1'}</td>`;
                tr += `<td style="border:${borderLine};padding:2px 6px;text-align:center;font-size:9px;font-weight:700;color:#000;text-transform:uppercase;">${sub.remark || ''}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });

            // No artificial padding rows requested. Table will shrink naturally, and flex layout will push footer to bottom.

            // --- Domains (Merged Affective + Psychomotor up to 12 slots) ---
            const affKeys = Object.keys(p.evaluation.affectiveDomains || {});
            const psyKeys = Object.keys(p.evaluation.psychomotorDomains || {});
            const safeAffList = (p.domainsList && p.domainsList.length > 0) ? p.domainsList : [];
            const safePsyList = (p.psychomotorList && p.psychomotorList.length > 0) ? p.psychomotorList : [];
            
            const combinedKeys = [...new Set([...affKeys, ...psyKeys, ...safeAffList, ...safePsyList])].slice(0, 12);
            let domRows = '';
            combinedKeys.forEach(d => {
                let val = '';
                if(p.evaluation.affectiveDomains && p.evaluation.affectiveDomains[d]) val = p.evaluation.affectiveDomains[d];
                if(p.evaluation.psychomotorDomains && p.evaluation.psychomotorDomains[d]) val = p.evaluation.psychomotorDomains[d];
                domRows += `<tr><td style="border:${borderLine};padding:2px 4px;text-align:left;font-size:8px;font-weight:800;text-transform:uppercase;color:#000;">${d}</td><td style="border:${borderLine};padding:2px;text-align:center;font-size:9px;font-weight:800;color:#000;">${val}</td></tr>`;
            });

            // Ensure at least 10 domain rows are printed
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

            // --- Bills ---
            let billRows = '';
            if(p.bills && Object.keys(p.bills).length > 0) {
                Object.keys(p.bills).forEach(key => {
                    if(key !== 'total' && key !== 'outstanding') {
                        let formattedName = key.replace(/_/g, ' ').toUpperCase();
                        if(!formattedName.includes('FEE')) formattedName += ' FEE';
                        billRows += `<tr><td style="border:${borderLine};padding:2px 4px;font-size:9px;font-weight:700;text-transform:uppercase;color:#000;">${formattedName}</td><td style="border:${borderLine};padding:2px 4px;text-align:center;font-size:9px;font-weight:900;color:#000;width:20px;">₦</td><td style="border:${borderLine};padding:2px 4px;text-align:right;font-size:9px;font-weight:800;color:#000;">${p.bills[key]}</td></tr>`;
                    }
                });
                billRows += `<tr><td colspan="3" style="border:none;height:6px;"></td></tr>`;
                billRows += `<tr><td style="border:${borderLine};padding:2px 4px;font-size:9px;font-weight:700;text-transform:uppercase;color:#000;">OUTSTANDING BILL</td><td style="border:${borderLine};padding:2px 4px;text-align:center;font-size:9px;font-weight:900;color:#000;">₦</td><td style="border:${borderLine};padding:2px 4px;text-align:right;font-size:9px;font-weight:800;color:#000;">${p.bills.outstanding || '0'}</td></tr>`;
                billRows += `<tr><td style="border:${borderLine};padding:2px 4px;font-size:9px;font-weight:800;text-transform:uppercase;color:#000;">TOTAL</td><td style="border:${borderLine};padding:2px 4px;text-align:center;font-size:10px;font-weight:900;color:#000;">₦</td><td style="border:${borderLine};padding:2px 4px;text-align:right;font-size:10px;font-weight:900;color:#000;">${p.bills.total || '0'}</td></tr>`;
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
                    <div style="flex:1;text-align:center;padding:0 10px;">
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

                <!-- INFO GRID WITH UNDERLINES -->
                <div style="border:2px solid ${tc}; padding:10px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1.5; display:flex; align-items:flex-end;"><span style="${labelStyle}">NAME</span><div style="${ulStyle}; flex:1; margin-left:8px; text-transform:uppercase;">${p.student.name}</div></div>
                        <div style="flex:0.8; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">CLASS</span><div style="${ulStyle}; flex:1; margin-left:8px; text-transform:uppercase;">${p.student.class}</div></div>
                        <div style="flex:0.8; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">GENDER</span><div style="${ulStyle}; flex:1; margin-left:8px; text-transform:uppercase;">${p.student.gender}</div></div>
                        <div style="flex:0.6; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">TERM</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.context.term}</div></div>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">SESSION</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.context.session}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:20px;"><span style="${labelStyle}">NO IN CLASS</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.context.noInClass}</div></div>
                        <div style="flex:1.2; display:flex; align-items:flex-end; margin-left:20px;"><span style="${labelStyle}">DATE OF BIRTH</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.student.dob || '-'}</div></div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">NO OF TIMES SCHOOL OPENED</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.attendance.timesOpened || '0'}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">NO OF TIMES PRESENT</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.attendance.timesPresent || '0'}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">NO OF TIMES ABSENT</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.attendance.timesAbsent || '0'}</div></div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">CLOSING DATE</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.dates.closingDate || '-'}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:40px;"><span style="${labelStyle}">RESUMPTION DATE</span><div style="${ulStyle}; flex:1; margin-left:8px;">${p.dates.resumptionDate || '-'}</div></div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; align-items:flex-end;">
                        <div style="flex:1; display:flex; align-items:flex-end;"><span style="${labelStyle}">OVERALL TOTAL</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.grandTotal}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">AVERAGE</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.average}</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">PERCENTAGE</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.percentage}%</div></div>
                        <div style="flex:1; display:flex; align-items:flex-end; margin-left:15px;"><span style="${labelStyle}">POSITION</span><div style="${ulStyle}; flex:1; margin-left:8px; font-size:12px;">${p.summary.position || '-'}</div></div>
                    </div>
                </div>

                <!-- ACADEMIC PERFORMANCE -->
                <table style="border-collapse:collapse;width:100%;">
                    <thead>
                        <tr><th colspan="${p.structure.components.length + 5}" style="border:${borderLine};padding:4px;text-align:center;font-size:11px;font-weight:900;text-transform:uppercase;color:#000;">PUPIL'S ACADEMIC PERFORMANCE ( ${p.student.class.toUpperCase()} CATEGORY )</th></tr>
                        <tr>${thCols}</tr>
                    </thead>
                    <tbody>${tbRows}</tbody>
                </table>
                <div style="flex:1;"></div>

                <!-- FOOTER 3 COLUMNS -->
                <div style="display:flex;gap:15px;align-items:flex-start;margin-top:4px;">
                    
                    <!-- DOMAINS -->
                    <div style="flex:1.2;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th style="border:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;">DOMAINS</th><th style="border:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;width:50px;">RATING</th></tr></thead>
                            <tbody>${domRows}</tbody>
                        </table>
                    </div>

                    <!-- KEYS -->
                    <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
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
                        </table>
                    </div>

                    <!-- SCHOOL BILL -->
                    <div style="flex:1.2;">
                        <table style="border-collapse:collapse;width:100%;">
                            <thead><tr><th colspan="3" style="border:${borderLine};padding:4px;font-size:10px;font-weight:900;color:#000;">SCHOOL BILL</th></tr></thead>
                            <tbody>${billRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- SIGNATURES -->
                <div style="margin-top:auto;padding-top:15px;display:flex;flex-direction:column;gap:12px;">
                    <div style="display:flex; align-items:flex-end;">
                        <span style="${labelStyle};font-size:11px;">CLASS TEACHER'S REMARK</span>
                        <div style="${ulStyle}; flex:1; margin-left:15px; text-transform:uppercase; font-size:12px;">${p.evaluation.teacherRemark || ' '}</div>
                    </div>
                    <div style="display:flex; align-items:flex-end;">
                        <span style="${labelStyle};font-size:11px;">HEAD TEACHER'S REMARK</span>
                        <div style="${ulStyle}; flex:1; margin-left:15px; text-transform:uppercase; font-size:12px;">${p.evaluation.headTeacherRemark || ' '}</div>
                    </div>
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
