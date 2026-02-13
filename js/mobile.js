// Mobile Interactions & Optimizations

document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
    initMobileSidebar();
    optimizeTables();
});

// 1. Back to Top Button
function initBackToTop() {
    // Create button if it doesn't exist
    if (!document.getElementById('back-to-top')) {
        const btn = document.createElement('div');
        btn.id = 'back-to-top';
        btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(btn);
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Toggle visibility on scroll
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('back-to-top');
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
}

// 2. Mobile Sidebar Enhancement
// Works alongside Flowbite to add mobile-specific behaviors
function initMobileSidebar() {
    const setupSidebar = () => {
        const toggleBtn = document.querySelector('[data-drawer-toggle="logo-sidebar"]');
        const sidebar = document.getElementById('logo-sidebar');
        
        if (!toggleBtn || !sidebar) {
            return false;
        }

        // Function to close sidebar
        const closeSidebar = () => {
            // Only click toggle if sidebar is currently open
            const isOpen = sidebar.classList.contains('transform-none') || 
                          !sidebar.classList.contains('-translate-x-full');
            
            if (isOpen) {
                toggleBtn.click();
            }
        };

        // Function to check if sidebar is visible
        const isSidebarVisible = () => {
            return !sidebar.classList.contains('-translate-x-full') || 
                   sidebar.classList.contains('translate-x-0');
        };

        // Close sidebar when any link inside is clicked (mobile only)
        const handleSidebarClick = (e) => {
            if (window.innerWidth >= 768) return;
            
            const link = e.target.closest('a, button');
            if (link && (link.hasAttribute('onclick') || link.tagName === 'A')) {
                setTimeout(() => {
                    closeSidebar();
                }, 50);
            }
        };

        // Close sidebar when clicking outside (mobile only)
        const handleOutsideClick = (e) => {
            if (window.innerWidth >= 768) return;
            
            if (!isSidebarVisible()) return;
            
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                closeSidebar();
            }
        };

        // Add event listeners
        sidebar.addEventListener('click', handleSidebarClick);
        document.addEventListener('click', handleOutsideClick);

        // Prevent sidebar clicks from bubbling to document
        sidebar.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                e.stopPropagation();
            }
        });

        // Prevent toggle button clicks from bubbling
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        return true;
    };

    // Try to setup immediately
    if (setupSidebar()) {
        return;
    }

    // If elements not found, wait for them to be added to DOM
    const observer = new MutationObserver((mutations) => {
        if (setupSidebar()) {
            observer.disconnect();
        }
    });

    // Observe the entire document for sidebar being added
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also try again after a short delay as fallback
    setTimeout(() => {
        if (setupSidebar()) {
            observer.disconnect();
        }
    }, 1000);
}

// 3. Auto-optimize Tables
// Wrap all raw <table> elements in a responsive div if they aren't already
function optimizeTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        // Check if parent has overflow-x-auto
        const parent = table.parentElement;
        if (!parent.classList.contains('overflow-x-auto') && !parent.style.overflowX) {
            const wrapper = document.createElement('div');
            wrapper.className = 'overflow-x-auto shadow-md sm:rounded-lg mb-4';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}
