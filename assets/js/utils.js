/* ============================================================
   utils.js — Utility Functions
   Smart Incident Indicator
   ============================================================
   Contains: Date formatting, number formatting, animated
   counters, debounce/throttle, badge generators, risk
   calculators, and data fetching helpers.
   ============================================================ */

/**
 * Format a date string to a human-readable format
 * @param {string} dateStr - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(dateStr, options = {}) {
    const date = new Date(dateStr);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };
    return date.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * @param {string} dateStr - ISO date string
 * @returns {string} Relative time string
 */
export function timeAgo(dateStr) {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(dateStr, { hour: undefined, minute: undefined });
}

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
}

/**
 * Animate a counter from 0 to target value
 * @param {HTMLElement} element - DOM element to update
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix (%, +, etc.)
 */
export function animateCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        element.textContent = formatNumber(current) + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a severity badge HTML
 * @param {string} severity - critical, high, medium, low
 * @returns {string} Badge HTML
 */
export function severityBadge(severity) {
    const labels = {
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };
    const icons = {
        critical: '<i class="fas fa-exclamation-circle"></i>',
        high: '<i class="fas fa-exclamation-triangle"></i>',
        medium: '<i class="fas fa-info-circle"></i>',
        low: '<i class="fas fa-check-circle"></i>'
    };
    return `<span class="badge badge-${severity}">${icons[severity] || ''} ${labels[severity] || severity}</span>`;
}

/**
 * Generate a status badge HTML
 * @param {string} status - Active, Resolved, Monitoring, etc.
 * @returns {string} Badge HTML
 */
export function statusBadge(status) {
    const classMap = {
        'Active': 'badge-critical',
        'Resolved': 'badge-low',
        'Monitoring': 'badge-medium',
        'In Transit': 'badge-info',
        'Delayed': 'badge-high',
        'Cancelled': 'badge-critical',
        'Delivered': 'badge-low'
    };
    const dotClass = {
        'Active': 'dot-red dot-pulse',
        'Resolved': 'dot-green',
        'Monitoring': 'dot-yellow dot-pulse',
        'In Transit': 'dot-blue dot-pulse',
        'Delayed': 'dot-yellow',
        'Cancelled': 'dot-red',
        'Delivered': 'dot-green'
    };
    return `<span class="badge ${classMap[status] || 'badge-info'}"><span class="dot ${dotClass[status] || 'dot-blue'}"></span> ${status}</span>`;
}

/**
 * Get risk color based on score
 * @param {number} score - Risk score 0-100
 * @returns {string} CSS color variable
 */
export function getRiskColor(score) {
    if (score >= 80) return 'var(--color-red)';
    if (score >= 60) return 'var(--color-orange)';
    if (score >= 40) return 'var(--color-yellow)';
    return 'var(--color-green)';
}

/**
 * Get risk level label from score
 * @param {number} score - Risk score 0-100
 * @returns {string} Risk level label
 */
export function getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

/**
 * Generate a risk meter HTML
 * @param {number} score - Risk score 0-100
 * @returns {string} Risk meter HTML
 */
export function riskMeter(score) {
    const color = getRiskColor(score);
    return `
        <div class="risk-meter">
            <div class="risk-meter__bar">
                <div class="risk-meter__fill" style="width: ${score}%; background: ${color};"></div>
            </div>
            <span class="risk-meter__value" style="color: ${color};">${score}</span>
        </div>
    `;
}

/**
 * Fetch JSON data from API or local file
 * @param {string} url - URL to fetch
 * @returns {Promise<any>} Parsed JSON data
 */
export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return null;
    }
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Get current live clock time string
 * @returns {string} Formatted time string
 */
export function getLiveTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

/**
 * Get current date string
 * @returns {string} Formatted date string
 */
export function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Sort array of objects by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export function sortBy(arr, key, direction = 'asc') {
    return [...arr].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (typeof valA === 'string') {
            return direction === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }

        return direction === 'asc' ? valA - valB : valB - valA;
    });
}

/**
 * Paginate array
 * @param {Array} arr - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Items per page
 * @returns {object} { data, totalPages, currentPage, total }
 */
export function paginate(arr, page = 1, perPage = 10) {
    const total = arr.length;
    const totalPages = Math.ceil(total / perPage);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const start = (currentPage - 1) * perPage;
    const data = arr.slice(start, start + perPage);

    return { data, totalPages, currentPage, total };
}

/**
 * Filter array by search term across multiple keys
 * @param {Array} arr - Array to filter
 * @param {string} term - Search term
 * @param {Array<string>} keys - Keys to search in
 * @returns {Array} Filtered array
 */
export function searchFilter(arr, term, keys) {
    if (!term) return arr;
    const lower = term.toLowerCase();
    return arr.filter(item =>
        keys.some(key => {
            const val = item[key];
            if (typeof val === 'string') return val.toLowerCase().includes(lower);
            if (typeof val === 'number') return val.toString().includes(lower);
            return false;
        })
    );
}

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects
 * @param {Array<string>} columns - Column keys to include
 * @param {object} headers - Optional key-to-header label mapping
 * @returns {string} CSV string
 */
export function toCSV(data, columns, headers = {}) {
    const headerRow = columns.map(col => headers[col] || col).join(',');
    const rows = data.map(item =>
        columns.map(col => {
            let val = item[col];
            if (Array.isArray(val)) val = val.join('; ');
            if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
            return val ?? '';
        }).join(',')
    );
    return [headerRow, ...rows].join('\n');
}

/**
 * Download a string as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/csv') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
