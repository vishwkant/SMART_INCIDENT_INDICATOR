/* ============================================================
   toast.js — Toast Notification System
   Smart Incident Indicator
   ============================================================
   Provides a global toast notification system with support
   for success, error, warning, and info types. Auto-dismisses
   with a progress bar. Supports stacking.
   ============================================================ */

// Toast container reference
let toastContainer = null;

/**
 * Ensure the toast container exists in the DOM
 */
function ensureContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('role', 'alert');
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
    }
}

/**
 * Show a toast notification
 * @param {object} options - Toast options
 * @param {string} options.title - Toast title
 * @param {string} options.message - Toast message
 * @param {string} options.type - 'success', 'error', 'warning', 'info'
 * @param {number} options.duration - Auto-dismiss duration in ms (default 5000)
 */
export function showToast({ title, message, type = 'info', duration = 5000 }) {
    ensureContainer();

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <i class="toast__icon ${icons[type]}"></i>
        <div class="toast__content">
            <div class="toast__title">${title}</div>
            ${message ? `<div class="toast__message">${message}</div>` : ''}
        </div>
        <button class="toast__close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
        <div class="toast__progress" style="animation-duration: ${duration}ms;"></div>
    `;

    // Close button handler
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    toastContainer.appendChild(toast);

    // Auto dismiss
    const timer = setTimeout(() => removeToast(toast), duration);

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timer);
        const progress = toast.querySelector('.toast__progress');
        if (progress) progress.style.animationPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', () => {
        const progress = toast.querySelector('.toast__progress');
        if (progress) progress.style.animationPlayState = 'running';
        setTimeout(() => removeToast(toast), 2000);
    });
}

/**
 * Remove a toast with animation
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
    if (!toast || !toast.parentNode) return;

    toast.style.animation = 'fadeInRight 0.3s ease reverse';
    toast.style.opacity = '0';

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/* Convenience functions */
export function toastSuccess(title, message) {
    showToast({ title, message, type: 'success' });
}

export function toastError(title, message) {
    showToast({ title, message, type: 'error' });
}

export function toastWarning(title, message) {
    showToast({ title, message, type: 'warning' });
}

export function toastInfo(title, message) {
    showToast({ title, message, type: 'info' });
}
