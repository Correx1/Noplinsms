// Dark Mode Toggle Functionality
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    if (!themeToggleBtn || !themeToggleDarkIcon || !themeToggleLightIcon) {
        return;
    }

    // Check for saved theme preference or default to 'light' mode
    const currentTheme = localStorage.getItem('color-theme') || 'light';
    
    // Hide both icons first to prevent double display
    themeToggleDarkIcon.classList.add('hidden');
    themeToggleLightIcon.classList.add('hidden');
    
    // Set initial theme and show appropriate icon
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        // In dark mode, show sun icon (to switch to light)
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        // In light mode, show moon icon (to switch to dark)
        themeToggleDarkIcon.classList.remove('hidden');
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', function() {
        // Toggle dark mode
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
            // Show moon icon (we're now in light mode)
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            // Show sun icon (we're now in dark mode)
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        }
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initThemeToggle);

// Also try to initialize after a delay for dynamically loaded navbar
setTimeout(initThemeToggle, 500);
