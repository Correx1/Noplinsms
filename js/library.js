// Library Module - Main Logic
(function() {
    console.log('Library Script Loaded');
    
    // Page Detection
    const isDashboard = document.getElementById('lib-total-books');
    const isBooksPage = document.getElementById('lib-add-book-form');
    const isTransactionsPage = document.getElementById('issue-book-form');
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
            // Helper to wait for database
            while(!window.SchoolDatabase) {
                await new Promise(r => setTimeout(r, 50));
            }

            // Books
            const storedBooks = localStorage.getItem('lib_books');
            booksData = storedBooks ? JSON.parse(storedBooks) : window.SchoolDatabase.books || [];
            if(!storedBooks) localStorage.setItem('lib_books', JSON.stringify(booksData));

            // Transactions
            const storedTrans = localStorage.getItem('lib_transactions');
            transData = storedTrans ? JSON.parse(storedTrans) : window.SchoolDatabase.libraryTransactions || [];
            if(!storedTrans) localStorage.setItem('lib_transactions', JSON.stringify(transData));

             // Members
            const storedMembers = localStorage.getItem('lib_members');
            membersData = storedMembers ? JSON.parse(storedMembers) : window.SchoolDatabase.libraryMembers || [];
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
        const issueForm = document.getElementById('issue-book-form');
        const issueBookSelect = document.getElementById('issue-book-search');
        const issueMemberSelect = document.getElementById('issue-member-search');
        
        // Initialize NFC
        initLibraryNFC();

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

        // Live search on the return table
        const returnSearchInput = document.getElementById('return-search');
        if (returnSearchInput) {
            returnSearchInput.addEventListener('input', () => {
                const term = returnSearchInput.value.toLowerCase();
                const rows = document.querySelectorAll('#issued-books-body tr');
                rows.forEach(row => {
                    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        }

        // Render on page load (show all)
        renderIssuedTable();
        
        window.returnBook = function(id) {
            if(confirm('Confirm return of this book?')) {
                const t = transData.find(x => x.id === id);
                t.status = 'Returned';
                t.returnDate = new Date().toISOString().split('T')[0];
                
                const book = booksData.find(b => b.id === t.bookId);
                if(book) { book.available++; book.issued--; }
                
                saveAll();
                renderIssuedTable(); // re-render full list after return
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

    // *** IIFE-level: accessible by setupTransactionsPage, startLibraryNFC, and libResetReturnTable ***
    function renderIssuedTable(filterMemberId) {
        const tbody = document.getElementById('issued-books-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const issued = transData.filter(t =>
            (t.status === 'Issued' || t.status === 'Overdue') &&
            (!filterMemberId || t.memberId === filterMemberId)
        );

        if (issued.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400 italic">${
                filterMemberId
                    ? 'No active borrowed books for this member.'
                    : 'No books are currently issued.'
            }</td></tr>`;
            return;
        }

        issued.forEach(t => {
            const isOverdue = new Date(t.dueDate) < new Date();
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
            tr.innerHTML = `
                <td class="px-3 py-2">
                    <div class="font-medium text-gray-900 dark:text-white text-sm">${t.bookTitle}</div>
                    <div class="text-xs text-gray-500">${t.bookId || ''}</div>
                </td>
                <td class="px-3 py-2">
                    <div class="text-sm">${t.memberName}</div>
                    <div class="text-xs text-gray-500">${t.memberId}</div>
                </td>
                <td class="px-3 py-2">
                    <span class="${isOverdue ? 'text-red-600 font-bold' : 'text-gray-700 dark:text-gray-300'} text-sm">
                        ${t.dueDate} ${isOverdue ? '⚠️' : ''}
                    </span>
                </td>
                <td class="px-3 py-2">
                    <button onclick="returnBook('${t.id}')" class="font-medium text-primary-600 dark:text-primary-500 hover:underline text-sm">Return</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- NFC & Biometric Integration ---
    let libNfcConfig = { nfc: true, bio: true }; // Default
    let isLibScanning = false;

    function initLibraryNFC() {
        const storedConfig = localStorage.getItem('sms_nfc_config');
        if (storedConfig) {
            try {
                const parsed = JSON.parse(storedConfig);
                libNfcConfig = parsed.library || { nfc: true, bio: true };
            } catch (e) {
                libNfcConfig = { nfc: true, bio: true };
            }
        } else {
            libNfcConfig = { nfc: true, bio: true };
        }
        
        const nfcBtn = document.getElementById('library-nfc-btn');
        const searchBtn = document.getElementById('regular-search-btn');

        // Always show the NFC button
        if (nfcBtn) { nfcBtn.classList.remove('hidden'); nfcBtn.classList.add('flex'); }
        if (searchBtn) searchBtn.classList.remove('rounded-r-md');

        // Disable only if BOTH nfc AND bio are off
        if (nfcBtn) {
            const bothOff = !libNfcConfig.nfc && !libNfcConfig.bio;
            nfcBtn.disabled = bothOff;
            if (bothOff) { nfcBtn.classList.add('opacity-50', 'cursor-not-allowed'); nfcBtn.title = 'NFC & Biometric both disabled in settings'; }
            else         { nfcBtn.classList.remove('opacity-50', 'cursor-not-allowed'); nfcBtn.title = ''; }
        }
    }

    window.startLibraryNFC = function() {
        const btn = document.getElementById('library-nfc-btn');
        if (!btn) return;

        if (isLibScanning) {
            isLibScanning = false;
            btn.classList.remove('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
            btn.classList.add('bg-primary-100', 'text-primary-700', 'border-primary-200');
            btn.innerHTML = '<i class="fas fa-wifi mr-1"></i> Scan';
            if (window.SmartScanner) window.SmartScanner.stop();
            return;
        }

        if (!window.SmartScanner) { alert('Scanner not loaded. Please refresh.'); return; }

        isLibScanning = true;
        btn.classList.add('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
        btn.classList.remove('bg-primary-100', 'text-primary-700', 'border-primary-200');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Wait';

        window.SmartScanner.start({
            requireNFC: libNfcConfig.nfc,
            requireBiometric: libNfcConfig.bio,    // Library: reads from settings
            onSuccess: (scannedId) => {
                isLibScanning = false;
                btn.classList.remove('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
                btn.classList.add('bg-primary-100', 'text-primary-700', 'border-primary-200');
                btn.innerHTML = '<i class="fas fa-wifi mr-1"></i> Scan';

                // Resolve member name
                let memberName = scannedId;
                try {
                    const everyone = (window.SchoolDatabase?.staff || []).concat(window.SchoolDatabase?.students || []);
                    const found = everyone.find(m => m.id === scannedId);
                    if (found) memberName = `${found.name} (${scannedId})`;
                } catch(e) {}

                // Fill the member input field
                const memberInput = document.getElementById('issue-member-search');
                if (memberInput) memberInput.value = memberName;

                // --- Filter the Return/Active Issues table for this member only ---
                renderIssuedTable(scannedId);

                // Show banner
                const banner = document.getElementById('lib-member-filter-banner');
                const bannerName = document.getElementById('lib-banner-name');
                if (banner && bannerName) {
                    bannerName.textContent = memberName;
                    banner.classList.remove('hidden');
                }

                if (typeof showToast === 'function') {
                    showToast('Success', `Card scanned: ${memberName}`, 'success');
                }
            },
            onFail: () => {
                isLibScanning = false;
                btn.classList.remove('bg-green-100', 'text-green-600', 'border-green-300', 'animate-pulse');
                btn.classList.add('bg-primary-100', 'text-primary-700', 'border-primary-200');
                btn.innerHTML = '<i class="fas fa-wifi mr-1"></i> Scan';
            }
        });
    };

    // Reset the return table back to full list and hide the member banner
    window.libResetReturnTable = function() {
        renderIssuedTable();   // no filter → show all
        const banner = document.getElementById('lib-member-filter-banner');
        if (banner) banner.classList.add('hidden');
        const memberInput = document.getElementById('issue-member-search');
        if (memberInput) memberInput.value = '';
        const returnSearch = document.getElementById('return-search');
        if (returnSearch) returnSearch.value = '';
    };

})();
