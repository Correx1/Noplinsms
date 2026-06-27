/**
 * Cashier POS & Inventory Controller
 * Manages cashier point of sale checkouts, student wallets queries, inventory stock control, and biometric transactions authorization.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on a cashier page and initialize
    initCashierModule();
});



// Global State
window.posCart = [];
window.activeStudentId = null;
window.posActiveCategory = 'all';

function initCashierModule() {
    console.log('Initializing Cashier Module elements...');
    
    // POS Page initialization
    if (document.getElementById('posProductsGrid')) {
        renderPOSProducts();
        renderPOSCart();
        resetIdentifiedStudent();
        
        // Auto-focus manual student input
        const manualInput = document.getElementById('manualStudentId');
        if (manualInput) manualInput.focus();
    }

    // Inventory Page initialization
    if (document.getElementById('inventoryTableBody')) {
        renderInventoryTable();
    }

    // Transactions Page initialization
    if (document.getElementById('shiftTransactionsTableBody')) {
        renderShiftTransactionsTable();
    }
}

// ============================================
// POS POINT OF SALE CONTROLLERS
// ============================================

window.renderPOSProducts = function() {
    const grid = document.getElementById('posProductsGrid');
    if (!grid) return;

    const inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];
    const search = document.getElementById('posSearch')?.value.toLowerCase() || '';
    
    // Filter items
    let filtered = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) || item.id.toLowerCase().includes(search);
        const matchesCategory = window.posActiveCategory === 'all' || item.category === window.posActiveCategory;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <i class="fas fa-search text-3xl mb-2"></i>
            <p class="text-sm">No items found matching criteria</p>
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const isLowStock = item.stock <= item.reorderLevel;
        const isOutOfStock = item.stock <= 0;
        
        return `
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 ${isOutOfStock ? 'opacity-60' : ''}">
            <div class="flex flex-col">
                <span class="text-[10px] uppercase font-bold text-gray-400 block">${item.category}</span>
                <h4 class="font-bold text-gray-900 dark:text-white text-sm mt-0.5">${item.name}</h4>
                <div class="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>Stock: <span class="font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}">${item.stock}</span></span>
                    <span>Price: <span class="font-extrabold text-primary-600 dark:text-primary-400">₦${item.price.toLocaleString()}</span></span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                ${isOutOfStock ? `
                    <span class="bg-red-100 dark:bg-red-950/40 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded">OUT OF STOCK</span>
                ` : isLowStock ? `
                    <span class="bg-amber-100 dark:bg-amber-950/40 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded animate-pulse">LOW STOCK</span>
                ` : ''}
                <button onclick="addCartItem('${item.id}')" ${isOutOfStock ? 'disabled' : ''}
                    class="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold rounded-lg text-xs transition-colors">
                    Add
                </button>
            </div>
        </div>
        `;
    }).join('');
};

window.switchPOSCategory = function(category, button) {
    window.posActiveCategory = category;
    
    // Update active visual tab
    document.querySelectorAll('.pos-category-tab').forEach(btn => {
        btn.className = "px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 pos-category-tab";
    });
    
    button.className = "px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white shadow-sm transition-all duration-200 pos-category-tab";
    
    renderPOSProducts();
};

window.filterPOSProducts = function() {
    renderPOSProducts();
};

// ============================================
// POS CART OPERATION LOGIC
// ============================================

window.addCartItem = function(itemId) {
    const inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // Check if stock is sufficient
    const existingInCart = window.posCart.find(c => c.id === itemId);
    const currentQty = existingInCart ? existingInCart.quantity : 0;

    if (currentQty + 1 > item.stock) {
        showToast('Insufficient stock available in inventory', 'error');
        return;
    }

    if (existingInCart) {
        existingInCart.quantity += 1;
    } else {
        window.posCart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            quantity: 1,
            emoji: item.image
        });
    }

    showToast(`Added "${item.name}" to cart`, 'success');
    renderPOSCart();
    checkCheckoutEligibility();
};

window.changeCartQty = function(itemId, delta) {
    const inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    const cartItem = window.posCart.find(c => c.id === itemId);
    if (!cartItem || !item) return;

    if (delta > 0 && cartItem.quantity + delta > item.stock) {
        showToast('Insufficient stock in inventory', 'error');
        return;
    }

    cartItem.quantity += delta;
    if (cartItem.quantity <= 0) {
        window.posCart = window.posCart.filter(c => c.id !== itemId);
    }

    renderPOSCart();
    checkCheckoutEligibility();
};

window.removeCartItem = function(itemId) {
    window.posCart = window.posCart.filter(c => c.id !== itemId);
    renderPOSCart();
    checkCheckoutEligibility();
};

window.clearPOSCart = function() {
    window.posCart = [];
    renderPOSCart();
    checkCheckoutEligibility();
};

window.renderPOSCart = function() {
    const container = document.getElementById('posCartItems');
    if (!container) return;

    if (window.posCart.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center py-10 text-center text-gray-400">
            <i class="fas fa-shopping-basket text-4xl mb-2"></i>
            <p class="text-xs">Your shopping cart is empty</p>
        </div>`;
        calculatePOSCartTotal();
        return;
    }

    container.innerHTML = window.posCart.map(item => `
    <div class="flex items-center justify-between py-3">
        <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-2xl select-none">${item.emoji}</span>
            <div class="min-w-0">
                <h5 class="text-sm font-bold text-gray-900 dark:text-white truncate">${item.name}</h5>
                <span class="text-xs text-gray-400">₦${item.price} each</span>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <!-- Quantity Control -->
            <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <button onclick="changeCartQty('${item.id}', -1)" class="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <i class="fas fa-minus text-[10px]"></i>
                </button>
                <span class="px-2 text-xs font-bold text-gray-800 dark:text-gray-200">${item.quantity}</span>
                <button onclick="changeCartQty('${item.id}', 1)" class="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <i class="fas fa-plus text-[10px]"></i>
                </button>
            </div>
            <!-- Item Total -->
            <span class="text-sm font-extrabold text-gray-900 dark:text-white w-20 text-right">₦${(item.price * item.quantity).toLocaleString()}</span>
            <button onclick="removeCartItem('${item.id}')" class="text-red-500 hover:text-red-600 pl-1">
                <i class="fas fa-times-circle"></i>
            </button>
        </div>
    </div>
    `).join('');

    calculatePOSCartTotal();
};

window.calculatePOSCartTotal = function() {
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountInput = document.getElementById('cartDiscount');
    const discountAmountEl = document.getElementById('cartDiscountAmount');
    const totalEl = document.getElementById('cartTotal');

    if (!subtotalEl) return;

    let subtotal = window.posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountPercent = parseFloat(discountInput?.value || 0);
    if (isNaN(discountPercent) || discountPercent < 0) discountPercent = 0;
    if (discountPercent > 100) discountPercent = 100;

    let discountAmount = subtotal * (discountPercent / 100);
    let total = subtotal - discountAmount;

    subtotalEl.innerText = `₦${subtotal.toLocaleString()}`;
    discountAmountEl.innerText = `-₦${discountAmount.toLocaleString()}`;
    totalEl.innerText = `₦${total.toLocaleString()}`;

    window.posCartTotal = total;
};

// ============================================
// STUDENT CARD SCANNING & LOOKUP
// ============================================

window.triggerStudentNfcScan = function() {
    if (typeof window.SmartScanner === 'undefined') {
        showToast('Smart Scanner Biometric Service is not loaded', 'error');
        return;
    }

    window.SmartScanner.start({
        requireNFC: true,
        requireBiometric: false,
        onSuccess: (scannedId) => {
            console.log('NFC Scanned student ID:', scannedId);
            loadStudentProfile(scannedId);
        },
        onFail: (error) => {
            showToast('NFC Scan aborted: ' + error, 'warning');
        }
    });
};

window.handleStudentManualId = function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const studentId = e.target.value.trim();
        if (studentId.length > 0) {
            loadStudentProfile(studentId);
        }
        e.target.value = '';
    }
};

window.loadStudentProfile = function(studentId) {
    console.log('Querying profile for student ID:', studentId);
    
    // Load student lists and wallets
    const students = JSON.parse(localStorage.getItem('sms_students')) || window.SchoolDatabase.students || [];
    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};

    // Match by ID, Roll Number, or Name
    let matchedStudent = students.find(s => 
        s.id.toLowerCase() === studentId.toLowerCase() || 
        (s.roll && s.roll === studentId) ||
        s.name.toLowerCase().includes(studentId.toLowerCase())
    );

    // If no match directly in students, check in wallets
    if (!matchedStudent) {
        const walletKeys = Object.keys(wallets);
        const matchKey = walletKeys.find(key => 
            key.toLowerCase() === studentId.toLowerCase() || 
            wallets[key].studentName.toLowerCase().includes(studentId.toLowerCase())
        );
        if (matchKey) {
            matchedStudent = {
                id: wallets[matchKey].studentId,
                name: wallets[matchKey].studentName,
                class: "SS3", // Fallback
                gender: "Female" // Fallback
            };
        }
    }

    if (!matchedStudent) {
        showToast(`No student found matching "${studentId}"`, 'error');
        resetIdentifiedStudent();
        return;
    }

    // Ensure wallet exists for this student
    if (!wallets[matchedStudent.id]) {
        // dynamically create wallet on the fly
        const bankNames = ["Providus Bank", "Wema Bank", "Sterling Bank"];
        const num = "99" + Math.floor(10000000 + Math.random() * 90000000);
        wallets[matchedStudent.id] = {
            studentId: matchedStudent.id,
            studentName: matchedStudent.name,
            balance: 2000,
            dailyLimit: 2000,
            spentToday: 0,
            virtualAccount: {
                bankName: bankNames[Math.floor(Math.random() * bankNames.length)],
                accountNumber: num,
                accountName: `Noplin Academy / ${matchedStudent.name}`
            },
            allowedCategories: { canteen: true, stationery: true, uniforms: true, books: true }
        };
        localStorage.setItem('sms_wallets', JSON.stringify(wallets));
    }

    const wallet = wallets[matchedStudent.id];
    window.activeStudentId = matchedStudent.id;

    // Render details in POS
    document.getElementById('studentPlaceholderBox').classList.add('hidden');
    
    const profileBox = document.getElementById('identifiedStudentBox');
    profileBox.classList.remove('hidden');

    document.getElementById('studentAvatar').innerText = matchedStudent.gender === 'Male' ? '👦' : '👧';
    document.getElementById('studentName').innerText = matchedStudent.name;
    document.getElementById('studentClass').innerText = `Class: ${matchedStudent.class || matchedStudent.className || 'SSS3A'}`;
    document.getElementById('studentIdDisplay').innerText = `ID: ${matchedStudent.id}`;
    document.getElementById('studentWalletBalance').innerText = `₦${wallet.balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    
    document.getElementById('studentDailyLimit').innerText = `₦${wallet.dailyLimit.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    document.getElementById('studentSpentToday').innerText = `₦${wallet.spentToday.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;

    showToast(`Identified student: ${matchedStudent.name}`, 'success');
    checkCheckoutEligibility();
};

window.resetIdentifiedStudent = function() {
    window.activeStudentId = null;
    const profileBox = document.getElementById('identifiedStudentBox');
    if (profileBox) profileBox.classList.add('hidden');
    
    const placeholder = document.getElementById('studentPlaceholderBox');
    if (placeholder) placeholder.classList.remove('hidden');
    
    checkCheckoutEligibility();
};

// ============================================
// ELIGIBILITY & LIMIT CHECKS
// ============================================

window.checkCheckoutEligibility = function() {
    const btn = document.getElementById('checkoutSubmitBtn');
    const badge = document.getElementById('authBadge');
    if (!btn) return;

    if (!window.activeStudentId) {
        btn.disabled = true;
        btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-400 text-white font-bold rounded-xl text-sm shadow-md cursor-not-allowed";
        return;
    }

    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[window.activeStudentId];
    const total = window.posCartTotal || 0;

    if (window.posCart.length === 0) {
        btn.disabled = true;
        btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-400 text-white font-bold rounded-xl text-sm shadow-md cursor-not-allowed";
        badge.className = "mt-3 flex items-center justify-center p-2.5 rounded-lg border text-center text-xs font-bold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
        badge.innerHTML = `<i class="fas fa-info-circle mr-1.5"></i> Cart is empty`;
        return;
    }

    // Check 0: Freeze status check
    if (wallet.status === 'frozen') {
        btn.disabled = true;
        btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600/50 text-white font-bold rounded-xl text-sm shadow-md cursor-not-allowed";
        badge.className = "mt-3 flex items-center justify-center p-2.5 rounded-lg border text-center text-xs font-bold bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800";
        badge.innerHTML = `<i class="fas fa-lock mr-1.5"></i> Wallet Locked/Frozen by Student/Parent`;
        return;
    }

    // Check 1: Allowed Categories
    const categoriesInCart = [...new Set(window.posCart.map(item => item.category))];
    const blockedCategory = categoriesInCart.find(cat => wallet.allowedCategories && wallet.allowedCategories[cat] === false);
    
    if (blockedCategory) {
        btn.disabled = true;
        btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600/50 text-white font-bold rounded-xl text-sm shadow-md cursor-not-allowed";
        badge.className = "mt-3 flex items-center justify-center p-2.5 rounded-lg border text-center text-xs font-bold bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800";
        badge.innerHTML = `<i class="fas fa-ban mr-1.5"></i> Category Restricted by Parent: ${blockedCategory.toUpperCase()}`;
        return;
    }

    // Check 1.5: Category Daily Cap Limit check
    const categoryTotals = {};
    window.posCart.forEach(item => {
        const cat = item.category || 'canteen';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.price * item.quantity);
    });

    for (const cat in categoryTotals) {
        const limit = (wallet.categoryLimits && typeof wallet.categoryLimits[cat] === 'number') ? wallet.categoryLimits[cat] : 99999;
        if (categoryTotals[cat] > limit) {
            btn.disabled = true;
            btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600/50 text-white font-bold rounded-xl text-sm shadow-md cursor-not-allowed";
            badge.className = "mt-3 flex items-center justify-center p-2.5 rounded-lg border text-center text-xs font-bold bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800";
            badge.innerHTML = `<i class="fas fa-hand-holding-usd mr-1.5"></i> Exceeds daily cap for ${cat.toUpperCase()} (Max: ₦${limit.toLocaleString()})`;
            return;
        }
    }

    // Check 2: Balance check
    if (wallet.balance < total) {
        btn.disabled = true;
        btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600/50 text-white font-bold rounded-xl text-sm shadow-md cursor-not-allowed";
        badge.className = "mt-3 flex items-center justify-center p-2.5 rounded-lg border text-center text-xs font-bold bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800";
        badge.innerHTML = `<i class="fas fa-exclamation-triangle mr-1.5"></i> Insufficient Funds (Need: ₦${(total - wallet.balance).toLocaleString()})`;
        return;
    }

    // Check 3: Daily Limit check
    const remainingLimit = wallet.dailyLimit - wallet.spentToday;
    if (total > remainingLimit) {
        btn.disabled = true;
        btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600/50 text-white font-bold rounded-xl text-sm shadow-md cursor-not-allowed";
        badge.className = "mt-3 flex items-center justify-center p-2.5 rounded-lg border text-center text-xs font-bold bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800";
        badge.innerHTML = `<i class="fas fa-hand-holding-usd mr-1.5"></i> Exceeds Daily Limit (Remaining: ₦${remainingLimit.toLocaleString()})`;
        return;
    }

    // Eligible
    btn.disabled = false;
    btn.className = "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer";
    badge.className = "mt-3 flex items-center justify-center p-2.5 rounded-lg border text-center text-xs font-bold bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:border-green-800";
    badge.innerHTML = `<i class="fas fa-check-circle mr-1.5"></i> Sufficient Balance & Authorized`;
};

// ============================================
// BIOMETRIC PAYMENT COMPLETION & RECEIPT
// ============================================

window.completePOSCheckout = function() {
    if (window.posCart.length === 0 || !window.activeStudentId) return;

    if (typeof window.SmartScanner === 'undefined') {
        showToast('Biometric scanner not loaded. Using PIN verification fallback.', 'info');
        openPinFallbackModal();
        return;
    }

    // Trigger Fingerprint verification
    window.SmartScanner.start({
        requireNFC: false,
        requireBiometric: true,
        onSuccess: () => {
            console.log('Biometric fingerprint matches! Finalizing purchase...');
            finalizePOSPurchase();
        },
        onFail: (error) => {
            showToast('Biometric failed. Please enter Student PIN to authorize.', 'warning');
            openPinFallbackModal();
        }
    });
};

function finalizePOSPurchase() {
    const wallets = JSON.parse(localStorage.getItem('sms_wallets')) || {};
    const wallet = wallets[window.activeStudentId];
    const inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];
    const transactions = JSON.parse(localStorage.getItem('sms_wallet_transactions')) || [];
    
    const total = window.posCartTotal;
    const todayStr = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0];

    // Deduct wallet balance and add spentToday
    wallet.balance -= total;
    wallet.spentToday += total;

    // Check Auto-Topup rule trigger
    if (wallet.autoTopup && wallet.balance < (wallet.autoThreshold || 500)) {
        const fundingAmt = wallet.autoAmount || 2000;
        wallet.balance += fundingAmt;
        
        // Record Auto-topup transaction
        const autoTxId = "TXN_A_" + Math.floor(100000 + Math.random() * 900000);
        transactions.unshift({
            id: autoTxId,
            studentId: wallet.studentId,
            studentName: wallet.studentName,
            type: "deposit",
            amount: fundingAmt,
            method: "Parent Triggered Auto-Topup",
            date: todayStr
        });
        
        setTimeout(() => {
            showToast(`Auto-Funding Triggered: ₦${fundingAmt.toLocaleString()} credited`, 'info');
        }, 800);
    }

    wallets[window.activeStudentId] = wallet;
    localStorage.setItem('sms_wallets', JSON.stringify(wallets));

    // Deduct inventory stock levels
    window.posCart.forEach(cartItem => {
        const product = inventory.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
            if (product.stock < 0) product.stock = 0;
        }
    });
    localStorage.setItem('sms_inventory', JSON.stringify(inventory));

    // Record Transaction
    const itemsListString = window.posCart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    const txId = "TXN_W_" + Math.floor(100000 + Math.random() * 900000);
    
    const transaction = {
        id: txId,
        studentId: wallet.studentId,
        studentName: wallet.studentName,
        type: "purchase",
        amount: total,
        item: itemsListString,
        date: todayStr,
        status: "Successful",
        verification: "Fingerprint",
        cashierId: localStorage.getItem('savedUsername') || "STF003"
    };

    transactions.unshift(transaction);
    localStorage.setItem('sms_wallet_transactions', JSON.stringify(transactions));

    // Show Receipt Content
    renderPOSReceipt(transaction);

    // Reset Cart
    window.posCart = [];
    renderPOSCart();
    resetIdentifiedStudent();
    
    // Refresh catalog products and grid
    renderPOSProducts();
    showToast('Transaction completed successfully!', 'success');
}

function renderPOSReceipt(tx) {
    const receiptBox = document.getElementById('receiptContent');
    if (!receiptBox) return;

    receiptBox.innerHTML = `
        <div class="border-b border-dashed border-gray-300 pb-3">
            <h4 class="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Noplin Academy Store</h4>
            <p class="text-[10px] text-gray-500">Official Store Receipt</p>
            <p class="text-[10px] text-gray-400">Date: ${tx.date}</p>
        </div>
        
        <div class="text-left text-xs py-2 space-y-1.5">
            <div class="flex justify-between font-bold">
                <span>Receipt No:</span>
                <span class="font-mono text-gray-800 dark:text-gray-200">${tx.id}</span>
            </div>
            <div class="flex justify-between">
                <span>Student ID:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-200">${tx.studentId}</span>
            </div>
            <div class="flex justify-between">
                <span>Student Name:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-200">${tx.studentName}</span>
            </div>
            <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span>Cashier ID:</span>
                <span class="text-gray-600 dark:text-gray-400">${tx.cashierId}</span>
            </div>
            
            <div class="pt-2 font-bold text-gray-800 dark:text-gray-200 text-[11px] mb-1">Purchased Items:</div>
            <p class="text-[11px] text-gray-600 dark:text-gray-400 italic font-mono pl-2 border-l-2 border-primary-500">${tx.item}</p>
            
            <div class="flex justify-between border-t border-dashed border-gray-300 pt-3 text-sm font-extrabold text-gray-900 dark:text-white">
                <span>Total Paid:</span>
                <span>₦${tx.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
            </div>
            <div class="flex justify-between text-[10px] text-green-600 font-bold">
                <span>Auth Method:</span>
                <span><i class="fas fa-fingerprint"></i> Biometric Verified</span>
            </div>
        </div>
        
        <div class="pt-3 border-t border-dashed border-gray-300 text-center">
            <p class="text-[9px] text-gray-400 font-mono">Thank you for your purchase!</p>
            <p class="text-[8px] text-gray-400">Funds settled directly to school bank account.</p>
        </div>
    `;

    document.getElementById('receiptModal').classList.remove('hidden');
    document.getElementById('receiptModal').classList.add('flex');
}

window.closeReceiptModal = function() {
    document.getElementById('receiptModal').classList.remove('flex');
    document.getElementById('receiptModal').classList.add('hidden');
};

window.printPOSReceipt = function() {
    window.print();
};

// ============================================
// INVENTORY STORE CONTROLLERS
// ============================================

window.renderInventoryTable = function() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    const inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];
    const search = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const category = document.getElementById('inventoryCategoryFilter')?.value || 'all';
    const alertFilter = document.getElementById('inventoryAlertFilter')?.value || 'all';

    let filtered = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) || item.id.toLowerCase().includes(search);
        const matchesCategory = category === 'all' || item.category === category;
        const matchesAlert = alertFilter === 'all' || (alertFilter === 'low' && item.stock <= item.reorderLevel);
        return matchesSearch && matchesCategory && matchesAlert;
    });

    // Update stats
    document.getElementById('totalSKUs').innerText = inventory.length;
    document.getElementById('totalStockCount').innerText = inventory.reduce((sum, item) => sum + item.stock, 0);
    
    const lowStockCount = inventory.filter(item => item.stock <= item.reorderLevel).length;
    const alertEl = document.getElementById('lowStockAlerts');
    alertEl.innerText = lowStockCount;
    if (lowStockCount > 0) {
        alertEl.className = "text-2xl font-black text-amber-500 mt-1 animate-pulse";
    } else {
        alertEl.className = "text-2xl font-black text-gray-900 dark:text-white mt-1";
    }

    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    document.getElementById('totalInventoryValue').innerText = `₦${totalValue.toLocaleString()}`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <i class="fas fa-box-open text-3xl mb-2"></i>
                <p class="text-sm">No items found matching the current search criteria.</p>
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const isOutOfStock = item.stock <= 0;
        const isLowStock = item.stock <= item.reorderLevel;
        
        let statusBadge = `<span class="px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 text-[10px] font-bold rounded-full">Good Stock</span>`;
        if (isOutOfStock) {
            statusBadge = `<span class="px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 text-[10px] font-bold rounded-full animate-pulse">Out of Stock</span>`;
        } else if (isLowStock) {
            statusBadge = `<span class="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-bold rounded-full">Low Stock</span>`;
        }

        return `
        <tr class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                <div>
                    <span class="font-bold text-gray-900 dark:text-white block">${item.name}</span>
                    <span class="text-xs text-gray-400 font-mono font-medium">SKU: ${item.id}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 text-xs font-semibold rounded uppercase">
                    ${item.category}
                </span>
            </td>
            <td class="px-6 py-4 text-right font-extrabold text-gray-800 dark:text-gray-200">
                ₦${item.price.toLocaleString()}
            </td>
            <td class="px-6 py-4 text-center">
                <span class="font-extrabold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-500' : 'text-gray-800 dark:text-white'}">${item.stock}</span>
            </td>
            <td class="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-400">
                ${item.reorderLevel}
            </td>
            <td class="px-6 py-4 text-center">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="openEditInventoryModal('${item.id}')" class="p-2 text-primary-600 hover:text-primary-800 dark:hover:text-primary-400">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteInventoryProduct('${item.id}')" class="p-2 text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
};

window.filterInventoryTable = function() {
    renderInventoryTable();
};

window.openAddInventoryModal = function() {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productModalTitle').innerText = 'Add New Store Product';
    
    // Set some defaults
    document.getElementById('prodEmoji').value = '📦';
    
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
};

window.openEditInventoryModal = function(productId) {
    const inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];
    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodEmoji').value = product.image;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodStock').value = product.stock;
    document.getElementById('prodReorder').value = product.reorderLevel;

    document.getElementById('productModalTitle').innerText = 'Edit Store Product';
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
};

window.closeProductModal = function() {
    document.getElementById('productModal').classList.remove('flex');
    document.getElementById('productModal').classList.add('hidden');
};

window.saveInventoryProduct = function(e) {
    e.preventDefault();
    const editId = document.getElementById('editProductId').value;
    const inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];

    const productData = {
        name: document.getElementById('prodName').value.trim(),
        category: document.getElementById('prodCategory').value,
        image: document.getElementById('prodEmoji').value.trim() || '📦',
        price: parseFloat(document.getElementById('prodPrice').value),
        stock: parseInt(document.getElementById('prodStock').value),
        reorderLevel: parseInt(document.getElementById('prodReorder').value)
    };

    if (editId) {
        // Edit existing
        const index = inventory.findIndex(p => p.id === editId);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...productData };
            showToast('Product updated successfully', 'success');
        }
    } else {
        // Add new
        const newId = "INV" + Math.floor(100 + Math.random() * 900);
        inventory.push({
            id: newId,
            ...productData
        });
        showToast('Product created successfully', 'success');
    }

    localStorage.setItem('sms_inventory', JSON.stringify(inventory));
    closeProductModal();
    renderInventoryTable();
};

window.deleteInventoryProduct = function(productId) {
    if (confirm('Are you sure you want to delete this product from store?')) {
        let inventory = JSON.parse(localStorage.getItem('sms_inventory')) || [];
        inventory = inventory.filter(p => p.id !== productId);
        localStorage.setItem('sms_inventory', JSON.stringify(inventory));
        
        showToast('Product deleted from store catalog', 'success');
        renderInventoryTable();
    }
};

// ============================================
// SHIFT TRANSACTIONS LIST
// ============================================

window.renderShiftTransactionsTable = function() {
    const tbody = document.getElementById('shiftTransactionsTableBody');
    if (!tbody) return;

    const transactions = JSON.parse(localStorage.getItem('sms_wallet_transactions')) || [];
    const search = document.getElementById('txSearch')?.value.toLowerCase() || '';
    const verification = document.getElementById('txFilterVerification')?.value || 'all';

    // Only show purchase-type transactions for cashier shift
    let filtered = transactions.filter(t => {
        if (t.type !== 'purchase') return false;
        
        const matchesSearch = t.studentName.toLowerCase().includes(search) || 
                              t.studentId.toLowerCase().includes(search) ||
                              t.id.toLowerCase().includes(search);
                              
        const matchesVerification = verification === 'all' || t.verification === verification;
        
        return matchesSearch && matchesVerification;
    });

    // Calculate cashier stats
    const totalSales = filtered.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('shiftSalesTotal').innerText = `₦${totalSales.toLocaleString(undefined, {minimumFractionDigits:2})}`;
    document.getElementById('shiftTxnCount').innerText = filtered.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <i class="fas fa-receipt text-3xl mb-2"></i>
                <p class="text-sm">No cashier transactions logged during this shift.</p>
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(t => `
    <tr class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <td class="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
            ${t.id}
        </td>
        <td class="px-6 py-4">
            <span class="font-bold text-gray-800 dark:text-gray-200 block">${t.studentName}</span>
            <span class="text-xs text-gray-400 font-mono">${t.studentId}</span>
        </td>
        <td class="px-6 py-4">
            <span class="text-gray-600 dark:text-gray-400 font-mono text-xs">${t.item}</span>
        </td>
        <td class="px-6 py-4 text-center text-gray-500 dark:text-gray-400 text-xs font-medium">
            ${t.date}
        </td>
        <td class="px-6 py-4 text-right font-extrabold text-gray-900 dark:text-white">
            ₦${t.amount.toLocaleString(undefined, {minimumFractionDigits:2})}
        </td>
        <td class="px-6 py-4 text-center">
            <span class="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-bold rounded-full">
                <i class="fas fa-fingerprint mr-1"></i> ${t.verification}
            </span>
        </td>
        <td class="px-6 py-4 text-right">
            <button onclick="reprintTxReceipt('${t.id}')" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold rounded text-xs transition-colors">
                <i class="fas fa-print"></i> Reprint
            </button>
        </td>
    </tr>
    `).join('');
};

window.filterShiftTransactions = function() {
    renderShiftTransactionsTable();
};

window.reprintTxReceipt = function(txId) {
    const transactions = JSON.parse(localStorage.getItem('sms_wallet_transactions')) || [];
    const tx = transactions.find(t => t.id === txId);
    if (tx) {
        renderPOSReceipt(tx);
    }
};

// ============================================
// PIN FALLBACK & SHIFT CLOSURE ACTIONS
// ============================================

window.openPinFallbackModal = function() {
    const modal = document.getElementById('pinFallbackModal');
    if (modal) {
        document.getElementById('studentPinInput').value = '';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById('studentPinInput').focus();
    }
};

window.closePinFallbackModal = function() {
    const modal = document.getElementById('pinFallbackModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.submitPinAuthorization = function() {
    const pin = document.getElementById('studentPinInput').value;
    // Default system passcode for wallets is 1234
    if (pin === '1234') {
        showToast('PIN Verified. Finalizing purchase...', 'success');
        closePinFallbackModal();
        finalizePOSPurchase();
    } else {
        showToast('Invalid Student PIN. Access Denied.', 'error');
    }
};

window.endCashierShift = function() {
    const salesVal = document.getElementById('shiftSalesTotal')?.innerText || '₦0.00';
    const txCount = document.getElementById('shiftTxnCount')?.innerText || '0';
    
    const summarySales = document.getElementById('summaryShiftSales');
    if (summarySales) summarySales.innerText = salesVal;
    
    const summaryTx = document.getElementById('summaryShiftTxnCount');
    if (summaryTx) summaryTx.innerText = txCount;

    const summaryCashier = document.getElementById('summaryCashierId');
    if (summaryCashier) {
        const user = JSON.parse(localStorage.getItem('sms_currentUser') || '{}');
        summaryCashier.innerText = user.username || 'CSH001';
    }

    const summaryDate = document.getElementById('summaryShiftDate');
    if (summaryDate) {
        summaryDate.innerText = new Date().toISOString().substring(0, 10);
    }

    const modal = document.getElementById('shiftSummaryModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeShiftSummaryModal = function() {
    const modal = document.getElementById('shiftSummaryModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.confirmShiftClosure = function() {
    const salesVal = document.getElementById('summaryShiftSales')?.innerText || '₦0.00';
    const txCount = document.getElementById('summaryShiftTxnCount')?.innerText || '0';
    const dateStr = document.getElementById('summaryShiftDate')?.innerText || '';
    const cashier = document.getElementById('summaryCashierId')?.innerText || '';

    let content = `NOPLIN ACADEMY POS SHIFT REPORT\n`;
    content += `====================================\n`;
    content += `Cashier Session ID: ${cashier}\n`;
    content += `Shift Closure Date: ${dateStr}\n`;
    content += `------------------------------------\n`;
    content += `Total Wallet Sales: ${salesVal}\n`;
    content += `Transaction Count:  ${txCount}\n`;
    content += `====================================\n`;
    content += `End of Session Report Printed Successfully.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shift_report_${cashier}_${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closeShiftSummaryModal();
    showToast('Shift closed successfully. Logging out cashier...', 'success');

    // Simulate cashier logout after a delay
    setTimeout(() => {
        window.location.href = '../../login-staff.html';
    }, 1500);
};

// ============================================================
// BOOT — must be LAST, after all window.* functions are defined
// ============================================================
initCashierModule();
