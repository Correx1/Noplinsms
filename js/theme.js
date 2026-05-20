/**
 * Theme Management System — Custom Theme Creator Integration
 * Handles theme switching, dynamic custom variable calculations, and persistence
 */

const THEMES = [
  'blue',
  'green',
  'purple',
  'red',
  'teal',
  'gold',
  'navy-blue',
  'slate',
  'custom' // Ported custom theme setting
];

const DEFAULT_THEME = 'blue';

// Hex to HSL color converter for dynamic shades
function hexToHsl(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function generateCustomThemeStyles(baseHex) {
    try {
        const hsl = hexToHsl(baseHex);
        const shades = {
            50: hslToHex(hsl.h, hsl.s, 96),
            100: hslToHex(hsl.h, hsl.s, 90),
            200: hslToHex(hsl.h, hsl.s, 80),
            300: hslToHex(hsl.h, hsl.s, 70),
            400: hslToHex(hsl.h, hsl.s, 60),
            500: baseHex,
            600: hslToHex(hsl.h, hsl.s, hsl.l * 0.85),
            700: hslToHex(hsl.h, hsl.s, hsl.l * 0.70),
            800: hslToHex(hsl.h, hsl.s, hsl.l * 0.55),
            900: hslToHex(hsl.h, hsl.s, hsl.l * 0.40),
            950: hslToHex(hsl.h, hsl.s, hsl.l * 0.25)
        };

        let styleEl = document.getElementById('custom-theme-vars');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'custom-theme-vars';
            document.head.appendChild(styleEl);
        }

        styleEl.innerHTML = `
        :root[data-theme="custom"], :root {
            --color-primary-50: ${shades[50]};
            --color-primary-100: ${shades[100]};
            --color-primary-200: ${shades[200]};
            --color-primary-300: ${shades[300]};
            --color-primary-400: ${shades[400]};
            --color-primary-500: ${shades[500]};
            --color-primary-600: ${shades[600]};
            --color-primary-700: ${shades[700]};
            --color-primary-800: ${shades[800]};
            --color-primary-900: ${shades[900]};
            --color-primary-950: ${shades[950]};
        }`;
    } catch (e) {
        console.error("Failed to generate custom theme styles:", e);
    }
}

function getCurrentTheme() {
  return localStorage.getItem('selectedTheme') || DEFAULT_THEME;
}

function applyTheme(themeName) {
  if (!THEMES.includes(themeName)) {
    console.warn(`Invalid theme: ${themeName}. Falling back to default.`);
    themeName = DEFAULT_THEME;
  }

  // Handle dynamic custom theme generator
  if (themeName === 'custom') {
      const baseHex = localStorage.getItem('customThemeColor') || '#3b82f6';
      generateCustomThemeStyles(baseHex);
  } else {
      // Clean up custom styling override if switching back to standard
      const styleEl = document.getElementById('custom-theme-vars');
      if (styleEl) styleEl.remove();
  }

  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('selectedTheme', themeName);
  
  window.dispatchEvent(new CustomEvent('themeChanged', { 
    detail: { theme: themeName } 
  }));
  
  console.log(`Theme applied: ${themeName}`);
}

function switchTheme(themeName) {
  applyTheme(themeName);
}

function initializeTheme() {
  const currentTheme = getCurrentTheme();
  applyTheme(currentTheme);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
  initializeTheme();
}

window.themeManager = {
  getCurrentTheme,
  applyTheme,
  switchTheme,
  THEMES,
  DEFAULT_THEME,
  generateCustomThemeStyles
};
