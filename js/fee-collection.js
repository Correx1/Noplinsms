(function() {
    // === Variables ===
    const searchInput = document.getElementById('student-search');
    const feeContent = document.getElementById('fee-content');
    const searchError = document.getElementById('search-error');
    const paymentForm = document.getElementById('payment-form');
    
    // Student Info Elements
    const sName = document.getElementById('fee-student-name');
    const sPhoto = document.getElementById('fee-student-photo');
    const sId = document.getElementById('fee-student-id');
    const sClass = document.getElementById('fee-student-class');
    const sParent = document.getElementById('fee-student-parent');

    // Fee Elements
    const feeBody = document.getElementById('fee-structure-body');
    const feeTotalDisplay = document.getElementById('fee-total-display');
    const summaryPaid = document.getElementById('summary-paid');
    const summaryPending = document.getElementById('summary-pending');
    const payHistoryBody = document.getElementById('payment-history-body');

    // Payment Form Elements
    const payAmount = document.getElementById('pay-amount');
    const payDate = document.getElementById('pay-date');
    const payMethod = document.getElementById('pay-method');
    const collectBtn = document.getElementById('collect-btn');
    
    // Current State
    let currentStudent = null;
    let currentFeeData = null;
    let pendingAmount = 0;

    // Set Default Date
    if(payDate) payDate.value = new Date().toISOString().split('T')[0];

    // === Search Logic ===
    window.searchStudentFee = async function() {
        const term = searchInput.value.trim().toLowerCase();
        if(!term) return;

        try {
            console.log('Searching for:', term);
            // 1. Fetch Students - using absolute path from root
            const sRes = await fetch('../../../data/students-data.json');
            if (!sRes.ok) throw new Error('Failed to load students');
            const students = await sRes.json();
            console.log('Students loaded:', students.length);
            
            const student = students.find(s => 
                s.id.toLowerCase() === term || 
                s.name.toLowerCase().includes(term)
            );

            if (!student) {
                showError('Student not found.');
                return;
            }

            console.log('Student found:', student.name);

            // 2. Fetch Fee Data - using absolute path from root
            const fRes = await fetch('../../../data/fee-data.json');
            if (!fRes.ok) throw new Error('Failed to load fee data');
            const fees = await fRes.json();
            console.log('Fee data loaded:', fees.length);
            
            const feeData = fees.find(f => f.studentId === student.id) || createDefaultFee(student.id);
            console.log('Fee data for student:', feeData);

            // 3. Render
            loadStudentDetails(student, feeData);
            
        } catch (e) {
            console.error('Error in searchStudentFee:', e);
            showError('Error loading data: ' + e.message);
        }
    };

    function showError(msg) {
        searchError.textContent = msg;
        searchError.classList.remove('hidden');
        feeContent.classList.add('hidden');
    }

    // === Mock Default Fee if Missing ===
    function createDefaultFee(studentId) {
        return {
            studentId,
            feeStructure: [
                { type: "Tuition Fee", amount: 50000 },
                { type: "Admission Fee", amount: 10000 },
                { type: "Exam Fee", amount: 5000 }
            ],
            totalFee: 65000,
            paidAmount: 0,
            transactions: []
        };
    }

    // === Render Logic ===
    function loadStudentDetails(student, feeData) {
        currentStudent = student;
        currentFeeData = feeData;

        // Hide Error
        searchError.classList.add('hidden');
        feeContent.classList.remove('hidden');

        // Populate Info
        sName.textContent = student.name;
        sPhoto.src = student.photo;
        sId.textContent = student.id;
        sClass.textContent = `${student.class} - ${student.section}`;
        sParent.textContent = `${student.parent.father} (${student.parent.phone})`;

        // Populate Fee Structure
        renderFeeStructure(feeData);

        // Populate History
        renderHistory(feeData.transactions);
    }

    function renderFeeStructure(feeData) {
        feeBody.innerHTML = '';
        
        feeData.feeStructure.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${item.type}</td>
                <td class="px-6 py-4 text-right">₦${formatMoney(item.amount)}</td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Due</span>
                </td>
            `;
            feeBody.appendChild(tr);
        });

        feeTotalDisplay.textContent = '₦' + formatMoney(feeData.totalFee);
        
        // Update Summaries
        pendingAmount = feeData.totalFee - feeData.paidAmount;
        
        summaryPaid.textContent = '₦' + formatMoney(feeData.paidAmount);
        summaryPending.textContent = '₦' + formatMoney(pendingAmount);

        // Update Payment Max
        payAmount.max = pendingAmount;
        payAmount.value = '';
        
        // Disable form if Paid
        if(pendingAmount <= 0) {
            collectBtn.disabled = true;
            collectBtn.textContent = 'Fully Paid';
            collectBtn.classList.add('opacity-50', 'cursor-not-allowed');
            payAmount.disabled = true;
        } else {
            collectBtn.disabled = false;
            collectBtn.textContent = 'Collect Fee';
            collectBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            payAmount.disabled = false;
        }
    }

    function renderHistory(txns) {
        payHistoryBody.innerHTML = '';
        if(txns.length === 0) {
            payHistoryBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No payment history.</td></tr>';
            return;
        }

        txns.forEach(txn => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            tr.innerHTML = `
                <td class="px-4 py-2">${txn.date}</td>
                <td class="px-4 py-2 font-mono text-xs">${txn.id}</td>
                <td class="px-4 py-2">${txn.method}</td>
                <td class="px-4 py-2 text-green-600 font-medium">₦${formatMoney(txn.amount)}</td>
                 <td class="px-4 py-2">
                    <button onclick="printReceipt('${txn.id}')" class="text-primary-600 hover:underline text-sm">Download</button>
                </td>
            `;
            payHistoryBody.appendChild(tr);
        });
    }

    // === Payment Submission ===
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amt = parseFloat(payAmount.value);
        if(amt <= 0 || amt > pendingAmount) {
            alert('Invalid Amount');
            return;
        }

        collectBtn.disabled = true;
        collectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        setTimeout(() => {
            // Mock Success
            const newTxn = {
                id: 'TXN' + Date.now().toString().slice(-6),
                date: payDate.value,
                amount: amt,
                method: payMethod.value,
                remarks: document.getElementById('pay-remarks').value
            };

            // Update State
            currentFeeData.transactions.push(newTxn);
            currentFeeData.paidAmount += amt;

            // Re-render
            renderFeeStructure(currentFeeData);
            renderHistory(currentFeeData.transactions);

            // Toast
            document.getElementById('toast-fee').classList.remove('hidden');
            setTimeout(() => document.getElementById('toast-fee').classList.add('hidden'), 3000);
            
            // Trigger Print Receipt for new transaction automatically
            if(confirm('Payment Successful! Do you want to print the receipt?')) {
                printReceipt(newTxn.id);
            }

            collectBtn.disabled = false;
            collectBtn.textContent = 'Collect Fee';

        }, 1000);
    });

    // === Receipt Printing ===
    window.printReceipt = function(txnId) {
        const txn = currentFeeData.transactions.find(t => t.id === txnId);
        if(!txn) return;

        // Populate Template
        document.getElementById('receipt-no').textContent = txn.id;
        document.getElementById('receipt-date').textContent = txn.date;
        document.getElementById('receipt-name').textContent = currentStudent.name;
        document.getElementById('receipt-id').textContent = currentStudent.id;
        document.getElementById('receipt-class').textContent = `${currentStudent.class} ${currentStudent.section}`;
        
        document.getElementById('receipt-method').textContent = txn.method;
        document.getElementById('receipt-amount').textContent = '₦' + formatMoney(txn.amount);
        document.getElementById('receipt-total').textContent = '₦' + formatMoney(txn.amount);

        // Print Logic
        // We temporarily hide body contents and show only receipt, then restore.
        // Or simpler: open a new window or use CSS print media query.
        // For Single Page App, CSS Media Query is best.
        // We added 'hidden print:block' to template. 
        // But we need to hide 'main-content' when printing.
        
        const template = document.getElementById('receipt-template');
        template.classList.remove('hidden');
        
        window.print();
        
        template.classList.add('hidden');
    }

    function formatMoney(num) {
        return num.toLocaleString('en-NG');
    }

    // === Load Fee Overview Table ===
    window.loadFeeOverview = async function() {
        const overviewBody = document.getElementById('fee-overview-body');
        const totalStudentsEl = document.getElementById('overview-total-students');
        const fullyPaidEl = document.getElementById('overview-fully-paid');
        const partialEl = document.getElementById('overview-partial');
        const notPaidEl = document.getElementById('overview-not-paid');

        try {
            console.log('Loading fee overview...');
            
            // Show loading
            overviewBody.innerHTML = '<tr><td colspan="8" class="px-6 py-4 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary-600"></i></td></tr>';

            // Fetch data
            const [studentsRes, feesRes] = await Promise.all([
                fetch('../../../data/students-data.json'),
                fetch('../../../data/fee-data.json')
            ]);

            if (!studentsRes.ok || !feesRes.ok) throw new Error('Failed to load data');

            const students = await studentsRes.json();
            const fees = await feesRes.json();

            console.log('Loaded students:', students.length, 'fees:', fees.length);

            // Calculate stats
            let fullyPaid = 0, partial = 0, notPaid = 0;

            // Render table
            overviewBody.innerHTML = '';
            students.forEach(student => {
                const feeData = fees.find(f => f.studentId === student.id) || createDefaultFee(student.id);
                const pending = feeData.totalFee - feeData.paidAmount;

                // Update stats
                if (pending === 0) fullyPaid++;
                else if (feeData.paidAmount > 0) partial++;
                else notPaid++;

                // Status badge
                let statusBadge = '';
                if (pending === 0) {
                    statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Paid</span>';
                } else if (feeData.paidAmount > 0) {
                    statusBadge = '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Partial</span>';
                } else {
                    statusBadge = '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Pending</span>';
                }

                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${student.id}</td>
                    <td class="px-6 py-4">${student.name}</td>
                    <td class="px-6 py-4">${student.class} ${student.section}</td>
                    <td class="px-6 py-4 text-right">₦${formatMoney(feeData.totalFee)}</td>
                    <td class="px-6 py-4 text-right text-green-600 font-medium">₦${formatMoney(feeData.paidAmount)}</td>
                    <td class="px-6 py-4 text-right text-red-600 font-medium">₦${formatMoney(pending)}</td>
                    <td class="px-6 py-4 text-center">${statusBadge}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="quickCollectFee('${student.id}')" class="text-blue-600 hover:underline text-sm font-medium">
                            <i class="fas fa-money-bill-wave mr-1"></i> Collect
                        </button>
                    </td>
                `;
                overviewBody.appendChild(tr);
            });

            // Update summary cards
            totalStudentsEl.textContent = students.length;
            fullyPaidEl.textContent = fullyPaid;
            partialEl.textContent = partial;
            notPaidEl.textContent = notPaid;

        } catch (e) {
            console.error('Error loading fee overview:', e);
            overviewBody.innerHTML = '<tr><td colspan="8" class="px-6 py-4 text-center text-red-600">Error loading data: ' + e.message + '</td></tr>';
        }
    };

    // Quick collect fee - loads student details
    window.quickCollectFee = function(studentId) {
        searchInput.value = studentId;
        searchStudentFee();
        // Scroll to fee content
        setTimeout(() => {
            const feeContentEl = document.getElementById('fee-content');
            if(feeContentEl && !feeContentEl.classList.contains('hidden')) {
                feeContentEl.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    };

    // Load overview on page load
    setTimeout(() => {
        loadFeeOverview();
    }, 100);

    // === Search and Filter Functionality ===
    const overviewSearch = document.getElementById('overview-search');
    const overviewFilter = document.getElementById('overview-filter');

    if (overviewSearch) {
        overviewSearch.addEventListener('input', filterOverviewTable);
    }

    if (overviewFilter) {
        overviewFilter.addEventListener('change', filterOverviewTable);
    }

    function filterOverviewTable() {
        const searchTerm = overviewSearch ? overviewSearch.value.toLowerCase() : '';
        const filterValue = overviewFilter ? overviewFilter.value : 'all';
        const tableBody = document.getElementById('fee-overview-body');
        const rows = tableBody.getElementsByTagName('tr');

        let visibleCount = 0;

        for (let row of rows) {
            // Skip if it's a message row (no data)
            if (row.cells.length < 8) continue;

            const studentId = row.cells[0].textContent.toLowerCase();
            const studentName = row.cells[1].textContent.toLowerCase();
            const statusCell = row.cells[6];
            
            // Get status from badge
            let status = 'pending';
            if (statusCell.textContent.includes('Paid') && !statusCell.textContent.includes('Partial')) {
                status = 'paid';
            } else if (statusCell.textContent.includes('Partial')) {
                status = 'partial';
            }

            // Check search match
            const matchesSearch = studentId.includes(searchTerm) || studentName.includes(searchTerm);
            
            // Check filter match
            const matchesFilter = filterValue === 'all' || filterValue === status;

            // Show/hide row
            if (matchesSearch && matchesFilter) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        }

        // Show "no results" message if needed
        if (visibleCount === 0) {
            const noResultsRow = tableBody.querySelector('.no-results-row');
            if (!noResultsRow) {
                const tr = document.createElement('tr');
                tr.className = 'no-results-row';
                tr.innerHTML = '<td colspan="8" class="px-6 py-4 text-center text-gray-500">No students found matching your criteria.</td>';
                tableBody.appendChild(tr);
            }
        } else {
            const noResultsRow = tableBody.querySelector('.no-results-row');
            if (noResultsRow) {
                noResultsRow.remove();
            }
        }
    }

})();
