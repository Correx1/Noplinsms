// Library Module - Main Logic
(function() {
    console.log('Library Script Loaded');
    
    // Page Detection
    const isDashboard = document.getElementById('lib-total-books');
    const isBooksPage = document.getElementById('lib-add-book-form');
    const isTransactionsPage = document.getElementById('lib-issue-book-form');
    const isMembersPage = document.getElementById('lib-members-table-body');

    let booksData = [];
    let transData = [];
    let membersData = [];

    init();

    async function init() {
        await loadAllData();

        if (isDashboard) renderDashboard();
        if (isBooksPage) setupBooksPage();
        if (isTransactionsPage) setupTransactionsPage();
        if (isMembersPage) setupMembersPage();
    }

    async function loadAllData() {
        try {
            // Books
            const resBooks = await fetch('../../data/library-books.json');
            const storedBooks = localStorage.getItem('lib_books');
            booksData = storedBooks ? JSON.parse(storedBooks) : await resBooks.json();
            if(!storedBooks) localStorage.setItem('lib_books', JSON.stringify(booksData));

            // Transactions
            const resTrans = await fetch('../../data/library-transactions.json');
            const storedTrans = localStorage.getItem('lib_transactions');
            transData = storedTrans ? JSON.parse(storedTrans) : await resTrans.json();
            if(!storedTrans) localStorage.setItem('lib_transactions', JSON.stringify(transData));

             // Members
            const resMembers = await fetch('../../data/library-members.json');
            const storedMembers = localStorage.getItem('lib_members');
            membersData = storedMembers ? JSON.parse(storedMembers) : await resMembers.json();
            if(!storedMembers) localStorage.setItem('lib_members', JSON.stringify(membersData));

        } catch(e) { console.error('Lib Data Load Error', e); }
    }

    // --- DASHBOARD LOGIC ---
    function renderDashboard() {
        const total = booksData.reduce((acc, b) => acc + parseInt(b.totalCopies), 0);
        const issued = booksData.reduce((acc, b) => acc + parseInt(b.issued), 0);
        const available = total - issued;
        const overdue = transData.filter(t => t.status === 'Overdue').length;

        document.getElementById('lib-total-books').textContent = total;
        document.getElementById('lib-available-books').textContent = available;
        document.getElementById('lib-issued-books').textContent = issued;
        document.getElementById('lib-overdue-books').textContent = overdue;

        const tbody = document.getElementById('lib-recent-transactions-body');
        tbody.innerHTML = '';
        transData.slice(0, 5).forEach(t => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            tr.innerHTML = `
                <td class="px-6 py-4">${t.issueDate}</td>
                <td class="px-6 py-4">${t.memberName} <span class="text-xs text-gray-500">(${t.memberType})</span></td>
                <td class="px-6 py-4">${t.bookTitle}</td>
                <td class="px-6 py-4">
                     <span class="${getStatusColor(t.status)} text-xs font-medium px-2.5 py-0.5 rounded">${t.status}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- BOOKS PAGE LOGIC ---
    function setupBooksPage() {
        const tbody = document.getElementById('lib-books-table-body');
        const form = document.getElementById('lib-add-book-form');
        const searchInput = document.getElementById('lib-book-search');

        renderBooksTable(booksData);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newBook = {
                id: 'BK' + Date.now(),
                title: document.getElementById('bk-title').value,
                author: document.getElementById('bk-author').value,
                isbn: document.getElementById('bk-isbn').value,
                category: document.getElementById('bk-category').value,
                publisher: document.getElementById('bk-publisher').value,
                year: document.getElementById('bk-year').value,
                totalCopies: parseInt(document.getElementById('bk-copies').value),
                available: parseInt(document.getElementById('bk-copies').value),
                issued: 0,
                shelf: document.getElementById('bk-shelf').value,
                description: document.getElementById('bk-desc').value,
                cover: '' // placeholder
            };

            booksData.push(newBook);
            saveAll();
            form.reset();
            renderBooksTable(booksData);
            alert('Book Added Successfully');
        });

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = booksData.filter(b => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term));
            renderBooksTable(filtered);
        });

        function renderBooksTable(data) {
            tbody.innerHTML = '';
            data.forEach(b => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                tr.innerHTML = `
                    <td class="px-6 py-4 w-16">
                        <div class="h-12 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">Img</div>
                    </td>
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        ${b.title}
                        <div class="text-xs text-gray-500">${b.author}</div>
                    </td>
                    <td class="px-6 py-4">${b.category}</td>
                    <td class="px-6 py-4">${b.totalCopies}</td>
                    <td class="px-6 py-4 text-green-600 font-bold">${b.available}</td>
                    <td class="px-6 py-4 text-yellow-600 font-bold">${b.issued}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteBook('${b.id}')" class="text-red-600 hover:underline">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        window.deleteBook = function(id) {
            if(confirm('Delete book?')) {
                booksData = booksData.filter(b => b.id !== id);
                saveAll();
                renderBooksTable(booksData);
            }
        };
    }

    // --- TRANSACTIONS PAGE LOGIC ---
    function setupTransactionsPage() {
        // Tab Switching
        window.switchTab = function(tab) {
            if(tab === 'issue') {
                document.getElementById('tab-issue').classList.remove('hidden');
                document.getElementById('tab-return').classList.add('hidden');
                document.getElementById('btn-tab-issue').classList.add('text-primary-600', 'border-primary-600');
                document.getElementById('btn-tab-return').classList.remove('text-primary-600', 'border-primary-600');
            } else {
                 document.getElementById('tab-issue').classList.add('hidden');
                document.getElementById('tab-return').classList.remove('hidden');
                document.getElementById('btn-tab-issue').classList.remove('text-primary-600', 'border-primary-600');
                document.getElementById('btn-tab-return').classList.add('text-primary-600', 'border-primary-600');
                renderIssuedTable();
            }
        };

        // Issue Logic
        const issueForm = document.getElementById('lib-issue-book-form');
        const issueBookSelect = document.getElementById('issue-book-id');
        const issueMemberSelect = document.getElementById('issue-member-id');

        // Populate Selects
        booksData.filter(b => b.available > 0).forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.title} (${b.available} avail)`;
            issueBookSelect.appendChild(opt);
        });
        
        membersData.forEach(m => {
             const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.name} (${m.type})`;
            issueMemberSelect.appendChild(opt);
        });

        issueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const bkId = issueBookSelect.value;
            const memId = issueMemberSelect.value;
            
            const book = booksData.find(b => b.id === bkId);
            const member = membersData.find(m => m.id === memId);
            
            if(book.available <= 0) { alert('Book not available'); return; }

            // Update Book Stats
            book.available--;
            book.issued++;
            
            // Create Transaction
            const trans = {
                id: 'TRANS' + Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                memberId: member.id,
                memberName: member.name,
                memberType: member.type,
                issueDate: document.getElementById('issue-date').value,
                dueDate: document.getElementById('due-date').value,
                returnDate: '',
                status: 'Issued',
                fine: 0
            };
            
            transData.push(trans);
            saveAll();
            
            alert('Book Issued Successfully');
            issueForm.reset();
            // Refresh select to show updated availability
            issueBookSelect.innerHTML = '<option value="">Select Book...</option>';
             booksData.filter(b => b.available > 0).forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.id;
                opt.textContent = `${b.title} (${b.available} avail)`;
                issueBookSelect.appendChild(opt);
            });
        });

        // Return Logic
        function renderIssuedTable() {
            const tbody = document.getElementById('lib-return-table-body');
            tbody.innerHTML = '';
            const issued = transData.filter(t => t.status === 'Issued' || t.status === 'Overdue');
            
            issued.forEach(t => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                 tr.innerHTML = `
                    <td class="px-6 py-4">${t.issueDate}</td>
                    <td class="px-6 py-4">${t.bookTitle}</td>
                    <td class="px-6 py-4">${t.memberName}</td>
                    <td class="px-6 py-4 text-red-600">${t.dueDate}</td>
                    <td class="px-6 py-4">
                        <button onclick="returnBook('${t.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">Return</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        window.returnBook = function(id) {
            if(confirm('Confirm return of this book?')) {
                const t = transData.find(x => x.id === id);
                t.status = 'Returned';
                t.returnDate = new Date().toISOString().split('T')[0];
                
                // Update Book Stats
                const book = booksData.find(b => b.id === t.bookId);
                if(book) {
                    book.available++;
                    book.issued--;
                }
                
                saveAll();
                renderIssuedTable();
            }
        };
    }

    // --- MEMBERS PAGE LOGIC ---
    function setupMembersPage() {
         const tbody = document.getElementById('lib-members-table-body');
         membersData.forEach(m => {
              const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
             tr.innerHTML = `
                <td class="px-6 py-4 font-bold">${m.id}</td>
                <td class="px-6 py-4">${m.name}</td>
                <td class="px-6 py-4">${m.type}</td>
                <td class="px-6 py-4">${m.dateJoined}</td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">${m.status}</span>
                </td>
            `;
            tbody.appendChild(tr);
         });
    }

    // Shared
    function saveAll() {
        localStorage.setItem('lib_books', JSON.stringify(booksData));
        localStorage.setItem('lib_transactions', JSON.stringify(transData));
        localStorage.setItem('lib_members', JSON.stringify(membersData));
    }
    
    function getStatusColor(status) {
        if(status === 'Issued') return 'bg-yellow-100 text-yellow-800';
        if(status === 'Returned') return 'bg-green-100 text-green-800';
        if(status === 'Overdue') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    }

})();
