// Transportation Module Logic
(function() {
    console.log('Transportation Script Loaded');

    let vehicles = [];
    let drivers = [];
    let routes = [];
    let allocations = [];

    // Page Detection
    const isVehiclesPage = document.getElementById('trans-add-vehicle-form');
    const isDriversPage = document.getElementById('trans-add-driver-form');
    const isRoutesPage = document.getElementById('trans-add-route-form');
    const isAllocPage = document.getElementById('trans-allocate-form');

    init();

    async function init() {
        await loadData();
        
        if (isVehiclesPage) setupVehicles();
        if (isDriversPage) setupDrivers();
        if (isRoutesPage) setupRoutes();
        if (isAllocPage) setupAllocation();
    }

    async function loadData() {
        try {
            // Vehicles
            const vRes = await fetch('../../data/transport-vehicles.json');
            vehicles = JSON.parse(localStorage.getItem('trans_vehicles')) || await vRes.json();
            if(!localStorage.getItem('trans_vehicles')) localStorage.setItem('trans_vehicles', JSON.stringify(vehicles));

            // Drivers
            const dRes = await fetch('../../data/transport-drivers.json');
            drivers = JSON.parse(localStorage.getItem('trans_drivers')) || await dRes.json();
            if(!localStorage.getItem('trans_drivers')) localStorage.setItem('trans_drivers', JSON.stringify(drivers));

            // Routes
            const rRes = await fetch('../../data/transport-routes.json');
            routes = JSON.parse(localStorage.getItem('trans_routes')) || await rRes.json();
            if(!localStorage.getItem('trans_routes')) localStorage.setItem('trans_routes', JSON.stringify(routes));
            
             // Allocations
            const aRes = await fetch('../../data/transport-allocation.json');
            allocations = JSON.parse(localStorage.getItem('trans_allocations')) || await aRes.json();
            if(!localStorage.getItem('trans_allocations')) localStorage.setItem('trans_allocations', JSON.stringify(allocations));

        } catch(e) { console.error('Trans Data Error', e); }
    }

    function saveData() {
        localStorage.setItem('trans_vehicles', JSON.stringify(vehicles));
        localStorage.setItem('trans_drivers', JSON.stringify(drivers));
        localStorage.setItem('trans_routes', JSON.stringify(routes));
        localStorage.setItem('trans_allocations', JSON.stringify(allocations));
    }

    // --- VEHICLES ---
    function setupVehicles() {
        const tbody = document.getElementById('trans-vehicles-table-body');
        const form = document.getElementById('trans-add-vehicle-form');

        renderTable();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = {
                id: 'VH' + Date.now(),
                number: document.getElementById('vh-number').value,
                type: document.getElementById('vh-type').value,
                model: document.getElementById('vh-model').value,
                capacity: document.getElementById('vh-capacity').value,
                insurance: document.getElementById('vh-insurance').value,
                status: document.getElementById('vh-status').value
            };
            vehicles.push(newItem);
            saveData();
            form.reset();
            renderTable();
            alert('Vehicle Added');
        });

        function renderTable() {
            tbody.innerHTML = '';
            vehicles.forEach(v => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        ${v.number}
                        <div class="text-xs text-gray-500">${v.model} (${v.type})</div>
                    </td>
                    <td class="px-6 py-4">${v.capacity} Seats</td>
                    <td class="px-6 py-4">${v.insurance}</td>
                    <td class="px-6 py-4">
                        <span class="${v.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-medium px-2.5 py-0.5 rounded">${v.status}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteVehicle('${v.id}')" class="text-red-600 hover:underline">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        window.deleteVehicle = (id) => {
            if(confirm('Delete Vehicle?')) { vehicles = vehicles.filter(x => x.id !== id); saveData(); renderTable(); }
        };
    }

    // --- DRIVERS ---
    function setupDrivers() {
        const tbody = document.getElementById('trans-drivers-table-body');
        const form = document.getElementById('trans-add-driver-form');
        
        // Populate selects
        const vSelect = document.getElementById('drv-vehicle');
        const rSelect = document.getElementById('drv-route');
        
        vehicles.forEach(v => {
             const opt = document.createElement('option');
             opt.value = v.id;
             opt.textContent = `${v.number} - ${v.model}`;
             vSelect.appendChild(opt);
        });
         routes.forEach(r => {
             const opt = document.createElement('option');
             opt.value = r.id;
             opt.textContent = r.name;
             rSelect.appendChild(opt);
        });

        renderTable();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = {
                id: 'DRV' + Date.now(),
                name: document.getElementById('drv-name').value,
                license: document.getElementById('drv-license').value,
                phone: document.getElementById('drv-phone').value,
                vehicleId: document.getElementById('drv-vehicle').value,
                routeId: document.getElementById('drv-route').value
            };
            drivers.push(newItem);
            saveData();
            form.reset();
            renderTable();
            alert('Driver Added');
        });

         function renderTable() {
            tbody.innerHTML = '';
            drivers.forEach(d => {
                const assignedVehicle = vehicles.find(v => v.id === d.vehicleId);
                const vehInfo = assignedVehicle ? `${assignedVehicle.number}` : 'None';

                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${d.name}</td>
                    <td class="px-6 py-4">${d.license}</td>
                    <td class="px-6 py-4">${d.phone}</td>
                    <td class="px-6 py-4">${vehInfo}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteDriver('${d.id}')" class="text-red-600 hover:underline">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        window.deleteDriver = (id) => {
            if(confirm('Delete Driver?')) { drivers = drivers.filter(x => x.id !== id); saveData(); renderTable(); }
        };
    }

    // --- ROUTES ---
    function setupRoutes() {
        const tbody = document.getElementById('trans-routes-table-body');
        const form = document.getElementById('trans-add-route-form');
         const dSelect = document.getElementById('rt-driver');
        
         drivers.forEach(d => {
             const opt = document.createElement('option');
             opt.value = d.id;
             opt.textContent = d.name;
             dSelect.appendChild(opt);
        });

        renderTable();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const stops = document.getElementById('rt-stops').value.split(',').map(s => s.trim());
            const newItem = {
                id: 'RT' + Date.now(),
                name: document.getElementById('rt-name').value,
                number: document.getElementById('rt-number').value,
                start: document.getElementById('rt-start').value,
                end: document.getElementById('rt-end').value,
                fare: document.getElementById('rt-fare').value,
                driverId: document.getElementById('rt-driver').value,
                stops: stops
            };
            routes.push(newItem);
            saveData();
            form.reset();
            renderTable();
            alert('Route Created');
        });

         function renderTable() {
            tbody.innerHTML = '';
            routes.forEach(r => {
                const assignedDriver = drivers.find(d => d.id === r.driverId);
                const drvName = assignedDriver ? assignedDriver.name : 'Unassigned';

                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        ${r.name}
                        <div class="text-xs text-gray-500">${r.number}</div>
                    </td>
                    <td class="px-6 py-4">${r.start} -> ${r.end}</td>
                    <td class="px-6 py-4">${drvName}</td>
                    <td class="px-6 py-4">N${parseInt(r.fare).toLocaleString()}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteRoute('${r.id}')" class="text-red-600 hover:underline">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
         window.deleteRoute = (id) => {
            if(confirm('Delete Route?')) { routes = routes.filter(x => x.id !== id); saveData(); renderTable(); }
        };
    }

    // --- ALLOCATION ---
    function setupAllocation() {
        const tbody = document.getElementById('trans-allocation-table-body');
        const form = document.getElementById('trans-allocate-form');
         const rSelect = document.getElementById('alloc-route-id');
        
        routes.forEach(r => {
             const opt = document.createElement('option');
             opt.value = r.id;
             opt.textContent = `${r.name} (${r.number})`;
             rSelect.appendChild(opt);
        });

        renderTable();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
             // In real app, we'd select student from DB. Here just name.
            const newItem = {
                id: 'ALL' + Date.now(),
                studentName: document.getElementById('alloc-student-name').value,
                routeId: document.getElementById('alloc-route-id').value,
                stop: document.getElementById('alloc-stop').value,
                term: document.getElementById('alloc-term').value
            };
            allocations.push(newItem);
            saveData();
            form.reset();
            renderTable();
            alert('Allocated Successfully');
        });

         function renderTable() {
            tbody.innerHTML = '';
            allocations.forEach(a => {
                const route = routes.find(r => r.id === a.routeId);
                const rName = route ? route.name : 'Unknown Route';

                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${a.studentName}</td>
                    <td class="px-6 py-4">${rName}</td>
                    <td class="px-6 py-4">${a.stop}</td>
                    <td class="px-6 py-4">${a.term}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteAlloc('${a.id}')" class="text-red-600 hover:underline">Remove</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
         window.deleteAlloc = (id) => {
            if(confirm('Remove Allocation?')) { allocations = allocations.filter(x => x.id !== id); saveData(); renderTable(); }
        };
    }

})();
