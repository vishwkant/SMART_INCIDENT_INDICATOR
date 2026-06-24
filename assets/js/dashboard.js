/* ============================================================
   dashboard.js — Dashboard Page Logic
   Smart Incident Indicator
   ============================================================
   Fetches data, renders stat widgets, incident cards,
   flagged shipments, activity feed, and mini map.
   ============================================================ */

import { fetchJSON, animateCounter, severityBadge, statusBadge, getRiskColor, timeAgo, formatDate } from './utils.js';

// Data stores
let incidents = [];
let shipments = [];
let ports = [];

/**
 * Initialize dashboard
 */
async function initDashboard() {
    // Fetch all data in parallel
    const [incidentsData, shipmentsData, portsData] = await Promise.all([
        fetchJSON('/data/incidents.json'),
        fetchJSON('/data/shipments.json'),
        fetchJSON('/data/ports.json')
    ]);

    incidents = incidentsData || [];
    shipments = shipmentsData || [];
    ports = portsData || [];

    // Render all sections
    renderStats();
    renderIncidentCards();
    renderFlaggedShipments();
    renderActivityFeed();
    renderRecentAlerts();
    renderUpcomingShipments();
    initMiniMap();
}

/**
 * Render stat widgets
 */
function renderStats() {
    const activeShipments = shipments.filter(s => s.status === 'In Transit').length;
    const todayIncidents = incidents.filter(i => i.status === 'Active').length;
    const criticalAlerts = incidents.filter(i => i.severity === 'critical').length;
    const highRiskShipments = shipments.filter(s => s.riskScore >= 70).length;
    const avgRiskScore = Math.round(shipments.reduce((sum, s) => sum + s.riskScore, 0) / shipments.length);
    const riskPercentage = Math.round((shipments.filter(s => s.riskScore > 60).length / shipments.length) * 100);

    const statsData = [
        { label: 'Active Shipments', value: activeShipments, icon: 'fas fa-ship', color: 'blue', change: '+3 today', direction: 'up' },
        { label: "Today's Incidents", value: todayIncidents, icon: 'fas fa-exclamation-triangle', color: 'red', change: '+2 new', direction: 'up' },
        { label: 'Critical Alerts', value: criticalAlerts, icon: 'fas fa-bell', color: 'red', change: 'Immediate action', direction: 'up' },
        { label: 'High Risk Shipments', value: highRiskShipments, icon: 'fas fa-flag', color: 'yellow', change: `${highRiskShipments} flagged`, direction: 'up' },
        { label: 'Risk Percentage', value: riskPercentage, icon: 'fas fa-percentage', color: 'accent', change: 'of fleet affected', direction: 'up', suffix: '%' },
        { label: 'Avg Risk Score', value: avgRiskScore, icon: 'fas fa-chart-line', color: 'green', change: 'across all routes', direction: 'down' }
    ];

    const grid = document.getElementById('stats-grid');
    grid.innerHTML = statsData.map((stat, i) => `
        <div class="stat-card animate-fade-in-up" style="animation-delay: ${i * 0.1}s;">
            <div class="stat-card__icon stat-card__icon--${stat.color}">
                <i class="${stat.icon}"></i>
            </div>
            <div class="stat-card__label">${stat.label}</div>
            <div class="stat-card__value" id="stat-value-${i}">0</div>
            <div class="stat-card__change stat-card__change--${stat.direction}">
                <i class="fas fa-arrow-${stat.direction}"></i> ${stat.change}
            </div>
        </div>
    `).join('');

    // Animate counters
    statsData.forEach((stat, i) => {
        const el = document.getElementById(`stat-value-${i}`);
        if (el) animateCounter(el, stat.value, 2000, stat.suffix || '');
    });
}

/**
 * Render live incident cards (top 6)
 */
function renderIncidentCards() {
    const container = document.getElementById('incident-cards');
    const activeIncidents = incidents
        .filter(i => i.status === 'Active')
        .sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        })
        .slice(0, 6);

    container.innerHTML = activeIncidents.map((inc, i) => `
        <div class="incident-card incident-card--${inc.severity} animate-fade-in-up" style="animation-delay: ${i * 0.1}s;">
            <div class="incident-card__header">
                <h4 class="incident-card__title">${inc.title}</h4>
                ${severityBadge(inc.severity)}
            </div>
            <div class="incident-card__meta">
                <span class="incident-card__meta-item">
                    <i class="fas fa-map-marker-alt"></i> ${inc.country}
                </span>
                <span class="incident-card__meta-item">
                    <i class="fas fa-anchor"></i> ${inc.port}
                </span>
                <span class="incident-card__meta-item">
                    <i class="fas fa-clock"></i> ${timeAgo(inc.detectedTime)}
                </span>
            </div>
            <div class="incident-card__footer">
                <span class="incident-card__source">${inc.source}</span>
                <a href="/incidents#${inc.id}" class="btn btn-sm btn-secondary">View Details</a>
            </div>
        </div>
    `).join('');
}

/**
 * Render flagged shipments (risk > 60)
 */
