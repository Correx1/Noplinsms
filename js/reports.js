// Reports Module
(function() {

    function selectReportCategory(cat) {
        document.querySelectorAll('.report-card').forEach(c => {
            c.classList.remove('border-l-blue-600', 'active-report');
            c.classList.add('border-l-transparent');
        });
        const card = document.querySelector(`.report-card[data-cat="${cat}"]`);
        if (card) {
            card.classList.remove('border-l-transparent');
            card.classList.add('border-l-blue-600', 'active-report');
        }

        const title = document.getElementById('current-report-title');
        const select = document.getElementById('report-type-select');
        if (!title || !select) return;

        title.textContent = cat.charAt(0).toUpperCase() + cat.slice(1) + ' Reports';

        let opts = [];
        if (cat === 'student')    opts = ['Class Strength', 'Gender Ratio', 'New Admissions', 'Student History'];
        if (cat === 'teacher')    opts = ['Teacher Workload', 'Subject Allocation', 'Teacher Attendance'];
        if (cat === 'parent')     opts = ['PTA Meeting Logs', 'Parent Contact List'];
        if (cat === 'finance')    opts = ['Income Statement', 'Expense Report', 'Fee Collection', 'Defaulters List', 'Profit/Loss'];
        if (cat === 'attendance') opts = ['Student Daily Attendance', 'Student Monthly Report', 'Staff Attendance', 'Late Comers'];
        if (cat === 'academic')   opts = ['Term Results', 'Subject Performance', 'Toppers List', 'Failure Rate'];
        if (cat === 'library')    opts = ['Books Inventory', 'Issued Books', 'Overdue Reports', 'Fine Collection'];
        if (cat === 'transport')  opts = ['Route Wise Students', 'Vehicle Utilization', 'Driver Schedule', 'Transport Fees'];
        if (cat === 'hostel')     opts = ['Room Occupancy', 'Mess Info', 'Hostel Fee Collection'];
        if (cat === 'events')     opts = ['Event Participation', 'Event Budget Report'];
        if (cat === 'visitors')   opts = ['Visitor Logs', 'Gate Pass Report'];

        select.innerHTML = opts.map(o => `<option>${o}</option>`).join('');
    }

    function generateReport() {
        const activeCard = document.querySelector('.report-card.active-report');
        const cat = activeCard?.dataset?.cat || 'student';
        const type = document.getElementById('report-type-select')?.value || 'Report';
        const area = document.getElementById('report-result-area');
        if (!area) return;

        let headers = [];
        let rows = [];

        if (cat === 'student') {
            const students = JSON.parse(localStorage.getItem('studentsData') || '[]');
            headers = ['ID', 'Name', 'Class', 'Gender', 'Status', 'Date of Birth'];
            rows = students.length > 0
                ? students.map(s => [s.id||'', s.name||'', s.class||'', s.gender||'', 'Active', s.dob||''])
                : [['STD001','Amaka Okonkwo','SSS2A','Female','Active','2008-04-15'],
                   ['STD002','Chukwu Emeka','JSS3B','Male','Active','2009-01-20'],
                   ['STD003','Fatima Bello','SSS1A','Female','Active','2007-09-03'],
                   ['STD004','Ibrahim Musa','SSS3A','Male','Active','2006-05-11']];
        } else if (cat === 'finance') {
            headers = ['Ref No', 'Student / Staff', 'Description', 'Amount', 'Date', 'Status'];
            rows = [['INV001','Amaka Okonkwo','Tuition – First Term','50,000','2024-09-15','Paid'],
                    ['INV002','Emeka Chukwu','Tuition – First Term','50,000','2024-09-18','Paid'],
                    ['INV003','Fatima Bello','Development Levy','5,000','2024-09-20','Outstanding'],
                    ['INV004','Ibrahim Musa','Tuition – First Term','50,000','2024-09-22','Paid']];
        } else if (cat === 'teacher' || cat === 'parent') {
            headers = ['ID', 'Name', 'Phone', 'Email', 'Assigned Class', 'Status'];
            rows = [['TCH001','Mr. Adebayo Osei','08012345678','adebayo@school.edu','SSS2A','Active'],
                    ['TCH002','Mrs. Ngozi Eze','08098765432','ngozi@school.edu','JSS3B','Active'],
                    ['TCH003','Mr. Emeka Dike','07055544433','emeka@school.edu','SSS1A','Active']];
        } else if (cat === 'attendance') {
            headers = ['Date', 'Class', 'Present', 'Absent', 'Total', '% Attendance'];
            rows = [['2024-10-01','SSS2A','40','5','45','88.9%'],
                    ['2024-10-02','SSS2A','42','3','45','93.3%'],
                    ['2024-10-03','JSS1A','35','5','40','87.5%'],
                    ['2024-10-04','JSS3B','38','2','40','95.0%']];
        } else if (cat === 'academic') {
            headers = ['Student ID', 'Name', 'Class', 'Average', 'Position', 'Status'];
            rows = [['STD001','Amaka Okonkwo','SSS2A','87.4%','1st','Promoted'],
                    ['STD002','Emeka Chukwu','SSS2A','79.2%','2nd','Promoted'],
                    ['STD003','Fatima Bello','SSS2A','52.1%','15th','Promoted'],
                    ['STD004','Ibrahim Musa','SSS2A','38.0%','40th','Referred']];
        } else if (cat === 'library') {
            headers = ['Book ID', 'Title', 'Borrower', 'Issued', 'Due Date', 'Status'];
            rows = [['BK001','Introduction to Physics','Amaka Okonkwo','2024-10-01','2024-10-15','Returned'],
                    ['BK002','English Grammar','Emeka Chukwu','2024-10-03','2024-10-17','Overdue']];
        } else if (cat === 'transport') {
            headers = ['Route', 'Driver', 'Vehicle Plate', 'Students', 'Status'];
            rows = [['Route A – Ikeja','Mr. Samuel','LAG-001-AAA','22','Active'],
                    ['Route B – Lekki','Mr. Bello','LAG-002-BBB','18','Active']];
        } else {
            headers = ['ID', 'Description', 'Date', 'Status'];
            rows = [['001','Sample Record','2024-10-01','Active'],
                    ['002','Sample Record 2','2024-10-02','Active']];
        }

        window._reportHeaders = headers;
        window._reportRows = rows;
        window._reportTitle = type;

        area.innerHTML = `
            <div class="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div class="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                        <h3 class="text-base font-bold text-gray-900 dark:text-white">${type}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Generated: ${new Date().toLocaleString()} &nbsp;&bull;&nbsp; ${rows.length} record(s)</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="window._downloadCSV()" class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                            <i class="fas fa-file-excel"></i> Download Excel (CSV)
                        </button>
                        <button onclick="window.print()" class="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
                <div class="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                    <table class="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                            <tr>${headers.map(h => `<th class="px-4 py-3 whitespace-nowrap">${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${rows.map((r, i) => `
                            <tr class="${i % 2 ? 'bg-gray-50 dark:bg-gray-700/30' : 'bg-white dark:bg-gray-800'} border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                                ${r.map(c => `<td class="px-4 py-3">${c}</td>`).join('')}
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <p class="text-xs text-gray-400 mt-3 text-right">CorrexSMS Report Engine &bull; ${new Date().toLocaleDateString()}</p>
            </div>`;
    }

    window._downloadCSV = function() {
        if (!window._reportHeaders) return;
        const csvContent = [window._reportHeaders, ...window._reportRows]
            .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (window._reportTitle || 'report').replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    window.selectReportCategory = selectReportCategory;
    window.generateReport = generateReport;

    // Set data-cat on cards so active card detection works
    document.querySelectorAll('.report-card').forEach(card => {
        const oc = card.getAttribute('onclick') || '';
        const m = oc.match(/selectReportCategory\('(\w+)'\)/);
        if (m) card.dataset.cat = m[1];
    });

    // Wire Generate Report button
    document.querySelectorAll('button').forEach(b => {
        if (b.textContent.trim() === 'Generate Report') {
            b.onclick = generateReport;
        }
    });

    // Init
    selectReportCategory('student');

})();
