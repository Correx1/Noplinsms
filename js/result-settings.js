// Result Settings JS Logic
(function() {
    console.log('Result Settings module initialized.');

    let domainsList = [
        "Discipline", "Neatness", "Attentiveness", "Punctuality", 
        "Logical", "Leadership", "Teamwork", "Attendance", "Sports"
    ];

    let b64PrincipalSign = "";
    let b64HeadteacherSign = "";

    function renderDomains() {
        const container = document.getElementById('domains-container');
        if(!container) return;
        
        container.innerHTML = '';
        domainsList.forEach((dom, idx) => {
            container.innerHTML += `
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 font-medium w-6 text-right">${idx + 1}.</span>
                    <input type="text" value="${dom}" class="domain-input-val bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                    <button type="button" onclick="window.removeDomainField(${idx})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Domain">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    window.addNewDomainField = function() {
        domainsList.push("");
        renderDomains();
    };

    window.removeDomainField = function(idx) {
        domainsList.splice(idx, 1);
        renderDomains();
    };

    function handleFileUpload(inputId, previewId, setterCallback) {
        const input = document.getElementById(inputId);
        input.addEventListener('change', function() {
            const file = this.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const b64 = e.target.result;
                    setterCallback(b64);
                    const preview = document.getElementById(previewId);
                    preview.innerHTML = `<img src="${b64}" class="max-h-full max-w-full object-contain">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('globalResultSettings');
        if(savedSettings) {
            const data = JSON.parse(savedSettings);
            if(document.getElementById('rs-session')) document.getElementById('rs-session').value = data.session || '';
            if(document.getElementById('rs-resumption')) document.getElementById('rs-resumption').value = data.resumption || '';
            if(document.getElementById('rs-headteacher-title')) document.getElementById('rs-headteacher-title').value = data.headteacherTitle || '';
            if(document.getElementById('rs-principal-title')) document.getElementById('rs-principal-title').value = data.principalTitle || '';
            if(document.getElementById('rs-principal-name')) document.getElementById('rs-principal-name').value = data.principalName || '';
            if(document.getElementById('rs-headteacher-name')) document.getElementById('rs-headteacher-name').value = data.headteacherName || '';
            
            if(data.activeTemplate) {
                const radio = document.querySelector(`input[name="rs-template-sel"][value="${data.activeTemplate}"]`);
                if(radio) radio.checked = true;
            }
            
            if(data.domains && Array.isArray(data.domains)) {
                domainsList = data.domains;
            }

            if(data.principalSign) {
                b64PrincipalSign = data.principalSign;
                document.getElementById('rs-principal-preview').innerHTML = `<img src="${b64PrincipalSign}" class="max-h-full max-w-full object-contain">`;
            }
            if(data.headteacherSign) {
                b64HeadteacherSign = data.headteacherSign;
                document.getElementById('rs-headteacher-preview').innerHTML = `<img src="${b64HeadteacherSign}" class="max-h-full max-w-full object-contain">`;
            }
        }
        renderDomains();

        // Bind File Uploads
        handleFileUpload('rs-principal-sign', 'rs-principal-preview', (val) => b64PrincipalSign = val);
        handleFileUpload('rs-headteacher-sign', 'rs-headteacher-preview', (val) => b64HeadteacherSign = val);
    }

    function saveSettings(e) {
        e.preventDefault();

        // Capture domains natively from DOM exactly as typed
        const domInputs = document.querySelectorAll('.domain-input-val');
        domainsList = Array.from(domInputs).map(inp => inp.value.trim()).filter(v => v !== "");

        // Capture active template
        const activeTplRadio = document.querySelector('input[name="rs-template-sel"]:checked');
        const activeTemplate = activeTplRadio ? activeTplRadio.value : 'classic';

        const data = {
            session: document.getElementById('rs-session').value,
            resumption: document.getElementById('rs-resumption').value,
            headteacherTitle: document.getElementById('rs-headteacher-title') ? document.getElementById('rs-headteacher-title').value : 'Head Teacher',
            principalTitle: document.getElementById('rs-principal-title') ? document.getElementById('rs-principal-title').value : 'Principal / Director',
            principalName: document.getElementById('rs-principal-name').value,
            headteacherName: document.getElementById('rs-headteacher-name').value,
            activeTemplate: activeTemplate,
            domains: domainsList,
            principalSign: b64PrincipalSign,
            headteacherSign: b64HeadteacherSign
        };

        localStorage.setItem('globalResultSettings', JSON.stringify(data));

        showToast('Settings Saved', 'Result generation globally updated', 'success');
        renderDomains(); // Refresh UI cleanly
    }

    // --- PREVIEW MODAL LOGIC STRIP ---
    window.previewSelectedTemplate = function() {
        const activeTplRadio = document.querySelector('input[name="rs-template-sel"]:checked');
        const tpl = activeTplRadio ? activeTplRadio.value : 'classic';

        // Mock Record
        const mockRec = {
            student: { name: "John Doe Model", roll: "2024-001", class: "JSS 1 Gold", term: "First Term" },
            position: "1st", average: "89.5", grandTotal: 895,
            structure: {
                components: [
                    {name: "CA1", weight: 10}, {name: "CA2", weight: 10}, 
                    {name: "Project", weight: 10}, {name: "Exam", weight: 70}
                ]
            },
            subjects: [
                {subject: "Mathematics", components: {CA1: {score: 8}, CA2: {score: 9}, Project: {score: 10}, Exam: {score: 65}}, total: 92, grade: "A1", remark: "Excellent", highest: 98, lowest: 45, position: "2nd"},
                {subject: "English Language", components: {CA1: {score: 7}, CA2: {score: 8}, Project: {score: 9}, Exam: {score: 60}}, total: 84, grade: "A2", remark: "Excellent", highest: 90, lowest: 40, position: "5th"},
                {subject: "Basic Science", components: {CA1: {score: 6}, CA2: {score: 7}, Project: {score: 8}, Exam: {score: 55}}, total: 76, grade: "B2", remark: "Very Good", highest: 85, lowest: 35, position: "10th"}
            ]
        };

        const html = generateMockPrintTemplate(mockRec, tpl);
        
        const previewContainer = document.getElementById('settings-preview-body');
        previewContainer.innerHTML = html;
        
        // Dynamically scale the UI so it fits directly inside mobile & PC screens responsively!
        const scale = Math.min(1, (window.innerWidth - 30) / 794); // 794px ~ 210mm
        previewContainer.style.transform = `scale(${scale})`;
        const scaledHeight = 1122 * scale; // 1122px ~ 297mm
        previewContainer.parentElement.style.height = `${scaledHeight + 100}px`; // Provide scroll padding
        
        const modal = document.getElementById('settings-preview-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    };

    window.closeSettingsPreviewModal = function() {
        const modal = document.getElementById('settings-preview-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    };

    function generateMockPrintTemplate(rec, tpl) {

        const settings = JSON.parse(localStorage.getItem('globalResultSettings') || '{}');
        const evals = { remark: "Outstanding performance all round.", domains: {"Punctuality": 5, "Neatness": 5, "Politeness": 4, "Honesty": 5, "Attendance": 5} };
        const clsValue = rec.student.class;
        const sessionValue = settings.session || '2024/2025';
        const termValue = rec.student.term;
        
        const profile = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');
        const schName = profile.name || "St. Augustine College";
        const schAddress = profile.address || "123 Education Boulevard, Excellence City";
        const schContact = `${profile.email || 'info@school.com'} | ${profile.website || 'www.school.com'}`;
        const schMotto = profile.motto || "Knowledge is Power";
        const schLogo = profile.logo || "../../assets/images/logo.png";

        let thHtml = `<th class="p-1.5 border border-slate-300 text-left w-[22%]">SUBJECT</th>`;
        rec.structure.components.forEach(c => {
            thHtml += `<th class="p-1.5 border border-slate-300 text-center">${c.name.toUpperCase()} /${c.weight}</th>`;
        });
        thHtml += `
            <th class="p-1.5 border border-slate-300 text-center">TOTAL</th>
            <th class="p-1.5 border border-slate-300 text-center">GRD</th>
            <th class="p-1.5 border border-slate-300 text-left">REMARK</th>
            <th class="p-1.5 border border-slate-300 text-center">HIGH</th>
            <th class="p-1.5 border border-slate-300 text-center">LOW</th>
            <th class="p-1.5 border border-slate-300 text-center">POS</th>`;

        let tbodyHtml = '';
        rec.subjects.forEach((sub) => {
            let trHtml = `<td class="p-1.5 border border-slate-300 font-bold">${sub.subject}</td>`;
            rec.structure.components.forEach(c => {
                trHtml += `<td class="p-1.5 border border-slate-300 text-center">${sub.components[c.name] ? sub.components[c.name].score : ''}</td>`;
            });
            trHtml += `
                <td class="p-1.5 border border-slate-300 text-center font-black">${sub.total}</td>
                <td class="p-1.5 border border-slate-300 text-center font-bold">${sub.grade}</td>
                <td class="p-1.5 border border-slate-300 text-left text-[10px]">${sub.remark}</td>
                <td class="p-1.5 border border-slate-300 text-center">${sub.highest}</td>
                <td class="p-1.5 border border-slate-300 text-center">${sub.lowest}</td>
                <td class="p-1.5 border border-slate-300 text-center">${sub.position}</td>`;
            tbodyHtml += `<tr class="text-[11px]">${trHtml}</tr>`;
        });

        const doms = settings.domains || ["Punctuality", "Neatness", "Politeness", "Honesty", "Attendance"];
        const half = Math.ceil(doms.length / 2);
        const leftRows = doms.slice(0, half).map(d => `<tr class="border-b border-slate-200"><td class="p-0.5">${d}</td><td class="text-right font-bold w-[25px]">${evals.domains[d] || 4}</td></tr>`).join('');
        const rightRows = doms.slice(half).map(d => `<tr class="border-b border-slate-200"><td class="p-0.5">${d}</td><td class="text-right font-bold w-[25px]">${evals.domains[d] || 4}</td></tr>`).join('');

        let prinSignHtml = settings.principalSign ? `<img src="${settings.principalSign}" class="max-h-[25px] object-contain mb-[2px]">` : `<div class="h-[25px]"></div>`;
        let headSignHtml = settings.headteacherSign ? `<img src="${settings.headteacherSign}" class="max-h-[25px] object-contain mb-[2px]">` : `<div class="h-[25px]"></div>`;

        let html = `<div class="result-pdf-wrapper relative w-[210mm] h-[296mm] overflow-hidden bg-white mx-auto py-[10mm] px-[15mm] box-border font-sans text-black">`;
        
        
        const promoteRule = parseInt(localStorage.getItem('sms_promotion_rule') || 50);
        const isPromoted = rec.average >= promoteRule;
        const pBadge = isPromoted 
            ? `<span class="px-2 py-0.5 ml-2 border border-green-300 rounded text-[9px] font-black text-green-700 bg-green-50 shadow-sm uppercase print:text-green-700 print:bg-transparent">PROMOTED</span>`
            : `<span class="px-2 py-0.5 ml-2 border border-red-300 rounded text-[9px] font-black text-red-700 bg-red-50 shadow-sm uppercase print:text-red-700 print:bg-transparent">FAILED</span>`;
        
        const pStatus = isPromoted ? "PROMOTED TO NEXT CLASS" : "REPEATED";

        // TEMPLATE SWITCHER
        if(tpl === 'modern') {
            html += `
            <div class="flex items-center gap-4 bg-primary-800 text-white p-4 rounded-t-xl mb-4">
                <img src="${schLogo}" class="h-16 w-16 object-contain bg-white rounded p-1">
                <div class="flex-1">
                    <h1 class="text-2xl font-black uppercase tracking-wide m-0">${schName}</h1>
                    <p class="text-xs text-primary-100 m-0">${schContact}</p>
                    <p class="text-xs text-primary-200 capitalize italic mt-1 font-semibold">${schMotto}</p>
                </div>
            </div>
            <div class="text-center mb-4"><h2 class="text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-100 py-1 inline-block px-4 rounded-full border border-gray-300">Termly Academic Report</h2></div>
            <div class="grid grid-cols-4 gap-2 mb-4 text-[10px]">
                <div class="bg-gray-50 border border-gray-200 p-2 rounded"><div class="text-gray-500 uppercase font-bold text-[8px]">Student Name</div><div class="font-bold text-sm truncate">${rec.student.name}</div></div>
                <div class="bg-gray-50 border border-gray-200 p-2 rounded"><div class="text-gray-500 uppercase font-bold text-[8px]">Admission No</div><div class="font-bold">ADM-${rec.student.roll}</div></div>
                <div class="bg-gray-50 border border-gray-200 p-2 rounded"><div class="text-gray-500 uppercase font-bold text-[8px]">Class & Term</div><div class="font-bold">${clsValue} | ${termValue}</div></div>
                <div class="bg-primary-50 border border-primary-200 p-2 rounded"><div class="text-primary-600 uppercase font-bold text-[8px]">Average & Position</div><div class="font-black text-primary-800 text-sm">${rec.average}% &nbsp;|&nbsp; ${rec.position} ${pBadge}</div></div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="bg-primary-50 text-[10px] text-primary-900 border-t-2 border-b-2 border-primary-300"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="bg-gray-50 font-bold text-xs border-t-2 border-gray-300"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right">OVERALL TOTAL:</td><td class="p-1.5 text-center text-primary-700">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        
        } else if(tpl === 'radiant') {
            // Radiant requires custom table generator for vertical headers
            let radTh = `<th class="p-1.5 border border-gray-400 text-left font-bold align-bottom w-[20%]">Subject</th>`;
            rec.structure.components.forEach(c => {
                radTh += `<th class="border border-gray-400 align-bottom h-[100px] w-8">
                            <div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold whitespace-nowrap">${c.name} (${c.weight}%)</div>
                          </th>`;
            });
            radTh += `
                <th class="border border-gray-400 align-bottom h-[100px] w-8"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Total Score</div></th>
                <th class="border border-gray-400 align-bottom h-[100px] w-8"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Grade</div></th>
                <th class="border border-gray-400 align-bottom h-[100px] w-8"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto p-1 font-bold">Position</div></th>
                <th class="p-1.5 border border-gray-400 align-bottom font-bold text-center">Remark</th>
            `;

            let radTb = '';
            rec.subjects.forEach(sub => {
                let tr = `<td class="p-1.5 border border-gray-400 font-bold">${sub.subject}</td>`;
                rec.structure.components.forEach(c => {
                    tr += `<td class="p-1.5 border border-gray-400 text-center">${sub.components[c.name] ? sub.components[c.name].score : ''}</td>`;
                });
                tr += `
                    <td class="p-1.5 border border-gray-400 text-center font-black">${sub.total}</td>
                    <td class="p-1.5 border border-gray-400 text-center font-bold">${sub.grade}</td>
                    <td class="p-1.5 border border-gray-400 text-center">${sub.position}</td>
                    <td class="p-1.5 border border-gray-400 text-center text-[10px]">${sub.remark}</td>
                `;
                radTb += `<tr class="text-[11px] border-b border-gray-400">${tr}</tr>`;
            });

            html += `
            <div class="h-full border-[2px] border-blue-900/20 p-[5mm] box-border relative">
                <div class="flex items-center justify-between border-b-[3px] border-blue-800 pb-[10px] mb-[10px]">
                    <img src="${schLogo}" class="h-[75px] w-[80px] object-contain object-left">
                    <div class="flex-1 text-center px-4 shrink-0">
                        <h1 class="text-[26px] font-black tracking-wide m-0" style="color: #1e3a8a;">${schName}</h1>
                        <p class="text-[11px] font-bold text-blue-900 m-0">${schAddress}</p>
                        <p class="text-[10px] text-gray-600 mt-[2px] font-medium">Motto: ${schMotto}</p>
                        <div class="text-[14px] font-extrabold mt-[5px] uppercase tracking-widest text-gray-800">Termly Academic Report</div>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=${rec.student.name}&background=1e3a8a&color=fff" class="h-[80px] w-[70px] object-cover border-2 border-gray-300 rounded shadow-sm">
                </div>
                
                <div class="text-[10px] font-bold text-gray-800 leading-tight space-y-1 mb-[10px]">
                    <div>Registration number: <span class="font-normal border-b border-dotted border-gray-400 pb-[1px] uppercase">ADM-${rec.student.roll}</span></div>
                    <div>Name: <span class="font-normal border-b border-dotted border-gray-400 pb-[1px] uppercase">${rec.student.name}</span></div>
                    <div>Academic session: <span class="font-normal">${settings.session}</span> &nbsp;&nbsp; Term: <span class="font-normal">${termValue}</span> &nbsp;&nbsp; Class: <span class="font-normal">${clsValue}</span></div>
                </div>

                <div class="flex-1">
                    <table class="w-full border-collapse text-[10px]">
                        <thead class="bg-gray-600 text-white border-2 border-gray-600">
                            <tr>${radTh}</tr>
                        </thead>
                        <tbody class="border-2 border-gray-500">
                            ${radTb}
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-[10px] border border-green-700 rounded overflow-hidden">
                    <div class="bg-green-700/10 text-green-800 px-2 py-0.5 text-[9px] font-bold border-b border-green-700">Key to Grades:</div>
                    <div class="p-1 px-2 text-[8px] text-gray-700 leading-snug">
                        PV (Fail) = Below 40%, E8 (Pass) = 40% ≤ 45%, D7 (Pass) = 45% ≤ 50%, C6 (Credit) = 50% ≤ 60%, C5 (Credit) = 60% ≤ 65%, C4 (Credit) = 65% ≤ 70%, B3 (Distinction) = 70% ≤ 75%, B2 (Distinction) = 75% ≤ 80%, A1 (Excellent) = 80% & Above.
                    </div>
                </div>

                <div class="border-[2px] border-blue-900/30 rounded p-[8mm] mt-[10px] text-[10px] relative">
                    <div class="font-bold flex gap-[20px] mb-2">
                        <span>Total: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.grandTotal}</span></span>
                        <span>Average Score: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.average}</span></span>
                        <span>Class Position: <span class="font-normal border-b border-dotted border-gray-400 hover:bg-gray-50">${rec.position}</span></span> ${pBadge}
                    </div>
                    <div class="mb-3">
                        <span class="font-bold text-blue-900">Form Teacher's Remark:</span> 
                        <span class="italic text-gray-700 border-b border-dotted border-gray-400">${evals.remark}</span>
                    </div>
                    
                    <div class="flex justify-between mt-6">
                        <div class="text-center w-[150px]">
                            ${headSignHtml}
                            <div class="border-t border-black pt-1 font-bold text-[10px]">${settings.headteacherName}</div>
                            <div class="italic text-[9px] text-gray-500 uppercase">Form Teacher</div>
                        </div>
                        <div class="text-center w-[150px]">
                            ${prinSignHtml}
                            <div class="border-t border-black pt-1 font-bold text-[10px]">${settings.principalName}</div>
                            <div class="italic text-[9px] text-gray-500 uppercase">Principal</div>
                        </div>
                    </div>
                </div>
                <!-- Watermark -->
                <div class="absolute inset-0 pointer-events-none opacity-[0.04] bg-center bg-no-repeat bg-[length:60%] z-[-1]" style="background-image: url('${schLogo}');"></div>
            </div>
            `;
        
        } else if(tpl === 'chart') {
            let chartTh = `<th class="p-1 border border-gray-400 text-center w-6">S/N</th><th class="p-1 border border-gray-400 text-left">SUBJECT</th>`;
            rec.structure.components.forEach(c => {
                chartTh += `<th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">${c.name}(${c.weight})</div></th>`;
            });
            chartTh += `
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1 font-bold">TOTAL</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">CLASS HIGHEST</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">CLASS LOWEST</div></th>
                <th class="p-1 border border-gray-400 text-center"><div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-[9px] mx-auto py-1">POSITION</div></th>
                <th class="p-1 border border-gray-400 text-center font-bold">GRADE</th>
                <th class="p-1 border border-gray-400 text-center font-bold">REMARK</th>
            `;

            let chartTb = '';
            let chartBars = '';
            rec.subjects.forEach((sub, idx) => {
                let tr = `<td class="p-1 border border-gray-400 text-center">${idx + 1}</td><td class="p-1 border border-gray-400 font-bold">${sub.subject}</td>`;
                rec.structure.components.forEach(c => {
                    tr += `<td class="p-1 border border-gray-400 text-center">${sub.components[c.name] ? sub.components[c.name].score : ''}</td>`;
                });
                tr += `
                    <td class="p-1 border border-gray-400 text-center font-black">${sub.total}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.highest}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.lowest}</td>
                    <td class="p-1 border border-gray-400 text-center">${sub.position}</td>
                    <td class="p-1 border border-gray-400 text-center font-bold">${sub.grade}</td>
                    <td class="p-1 border border-gray-400 text-left text-[9px] font-bold">${sub.remark}</td>
                `;
                chartTb += `<tr class="text-[10px] border-b border-gray-400 hover:bg-gray-50">${tr}</tr>`;
                
                // Chart builder
                let h = sub.total;
                let subName = sub.subject.substring(0, 4).toUpperCase();
                chartBars += `
                <div class="flex flex-col items-center justify-end h-full w-[25px] flex-shrink-0 group">
                    <div class="text-[7px] mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">${h}%</div>
                    <div class="w-full bg-gradient-to-t from-gray-600 to-gray-400 border border-gray-500 shadow-sm transition-all" style="height: ${h}%;"></div>
                    <div class="text-[7px] font-bold mt-1 w-full text-center truncate" title="${sub.subject}">${subName}</div>
                </div>`;
            });

            html += `
            <div class="h-[296mm] border-[1px] border-gray-300 p-[10mm] box-border relative font-sans flex flex-col bg-white print:border-none print:p-0">
                <div class="flex items-center justify-between border-b-2 border-double border-gray-800 pb-2 mb-4">
                    <img src="${schLogo}" class="h-16 w-16 object-contain">
                    <div class="flex-1 text-center">
                        <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ministry of Education</div>
                        <h1 class="text-2xl font-black text-gray-900 tracking-wider m-0 uppercase">${schName}</h1>
                        <p class="text-[10px] text-gray-700 italic font-semibold">MOTTO: ${schMotto}</p>
                    </div>
                </div>
                
                <h2 class="text-center text-[13px] font-extrabold pb-1 mb-4 border-b border-gray-400 tracking-wider">STUDENT TERMLY CONTINUOUS ASSESSMENT RECORD</h2>
                
                <div class="grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-800 mb-4 px-2">
                    <div class="space-y-1">
                        <div>NAME: <span class="font-normal border-b border-dotted border-gray-500 min-w-[150px] inline-block uppercase text-[11px]">${rec.student.name}</span></div>
                        <div>SESSION: <span class="font-normal">${settings.session}</span></div>
                        <div>AVERAGE SCORE: <span class="font-normal text-[12px] text-gray-900">${rec.average}</span></div>
                    </div>
                    <div class="space-y-1">
                        <div>TERM: <span class="font-normal border-b border-dotted border-gray-500 min-w-[100px] inline-block">${termValue}</span></div>
                        <!--<div>CLASS SIZE: <span class="font-normal">45</span></div>-->
                    </div>
                    <div class="space-y-1">
                        <div>CLASS: <span class="font-normal border-b border-dotted border-gray-500 min-w-[100px] inline-block">${clsValue}</span></div>
                        <div>CLASS POSITION: <span class="font-normal text-[12px] text-gray-900">${rec.position}</span></div>
                        <div>TOTAL SCORE: <span class="font-normal font-black text-[12px] text-gray-900">${rec.grandTotal}</span></div>
                    </div>
                </div>

                <div class="text-center font-bold text-[11px] bg-gray-100 border border-gray-400 py-1 uppercase tracking-widest border-b-0">Academic Performance</div>
                <table class="w-full border-collapse text-[10px] mb-2 flex-1">
                    <thead class="bg-gray-100 border-2 border-gray-600">
                        <tr>${chartTh}</tr>
                    </thead>
                    <tbody class="border-2 border-gray-500 font-medium">
                        ${chartTb}
                    </tbody>
                </table>
                
                <div class="text-[8px] font-bold text-gray-700 mb-2 px-1 tracking-tight">
                    Grade Scale: 70-100: A, 60-69: B, 50-59: C, 45-49: D, 40-44: E, 0-39: F
                </div>
                
                <div class="grid grid-cols-2 text-[9px] font-bold text-gray-800 mb-4 px-2">
                    <div>Vacation Date: <span class="font-normal min-w-[100px] border-b border-dotted border-gray-400 inline-block"></span></div>
                    <div>Resumption Date: <span class="font-normal min-w-[100px] border-b border-dotted border-gray-400 inline-block">${settings.resumption}</span></div>
                    <div class="col-span-2 mt-3">Principal: <span class="font-bold border-b border-dotted border-gray-600 inline-block min-w-[200px] uppercase text-[10px] pb-0.5">${settings.principalName}</span></div>
                </div>

                <!-- Performance Chart Component! -->
                <div class="mt-auto border-2 border-gray-400 bg-gray-50 h-[100px] relative rounded shadow-inner p-2 w-full max-w-[80%] mx-auto">
                    <div class="absolute top-1 left-2 font-bold text-[8px] bg-gray-600 text-white px-2 py-0.5 rounded shadow-sm opacity-80">Performance Chart</div>
                    
                    <!-- Y axis lines purely visual -->
                    <div class="absolute inset-0 top-6 bottom-4 flex flex-col justify-between px-2 pt-1 z-[1] select-none text-[6px] text-gray-400">
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">100</span></div>
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">75</span></div>
                        <div class="border-b border-gray-300 w-full relative"><span class="absolute -left-3 -top-1.5">50</span></div>
                        <div class="border-b border-gray-300 w-full absolute bottom-0"><span class="absolute -left-3 -top-1.5">0</span></div>
                    </div>
                    
                    <!-- Graph Plot -->
                    <div class="flex items-end justify-center gap-1.5 h-full pt-[20px] pb-[16px] z-[2] relative overflow-hidden">
                        ${chartBars}
                    </div>
                </div>
                
            </div>
            `;
        
        } else if(tpl === 'comprehensive') {
            
            let compTh = `<th class="p-1 border-[1.5px] border-black text-left w-[20%] text-[10px]">SUBJECTS</th>`;
            rec.structure.components.forEach(c => {
                compTh += `<th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">${c.name.toUpperCase()}</th>`;
            });
            compTh += `
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">TOTAL</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">GRADE</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[10%]">REMARK</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">RANK</th>
                
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">1ST TERM</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">2ND TERM</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">3RD TERM</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">CUM. TOTAL</th>
                <th class="p-1 border-[1.5px] border-black text-center text-[9px] w-[5%]">CUM. AVG</th>
            `;

            let compTb = '';
            rec.subjects.forEach((sub, idx) => {
                // Determine CSS colors for grades (e.g. A is green, D is orange)
                let clr = "text-black";
                if(sub.grade.includes('A')) clr = "text-green-700 font-black";
                else if(sub.grade.includes('B')) clr = "text-green-600 font-bold";
                else if(sub.grade.includes('C')) clr = "text-blue-600 font-bold";
                else if(sub.grade.includes('D')) clr = "text-orange-600 font-bold";
                else if(sub.grade.includes('E') || sub.grade.includes('F')) clr = "text-red-700 font-black";

                let tr = `<td class="p-1 border-[1.5px] border-black font-extrabold text-[9px] uppercase">${sub.subject}</td>`;
                rec.structure.components.forEach(c => {
                    tr += `<td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">${sub.components[c.name] ? sub.components[c.name].score : ''}</td>`;
                });
                tr += `
                    <td class="p-1 border-[1.5px] border-black text-center font-black text-[10px]">${sub.total}</td>
                    <td class="p-1 border-[1.5px] border-black text-center text-[10px] ${clr}">${sub.grade}</td>
                    <td class="p-1 border-[1.5px] border-black text-center text-[8px] uppercase ${clr}">${sub.remark}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">${sub.position}</td>
                    
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px] text-gray-500">-</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px] text-gray-500">-</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">${sub.total}</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">-</td>
                    <td class="p-1 border-[1.5px] border-black text-center font-bold text-[10px]">-</td>
                `;
                compTb += `<tr class="border-b-[1.5px] border-black">${tr}</tr>`;
            });

            html += `
            <div class="h-[296mm] border-none p-[5mm] box-border relative font-sans flex flex-col bg-white overflow-hidden text-black print:m-0 print:p-0">
                <!-- Header Component -->
                <div class="flex items-center justify-between pb-1 mb-2">
                    <img src="${schLogo}" class="h-16 w-16 object-contain self-start">
                    <div class="flex-1 text-center">
                        <h1 class="text-[20px] font-black tracking-wide m-0 text-blue-800 uppercase" style="text-shadow: 1px 1px 0px rgba(0,0,0,0.1); font-family: 'Times New Roman', serif;">${schName}</h1>
                        <p class="text-[10px] font-bold text-blue-900 m-0 leading-tight">${schAddress}</p>
                        <p class="text-[10px] text-blue-900 leading-tight">Tel: ${schContact}</p>
                        <h2 class="text-[15px] font-bold text-red-700 mt-1 uppercase tracking-widest">STUDENT GRADE REPORT</h2>
                    </div>
                </div>
                
                <div class="bg-black text-white text-center font-bold uppercase tracking-widest text-[12px] py-1 mb-1">
                    ${termValue.toUpperCase()} - ${settings.session} ACADEMIC SESSION
                </div>
                
                <table class="w-full border-collapse border-[2px] border-black text-[10px] mb-1 font-bold">
                    <tr>
                        <td class="p-1 border-[1.5px] border-black w-1/2 uppercase">Name of Student: <span class="text-[12px] ml-1">${rec.student.name}</span></td>
                        <td class="p-1 border-[1.5px] border-black w-1/3">ADMISSION NO.: <span class="text-[11px] ml-1">${rec.student.roll}</span></td>
                        <td class="p-1 border-[1.5px] border-black w-1/6">GENDER: <span class="text-[11px] ml-1">-</span></td>
                    </tr>
                    <tr>
                        <td colspan="2" class="p-1 border-[1.5px] border-black uppercase text-[11px]">School Section: <span class="ml-1">SECONDARY</span></td>
                        <td class="p-1 border-[1.5px] border-black uppercase text-[11px]">Class: <span class="ml-1">${clsValue}</span></td>
                    </tr>
                </table>
                
                <div class="bg-black text-white text-center font-bold text-[10px] uppercase tracking-widest py-0.5">ATTENDANCE RECORD</div>
                <table class="w-full border-collapse border-[2px] border-black text-[9px] mb-1 font-bold text-center">
                    <tr class="bg-gray-100">
                        <td class="p-1 border-[1.5px] border-black w-1/5">TIMES SCHOOL OPENED</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">DAYS PRESENT</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">DAYS ABSENT</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">THIS TERM ENDS</td>
                        <td class="p-1 border-[1.5px] border-black w-1/5">NEXT TERM BEGINS</td>
                    </tr>
                    <tr>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">-</td>
                        <td class="p-1 border-[1.5px] border-black">${settings.resumption}</td>
                    </tr>
                </table>

                <div class="bg-black text-white text-center font-bold text-[10px] uppercase tracking-widest py-0.5">ACADEMIC ASSESSMENT</div>
                
                <table class="w-full border-collapse border-[2px] border-black text-[10px] mb-1">
                    <thead class="bg-gray-100">
                        <tr>
                            <td colspan="${rec.structure.components.length + 4}" class="p-1 border-[1.5px] border-black text-center font-bold text-[11px]">TERMLY RESULT</td>
                            <td colspan="5" class="p-1 border-[1.5px] border-black text-center font-bold text-[11px] bg-gray-200">CUMULATIVE RESULT</td>
                        </tr>
                        <tr>${compTh}</tr>
                    </thead>
                    <tbody class="border-[1.5px] border-black">
                        ${compTb}
                    </tbody>
                </table>
                
                <div class="bg-black text-white text-center font-bold text-[9px] uppercase tracking-widest py-0.5">KEYS TO GRADING</div>
                <table class="w-full border-collapse border-[2px] border-black text-[8px] font-bold text-center mb-1">
                    <tr>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-green-700">EXCELLENT:</span><br/>100 - 80 => A</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-green-600">GOOD:</span><br/>79 - 60 => B</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-blue-600">SATISFACTORY:</span><br/>59 - 50 => C</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-orange-600">PASS:</span><br/>49 - 40 => D</td>
                        <td class="p-0.5 border-[1.5px] border-black"><span class="text-red-700">FAIL:</span><br/>39 - 0 => E/F</td>
                    </tr>
                </table>
                
                <div class="flex border-[2px] border-black mb-1">
                    <div class="flex-1 flex flex-col">
                        <div class="bg-black text-white text-center font-bold text-[9px] uppercase tracking-widest py-0.5 border-b-[2px] border-black">TERMLY RESULT SUMMARY</div>
                        <div class="flex flex-1 items-center">
                            <div class="w-1/2 p-2 border-r-[1.5px] border-black flex flex-col justify-center h-full">
                                <div class="text-[9px]">TOTAL SCORE: <span class="font-black text-[12px] ml-1">${rec.grandTotal}</span></div>
                                <div class="text-[9px] mt-1">PERCENTAGE AVG: <span class="font-black text-[12px] ml-1">${rec.average}%</span></div>
                            </div>
                            <div class="w-1/2 p-2 text-center text-[11px] font-semibold">
                                RANK THIS TERM:<br/><span class="font-black text-[14px]">${rec.position}</span>
                            </div>
                        </div>
                    </div>
                    <div class="w-[25%] flex flex-col border-l-[2px] border-black">
                        <div class="flex-1 p-2 text-center flex flex-col justify-center">
                            <span class="font-bold text-[10px]">CUMULATIVE RESULT STATUS:</span>
                            <span class="font-black text-[16px] text-green-700 mt-1 uppercase tracking-wider">PROMOTED</span>
                        </div>
                    </div>
                </div>

                <div class="flex border-[2px] border-black mb-1 h-[80px]">
                    <div class="flex-1 border-r-[2px] border-black flex flex-col">
                        <div class="bg-black text-white text-center font-bold text-[9px] uppercase py-0.5">EXTRACURRICULAR / AFFECTIVE</div>
                        <div class="p-2 text-[9px] grid grid-cols-2 gap-x-4 gap-y-1">
                            ${leftRows.replace(/<td class="p-0.5">/g, '<td class="p-0.5 uppercase tracking-tight text-gray-700">').replace(/w-\[25px\]/g, 'text-black')}
                        </div>
                    </div>
                    <div class="w-[45%] flex flex-col text-[8.5px] font-bold bg-green-50/20">
                        <div class="bg-black text-white text-center font-bold text-[9px] uppercase py-0.5 border-b-[2px] border-black">CUMULATIVE PASSING CRITERIA</div>
                        <div class="p-2 h-full flex justify-center flex-col">
                            <div>MUST PASS ANY OF THE COMPULSORY SUBJECTS:</div>
                            <div class="pl-2 mt-1">1. MATHEMATICS => <span class="text-green-700 font-extrabold">YOU PASSED.</span></div>
                            <div class="pl-2">2. ENGLISH LANGUAGE => <span class="text-green-700 font-extrabold">YOU PASSED.</span></div>
                            <div class="mt-2 tracking-wide border-t border-gray-400 pt-1">PASS PERCENTAGE => 50%. <span class="text-green-700 font-extrabold ml-1">YOU GOT => ${rec.average}%</span></div>
                        </div>
                    </div>
                </div>

                <div class="flex-1 border-[2px] border-black flex flex-col">
                    <div class="bg-black text-white text-center font-bold text-[9px] uppercase py-0.5 border-b-[2px] border-black">FORM TEACHER'S COMMENT</div>
                    <div class="p-2 text-[10px] italic flex-1 relative">
                        ${evals.remark}
                        
                        <div class="absolute bottom-2 left-10 text-center">
                            ${headSignHtml}
                            <div class="border-t border-black font-bold text-[9px] uppercase pt-0.5 w-[150px] mx-auto">${settings.headteacherName}</div>
                            <div class="text-[8px] text-gray-600">CLASS TEACHER</div>
                        </div>
                        <div class="absolute bottom-2 right-10 text-center">
                            ${prinSignHtml}
                            <div class="border-t border-black font-bold text-[9px] uppercase pt-0.5 w-[150px] mx-auto">${settings.principalName}</div>
                            <div class="text-[8px] text-gray-600">PRINCIPAL</div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        } else if(tpl === 'minimalist') {
            html += `
            <div class="text-center mb-6">
                <h1 class="text-xl font-black uppercase tracking-widest text-gray-900 mb-1">${schName}</h1>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-300 pb-2 inline-block">${schAddress}</p>
                <div class="mt-2 text-xs font-bold uppercase tracking-widest text-gray-800">Termly Progress Report</div>
            </div>
            <div class="flex justify-between items-end border-b-2 border-gray-900 pb-2 mb-4 text-[11px] font-medium text-gray-800">
                <div>
                    <div><span class="text-gray-500 w-16 inline-block">Name:</span> <b>${rec.student.name}</b></div>
                    <div><span class="text-gray-500 w-16 inline-block">Class:</span> <b>${clsValue}</b></div>
                </div>
                <div class="text-right">
                    <div><span class="text-gray-500">Term:</span> <b>${termValue}</b></div>
                    <div><span class="text-gray-500">Avg / Pos:</span> <b class="text-lg">${rec.average}%</b> / <b>${rec.position}</b></div>
                </div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="border-b-2 border-gray-900 text-[10px]"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="font-bold text-xs border-t-2 border-gray-900"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right">OVERALL TOTAL:</td><td class="p-1.5 text-center">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        } else if(tpl === 'corporate') {
            html += `
            <div class="flex justify-between items-center border-b-4 border-gray-800 pb-4 mb-4">
                <img src="${schLogo}" class="h-16 object-contain">
                <div class="text-right">
                    <h1 class="text-2xl font-serif font-bold text-gray-900 m-0">${schName}</h1>
                    <p class="text-xs text-gray-600 m-0">${schAddress}</p>
                    <p class="text-[10px] text-gray-500 italic mt-1 font-serif">"${schMotto}"</p>
                </div>
            </div>
            <div class="bg-gray-100 border border-gray-300 p-2 mb-4 text-center font-bold text-sm tracking-widest uppercase">Termly Result Statement</div>
            <table class="w-full mb-4 text-[11px] border border-gray-300">
                <tr class="border-b border-gray-300"><td class="p-1.5 bg-gray-50 font-bold w-1/6 border-r border-gray-300">Student Name</td><td class="p-1.5 w-2/6 border-r border-gray-300">${rec.student.name}</td><td class="p-1.5 bg-gray-50 font-bold w-1/6 border-r border-gray-300">Admission No</td><td class="p-1.5">${rec.student.roll}</td></tr>
                <tr class="border-b border-gray-300"><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Class & Term</td><td class="p-1.5 border-r border-gray-300">${clsValue} - ${termValue}</td><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Academic Session</td><td class="p-1.5">${settings.session}</td></tr>
                <tr><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Average Score</td><td class="p-1.5 border-r border-gray-300 text-primary-700 font-bold">${rec.average}%</td><td class="p-1.5 bg-gray-50 font-bold border-r border-gray-300">Class Position</td><td class="p-1.5 font-bold">${rec.position}</td></tr>
            </table>
            <table class="w-full border-collapse mb-4 border border-gray-300"><thead class="bg-gray-800 text-white text-[10px]"><tr>${thHtml.replace(/border-slate-300/g, 'border-gray-700')}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="bg-gray-200 font-bold text-xs border-t-2 border-gray-400"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right">OVERALL TOTAL:</td><td class="p-1.5 text-center">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        } else if(tpl === 'elegant') {
            html += `
            <div class="text-center mb-6">
                <img src="${schLogo}" class="h-12 w-12 object-contain mx-auto mb-2 mix-blend-multiply">
                <h1 class="text-2xl font-serif text-primary-900 m-0 leading-tight">${schName}</h1>
                <p class="text-[11px] text-gray-600 italic font-serif mt-1 border-b border-gray-200 inline-block pb-1">${schMotto}</p>
            </div>
            <div class="text-center mb-4"><span class="text-[10px] uppercase font-bold tracking-widest text-primary-700 border-y border-primary-200 py-1 px-8 inline-block">Termly Assessment Report</span></div>
            <div class="flex justify-between items-end mb-4 text-xs font-serif text-gray-800 px-4">
                <div class="space-y-1">
                    <div><span class="text-gray-500">Student:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${rec.student.name}</span></div>
                    <div><span class="text-gray-500">Class:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${clsValue}</span></div>
                </div>
                <div class="text-right space-y-1">
                    <div><span class="text-gray-500">Session/Term:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5">${settings.session} - ${termValue}</span></div>
                    <div><span class="text-gray-500">Average | Pos:</span> <span class="font-bold border-b border-dotted border-gray-400 pb-0.5 text-primary-700">${rec.average}% | ${rec.position}</span></div>
                </div>
            </div>
            <table class="w-full border-collapse mb-4"><thead class="bg-primary-50/50 text-[10px] text-primary-800 border-t border-b border-primary-200"><tr>${thHtml.replace(/border-slate-300/g, 'border-primary-100')}</tr></thead><tbody class="font-serif">${tbodyHtml.replace(/border border-slate-300/g, 'border-b border-dashed border-gray-200')}</tbody><tfoot class="font-bold text-xs border-t border-primary-200 bg-primary-50/30"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 text-right font-serif">OVERALL TOTAL:</td><td class="p-1.5 text-center text-primary-800">${rec.grandTotal}</td><td colspan="5"></td></tr></tfoot></table>
            `;
        } else {
            // CLASSIC (Fallback & Original structure)
            html += `
            <div class="flex items-center justify-between border-b-2 border-primary-900 pb-[10px] mb-[15px]">
                <img src="${schLogo}" class="h-[60px] object-contain">
                <div class="text-center">
                    <h1 class="text-primary-900 text-2xl font-black m-0 uppercase">${schName}</h1>
                    <p class="m-0 text-[11px] text-gray-600">${schAddress}</p>
                    <p class="m-0 text-[11px] text-gray-600">${schContact}</p>
                    <p class="m-0 text-[10px] text-gray-500 italic mt-0.5">Motto: ${schMotto}</p>
                </div>
                <div class="w-[60px] h-[75px] border border-gray-300 flex items-center justify-center bg-gray-100 text-[10px] text-gray-400 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=${rec.student.name}&background=1e3a8a&color=fff" class="w-full h-full object-cover">
                </div>
            </div>
            <div class="text-center mb-[15px]">
                <h2 class="text-[15px] font-extrabold underline m-0 p-1 bg-primary-900 text-white inline-block uppercase">TERMLY STUDENT PROGRESS REPORT</h2>
            </div>
            <table class="w-full border-collapse mb-[15px] text-[11px]">
                <tr>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300 w-[15%]">Student Name:</td>
                    <td class="py-1 px-2 border border-slate-300 w-[35%]">${rec.student.name}</td>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300 w-[15%]">Admission No:</td>
                    <td class="py-1 px-2 border border-slate-300 w-[35%]">ADM-${rec.student.roll}</td>
                </tr>
                <tr>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Class:</td>
                    <td class="py-1 px-2 border border-slate-300">${clsValue}</td>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Academic Session:</td>
                    <td class="py-1 px-2 border border-slate-300">${settings.session}</td>
                </tr>
                <tr>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Term:</td>
                    <td class="py-1 px-2 border border-slate-300">${termValue}</td>
                    <td class="py-1 px-2 font-bold bg-slate-50 border border-slate-300">Avg | Position:</td>
                    <td class="py-1 px-2 border border-slate-300 text-red-700 font-black">${rec.average}% | ${rec.position}</td>
                </tr>
            </table>
            <table class="w-full border-collapse mb-[10px]"><thead class="bg-slate-100 text-[10px]"><tr>${thHtml}</tr></thead><tbody>${tbodyHtml}</tbody><tfoot class="bg-slate-200 font-bold text-xs"><tr><td colspan="${rec.structure.components.length + 1}" class="p-1.5 border border-slate-300 text-right">OVERALL TOTAL:</td><td class="p-1.5 border border-slate-300 text-center text-primary-900">${rec.grandTotal}</td><td colspan="5" class="border border-slate-300"></td></tr></tfoot></table>
            `;
        }

        // SHARED FOOTER
        html += `
            <div class="flex gap-[15px] mt-auto">
                <div class="flex-1">
                    <table class="w-full border-collapse text-[10px] border border-slate-300">
                        <thead class="bg-primary-900 text-white"><tr><th colspan="2" class="p-1 text-left">AFFECTIVE & PSYCHOMOTOR</th></tr></thead>
                        <tbody>
                            <tr>
                                <td class="p-0.5 border-r border-slate-300 align-top w-1/2"><table class="w-full border-collapse">${leftRows}</table></td>
                                <td class="p-0.5 align-top w-1/2"><table class="w-full border-collapse">${rightRows}</table></td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="text-[8px] text-slate-500 mt-1 text-center font-medium">Scale: 5 (Excellent), 4 (Good), 3 (Fair), 2 (Poor), 1 (Very Poor)</div>
                </div>

                <div class="flex-[2] border border-slate-300 p-2.5 bg-slate-50 text-[11px] flex flex-col">
                    <div class="border-b border-dashed border-slate-300 pb-2 mb-auto min-h-[40px]">
                        <span class="font-bold">Teacher's Remark:</span> ${evals.remark}
                    </div>
                    
                    <div class="flex justify-between items-end mt-2.5">
                        <div class="text-center">
                            ${headSignHtml}
                            <div class="border-t border-black w-[100px] pt-1">
                                <b class="text-[10px]">${settings.headteacherName}</b><br><span class="text-[9px]">Head Teacher</span>
                            </div>
                        </div>
                        <div class="text-center text-red-700 font-bold text-[10px] bg-red-100 p-1 px-2 rounded">
                            Resumption: <br/>${settings.resumption}
                        </div>
                        <div class="text-center">
                            ${prinSignHtml}
                            <div class="border-t border-black w-[100px] pt-1">
                                <b class="text-[10px]">${settings.principalName}</b><br><span class="text-[9px]">Principal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="absolute inset-0 bg-center bg-no-repeat opacity-[0.03] pointer-events-none -z-10" style="background-image: url('${schLogo}');"></div>
        </div>
        `;
        return html;
    }

    // Bind Form
    setTimeout(() => {
        loadSettings();
        const form = document.getElementById('resultSettingsForm');
        if(form) form.addEventListener('submit', saveSettings);
    }, 100);

})();
