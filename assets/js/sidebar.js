/* ============================================================
   sidebar.js — Sidebar Navigation Controller
   Smart Incident Indicator
   ============================================================
   Handles sidebar collapse/expand, active link highlighting,
   mobile toggle, and localStorage state persistence.
   ============================================================ */

/**
 * Initialize sidebar functionality
 */
export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const overlay = document.getElementById('sidebar-overlay');

    if (!sidebar) return;

    // Restore collapsed state from localStorage
    const isCollapsed = localStorage.getItem('sii-sidebar-collapsed') === 'true';
    if (isCollapsed && window.innerWidth > 1024) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('sidebar-collapsed');
    }

    // Collapse button toggle
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                // Mobile: close sidebar
                sidebar.classList.remove('mobile-open');
                if (overlay) overlay.classList.remove('active');
            } else {
                // Desktop: toggle collapsed
                sidebar.classList.toggle('collapsed');
                if (mainContent) mainContent.classList.toggle('sidebar-collapsed');
                localStorage.setItem('sii-sidebar-collapsed', sidebar.classList.contains('collapsed'));
            }
        });
    }

    // Mobile overlay close
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
    }

    // Highlight active link based on current page
    highlightActiveLink();

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
        }
    });
}

/**
 * Toggle mobile sidebar visibility
 */
export function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!sidebar) return;

    sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
}

/**
 * Highlight the active sidebar link based on current URL
 */
function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const links = document.querySelectorAll('.sidebar__link');

    links.forEach(link => {
        link.classList.remove('sidebar__link--active');
        const href = link.getAttribute('href') || '';
        const linkPage = href.replace('.html', '').replace('/', '');

        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index')) {
            link.classList.add('sidebar__link--active');
        }
    });
}
