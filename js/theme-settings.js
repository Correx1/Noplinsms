/**
 * Theme Settings Page Logic
 * Handles theme selection UI, active highlights, and custom color brand creators
 */

let selectedTheme = null;

// Safe init — wait for themeManager to be ready (SPA dynamic load safety)
function initThemeSettings() {
    if (!window.themeManager) {
        // themeManager not yet on window — retry after a short delay
        setTimeout(initThemeSettings, 50);
        return;
    }

    const currentTheme = window.themeManager.getCurrentTheme();
    selectedTheme = currentTheme;
    
    // Set custom color default
    if (!localStorage.getItem('customThemeColor')) {
        localStorage.setItem('customThemeColor', '#3b82f6');
    }

    const customHex = localStorage.getItem('customThemeColor') || '#3b82f6';
    updateCustomThemeColorUI(customHex);
    updateCurrentThemeDisplay(currentTheme);
    highlightActiveTheme(currentTheme);

    // If current theme is custom, show the picker panel immediately
    if (currentTheme === 'custom') {
        const container = document.getElementById('custom-color-picker-container');
        if (container) container.classList.remove('hidden');
    }
}

// Kick off immediately (works for both SPA inject and full page load)
initThemeSettings();

// Update custom color elements in UI
function updateCustomThemeColorUI(hex) {
    // Keep the custom swatch as rainbow conic — don't override it
    const picker = document.getElementById('theme-custom-picker');
    const hexInput = document.getElementById('theme-custom-hex');
    if (picker) picker.value = hex;
    if (hexInput) hexInput.value = hex.toUpperCase();
}

// Select a theme swatch
function selectTheme(themeName) {
    selectedTheme = themeName;
    highlightActiveTheme(themeName);

    const container = document.getElementById('custom-color-picker-container');
    if (container) {
        container.classList.toggle('hidden', themeName !== 'custom');
    }
}

// Update color dynamically when custom color changes
window.updateCustomThemeColor = function(hex) {
    if (!hex || !hex.startsWith('#')) hex = '#' + (hex || '');
    if (hex.length > 7) hex = hex.substring(0, 7);
    
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        localStorage.setItem('customThemeColor', hex);
        const picker = document.getElementById('theme-custom-picker');
        const hexInput = document.getElementById('theme-custom-hex');
        if (picker) picker.value = hex;
        if (hexInput) hexInput.value = hex.toUpperCase();

        // Live-apply the custom styles globally
        if (window.themeManager) {
            window.themeManager.generateCustomThemeStyles(hex);
        }
    }
};

// Highlight the active theme swatch
function highlightActiveTheme(themeName) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.theme-option[data-theme="${themeName}"]`);
    if (selectedOption) selectedOption.classList.add('active');

    const container = document.getElementById('custom-color-picker-container');
    if (container) {
        container.classList.toggle('hidden', themeName !== 'custom');
    }
}

// Update current theme display label
function updateCurrentThemeDisplay(themeName) {
    const el = document.getElementById('current-theme-name');
    if (el) {
        el.textContent = themeName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}

// Apply selected theme globally
function applySelectedTheme() {
    if (!selectedTheme) return;
    if (window.themeManager) {
        window.themeManager.applyTheme(selectedTheme);
    }
    updateCurrentThemeDisplay(selectedTheme);
    showNotification('Theme applied successfully!', 'success');
}

// Reset to default theme
function resetToDefault() {
    if (!window.themeManager) return;
    selectedTheme = window.themeManager.DEFAULT_THEME;
    window.themeManager.applyTheme(selectedTheme);
    updateCurrentThemeDisplay(selectedTheme);
    highlightActiveTheme(selectedTheme);
    showNotification('Theme reset to default!', 'success');
}

// Show toast notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim() || '#0284c7';

    notification.className = `fixed top-20 right-4 z-[9999] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transform transition-all duration-300 translate-x-full`;
    notification.style.backgroundColor = type === 'success' ? color : '#ef4444';
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>${message}`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('translate-x-full'), 80);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 350);
    }, 3000);
}

// Listen for cross-tab storage events
window.addEventListener('storage', function(e) {
    if (e.key === 'selectedTheme' && window.themeManager) {
        const newTheme = e.newValue || window.themeManager.DEFAULT_THEME;
        selectedTheme = newTheme;
        updateCurrentThemeDisplay(newTheme);
        highlightActiveTheme(newTheme);
    }
});

// Expose globally
window.selectTheme = selectTheme;
window.applyTheme = applySelectedTheme;
window.resetToDefault = resetToDefault;
