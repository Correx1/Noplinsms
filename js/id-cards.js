// ID Cards Module — table view, settings-aware school name/logo
(function() {
    const CLASSES = ['JSS1A','JSS1B','JSS2A','JSS2B','JSS3A','JSS3B','SSS1A','SSS1B','SSS2A','SSS2B','SSS3A','SSS3B'];
    const FIRST_NAMES = ['Ada','Emeka','Chidi','Ngozi','Yemi','Tunde','Fatima','Ibrahim','Amara','Kelechi','Zainab','Seun','Biodun','Chiamaka','Okoro'];
    const LAST_NAMES = ['Okafor','Adeyemi','Nwachukwu','Bello','Eze','Adeleke','Musa','Ajibade','Okonkwo','Abubakar','Oluwole','Ihejirika','Osei','Afolabi','Nduka'];
    const PHOTOS = ['👧','👦','👩','👨','🧒'];

    function getStudents() {
        let sts = JSON.parse(localStorage.getItem('sms_students') || '[]');
        if (sts.length === 0) {
            let id = 1;
            CLASSES.forEach(cls => {
                const count = 15 + Math.floor(Math.random() * 10);
                for (let i = 0; i < count; i++) {
                    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
                    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
                    sts.push({
                        id: `STU${String(id).padStart(4,'0')}`,
                        name: `${fn} ${ln}`,
                        className: cls,
                        session: '2024/2025',
                        dob: `${2005+Math.floor(Math.random()*5)}-${String(Math.ceil(Math.random()*12)).padStart(2,'0')}-${String(1+Math.floor(Math.random()*27)).padStart(2,'0')}`,
                        gender: Math.random() > 0.5 ? 'Male' : 'Female',
                        bloodGroup: ['A+','B+','O+','AB+','A-','O-'][Math.floor(Math.random()*6)],
                        emoji: PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
                        phone: `080${String(Math.floor(Math.random()*9e7+1e7))}`
                    });
                    id++;
                }
            });
            localStorage.setItem('sms_students', JSON.stringify(sts));
        }
        return sts;
    }

    function getSchoolInfo() {
        const p = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');
        return {
            name:    p.name    || p['school-name']    || 'No School',
            address: p.address || p['school-address'] || '',
            phone:   p.phone   || p['school-phone']   || '',
            logo:    p.logo    || ''  // base64 or URL
        };
    }

    // ── Card HTML (used for print & preview) ──────────────────────────────
    function buildCardHtml(s, school) {
        const logoHtml = school.logo
            ? `<img src="${school.logo}" style="height:32px;width:auto;object-fit:contain;" alt="logo">`
            : `<div style="width:32px;height:32px;border-radius:50%;background:#1e3a8a;display:flex;align-items:center;justify-content:center;color:#fde047;font-weight:bold;font-size:14px;">${(school.name||'N')[0]}</div>`;
        return `
        <div style="width:320px;border-radius:12px;overflow:hidden;border:2px solid #1e3a8a;font-family:Arial,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.15);display:inline-block;vertical-align:top;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:10px 12px;display:flex;align-items:center;gap:10px;">
                ${logoHtml}
                <div style="flex:1;text-align:center;">
                    <div style="color:#fde047;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:.8px;">${school.name}</div>
                    <div style="color:#bfdbfe;font-size:8.5px;">${school.address}</div>
                </div>
                <div style="background:#fde047;color:#1e3a8a;font-size:8px;font-weight:bold;padding:2px 5px;border-radius:4px;">STUDENT</div>
            </div>
            <!-- Body -->
            <div style="background:#fff;display:flex;gap:10px;padding:10px 12px;">
                <!-- Photo -->
                <div style="width:60px;height:72px;background:#eff6ff;border:2px solid #bfdbfe;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0;">
                    ${s.photo ? `<img src="${s.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : s.emoji||'👤'}
                </div>
                <!-- Info -->
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:bold;font-size:11px;color:#111;margin-bottom:1px;line-height:1.3;">${s.name}</div>
                    <div style="color:#2563eb;font-size:9px;font-weight:700;margin-bottom:5px;">${s.id}</div>
                    <table style="font-size:8.5px;color:#444;border-collapse:collapse;width:100%;">
                        <tr><td style="padding:1px 0;color:#999;width:50px;">Class</td><td style="font-weight:600;color:#111;">${s.className}</td></tr>
                        <tr><td style="padding:1px 0;color:#999;">DOB</td><td style="font-weight:600;color:#111;">${s.dob}</td></tr>
                        <tr><td style="padding:1px 0;color:#999;">Gender</td><td style="font-weight:600;color:#111;">${s.gender||'—'}</td></tr>
                        <tr><td style="padding:1px 0;color:#999;">Blood</td><td style="font-weight:600;color:#111;">${s.bloodGroup||'—'}</td></tr>
                        <tr><td style="padding:1px 0;color:#999;">Session</td><td style="font-weight:600;color:#111;">${s.session}</td></tr>
                    </table>
                </div>
            </div>
            <!-- Barcode strip -->
            <div style="background:#f8fafc;border-top:1px dashed #e2e8f0;padding:4px 12px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-family:monospace;font-size:8px;letter-spacing:2px;color:#94a3b8;">||||| ${s.id} |||||</span>
                <span style="font-size:7px;color:#94a3b8;">Valid 1 Year</span>
            </div>
            <!-- Footer -->
            <div style="background:linear-gradient(90deg,#1e3a5f,#2563eb);padding:4px;text-align:center;">
                <span style="color:#bfdbfe;font-size:7.5px;">${school.phone ? '☎ '+school.phone : 'STUDENT IDENTITY CARD'}</span>
            </div>
        </div>`;
    }

    const allStudents = getStudents();
    let filtered = [...allStudents];
    let selected = new Set();
    let _previewStudent = null;

    // ── Table row ─────────────────────────────────────────────────────────
    function buildRow(s) {
        const isChecked = selected.has(s.id);
        return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${isChecked ? 'bg-primary-50 dark:bg-primary-900/20' : ''}">
            <td class="px-4 py-3">
                <input type="checkbox" onchange="window.idCardApp.toggle('${s.id}',this.checked)" ${isChecked?'checked':''} class="rounded w-4 h-4 cursor-pointer">
            </td>
            <td class="px-4 py-3">
                <div class="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-lg">${s.emoji||'👤'}</div>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-primary-700 dark:text-primary-400 font-semibold">${s.id}</td>
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${s.name}</td>
            <td class="px-4 py-3"><span class="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-semibold">${s.className}</span></td>
            <td class="px-4 py-3 text-sm">${s.gender||'—'}</td>
            <td class="px-4 py-3 text-sm">${s.dob}</td>
            <td class="px-4 py-3"><span class="text-xs font-bold text-red-600 dark:text-red-400">${s.bloodGroup||'—'}</span></td>
            <td class="px-4 py-3 text-xs text-gray-500">${s.session}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="window.idCardApp.preview('${s.id}')" class="text-xs px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 rounded hover:bg-primary-100 mr-1" title="Preview ID Card">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="window.idCardApp.printOne('${s.id}')" class="text-xs px-2.5 py-1 bg-gray-700 text-white rounded hover:bg-gray-800" title="Print this card">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        </tr>`;
    }

    function render() {
        const tbody = document.getElementById('idc-tbody');
        const countEl = document.getElementById('idc-count');
        const selEl = document.getElementById('idc-selected');
        if (countEl) countEl.textContent = filtered.length;
        if (selEl) selEl.textContent = selected.size;
        if (!tbody) return;
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="px-4 py-16 text-center text-gray-400"><i class="fas fa-id-card text-4xl mb-3 block opacity-20"></i>No students found.</td></tr>';
            return;
        }
        tbody.innerHTML = filtered.map(s => buildRow(s)).join('');
        // Sync header checkbox
        const hdr = document.getElementById('idc-check-all');
        if (hdr) hdr.checked = filtered.length > 0 && filtered.every(s => selected.has(s.id));
    }

    function printCards(students) {
        const school = getSchoolInfo();
        const cardsHtml = students.map(s => buildCardHtml(s, school)).join('<div style="display:inline-block;width:8mm;"></div>');
        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(`<!DOCTYPE html><html><head><title>ID Cards — ${school.name}</title>
            <style>
                body{background:#e5e7eb;padding:10mm;font-family:Arial,sans-serif;}
                @media print{body{background:#fff;padding:5mm;}@page{margin:5mm;}}
            </style></head>
            <body>${cardsHtml}</body></html>`);
        win.document.close();
        setTimeout(() => win.print(), 500);
    }

    window.idCardApp = {
        filter() {
            const cls = document.getElementById('idc-filter-class')?.value || '';
            const q = (document.getElementById('idc-search')?.value || '').toLowerCase();
            filtered = allStudents.filter(s =>
                (!cls || s.className === cls) &&
                (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
            );
            render();
        },
        toggle(id, checked) {
            if (checked) selected.add(id); else selected.delete(id);
            // Update count only (no full re-render for performance)
            const selEl = document.getElementById('idc-selected');
            if (selEl) selEl.textContent = selected.size;
            const hdr = document.getElementById('idc-check-all');
            if (hdr) hdr.checked = filtered.length > 0 && filtered.every(s => selected.has(s.id));
        },
        toggleAll(checked) {
            if (checked) filtered.forEach(s => selected.add(s.id));
            else filtered.forEach(s => selected.delete(s.id));
            render();
        },
        selectAll() { filtered.forEach(s => selected.add(s.id)); render(); },
        clearAll() { selected.clear(); render(); },
        preview(id) {
            const s = allStudents.find(x => x.id === id); if (!s) return;
            _previewStudent = s;
            const school = getSchoolInfo();
            document.getElementById('idc-preview-card').innerHTML = buildCardHtml(s, school);
            document.getElementById('idc-preview-modal').classList.remove('hidden');
        },
        printPreview() {
            if (_previewStudent) printCards([_previewStudent]);
        },
        printOne(id) {
            const s = allStudents.find(x => x.id === id); if (!s) return;
            printCards([s]);
        },
        generateSelected() {
            const toPrint = filtered.filter(s => selected.has(s.id));
            if (toPrint.length === 0) { alert('Select at least one student to generate cards for.'); return; }
            // Show previews of selected in a print window
            printCards(toPrint);
        },
        printSelected() {
            const toPrint = filtered.filter(s => selected.has(s.id));
            if (toPrint.length === 0) { alert('Select at least one student card to print.'); return; }
            printCards(toPrint);
        }
    };

    render();
})();
