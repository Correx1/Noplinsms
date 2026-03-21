// ============================================================
// CHART TEMPLATE — HisGrace International School Style
// Student data card + attendance card, academic with percentage,
// cumulative, affective + psychomotor checkmarks, term dates
// Pixel Perfect replica of the provided design
// ============================================================
(function() {

    window.TEMPLATE_REGISTRY.chart = {
        id: 'chart',
        name: 'Visual Chart',
        description: 'Data-rich report with strict boxed layout, attendance grid, percentage columns, side-by-side affective & psychomotor grids, and integrated promotional footers.',

        capabilities: {
            studentPhoto:       true,
            dateOfBirth:        true,
            attendance:         true,
            closingDate:        true,
            resumptionDate:     true,
            affectiveDomains:   true,
            psychomotorDomains: true,
            schoolBills:        false,
            keysToGrading:      true,
            keysToRating:       true,
            teacherRemark:      true,
            headTeacherRemark:  true,
            principalRemark:    false,
            signatures:         true,
            subjectPosition:    true,
            subjectHighLow:     true
        },

        renderTerm: function(p) {
            const tc = p.school.themeColor || '#2d5a27'; // Default deep green matching the specific brand flavor
            const lightTc = tc + '22'; // 13% opacity
            const borderRaw = `1.5px solid ${tc}`;
            const borderThin = `1px solid ${tc}`;

            let thCols = '';
            p.structure.components.forEach(c => {
                thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:8px;">${c.name.substring(0,2).toUpperCase()}</th>`;
            });

            let thWCols = '';
            p.structure.components.forEach(c => {
                thWCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px;">${c.weight}</th>`;
            });

            let tbRows = '';
            p.subjects.forEach(s => {
                let mAvg = s.total; // According to template logic, total and marks average correlate here.
                let perc = (((s.total) / 100) * 100).toFixed(1);
                
                let tr = `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:4px; text-align:left;">${s.subject}</td>`;
                p.structure.components.forEach(c => {
                    tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${s.components[c.name] ? s.components[c.name].score : ''}</td>`;
                });
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">1</td>`; // COEF
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${mAvg}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${s.total}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${perc}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${s.total}</td>`; // CUM TOTAL
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${s.position || ''}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${s.classAvg || ''}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; font-size:8px; text-align:center;">${s.remark || ''}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; text-align:center;">${s.grade}</td>`;
                tr += `<td style="border-bottom:${borderThin}; padding:3px; text-align:center;"></td>`; // SIGN
                tbRows += `<tr>${tr}</tr>`;
            });

            let keysCellsResolved = p.gradingKeys.map((k, idx) => {
                let bR = idx === p.gradingKeys.length - 1 ? '' : `border-right:${borderThin};`;
                return `<td style="${bR} padding:2px;">${k.min}-${k.max} (${k.remark.toUpperCase()})</td>`;
            }).join('');

            const defaultPsy = ["Drawing & Painting", "Handling of Tools", "Games", "Handwriting", "Music", "Verbal Fluency"];
            const fallbackPsyList = (p.psychomotorList && p.psychomotorList.length > 0) ? p.psychomotorList : defaultPsy;
            
            const affSource = (p.domainsList && p.domainsList.length > 0) ? p.domainsList : Object.keys(p.evaluation.affectiveDomains);
            const psySource = fallbackPsyList;

            const affEntries = affSource.map(d => [d, p.evaluation.affectiveDomains[d] || '']);
            const psyEntries = psySource.map(d => [d, p.evaluation.psychomotorDomains[d] || '']);

            let affRows = '';
            affEntries.forEach((e, idx) => {
                let brB = idx === affEntries.length - 1 ? '' : `border-bottom:${borderThin};`;
                let val = parseInt(e[1]) || 0;
                let c1 = val===1?'✓':'', c2 = val===2?'✓':'', c3 = val===3?'✓':'', c4 = val===4?'✓':'', c5 = val===5?'✓':'';
                affRows += `<tr>
                    <td style="${brB} border-right:${borderThin}; padding:4px; font-weight:bold;">${e[0]}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c1}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c2}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c3}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c4}</td>
                    <td style="${brB} text-align:center; padding:4px;">${c5}</td>
                </tr>`;
            });

            let psyRows = '';
            psyEntries.forEach((e, idx) => {
                let brB = idx === psyEntries.length - 1 ? '' : `border-bottom:${borderThin};`;
                let val = parseInt(e[1]) || 0;
                let c1 = val===1?'✓':'', c2 = val===2?'✓':'', c3 = val===3?'✓':'', c4 = val===4?'✓':'', c5 = val===5?'✓':'';
                psyRows += `<tr>
                    <td style="${brB} border-right:${borderThin}; padding:4px; font-weight:bold;">${e[0]}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c1}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c2}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c3}</td>
                    <td style="${brB} border-right:${borderThin}; text-align:center; padding:4px;">${c4}</td>
                    <td style="${brB} text-align:center; padding:4px;">${c5}</td>
                </tr>`;
            });

            const svgPen = `<svg viewBox="0 0 24 24" fill="none" stroke="${tc}" stroke-width="2" style="width:50px;height:50px;"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;

            return `
            <div style="font-family: Arial, Helvetica, sans-serif; width:100%; height:100%; color:#000; background:#fff; display:flex; flex-direction:column; box-sizing:border-box;">

                <!-- HEADER -->
                <div style="border:${borderRaw}; display:flex; padding:2px; background:${lightTc}; align-items:center; height:80px; margin-bottom:4px;">
                    <div style="width:75px; height:100%; border:${borderRaw}; background:#c8b6e2; display:flex; justify-content:center; align-items:center; border-radius:4px;">
                        <img src="${p.school.logo}" style="max-width:90%;max-height:90%;object-fit:contain;border-radius:50%;">
                    </div>
                    <div style="flex:1; text-align:center; display:flex; flex-direction:column; justify-content:center;">
                        <h1 style="margin:0; font-size:20px; font-weight:900; color:#000;">${p.school.name}</h1>
                        <div style="font-size:10px; font-weight:600; color:#000;">${p.school.address}</div>
                        <div style="font-size:10px; font-weight:600; color:#000;">Email: ${p.school.email || 'info@school.com'}</div>
                    </div>
                    <div style="width:75px; height:100%; border:${borderRaw}; background:#fbc02d; display:flex; justify-content:center; align-items:center; box-sizing:border-box; border-radius:4px;">
                        ${svgPen}
                    </div>
                </div>

                <!-- TITLE -->
                <div style="text-align:center; font-size:14px; font-weight:900; color:#000; margin-bottom:4px; margin-top:2px;">
                    ${p.context.session} ${p.context.term.toUpperCase()} REPORT SHEET
                </div>

                <!-- ROW 1: PERSONAL DATA, PHOTO, ATTENDANCE, TERMINAL, AVERAGES -->
                <div style="display:flex; gap:4px; margin-bottom:4px; align-items:stretch;">
                    
                    <div style="flex:2.5;">
                        <table style="width:100%; border-collapse:collapse; font-size:10px; border:${borderThin};">
                            <tr><th colspan="2" style="background:${lightTc}; border-bottom:${borderThin}; padding:3px; text-align:center;">STUDENT'S PERSONAL DATA</th></tr>
                            <tr><td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px 4px;">Name</td><td style="border-bottom:${borderThin}; padding:2px 4px; text-transform:uppercase; font-weight:bold;">${p.student.name}</td></tr>
                            <tr><td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px 4px;">Date of Birth</td><td style="border-bottom:${borderThin}; padding:2px 4px; font-weight:bold;">${p.student.dob || '1/1/2012'}</td></tr>
                            <tr><td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px 4px;">Sex</td><td style="border-bottom:${borderThin}; padding:2px 4px; text-transform:uppercase; font-weight:bold;">${p.student.gender || 'Unknown'}</td></tr>
                            <tr><td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px 4px;">Class</td><td style="border-bottom:${borderThin}; padding:2px 4px; text-transform:uppercase; font-weight:bold;">${p.student.class}</td></tr>
                            <tr><td style="border-right:${borderThin}; padding:2px 4px;">Admission No.</td><td style="padding:2px 4px; text-transform:uppercase; font-weight:bold;">${p.student.roll}</td></tr>
                        </table>
                    </div>

                    <div style="width:75px; flex-shrink:0;">
                        <img src="${p.student.photo}" style="width:100%; height:100%; object-fit:cover; border:${borderThin};">
                    </div>

                    <div style="flex:2.5; display:flex; flex-direction:column; justify-content:space-between;">
                        <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderThin}; text-align:center;">
                            <tr><th colspan="3" style="background:${lightTc}; border-bottom:${borderThin}; padding:3px;">ATTENDANCE</th></tr>
                            <tr>
                                <td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px; font-size:8px;">No. of Times<br>School Opened</td>
                                <td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px; font-size:8px;">No. of Times<br>Present</td>
                                <td style="border-bottom:${borderThin}; padding:2px; font-size:8px;">No. of Times<br>Absent</td>
                            </tr>
                            <tr>
                                <td style="border-right:${borderThin}; padding:2px;">${p.attendance.timesOpened || 116}</td>
                                <td style="border-right:${borderThin}; padding:2px;">${p.attendance.timesPresent || 116}</td>
                                <td style="padding:2px;">${p.attendance.timesAbsent || 0}</td>
                            </tr>
                        </table>
                        
                        <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderThin}; text-align:center;">
                            <tr><th colspan="3" style="background:${lightTc}; border-bottom:${borderThin}; padding:2px;">TERMINAL DURATION (14)</th></tr>
                            <tr>
                                <td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px; font-size:8px;">Term Begins</td>
                                <td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px; font-size:8px;">Term Ends</td>
                                <td style="border-bottom:${borderThin}; padding:2px; font-size:8px;">Next Term Begins</td>
                            </tr>
                            <tr>
                                <td style="border-right:${borderThin}; padding:2px;">${p.dates.resumptionDate || '--/--/----'}</td>
                                <td style="border-right:${borderThin}; padding:2px;">${p.dates.closingDate || '--/--/----'}</td>
                                <td style="padding:2px;">${p.dates.nextTermBegins || '--/--/----'}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="flex:1.5; display:flex; flex-direction:column; justify-content:space-between;">
                        <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderThin}; text-align:center; height:100%;">
                            <tr><td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px; font-weight:bold;">TOTAL<br>AVERAGE</td><td style="border-bottom:${borderThin}; padding:2px;">${p.summary.average}</td></tr>
                            <tr><td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px; font-weight:bold;">TOTAL COEF</td><td style="border-bottom:${borderThin}; padding:2px;">${p.subjects.length}</td></tr>
                            <tr><td style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px; font-weight:bold;">TERM AVERAGE</td><td style="border-bottom:${borderThin}; padding:2px;">${p.summary.average}</td></tr>
                            <tr><th style="border-bottom:${borderThin}; border-right:${borderThin}; padding:2px;">No. in Class</th><th style="border-bottom:${borderThin}; padding:2px;">Position</th></tr>
                            <tr><td style="border-right:${borderThin}; padding:2px;">${p.context.noInClass}</td><td style="padding:2px;">${p.summary.position}</td></tr>
                        </table>
                    </div>
                </div>

                <!-- ACADEMIC PERFORMANCE TABLE -->
                <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderRaw}; text-align:center; margin-bottom:4px;">
                    <thead>
                        <tr><th colspan="12" style="background:${lightTc}; border-bottom:${borderThin}; padding:3px;">ACADEMIC PERFORMANCE</th></tr>
                        <tr>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:4px;">SUBJECT</th>
                            ${thCols}
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:7px; line-height:1.1;">COEF.</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:7px; line-height:1.1;">MARKS<br>AVERAGE</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:7px; line-height:1.1;">TOTAL<br>SCORE</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:7px; line-height:1.1;">PERCEN-<br>TAGE</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:7px; line-height:1.1;">CUM.<br>TOTAL<br>SCORE</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:7px; line-height:1.1;">POSITION<br>IN<br>SUBJECT</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:7px; line-height:1.1;">CLASS<br>AVERAGE</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:8px;">REMARKS</th>
                            <th rowspan="2" style="border-right:${borderThin}; border-bottom:${borderThin}; padding:2px; font-size:8px;">GRADE</th>
                            <th rowspan="2" style="border-bottom:${borderThin}; padding:2px; font-size:8px;">SIGN.</th>
                        </tr>
                        <tr>${thWCols}</tr>
                    </thead>
                    <tbody>
                        ${tbRows}
                    </tbody>
                </table>

                <!-- KEYS TO RATING -->
                <table style="width:100%; border-collapse:collapse; font-size:8px; border:${borderThin}; text-align:center; margin-bottom:4px; flex-shrink:0;">
                    <tr><th colspan="6" style="background:${lightTc}; border-bottom:${borderThin}; padding:2px;">KEYS TO RATING</th></tr>
                    <tr>${keysCellsResolved}</tr>
                </table>

                <!-- AFFECTIVE + PSYCHOMOTOR -->
                <div style="display:flex; gap:4px; margin-bottom:4px; align-items:flex-start;">
                    <div style="flex:1;">
                        <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderThin};">
                            <tr>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; padding:3px; text-align:left;">AFFECTIVE TRAITS</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">1</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">2</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">3</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">4</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; width:15px; padding:3px;">5</th>
                            </tr>
                            ${affRows}
                        </table>
                    </div>

                    <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
                        <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderThin};">
                            <tr>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; padding:3px; text-align:left;">PSYCHOMOTOR SKILLS</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">1</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">2</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">3</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; border-right:${borderThin}; width:15px; padding:3px;">4</th>
                                <th style="background:${lightTc}; border-bottom:${borderThin}; width:15px; padding:3px;">5</th>
                            </tr>
                            ${psyRows}
                        </table>
                        
                        <div style="width:60%;">
                            <table style="width:100%; border-collapse:collapse; font-size:8px; border:${borderThin}; text-align:left;">
                                <tr><th style="background:${lightTc}; border-bottom:${borderThin}; padding:2px; text-align:center;">KEYS TO RATING</th></tr>
                                <tr><td style="border-bottom:${borderThin}; padding:1px 4px;">5. Excellent</td></tr>
                                <tr><td style="border-bottom:${borderThin}; padding:1px 4px;">4. Good</td></tr>
                                <tr><td style="border-bottom:${borderThin}; padding:1px 4px;">3. Fair</td></tr>
                                <tr><td style="border-bottom:${borderThin}; padding:1px 4px;">2. Poor</td></tr>
                                <tr><td style="padding:1px 4px;">1. Very Poor</td></tr>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- BOTTOM REMARKS -->
                <div style="border:${borderThin}; font-size:10px; line-height:1.5; margin-top:2px;">
                    <div style="border-bottom:${borderThin}; padding:4px;">
                        <span style="font-weight:bold;">Class Teacher's Comments:</span> ${p.evaluation.teacherRemark}
                        <span style="float:right;">
                            <span style="font-weight:bold;">Sign.:</span> _________________ &nbsp;&nbsp;&nbsp;
                            <span style="font-weight:bold;">Date:</span> ${p.dates.closingDate || '___________'}
                        </span>
                        <div style="clear:both;"></div>
                    </div>
                    <div style="border-bottom:${borderThin}; padding:4px;">
                        <span style="font-weight:bold;">HeadTeacher's Comments:</span> ${p.evaluation.headTeacherRemark}
                        <span style="float:right;">
                            <span style="font-weight:bold;">Sign.:</span> _________________ &nbsp;&nbsp;&nbsp;
                            <span style="font-weight:bold;">Date:</span> ${p.dates.closingDate || '___________'}
                        </span>
                        <div style="clear:both;"></div>
                    </div>
                    <div style="padding:4px;">
                        <span style="font-weight:bold;">Promotion Status:</span> <span style="text-transform:uppercase;">${p.summary.promotionStatus}</span>
                    </div>
                </div>

            </div>`;
        },

        renderSession: function(p) {
            // Re-using the strong visual style for session evaluation but adapted for terms
            const tc = p.school.themeColor || '#2d5a27';
            const lightTc = tc + '22';
            const borderRaw = `1.5px solid ${tc}`;
            const borderThin = `1px solid ${tc}`;

            let thCols = `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:4px;">SUBJECT</th>`;
            thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">TERM 1</th>`;
            thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">TERM 2</th>`;
            thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">TERM 3</th>`;
            thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">ANNUAL TOTAL</th>`;
            thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">ANNUAL AVG</th>`;
            thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">POSITION</th>`;
            thCols += `<th style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">GRADE</th>`;
            thCols += `<th style="border-bottom:${borderThin}; padding:3px 2px; text-align:left;">REMARK</th>`;

            let tbRows = '';
            p.subjects.forEach(s => {
                let tr = `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:4px; text-align:left; font-weight:600;">${s.subject}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">${s.t1 || ''}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">${s.t2 || ''}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">${s.t3 || ''}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center; font-weight:bold;">${s.total}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">${s.classAvg || s.total}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center;">${s.position || ''}</td>`;
                tr += `<td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px 2px; text-align:center; font-weight:bold;">${s.grade}</td>`;
                tr += `<td style="border-bottom:${borderThin}; padding:3px 2px; text-align:left; font-size:8px;">${s.remark}</td>`;
                tbRows += `<tr>${tr}</tr>`;
            });

            const svgPen = `<svg viewBox="0 0 24 24" fill="none" stroke="${tc}" stroke-width="2" style="width:50px;height:50px;"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;

            return `
            <div style="font-family: Arial, Helvetica, sans-serif; width:100%; height:100%; color:#000; background:#fff; display:flex; flex-direction:column; box-sizing:border-box;">
                
                <div style="border:${borderRaw}; display:flex; padding:2px; background:${lightTc}; align-items:center; height:80px; margin-bottom:4px;">
                    <div style="width:75px; height:100%; border:${borderRaw}; background:#c8b6e2; display:flex; justify-content:center; align-items:center; border-radius:4px;">
                        <img src="${p.school.logo}" style="max-width:90%;max-height:90%;object-fit:contain;border-radius:50%;">
                    </div>
                    <div style="flex:1; text-align:center; display:flex; flex-direction:column; justify-content:center;">
                        <h1 style="margin:0; font-size:18px; font-weight:900; color:#000;">${p.school.name}</h1>
                        <div style="font-size:10px; font-weight:600; color:#000;">${p.school.address}</div>
                        <div style="font-size:10px; font-weight:600; color:#000;">Email: ${p.school.email || 'info@school.com'}</div>
                    </div>
                    <div style="width:75px; height:100%; border:${borderRaw}; background:#fbc02d; display:flex; justify-content:center; align-items:center; box-sizing:border-box; border-radius:4px;">
                        ${svgPen}
                    </div>
                </div>

                <div style="text-align:center; font-size:12px; font-weight:900; color:#000; margin-bottom:4px; margin-top:2px;">
                    ${p.context.session} ANNUAL REPORT SHEET
                </div>
                
                <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderThin}; margin-bottom:4px;">
                    <tr>
                        <th style="background:${lightTc}; border-right:${borderThin}; border-bottom:${borderThin}; padding:3px;">STUDENT NAME</th>
                        <td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; font-weight:bold;">${p.student.name}</td>
                        <th style="background:${lightTc}; border-right:${borderThin}; border-bottom:${borderThin}; padding:3px;">CLASS</th>
                        <td style="border-right:${borderThin}; border-bottom:${borderThin}; padding:3px; font-weight:bold;">${p.student.class}</td>
                        <th style="background:${lightTc}; border-right:${borderThin}; border-bottom:${borderThin}; padding:3px;">ADMISSION NO.</th>
                        <td style="border-bottom:${borderThin}; padding:3px; font-weight:bold;">${p.student.roll}</td>
                    </tr>
                    <tr>
                        <th style="background:${lightTc}; border-right:${borderThin}; padding:3px;">ANNUAL AVERAGE</th>
                        <td style="border-right:${borderThin}; padding:3px; font-weight:bold; font-size:10px; color:${tc};">${p.summary.average}</td>
                        <th style="background:${lightTc}; border-right:${borderThin}; padding:3px;">GRAND TOTAL</th>
                        <td style="border-right:${borderThin}; padding:3px; font-weight:bold;">${p.summary.grandTotal}</td>
                        <th style="background:${lightTc}; border-right:${borderThin}; padding:3px;">POSITION</th>
                        <td style="padding:3px; font-weight:bold;">${p.summary.position}</td>
                    </tr>
                </table>

                <table style="width:100%; border-collapse:collapse; font-size:9px; border:${borderRaw}; text-align:center; margin-bottom:auto;">
                    <thead><tr>${thCols}</tr></thead>
                    <tbody>${tbRows}</tbody>
                </table>
                
                <div style="border:${borderThin}; font-size:10px; line-height:1.5; margin-top:4px;">
                    <div style="border-bottom:${borderThin}; padding:4px;">
                        <span style="font-weight:bold;">Class Teacher's Comments:</span> ${p.evaluation.teacherRemark}
                        <span style="float:right;">
                            <span style="font-weight:bold;">Sign.:</span> _________________ &nbsp;&nbsp;&nbsp;
                            <span style="font-weight:bold;">Date:</span> ${p.dates.closingDate || '___________'}
                        </span>
                        <div style="clear:both;"></div>
                    </div>
                    <div style="border-bottom:${borderThin}; padding:4px;">
                        <span style="font-weight:bold;">HeadTeacher's Comments:</span> ${p.evaluation.headTeacherRemark}
                        <span style="float:right;">
                            <span style="font-weight:bold;">Sign.:</span> _________________ &nbsp;&nbsp;&nbsp;
                            <span style="font-weight:bold;">Date:</span> ${p.dates.closingDate || '___________'}
                        </span>
                        <div style="clear:both;"></div>
                    </div>
                    <div style="padding:4px;">
                        <span style="font-weight:bold;">Promotion Status:</span> <span style="text-transform:uppercase;">${p.summary.promotionStatus}</span>
                    </div>
                </div>
            </div>`;
        }
    };

    console.log('Chart template registered.');
})();
