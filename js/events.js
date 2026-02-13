// Events Module Logic
(function() {
    console.log('Events Script Loaded');
    let eventsData = [];

    // Helper: Get Page ID (simple check)
    const isListPage = document.getElementById('events-table-body');
    const isAddPage = document.getElementById('add-event-form');
    const isViewPage = document.getElementById('view-evt-name');

    init();

    async function init() {
        await loadData();
        
        if (isListPage) {
            renderList(eventsData);
            setupFilters();
        } else if (isAddPage) {
            setupAddForm();
        } else if (isViewPage) {
            loadEventDetails();
        }
    }

    async function loadData() {
        try {
            const res = await fetch('../../data/events-data.json');
            const data = await res.json();
            const stored = localStorage.getItem('events_data');
            if(stored) {
                eventsData = JSON.parse(stored);
            } else {
                eventsData = data;
                localStorage.setItem('events_data', JSON.stringify(eventsData));
            }
        } catch(e) { console.error('Error loading events:', e); }
    }

    // --- LIST PAGE LOGIC ---
    function renderList(data) {
        const tbody = document.getElementById('events-table-body');
        tbody.innerHTML = '';
        
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No events found</td></tr>';
            return;
        }

        data.sort((a,b) => new Date(a.date) - new Date(b.date)); // Sort asc by date

        data.forEach(evt => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            
            const statusClass = getStatusClass(evt.status);

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${evt.date}</td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${evt.name}</td>
                <td class="px-6 py-4">
                    <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">${evt.type}</span>
                </td>
                <td class="px-6 py-4">${evt.venue}</td>
                <td class="px-6 py-4">${evt.startTime} - ${evt.endTime}</td>
                <td class="px-6 py-4">
                    <span class="${statusClass} text-xs font-medium px-2.5 py-0.5 rounded">${evt.status}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <a href="#" onclick="viewEvent('${evt.id}')" class="font-medium text-gray-600 dark:text-gray-300 hover:underline mr-2">View</a>
                    <a href="#" onclick="alert('Edit implementation pending')" class="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2">Edit</a>
                    <a href="#" onclick="deleteEvent('${evt.id}')" class="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Populate Calendar (Mock)
        renderCalendar(data);
    }

    function renderCalendar(data) {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';
        // Simplistic mock: Just cards for "Next 3 Months"
        const months = ['Current Month', 'Next Month', 'Following Month'];
        months.forEach(m => {
             const div = document.createElement('div');
             div.className = 'border p-4 rounded bg-gray-50';
             div.innerHTML = `<h4 class="font-bold mb-2">${m}</h4><div class="text-xs text-gray-500">Calendar visual mock...</div>`;
             grid.appendChild(div);
        });
    }

    function getStatusClass(status) {
        switch(status) {
            case 'Upcoming': return 'bg-yellow-100 text-yellow-800';
            case 'Ongoing': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    function setupFilters() {
        const typeFilter = document.getElementById('filter-type');
        const statusFilter = document.getElementById('filter-status');
        
        function filter() {
            const t = typeFilter.value;
            const s = statusFilter.value;
            const filtered = eventsData.filter(e => {
                return (t ? e.type === t : true) && (s ? e.status === s : true);
            });
            renderList(filtered);
        }

        typeFilter.addEventListener('change', filter);
        statusFilter.addEventListener('change', filter);
    }

    window.switchView = function(view) {
        if(view === 'list') {
            document.getElementById('events-list-view').classList.remove('hidden');
            document.getElementById('events-calendar-view').classList.add('hidden');
            document.getElementById('btn-list-view').classList.add('bg-gray-100', 'text-primary-700');
            document.getElementById('btn-calendar-view').classList.remove('bg-gray-100', 'text-primary-700');
        } else {
            document.getElementById('events-list-view').classList.add('hidden');
            document.getElementById('events-calendar-view').classList.remove('hidden');
             document.getElementById('btn-calendar-view').classList.add('bg-gray-100', 'text-primary-700');
            document.getElementById('btn-list-view').classList.remove('bg-gray-100', 'text-primary-700');
        }
    };
    
    window.deleteEvent = function(id) {
        if(confirm('Delete this event?')) {
            eventsData = eventsData.filter(e => e.id !== id);
            localStorage.setItem('events_data', JSON.stringify(eventsData));
            renderList(eventsData);
        }
    };

    // --- ADD PAGE LOGIC ---
    function setupAddForm() {
        const form = document.getElementById('add-event-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect Checkboxes
            const audience = [];
            form.querySelectorAll('input[type="checkbox"]:checked').forEach(c => audience.push(c.value));

            const newEvent = {
                id: 'EVT' + Date.now(),
                name: document.getElementById('evt-name').value,
                type: document.getElementById('evt-type').value,
                date: document.getElementById('evt-date').value,
                startTime: document.getElementById('evt-start').value,
                endTime: document.getElementById('evt-end').value,
                venue: document.getElementById('evt-venue').value,
                description: document.getElementById('evt-desc').value,
                audience: audience,
                coordinator: document.getElementById('evt-coordinator').value,
                budget: document.getElementById('evt-budget').value,
                status: 'Upcoming' // Default
            };

            eventsData.push(newEvent);
            localStorage.setItem('events_data', JSON.stringify(eventsData));
            alert('Event Created Successfully');
            window.loadEventsPage(); // Redirect back to list
        });
    }

    // --- VIEW PAGE LOGIC ---
    function loadEventDetails() {
        const id = localStorage.getItem('current_view_event_id');
        if(!id) {
            alert('No event selected');
            return;
        }
        
        const evt = eventsData.find(e => e.id === id);
        if(evt) {
            document.getElementById('view-evt-name').textContent = evt.name;
            document.getElementById('view-evt-type').textContent = evt.type;
            document.getElementById('view-evt-status').textContent = evt.status;
            document.getElementById('view-evt-desc').textContent = evt.description;
            document.getElementById('view-evt-date').textContent = evt.date;
            document.getElementById('view-evt-time').textContent = `${evt.startTime} - ${evt.endTime}`;
            document.getElementById('view-evt-venue').textContent = evt.venue;
            document.getElementById('view-evt-coordinator').textContent = evt.coordinator;
            document.getElementById('view-evt-audience').textContent = evt.audience.join(', ');
            document.getElementById('view-evt-budget').textContent = evt.budget;
        }
    }

    // Global Routing Helper
    window.viewEvent = function(id) {
        localStorage.setItem('current_view_event_id', id);
        window.loadViewEventPage();
    };


})();
