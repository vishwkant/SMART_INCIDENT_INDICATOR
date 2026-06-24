/* ============================================================
   theme.js — Dark/Light Mode Toggle
   Smart Incident Indicator
   ============================================================
   Persists theme preference in localStorage and updates
   CSS custom properties via [data-theme] attribute.
   ============================================================ */

/**
 * Initialize theme from localStorage or system preference
 */
export function initTheme() {
    const stored = localStorage.getItem('sii-theme');
    if (stored) {
        setTheme(stored);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'dark'); // Default to dark for this app
    }
}

/**
 * Set theme and update DOM
 * @param {string} theme - 'dark' or 'light'
 */
export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sii-theme', theme);

    // Update toggle button icon if it exists
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

/**
 * Toggle between dark and light themes
 */
export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
}

/**
 * Get current theme
 * @returns {string} Current theme ('dark' or 'light')
 */
export function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}
