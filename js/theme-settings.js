/**
 * Theme Settings Page Logic
 * Handles theme selection UI and interactions
 */

let selectedTheme = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentTheme = window.themeManager.getCurrentTheme();
    selectedTheme = currentTheme;
    updateCurrentThemeDisplay(currentTheme);
    highlightActiveTheme(currentTheme);
});

// Select a theme
function selectTheme(themeName) {
    selectedTheme = themeName;
    highlightActiveTheme(themeName);
}

// Highlight the active theme
function highlightActiveTheme(themeName) {
    // Remove active class from all options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected theme
    const selectedOption = document.querySelector(`.theme-option[data-theme="${themeName}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
}

// Update current theme display
function updateCurrentThemeDisplay(themeName) {
    const themeNameElement = document.getElementById('current-theme-name');
    if (themeNameElement) {
        themeNameElement.textContent = themeName.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Apply the selected theme (renamed to avoid conflict with theme.js)
function applySelectedTheme() {
    if (selectedTheme) {
        // Use the themeManager's applyTheme directly (not switchTheme to avoid recursion)
        window.themeManager.applyTheme(selectedTheme);
        updateCurrentThemeDisplay(selectedTheme);
        
        // Show success message
        showNotification('Theme applied successfully!', 'success');
    }
}

// Reset to default theme
function resetToDefault() {
    selectedTheme = window.themeManager.DEFAULT_THEME;
    window.themeManager.applyTheme(selectedTheme);
    updateCurrentThemeDisplay(selectedTheme);
    highlightActiveTheme(selectedTheme);
    
    // Show success message
    showNotification('Theme reset to default!', 'success');
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
 const successColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-500').trim();

const errorColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-400').trim();

notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full`;

// Set dynamic background color
notification.style.backgroundColor = type === 'success' ? successColor : errorColor;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Listen for theme changes from other tabs/windows
window.addEventListener('storage', function(e) {
    if (e.key === 'selectedTheme') {
        const newTheme = e.newValue || window.themeManager.DEFAULT_THEME;
        selectedTheme = newTheme;
        updateCurrentThemeDisplay(newTheme);
        highlightActiveTheme(newTheme);
    }
});

// Expose functions globally
window.selectTheme = selectTheme;
window.applyTheme = applySelectedTheme;  // Map to renamed function
window.resetToDefault = resetToDefault;
