(function() {
    // === Variables ===
    const container = document.getElementById('timetable-container');
    const tableHead = document.getElementById('timetable-head');
    const tableBody = document.getElementById('timetable-body');
    const form = document.getElementById('assign-period-form');
    
    // Config
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // State
    let allData = {};
    let activeKey = ''; // e.g. "2024-2025_SSS1_A"
    let currentTimings = [];
    let currentSchedule = {}; // "Day-PeriodID" -> { subject: '', teacher: '', room: '' }
    let currentSlot = { day: '', periodId: '' };

    // Modals
    const assignModalElement = document.getElementById('assignPeriodModal');
    const timingsModalElement = document.getElementById('editTimingsModal');
    
    let assignModal, timingsModal;
    if (typeof Modal !== 'undefined') {
         assignModal = new Modal(assignModalElement);
         timingsModal = new Modal(timingsModalElement);
    }

    // === Load Logic ===
    async function fetchTimetableData() {
        try {
            const resp = await fetch('../../data/timetable-data.json');
            allData = await resp.json();
        } catch(e) {
            console.warn("Could not load timetable mock data, starting fresh");
            allData = { 
                default_timings: [
                    { id: "p1", name: "P1", start: "08:00", end: "08:45", type: "Class" },
                    { id: "b1", name: "Break", start: "08:45", end: "09:30", type: "Break" }
                ], 
                classes: {} 
            };
        }
    }

    // Called when clicking "Load / Create"
    window.loadTimetableGrid = async function() {
        if (Object.keys(allData).length === 0) await fetchTimetableData();

        // Hardcoded year for mock since UI select doesn't have ID yet
        const year = "2024-2025"; 
        const cls = document.getElementById('tt-class').value;
        const sec = document.getElementById('tt-section').value;
        activeKey = `${year}_${cls}_${sec}`;

        if (allData.classes[activeKey]) {
            currentTimings = [...allData.classes[activeKey].timings];
            currentSchedule = { ...allData.classes[activeKey].schedule };
        } else {
            // Provision new
            currentTimings = JSON.parse(JSON.stringify(allData.default_timings));
            currentSchedule = {};
            allData.classes[activeKey] = { timings: currentTimings, schedule: currentSchedule };
        }

        renderTimingsList();
        renderGrid();
        container.classList.remove('hidden');
    };

    function renderTimingsList() {
        const list = document.getElementById('period-timing-list');
        list.innerHTML = currentTimings.map(t => {
            const isBreak = t.type === 'Break';
            return `<li class="flex justify-between ${isBreak ? 'font-bold text-orange-600 dark:text-orange-400' : ''}">
                <span>${t.name}</span> <span>${t.start} - ${t.end}</span>
            </li>`;
        }).join('');
    }

    function renderGrid() {
        // 1. Render Header
        let thHtml = `<tr><th scope="col" class="px-4 py-3 border dark:border-gray-600 w-24">Day / Period</th>`;
        currentTimings.forEach(t => {
            if (t.type === 'Break') {
                 thHtml += `<th scope="col" class="px-2 py-3 border bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 w-12 writing-vertical">${t.name}</th>`;
            } else {
                 thHtml += `<th scope="col" class="px-4 py-3 border dark:border-gray-600">${t.name}<br><span class="text-[10px] lowercase text-gray-500">${t.start}-${t.end}</span></th>`;
            }
        });
        thHtml += `</tr>`;
        tableHead.innerHTML = thHtml;

        // 2. Render Body
        tableBody.innerHTML = '';
        days.forEach(day => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';

            // Day Header
            let rowHtml = `<th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-700">${day}</th>`;
            
            // Periods
            currentTimings.forEach(t => {
                if (t.type === 'Break') {
                    rowHtml += `<td class="px-2 py-3 border dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-xs font-bold align-middle">
                                    <div style="writing-mode: vertical-rl; text-orientation: mixed;" class="opacity-50">${day.substring(0,3)}</div>
                                </td>`;
                } else {
                    rowHtml += renderCell(day, t.id);
                }
            });

            tr.innerHTML = rowHtml;
            tableBody.appendChild(tr);
        });
    }

    function renderCell(day, periodId) {
        const key = `${day}-${periodId}`;
        const data = currentSchedule[key];

        if (data && data.subject) {
            const colorClass = getSubjectColor(data.subject);
            return `
                <td class="px-1 py-1 border dark:border-gray-600 h-24 align-top cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition" onclick="openAssignModal('${day}', '${periodId}')">
                    <div class="h-full w-full p-2 rounded ${colorClass} bg-opacity-10 border border-opacity-20 flex flex-col justify-center items-center text-center">
                        <span class="font-bold text-sm text-gray-800 dark:text-white mb-1 leading-tight">${data.subject}</span>
                        <span class="text-xs text-gray-600 dark:text-gray-300 italic mb-1">${data.teacher}</span>
                        ${data.room ? `<span class="text-[10px] text-gray-500 px-1 border rounded bg-white dark:bg-gray-800">${data.room}</span>` : ''}
                    </div>
                </td>
            `;
        } else {
            return `
                <td class="px-1 py-1 border dark:border-gray-600 h-24 align-middle cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700 transition group" onclick="openAssignModal('${day}', '${periodId}')">
                    <div class="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 group-hover:text-primary-400">
                        <i class="fas fa-plus mb-1"></i>
                        <span class="text-xs">Add</span>
                    </div>
                </td>
            `;
        }
    }

    function getSubjectColor(subject) {
        if (!subject) return '';
        if (subject.includes('Math')) return 'bg-primary-100 border-primary-300';
        if (subject.includes('Eng')) return 'bg-red-100 border-red-300';
        if (subject.includes('Phy') || subject.includes('Sci')) return 'bg-purple-100 border-purple-300';
        if (subject.includes('Chem')) return 'bg-yellow-100 border-yellow-300';
        if (subject.includes('Bio')) return 'bg-green-100 border-green-300';
        return 'bg-gray-100 border-gray-300';
    }

    // === Edit Timings Modal Logic ===
    window.openEditTimingsModal = function() {
        if (!activeKey) return alert("Please load a class timetable first.");
        
        document.getElementById('modal-timing-class').textContent = activeKey.replace(/_/g, ' ');
        
        const container = document.getElementById('timings-list-container');
        container.innerHTML = '';
        
        currentTimings.forEach(t => renderPeriodInputRow(t));

        if(timingsModal) timingsModal.show();
        else {
             timingsModalElement.classList.remove('hidden');
             timingsModalElement.classList.add('flex');
        }
    };

    function renderPeriodInputRow(data) {
        const id = data.id || 'p' + Math.random().toString(36).substr(2, 5);
        const container = document.getElementById('timings-list-container');
        
        const div = document.createElement('div');
        div.className = "flex gap-2 items-center timing-row p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800";
        div.dataset.id = id;
        
        div.innerHTML = `
            <div class="flex-1">
                <input type="text" placeholder="Name (e.g. P1, Lunch)" value="${data.name || ''}" class="timing-name bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            </div>
            <div class="w-20">
                <input type="time" value="${data.start || ''}" class="timing-start bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            </div>
            <div class="w-20">
                <input type="time" value="${data.end || ''}" class="timing-end bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            </div>
            <div class="w-24">
                <select class="timing-type bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Class" ${data.type === 'Class' ? 'selected' : ''}>Class</option>
                    <option value="Break" ${data.type === 'Break' ? 'selected' : ''}>Break</option>
                </select>
            </div>
            <button type="button" onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700 p-2">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    }

    window.addPeriodRow = function() {
        renderPeriodInputRow({ name: '', start: '', end: '', type: 'Class' });
    };

    document.getElementById('edit-timings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const rows = document.querySelectorAll('.timing-row');
        const newTimings = [];
        let pCounter = 1;
        let bCounter = 1;

        rows.forEach(row => {
            const name = row.querySelector('.timing-name').value;
            const start = row.querySelector('.timing-start').value;
            const end = row.querySelector('.timing-end').value;
            const type = row.querySelector('.timing-type').value;
            
            // Preserve existing ID if it matches, or generate sequential one for new logic
            const oldId = row.dataset.id;
            let finalId = oldId;
            // Clean up missing IDs
            if (!finalId || finalId.startsWith('p0.')) {
                finalId = type === 'Class' ? `p${pCounter++}` : `b${bCounter++}`;
            }

            newTimings.push({ id: finalId, name, start, end, type });
        });

        // Basic sort by start time
        newTimings.sort((a,b) => a.start.localeCompare(b.start));

        currentTimings = newTimings;
        allData.classes[activeKey].timings = currentTimings;
        
        renderTimingsList();
        renderGrid();

        if (timingsModal) timingsModal.hide();
        else {
             timingsModalElement.classList.add('hidden');
             timingsModalElement.classList.remove('flex');
        }
    });

    // === Assign Subject Modal Logic ===
    window.openAssignModal = function(day, periodId) {
        currentSlot = { day, periodId };
        const periodObj = currentTimings.find(t => t.id === periodId);
        const periodName = periodObj ? periodObj.name : periodId;
        
        document.getElementById('modal-slot-info').textContent = `(${day}, ${periodName})`;
        
        const key = `${day}-${periodId}`;
        const data = currentSchedule[key];

        if(data) {
            document.getElementById('modal-subject').value = data.subject || '';
            document.getElementById('modal-teacher').value = data.teacher || '';
            document.getElementById('modal-room').value = data.room || '';
        } else {
            form.reset();
        }

        if(assignModal) {
             assignModal.show();
        } else {
             assignModalElement.classList.remove('hidden');
             assignModalElement.classList.add('flex');
        }
    };

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const subject = document.getElementById('modal-subject').value;
        const teacher = document.getElementById('modal-teacher').value;
        const room = document.getElementById('modal-room').value;
        
        const key = `${currentSlot.day}-${currentSlot.periodId}`;
        
        // Save
        currentSchedule[key] = { subject, teacher, room };
        allData.classes[activeKey].schedule = currentSchedule;
        
        renderGrid();
        
        if(assignModal) assignModal.hide();
        else {
             assignModalElement.classList.add('hidden');
             assignModalElement.classList.remove('flex');
        }
    });

    window.clearSlot = function() {
        const key = `${currentSlot.day}-${currentSlot.periodId}`;
        delete currentSchedule[key];
        allData.classes[activeKey].schedule = currentSchedule;
        renderGrid();
        if(assignModal) assignModal.hide();
        else {
            assignModalElement.classList.add('hidden');
            assignModalElement.classList.remove('flex');
        }
    };

    window.clearTimetable = function() {
        if(confirm('Are you sure you want to clear the entire schedule for this class? Timings will be preserved.')) {
            currentSchedule = {};
            allData.classes[activeKey].schedule = {}
            renderGrid();
        }
    };

    window.saveTimetable = function() {
         document.getElementById('toast-timetable').classList.remove('hidden');
         setTimeout(() => document.getElementById('toast-timetable').classList.add('hidden'), 3000);
    }

    // Modal Close buttons fallback
    document.querySelectorAll('[data-modal-hide]').forEach(btn => {
        btn.addEventListener('click', (e) => {
             const targetId = e.currentTarget.getAttribute('data-modal-hide');
             if (targetId === 'assignPeriodModal') {
                 if(assignModal) assignModal.hide();
                 else { assignModalElement.classList.add('hidden'); assignModalElement.classList.remove('flex'); }
             } else if (targetId === 'editTimingsModal') {
                 if(timingsModal) timingsModal.hide();
                 else { timingsModalElement.classList.add('hidden'); timingsModalElement.classList.remove('flex'); }
             }
        });
    });

    // Auto-fetch data on script load
    fetchTimetableData();

})();
