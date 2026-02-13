// Parent Pages Functionality

// ==================== CHILD SELECTOR ====================
window.selectedChild = {
    id: 1,
    name: 'Alex Johnson',
    class: 'SSS 2B',
    rollNo: 24
};

window.children = [
    {id: 1, name: 'Alex Johnson', class: 'SSS 2B', rollNo: 24},
    {id: 2, name: 'Emily Johnson', class: 'JSS 3A', rollNo: 10}
];

window.selectChild = function(childId) {
    window.selectedChild = window.children.find(c => c.id === childId);
    // Refresh current page data
    console.log('Selected child:', window.selectedChild);
};

// ==================== MESSAGES ====================
window.sendMessage = function() {
    const recipient = document.getElementById('messageRecipient')?.value;
    const subject = document.getElementById('messageSubject')?.value;
    const message = document.getElementById('messageText')?.value;
    
    if(!recipient || !subject || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    alert(`Message sent successfully!\n\nTo: ${recipient}\nSubject: ${subject}\n\nYour message has been sent to the teacher.`);
    
    // Clear form
    document.getElementById('messageRecipient').value = '';
    document.getElementById('messageSubject').value = '';
    document.getElementById('messageText').value = '';
};

window.viewMessage = function(from, subject, date, message) {
    const msg = message || 'Dear Parent,\n\nThis is to inform you about your child\'s recent performance. Please schedule a meeting to discuss further.\n\nBest regards,\nClass Teacher';
    
    alert(`From: ${from}\nSubject: ${subject}\nDate: ${date}\n\n${msg}`);
};

// ==================== FEE PAYMENT ====================
window.makePayment = function(childName, amount) {
    const confirmed = confirm(`Make payment for ${childName}?\n\nAmount: ₦${amount}\n\nProceed to payment gateway?`);
    
    if(confirmed) {
        alert(`Payment initiated for ${childName}\n\nAmount: ₦${amount}\n\nRedirecting to payment gateway...\n\n(This is a demo - no actual payment will be processed)`);
    }
};

window.downloadReceipt = function(receiptNo, date, amount) {
    alert(`Downloading Receipt\n\nReceipt No: ${receiptNo}\nDate: ${date}\nAmount: ${amount}\n\n(In production, this would download a PDF receipt)`);
};
