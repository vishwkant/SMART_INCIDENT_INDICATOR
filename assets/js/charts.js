/* ============================================================
   charts.js — Reusable Chart.js Configuration Factory
   Smart Incident Indicator
   ============================================================
   Creates pre-configured Chart.js charts with dark theme
   defaults, responsive settings, and custom tooltips.
   ============================================================ */

/**
 * Default Chart.js configuration for dark theme
 */
const defaultConfig = {
    fontFamily: "'Inter', -apple-system, sans-serif",
    gridColor: 'rgba(255, 255, 255, 0.04)',
    tickColor: '#64748B',
    tooltipBg: '#111827',
    tooltipBorder: 'rgba(56, 189, 248, 0.15)',
    tooltipText: '#F8FAFC',
    legendText: '#94A3B8'
};

/**
 * Color palette for charts
 */
export const chartColors = {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    accent: '#38BDF8',
    green: '#22C55E',
    yellow: '#FACC15',
    red: '#EF4444',
    orange: '#F97316',
    purple: '#8B5CF6',
    pink: '#EC4899',
    teal: '#14B8A6',
    // Gradient arrays
    blueGradient: ['rgba(37, 99, 235, 0.3)', 'rgba(37, 99, 235, 0.01)'],
    accentGradient: ['rgba(56, 189, 248, 0.3)', 'rgba(56, 189, 248, 0.01)'],
    greenGradient: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.01)'],
    redGradient: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.01)']
};

/**
 * Create a gradient fill for area/line charts
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<string>} colors - [startColor, endColor]
 * @returns {CanvasGradient}
 */
export function createGradient(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
}

/**
 * Get default chart options for a given chart type
 * @param {string} type - 'line', 'bar', 'pie', 'doughnut'
 * @param {object} overrides - Custom options to merge
 * @returns {object} Chart.js options
 */
export function getChartOptions(type, overrides = {}) {
    const base = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: type === 'pie' || type === 'doughnut',
                position: 'bottom',
                labels: {
                    color: defaultConfig.legendText,
                    font: {
                        family: defaultConfig.fontFamily,
                        size: 12
                    },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: defaultConfig.tooltipBg,
                titleColor: defaultConfig.tooltipText,
                bodyColor: '#94A3B8',
                borderColor: defaultConfig.tooltipBorder,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    family: defaultConfig.fontFamily,
                    size: 13,
                    weight: 600
                },
                bodyFont: {
                    family: defaultConfig.fontFamily,
                    size: 12
                },
                displayColors: true,
                boxPadding: 4
            }
        }
    };

    // Add scales for line, bar, area charts
    if (type === 'line' || type === 'bar') {
        base.scales = {
            x: {
                grid: {
                    color: defaultConfig.gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: defaultConfig.tickColor,
                    font: {
                        family: defaultConfig.fontFamily,
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: defaultConfig.gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: defaultConfig.tickColor,
                    font: {
                        family: defaultConfig.fontFamily,
                        size: 11
                    }
                },
                beginAtZero: true
            }
        };
    }

    // Special options for doughnut
    if (type === 'doughnut') {
        base.cutout = '70%';
    }

    // Deep merge overrides
    return deepMerge(base, overrides);
}

/**
 * Create a Chart.js chart instance
 * @param {string} canvasId - Canvas element ID
 * @param {string} type - Chart type
 * @param {object} data - Chart data
 * @param {object} options - Chart options
 * @returns {Chart|null} Chart instance
 */
export function createChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element #${canvasId} not found`);
        return null;
    }

    const ctx = canvas.getContext('2d');
    const mergedOptions = getChartOptions(type, options);

    return new Chart(ctx, {
        type,
        data,
        options: mergedOptions
    });
}

/**
 * Deep merge two objects
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} Merged object
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}
