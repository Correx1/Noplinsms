// Email Logs Module
(function() {
    console.log('Email Log Script Loaded');
    let emailData = [];
    const tableBody = document.getElementById('email-table-body');
    const searchInput = document.getElementById('email-search');

    // Mocks
    const modal = document.getElementById('email-modal');
    const mSub = document.getElementById('modal-subject');
    const mFrom = document.getElementById('modal-from');
    const mDate = document.getElementById('modal-date');
    const mBody = document.getElementById('modal-body');

    loadEmails();

    async function loadEmails() {
        try {
            const res = await fetch('../../data/email-logs-data.json');
            emailData = await res.json();
            // In a real app we might verify newly received emails from server each time
            renderTable(emailData);
        } catch(e) { console.error(e); }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.sort((a,b) => new Date(b.dateTime) - new Date(a.dateTime));

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = `bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 ${item.status === 'Unread' ? 'font-semibold bg-primary-50 dark:bg-gray-700' : ''}`;
            
            const date = new Date(item.dateTime).toLocaleString();
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                <td class="px-6 py-4">${item.from}</td>
                <td class="px-6 py-4">${item.subject}</td>
                <td class="px-6 py-4">
                    <span class="${item.status==='Unread'?'bg-primary-100 text-primary-800':'bg-gray-100 text-gray-600'} text-xs font-medium px-2.5 py-0.5 rounded">${item.status}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="viewEmail('${item.id}')" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.viewEmail = function(id) {
        const mail = emailData.find(m => m.id === id);
        if(!mail) return;

        mSub.textContent = mail.subject;
        mFrom.textContent = mail.from;
        mDate.textContent = new Date(mail.dateTime).toLocaleString();
        mBody.textContent = mail.body;
        
        // Mark read logic mock
        mail.status = 'Read';
        renderTable(emailData);

        modal.classList.remove('hidden');
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = emailData.filter(i => i.subject.toLowerCase().includes(term) || i.from.toLowerCase().includes(term));
        renderTable(filtered);
    });

})();
