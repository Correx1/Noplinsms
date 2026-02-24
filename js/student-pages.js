// Student Pages Functionality

// ==================== LIBRARY PAGE ====================
window.libraryBooks = [
    {id: 1, title: 'Introduction to Physics', author: 'Dr. James Wilson', category: 'Science', available: 5, total: 10, isbn: '978-0-123-45678-9'},
    {id: 2, title: 'Advanced Mathematics', author: 'Prof. Sarah Chen', category: 'Mathematics', available: 3, total: 8, isbn: '978-0-234-56789-0'},
    {id: 3, title: 'World History', author: 'Dr. Michael Brown', category: 'History', available: 7, total: 12, isbn: '978-0-345-67890-1'},
    {id: 4, title: 'English Literature Classics', author: 'Prof. Emily Davis', category: 'Literature', available: 4, total: 10, isbn: '978-0-456-78901-2'},
    {id: 5, title: 'Chemistry Fundamentals', author: 'Dr. Robert Taylor', category: 'Science', available: 0, total: 6, isbn: '978-0-567-89012-3'},
    {id: 6, title: 'Biology Essentials', author: 'Dr. Lisa Anderson', category: 'Science', available: 8, total: 15, isbn: '978-0-678-90123-4'},
    {id: 7, title: 'Computer Programming', author: 'Prof. David Lee', category: 'Technology', available: 6, total: 10, isbn: '978-0-789-01234-5'},
    {id: 8, title: 'Geography Atlas', author: 'Dr. Maria Garcia', category: 'Geography', available: 9, total: 12, isbn: '978-0-890-12345-6'}
];

window.borrowedBooks = [
    {id: 2, title: 'Advanced Mathematics', author: 'Prof. Sarah Chen', borrowDate: '2026-01-15', dueDate: '2026-02-15', status: 'active'},
    {id: 4, title: 'English Literature Classics', author: 'Prof. Emily Davis', borrowDate: '2026-01-20', dueDate: '2026-02-20', status: 'active'}
];

window.initLibraryPage = function() {
    displayLibraryBooks();
    displayBorrowedBooks();
};

window.displayLibraryBooks = function (filter = 'all') {
    const container = document.getElementById('booksContainer');
    if (!container) return;
    
    let books = window.libraryBooks;
    if (filter !== 'all') {
        books = books.filter(b => b.category === filter);
    }
    
    container.innerHTML = books.map(book => `
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
        <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">${book.title}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">by ${book.author}</p>
            </div>
            <span class="px-2 py-1 text-xs font-medium rounded 
                ${book.category === 'Science' ? 'bg-primary-100 text-primary-800 dark:bg-primary-200 dark:text-primary-900' :
            book.category === 'Mathematics' ? 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900' :
                book.category === 'Literature' ? 'bg-purple-100 text-purple-800 dark:bg-purple-200 dark:text-purple-900' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}">
                ${book.category}
            </span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            <p>ISBN: ${book.isbn}</p>
            <p class="mt-1">Available: <span class="font-semibold ${book.available > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${book.available}/${book.total}</span></p>
        </div>
        <button onclick="borrowBook(${book.id})" ${book.available === 0 ? 'disabled' : ''} 
            class="w-full px-4 py-2 text-sm text-white rounded-lg
                ${book.available === 0 ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800'}">
            ${book.available === 0 ? 'Not Available' : 'Borrow Book'}
        </button>
    </div>
`).join('');


    window.displayBorrowedBooks = function () {
        const tbody = document.getElementById('borrowedBooksTable');
        if (!tbody) return;
    
        if (window.borrowedBooks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No borrowed books</td></tr>';
            return;
        }
    
        tbody.innerHTML = window.borrowedBooks.map(book => `
       <tr class="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${book.title}</td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${book.author}</td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${book.borrowDate}</td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${book.dueDate}</td>
    <td class="px-6 py-4">
        <button onclick="returnBook(${book.id})" 
                class="px-3 py-1 text-sm text-white rounded 
                       bg-green-600 dark:bg-green-500 
                       hover:bg-green-700 dark:hover:bg-green-600">
            Return
        </button>
    </td>
</tr>

    `).join('');
    };

    window.filterBooks = function (category) {
        displayLibraryBooks(category);
    };

    window.searchBooks = function () {
        const query = document.getElementById('searchInput')?.value.toLowerCase();
        if (!query) {
            displayLibraryBooks();
            return;
        }
    
        const filtered = window.libraryBooks.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.isbn.includes(query)
        );
    
        const container = document.getElementById('booksContainer');
        if (!container) return;
    
        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No books found</div>';
            return;
        }
    
        container.innerHTML = filtered.map(book => `
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:border-gray-700">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">${book.title}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">by ${book.author}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded ${book.category === 'Science' ? 'bg-primary-100 text-primary-800' : book.category === 'Mathematics' ? 'bg-green-100 text-green-800' : book.category === 'Literature' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">${book.category}</span>
            </div>
            <div class="text-sm text-gray-600 mb-3">
                <p>ISBN: ${book.isbn}</p>
                <p class="mt-1">Available: <span class="font-semibold ${book.available > 0 ? 'text-green-600' : 'text-red-600'}">${book.available}/${book.total}</span></p>
            </div>
            <button onclick="borrowBook(${book.id})" ${book.available === 0 ? 'disabled' : ''} class="w-full px-4 py-2 text-sm text-white ${book.available === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} rounded-lg">
                ${book.available === 0 ? 'Not Available' : 'Borrow Book'}
            </button>
        </div>
    `).join('');
    }
}
window.borrowBook = function(bookId) {
    const book = window.libraryBooks.find(b => b.id === bookId);
    if(!book || book.available === 0) return;
    
    // Check if already borrowed
    if(window.borrowedBooks.find(b => b.id === bookId)) {
        alert('You have already borrowed this book!');
        return;
    }
    
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);
    
    window.borrowedBooks.push({
        id: book.id,
        title: book.title,
        author: book.author,
        borrowDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'active'
    });
    
    book.available--;
    
    displayLibraryBooks();
    displayBorrowedBooks();
    alert(`Successfully borrowed "${book.title}". Due date: ${dueDate.toISOString().split('T')[0]}`);
};

window.returnBook = function(bookId) {
    const index = window.borrowedBooks.findIndex(b => b.id === bookId);
    if(index === -1) return;
    
    const book = window.libraryBooks.find(b => b.id === bookId);
    if(book) {
        book.available++;
    }
    
    window.borrowedBooks.splice(index, 1);
    
    displayLibraryBooks();
    displayBorrowedBooks();
    alert('Book returned successfully!');
};

// ==================== ASSIGNMENTS PAGE ====================
window.submitAssignment = function(assignmentTitle) {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if(file) {
            // Simulate upload
            alert(`Assignment "${assignmentTitle}" submitted successfully!\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nYour submission is being processed.`);
            
            // In real app, you would upload the file here
            console.log('Uploading file:', file);
        }
    };
    
    input.click();
};

window.viewFeedback = function(assignmentTitle, grade, feedback) {
    const feedbackText = feedback || 'Excellent work! Your analysis was thorough and well-structured. Keep up the good work!';
    
    alert(`Feedback for: ${assignmentTitle}\n\nGrade: ${grade}\n\nTeacher's Comments:\n${feedbackText}`);
};
