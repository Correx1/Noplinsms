(function() {
    const form = document.getElementById('marks-filter-form');
    const container = document.getElementById('marks-container');
    const tableBody = document.getElementById('marks-table-body');
    const toast = document.getElementById('toast-marks');

    if(form) {
        form.addEventListener('submit', function(e) {
             e.preventDefault();
             loadStudentsForMarks();
        });
    }

    function loadStudentsForMarks() {
        // Show loading state
        container.classList.remove('hidden');
        tableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary-600"></i></td></tr>';

        const selectedClass = document.getElementById('class-select').value;
        const selectedSection = document.getElementById('section-select').value;

        fetch('../../data/students-data.json')
            .then(res => res.json())
            .then(data => {
                // Filter Logic
                let filtered = data;
                // Since mock data only has a few records, we might not find exact matches for all class/section
                // So we'll be lenient if filter returns empty for demo purposes
                if(selectedClass) {
                   const exactMatch = filtered.filter(s => s.class === selectedClass && s.section === selectedSection);
                   filtered = exactMatch.length > 0 ? exactMatch : filtered; // Fallback to all if no match
                }
                
                renderMarksTable(filtered);
            })
            .catch(err => console.error(err));
    }

    function renderMarksTable(students) {
        tableBody.innerHTML = '';
        if(students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-gray-500">No students found.</td></tr>';
            return;
        }

        students.forEach((student, index) => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600';
            
            // Mock random existing marks
            const mockTh = Math.floor(Math.random() * 50) + 10;
            const mockPr = Math.floor(Math.random() * 20) + 5;
            const total = mockTh + mockPr;
            const grade = calculateGrade(total);

            // Using simple index as Roll No if not present
            const rollNo = student.academic?.roll_no || (index + 1).toString().padStart(3, '0');

            tr.innerHTML = `
                <td class="px-6 py-4 font-medium">${rollNo}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                         <img class="w-8 h-8 rounded-full mr-3" src="${student.photo}" alt="Avatar">
                         <span class="font-medium text-gray-900 dark:text-white">${student.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <input type="number" min="0" max="70" class="marks-input theory-input w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5" value="${mockTh}" data-id="${student.id}">
                </td>
                <td class="px-6 py-4">
                    <input type="number" min="0" max="30" class="marks-input pract-input w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5" value="${mockPr}" data-id="${student.id}">
                </td>
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-white total-cell" id="total-${student.id}">
                    ${total}
                </td>
                <td class="px-6 py-4">
                     <span class="grade-badge px-2 py-1 rounded text-xs font-semibold ${getGradeColor(grade)}" id="grade-${student.id}">
                        ${grade}
                     </span>
                </td>
                <td class="px-6 py-4">
                    <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Good" value="">
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Add Event Listeners for Calculation
        document.querySelectorAll('.marks-input').forEach(input => {
            input.addEventListener('input', handleMarksChange);
        });
    }

    function handleMarksChange(e) {
        const input = e.target;
        let val = parseInt(input.value) || 0;
        const max = parseInt(input.getAttribute('max'));
        
        // Validation
        if(val > max) {
            val = max;
            input.value = max;
        } else if(val < 0) {
            val = 0;
            input.value = 0;
        }

        const row = input.closest('tr');
        const theory = parseInt(row.querySelector('.theory-input').value) || 0;
        const pract = parseInt(row.querySelector('.pract-input').value) || 0;
        const total = theory + pract;
        const grade = calculateGrade(total);
        const sid = input.dataset.id;

        // Update Total
        document.getElementById(`total-${sid}`).textContent = total;
        
        // Update Grade
        const gradeBadge = document.getElementById(`grade-${sid}`);
        gradeBadge.textContent = grade;
        gradeBadge.className = `grade-badge px-2 py-1 rounded text-xs font-semibold ${getGradeColor(grade)}`;
    }

    function calculateGrade(total) {
        if (total >= 90) return 'A';
        if (total >= 80) return 'B';
        if (total >= 70) return 'C';
        if (total >= 60) return 'D';
        return 'F';
    }

    function getGradeColor(grade) {
        if (grade === 'A') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (grade === 'B') return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300';
        if (grade === 'C') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        if (grade === 'D') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }

    window.saveMarks = function(submit = false) {
        const msg = submit ? 'Marks submitted for approval!' : 'Marks saved successfully!';
        
        toast.querySelector('.text-sm').textContent = msg;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    };

    window.clearAllMarks = function() {
        if(confirm('Are you sure you want to clear all entered marks?')) {
            document.querySelectorAll('.marks-input').forEach(inp => {
                inp.value = '';
                // Trigger change to update totals
                inp.dispatchEvent(new Event('input'));
            });
        }
    }

})();
