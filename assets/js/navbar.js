/* ============================================================
   navbar.js — Top Navbar Controller
   Smart Incident Indicator
   ============================================================
   Handles live clock updates, search functionality,
   notification dropdown, and profile dropdown.
   ============================================================ */

import { getLiveTime, getCurrentDate } from './utils.js';

/**
 * Initialize navbar functionality
 */
export function initNavbar() {
    initClock();
    initSearchBar();
    initNotifications();
    initProfileDropdown();
}

/**
 * Start the live clock that updates every second
 */
function initClock() {
    const clockEl = document.getElementById('live-clock');
    const dateEl = document.getElementById('live-date');

    if (clockEl) {
        // Update immediately
        clockEl.textContent = getLiveTime();
        // Update every second
        setInterval(() => {
            clockEl.textContent = getLiveTime();
        }, 1000);
    }

    if (dateEl) {
        dateEl.textContent = getCurrentDate();
    }
}

/**
 * Initialize search bar behavior
 */
function initSearchBar() {
    const searchInput = document.getElementById('navbar-search');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                // Dispatch custom event for page-specific search handling
                document.dispatchEvent(new CustomEvent('globalSearch', { detail: { query } }));
            }
        }
    });

    // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

/**
 * Initialize notification dropdown
 */
function initNotifications() {
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');

    if (!notifBtn || !notifDropdown) return;

    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.parentElement.classList.toggle('active');
        // Close profile dropdown
        const profileDropdown = document.getElementById('profile-dropdown');
        if (profileDropdown) profileDropdown.parentElement.classList.remove('active');
    });

    // Close on outside click
    document.addEventListener('click', () => {
        if (notifDropdown.parentElement) {
            notifDropdown.parentElement.classList.remove('active');
        }
    });
}

/**
 * Initialize profile dropdown
 */
function initProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (!profileBtn || !profileDropdown) return;

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.parentElement.classList.toggle('active');
        // Close notification dropdown
        const notifDropdown = document.getElementById('notification-dropdown');
        if (notifDropdown) notifDropdown.parentElement.classList.remove('active');
    });

    document.addEventListener('click', () => {
        if (profileDropdown.parentElement) {
            profileDropdown.parentElement.classList.remove('active');
        }
    });
}
