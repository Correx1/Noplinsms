// Hostel Module Logic
(function() {
    console.log('Hostel Script Loaded');

    let hostels = [];
    let rooms = [];
    let allocations = [];
    let attendance = [];

    // Page Detection
    const isHostelsPage = document.getElementById('hostel-add-hostel-form');
    const isRoomsPage = document.getElementById('hostel-add-room-form');
    const isAllocPage = document.getElementById('hostel-alloc-form');
    const isAttPage = document.getElementById('hostel-att-table-body');

    init();

    async function init() {
        await loadData();

        if (isHostelsPage) setupHostels();
        if (isRoomsPage) setupRooms();
        if (isAllocPage) setupAllocations();
        if (isAttPage) setupAttendance();
    }

    async function loadData() {
        try {
            // Hostels
            const hRes = await fetch('../../data/hostel-buildings.json');
            hostels = JSON.parse(localStorage.getItem('hostel_buildings')) || await hRes.json();
            if(!localStorage.getItem('hostel_buildings')) localStorage.setItem('hostel_buildings', JSON.stringify(hostels));

            // Rooms
            const rRes = await fetch('../../data/hostel-rooms.json');
            rooms = JSON.parse(localStorage.getItem('hostel_rooms')) || await rRes.json();
            if(!localStorage.getItem('hostel_rooms')) localStorage.setItem('hostel_rooms', JSON.stringify(rooms));

            // Allocations
            const aRes = await fetch('../../data/hostel-allocations.json');
            allocations = JSON.parse(localStorage.getItem('hostel_allocations')) || await aRes.json();
             if(!localStorage.getItem('hostel_allocations')) localStorage.setItem('hostel_allocations', JSON.stringify(allocations));
            
             // Attendance
            const attRes = await fetch('../../data/hostel-attendance.json');
            attendance = JSON.parse(localStorage.getItem('hostel_attendance')) || await attRes.json();
            if(!localStorage.getItem('hostel_attendance')) localStorage.setItem('hostel_attendance', JSON.stringify(attendance));

        } catch(e) { console.error('Hostel Data Error', e); }
    }

    function saveData() {
        localStorage.setItem('hostel_buildings', JSON.stringify(hostels));
        localStorage.setItem('hostel_rooms', JSON.stringify(rooms));
        localStorage.setItem('hostel_allocations', JSON.stringify(allocations));
        localStorage.setItem('hostel_attendance', JSON.stringify(attendance));
    }

    // --- HOSTELS ---
    function setupHostels() {
        const tbody = document.getElementById('hostel-buildings-table-body');
        const form = document.getElementById('hostel-add-hostel-form');

        renderTable();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = {
                id: 'H' + Date.now(),
                name: document.getElementById('h-name').value,
                type: document.getElementById('h-type').value,
                rooms: document.getElementById('h-rooms').value,
                warden: document.getElementById('h-warden').value,
                contact: null,
                address: document.getElementById('h-address').value
            };
            hostels.push(newItem);
            saveData();
            form.reset();
            renderTable();
            alert('Hostel Added');
        });

        function renderTable() {
            tbody.innerHTML = '';
            hostels.forEach(h => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${h.name}</td>
                    <td class="px-6 py-4">${h.type}</td>
                    <td class="px-6 py-4">${h.rooms}</td>
                    <td class="px-6 py-4">${h.warden}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteHostel('${h.id}')" class="text-red-600 hover:underline">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        window.deleteHostel = (id) => {
            if(confirm('Delete Hostel?')) { hostels = hostels.filter(x => x.id !== id); saveData(); renderTable(); }
        }
    }

    // --- ROOMS ---
    function setupRooms() {
        const tbody = document.getElementById('hostel-rooms-table-body');
        const form = document.getElementById('hostel-add-room-form');
        const hSelect = document.getElementById('rm-hostel');

        hostels.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h.id;
            opt.textContent = h.name;
            hSelect.appendChild(opt);
        });

        renderTable();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const hId = document.getElementById('rm-hostel').value;
            const h = hostels.find(x => x.id === hId);
            
            const newItem = {
                id: 'R' + Date.now(),
                hostelId: hId,
                hostelName: h ? h.name : 'Unknown',
                number: document.getElementById('rm-number').value,
                type: document.getElementById('rm-type').value,
                capacity: parseInt(document.getElementById('rm-capacity').value),
                occupied: 0,
                rent: document.getElementById('rm-rent').value,
                facilities: document.getElementById('rm-facilities').value,
                status: 'Available'
            };
            rooms.push(newItem);
            saveData();
            form.reset();
            renderTable();
            alert('Room Added');
        });

        function renderTable() {
            tbody.innerHTML = '';
            rooms.forEach(r => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        Room ${r.number}
                        <div class="text-xs text-gray-500">${r.type}</div>
                    </td>
                    <td class="px-6 py-4">${r.hostelName}</td>
                    <td class="px-6 py-4">
                        ${r.occupied} / ${r.capacity}
                        <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1">
                             <div class="bg-primary-600 h-1.5 rounded-full" style="width: ${(r.occupied/r.capacity)*100}%"></div>
                        </div>
                    </td>
                    <td class="px-6 py-4">N${parseInt(r.rent).toLocaleString()}</td>
                    <td class="px-6 py-4">${r.status}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteRoom('${r.id}')" class="text-red-600 hover:underline">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        window.deleteRoom = (id) => {
            if(confirm('Delete Room?')) { rooms = rooms.filter(x => x.id !== id); saveData(); renderTable(); }
        }
    }

    // --- ALLOCATIONS ---
    function setupAllocations() {
        const tbody = document.getElementById('hostel-alloc-table-body');
        const form = document.getElementById('hostel-alloc-form');
        const hSelect = document.getElementById('alloc-hostel');
        const rSelect = document.getElementById('alloc-room');

        // Populate Hostels
        hostels.forEach(h => {
             const opt = document.createElement('option');
            opt.value = h.id;
            opt.textContent = h.name;
            hSelect.appendChild(opt);
        });

        // Update Rooms on Hostel Change
        hSelect.addEventListener('change', () => {
             rSelect.innerHTML = '<option value="">Select Room...</option>';
             const filtered = rooms.filter(r => r.hostelId === hSelect.value && r.occupied < r.capacity);
             filtered.forEach(r => {
                 const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = `Room ${r.number} (${r.capacity - r.occupied} avail)`;
                rSelect.appendChild(opt);
             });
        });

        renderTable();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const rId = rSelect.value;
            const room = rooms.find(x => x.id === rId);
            
            if(!room || room.occupied >= room.capacity) { alert('Room Full'); return; }

            room.occupied++;
            if(room.occupied >= room.capacity) room.status = 'Full';

            const newItem = {
                id: 'ALL' + Date.now(),
                studentName: document.getElementById('alloc-student').value,
                hostelId: hSelect.value,
                roomId: rId,
                roomNo: room.number,
                checkIn: document.getElementById('alloc-date').value
            };
            allocations.push(newItem);
            saveData();
            form.reset();
            renderTable();
            alert('Allocated');
        });

        function renderTable() {
            tbody.innerHTML = '';
            allocations.forEach(a => {
                const hostel = hostels.find(h => h.id === a.hostelId);
                const hName = hostel ? hostel.name : 'Unknown';
                
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${a.studentName}</td>
                    <td class="px-6 py-4">${hName}</td>
                    <td class="px-6 py-4">Room ${a.roomNo}</td>
                    <td class="px-6 py-4">${a.checkIn}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="vacateRoom('${a.id}')" class="text-red-600 hover:underline">Vacate</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        window.vacateRoom = (id) => {
            if(confirm('Vacate Room?')) {
                const alloc = allocations.find(x => x.id === id);
                if(alloc) {
                    const room = rooms.find(r => r.id === alloc.roomId);
                    if(room) { room.occupied--; room.status = 'Available'; }
                    allocations = allocations.filter(x => x.id !== id);
                    saveData();
                    renderTable();
                }
            }
        };
    }


    // --- ATTENDANCE ---
    function setupAttendance() {
        const SESSIONS_KEY = 'sms_hostel_att_sessions';
        const tbody   = document.getElementById('hostel-att-table-body');
        const form    = document.getElementById('hostel-att-filter-form');
        const dateInp = document.getElementById('hostel-att-date');
        const hSelect = document.getElementById('hostel-att-hostel');

        let currentDate = new Date().toISOString().split('T')[0];
        if (dateInp) dateInp.value = currentDate;

        // Populate hostel filter
        if (hSelect) {
            hostels.forEach(h => {
                const opt = document.createElement('option');
                opt.value = h.id; opt.textContent = h.name;
                hSelect.appendChild(opt);
            });
        }

        // ── Session helpers ──
        function getSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}'); } catch(e) { return {}; } }
        function saveSessions(s) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)); }
        function sk(date, id) { return `${date}_${id}`; }

        function computeStatus(tIn, tOut, override) {
            if (override === 'Absent') return 'Absent';
            if (override === 'Leave')  return 'Leave';
            if (!tIn) return 'Absent';
            if (tOut) return 'Checked Out';
            return 'Checked In';
        }
        function badge(status) {
            const map = { 'Checked In': 'bg-green-100 text-green-700', 'Checked Out': 'bg-blue-100 text-blue-700', 'Absent': 'bg-red-100 text-red-700', 'Leave': 'bg-purple-100 text-purple-700' };
            return `<span class="px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-600'}">${status}</span>`;
        }
        function applyColor(row, status) {
            row.classList.remove('bg-green-50','bg-blue-50','bg-red-50','bg-purple-50','dark:bg-green-900/10','dark:bg-blue-900/10','dark:bg-red-900/10','dark:bg-purple-900/10');
            if (status === 'Checked In')  row.classList.add('bg-green-50',  'dark:bg-green-900/10');
            if (status === 'Checked Out') row.classList.add('bg-blue-50',   'dark:bg-blue-900/10');
            if (status === 'Absent')      row.classList.add('bg-red-50',    'dark:bg-red-900/10');
            if (status === 'Leave')       row.classList.add('bg-purple-50', 'dark:bg-purple-900/10');
        }

        // ── Row builder (read-only times, checkbox) ──
        function buildRow(a) {
            const sessions  = getSessions();
            const session   = sessions[sk(currentDate, a.id)] || { timeIn: '', timeOut: '', override: '' };
            const override  = session.override || '';
            const status    = computeStatus(session.timeIn, session.timeOut, override);
            const hostelObj = hostels.find(h => h.id === a.hostelId);
            const hName     = hostelObj ? hostelObj.name : (a.hostelName || 'N/A');

            const tr = document.createElement('tr');
            tr.id = `hostel-row-${a.id}`;
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 transition-colors cursor-pointer';
            tr.innerHTML = `
                <td class="px-4 py-3" onclick="event.stopPropagation()">
                    <input type="checkbox" class="hostel-row-check w-4 h-4 text-primary-600 rounded cursor-pointer"
                        data-id="${a.id}" onchange="window._onHostelCheckChange()">
                </td>
                <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">${a.studentName}</td>
                <td class="px-4 py-3 text-xs text-gray-500">Room ${a.roomNo}</td>
                <td class="px-4 py-3 text-xs text-gray-500">${hName}</td>
                <td class="px-4 py-3 text-center">
                    <span id="hin-${a.id}" class="text-sm font-mono font-bold ${session.timeIn ? 'text-green-600' : 'text-gray-300 dark:text-gray-600'}">${session.timeIn || '—'}</span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span id="hout-${a.id}" class="text-sm font-mono font-bold ${session.timeOut ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'}">${session.timeOut || '—'}</span>
                </td>
                <td class="px-4 py-3 text-center" id="hstatus-${a.id}">${badge(status)}</td>
                <td class="px-4 py-3">
                    <input type="text" id="hremark-${a.id}" value="${session.remark || ''}"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Remarks..." onclick="event.stopPropagation()">
                </td>
            `;
            tr.addEventListener('click', () => {
                const cb = tr.querySelector('.hostel-row-check');
                if (cb) { cb.checked = !cb.checked; window._onHostelCheckChange(); }
            });
            applyColor(tr, status);
            return tr;
        }

        // ── Update a single row ──
        function updateRowDisplay(id, session) {
            const status  = computeStatus(session.timeIn, session.timeOut, session.override || '');
            const inEl    = document.getElementById(`hin-${id}`);
            const outEl   = document.getElementById(`hout-${id}`);
            const statEl  = document.getElementById(`hstatus-${id}`);
            const row     = document.getElementById(`hostel-row-${id}`);
            if (inEl)   { inEl.textContent = session.timeIn || '—'; inEl.className = `text-sm font-mono font-bold ${session.timeIn ? 'text-green-600' : 'text-gray-300 dark:text-gray-600'}`; }
            if (outEl)  { outEl.textContent = session.timeOut || '—'; outEl.className = `text-sm font-mono font-bold ${session.timeOut ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'}`; }
            if (statEl) statEl.innerHTML = badge(status);
            if (row)    applyColor(row, status);
        }

        // ── Checkbox helpers ──
        window._onHostelCheckChange = function() {
            const ids    = [...document.querySelectorAll('.hostel-row-check:checked')].map(c => c.dataset.id);
            const count  = ids.length;
            const selBar = document.getElementById('hostel-selection-bar');
            const cntEl  = document.getElementById('hostel-selected-count');
            const allCb  = document.getElementById('select-all-hostel');
            if (selBar) selBar.classList.toggle('hidden', count === 0);
            if (cntEl)  cntEl.textContent = count;
            if (allCb) { const total = document.querySelectorAll('.hostel-row-check').length; allCb.checked = count === total && total > 0; allCb.indeterminate = count > 0 && count < total; }
            const noticeEl = document.getElementById('hostel-no-selection-notice');
            if (noticeEl) noticeEl.classList.add('hidden');
        };

        window.selectAllHostel = function(checked) {
            document.querySelectorAll('.hostel-row-check').forEach(cb => cb.checked = checked);
            window._onHostelCheckChange();
        };

        function getSelectedIds() { return [...document.querySelectorAll('.hostel-row-check:checked')].map(c => c.dataset.id); }
        function requireSelection() {
            const ids = getSelectedIds();
            if (!ids.length) {
                const el = document.getElementById('hostel-no-selection-notice');
                if (el) { el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 3000); }
                return null;
            }
            return ids;
        }

        // ── Bulk actions: Check-In/Out require scanner; Absent/Leave do not ──
        let forcedHostelDir = null;

        window.setAsHostelCheckIn = function() {
            forcedHostelDir = 'in';
            window.startHostelNFC();
        };

        window.setAsHostelCheckOut = function() {
            forcedHostelDir = 'out';
            window.startHostelNFC();
        };

        window.resetTodayHostelAttendance = function() {
            if (!confirm('Clear ALL hostel attendance for ' + currentDate + '?')) return;
            const sessions = getSessions();
            const prefix   = currentDate + '_';
            Object.keys(sessions).forEach(k => { if (k.startsWith(prefix)) delete sessions[k]; });
            saveSessions(sessions);
            loadAndRender();
        };

        window.markHostelAs = function(status) {
            const ids = requireSelection(); if (!ids) return;
            const sessions = getSessions();
            ids.forEach(id => {
                const key = sk(currentDate, id);
                const s = sessions[key] || {}; s.timeIn = ''; s.timeOut = ''; s.override = status; sessions[key] = s;
                updateRowDisplay(id, s);
            });
            saveSessions(sessions);
        };

        if (form) {
            form.addEventListener('submit', e => { e.preventDefault(); currentDate = dateInp?.value || currentDate; loadAndRender(); });
        }

        function loadAndRender(filterStudentId = null) {
            const selectedHostel = hSelect ? hSelect.value : '';
            let residents = allocations.slice();
            if (selectedHostel) residents = residents.filter(a => a.hostelId === selectedHostel);
            if (filterStudentId) residents = residents.filter(a => a.studentId === filterStudentId || a.id === filterStudentId);
            if (residents.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-10 text-center text-gray-400"><i class="fas fa-inbox text-3xl opacity-20 block mb-2"></i>No residents found.</td></tr>`;
                return;
            }
            tbody.innerHTML = '';
            residents.forEach(a => tbody.appendChild(buildRow(a)));
            window._onHostelCheckChange();
        }

        window.saveHostelAttendance = function() {
            // Flush remarks
            const sessions = getSessions();
            allocations.forEach(a => {
                const remarkEl = document.getElementById(`hremark-${a.id}`);
                if (remarkEl) { const s = sessions[sk(currentDate, a.id)] || {}; s.remark = remarkEl.value; sessions[sk(currentDate, a.id)] = s; }
            });
            saveSessions(sessions);
            const toast = document.getElementById('toast-hostel-att');
            if (toast) { toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('hidden'), 2500); }
        };

        // ── NFC Integration ──────────────────────────────────────────────────
        let hostelNfcConfig = { nfc: true, bio: true };
        let isHostelScanning = false;

        window.initHostelAttNFC = function() {
            try {
                const raw = localStorage.getItem('sms_nfc_config');
                hostelNfcConfig = raw ? (JSON.parse(raw).hostelAttendance || { nfc: true, bio: true }) : { nfc: true, bio: true };
            } catch(e) {}
            const btn = document.getElementById('hostel-nfc-btn');
            if (!btn) return;
            btn.classList.remove('hidden');
            btn.classList.add('inline-flex');
            const bothOff = !hostelNfcConfig.nfc && !hostelNfcConfig.bio;
            btn.disabled = bothOff;
            btn.classList.toggle('opacity-50', bothOff);
            btn.classList.toggle('cursor-not-allowed', bothOff);
            btn.title = bothOff ? 'NFC & Biometric both disabled in settings' : '';
        };

        window.startHostelNFC = function() {
            const btn = document.getElementById('hostel-nfc-btn');
            if (!btn) return;
            if (isHostelScanning) {
                isHostelScanning = false;
                btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Attendance';
                btn.classList.remove('bg-green-100','text-green-600','border-green-300','animate-pulse');
                if (window.SmartScanner) window.SmartScanner.stop();
                return;
            }
            if (!window.SmartScanner) { alert('Scanner service not loaded.'); return; }
            isHostelScanning = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Scanning...';
            btn.classList.add('bg-green-100','text-green-600','border-green-300','animate-pulse');

            window.SmartScanner.start({
                requireNFC: hostelNfcConfig.nfc,
                requireBiometric: hostelNfcConfig.bio,
                onSuccess: (scannedId) => {
                    isHostelScanning = false;
                    btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Attendance';
                    btn.classList.remove('bg-green-100','text-green-600','border-green-300','animate-pulse');

                    const container = document.getElementById('hostel-att-container');
                    if (container) container.classList.remove('hidden');

                    const scannedAlloc = allocations.find(a => a.studentId === scannedId || a.id === scannedId);
                    const now = new Date().toTimeString().slice(0, 5);
                    const sessions = getSessions();

                    if (scannedAlloc) {
                        if (!document.getElementById(`hostel-row-${scannedAlloc.id}`)) loadAndRender();

                        const rowSk = sk(currentDate, scannedAlloc.id);
                        let session  = sessions[rowSk] || { timeIn: '', timeOut: '', override: '' };
                        let direction;

                        // Respect forced direction from Set As Check-In/Out buttons
                        if (forcedHostelDir === 'in') {
                            session.timeIn   = now;
                            session.override = '';
                            direction = 'in';
                        } else if (forcedHostelDir === 'out') {
                            session.timeOut  = now;
                            session.override = '';
                            direction = 'out';
                        } else if (!session.timeIn) {
                            session.timeIn   = now;
                            session.override = '';
                            direction = 'in';
                        } else if (!session.timeOut) {
                            session.timeOut  = now;
                            session.override = '';
                            direction = 'out';
                        } else {
                            direction = 'done';
                        }
                        forcedHostelDir = null;

                        session.status = computeStatus(session.timeIn, session.timeOut, session.override || '');
                        sessions[rowSk] = session;
                        saveSessions(sessions);

                        const inEl   = document.getElementById(`hin-${scannedAlloc.id}`);
                        const outEl  = document.getElementById(`hout-${scannedAlloc.id}`);
                        if (inEl)  { inEl.textContent = session.timeIn  || '—'; inEl.className  = `text-sm font-mono font-bold ${session.timeIn  ? 'text-green-600' : 'text-gray-300 dark:text-gray-600'}`; }
                        if (outEl) { outEl.textContent = session.timeOut || '—'; outEl.className = `text-sm font-mono font-bold ${session.timeOut ? 'text-blue-600'  : 'text-gray-300 dark:text-gray-600'}`; }
                        updateRowDisplay(scannedAlloc.id, session);
                        document.getElementById(`hostel-row-${scannedAlloc.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Banner
                        showHostelBanner(scannedAlloc.studentName, direction, session, now);

                    } else {
                        const student = (window.SchoolDatabase?.students || []).find(s => s.id === scannedId);
                        tbody.insertAdjacentHTML('afterbegin', `
                            <tr class="bg-amber-50 border-b border-amber-200 dark:bg-amber-900/20">
                                <td class="px-4 py-3 font-medium">${student ? student.name : scannedId}</td>
                                <td class="px-4 py-3 text-xs text-amber-600 italic" colspan="2">Not a hostel resident</td>
                                <td class="px-4 py-3 text-center" colspan="5"><span class="text-xs font-bold text-amber-600">Card scanned — not allocated to any hostel</span></td>
                            </tr>`);
                    }
                },
                onFail: () => {
                    isHostelScanning = false;
                    btn.innerHTML = '<i class="fas fa-wifi mr-2"></i> Scan Attendance';
                    btn.classList.remove('bg-green-100','text-green-600','border-green-300','animate-pulse');
                }
            });
        };

        function showHostelBanner(name, direction, session, time) {
            const banner = document.getElementById('hostel-att-scan-banner');
            if (!banner) return;
            const icons   = { in: '🟢', out: '🔵', done: '⚪' };
            const labels  = { in: 'CHECKED IN', out: 'CHECKED OUT', done: 'ALREADY RECORDED' };
            const borders = { in: 'border-green-400 bg-green-50 dark:bg-green-900/20', out: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20', done: 'border-gray-300 bg-gray-50' };
            banner.className = `mb-4 p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${borders[direction]}`;
            banner.innerHTML = `
                <div class="text-3xl">${icons[direction]}</div>
                <div class="flex-1">
                    <p class="text-xs font-bold uppercase tracking-wider text-gray-500">${labels[direction]}</p>
                    <p class="text-lg font-black text-gray-900 dark:text-white">${name}</p>
                    <p class="text-sm text-gray-500">${time}</p>
                </div>
                <div class="text-right text-xs text-gray-400">
                    In: <strong class="text-green-600">${session.timeIn || '—'}</strong><br>
                    Out: <strong class="text-blue-600">${session.timeOut || '—'}</strong>
                </div>`;
            banner.classList.remove('hidden');
            setTimeout(() => banner.classList.add('hidden'), 5000);
        }

        window._hostelLoadAndRender = loadAndRender;
    }

})();


