// User Management Logic
(function() {
    console.log('User Mgmt Script Loaded');

    let users = [
        { id: 1, username: 'admin', email: 'admin@school.com', role: 'Admin', status: 'Active', linkId: null, linkName: '-' }
    ];
    
    // Mock Data for Links
    const teachers = JSON.parse(localStorage.getItem('teachers')) || [{id:'T01', name:'Mr. A. Johnson'}, {id:'T02', name:'Ms. S. Davis'}];
    const students = JSON.parse(localStorage.getItem('students')) || [{id:'S01', name:'John Doe'}, {id:'S02', name:'Jane Smith'}];
    const parents = JSON.parse(localStorage.getItem('parents')) || [{id:'P01', name:'Dr. Doe'}, {id:'P02', name:'Mrs. Smith'}];

    const roleSelect = document.getElementById('usr-role');
    const linkContainer = document.getElementById('usr-link-container');
    const linkLabel = document.getElementById('usr-link-label');
    const linkSelect = document.getElementById('usr-link-id');
    const tbody = document.getElementById('users-table-body');
    const form = document.getElementById('add-user-form');

    init();

    function init() {
        if(localStorage.getItem('sys_users')) users = JSON.parse(localStorage.getItem('sys_users'));
        renderTable();
        
        roleSelect.addEventListener('change', handleRoleChange);
        form.addEventListener('submit', addUser);
    }

    function handleRoleChange() {
        const role = roleSelect.value;
        linkContainer.classList.add('hidden');
        linkSelect.innerHTML = '<option value="">Select...</option>';

        if (role === 'Admin') return; // No link needed

        let data = [];
        let label = '';

        if (role === 'Teacher') { data = teachers; label = 'Select Teacher'; }
        if (role === 'Student') { data = students; label = 'Select Student'; }
        if (role === 'Parent') { data = parents; label = 'Select Parent'; }

        linkLabel.textContent = label;
        data.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.name + ` (${item.id})`;
            linkSelect.appendChild(opt);
        });
        linkContainer.classList.remove('hidden');
    }

    function addUser(e) {
        e.preventDefault();
        
        const role = document.getElementById('usr-role').value;
        let linkId = null;
        let linkName = '-';

        if(role !== 'Admin') {
            linkId = document.getElementById('usr-link-id').value;
            if(!linkId) { alert('Please select a linked profile'); return; }
            linkName = document.getElementById('usr-link-id').options[document.getElementById('usr-link-id').selectedIndex].text;
        }

        const newUser = {
            id: Date.now(),
            username: document.getElementById('usr-username').value,
            email: document.getElementById('usr-email').value,
            role: role,
            status: document.getElementById('usr-status').value,
            linkId: linkId,
            linkName: linkName
        };

        users.push(newUser);
        localStorage.setItem('sys_users', JSON.stringify(users));
        renderTable();
        form.reset();
        handleRoleChange(); // Reset dynamic fields
        alert('User Created Successfully');
    }

    function renderTable() {
        tbody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    ${u.username}
                    <div class="text-xs text-gray-500">${u.email}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">${u.role}</span>
                </td>
                <td class="px-6 py-4 text-xs">${u.linkName}</td>
                 <td class="px-6 py-4">
                    <span class="${u.status === 'Active' ? 'text-green-600' : 'text-red-600'} font-bold">${u.status}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="deleteUser(${u.id})" class="text-red-600 hover:underline">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.deleteUser = (id) => {
        if(confirm('Delete this user?')) {
            users = users.filter(u => u.id !== id);
            localStorage.setItem('sys_users', JSON.stringify(users));
            renderTable();
        }
    };

})();
