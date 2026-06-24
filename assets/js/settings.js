/* ============================================================
   settings.js — Settings Page Logic
   Smart Incident Indicator
   ============================================================
   Handles settings tab navigation, updates profile metadata,
   modifies theme dynamically, and manages credential changes.
   ============================================================ */

import { getTheme, setTheme } from './theme.js';
import { toastSuccess, toastError, toastWarning } from './toast.js';

/**
 * Initialize Settings page
 */
function initSettings() {
    // 1. Initialize Tab Switching
    setupTabs();

    // 2. Set current theme in select dropdown
    const currentTheme = getTheme();
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = currentTheme;
    }

    // 3. Bind form submission actions
    bindFormActions();
}

/**
 * Configure Tab switching mechanism
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            // Set active class on clicked tab
            tabs.forEach(t => t.classList.remove('settings-tab--active'));
            tab.classList.add('settings-tab--active');

            // Display correct target panel, hide rest
            panels.forEach(panel => {
                if (panel.id === targetId) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * Bind save buttons and forms events
 */
function bindFormActions() {
    // Save Profile Changes
    const btnSaveProfile = document.getElementById('btn-save-profile');
    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', (e) => {
            e.preventDefault();
            const firstName = document.getElementById('profile-first-name').value.trim();
            const lastName = document.getElementById('profile-last-name').value.trim();
            const phone = document.getElementById('profile-phone').value.trim();

            if (!firstName || !lastName) {
                toastError('Validation Error', 'First and Last name are required.');
                return;
            }

            // Update DOM headers
            const displayNameEl = document.getElementById('display-name');
            const initialsEl = document.getElementById('avatar-initials');

            if (displayNameEl) {
                displayNameEl.textContent = `${firstName} ${lastName}`;
            }

            if (initialsEl) {
                initialsEl.textContent = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
            }

            toastSuccess('Profile Updated', 'Your profile details have been saved successfully.');
        });
    }

    // Save Notifications Preferences
    const btnSaveNotifications = document.getElementById('btn-save-notifications');
    if (btnSaveNotifications) {
        btnSaveNotifications.addEventListener('click', (e) => {
            e.preventDefault();
            toastSuccess('Notifications Saved', 'Your alert criteria and preferences have been updated.');
        });
    }

    // Save Preferences (Theme/Density)
    const btnSaveTheme = document.getElementById('btn-save-theme');
    if (btnSaveTheme) {
        btnSaveTheme.addEventListener('click', (e) => {
            e.preventDefault();
            const themeSelect = document.getElementById('theme-select');
            if (themeSelect) {
                const selectedTheme = themeSelect.value;
                setTheme(selectedTheme);
            }
            toastSuccess('Preferences Saved', 'Visual layout and refresh intervals updated successfully.');
        });
    }

    // Save Password
    const btnSavePassword = document.getElementById('btn-save-password');
    if (btnSavePassword) {
        btnSavePassword.addEventListener('click', (e) => {
            e.preventDefault();
            const currentPass = document.getElementById('sec-current-password').value;
            const newPass = document.getElementById('sec-new-password').value;
            const confirmPass = document.getElementById('sec-confirm-password').value;

            if (!currentPass) {
                toastError('Authentication Failed', 'Please input your current password.');
                return;
            }

            if (!newPass || newPass.length < 8) {
                toastError('Validation Error', 'New password must be at least 8 characters long.');
                return;
            }

            if (newPass !== confirmPass) {
                toastError('Validation Error', 'New passwords do not match.');
                return;
            }

            // Success
            toastSuccess('Password Updated', 'Your account credentials have been successfully updated.');
            document.getElementById('sec-current-password').value = '';
            document.getElementById('sec-new-password').value = '';
            document.getElementById('sec-confirm-password').value = '';
        });
    }

    // Rotate API Token
    const btnRotateApi = document.getElementById('btn-rotate-api');
    if (btnRotateApi) {
        btnRotateApi.addEventListener('click', (e) => {
            e.preventDefault();
            const rowDesc = document.querySelector('#tab-security .settings-row__desc');
            if (rowDesc) {
                const newKey = 'sii_key_live_' + Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 7);
                rowDesc.textContent = newKey;
                toastSuccess('API Key Rotated', 'The new access credential has been generated.');
            }
        });
    }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
} else {
    setTimeout(initSettings, 100);
}
