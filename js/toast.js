class ToastSystem {
    constructor() {
        this.container = this.createContainer();
        this.setupNativeOverride();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        // Fixed below navbar at top center on mobile, top right on desktop
        container.className = 'fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-[350px] px-4 sm:px-0';
        document.body.appendChild(container);
        return container;
    }

    setupNativeOverride() {
        // Store original alert
        const originalAlert = window.alert;
        // Override with toast
        window.alert = (message) => {
            this.show(message);
        };
        // Expose original alert just in case
        window.nativeAlert = originalAlert;
        // Expose global showToast
        window.showToast = (msg, type) => this.show(msg, type);
    }

    show(message, type = 'info') {
        const msgStr = String(message);
        
        // Auto-detect type based on msg content if not explicitly set
        if (type === 'info') {
            const lowerMsg = msgStr.toLowerCase();
            if (lowerMsg.includes('success') || lowerMsg.includes('saved') || lowerMsg.includes('allocated') || lowerMsg.includes('created')) {
                type = 'success';
            } else if (lowerMsg.includes('error') || lowerMsg.includes('fail') || lowerMsg.includes('invalid') || lowerMsg.includes('not found')) {
                type = 'error';
            } else if (lowerMsg.includes('warning') || lowerMsg.includes('pending')) {
                type = 'warning';
            }
        }

        const toast = document.createElement('div');
        
        // Base styles for the toast (modern, sonner/shadcn-like)
        toast.className = `
            pointer-events-auto flex items-start gap-3 w-full p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl transition-all duration-400 ease-out transform -translate-y-8 opacity-0 scale-95
            bg-white/95 dark:bg-gray-800/95
        `;

        // Type specific styles & icons
        let iconHtml = '';
        if (type === 'success') {
            iconHtml = `<div class="bg-green-100 dark:bg-green-500/20 rounded-full p-1"><svg class="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg></div>`;
        } else if (type === 'error') {
            iconHtml = `<div class="bg-red-100 dark:bg-red-500/20 rounded-full p-1"><svg class="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></div>`;
        } else if (type === 'warning') {
            iconHtml = `<div class="bg-amber-100 dark:bg-amber-500/20 rounded-full p-1"><svg class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>`;
        } else {
            iconHtml = `<div class="bg-blue-100 dark:bg-blue-500/20 rounded-full p-1"><svg class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>`;
        }

        toast.innerHTML = `
            ${iconHtml}
            <div class="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 pr-4 break-words whitespace-pre-wrap leading-tight mt-0.5">${msgStr}</div>
            <button class="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md p-1 mt-[-2px]" onclick="this.parentElement.remove()">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;

        // Prepend so newest is on top
        this.container.prepend(toast);
        
        // Trigger reflow to start animation
        requestAnimationFrame(() => {
            toast.classList.remove('-translate-y-8', 'opacity-0', 'scale-95');
            toast.classList.add('translate-y-0', 'opacity-100', 'scale-100');
        });

        // Setup removal
        const removeToast = () => {
            toast.classList.remove('translate-y-0', 'opacity-100', 'scale-100');
            toast.classList.add('-translate-y-2', 'opacity-0', 'scale-95');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        };

        // Auto remove after 5s
        let timeout = setTimeout(removeToast, 5000);
        
        // Pause on hover
        toast.addEventListener('mouseenter', () => clearTimeout(timeout));
        toast.addEventListener('mouseleave', () => {
            timeout = setTimeout(removeToast, 3000);
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.toastSystem = new ToastSystem();
});
// Execute immediately if DOM already loaded (for dynamic imports/SPA navigation)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if(!window.toastSystem) {
        window.toastSystem = new ToastSystem();
    }
}