function renderFlaggedShipments() {
    const container = document.getElementById('flagged-shipments');
    const flagged = shipments
        .filter(s => s.riskScore >= 60)
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

    container.innerHTML = flagged.map((shp, i) => {
        const riskColor = getRiskColor(shp.riskScore);
        return `
            <div class="shipment-row animate-fade-in-up" style="animation-delay: ${i * 0.08}s;">
                <div style="min-width: 70px;">
                    <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-accent);">${shp.id}</span>
                </div>
                <div class="shipment-row__route">
                    <div class="shipment-row__route-text">
                        ${shp.origin.replace('Port of ', '')}
                        <span class="shipment-row__route-arrow"><i class="fas fa-long-arrow-alt-right"></i></span>
                        ${shp.destination.replace('Port of ', '')}
                    </div>
                    <div class="shipment-row__eta">ETA: ${formatDate(shp.eta, { hour: undefined, minute: undefined })}</div>
                </div>
                <div class="shipment-row__risk" style="min-width: 140px;">
                    <div class="risk-meter">
                        <div class="risk-meter__bar">
                            <div class="risk-meter__fill" style="width: ${shp.riskScore}%; background: ${riskColor};"></div>
                        </div>
                        <span class="risk-meter__value" style="color: ${riskColor};">${shp.riskScore}</span>
                    </div>
                </div>
                ${severityBadge(shp.riskLevel)}
            </div>
        `;
    }).join('');
}

/**
 * Render activity feed
 */
function renderActivityFeed() {
    const container = document.getElementById('activity-feed');
    const activities = [
        { icon: 'fas fa-exclamation-circle', color: 'var(--color-red)', bg: 'rgba(239, 68, 68, 0.15)', title: 'Critical cyclone alert for Mumbai', time: '2 min ago' },
        { icon: 'fas fa-route', color: 'var(--color-accent)', bg: 'rgba(56, 189, 248, 0.15)', title: 'SHP010 rerouted to Subic Bay', time: '15 min ago' },
        { icon: 'fas fa-shield-alt', color: 'var(--color-yellow)', bg: 'rgba(250, 204, 21, 0.15)', title: 'Antwerp cybersecurity incident', time: '30 min ago' },
        { icon: 'fas fa-ship', color: 'var(--color-green)', bg: 'rgba(34, 197, 94, 0.15)', title: 'SHP028 departed Dubai on schedule', time: '1 hour ago' },
        { icon: 'fas fa-anchor', color: 'var(--color-primary-light)', bg: 'rgba(37, 99, 235, 0.15)', title: 'Rotterdam strike negotiations update', time: '2 hours ago' },
        { icon: 'fas fa-chart-line', color: 'var(--color-accent)', bg: 'rgba(56, 189, 248, 0.15)', title: 'Risk scores updated for 12 vessels', time: '3 hours ago' }
    ];

    container.innerHTML = activities.map(act => `
        <div class="activity-item">
            <div class="activity-item__icon" style="background: ${act.bg}; color: ${act.color};">
                <i class="${act.icon}"></i>
            </div>
            <div class="activity-item__content">
                <div class="activity-item__title">${act.title}</div>
                <div class="activity-item__time">${act.time}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Render recent alerts
 */
function renderRecentAlerts() {
    const container = document.getElementById('recent-alerts');
    const criticalIncidents = incidents
        .filter(i => i.severity === 'critical' || i.severity === 'high')
        .slice(0, 4);

    container.innerHTML = criticalIncidents.map(inc => `
        <div class="activity-item">
            <div class="activity-item__icon" style="background: rgba(239, 68, 68, 0.15); color: var(--color-red);">
                <i class="fas fa-${inc.severity === 'critical' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
            </div>
            <div class="activity-item__content">
                <div class="activity-item__title" style="font-size: 0.6875rem;">${inc.title}</div>
                <div class="activity-item__time">${timeAgo(inc.detectedTime)} · ${inc.country}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Render upcoming shipments (nearest ETA)
 */
function renderUpcomingShipments() {
    const container = document.getElementById('upcoming-shipments');
    const upcoming = shipments
        .filter(s => s.status === 'In Transit')
        .sort((a, b) => new Date(a.eta) - new Date(b.eta))
        .slice(0, 4);

    container.innerHTML = upcoming.map(shp => `
        <div class="activity-item">
            <div class="activity-item__icon" style="background: rgba(37, 99, 235, 0.15); color: var(--color-primary-light);">
                <i class="fas fa-ship"></i>
            </div>
            <div class="activity-item__content">
                <div class="activity-item__title" style="font-size: 0.6875rem;">${shp.vessel}</div>
                <div class="activity-item__time">${shp.destination.replace('Port of ', '')} · ${formatDate(shp.eta, { hour: undefined, minute: undefined })}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Initialize mini Leaflet map
 */
function initMiniMap() {
    if (typeof L === 'undefined') return;

    const map = L.map('dashboard-map', {
        center: [20, 50],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    // Add incident markers
    incidents.filter(i => i.status === 'Active').forEach(inc => {
        const color = {
            critical: '#EF4444',
            high: '#F97316',
            medium: '#FACC15',
            low: '#22C55E'
        }[inc.severity] || '#38BDF8';

        const marker = L.circleMarker(inc.coordinates, {
            radius: inc.severity === 'critical' ? 8 : 6,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.4
        }).addTo(map);

        marker.bindPopup(`<div class="map-popup">
            <div class="map-popup__title">${inc.title}</div>
            <div class="map-popup__detail"><strong>Severity:</strong> ${inc.severity}</div>
            <div class="map-popup__detail"><strong>Port:</strong> ${inc.port}</div>
        </div>`);
    });

    // Add some shipment position markers
    shipments.filter(s => s.status === 'In Transit').slice(0, 10).forEach(shp => {
        L.circleMarker(shp.currentLocation, {
            radius: 4,
            fillColor: '#38BDF8',
            color: '#38BDF8',
            weight: 1,
            opacity: 0.6,
            fillOpacity: 0.3
        }).addTo(map).bindPopup(`<div class="map-popup">
            <div class="map-popup__title">${shp.vessel}</div>
            <div class="map-popup__detail">${shp.origin} → ${shp.destination}</div>
        </div>`);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    // Small delay to let app.js load components first
    setTimeout(initDashboard, 100);
}
