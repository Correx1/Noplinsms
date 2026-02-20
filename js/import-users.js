// Import Users Module Logic
(function() {
    let currentImportType = '';
    let parsedData = [];

    // Load import history on page load
    loadImportHistory();

    // Handle File Selection
    window.handleFileSelect = function(input, type) {
        const file = input.files[0];
        if (!file) return;

        currentImportType = type;
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();

        if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
            alert('Please select a CSV or Excel file.');
            input.value = '';
            return;
        }

        // For demo purposes, simulate parsing a CSV file
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            
            if (fileExtension === 'csv') {
                parsedData = parseCSV(content);
            } else {
                // For Excel files, show a message (would need a library like SheetJS in production)
                parsedData = [];
                alert('Excel file detected. In production, this would use SheetJS library to parse. For now, please use CSV format.');
                input.value = '';
                return;
            }

            if (parsedData.length > 0) {
                showPreview(parsedData, type, fileName);
            }
        };
        reader.readAsText(file);
        input.value = ''; // Reset file input
    };

    // Parse CSV
    function parseCSV(content) {
        const lines = content.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }

        return data;
    }

    // Show Preview
    function showPreview(data, type, fileName) {
        const section = document.getElementById('import-preview-section');
        const thead = document.getElementById('preview-thead');
        const tbody = document.getElementById('preview-tbody');
        const title = document.getElementById('preview-title');
        const info = document.getElementById('preview-info');
        const count = document.getElementById('import-count');

        title.textContent = `Preview: Import ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        info.textContent = `File: ${fileName} | ${data.length} records found`;
        count.textContent = data.length;

        // Build header
        const headers = Object.keys(data[0]);
        thead.innerHTML = '<tr>' + headers.map(h => 
            `<th class="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">${h}</th>`
        ).join('') + '</tr>';

        // Build body (show max 10 rows)
        const previewRows = data.slice(0, 10);
        tbody.innerHTML = previewRows.map(row => 
            '<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">' + headers.map(h => 
                `<td class="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">${row[h] || ''}</td>`
            ).join('') + '</tr>'
        ).join('');

        if (data.length > 10) {
            tbody.innerHTML += `<tr><td colspan="${headers.length}" class="p-3 text-sm text-center text-gray-500 dark:text-gray-400">... and ${data.length - 10} more rows</td></tr>`;
        }

        section.classList.remove('hidden');
    }

    // Cancel Import
    window.cancelImport = function() {
        document.getElementById('import-preview-section').classList.add('hidden');
        parsedData = [];
        currentImportType = '';
    };

    // Confirm Import
    window.confirmImport = function() {
        if (parsedData.length === 0) return;

        const btn = document.getElementById('confirm-import-btn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Importing...';

        // Simulate import processing
        setTimeout(() => {
            // Save to import history
            const history = JSON.parse(localStorage.getItem('importHistory') || '[]');
            history.unshift({
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                type: currentImportType,
                fileName: document.getElementById('preview-info').textContent.split('|')[0].replace('File: ', '').trim(),
                records: parsedData.length,
                status: 'Completed'
            });
            localStorage.setItem('importHistory', JSON.stringify(history.slice(0, 20)));

            // Show success toast
            const toast = document.getElementById('toast-import');
            document.getElementById('toast-import-message').textContent = `${parsedData.length} ${currentImportType} imported successfully!`;
            toast.classList.remove('hidden');

            // Reset
            btn.innerHTML = originalText;
            btn.disabled = false;
            document.getElementById('import-preview-section').classList.add('hidden');
            parsedData = [];
            currentImportType = '';

            // Refresh history
            loadImportHistory();

            setTimeout(() => toast.classList.add('hidden'), 3000);
        }, 1500);
    };

    // Download Template
    window.downloadTemplate = function(type) {
        let csvContent = '';
        
        switch(type) {
            case 'students':
                csvContent = 'First Name,Last Name,Date of Birth,Gender,Class,Section,Parent Name,Parent Phone,Email,Address\nJohn,Doe,2010-05-15,Male,JSS1,A,Jane Doe,08012345678,john.doe@example.com,123 Main St';
                break;
            case 'teachers':
                csvContent = 'First Name,Last Name,Date of Birth,Gender,Phone,Email,Qualification,Specialization,Joining Date,Salary,Employment Type,Address\nJane,Smith,1985-04-12,Female,08012345678,jane.smith@example.com,M.Sc Mathematics,Mathematics,2020-01-15,150000,Full-time,456 Oak Avenue';
                break;
            case 'staff':
                csvContent = 'First Name,Last Name,Date of Birth,Gender,Phone,Email,Department,Designation,Qualification,Joining Date,Salary,Employment Type,Address\nJohn,Smith,1982-11-08,Male,08123456780,john.smith@example.com,Administrative,Accountant,B.Sc Accounting,2017-05-10,130000,Full-time,789 Pine Road';
                break;
            case 'parents':
                csvContent = 'First Name,Last Name,Gender,Phone,Email,Occupation,Address,Student Name,Student Class\nJane,Doe,Female,08012345678,jane.doe@example.com,Teacher,123 Main St,John Doe,JSS1 A';
                break;
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-import-template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Load Import History
    function loadImportHistory() {
        const tbody = document.getElementById('import-history-body');
        const history = JSON.parse(localStorage.getItem('importHistory') || '[]');

        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500 dark:text-gray-400">No import history found.</td></tr>';
            return;
        }

        tbody.innerHTML = history.map(item => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="p-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">${item.date} ${item.time || ''}</td>
                <td class="p-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                    <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">${item.type}</span>
                </td>
                <td class="p-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">${item.fileName}</td>
                <td class="p-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">${item.records}</td>
                <td class="p-4 text-sm whitespace-nowrap">
                    <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">${item.status}</span>
                </td>
            </tr>
        `).join('');
    }

})();
