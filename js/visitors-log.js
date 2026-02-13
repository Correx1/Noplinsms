// Visitors Log Module
(function() {
    console.log('Visitors Log Script Loaded');
    let visitorsData = [];
    const tableBody = document.getElementById('visitors-table-body');
    const form = document.getElementById('add-visitor-form');
    const searchInput = document.getElementById('visitor-search');

    loadVisitors();

    async function loadVisitors() {
        try {
            const res = await fetch('../../data/visitors-data.json');
            const data = await res.json();
            // Merge with local storage if any
            const stored = localStorage.getItem('visitors_data');
            if(stored) {
                visitorsData = JSON.parse(stored);
            } else {
                visitorsData = data;
                saveData();
            }
            renderTable(visitorsData);
        } catch(e) { console.error(e); }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        // Sort by entry time desc
        data.sort((a,b) => new Date(b.entryTime) - new Date(a.entryTime));

        data.forEach(v => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            
            const entry = new Date(v.entryTime).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'});
            const exit = v.exitTime ? new Date(v.exitTime).toLocaleString([], {hour: '2-digit', minute:'2-digit'}) : '-';
            
            const statusClass = v.status === 'Inside' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${entry}</td>
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900 dark:text-white">${v.name}</div>
                    <div class="text-xs">${v.phone}</div>
                    ${v.vehicle ? `<div class="text-xs text-primary-600">Veh: ${v.vehicle}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-semibold">${v.purpose}</div>
                    <div class="text-xs">To see: ${v.meetPerson}</div>
                </td>
                <td class="px-6 py-4">${exit}</td>
                <td class="px-6 py-4">
                    <span class="${statusClass} text-xs font-medium px-2.5 py-0.5 rounded">${v.status}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    ${v.status === 'Inside' ? `<button onclick="checkoutVisitor('${v.id}')" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-xs px-3 py-1.5 focus:outline-none">Checkout</button>` : '<span class="text-gray-400">-</span>'}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newVisitor = {
            id: 'VIS' + Date.now(),
            name: document.getElementById('v-name').value,
            phone: document.getElementById('v-phone').value,
            idType: document.getElementById('v-id-type').value,
            idNumber: document.getElementById('v-id-no').value,
            purpose: document.getElementById('v-purpose').value,
            meetPerson: document.getElementById('v-meet').value,
            department: '', // optional manual input
            vehicle: document.getElementById('v-vehicle').value,
            entryTime: new Date().toISOString(),
            exitTime: '', // set on checkout
            status: 'Inside'
        };

        visitorsData.push(newVisitor);
        saveData();
        form.reset();
        document.getElementById('add-visitor-section').classList.add('hidden');
        renderTable(visitorsData);
        alert('Visitor Checked In');
    });

    window.checkoutVisitor = function(id) {
        if(confirm('Mark visitor as successfully checked out?')) {
            const v = visitorsData.find(x => x.id === id);
            if(v) {
                v.status = 'Left';
                v.exitTime = new Date().toISOString();
                saveData();
                renderTable(visitorsData);
            }
        }
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = visitorsData.filter(v => v.name.toLowerCase().includes(term) || v.phone.includes(term));
        renderTable(filtered);
    });

    function saveData() {
        localStorage.setItem('visitors_data', JSON.stringify(visitorsData));
    }

})();
