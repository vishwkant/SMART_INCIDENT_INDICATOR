/* ============================================================
   app.js — Application Initialization
   Smart Incident Indicator
   ============================================================
   Loads shared HTML components (sidebar, navbar, footer),
   initializes theme, and dispatches page-specific setup.
   ============================================================ */

import { initTheme, toggleTheme } from './theme.js';
import { initSidebar, toggleMobileSidebar } from './sidebar.js';
import { initNavbar } from './navbar.js';

/**
 * Load an HTML component into a target element
 * @param {string} targetId - ID of the container element
 * @param {string} componentPath - Path to the HTML partial
 */
async function loadComponent(targetId, componentPath) {
    const container = document.getElementById(targetId);
    if (!container) return;

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

/**
 * Initialize the application
 * Called on DOMContentLoaded for all dashboard pages
 */
export async function initApp() {
    // 1. Initialize theme
    initTheme();

    // 2. Load shared components
    await Promise.all([
        loadComponent('sidebar-container', '/components/sidebar.html'),
        loadComponent('navbar-container', '/components/navbar.html'),
        loadComponent('footer-container', '/components/footer.html')
    ]);

    // 3. Initialize sidebar & navbar after components are loaded
    initSidebar();
    initNavbar();

    // 4. Bind global event handlers
    bindGlobalEvents();

    // 5. Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out',
            once: true,
            offset: 50
        });
    }

    // 6. Hide page loader
    hidePageLoader();
}

/**
 * Bind global event handlers
 */
function bindGlobalEvents() {
    // Theme toggle button
    document.addEventListener('click', (e) => {
        const themeBtn = e.target.closest('#theme-toggle');
        if (themeBtn) {
            toggleTheme();
        }
    });

    // Mobile hamburger menu
    document.addEventListener('click', (e) => {
        const hamburger = e.target.closest('#hamburger-btn');
        if (hamburger) {
            toggleMobileSidebar();
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * Hide the page loading overlay
 */
function hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }, 300);
    }
}

// Auto-init when DOM is ready (for pages that include this as a module)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
