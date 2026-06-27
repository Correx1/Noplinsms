/**
 * Student Wallet & Funding Controller (Paystack & Flutterwave Integration Simulation)
 * Manages parent/student wallets funding, simulated payment gateway overlays, spending limits, and transactional audits.
 */

// Global State
window.selectedWalletChildId = null;
window.activeDrawerStudentId = null;
window.activeAdjustmentType = 'credit';

function safeGetJSON(key, fallback) {
    const val = localStorage.getItem(key);
    if (!val || val === 'undefined') return fallback;
    try {
        const parsed = JSON.parse(val);
        return parsed !== null ? parsed : fallback;
    } catch (e) {
        console.warn(`Failed to parse localStorage key "${key}":`, e);
        return fallback;
    }
}

function initWalletModule() {
    console.log('[wallet.js] initWalletModule running, DOM check:', {
        auditTable: !!document.getElementById('adminAuditTableBody'),
        studentCard: !!document.getElementById('studentWalletBalanceCard'),
        parentSelector: !!document.getElementById('parentChildSelector'),
    });

    // 1. Student Wallet View
    if (document.getElementById('studentWalletBalanceCard')) {
        const currentUser = safeGetJSON('sms_currentUser', {});
        const studentId = currentUser.role === 'Student' ? (currentUser.id || 'STU001') : 'STU001';
        renderStudentWallet(studentId);
    }

    // 2. Parent Wallet View
    if (document.getElementById('parentChildSelector')) {
        initParentWalletView();
    }

    // 3. Admin Wallet Audit View
    if (document.getElementById('adminAuditTableBody')) {
        renderAdminWalletAudit();
    }

    // Embed Gateway Styles
    injectGatewayStyles();
}

// This script is injected by loadScript() after the HTML template is already in the DOM.
// The 'moduleScriptReady' event fires from loadScript's onload callback — meaning
// The actual initWalletModule() call is at the VERY END of this file,
// after all window.* function expressions are defined.
// (Function expressions are NOT hoisted — calling before definition = silent fail)

// ============================================
// STUDENT WALLET VIEW RENDERING
// ============================================

window.renderStudentWallet = function(studentId) {
    console.log('Rendering student wallet view for:', studentId);
    
    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    if (!wallet) return;

    // Set freeze toggle state
    const freezeToggle = document.getElementById('studentWalletFreezeToggle');
    if (freezeToggle) {
        freezeToggle.checked = wallet.status === 'frozen';
    }

    // Balance and Virtual Account Card
    const balanceVal = document.getElementById('studentWalletBalanceVal');
    if (balanceVal) balanceVal.innerText = `₦${wallet.balance.toLocaleString(undefined, {minimumFractionDigits:2})}`;
    
    const accNumber = document.getElementById('walletVirtualAccNo');
    if (accNumber) accNumber.innerText = wallet.virtualAccount.accountNumber;
    
    const accBank = document.getElementById('walletVirtualBank');
    if (accBank) accBank.innerText = wallet.virtualAccount.bankName;
    
    const accName = document.getElementById('walletVirtualAccName');
    if (accName) accName.innerText = wallet.virtualAccount.accountName;

    // Settings info
    const dailyLimitVal = document.getElementById('walletDailyLimitVal');
    if (dailyLimitVal) dailyLimitVal.innerText = `₦${wallet.dailyLimit.toLocaleString()}`;
    
    const spentTodayVal = document.getElementById('walletSpentTodayVal');
    if (spentTodayVal) spentTodayVal.innerText = `₦${wallet.spentToday.toLocaleString()}`;

    const limitProgressBar = document.getElementById('walletLimitProgress');
    if (limitProgressBar) {
        const percent = Math.min(100, (wallet.spentToday / wallet.dailyLimit) * 100);
        limitProgressBar.style.width = `${percent}%`;
    }

    // Category Block Badges
    const canteenBadge = document.getElementById('badge-canteen-status');
    if (canteenBadge) updateCategoryBadge(canteenBadge, wallet.allowedCategories?.canteen);
    
    const stationeryBadge = document.getElementById('badge-stationery-status');
    if (stationeryBadge) updateCategoryBadge(stationeryBadge, wallet.allowedCategories?.stationery);
    
    const uniformsBadge = document.getElementById('badge-uniforms-status');
    if (uniformsBadge) updateCategoryBadge(uniformsBadge, wallet.allowedCategories?.uniforms);
    
    const booksBadge = document.getElementById('badge-books-status');
    if (booksBadge) updateCategoryBadge(booksBadge, wallet.allowedCategories?.books);

    // Recent Ledger Table
    renderStudentWalletLedger(studentId);

    // Draw Spending chart
    drawCategoryDonutChart(studentId);
};

function updateCategoryBadge(badgeEl, isAllowed) {
    if (isAllowed !== false) {
        badgeEl.className = "px-2 py-1 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-lg flex items-center gap-1";
        badgeEl.innerHTML = `<i class="fas fa-check-circle"></i> Enabled`;
    } else {
        badgeEl.className = "px-2 py-1 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-lg flex items-center gap-1";
        badgeEl.innerHTML = `<i class="fas fa-ban"></i> Blocked`;
    }
}

function renderStudentWalletLedger(studentId) {
    const tbody = document.getElementById('studentWalletLedgerTable');
    if (!tbody) return;

    const transactions = safeGetJSON('sms_wallet_transactions', []);
    const filtered = transactions.filter(t => t && t.studentId === studentId);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                <i class="fas fa-receipt text-2xl mb-2"></i>
                <p class="text-xs">No financial transactions logged yet</p>
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(t => {
        const isDeposit = t.type === 'deposit';
        const isAdjustment = t.type === 'adjustment';
        
        let details = t.item || '';
        if (isDeposit && t.method) {
            details = `Wallet Top-up (${t.method})`;
        }
        // Purge any "Gateway: " prefix
        details = details.replace(/Gateway:\s*/gi, '');

        const isCredit = t.type === 'deposit' || (t.type === 'adjustment' && (t.adjType === 'credit' || (t.item && (t.item.toLowerCase().includes('credit') || t.item.toLowerCase().includes('scholarship') || t.item.toLowerCase().includes('top-up')))));

        let typeLabel = isCredit ? 'CREDIT' : 'DEBIT';
        let badgeColor = isCredit
            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
        let amountColor = isCredit ? 'text-green-600' : 'text-red-600';
        let sign = isCredit ? '+' : '-';

        return `
        <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs">
            <td class="px-6 py-3.5 font-mono text-gray-400">${t.id}</td>
            <td class="px-6 py-3.5 font-medium text-gray-500 dark:text-gray-400">${t.date}</td>
            <td class="px-6 py-3.5 font-semibold text-gray-900 dark:text-white">
                ${details}
            </td>
            <td class="px-6 py-3.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}">
                    ${typeLabel}
                </span>
            </td>
            <td class="px-6 py-3.5 text-right font-black ${amountColor}">
                ${sign}₦${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </td>
        </tr>
        `;
    }).join('');
}

