(function() {
    // === Tab Logic ===
    window.switchSettingsTab = function(tabId) {
        // Headers
        document.querySelectorAll('#settings-tabs button').forEach(btn => {
            btn.classList.remove('text-primary-600', 'border-primary-600', 'active-tab-btn');
            btn.classList.add('border-transparent');
            if(btn.id === `${tabId}-tab`) {
                 btn.classList.add('text-primary-600', 'border-primary-600', 'active-tab-btn');
                 btn.classList.remove('border-transparent');
            }
        });

        // Content
        document.querySelectorAll('#settings-content > div').forEach(div => {
            div.classList.add('hidden');
        });
        document.getElementById(tabId).classList.remove('hidden');
    };

    // === Grading Logic ===
    let grades = [
        { name: 'A', min: 90, max: 100 },
        { name: 'B', min: 80, max: 89 },
        { name: 'C', min: 70, max: 79 },
        { name: 'D', min: 60, max: 69 },
        { name: 'F', min: 0, max: 59 }
    ];

    function renderGrades() {
        const tbody = document.getElementById('grade-table-body');
        if(!tbody) return;
        tbody.innerHTML = '';
        grades.forEach((g, i) => {
            tbody.innerHTML += `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">${g.name}</td>
                    <td class="px-6 py-4">${g.min}%</td>
                    <td class="px-6 py-4">${g.max}%</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900 dark:text-green-300">Active</span></td>
                    <td class="px-6 py-4">
                        <button onclick="deleteGrade(${i})" class="text-red-600 hover:underline">Delete</button>
                    </td>
                </tr>
            `;
        });
    }

    window.addGradeRow = function() {
        const name = prompt('Enter Grade Name (e.g. A+):');
        if(!name) return;
        const min = prompt('Min Percentage:');
        const max = prompt('Max Percentage:');
        if(name && min && max) {
            grades.push({ name, min, max });
            renderGrades();
        }
    };

    window.deleteGrade = function(index) {
        if(confirm('Delete this grade?')) {
            grades.splice(index, 1);
            renderGrades();
        }
    };

    // === Backup Logic ===
    window.createBackup = function() {
        const btn = document.querySelector('button[onclick="createBackup()"]');
        const progress = document.getElementById('backup-progress');
        const bar = progress.querySelector('div');

        btn.disabled = true;
        progress.classList.remove('hidden');
        let width = 0;
        
        const interval = setInterval(() => {
            width += 10;
            bar.style.width = width + '%';
            if(width >= 100) {
                clearInterval(interval);
                btn.disabled = false;
                progress.classList.add('hidden');
                
                // Add to history
                const tbody = document.getElementById('backup-history-body');
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4">${new Date().toLocaleString()}</td>
                    <td class="px-6 py-4">backup_${Date.now()}.sql</td>
                     <td class="px-6 py-4">3.1 MB</td>
                    <td class="px-6 py-4"><a href="#" class="text-primary-600 hover:underline">Download</a></td>
                `;
                tbody.prepend(tr);
                
                showToast('Backup created successfully!');
            }
        }, 300);
    };

    // === Messages ===
    window.testEmail = function() {
        const originalText = event.target.textContent;
        event.target.textContent = 'Sending...';
        setTimeout(() => {
            showToast('Test Email sent successfully!');
            event.target.textContent = originalText;
        }, 1500);
    };

    window.testSMS = function() {
        const originalText = event.target.textContent;
        event.target.textContent = 'Sending...';
        setTimeout(() => {
            showToast('Test SMS sent successfully!');
            event.target.textContent = originalText;
        }, 1500);
    };

    function showToast(msg) {
        const toast = document.getElementById('toast-settings');
        toast.querySelector('.font-normal').textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    // === General Processing ===
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Save logic would go here (localStorage)
            showToast('Settings saved successfully!');
        });
    });

    // Init
    switchSettingsTab('general');
    renderGrades();

})();
