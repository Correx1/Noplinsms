// Templates Module
(function() {
    const STORAGE_KEY = 'sms_templates';
    let templates = [];
    let currentCategory = 'all';

    const CATEGORY_META = {
        result:      { label: 'Result / Report Card', icon: 'fa-file-alt',         color: 'blue' },
        certificate: { label: 'Certificate',          icon: 'fa-certificate',       color: 'yellow' },
        letter:      { label: 'Letter',               icon: 'fa-envelope',          color: 'indigo' },
        receipt:     { label: 'Receipt',              icon: 'fa-receipt',           color: 'green' },
        id:          { label: 'ID Card',              icon: 'fa-id-card',           color: 'purple' },
        notice:      { label: 'Notice',               icon: 'fa-bullhorn',          color: 'orange' },
        payslip:     { label: 'Payslip',              icon: 'fa-money-check-alt',   color: 'teal' },
    };

    // Default seed templates
    const DEFAULT_TEMPLATES = [
        { id: 'TPL001', name: 'Student Report Card',       category: 'result',      desc: 'Standard end-of-term result sheet with subject scores, grades, position and remarks.' },
        { id: 'TPL002', name: 'Admission Letter',          category: 'letter',      desc: 'Formal admission letter sent to newly admitted students.' },
        { id: 'TPL003', name: 'Fee Payment Receipt',       category: 'receipt',     desc: 'Official receipt issued after school fee payment.' },
        { id: 'TPL004', name: 'Student ID Card',           category: 'id',          desc: 'Student identity card with photo, class, and ID number.' },
        { id: 'TPL005', name: 'Staff ID Card',             category: 'id',          desc: 'Employee identity card with designation and department.' },
        { id: 'TPL006', name: 'Certificate of Achievement',category: 'certificate', desc: 'Award certificate for outstanding academic performance.' },
        { id: 'TPL007', name: 'School Notice (General)',   category: 'notice',      desc: 'General notice to parents, staff, or students.' },
        { id: 'TPL008', name: 'Monthly Payslip',           category: 'payslip',     desc: 'Staff salary payslip with deductions, allowances, and net pay.' },
        { id: 'TPL009', name: 'Transfer Certificate',      category: 'certificate', desc: 'Certificate issued to students transferring to another school.' },
        { id: 'TPL010', name: 'Suspension Letter',         category: 'letter',      desc: 'Official letter informing a student of temporary suspension.' },
        { id: 'TPL011', name: 'Promotion Letter',          category: 'letter',      desc: 'Letter confirming a student\'s promotion to the next class.' },
        { id: 'TPL012', name: 'Merit Certificate',         category: 'certificate', desc: 'Certificate recognizing merit in extracurricular activities.' },
    ];

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            templates = JSON.parse(saved);
        } else {
            templates = DEFAULT_TEMPLATES.map(t => ({ ...t, createdAt: new Date().toISOString() }));
            save();
        }
        render();
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }

    function render() {
        const grid = document.getElementById('templates-grid');
        const empty = document.getElementById('templates-empty');
        if (!grid) return;

        const filtered = currentCategory === 'all' ? templates : templates.filter(t => t.category === currentCategory);

        if (filtered.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        grid.innerHTML = filtered.map(t => {
            const meta = CATEGORY_META[t.category] || { label: t.category, icon: 'fa-file', color: 'gray' };
            const colorMap = {
                blue: 'bg-blue-100 text-blue-800',
                yellow: 'bg-yellow-100 text-yellow-800',
                indigo: 'bg-indigo-100 text-indigo-800',
                green: 'bg-green-100 text-green-800',
                purple: 'bg-purple-100 text-purple-800',
                orange: 'bg-orange-100 text-orange-800',
                teal: 'bg-teal-100 text-teal-800',
                gray: 'bg-gray-100 text-gray-800',
            };
            const badgeClass = colorMap[meta.color] || colorMap.gray;
            const iconColorClass = {
                blue: 'text-blue-500', yellow: 'text-yellow-500', indigo: 'text-indigo-500',
                green: 'text-green-500', purple: 'text-purple-500', orange: 'text-orange-500',
                teal: 'text-teal-500', gray: 'text-gray-400'
            }[meta.color] || 'text-gray-400';

            return `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div class="p-5 flex-1">
                    <div class="flex items-start justify-between mb-3">
                        <div class="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                            <i class="fas ${meta.icon} ${iconColorClass} text-lg"></i>
                        </div>
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}">${meta.label}</span>
                    </div>
                    <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">${t.name}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">${t.desc || 'No description provided.'}</p>
                </div>
                <div class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center gap-2">
                    <button onclick="window.templatesApp.previewTemplate('${t.id}')" class="flex-1 text-xs text-center font-medium px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 transition-colors">
                        <i class="fas fa-eye mr-1"></i> Preview
                    </button>
                    <button onclick="window.templatesApp.editTemplate('${t.id}')" class="text-xs font-medium px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.templatesApp.deleteTemplate('${t.id}')" class="text-xs font-medium px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>`;
        }).join('');
    }

    // ---- Preview Renders ----
    const PREVIEWS = {
        result: () => `
            <div class="border-b-4 border-double border-blue-700 pb-3 mb-4 text-center">
                <div class="w-12 h-12 rounded-full bg-blue-700 text-white text-lg font-bold flex items-center justify-center mx-auto mb-1">S</div>
                <h2 class="text-xl font-extrabold text-blue-800 uppercase">Greenfield Academy</h2>
                <p class="text-xs text-gray-500">123 School Road • Tel: 0800000000</p>
                <p class="font-bold mt-1 text-gray-700">STUDENT REPORT CARD</p>
            </div>
            <div class="flex justify-between mb-4 bg-gray-50 p-3 rounded-lg border text-sm">
                <div><span class="text-gray-500">Student:</span> <strong>John Doe</strong><br><span class="text-gray-500">Class:</span> <strong>SSS2A</strong></div>
                <div class="text-right"><span class="text-gray-500">Term:</span> <strong>First Term</strong><br><span class="text-gray-500">Session:</span> <strong>2024/2025</strong></div>
            </div>
            <table class="w-full text-sm border-collapse mb-4">
                <thead><tr class="bg-blue-700 text-white"><th class="p-2 text-left">Subject</th><th class="p-2 text-center">CA</th><th class="p-2 text-center">Exam</th><th class="p-2 text-center">Total</th><th class="p-2 text-center">Grade</th></tr></thead>
                <tbody>
                    ${['Mathematics','English','Physics','Chemistry','Biology'].map((s,i)=>`<tr class="border-b ${i%2?'bg-gray-50':''}"><td class="p-2">${s}</td><td class="p-2 text-center">3${i+2}</td><td class="p-2 text-center">5${i+1}</td><td class="p-2 text-center font-bold">8${i+3}</td><td class="p-2 text-center text-blue-700 font-bold">A</td></tr>`).join('')}
                </tbody>
            </table>
            <div class="grid grid-cols-2 gap-4 text-sm border-t pt-3">
                <div><b>Total:</b> 440 &nbsp;|&nbsp; <b>Avg:</b> 88% &nbsp;|&nbsp; <b>Position:</b> 2nd / 45</div>
                <div class="text-right"><b>Status:</b> <span class="text-green-600 font-bold">PROMOTED</span></div>
            </div>`,

        certificate: () => `
            <div class="border-8 border-double border-yellow-500 rounded-xl p-6 text-center bg-gradient-to-b from-yellow-50 to-white">
                <i class="fas fa-star text-yellow-400 text-4xl mb-2"></i>
                <p class="text-yellow-700 font-semibold uppercase tracking-widest text-xs mb-2">Certificate of Achievement</p>
                <h2 class="text-2xl font-extrabold text-gray-900 mb-1">This is to certify that</h2>
                <p class="text-3xl font-bold text-yellow-700 my-3">John Doe</p>
                <p class="text-gray-600 mb-4">has demonstrated outstanding academic performance in<br><strong>SSS2 — 2024/2025 Academic Session</strong></p>
                <div class="flex justify-around mt-6 border-t pt-4">
                    <div class="text-center"><div class="border-b border-gray-400 w-32 h-6"></div><p class="text-xs mt-1">Class Teacher</p></div>
                    <div class="text-center"><div class="border-b border-gray-400 w-32 h-6"></div><p class="text-xs mt-1">Principal</p></div>
                </div>
            </div>`,

        letter: () => `
            <div class="text-sm text-gray-800 space-y-3 font-serif">
                <div class="text-right text-xs text-gray-500">${new Date().toDateString()}</div>
                <p><strong>The Parent/Guardian of:</strong> John Doe</p>
                <p><strong>Re: Admission to SSS1 – 2024/2025 Session</strong></p>
                <p>Dear Parent/Guardian,</p>
                <p>We are pleased to inform you that your ward <strong>John Doe</strong> has been admitted to <strong>Greenfield Academy</strong> into Class <strong>SSS1A</strong> for the 2024/2025 academic session.</p>
                <p>Please report to the administrative office with the following documents: Birth Certificate, Previous School Results, and Passport Photographs.</p>
                <p>We look forward to welcoming your ward into our school community.</p>
                <p>Yours faithfully,<br><br><strong>The Principal<br>Greenfield Academy</strong></p>
            </div>`,

        receipt: () => `
            <div class="border rounded-lg p-4">
                <div class="flex justify-between mb-4 border-b pb-3">
                    <div><h2 class="font-bold text-lg">OFFICIAL RECEIPT</h2><p class="text-xs text-gray-500">Greenfield Academy</p></div>
                    <div class="text-right text-sm"><p>Receipt No: <strong>RCP-20240301</strong></p><p>Date: <strong>${new Date().toDateString()}</strong></p></div>
                </div>
                <div class="text-sm space-y-2 mb-4">
                    <p><span class="text-gray-500">Student:</span> <strong>John Doe</strong>&emsp;<span class="text-gray-500">Class:</span> <strong>SSS2A</strong></p>
                    <p><span class="text-gray-500">Term:</span> <strong>First Term 2024/2025</strong></p>
                </div>
                <table class="w-full text-sm border-collapse mb-4"><thead><tr class="bg-gray-100"><th class="p-2 text-left">Description</th><th class="p-2 text-right">Amount</th></tr></thead>
                    <tbody><tr class="border-b"><td class="p-2">Tuition Fee</td><td class="p-2 text-right">₦45,000</td></tr><tr class="border-b"><td class="p-2">Development Levy</td><td class="p-2 text-right">₦5,000</td></tr></tbody>
                    <tfoot><tr class="bg-green-50"><td class="p-2 font-bold">TOTAL PAID</td><td class="p-2 text-right font-bold text-green-700">₦50,000</td></tr></tfoot>
                </table>
                <p class="text-xs text-center text-gray-400 mt-4">This is a computer-generated receipt and requires no signature.</p>
            </div>`,

        id: () => `
            <div class="flex justify-center gap-6 flex-wrap">
                <div class="w-56 rounded-xl overflow-hidden border-2 border-blue-600 shadow-lg text-center">
                    <div class="bg-blue-700 text-white py-2 font-bold text-xs uppercase tracking-wider">Student ID Card</div>
                    <div class="bg-white p-3">
                        <div class="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center"><i class="fas fa-user text-gray-400 text-2xl"></i></div>
                        <p class="font-bold text-sm">John Doe</p>
                        <p class="text-xs text-gray-500">STD/2024/001</p>
                        <p class="text-xs">Class: <strong>SSS2A</strong></p>
                        <p class="text-xs">Session: 2024/2025</p>
                    </div>
                    <div class="bg-blue-700 text-white py-1 text-xs">Greenfield Academy</div>
                </div>
            </div>`,

        notice: () => `
            <div class="border rounded-lg p-5">
                <div class="text-center border-b pb-3 mb-4">
                    <h2 class="font-bold text-lg uppercase">Notice to Parents & Students</h2>
                    <p class="text-xs text-gray-500">Greenfield Academy — ${new Date().toDateString()}</p>
                </div>
                <p class="text-sm text-gray-800 leading-relaxed">Dear Parents and Students,<br><br>This is to inform you that the <strong>First Term Examination</strong> is scheduled to begin on <strong>November 18, 2024</strong>. All students are expected to be seated 15 minutes before the scheduled time.<br><br>Kindly ensure all outstanding fees are cleared before the exam period. Students with unpaid fees will not be allowed to sit for examinations.<br><br>Thank you for your cooperation.</p>
                <div class="mt-4 text-right text-sm"><p class="font-semibold">The Principal</p><p class="text-gray-500">Greenfield Academy</p></div>
            </div>`,

        payslip: () => `
            <div class="border rounded-lg overflow-hidden text-sm">
                <div class="bg-gray-800 text-white p-4 flex justify-between">
                    <div><h2 class="font-bold">SALARY PAYSLIP</h2><p class="text-xs opacity-70">Greenfield Academy</p></div>
                    <div class="text-right text-xs"><p>Month: <strong>February 2024</strong></p><p>Reference: PAY-FEB24-001</p></div>
                </div>
                <div class="p-4 bg-gray-50 border-b">
                    <p><b>Employee:</b> Adebayo Ogunleye &emsp; <b>Designation:</b> Senior Teacher</p>
                    <p><b>Department:</b> Academic &emsp; <b>Bank:</b> GTBank — 0123456789</p>
                </div>
                <div class="grid grid-cols-2 gap-0">
                    <div class="p-4 border-r"><p class="font-bold text-gray-600 mb-2 uppercase text-xs">Earnings</p>
                        <div class="flex justify-between border-b py-1"><span>Basic Salary</span><span>₦150,000</span></div>
                        <div class="flex justify-between border-b py-1"><span>Allowances</span><span>₦20,000</span></div>
                        <div class="flex justify-between py-1 font-bold text-green-700"><span>Gross</span><span>₦170,000</span></div>
                    </div>
                    <div class="p-4"><p class="font-bold text-gray-600 mb-2 uppercase text-xs">Deductions</p>
                        <div class="flex justify-between border-b py-1"><span>Tax</span><span>₦5,000</span></div>
                        <div class="flex justify-between border-b py-1"><span>Pension</span><span>₦3,000</span></div>
                        <div class="flex justify-between py-1 font-bold text-red-600"><span>Total Deduct.</span><span>₦8,000</span></div>
                    </div>
                </div>
                <div class="p-4 bg-green-50 flex justify-between font-extrabold text-green-800 text-base border-t">
                    <span>NET PAY</span><span>₦162,000</span>
                </div>
            </div>`,
    };

    window.templatesApp = {
        filterCategory(cat) {
            currentCategory = cat;
            document.querySelectorAll('.tpl-tab').forEach(b => {
                b.classList.remove('active-tab', 'bg-primary-600', 'text-white');
                b.classList.add('bg-white', 'border', 'border-gray-300', 'text-gray-700');
            });
            const active = document.querySelector(`.tpl-tab[data-cat="${cat}"]`);
            if (active) {
                active.classList.add('active-tab', 'bg-primary-600', 'text-white');
                active.classList.remove('bg-white', 'border', 'border-gray-300', 'text-gray-700');
            }
            render();
        },

        previewTemplate(id) {
            const tpl = templates.find(t => t.id === id);
            if (!tpl) return;
            const previewFn = PREVIEWS[tpl.category];
            document.getElementById('preview-modal-title').textContent = tpl.name;
            document.getElementById('preview-modal-body').innerHTML = previewFn ? previewFn() : `<p class="text-gray-500 text-center py-10">No styled preview available for this template type.</p>`;
            document.getElementById('tplPreviewModal').classList.remove('hidden');
        },

        closePreview() {
            document.getElementById('tplPreviewModal').classList.add('hidden');
        },

        openAddModal() {
            document.getElementById('tpl-form').reset();
            document.getElementById('tpl-id').value = '';
            document.getElementById('tpl-modal-title').textContent = 'Add Template';
            document.getElementById('tplCrudModal').classList.remove('hidden');
        },

        editTemplate(id) {
            const tpl = templates.find(t => t.id === id);
            if (!tpl) return;
            document.getElementById('tpl-id').value = tpl.id;
            document.getElementById('tpl-name').value = tpl.name;
            document.getElementById('tpl-category').value = tpl.category;
            document.getElementById('tpl-desc').value = tpl.desc || '';
            document.getElementById('tpl-modal-title').textContent = 'Edit Template';
            document.getElementById('tplCrudModal').classList.remove('hidden');
        },

        saveTemplate() {
            const id = document.getElementById('tpl-id').value;
            const name = document.getElementById('tpl-name').value.trim();
            const category = document.getElementById('tpl-category').value;
            const desc = document.getElementById('tpl-desc').value.trim();
            if (!name || !category) return;

            if (id) {
                const tpl = templates.find(t => t.id === id);
                if (tpl) { tpl.name = name; tpl.category = category; tpl.desc = desc; }
            } else {
                templates.push({ id: 'TPL' + Date.now(), name, category, desc, createdAt: new Date().toISOString() });
            }
            save();
            this.closeCrudModal();
            render();
            if (typeof window.showToast === 'function') window.showToast('success', 'Template saved.');
        },

        deleteTemplate(id) {
            if (!confirm('Delete this template?')) return;
            templates = templates.filter(t => t.id !== id);
            save();
            render();
            if (typeof window.showToast === 'function') window.showToast('success', 'Template deleted.');
        },

        closeCrudModal() {
            document.getElementById('tplCrudModal').classList.add('hidden');
        }
    };

    init();
})();
