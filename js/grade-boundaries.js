// Grade Boundaries Logic
(function() {
    console.log('Grade Boundaries Setup Started');
    
    // Default Boundaries
    const defaultBoundaries = [
        { id: '1', grade: 'A1', min: 75, max: 100, remark: 'Excellent' },
        { id: '2', grade: 'B2', min: 70, max: 74, remark: 'Very Good' },
        { id: '3', grade: 'B3', min: 65, max: 69, remark: 'Good' },
        { id: '4', grade: 'C4', min: 60, max: 64, remark: 'Credit' },
        { id: '5', grade: 'C5', min: 55, max: 59, remark: 'Credit' },
        { id: '6', grade: 'C6', min: 50, max: 54, remark: 'Credit' },
        { id: '7', grade: 'D7', min: 45, max: 49, remark: 'Pass' },
        { id: '8', grade: 'E8', min: 40, max: 44, remark: 'Pass' },
        { id: '9', grade: 'F9', min: 0, max: 39, remark: 'Fail' },
    ];

    let boundariesData = [];

    // Load Data
    function loadBoundaries() {
        const stored = localStorage.getItem('gradeBoundariesData');
        if (stored) {
            boundariesData = JSON.parse(stored);
        } else {
            boundariesData = [...defaultBoundaries];
            localStorage.setItem('gradeBoundariesData', JSON.stringify(boundariesData));
        }
        renderTable();
    }

    function renderTable() {
        const tbody = document.getElementById('boundaries-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Sort by Min Mark descending
        boundariesData.sort((a,b) => b.min - a.min);

        if(boundariesData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">No grade boundaries set.</td></tr>';
            return;
        }

        boundariesData.forEach(item => {
            let colorClass = 'text-green-600';
            if(item.min < 50) colorClass = 'text-yellow-600';
            if(item.min < 40) colorClass = 'text-red-600';

            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            tr.innerHTML = `
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">${item.grade}</td>
                <td class="px-6 py-4">${item.min}%</td>
                <td class="px-6 py-4">${item.max}%</td>
                <td class="px-6 py-4 font-medium ${colorClass}">${item.remark}</td>
                <td class="px-6 py-4 text-right">
                    <button type="button" onclick="window.editBoundary('${item.id}')" class="text-primary-600 hover:underline font-medium text-sm mr-3">Edit</button>
                    <button type="button" onclick="window.deleteBoundary('${item.id}')" class="text-red-600 hover:underline font-medium text-sm">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Modal Helpers
    window.openBoundaryModal = function(id = null) {
        document.getElementById('boundary-form').reset();
        document.getElementById('boundary-id').value = '';
        document.getElementById('boundary-modal-title').textContent = 'Add Grade Boundary';

        if(id) {
            document.getElementById('boundary-modal-title').textContent = 'Edit Grade Boundary';
            const item = boundariesData.find(x => x.id === id);
            if(item) {
                document.getElementById('boundary-id').value = item.id;
                document.getElementById('boundary-grade').value = item.grade;
                document.getElementById('boundary-min').value = item.min;
                document.getElementById('boundary-max').value = item.max;
                document.getElementById('boundary-remark').value = item.remark;
            }
        }

        const modal = document.getElementById('boundary-modal');
        if(modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    };

    window.closeBoundaryModal = function() {
        const modal = document.getElementById('boundary-modal');
        if(modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    };

    window.saveBoundary = function() {
        const id = document.getElementById('boundary-id').value;
        const grade = document.getElementById('boundary-grade').value;
        const min = parseInt(document.getElementById('boundary-min').value);
        const max = parseInt(document.getElementById('boundary-max').value);
        const remark = document.getElementById('boundary-remark').value;

        if(min > max) {
            alert('Minimum mark cannot be greater than maximum mark.');
            return;
        }

        if(id) {
            const index = boundariesData.findIndex(x => x.id === id);
            if(index !== -1) {
                boundariesData[index] = { id, grade, min, max, remark };
            }
        } else {
            boundariesData.push({
                id: 'BND' + Date.now(),
                grade, min, max, remark
            });
        }

        localStorage.setItem('gradeBoundariesData', JSON.stringify(boundariesData));
        window.closeBoundaryModal();
        renderTable();
    };

    window.deleteBoundary = function(id) {
        if(confirm('Delete this grade boundary?')) {
            boundariesData = boundariesData.filter(x => x.id !== id);
            localStorage.setItem('gradeBoundariesData', JSON.stringify(boundariesData));
            renderTable();
        }
    };
    
    // Explicit Export
    window.editBoundary = window.openBoundaryModal;

    // Load Initial
    setTimeout(loadBoundaries, 100);
})();
