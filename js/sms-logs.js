// SMS Logs Module
(function() {
    console.log('SMS Log Script Loaded');
    let smsData = [];
    const tableBody = document.getElementById('sms-table-body');
    const searchInput = document.getElementById('sms-search');

    loadSMS();

    async function loadSMS() {
        try {
            const res = await fetch('../../data/sms-logs-data.json');
            smsData = await res.json();
            renderTable(smsData);
        } catch(e) { console.error(e); }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.sort((a,b) => new Date(b.dateTime) - new Date(a.dateTime));

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = `bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 ${item.status === 'Unread' ? 'font-bold' : ''}`;
            
            const date = new Date(item.dateTime).toLocaleString();
            const preview = item.message.length > 50 ? item.message.substring(0,50) + '...' : item.message;

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                <td class="px-6 py-4">${item.sender}</td>
                <td class="px-6 py-4">${preview}</td>
                <td class="px-6 py-4">
                    <span class="${item.status==='Unread'?'bg-yellow-100 text-yellow-800':'bg-green-100 text-green-800'} text-xs font-medium px-2.5 py-0.5 rounded">${item.status}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="viewSMS('${item.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">View</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.viewSMS = function(id) {
        const msg = smsData.find(m => m.id === id);
        if(!msg) return;
        alert(`From: ${msg.sender}\nDate: ${new Date(msg.dateTime).toLocaleString()}\n\n${msg.message}`);
        
        // Mark read
        msg.status = 'Read';
        renderTable(smsData);
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = smsData.filter(i => i.message.toLowerCase().includes(term) || i.sender.includes(term));
        renderTable(filtered);
    });

})();
