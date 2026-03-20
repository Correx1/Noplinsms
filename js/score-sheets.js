// Score Sheets (Single Entry) Logic
(function() {
    console.log('Score Sheets (Single Entry) Setup Started');

    let studentsData = [];
    let classesData = [];
    let subjectsData = [];
    let assessmentsData = [];
    
    let activeMaxScore = 0;

    async function loadInitialData() {
        try {
            // Load Mock Datasets
            const [clsRes, subRes] = await Promise.all([
                fetch('../../data/classes-data.json'),
                fetch('../../data/subjects-data.json')
            ]);
            
            classesData = await clsRes.json();
            subjectsData = await subRes.json();
            
            // Generate Mock Students if missing
            studentsData = [
                 { id: '1', name: 'John Doe', roll: 'STD-001', class: 'JSS1' },
                 { id: '2', name: 'Jane Smith', roll: 'STD-002', class: 'JSS1' },
                 { id: '3', name: 'Adekunle Gold', roll: 'STD-003', class: 'JSS2' },
                 { id: '4', name: 'Chioma Jesus', roll: 'STD-004', class: 'SS1' },
                 { id: '5', name: 'Ngozi Okonjo', roll: 'STD-005', class: 'JSS1' }
            ];

            // Load Assessments from LocalStorage or mock json
            const savedAsm = localStorage.getItem('assessmentsData');
            if (savedAsm && JSON.parse(savedAsm).length > 0) {
                assessmentsData = JSON.parse(savedAsm);
            } else {
                assessmentsData = [
                    { id: 'ASM-1', title: 'First CA Test', totalMarks: 20, class: 'JSS1' },
                    { id: 'ASM-2', title: 'Mid-Term Assignment', totalMarks: 10, class: 'Global' },
                    { id: 'ASM-3', title: 'Terminal Mock Exams', totalMarks: 100, class: 'SS3' }
                ];
                // we don't necessarily override local storage for assessments directly as they might fetch from json natively later, but we ensure its loaded.
            }

            populateDropdowns();
        } catch(e) {
            console.error('Error loading datasets for score sheets:', e);
        }
    }

    function populateDropdowns() {
        const classSelect = document.getElementById('sheet-class');
        const subSelect = document.getElementById('sheet-subject');
        const asmSelect = document.getElementById('sheet-assessment');
        
        if(!classSelect) return;

        classSelect.innerHTML = '<option value="">-- Select Class --</option>';
        classesData.forEach(c => {
            classSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        });

        subSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        subjectsData.forEach(s => {
            subSelect.innerHTML += `<option value="${s.name}">${s.name}</option>`;
        });

        asmSelect.innerHTML = '<option value="">-- Select Exam/Assessment --</option>';
        assessmentsData.forEach(a => {
            // Include class and marks in label to be helpful
            asmSelect.innerHTML += `<option value="${a.id}">${a.title} (${a.totalMarks} Marks) - ${a.class}</option>`;
        });
    }

    window.loadSingleSheet = function() {
        const clsValue = document.getElementById('sheet-class').value;
        const subValue = document.getElementById('sheet-subject').value;
        const asmId = document.getElementById('sheet-assessment').value;

        if(!clsValue || !subValue || !asmId) return;

        // Retrieve Assessment Details
        const assessment = assessmentsData.find(a => a.id === asmId);
        if(!assessment) return;

        activeMaxScore = parseInt(assessment.totalMarks) || 0;

        // Filter students by class
        let targetStudents = studentsData.filter(s => s.class === clsValue);
        
        // Auto-generate deep mock data if empty bounds
        if(targetStudents.length === 0) {
            targetStudents = Array.from({length: 6}, (_, i) => ({
                id: Date.now() + i,
                name: `Demo Student ${i+1}`,
                roll: `ST-${clsValue.replace(' ', '')}-00${i+1}`,
                class: clsValue
            }));
        }

        // Update UI ribbon
        document.getElementById('sheet-title-display').textContent = `${subValue} - ${clsValue}`;
        document.getElementById('sheet-asm-display').textContent = `${assessment.title} (Max Score: ${activeMaxScore})`;
        document.getElementById('sheet-score-col').textContent = `Score ( /${activeMaxScore} )`;

        // Render Table
        const tbody = document.getElementById('sheet-table-body');
        tbody.innerHTML = '';

        if(targetStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No students found for this class.</td></tr>';
        } else {
            targetStudents.forEach((student, index) => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
                tr.innerHTML = `
                    <td class="px-6 py-4">${index + 1}</td>
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 border-r dark:border-gray-700">${student.name}</td>
                    <td class="px-6 py-4 text-xs">${student.roll}</td>
                    <td class="px-6 py-4">
                        <input type="number" min="0" max="${activeMaxScore}" class="bg-gray-50 border border-gray-300 text-gray-900 text-lg sm:text-sm font-bold sm:font-normal rounded-lg focus:ring-primary-500 block w-full min-w-[80px] p-3 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 h-12 sm:h-auto text-center sm:text-left" placeholder="0" oninput="window.validateScore(this, ${activeMaxScore})" required>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <i class="fas fa-circle text-gray-300 dark:text-gray-600 text-[10px]" title="Pending"></i>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Show container
        document.getElementById('sheet-table-container').classList.remove('hidden');
    };

    window.validateScore = function(input, max) {
        let val = parseFloat(input.value);
        if(val > max) {
            alert(`Error: The mark entered exceeds the maximum limit of ${max}.`);
            input.value = '';
        }
        if(val < 0) {
            input.value = '';
        }
        
        // update status dot adjacent
        const dot = input.parentElement.nextElementSibling.querySelector('i');
        if(input.value !== '') {
            dot.className = 'fas fa-check-circle text-green-500 text-sm';
            dot.title = 'Entered';
        } else {
            dot.className = 'fas fa-circle text-gray-300 dark:text-gray-600 text-[10px]';
            dot.title = 'Pending';
        }
    };

    window.saveMarks = function() {
        // Validate form native stuff
        if(!document.getElementById('marks-form').checkValidity()) {
            document.getElementById('marks-form').reportValidity();
            return;
        }

        alert('Success! All scores have been saved securely for this assessment.');
        document.getElementById('sheet-table-container').classList.add('hidden');
    };

    setTimeout(loadInitialData, 100);

})();