function drawCategoryDonutChart(studentId) {
    const chartContainer = document.getElementById('walletCategoryChartBox');
    if (!chartContainer) return;

    const transactions = safeGetJSON('sms_wallet_transactions', []);
    const purchases = transactions.filter(t => t && t.studentId === studentId && t.type === 'purchase');

    // Tally by categories
    let canteenSum = 0;
    let stationerySum = 0;
    let uniformsSum = 0;
    let booksSum = 0;

    purchases.forEach(p => {
        const items = p.item ? p.item.toLowerCase() : '';
        if (items.includes('canteen') || items.includes('lunch') || items.includes('snack') || items.includes('combo')) canteenSum += p.amount;
        else if (items.includes('notebook') || items.includes('set') || items.includes('stationery') || items.includes('ruler')) stationerySum += p.amount;
        else if (items.includes('uniform') || items.includes('dress') || items.includes('shirt')) uniformsSum += p.amount;
        else if (items.includes('textbook') || items.includes('book')) booksSum += p.amount;
        else canteenSum += p.amount; // Fallback
    });

    const totalSpent = canteenSum + stationerySum + uniformsSum + booksSum;

    if (totalSpent === 0) {
        chartContainer.innerHTML = `<div class="flex flex-col items-center justify-center h-48 text-gray-400 text-xs">
            <i class="fas fa-chart-pie text-3xl mb-2"></i>
            <p>No purchase data available for charts</p>
        </div>`;
        return;
    }

    const canteenPct = Math.round((canteenSum / totalSpent) * 100);
    const stationeryPct = Math.round((stationerySum / totalSpent) * 100);
    const uniformsPct = Math.round((uniformsSum / totalSpent) * 100);
    const booksPct = Math.round((booksSum / totalSpent) * 100);

    // High fidelity SVG-rendered Donut Chart
    chartContainer.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center gap-6 py-4">
        <!-- Donut Ring SVG -->
        <div class="relative h-32 w-32 shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle class="text-gray-100 dark:text-gray-700" stroke="currentColor" stroke-width="4" fill="transparent" cx="18" cy="18" r="15.91549430918954"></circle>
                
                <!-- Canteen Slice (Emerald) -->
                <circle class="text-emerald-500" stroke="currentColor" stroke-width="4" stroke-dasharray="${canteenPct} ${100 - canteenPct}" stroke-dashoffset="100" fill="transparent" cx="18" cy="18" r="15.91549430918954"></circle>
                
                <!-- Stationery Slice (Indigo) -->
                <circle class="text-indigo-500" stroke="currentColor" stroke-width="4" stroke-dasharray="${stationeryPct} ${100 - stationeryPct}" stroke-dashoffset="${100 - canteenPct}" fill="transparent" cx="18" cy="18" r="15.91549430918954"></circle>
                
                <!-- Uniforms Slice (Amber) -->
                <circle class="text-amber-500" stroke="currentColor" stroke-width="4" stroke-dasharray="${uniformsPct} ${100 - uniformsPct}" stroke-dashoffset="${100 - canteenPct - stationeryPct}" fill="transparent" cx="18" cy="18" r="15.91549430918954"></circle>
                
                <!-- Books Slice (Sky) -->
                <circle class="text-sky-400" stroke="currentColor" stroke-width="4" stroke-dasharray="${booksPct} ${100 - booksPct}" stroke-dashoffset="${100 - canteenPct - stationeryPct - uniformsPct}" fill="transparent" cx="18" cy="18" r="15.91549430918954"></circle>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase">TOTAL SPENT</span>
                <span class="text-xs font-black text-gray-800 dark:text-white">₦${totalSpent.toLocaleString()}</span>
            </div>
        </div>

        <!-- Legend -->
        <div class="flex-1 grid grid-cols-2 gap-3 text-xs w-full">
            <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded bg-emerald-500 block shrink-0"></span>
                <div class="min-w-0">
                    <span class="text-gray-400 block truncate">Canteen</span>
                    <span class="font-bold text-gray-700 dark:text-gray-300">₦${canteenSum.toLocaleString()} (${canteenPct}%)</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded bg-indigo-500 block shrink-0"></span>
                <div class="min-w-0">
                    <span class="text-gray-400 block truncate">Stationery</span>
                    <span class="font-bold text-gray-700 dark:text-gray-300">₦${stationerySum.toLocaleString()} (${stationeryPct}%)</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded bg-amber-500 block shrink-0"></span>
                <div class="min-w-0">
                    <span class="text-gray-400 block truncate">Uniforms</span>
                    <span class="font-bold text-gray-700 dark:text-gray-300">₦${uniformsSum.toLocaleString()} (${uniformsPct}%)</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded bg-sky-400 block shrink-0"></span>
                <div class="min-w-0">
                    <span class="text-gray-400 block truncate">Books</span>
                    <span class="font-bold text-gray-700 dark:text-gray-300">₦${booksSum.toLocaleString()} (${booksPct}%)</span>
                </div>
            </div>
        </div>
    </div>
    `;
}

// ============================================
// PARENT WALLET CONTROLLERS
// ============================================

function initParentWalletView() {
    const selector = document.getElementById('parentChildSelector');
    if (!selector) return;

    // Load mock children (parents manage STU001 and STU002 by default)
    let students = JSON.parse(localStorage.getItem('sms_students'));
    if (!Array.isArray(students) || students.length === 0) {
        students = window.SchoolDatabase.students || [];
    }
    const children = students.filter(s => s.id === 'STU001' || s.id === 'STU002');

    selector.innerHTML = children.map(c => `<option value="${c.id}">${c.name} (${c.class || 'SS3'})</option>`).join('');

    // Preselect
    if (!window.selectedWalletChildId) {
        window.selectedWalletChildId = children[0]?.id || 'STU001';
    }
    selector.value = window.selectedWalletChildId;

    renderParentWalletChild();

    // Bind event listener to selector
    selector.addEventListener('change', (e) => {
        window.selectedWalletChildId = e.target.value;
        renderParentWalletChild();
    });
}

window.renderParentWalletChild = function() {
    const childId = window.selectedWalletChildId;
    if (!childId) return;

    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[childId];
    if (!wallet) return;

    // Child Balance card
    document.getElementById('childWalletBalanceVal').innerText = `₦${wallet.balance.toLocaleString(undefined, {minimumFractionDigits:2})}`;
    document.getElementById('childVirtualAccNo').innerText = wallet.virtualAccount.accountNumber;
    document.getElementById('childVirtualBank').innerText = wallet.virtualAccount.bankName;
    document.getElementById('childVirtualAccName').innerText = wallet.virtualAccount.accountName;

    // Daily Limit Slider & Input
    const limitSlider = document.getElementById('parentLimitSlider');
    const limitVal = document.getElementById('parentLimitVal');
    if (limitSlider && limitVal) {
        limitSlider.value = wallet.dailyLimit;
        limitVal.innerText = `₦${wallet.dailyLimit.toLocaleString()}`;
    }

    // Category Block Toggles
    const toggleCanteen = document.getElementById('toggle-block-canteen');
    if (toggleCanteen) toggleCanteen.checked = wallet.allowedCategories?.canteen !== false;

    const toggleStationery = document.getElementById('toggle-block-stationery');
    if (toggleStationery) toggleStationery.checked = wallet.allowedCategories?.stationery !== false;

    const toggleUniforms = document.getElementById('toggle-block-uniforms');
    if (toggleUniforms) toggleUniforms.checked = wallet.allowedCategories?.uniforms !== false;

    const toggleBooks = document.getElementById('toggle-block-books');
    if (toggleBooks) toggleBooks.checked = wallet.allowedCategories?.books !== false;

    // Auto-Topup state
    const toggleAutotopup = document.getElementById('toggle-parent-autotopup');
    if (toggleAutotopup) toggleAutotopup.checked = wallet.autoTopup === true;

    const autoThreshold = document.getElementById('parentAutoThreshold');
    if (autoThreshold) autoThreshold.value = typeof wallet.autoThreshold === 'number' ? wallet.autoThreshold : 500;

    const autoAmount = document.getElementById('parentAutoAmount');
    if (autoAmount) autoAmount.value = typeof wallet.autoAmount === 'number' ? wallet.autoAmount : 2000;

    // Category Specific daily allowance limits
    const limitCanteen = document.getElementById('limit-canteen');
    if (limitCanteen) limitCanteen.value = (wallet.categoryLimits && typeof wallet.categoryLimits.canteen === 'number') ? wallet.categoryLimits.canteen : 1000;

    const limitStationery = document.getElementById('limit-stationery');
    if (limitStationery) limitStationery.value = (wallet.categoryLimits && typeof wallet.categoryLimits.stationery === 'number') ? wallet.categoryLimits.stationery : 2000;

    const limitUniforms = document.getElementById('limit-uniforms');
    if (limitUniforms) limitUniforms.value = (wallet.categoryLimits && typeof wallet.categoryLimits.uniforms === 'number') ? wallet.categoryLimits.uniforms : 5000;

    const limitBooks = document.getElementById('limit-books');
    if (limitBooks) limitBooks.value = (wallet.categoryLimits && typeof wallet.categoryLimits.books === 'number') ? wallet.categoryLimits.books : 5000;

    // Render transactions ledger
    renderStudentWalletLedger(childId);
};

window.handleParentLimitSlide = function(value) {
    const limitText = document.getElementById('parentLimitVal');
    if (limitText) {
        limitText.innerText = `₦${parseInt(value).toLocaleString()}`;
    }
    
    // Save to local storage immediately
    saveParentWalletSettings();
};

window.saveParentWalletSettings = function() {
    const childId = window.selectedWalletChildId;
    if (!childId) return;

    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[childId];
    if (!wallet) return;

    // Get limit
    const limitSlider = document.getElementById('parentLimitSlider');
    if (limitSlider) {
        wallet.dailyLimit = parseInt(limitSlider.value);
    }

    // Get category blocks
    wallet.allowedCategories = {
        canteen: document.getElementById('toggle-block-canteen')?.checked ?? true,
        stationery: document.getElementById('toggle-block-stationery')?.checked ?? true,
        uniforms: document.getElementById('toggle-block-uniforms')?.checked ?? true,
        books: document.getElementById('toggle-block-books')?.checked ?? true
    };

    // Auto-Topup rules
    wallet.autoTopup = document.getElementById('toggle-parent-autotopup')?.checked ?? false;
    wallet.autoThreshold = parseFloat(document.getElementById('parentAutoThreshold')?.value) || 500;
    wallet.autoAmount = parseFloat(document.getElementById('parentAutoAmount')?.value) || 2000;

    // Category specific limits
    wallet.categoryLimits = {
        canteen: parseFloat(document.getElementById('limit-canteen')?.value) || 1000,
        stationery: parseFloat(document.getElementById('limit-stationery')?.value) || 2000,
        uniforms: parseFloat(document.getElementById('limit-uniforms')?.value) || 5000,
        books: parseFloat(document.getElementById('limit-books')?.value) || 5000
    };

    wallets[childId] = wallet;
    localStorage.setItem('sms_wallets', JSON.stringify(wallets));
    console.log(`Saved settings for child ${childId}: Limit=${wallet.dailyLimit}`);
};

// ============================================
// ADMIN FINANCE WALLET AUDITING & DIRECTORIES
// ============================================

window.renderAdminWalletAudit = function() {
    const tbody = document.getElementById('adminAuditTableBody');
    if (!tbody) return;

    const wallets = safeGetJSON('sms_wallets', {});
    const transactions = safeGetJSON('sms_wallet_transactions', []);
    let studentsList = safeGetJSON('sms_students', null);
    if (!Array.isArray(studentsList) || studentsList.length === 0) {
        studentsList = window.SchoolDatabase.students || [];
    }

    // 1. Calculate & Display Aggregate KPI Metrics
    const walletKeys = Object.keys(wallets);
    const totalDeposited = transactions.filter(t => t && t.type === 'deposit').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
    const totalSpent = transactions.filter(t => t && t.type === 'purchase').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
    const activeBalance = walletKeys.reduce((sum, key) => sum + (typeof wallets[key].balance === 'number' ? wallets[key].balance : 0), 0);

    const totalDepEl = document.getElementById('adminTotalDeposits');
    if (totalDepEl) totalDepEl.innerText = `₦${totalDeposited.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    const totalSpentEl = document.getElementById('adminTotalPOSSales');
    if (totalSpentEl) totalSpentEl.innerText = `₦${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    const activeBalEl = document.getElementById('adminActiveBalances');
    if (activeBalEl) activeBalEl.innerText = `₦${activeBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    const settledEl = document.getElementById('adminSettledFunds');
    if (settledEl) settledEl.innerText = `₦${totalDeposited.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    // 2. Filter & Render Student Wallet directory
    const search = document.getElementById('auditSearch')?.value.toLowerCase() || '';
    const classFilter = document.getElementById('auditClassFilter')?.value || 'all';

    let filteredKeys = walletKeys.filter(key => {
        const wallet = wallets[key];
        if (!wallet) return false;

        const student = studentsList.find(s => s.id === wallet.studentId) || { name: wallet.studentName || 'Unknown Student', class: 'SS3', gender: 'Female' };
        const studentClass = student.class || student.className || 'SS3';
        const studentName = wallet.studentName || student.name || '';
        const studentId = wallet.studentId || key || '';
        const accNo = (wallet.virtualAccount && wallet.virtualAccount.accountNumber) || '';

        const matchesSearch = studentName.toLowerCase().includes(search) || 
                              studentId.toLowerCase().includes(search) ||
                              accNo.includes(search);
                              
        const matchesClass = classFilter === 'all' || studentClass.toUpperCase().includes(classFilter.toUpperCase());
        
        return matchesSearch && matchesClass;
    });

    if (filteredKeys.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <i class="fas fa-user-slash text-3xl mb-2 text-gray-455"></i>
                <p class="text-sm font-semibold">No student wallet accounts match the criteria.</p>
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = filteredKeys.map(key => {
        const wallet = wallets[key];
        const student = studentsList.find(s => s.id === wallet.studentId) || { name: wallet.studentName || 'Unknown Student', class: 'SS3', gender: 'Female' };
        const studentClass = student.class || student.className || 'SS3';
        const studentName = wallet.studentName || student.name || 'Unknown Student';
        const studentId = wallet.studentId || key || '';
        const isMale = student.gender === 'Male';
        const avatar = isMale ? '👦' : '👧';

        const accNumber = (wallet.virtualAccount && wallet.virtualAccount.accountNumber) || '—';
        const dailyLimit = typeof wallet.dailyLimit === 'number' ? wallet.dailyLimit : 2000;
        const balance = typeof wallet.balance === 'number' ? wallet.balance : 0;

        return `
        <tr class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors text-xs">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-650 dark:text-primary-400 flex items-center justify-center text-lg font-bold shadow-sm select-none">
                        ${avatar}
                    </div>
                    <div>
                        <span class="block text-sm font-bold text-gray-900 dark:text-white">${studentName}</span>
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Class: ${studentClass}</span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 font-mono font-bold text-xs text-primary-600 dark:text-primary-400">${studentId}</td>
            <td class="px-6 py-4 font-mono font-bold text-gray-800 dark:text-gray-200 tracking-wider">${accNumber}</td>
            <td class="px-6 py-4 text-right font-bold text-gray-700 dark:text-gray-300">
                ₦${dailyLimit.toLocaleString()}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex flex-col items-end">
                    <span class="font-black text-sm ${balance < 500 ? 'text-red-650 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
                        ₦${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                    ${balance < 500 ? `<span class="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded mt-0.5">LOW BALANCE</span>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="openAdminStudentDrawer('${studentId}')"
                    class="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 dark:bg-primary-950/30 dark:hover:bg-primary-950/50 dark:text-primary-400 font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 ml-auto">
                    <i class="fas fa-user-cog"></i> Manage Wallet
                </button>
            </td>
        </tr>
        `;
    }).join('');
};

window.filterAdminAudit = function() {
    renderAdminWalletAudit();
};

// ============================================
// ADMIN STUDENT DRAWER & CONTROLS
// ============================================

window.openAdminStudentDrawer = function(studentId) {
    console.log('Opening Admin Drawer for student:', studentId);
    window.activeDrawerStudentId = studentId;
    window.activeAdjustmentType = 'credit'; // default

    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    if (!wallet) return;

    let students = JSON.parse(localStorage.getItem('sms_students'));
    if (!Array.isArray(students) || students.length === 0) {
        students = window.SchoolDatabase.students || [];
    }
    const student = students.find(s => s.id === studentId) || {
        id: studentId,
        name: wallet.studentName,
        class: "SS3",
        gender: "Female"
    };

    // Update Drawer Profile Info
    document.getElementById('drawerStudentAvatar').innerText = student.gender === 'Male' ? '👦' : '👧';
    document.getElementById('drawerStudentName').innerText = wallet.studentName;
    document.getElementById('drawerStudentClass').innerText = `Class: ${student.class || student.className || 'SSS3A'}`;
    document.getElementById('drawerStudentId').innerText = wallet.studentId;
    document.getElementById('drawerWalletBalance').innerText = `₦${wallet.balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    
    document.getElementById('drawerVirtualBank').innerText = wallet.virtualAccount.bankName;
    document.getElementById('drawerVirtualAccNo').innerText = wallet.virtualAccount.accountNumber;

    // Set configuration controls
    document.getElementById('drawerDailyLimitInput').value = wallet.dailyLimit;
    
    document.getElementById('drawerToggleCanteen').checked = wallet.allowedCategories?.canteen !== false;
    document.getElementById('drawerToggleStationery').checked = wallet.allowedCategories?.stationery !== false;
    document.getElementById('drawerToggleUniforms').checked = wallet.allowedCategories?.uniforms !== false;
    document.getElementById('drawerToggleBooks').checked = wallet.allowedCategories?.books !== false;

    // Reset manual adjustment form
    document.getElementById('adjAmount').value = '';
    document.getElementById('adjReason').value = '';
    setAdjustmentType('credit');

    // Render Student-specific Transaction History in Drawer
    renderDrawerTransactions(studentId);

    // Open animations
    const backdrop = document.getElementById('adminStudentDrawerBackdrop');
    const drawer = document.getElementById('adminStudentDrawer');
    
    backdrop.classList.remove('hidden');
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        drawer.classList.remove('translate-x-full');
        drawer.classList.add('translate-x-0');
    }, 50);
};

window.closeAdminStudentDrawer = function() {
    const backdrop = document.getElementById('adminStudentDrawerBackdrop');
    const drawer = document.getElementById('adminStudentDrawer');
    if (!backdrop || !drawer) return;

    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');

    setTimeout(() => {
        backdrop.classList.add('hidden');
    }, 300);
};

window.setAdjustmentType = function(type) {
    window.activeAdjustmentType = type;
    const credBtn = document.getElementById('adjTypeCredit');
    const debBtn = document.getElementById('adjTypeDebit');
    if (!credBtn || !debBtn) return;
    
    if (type === 'credit') {
        credBtn.className = "py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-center shadow-sm text-[11px] transition-all flex items-center justify-center gap-1";
        debBtn.className = "py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-lg text-center text-[11px] transition-all flex items-center justify-center gap-1";
    } else {
        debBtn.className = "py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-center shadow-sm text-[11px] transition-all flex items-center justify-center gap-1";
        credBtn.className = "py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-lg text-center text-[11px] transition-all flex items-center justify-center gap-1";
    }
};

function renderDrawerTransactions(studentId) {
    const container = document.getElementById('drawerTransactionsContainer');
    if (!container) return;

    const transactions = safeGetJSON('sms_wallet_transactions', []);
    const filtered = transactions.filter(t => t && t.studentId === studentId);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-center py-6 text-gray-450 dark:text-gray-450 text-xs">No transactions logged for this student.</p>`;
        return;
    }

    container.innerHTML = filtered.map(t => {
        // Every transaction is either a credit (money in) or debit (money out)
        const isCredit = t.type === 'deposit' || t.type === 'adjustment' && t.adjType === 'credit';
        // For adjustments, check the stored adjType or fall back to amount sign logic
        let credit = false;
        if (t.type === 'deposit') {
            credit = true;
        } else if (t.type === 'adjustment') {
            // If adjType stored on the record use it, otherwise treat as credit
            credit = t.adjType === 'credit' || t.adjType === undefined;
        } else {
            // purchase = debit
            credit = false;
        }

        const label = credit
            ? `<span class="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-[9px] font-bold rounded">CREDIT</span>`
            : `<span class="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-[9px] font-bold rounded">DEBIT</span>`;

        const amtColor = credit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const sign = credit ? '+' : '-';

        let details = t.item || (t.type === 'deposit' ? 'Wallet Top-up' : t.type);
        details = details.replace(/Gateway:\s*/gi, '');

        return `
        <div class="py-2.5 flex justify-between items-center text-xs border-b border-gray-100 dark:border-gray-700/60">
            <div>
                <div class="flex items-center gap-1.5">
                    ${label}
                    <span class="font-bold text-gray-850 dark:text-white">${details}</span>
                </div>
                <span class="text-[10px] text-gray-400 block mt-0.5 font-mono">${t.date}</span>
            </div>
            <span class="font-black ${amtColor}">${sign}₦${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
        `;
    }).join('');
}

window.saveDrawerStudentSettings = function() {
    const studentId = window.activeDrawerStudentId;
    if (!studentId) return;

    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    if (!wallet) return;

    // Parse daily limit
    const limitInput = document.getElementById('drawerDailyLimitInput');
    const limit = parseInt(limitInput.value);
    if (isNaN(limit) || limit < 0) {
        showToast('Please enter a valid spending limit', 'error');
        return;
    }

    wallet.dailyLimit = limit;
    wallet.allowedCategories = {
        canteen: document.getElementById('drawerToggleCanteen').checked,
        stationery: document.getElementById('drawerToggleStationery').checked,
        uniforms: document.getElementById('drawerToggleUniforms').checked,
        books: document.getElementById('drawerToggleBooks').checked
    };

    wallets[studentId] = wallet;
    localStorage.setItem('sms_wallets', JSON.stringify(wallets));
    
    showToast('Student controls saved successfully', 'success');
    
    // Refresh views
    renderAdminWalletAudit();
    
    // Update balance displayed in drawer
    document.getElementById('drawerWalletBalance').innerText = `₦${wallet.balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
};

window.applyDrawerBalanceAdjustment = function() {
    const studentId = window.activeDrawerStudentId;
    if (!studentId) return;

    const amountInput = document.getElementById('adjAmount');
    const reasonInput = document.getElementById('adjReason');

    const amount = parseFloat(amountInput.value);
    const reason = reasonInput.value.trim();

    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid adjustment amount', 'error');
        return;
    }
    if (reason.length === 0) {
        showToast('Please enter a reason for the adjustment', 'error');
        return;
    }

    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    if (!wallet) return;

    const isCredit = window.activeAdjustmentType === 'credit';
    
    if (!isCredit && wallet.balance < amount) {
        if (!confirm(`Warning: Student balance is ₦${wallet.balance.toLocaleString()}, which is less than the debit amount of ₦${amount.toLocaleString()}. Proceed anyway?`)) {
            return;
        }
    }

    // Apply adjustment
    if (isCredit) {
        wallet.balance += amount;
    } else {
        wallet.balance -= amount;
    }

    wallets[studentId] = wallet;
    localStorage.setItem('sms_wallets', JSON.stringify(wallets));

    // Log adjustment transaction
    const transactions = JSON.parse(localStorage.getItem('sms_wallet_transactions')) || [];
    const ref = "ADJ-" + Math.floor(100000 + Math.random() * 900000);
    const todayStr = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0];

    const transaction = {
        id: ref,
        studentId: wallet.studentId,
        studentName: wallet.studentName,
        type: "adjustment",
        amount: amount,
        item: `${isCredit ? 'Credit' : 'Debit'} Adjustment: ${reason}`,
        date: todayStr,
        status: "Successful",
        reference: ref,
        verification: "Admin Manual",
        cashierId: localStorage.getItem('savedUsername') || "Admin"
    };

    transactions.unshift(transaction);
    localStorage.setItem('sms_wallet_transactions', JSON.stringify(transactions));

    showToast('Financial adjustment applied successfully!', 'success');

    // Reset inputs
    amountInput.value = '';
    reasonInput.value = '';

    // Refresh both the main admin view and the drawer
    renderAdminWalletAudit();
    
    // Update drawer balance & transaction list
    document.getElementById('drawerWalletBalance').innerText = `₦${wallet.balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    renderDrawerTransactions(studentId);
};

// ============================================
// PAYSTACK / FLUTTERWAVE GATEWAY SIMULATOR
// ============================================

window.openFundingModal = function() {
    const parentSelector = document.getElementById('parentChildSelector');
    let studentId = '';
    
    if (parentSelector) {
        studentId = parentSelector.value;
    } else {
        const currentUser = JSON.parse(localStorage.getItem('sms_currentUser')) || {};
        studentId = currentUser.role === 'Student' ? (currentUser.id || 'STU001') : 'STU001';
    }

    // Render the simulated overlay
    renderGatewayOverlay(studentId);
};

function renderGatewayOverlay(studentId) {
    // Prevent duplicate overlays
    if (document.getElementById('gateway-modal-overlay')) return;

    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    if (!wallet) return;

    const markup = `
    <div id="gateway-modal-overlay">
        <div class="gateway-box bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-2xl relative max-w-md w-full mx-4">
            <!-- Close -->
            <button onclick="closeGatewayOverlay()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <i class="fas fa-times text-lg"></i>
            </button>
            
            <!-- Gateway Head -->
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
                <div class="flex items-center gap-2">
                    <div class="px-2 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold rounded" id="gatewayLogo">
                        PAYSTACK
                    </div>
                    <span class="text-xs text-gray-400">Secured Checkout</span>
                </div>
                <div class="text-right">
                    <span class="text-[10px] text-gray-400 block">SCHOOL ACCOUNT SETTLEMENT</span>
                    <span class="text-[9px] font-bold bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 px-2 py-0.5 rounded">Noplin Academy Ltd</span>
                </div>
            </div>

            <!-- Set Funding Amount -->
            <div id="gwAmountStep" class="space-y-4">
                <h3 class="text-base font-extrabold">Fund Student Wallet</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Funds deposited will be credited to <strong>${wallet.studentName}</strong>'s wallet while settling into the school's bank account.</p>
                
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Enter Amount (₦)</label>
                    <input type="number" id="gwFundAmount" value="2000" min="100" max="100000"
                        class="block w-full px-3.5 py-3 text-lg font-extrabold border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center focus:ring-primary-500">
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="selectGateway('Paystack', this)" class="py-2.5 bg-teal-600 text-white font-bold rounded-lg text-xs shadow hover:bg-teal-700 transition-colors flex items-center justify-center gap-1 gw-select-btn">
                        <i class="fas fa-check-circle"></i> Use Paystack
                    </button>
                    <button onclick="selectGateway('Flutterwave', this)" class="py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 gw-select-btn">
                        Use Flutterwave
                    </button>
                </div>

                <button onclick="proceedToGatewayCheckout('${studentId}')"
                    class="w-full mt-2 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all duration-200">
                    Proceed to Payment
                </button>
            </div>

            <!-- Mock Checkout Terminal (Initially Hidden) -->
            <div id="gwCheckoutStep" class="hidden space-y-4">
                <!-- Tabs -->
                <div class="grid grid-cols-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <button onclick="switchGwMethod('card')" id="tabGwCard" class="py-1.5 text-xs font-bold text-primary-600 border-b-2 border-primary-500">
                        <i class="fas fa-credit-card mr-1"></i> Pay with Card
                    </button>
                    <button onclick="switchGwMethod('transfer')" id="tabGwTransfer" class="py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600">
                        <i class="fas fa-university mr-1"></i> Bank Transfer
                    </button>
                </div>

                <!-- Pay with Card view -->
                <div id="gwCardView" class="space-y-3">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Card Number</label>
                        <input type="text" id="gwCardNo" value="4012 8829 1044 1928" placeholder="Card Number"
                            class="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Expiry</label>
                            <input type="text" id="gwCardExp" value="12/29" placeholder="MM/YY"
                                class="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">CVV</label>
                            <input type="password" id="gwCardCvv" value="123" placeholder="***"
                                class="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center">
                        </div>
                    </div>
                    
                    <button onclick="simulateCardCharge('${studentId}')" id="cardPayBtn"
                        class="w-full mt-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors">
                        Pay ₦2,000
                    </button>
                </div>

                <!-- Pay with Transfer view -->
                <div id="gwTransferView" class="hidden space-y-4">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Transfer the exact amount to the student's assigned virtual account below. Settlements clear instantly.</p>
                    
                    <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 font-semibold text-xs">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Bank Name</span>
                            <span class="text-gray-800 dark:text-gray-200" id="gwTransferBank">Providus Bank</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Account Number</span>
                            <div class="flex items-center gap-1">
                                <span class="text-gray-800 dark:text-gray-200 font-mono text-sm font-bold" id="gwTransferAccNo">9920148810</span>
                                <button onclick="copyGwAccNo()" class="text-primary-500 hover:text-primary-700 p-1"><i class="fas fa-copy"></i></button>
                            </div>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Account Name</span>
                            <span class="text-gray-800 dark:text-gray-200 text-right" id="gwTransferAccName">Noplin Academy / Adebayo Ogunlesi</span>
                        </div>
                    </div>
                    
                    <button onclick="simulateTransferCheck('${studentId}')" id="transferPayBtn"
                        class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors">
                        I have sent the money
                    </button>
                </div>
            </div>

            <!-- OTP Step (Initially Hidden) -->
            <div id="gwOtpStep" class="hidden space-y-4 text-center">
                <h3 class="text-base font-extrabold"><i class="fas fa-shield-alt text-primary-500"></i> Two-Factor Authentication</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">A simulated OTP verification request has been sent to your bank. Enter code <strong>1234</strong> to approve.</p>
                
                <div>
                    <input type="text" id="gwOtpCode" placeholder="Enter OTP" maxlength="4"
                        class="block w-40 mx-auto px-3 py-2 text-center text-lg font-extrabold border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white tracking-widest">
                </div>

                <button onclick="verifySimulatedOtp('${studentId}')"
                    class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors">
                    Submit Code
                </button>
            </div>

            <!-- Success Step (Initially Hidden) -->
            <div id="gwSuccessStep" class="hidden space-y-4 text-center py-6">
                <div class="h-16 w-16 bg-green-100 dark:bg-green-950/40 border-2 border-green-500 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                    <i class="fas fa-check"></i>
                </div>
                <h3 class="text-lg font-black text-green-600">Payment Successful!</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Wallet has been successfully funded. Settlements are recorded in the school's ledgers.</p>
                <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-xs font-semibold">
                    <div class="flex justify-between mb-1">
                        <span>Funded Amount:</span>
                        <span class="text-primary-600 dark:text-primary-400" id="successFundedAmt">₦2,000.00</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Reference:</span>
                        <span class="font-mono text-gray-500" id="successRef">PSTK-9912882</span>
                    </div>
                </div>
                <button onclick="closeGatewayOverlay()"
                    class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 font-bold rounded-lg text-xs transition-colors">
                    Done
                </button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', markup);
    document.getElementById('gateway-modal-overlay').classList.add('active');
}

window.closeGatewayOverlay = function() {
    const overlay = document.getElementById('gateway-modal-overlay');
    if (overlay) overlay.remove();
};

window.selectGateway = function(name, btn) {
    // Reset buttons
    document.querySelectorAll('.gw-select-btn').forEach(b => {
        b.className = "py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 gw-select-btn";
    });

    const isPaystack = name === 'Paystack';
    const activeColorClass = isPaystack ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white";
    btn.className = `py-2.5 ${activeColorClass} font-bold rounded-lg text-xs shadow transition-colors flex items-center justify-center gap-1 gw-select-btn`;
    btn.innerHTML = `<i class="fas fa-check-circle"></i> Use ${name}`;

    document.getElementById('gatewayLogo').innerText = name.toUpperCase();
    document.getElementById('gatewayLogo').className = `px-2 py-1 ${isPaystack ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'} text-[10px] font-bold rounded`;
    
    window.activeGatewayName = name;
};

window.proceedToGatewayCheckout = function(studentId) {
    const amount = parseFloat(document.getElementById('gwFundAmount').value) || 0;
    if (amount < 100) {
        showToast('Minimum deposit is ₦100', 'error');
        return;
    }

    window.gwFundingAmount = amount;
    window.activeGatewayName = window.activeGatewayName || 'Paystack';

    // Update Checkout Buttons
    const checkoutBtn = document.getElementById('cardPayBtn');
    const transferBtn = document.getElementById('transferPayBtn');
    if (!checkoutBtn || !transferBtn) return;
    
    const colorClass = window.activeGatewayName === 'Paystack' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-purple-600 hover:bg-purple-700';
    
    checkoutBtn.className = `w-full mt-2 py-3 ${colorClass} text-white font-bold rounded-xl text-sm shadow-md transition-colors`;
    checkoutBtn.innerText = `Pay ₦${amount.toLocaleString()}`;
    
    transferBtn.className = `w-full py-3 ${colorClass} text-white font-bold rounded-xl text-sm shadow-md transition-colors`;

    // Populate transfer info
    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    
    document.getElementById('gwTransferBank').innerText = wallet.virtualAccount.bankName;
    document.getElementById('gwTransferAccNo').innerText = wallet.virtualAccount.accountNumber;
    document.getElementById('gwTransferAccName').innerText = wallet.virtualAccount.accountName;

    // Switch view
    document.getElementById('gwAmountStep').classList.add('hidden');
    document.getElementById('gwCheckoutStep').classList.remove('hidden');
};

window.switchGwMethod = function(method) {
    const isCard = method === 'card';
    const cardTab = document.getElementById('tabGwCard');
    const transferTab = document.getElementById('tabGwTransfer');
    
    if (isCard) {
        cardTab.className = "py-1.5 text-xs font-bold text-primary-600 border-b-2 border-primary-500";
        transferTab.className = "py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600";
        document.getElementById('gwCardView').classList.remove('hidden');
        document.getElementById('gwTransferView').classList.add('hidden');
    } else {
        transferTab.className = "py-1.5 text-xs font-bold text-primary-600 border-b-2 border-primary-500";
        cardTab.className = "py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600";
        document.getElementById('gwCardView').classList.add('hidden');
        document.getElementById('gwTransferView').classList.remove('hidden');
    }
};

window.copyGwAccNo = function() {
    const no = document.getElementById('gwTransferAccNo').innerText;
    navigator.clipboard.writeText(no);
    showToast('Virtual account number copied!', 'success');
};

window.simulateCardCharge = function(studentId) {
    const cardNo = document.getElementById('gwCardNo').value.trim();
    if (cardNo.length === 0) {
        showToast('Please enter card number', 'error');
        return;
    }

    const payBtn = document.getElementById('cardPayBtn');
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Processing Card...';

    setTimeout(() => {
        // Go to OTP step
        document.getElementById('gwCheckoutStep').classList.add('hidden');
        document.getElementById('gwOtpStep').classList.remove('hidden');
        
        // Auto-focus OTP
        const otpIn = document.getElementById('gwOtpCode');
        if (otpIn) otpIn.focus();
    }, 1500);
};

window.simulateTransferCheck = function(studentId) {
    const payBtn = document.getElementById('transferPayBtn');
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Verifying Transfer...';

    setTimeout(() => {
        // Complete transfer directly on clearing
        completeFundingTransaction(studentId, 'Bank Transfer');
    }, 2000);
};

window.verifySimulatedOtp = function(studentId) {
    const code = document.getElementById('gwOtpCode').value.trim();
    if (code !== '1234') {
        showToast('Invalid simulated OTP. Enter code 1234.', 'error');
        return;
    }

    completeFundingTransaction(studentId, 'Credit Card');
};

function completeFundingTransaction(studentId, method) {
    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    const transactions = JSON.parse(localStorage.getItem('sms_wallet_transactions')) || [];
    
    const amount = window.gwFundingAmount;
    const gateway = window.activeGatewayName || 'Paystack';
    const ref = (gateway === 'Paystack' ? 'PSTK-' : 'FLW-') + Math.floor(1000000 + Math.random() * 9000000);
    const todayStr = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0];

    // Deposit to Wallet balance
    wallet.balance += amount;
    wallets[studentId] = wallet;
    localStorage.setItem('sms_wallets', JSON.stringify(wallets));

    // Log transaction
    const transaction = {
        id: ref,
        studentId: wallet.studentId,
        studentName: wallet.studentName,
        type: "deposit",
        amount: amount,
        method: `${gateway} (${method})`,
        date: todayStr,
        status: "Successful",
        reference: ref
    };

    transactions.unshift(transaction);
    localStorage.setItem('sms_wallet_transactions', JSON.stringify(transactions));

    // Show Success screen
    document.getElementById('gwCheckoutStep').classList.add('hidden');
    document.getElementById('gwOtpStep').classList.add('hidden');
    
    const successStep = document.getElementById('gwSuccessStep');
    if (successStep) successStep.classList.remove('hidden');

    const successFundedAmt = document.getElementById('successFundedAmt');
    if (successFundedAmt) successFundedAmt.innerText = `₦${amount.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    const successRef = document.getElementById('successRef');
    if (successRef) successRef.innerText = ref;

    showToast('Wallet credited successfully!', 'success');

    // Trigger page re-rendering depending on active context
    if (document.getElementById('studentWalletBalanceCard')) {
        renderStudentWallet(studentId);
    }
    if (document.getElementById('parentChildSelector')) {
        renderParentWalletChild();
    }
    if (document.getElementById('adminAuditTableBody')) {
        renderAdminWalletAudit();
    }
}

// ============================================
// ADMIN BULK ACTIONS & EXPORTS
// ============================================

window.openBulkAdjustmentModal = function() {
    const modal = document.getElementById('bulkAdjustmentModal');
    if (modal) {
        document.getElementById('bulkAdjustmentForm').reset();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeBulkAdjustmentModal = function() {
    const modal = document.getElementById('bulkAdjustmentModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.applyBulkBalanceAdjustment = function(e) {
    if (e) e.preventDefault();
    
    const targetClass = document.getElementById('bulkAdjClass').value;
    const radioType = document.querySelector('input[name="bulkAdjType"]:checked')?.value || 'credit';
    const amount = parseFloat(document.getElementById('bulkAdjAmount').value) || 0;
    const reason = document.getElementById('bulkAdjReason').value.trim();

    if (amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    const wallets = safeGetJSON('sms_wallets', {});
    const transactions = safeGetJSON('sms_wallet_transactions', []);
    let studentsList = safeGetJSON('sms_students', null);
    if (!Array.isArray(studentsList) || studentsList.length === 0) {
        studentsList = window.SchoolDatabase.students || [];
    }

    // Filter students by class
    const targetStudents = studentsList.filter(s => {
        const studentClass = s.class || s.className || 'SS3';
        return targetClass === 'all' || studentClass.toUpperCase().includes(targetClass.toUpperCase());
    });

    if (targetStudents.length === 0) {
        alert('No students found in the selected class.');
        return;
    }

    let affectedCount = 0;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    targetStudents.forEach(student => {
        // Ensure wallet exists
        if (!wallets[student.id]) {
            wallets[student.id] = {
                studentId: student.id,
                studentName: student.name,
                balance: 0,
                dailyLimit: 2000,
                spentToday: 0,
                virtualAccount: {
                    bankName: 'Providus Bank',
                    accountNumber: '99' + Math.floor(10000000 + Math.random() * 90000000),
                    accountName: `Noplin Academy / ${student.name}`
                },
                allowedCategories: { canteen: true, stationery: true, uniforms: true, books: true }
            };
        }

        const wallet = wallets[student.id];
        
        if (radioType === 'credit') {
            wallet.balance += amount;
        } else {
            wallet.balance = Math.max(0, wallet.balance - amount);
        }

        // Add ledger record
        transactions.push({
            id: 'TXN' + Math.floor(100000 + Math.random() * 900000),
            studentId: student.id,
            studentName: student.name,
            amount: amount,
            type: 'adjustment',
            adjType: radioType,
            item: `Bulk Adjustment: ${reason} (${radioType === 'credit' ? 'Credit' : 'Debit'})`,
            date: timestamp
        });

        affectedCount++;
    });

    localStorage.setItem('sms_wallets', JSON.stringify(wallets));
    localStorage.setItem('sms_wallet_transactions', JSON.stringify(transactions));

    // Reload UI
    window.renderAdminWalletAudit();
    closeBulkAdjustmentModal();

    if (typeof showToast === 'function') {
        showToast(`Successfully processed adjustments for ${affectedCount} students.`, 'success');
    } else {
        alert(`Successfully processed adjustments for ${affectedCount} students.`);
    }
};

window.exportAuditCSV = function() {
    const transactions = safeGetJSON('sms_wallet_transactions', []);
    if (transactions.length === 0) {
        alert('No transactions found to export.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Student ID,Student Name,Amount,Type,Details,Date & Time\n";

    transactions.forEach(t => {
        if (!t) return;
        const details = t.item || (t.type === 'deposit' ? `Top-up (${t.method || 'Online'})` : '');
        const cleanDetails = details.replace(/,/g, ';'); // Prevent CSV break
        const cleanName = (t.studentName || '').replace(/,/g, ';');
        csvContent += `${t.id || ''},${t.studentId || ''},${cleanName},${t.amount || 0},${(t.type || '').toUpperCase()},${cleanDetails},${t.date || ''}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wallet_audit_log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ============================================
// DYNAMIC STYLES INJECTION
// ============================================

function injectGatewayStyles() {
    if (document.getElementById('gateway-styles-block')) return;

    const styles = `
        #gateway-modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        #gateway-modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        .gateway-box {
            transform: scale(0.95);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #gateway-modal-overlay.active .gateway-box {
            transform: scale(1);
        }
    `;

    const tag = document.createElement('style');
    tag.id = 'gateway-styles-block';
    tag.innerHTML = styles;
    document.head.appendChild(tag);
}

window.toggleStudentWalletFreeze = function() {
    const currentUser = safeGetJSON('sms_currentUser', {});
    const studentId = currentUser.role === 'Student' ? (currentUser.id || 'STU001') : 'STU001';
    
    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[studentId];
    if (!wallet) return;

    const toggle = document.getElementById('studentWalletFreezeToggle');
    if (toggle) {
        wallet.status = toggle.checked ? 'frozen' : 'active';
        wallets[studentId] = wallet;
        localStorage.setItem('sms_wallets', JSON.stringify(wallets));
        
        if (typeof showToast === 'function') {
            showToast(toggle.checked ? 'Wallet frozen successfully' : 'Wallet reactivated', 'success');
        } else {
            alert(toggle.checked ? 'Wallet frozen successfully' : 'Wallet reactivated');
        }
    }
};

// ============================================================
// BOOT — must be LAST, after all window.* functions are defined
// ============================================================
initWalletModule();
