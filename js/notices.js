(function() {
    
    // === NOTICE LIST LOGIC ===
    const grid = document.getElementById('notices-grid');
    if(grid) {
        // We are on List Page
        loadNotices();
    }

    async function loadNotices() {
        grid.innerHTML = '<div class="col-span-full text-center"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i></div>';
        try {
            const response = await fetch('../../data/notices-data.json');
            let notices = await response.json();
            
            // Basic filtering if applied (Mocking logic here)
            const typeFilter = document.getElementById('notice-type-filter').value;
            const statusFilter = document.getElementById('notice-status-filter').value;
            const searchTerm = document.getElementById('notice-search').value.toLowerCase();

            if(typeFilter !== 'All') notices = notices.filter(n => n.type === typeFilter);
            if(statusFilter !== 'All') notices = notices.filter(n => n.status === statusFilter);
            if(searchTerm) notices = notices.filter(n => n.title.toLowerCase().includes(searchTerm));

            renderNotices(notices);
        } catch(e) { console.error(e); }
    }

    function renderNotices(notices) {
        grid.innerHTML = '';
        if(notices.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500">No notices found.</div>';
            return;
        }

        notices.forEach(notice => {
            const card = document.createElement('div');
            card.className = 'p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full';
            
            const badges = getBadgeHTML(notice.type, notice.priority, notice.status);
            
            card.innerHTML = `
                <div class="mb-4">
                    ${badges}
                </div>
                <a href="#">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${notice.title}</h5>
                </a>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-3">${notice.content}</p>
                <div class="mt-auto flex items-center justify-between">
                    <span class="text-xs text-gray-500 dark:text-gray-400">${notice.date}</span>
                    <button onclick="viewNotice('${notice.id}')" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        Read more
                        <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function getBadgeHTML(type, priority, status) {
        let typeColor = 'bg-primary-100 text-primary-800';
        if(type === 'Emergency') typeColor = 'bg-red-100 text-red-800';
        if(type === 'Holiday') typeColor = 'bg-purple-100 text-purple-800';
        
        let priorityBadge = '';
        if(priority === 'Urgent') priorityBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-red-400">Urgent</span>`;
        
        let statusBadge = '';
        if(status === 'Expired') statusBadge = `<span class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">Expired</span>`;

        return `
            <span class="${typeColor} text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-primary-400 border border-primary-400">${type}</span>
            ${priorityBadge}
            ${statusBadge}
        `;
    }

    // Window functions for Filter
    window.filterNotices = loadNotices;

    // View Modal Logic
    const modalElement = document.getElementById('noticeModal');
    let modal;
    if (typeof Modal !== 'undefined' && modalElement) {
         modal = new Modal(modalElement);
    }

    window.viewNotice = async function(id) {
        try {
            const response = await fetch('../../data/notices-data.json');
            const notices = await response.json();
            const notice = notices.find(n => n.id === id);
            
            if(notice) {
                document.getElementById('modal-title').textContent = notice.title;
                document.getElementById('modal-badges').innerHTML = getBadgeHTML(notice.type, notice.priority, notice.status);
                document.getElementById('modal-content').textContent = notice.content;
                document.getElementById('modal-date').textContent = `Published: ${notice.date}`;
                document.getElementById('modal-audience').textContent = `To: ${notice.audience.join(', ')}`;
                
                if(modal) modal.show();
                else {
                    modalElement.classList.remove('hidden');
                    modalElement.classList.add('flex');
                }
            }

            // Close Logic (Fallback)
            document.querySelectorAll('[data-modal-hide]').forEach(btn => {
                btn.onclick = () => {
                     if(modal) modal.hide();
                     else {
                         modalElement.classList.add('hidden');
                         modalElement.classList.remove('flex');
                     }
                }
            });

        } catch(e) { console.error(e); }
    }


    // === CREATE NOTICE LOGIC ===
    const createForm = document.getElementById('create-notice-form');
    if(createForm) {
        // Initialize Date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('publish-date').value = today;

        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show Toast
            const toast = document.getElementById('toast-notice');
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
                loadNoticesList(); // Navigate back
            }, 1500);
        });
    }

    window.toggleAudience = function(checkbox) {
       const all = document.getElementById('audience-all');
       if(checkbox.value === 'All') {
           if(checkbox.checked) {
               // Uncheck others
               document.querySelectorAll('input[type="checkbox"]').forEach(c => {
                   if(c !== all) c.checked = false;
               });
           }
       } else {
           if(checkbox.checked) {
               all.checked = false;
           }
       }
    };

})();
