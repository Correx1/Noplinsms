/**
 * Print Manager
 * Handles opening print templates in new windows
 */

const PrintManager = {
    
    openPrintWindow: function(url) {
        // Center the window
        const width = 1000;
        const height = 800;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        const win = window.open(
            url, 
            'PrintWindow', 
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );
        
        if (win) {
            win.focus();
        } else {
            alert('Please allow popups for printing.');
        }
    },

    printIDCard: function(studentId) {
        // In real app, pass ID via query param like ?id=123
        this.openPrintWindow('../../templates/print/id-card.html');
    },

    printReceipt: function(receiptId) {
        this.openPrintWindow('../../templates/print/fee-receipt.html');
    },

    printReportCard: function(studentId, examId) {
        this.openPrintWindow('../../templates/print/report-card.html');
    },

    printTimetable: function(classId) {
        this.openPrintWindow('../../templates/print/timetable.html');
    }
};

// Global Exposure
window.printManager = PrintManager;
