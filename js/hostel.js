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
        const tbody = document.getElementById('hostel-att-table-body');
        
        renderTable();

        function renderTable() {
             tbody.innerHTML = '';
             attendance.forEach(a => {
                  const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${a.studentName}</td>
                    <td class="px-6 py-4">Room ${a.roomNo}</td>
                    <td class="px-6 py-4">
                        <span class="${a.status === 'Present' ? 'text-green-600' : 'text-red-600'} font-bold">${a.status}</span>
                    </td>
                    <td class="px-6 py-4">${a.timeIn}</td>
                    <td class="px-6 py-4">${a.timeOut}</td>
                    <td class="px-6 py-4">-</td>
                `;
                tbody.appendChild(tr);
             });
        }
    }

})();
