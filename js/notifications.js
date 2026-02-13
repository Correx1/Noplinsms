/**
 * Notification System
 * Handles Toasts and Notification Bell/Dropdown
 */

const NOTIFICATION_KEY = 'sms_notifications';

// Configuration
const TOAST_TYPES = {
    SUCCESS: { icon: 'fa-check', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-800 dark:text-green-200' },
    ERROR: { icon: 'fa-times', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-800 dark:text-red-200' },
    WARNING: { icon: 'fa-exclamation', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-800 dark:text-orange-200' },
    INFO: { icon: 'fa-info', color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-800 dark:text-primary-200' }
};

document.addEventListener('DOMContentLoaded', () => {
    initToastContainer();
    initNotificationBell();
});

/* --- TOASTS --- */

function initToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
}

window.showToast = function(message, type = 'INFO', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const config = TOAST_TYPES[type] || TOAST_TYPES.INFO;
    
    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = 'toast-item flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 mb-4';
    toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${config.color} ${config.bg} rounded-lg">
            <i class="fas ${config.icon}"></i>
        </div>
        <div class="ms-3 text-sm font-normal">${message}</div>
        <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700">
            <span class="sr-only">Close</span>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
        </button>
    `;

    // Close Button Logic
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto Dismiss
    setTimeout(() => {
        removeToast(toast);
    }, duration);
};

function removeToast(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300); // Wait for transition
}

// Shortcuts
window.showSuccess = (msg) => showToast(msg, 'SUCCESS');
window.showError = (msg) => showToast(msg, 'ERROR');
window.showWarning = (msg) => showToast(msg, 'WARNING');
window.showInfo = (msg) => showToast(msg, 'INFO');


/* --- NOTIFICATION BELL --- */

function initNotificationBell() {
    // Check if we need to insert the bell (if specific container exists)
    // Or attach logic to existing bell if hardcoded
    // Strategy: Look for the User Menu container and insert Bell before it
    
    const userMenuContainer = document.querySelector('.flex.items-center.ms-3');
    if (!userMenuContainer) return; // Cant find navbar spot

    // Check if bell already exists (to avoid duplicates on re-run)
    if (document.getElementById('notification-bell-btn')) return;

    // Create Wrapper
    const bellWrapper = document.createElement('div');
    bellWrapper.className = 'relative mr-4'; // Add spacing

    // Create Bell Button
    bellWrapper.innerHTML = `
        <button id="notification-bell-btn" data-dropdown-toggle="notification-dropdown" class="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" type="button">
            <span class="sr-only">View notifications</span>
            <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
                <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z"/>
            </svg>
            <div id="notification-badge" class="notification-badge hidden">0</div>
        </button>
        <!-- Dropdown menu -->
        <div id="notification-dropdown" class="z-50 hidden w-80 max-w-sm my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 font-normal">
            <div class="block px-4 py-2 font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-600 dark:text-gray-300 text-sm">
                Notifications
            </div>
            <div id="notification-list" class="divide-y divide-gray-100 dark:divide-gray-600">
                <!-- Items injected here -->
                <div class="px-4 py-3 text-sm text-gray-500 text-center">No new notifications</div>
            </div>
            <a href="#" onclick="markAllRead(); return false;" class="block py-2 text-sm font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white">
                <div class="inline-flex items-center">
                    <i class="fas fa-check-double mr-2"></i> Mark all as read
                </div>
            </a>
        </div>
    `;

    // Insert before the user menu (Avatar)
    userMenuContainer.parentNode.insertBefore(bellWrapper, userMenuContainer);

    // Initialize logic
    updateNotificationBadge();
    
    // Re-init Flowbite dropdowns if possible to bind the new elements
    if (typeof initFlowbite === 'function') initFlowbite();
    
    // Add event listener to render dropdown content on open
    const bellBtn = document.getElementById('notification-bell-btn');
    bellBtn.addEventListener('click', renderNotificationList);
}

/* --- LOGIC & STORAGE --- */

function getNotifications() {
    return JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
}

function saveNotifications(notifs) {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifs));
    updateNotificationBadge();
}

// Add new notification
window.addNotification = function(title, message, type = 'general') {
    const notifs = getNotifications();
    notifs.unshift({
        id: Date.now(),
        title,
        message,
        type,
        time: new Date().toISOString(),
        read: false
    });
    // Keep max 20
    if (notifs.length > 20) notifs.pop();
    
    saveNotifications(notifs);
    
    // Sound Effect (Mock)
    // console.log('Ping!');
};

function updateNotificationBadge() {
    const notifs = getNotifications();
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notification-badge');
    
    if (badge) {
        if (unread > 0) {
            badge.textContent = unread > 9 ? '9+' : unread;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function renderNotificationList() {
    const list = document.getElementById('notification-list');
    const notifs = getNotifications();
    
    if (notifs.length === 0) {
        list.innerHTML = '<div class="px-4 py-3 text-sm text-gray-500 text-center">No notifications</div>';
        return;
    }

    list.innerHTML = notifs.map(n => `
        <div class="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 ${n.read ? 'opacity-60' : ''}">
            <div class="flex-shrink-0">
                <div class="relative w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                    <i class="fas ${getIconForType(n.type)}"></i>
                </div>
            </div>
            <div class="w-full ps-3">
                <div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                    <span class="font-semibold text-gray-900 dark:text-white">${n.title}</span>: ${n.message}
                </div>
                <div class="text-xs text-primary-600 dark:text-primary-500">${timeAgo(n.time)}</div>
            </div>
        </div>
    `).join('');
}

function getIconForType(type) {
    switch(type) {
        case 'fee': return 'fa-money-bill-wave';
        case 'attendance': return 'fa-user-clock';
        case 'exam': return 'fa-file-alt';
        default: return 'fa-bell';
    }
}

window.markAllRead = function() {
    const notifs = getNotifications();
    notifs.forEach(n => n.read = true);
    saveNotifications(notifs);
    renderNotificationList(); // Re-render to show opacity change
}

// Utility: Time Ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}

// Initial Mock Data (if empty)
if (getNotifications().length === 0) {
    addNotification('System Alert', 'Welcome to the School Management System!', 'general');
}
