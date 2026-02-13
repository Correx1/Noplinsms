(function() {
    // === Variables ===
    const container = document.getElementById('timetable-container');
    const tableBody = document.getElementById('timetable-body');
    const form = document.getElementById('assign-period-form');
    
    // Config
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = 6;
    
    // State
    // Format: "Day-Period" -> { subject: '', teacher: '', room: '' }
    let timetableData = {}; 
    let currentSlot = { day: '', period: '' };

    // Modal
    const modalElement = document.getElementById('assignPeriodModal');
    // Using Flowbite Modal Interface if available, or manual toggle
    let modal;
    if (typeof Modal !== 'undefined') {
         modal = new Modal(modalElement);
    }

    // === Load Logic ===
    window.loadTimetableGrid = function() {
        // Show container
        container.classList.remove('hidden');
        renderGrid();
    };

    function renderGrid() {
        tableBody.innerHTML = '';
        
        days.forEach(day => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';

            // Day Header
            let rowHtml = `<th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-700">${day}</th>`;
            
            // P1 & P2
            rowHtml += renderCell(day, 1);
            rowHtml += renderCell(day, 2);
            
            // Break
            rowHtml += `<td class="px-2 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold border-x dark:border-gray-600 align-middle">
                            <div style="writing-mode: vertical-rl; text-orientation: mixed;">Lunch</div>
                        </td>`;
            
            // P3 - P6
            for(let p=3; p<=6; p++) {
                rowHtml += renderCell(day, p);
            }

            tr.innerHTML = rowHtml;
            tableBody.appendChild(tr);
        });
    }

    function renderCell(day, period) {
        const key = `${day}-${period}`;
        const data = timetableData[key];

        if (data) {
            const colorClass = getSubjectColor(data.subject);
            return `
                <td class="px-1 py-1 border dark:border-gray-600 h-24 align-top cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition" onclick="openAssignModal('${day}', '${period}')">
                    <div class="h-full w-full p-2 rounded ${colorClass} bg-opacity-10 border border-opacity-20 flex flex-col justify-center items-center">
                        <span class="font-bold text-sm text-gray-800 dark:text-white mb-1">${data.subject}</span>
                        <span class="text-xs text-gray-600 dark:text-gray-300 italic mb-1">${data.teacher}</span>
                        ${data.room ? `<span class="text-[10px] text-gray-500 px-1 border rounded bg-white dark:bg-gray-800">${data.room}</span>` : ''}
                    </div>
                </td>
            `;
        } else {
            return `
                <td class="px-1 py-1 border dark:border-gray-600 h-24 align-middle cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700 transition group" onclick="openAssignModal('${day}', '${period}')">
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

    // === Modal Logic ===
    window.openAssignModal = function(day, period) {
        currentSlot = { day, period };
        document.getElementById('modal-slot-info').textContent = `(${day}, Period ${period})`;
        
        const key = `${day}-${period}`;
        const data = timetableData[key];

        if(data) {
            document.getElementById('modal-subject').value = data.subject || '';
            document.getElementById('modal-teacher').value = data.teacher || '';
            document.getElementById('modal-room').value = data.room || '';
        } else {
            form.reset();
        }

        if(modal) {
             modal.show();
        } else {
            // Fallback
             modalElement.classList.remove('hidden');
             modalElement.classList.add('flex');
        }
    };

    // Close Handler for fallback
    document.querySelectorAll('[data-modal-hide]').forEach(btn => {
        btn.addEventListener('click', () => {
             if(modal) modal.hide();
             else {
                 modalElement.classList.add('hidden');
                 modalElement.classList.remove('flex');
             }
        });
    });

    // === Form Submit ===
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const subject = document.getElementById('modal-subject').value;
        const teacher = document.getElementById('modal-teacher').value;
        const room = document.getElementById('modal-room').value;
        
        const key = `${currentSlot.day}-${currentSlot.period}`;
        
        // Conflict Check (Simple)
        // Check if teacher assigned elsewhere in same period
        const conflict = Object.entries(timetableData).find(([k, v]) => {
            return k.endsWith(`-${currentSlot.period}`) && k !== key && v.teacher === teacher && teacher !== "";
        });

        if (conflict) {
             if(!confirm(`${teacher} is already assigned on ${conflict[0].split('-')[0]} Period ${currentSlot.period}. Continue?`)) {
                 return;
             }
        }

        // Save
        timetableData[key] = { subject, teacher, room };
        renderGrid();
        
        if(modal) modal.hide();
        else {
             modalElement.classList.add('hidden');
             modalElement.classList.remove('flex');
        }
    });

    window.clearSlot = function() {
        const key = `${currentSlot.day}-${currentSlot.period}`;
        delete timetableData[key];
        renderGrid();
        if(modal) modal.hide();
        else {
            modalElement.classList.add('hidden');
            modalElement.classList.remove('flex');
        }
    };

    window.clearTimetable = function() {
        if(confirm('Are you sure you want to clear the entire timetable?')) {
            timetableData = {};
            renderGrid();
        }
    };

    window.saveTimetable = function() {
         document.getElementById('toast-timetable').classList.remove('hidden');
         setTimeout(() => document.getElementById('toast-timetable').classList.add('hidden'), 3000);
    }

})();
