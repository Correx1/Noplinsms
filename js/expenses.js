// Expenses Management Module
(function() {
    console.log('Expenses Script Loaded');

    let incomeData = [];
    let expensesData = [];

    // DOM Elements
    const tableBody = document.getElementById('expenses-table-body');
    const form = document.getElementById('add-expense-form');
    const invoiceInput = document.getElementById('exp-invoice');
    const dateInput = document.getElementById('exp-date');

    // Initialize
    dateInput.value = new Date().toISOString().split('T')[0];
    loadAllFinancialData();

    async function loadAllFinancialData() {
        try {
            // Load Income (For Summary)
            const incRes = await fetch('../../data/income-data.json');
            const storedInc = localStorage.getItem('finance_income');
            if (storedInc) {
                incomeData = JSON.parse(storedInc);
            } else {
                incomeData = await incRes.json();
                localStorage.setItem('finance_income', JSON.stringify(incomeData));
            }

            // Load Expenses
            const expRes = await fetch('../../data/expenses-data.json');
            const storedExp = localStorage.getItem('finance_expenses');
            if (storedExp) {
                expensesData = JSON.parse(storedExp);
            } else {
                expensesData = await expRes.json();
                localStorage.setItem('finance_expenses', JSON.stringify(expensesData));
            }

            renderDashboard();
            renderTable(expensesData);

        } catch (e) { console.error('Error loading finance data:', e); }
    }

    function renderDashboard() {
        const totalInc = incomeData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const totalExp = expensesData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const net = totalInc - totalExp;

        document.getElementById('dash-total-income').textContent = formatCurrency(totalInc);
        document.getElementById('dash-total-expenses').textContent = formatCurrency(totalExp);
        
        const netEl = document.getElementById('dash-net-profit');
        netEl.textContent = formatCurrency(net);
        if(net >= 0) {
            netEl.className = 'text-2xl font-bold text-green-600 dark:text-green-500';
        } else {
            netEl.className = 'text-2xl font-bold text-red-600 dark:text-red-500';
        }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        if(data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No records found</td></tr>';
            return;
        }

        // Sort by date desc
        data.sort((a,b) => new Date(b.date) - new Date(a.date));

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            tr.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap">${item.date}</td>
                <td class="px-4 py-3">
                    <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                        ${item.type}
                    </span>
                </td>
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${item.payee}</td>
                <td class="px-4 py-3">${item.invoice}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-red-600">${formatCurrency(item.amount)}</td>
                <td class="px-4 py-3">${item.method}</td>
                <td class="px-4 py-3 text-center">
                    <button class="text-blue-600 hover:underline mr-2" onclick="alert('View details for ${item.invoice}')">View</button>
                    <button class="text-red-600 hover:underline" onclick="deleteExpense('${item.id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Add Expense Handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newItem = {
            id: 'EXP' + Date.now(),
            date: document.getElementById('exp-date').value,
            type: document.getElementById('exp-type').value,
            payee: document.getElementById('exp-payee').value,
            invoice: document.getElementById('exp-invoice').value || 'N/A',
            amount: parseFloat(document.getElementById('exp-amount').value),
            method: document.getElementById('exp-method').value,
            description: document.getElementById('exp-desc').value,
            addedBy: 'Admin'
        };

        expensesData.push(newItem);
        saveData();
        
        // Reset
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        
        renderDashboard(); 
        renderTable(expensesData);
        alert('Expense Added Successfully');
    });

    window.deleteExpense = function(id) {
        if(confirm('Are you sure you want to delete this record?')) {
            expensesData = expensesData.filter(i => i.id !== id);
            saveData();
            renderDashboard();
            renderTable(expensesData);
        }
    };

    window.exportExpenses = function() {
        alert('Exporting Expenses Data to Excel (Mock)...');
    };

    function saveData() {
        localStorage.setItem('finance_expenses', JSON.stringify(expensesData));
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    }
    
    // Search & Filter Listeners
    const searchInput = document.getElementById('filter-search');
    const dateFilter = document.getElementById('filter-date');
    
    function filterData() {
        const text = searchInput.value.toLowerCase();
        const date = dateFilter.value;
        
        const filtered = expensesData.filter(item => {
            const matchText = item.payee.toLowerCase().includes(text) || 
                              item.invoice.toLowerCase().includes(text) || 
                              item.type.toLowerCase().includes(text);
            const matchDate = date ? item.date === date : true;
            return matchText && matchDate;
        });
        
        renderTable(filtered);
    }

    searchInput.addEventListener('input', filterData);
    dateFilter.addEventListener('change', filterData);

})();
