/**
 * Theme Management System
 * Handles theme switching and persistence across all dashboards
 */

// Available themes - Education-focused color palettes
const THEMES = [
  'blue',
  'green',
  'purple',
  'red',
  'teal',
  'gold',
  'navy-blue',
  'slate'
];

// Default theme
const DEFAULT_THEME = 'blue';

/**
 * Get the current theme from localStorage
 * @returns {string} Current theme name
 */
function getCurrentTheme() {
  return localStorage.getItem('selectedTheme') || DEFAULT_THEME;
}

/**
 * Apply theme to the document
 * @param {string} themeName - Name of the theme to apply
 */
function applyTheme(themeName) {
  // Validate theme name
  if (!THEMES.includes(themeName)) {
    console.warn(`Invalid theme: ${themeName}. Falling back to default.`);
    themeName = DEFAULT_THEME;
  }

  // Apply theme to HTML element
  document.documentElement.setAttribute('data-theme', themeName);
  
  // Save to localStorage
  localStorage.setItem('selectedTheme', themeName);
  
  // Dispatch custom event for theme change
  window.dispatchEvent(new CustomEvent('themeChanged', { 
    detail: { theme: themeName } 
  }));
  
  console.log(`Theme applied: ${themeName}`);
}

/**
 * Switch to a new theme
 * @param {string} themeName - Name of the theme to switch to
 */
function switchTheme(themeName) {
  applyTheme(themeName);
}

/**
 * Initialize theme on page load
 */
function initializeTheme() {
  const currentTheme = getCurrentTheme();
  applyTheme(currentTheme);
}

// Auto-initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
  initializeTheme();
}

// Export functions for use in other scripts
window.themeManager = {
  getCurrentTheme,
  applyTheme,
  switchTheme,
  THEMES,
  DEFAULT_THEME
};
