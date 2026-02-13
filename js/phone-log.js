// Phone Log Module
(function() {
    console.log('Phone Log Script Loaded');
    let phoneData = [];
    const tableBody = document.getElementById('phone-table-body');
    const form = document.getElementById('add-call-form');
    const searchInput = document.getElementById('phone-search');
    
    // Toggle follow up date
    const checkFollow = document.getElementById('c-followup');
    const dateFollow = document.getElementById('c-followup-date');
    if(checkFollow) {
        checkFollow.addEventListener('change', () => {
            dateFollow.disabled = !checkFollow.checked;
            if(!checkFollow.checked) dateFollow.value = '';
            dateFollow.classList.toggle('bg-gray-100', !checkFollow.checked);
            dateFollow.classList.toggle('bg-white', checkFollow.checked);
        });
    }

    loadPhoneLogs();

    async function loadPhoneLogs() {
        try {
            const res = await fetch('../../data/phone-log-data.json');
            const data = await res.json();
            const stored = localStorage.getItem('phone_logs_data');
            if(stored) {
                phoneData = JSON.parse(stored);
            } else {
                phoneData = data;
                saveData();
            }
            renderTable(phoneData);
        } catch(e) { console.error(e); }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.sort((a,b) => new Date(b.dateTime) - new Date(a.dateTime));

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            
            const date = new Date(item.dateTime).toLocaleString();
            const typeClass = item.type === 'Incoming' ? 'bg-green-100 text-green-800' : 'bg-primary-100 text-primary-800';

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900 dark:text-white">${item.callerName}</div>
                    <div class="text-xs">${item.callerNumber}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="${typeClass} text-xs font-medium px-2.5 py-0.5 rounded">${item.type}</span>
                    <div class="text-xs text-gray-500 mt-1">${item.duration}</div>
                </td>
                <td class="px-6 py-4">${item.purpose}</td>
                <td class="px-6 py-4">
                    ${item.followUp ? `<span class="text-red-600 text-xs font-bold">Yes (${item.followUpDate})</span>` : 'No'}
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="deleteCall('${item.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCall = {
            id: 'CALL' + Date.now(),
            dateTime: new Date().toISOString(),
            callerName: document.getElementById('c-name').value,
            callerNumber: document.getElementById('c-phone').value,
            type: document.getElementById('c-type').value,
            duration: document.getElementById('c-duration').value,
            purpose: document.getElementById('c-purpose').value,
            followUp: document.getElementById('c-followup').checked,
            followUpDate: document.getElementById('c-followup-date').value,
            status: 'Logged'
        };

        phoneData.push(newCall);
        saveData();
        form.reset();
        checkFollow.dispatchEvent(new Event('change')); // reset UI state
        document.getElementById('add-call-section').classList.add('hidden');
        renderTable(phoneData);
        alert('Call Logged');
    });

    window.deleteCall = function(id) {
        if(confirm('Delete this phone log?')) {
            phoneData = phoneData.filter(x => x.id !== id);
            saveData();
            renderTable(phoneData);
        }
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = phoneData.filter(i => i.callerName.toLowerCase().includes(term) || i.callerNumber.includes(term));
        renderTable(filtered);
    });

    function saveData() {
        localStorage.setItem('phone_logs_data', JSON.stringify(phoneData));
    }

})();
