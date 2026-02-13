// Income Management Module
(function() {
    console.log('Income Script Loaded');

    let incomeData = [];
    let expensesData = []; // Needed for summary

    // DOM Elements
    const tableBody = document.getElementById('income-table-body');
    const form = document.getElementById('add-income-form');
    const invoiceInput = document.getElementById('inc-invoice');
    const dateInput = document.getElementById('inc-date');

    // Initialize
    dateInput.value = new Date().toISOString().split('T')[0];
    generateInvoiceNumber();
    loadAllFinancialData();

    // Generate Invoice ID
    function generateInvoiceNumber() {
        const rnd = Math.floor(Math.random() * 10000);
        invoiceInput.value = `INV-${rnd}`;
    }

    async function loadAllFinancialData() {
        try {
            // Load Income
            const incRes = await fetch('../../data/income-data.json');
            // If localStorage has updates, merging logic would go here. For now, simple mock.
            const storedInc = localStorage.getItem('finance_income');
            if (storedInc) {
                incomeData = JSON.parse(storedInc);
            } else {
                incomeData = await incRes.json();
                localStorage.setItem('finance_income', JSON.stringify(incomeData));
            }

            // Load Expenses (For Dashboard Summary)
            const expRes = await fetch('../../data/expenses-data.json');
            const storedExp = localStorage.getItem('finance_expenses');
            if (storedExp) {
                expensesData = JSON.parse(storedExp);
            } else {
                expensesData = await expRes.json();
                localStorage.setItem('finance_expenses', JSON.stringify(expensesData));
            }

            renderDashboard();
            renderTable(incomeData);

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
                    <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                        ${item.type}
                    </span>
                </td>
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${item.name}</td>
                <td class="px-4 py-3">${item.invoice}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-green-600">${formatCurrency(item.amount)}</td>
                <td class="px-4 py-3">${item.method}</td>
                <td class="px-4 py-3 text-center">
                    <button class="text-blue-600 hover:underline mr-2" onclick="alert('View details for ${item.invoice}')">View</button>
                    <button class="text-red-600 hover:underline" onclick="deleteIncome('${item.id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Add Income Handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newItem = {
            id: 'INC' + Date.now(),
            date: document.getElementById('inc-date').value,
            type: document.getElementById('inc-type').value,
            name: document.getElementById('inc-name').value,
            invoice: document.getElementById('inc-invoice').value,
            amount: parseFloat(document.getElementById('inc-amount').value),
            method: document.getElementById('inc-method').value,
            description: document.getElementById('inc-desc').value,
            addedBy: 'Admin' // mock
        };

        incomeData.push(newItem);
        saveData();
        
        // Reset
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0]; // restore date
        generateInvoiceNumber();
        
        renderDashboard(); // Update Summary
        renderTable(incomeData); // Update Table
        alert('Income Added Successfully');
    });

    window.deleteIncome = function(id) {
        if(confirm('Are you sure you want to delete this record?')) {
            incomeData = incomeData.filter(i => i.id !== id);
            saveData();
            renderDashboard();
            renderTable(incomeData);
        }
    };

    window.exportIncome = function() {
        alert('Exporting Income Data to Excel (Mock)...');
        // In real app, use SheetJS or similar
    };

    function saveData() {
        localStorage.setItem('finance_income', JSON.stringify(incomeData));
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
        
        const filtered = incomeData.filter(item => {
            const matchText = item.name.toLowerCase().includes(text) || 
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
