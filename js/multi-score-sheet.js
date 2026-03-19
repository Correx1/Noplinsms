// Multi Score Sheet Logic
(function() {
    console.log('Multi Score Sheet Setup Started');

    let studentsData = [];
    let classesData = [];
    let subjectsData = [];
    let structuresData = [];
    let boundariesData = [];
    
    let activeComponents = [];

    async function loadInitialData() {
        try {
            // Load Mock Datasets
            const [clsRes, subRes] = await Promise.all([
                fetch('../../data/classes-data.json'),
                fetch('../../data/subjects-data.json')
            ]);
            
            classesData = await clsRes.json();
            subjectsData = await subRes.json();
            
            studentsData = [
                 { id: '1', name: 'John Doe', roll: 'STD-001', class: 'JSS1' },
                 { id: '2', name: 'Jane Smith', roll: 'STD-002', class: 'JSS1' },
                 { id: '3', name: 'Adekunle Gold', roll: 'STD-003', class: 'JSS2' },
                 { id: '4', name: 'Chioma Jesus', roll: 'STD-004', class: 'SS1' },
                 { id: '5', name: 'Ngozi Okonjo', roll: 'STD-005', class: 'JSS1' }
            ];

            // LocalStorage Dependencies
            const savedStruct = localStorage.getItem('gradingStructuresData');
            if (savedStruct && JSON.parse(savedStruct).length > 0) {
                let parsed = JSON.parse(savedStruct);
                // MIGRATION: Scrub spaces out of legacy cached target strings to prevent string match failures against pristine JSON
                parsed.forEach(p => {
                    p.classes = p.classes.map(clsStr => clsStr.replace(/\s+/g, ''));
                });
                structuresData = parsed;
                localStorage.setItem('gradingStructuresData', JSON.stringify(structuresData));
            } else {
                structuresData = [
                    {
                        id: 'STR-JSS',
                        name: 'Junior Secondary Model',
                        classes: ['JSS1', 'JSS2', 'JSS3'],
                        components: [
                            { id: 'C3', name: 'Test 1', weight: 10, assessment: '' },
                            { id: 'C4', name: 'Test 2', weight: 10, assessment: '' },
                            { id: 'C4b', name: 'Assignment', weight: 10, assessment: '' },
                            { id: 'C5', name: 'Terminal Exam', weight: 70, assessment: '' }
                        ]
                    },
                    {
                        id: 'STR-SSS3',
                        name: 'SS3 Mock Only Layout',
                        classes: ['SS3'],
                        components: [
                            { id: 'C6', name: 'External Mock Exam', weight: 100, assessment: '' }
                        ]
                    }
                ];
                localStorage.setItem('gradingStructuresData', JSON.stringify(structuresData));
            }

            const savedBounds = localStorage.getItem('gradeBoundariesData');
            if (savedBounds) {
                boundariesData = JSON.parse(savedBounds);
            } else {
                boundariesData = [
                    { id: '1', grade: 'A1', min: 75, max: 100, remark: 'Excellent' },
                    { id: '2', grade: 'B2', min: 70, max: 74, remark: 'Very Good' },
                    { id: '3', grade: 'B3', min: 65, max: 69, remark: 'Good' },
                    { id: '4', grade: 'C4', min: 60, max: 64, remark: 'Credit' },
                    { id: '5', grade: 'C5', min: 55, max: 59, remark: 'Credit' },
                    { id: '6', grade: 'C6', min: 50, max: 54, remark: 'Credit' },
                    { id: '7', grade: 'D7', min: 45, max: 49, remark: 'Pass' },
                    { id: '8', grade: 'E8', min: 40, max: 44, remark: 'Pass' },
                    { id: '9', grade: 'F9', min: 0, max: 39, remark: 'Fail' }
                ];
            }
            
            // Sort boundaries descending by min for correct filtering later
            boundariesData.sort((a,b) => b.min - a.min);

            populateDropdowns();
        } catch(e) {
            console.error('Error loading datasets:', e);
        }
    }

    function populateDropdowns() {
        const classSelect = document.getElementById('ms-class');
        const subSelect = document.getElementById('ms-subject');
        
        if(!classSelect) return;

        classSelect.innerHTML = '<option value="">-- Select Class --</option>';
        classesData.forEach(c => {
            classSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        });

        subSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        subjectsData.forEach(s => {
            subSelect.innerHTML += `<option value="${s.name}">${s.name}</option>`;
        });
    }

    window.loadMultiSheet = function() {
        const clsValue = document.getElementById('ms-class').value;
        const subValue = document.getElementById('ms-subject').value;

        if(!clsValue || !subValue) return;

        // 1. Find correct Structure
        let activeStruct = structuresData.find(s => s.classes.includes(clsValue));

        if(!activeStruct) {
            // Unassigned fallback requested by user natively generated
            activeStruct = {
                id: 'STR-GenericDefault',
                name: 'System Default Fallback',
                classes: [clsValue],
                components: [
                    { id: 'C_D1', name: 'Continuous Assessment', weight: 40, assessment: '' },
                    { id: 'C_D2', name: 'Final Exam', weight: 60, assessment: 'EXM-Final' }
                ]
            };
        }

        activeComponents = activeStruct.components;

        let totalWeightSetup = activeComponents.reduce((sum, c) => sum + c.weight, 0);
        if(totalWeightSetup !== 100) {
            alert(`Warning: The grading structure '${activeStruct.name}' does not sum strictly to 100%. It sums to ${totalWeightSetup}%. Go configure it properly before entering marks!`);
            // Allowing it to render anyway for testing flexibility
        }

        // 2. Fetch Students
        let targetStudents = studentsData.filter(s => s.class === clsValue);
        
        // Auto-generate deep mock data if empty bounds
        if(targetStudents.length === 0) {
            targetStudents = Array.from({length: 6}, (_, i) => ({
                id: Date.now() + i,
                name: `Mock Student ${i+1}`,
                roll: `ST-${clsValue.replace(' ', '')}-00${i+1}`,
                class: clsValue
            }));
        }

        // 3. UI Ribbons
        document.getElementById('ms-title-display').textContent = `${subValue} - ${clsValue}`;
        document.getElementById('ms-struct-display').textContent = `Using Structure: ${activeStruct.name} (${activeComponents.length} Components)`;

        // 4. Build Table Headers dynamically
        const thead = document.getElementById('ms-head');
        let thHtml = `
            <tr>
                <th scope="col" class="px-2 sm:px-4 py-3 min-w-[150px] sticky left-0 bg-gray-50 dark:bg-gray-700 z-20">Student Name</th>
        `;
        
        activeComponents.forEach(c => {
            thHtml += `<th scope="col" class="px-2 sm:px-4 py-3 w-20 sm:w-28">${c.name} (${c.weight})</th>`;
        });
        
        thHtml += `
            <th scope="col" class="px-2 sm:px-4 py-3 w-20 sm:w-24 font-bold text-gray-900 dark:text-white">Total</th>
            <th scope="col" class="px-2 sm:px-4 py-3 w-16 sm:w-20">Grade</th>
            <th scope="col" class="px-2 sm:px-4 py-3 w-20 sm:w-28 text-center">Remark</th>
            </tr>
        `;
        thead.innerHTML = thHtml;

        // 5. Build Table Rows dynamically
        const tbody = document.getElementById('ms-body');
        tbody.innerHTML = '';

        if(targetStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${activeComponents.length + 4}" class="px-6 py-4 text-center text-gray-500">No students found for this class.</td></tr>`;
        } else {
            targetStudents.forEach(student => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
                
                let tdHtml = `
                    <td class="px-2 sm:px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap sticky left-0 bg-inherit dark:bg-gray-800 z-10 border-r dark:border-gray-700 transition-colors">
                        ${student.name}
                        <div class="text-[10px] text-gray-500 font-normal">${student.roll}</div>
                    </td>
                `;

                activeComponents.forEach(c => {
                    tdHtml += `
                        <td class="px-2 sm:px-4 py-2">
                             <input type="number" min="0" max="${c.weight}" data-weight="${c.weight}" class="score-input bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-primary-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0" oninput="window.calcMultiSheetRow(this)">
                        </td>
                    `;
                });

                tdHtml += `
                    <td class="px-2 sm:px-4 py-3 font-bold text-gray-900 dark:text-white text-base sm:text-lg tabular-nums row-total">0</td>
                    <td class="px-2 sm:px-4 py-3 font-bold row-grade text-sm sm:text-base">-</td>
                    <td class="px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-center row-remark">-</td>
                `;
                
                tr.innerHTML = tdHtml;
                tbody.appendChild(tr);
            });
        }

        document.getElementById('ms-table-container').classList.remove('hidden');
    };

    window.calcMultiSheetRow = function(inputEl) {
        // Clamp bounds
        const max = parseInt(inputEl.getAttribute('data-weight'));
        let val = parseFloat(inputEl.value);
        if(val > max) {
            inputEl.value = max;
            val = max;
        }
        if(val < 0) {
            inputEl.value = 0;
            val = 0;
        }

        const tr = inputEl.closest('tr');
        const inputs = tr.querySelectorAll('.score-input');
        
        let sum = 0;
        inputs.forEach(inp => {
            const v = parseFloat(inp.value);
            if(!isNaN(v)) {
                sum += v;
            }
        });

        const totalEl = tr.querySelector('.row-total');
        const gradeEl = tr.querySelector('.row-grade');
        const remarkEl = tr.querySelector('.row-remark');
        
        // Update sum
        totalEl.textContent = sum;

        // Find boundary
        const boundary = boundariesData.find(b => sum >= b.min && sum <= b.max);
        
        if(boundary) {
            gradeEl.textContent = boundary.grade;
            remarkEl.textContent = boundary.remark;
            
            // Color logic exactly replicating default grade remark colors
            if (sum >= 50) {
                gradeEl.className = 'px-2 sm:px-4 py-3 font-bold row-grade text-sm sm:text-base text-green-600';
                remarkEl.className = 'px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-center row-remark text-green-600';
            } else if (sum >= 40) {
                gradeEl.className = 'px-2 sm:px-4 py-3 font-bold row-grade text-sm sm:text-base text-yellow-500';
                remarkEl.className = 'px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-center row-remark text-yellow-500';
            } else {
                gradeEl.className = 'px-2 sm:px-4 py-3 font-bold row-grade text-sm sm:text-base text-red-600';
                remarkEl.className = 'px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-center row-remark text-red-600';
            }
        } else {
            gradeEl.textContent = '-';
            remarkEl.textContent = '-';
            gradeEl.className = 'px-2 sm:px-4 py-3 font-bold row-grade text-sm sm:text-base';
            remarkEl.className = 'px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-center row-remark';
        }
    };

    window.saveAllMultiMarks = function() {
        if(!document.getElementById('ms-marks-form').checkValidity()) {
            document.getElementById('ms-marks-form').reportValidity();
            return;
        }
        alert('Success! All multi-component scores have been processed and saved.');
        document.getElementById('ms-table-container').classList.add('hidden');
    };

    setTimeout(loadInitialData, 100);

})();
