/* ============================================================
   map.js — Live Map Logic
   Smart Incident Indicator
   ============================================================
   Initializes Leaflet map, plots active incidents, global ports,
   and shipment routes, with filter controls and stats overlays.
   ============================================================ */

import { fetchJSON, severityBadge, statusBadge, getRiskColor } from './utils.js';

// Global Map instances and state
let map = null;
let incidents = [];
let shipments = [];
let ports = [];

// Layer Groups
const incidentsLayer = L.layerGroup();
const portsLayer = L.layerGroup();
const routesLayer = L.layerGroup();

// Filter visibility state
let showIncidents = true;
let showPorts = true;
let showRoutes = true;

/**
 * Initialize Map page logic
 */
async function initMapPage() {
    // 1. Fetch data
    const [incidentsData, shipmentsData, portsData] = await Promise.all([
        fetchJSON('/data/incidents.json'),
        fetchJSON('/data/shipments.json'),
        fetchJSON('/data/ports.json')
    ]);

    incidents = incidentsData || [];
    shipments = shipmentsData || [];
    ports = portsData || [];

    // 2. Compute overlays statistics
    updateMapStats();

    // 3. Initialize Leaflet map
    setupMap();

    // 4. Plot data layers
    plotIncidents();
    plotPorts();
    plotRoutes();

    // 5. Add layers to map initially
    incidentsLayer.addTo(map);
    portsLayer.addTo(map);
    routesLayer.addTo(map);

    // 6. Bind control buttons
    bindMapControls();
}

/**
 * Setup Leaflet Map instance
 */
function setupMap() {
    map = L.map('map', {
        center: [15, 20],
        zoom: 3,
        zoomControl: true,
        attributionControl: false
    });

    // Add CartoDB Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(map);
}

/**
 * Calculate overlay panel metrics
 */
function updateMapStats() {
    const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status === 'Active').length;
    const transitCount = shipments.filter(s => s.status === 'In Transit').length;
    const disruptedCount = ports.filter(p => p.status === 'disrupted').length;

    const elCritical = document.getElementById('info-critical-count');
    const elTransit = document.getElementById('info-transit-count');
    const elDisrupted = document.getElementById('info-disrupted-count');

    if (elCritical) elCritical.textContent = criticalCount;
    if (elTransit) elTransit.textContent = transitCount;
    if (elDisrupted) elDisrupted.textContent = disruptedCount;
}

/**
 * Plot Incidents Layer
 */
function plotIncidents() {
    incidents.forEach(inc => {
        if (!inc.coordinates || inc.coordinates.length !== 2) return;

        const severityColors = {
            critical: '#EF4444',
            high: '#F97316',
            medium: '#FACC15',
            low: '#22C55E'
        };
        const color = severityColors[inc.severity] || '#38BDF8';

        let marker;

        // Use pulsing DivIcon for critical/high incidents
        if (inc.severity === 'critical' || inc.severity === 'high') {
            const pulseIcon = L.divIcon({
                className: 'critical-marker',
                html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px ${color};"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            marker = L.marker(inc.coordinates, { icon: pulseIcon });
        } else {
            marker = L.circleMarker(inc.coordinates, {
                radius: 6,
                fillColor: color,
                color: '#fff',
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.7
            });
        }

        // Custom details card in popup
        const formattedDate = new Date(inc.detectedTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const popupContent = `
            <div class="map-popup" style="padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 6px;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: #fff;">${inc.id}</span>
                    ${severityBadge(inc.severity)}
                </div>
                <h4 class="map-popup__title" style="margin-bottom: 8px; line-height: 1.3;">${inc.title}</h4>
                <div class="map-popup__detail" style="margin-bottom: 4px;"><i class="fas fa-map-marker-alt" style="width: 14px;"></i> <strong>Location:</strong> ${inc.port} (${inc.country})</div>
                <div class="map-popup__detail" style="margin-bottom: 4px;"><i class="fas fa-clock" style="width: 14px;"></i> <strong>Detected:</strong> ${formattedDate}</div>
                <div class="map-popup__detail" style="margin-bottom: 8px;"><i class="fas fa-bullseye" style="width: 14px;"></i> <strong>Source:</strong> ${inc.source}</div>
                <p style="font-size: 0.75rem; color: #94A3B8; line-height: 1.4; margin-bottom: 8px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 6px;">${inc.description}</p>
                <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
                    <a href="/incidents#${inc.id}" class="btn btn-sm btn-primary" style="font-size: 10px; padding: 4px 8px; height: auto;">Investigate Incident</a>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 }).addTo(incidentsLayer);
    });
}

/**
 * Plot Ports Layer
 */
function plotPorts() {
    ports.forEach(port => {
        if (!port.coordinates || port.coordinates.length !== 2) return;

        const isDisrupted = port.status === 'disrupted';
        const color = isDisrupted ? '#EF4444' : '#38BDF8';
        const radius = isDisrupted ? 7 : 5;
        const fillOpacity = isDisrupted ? 0.9 : 0.6;

        const marker = L.circleMarker(port.coordinates, {
            radius: radius,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: fillOpacity
        });

        const popupContent = `
            <div class="map-popup" style="padding: 2px;">
                <h4 class="map-popup__title" style="margin-bottom: 6px; font-size: 0.875rem;">${port.name}</h4>
                <div class="map-popup__detail"><strong>Country:</strong> ${port.country}</div>
                <div class="map-popup__detail"><strong>Region:</strong> ${port.region}</div>
                <div class="map-popup__detail"><strong>Cargo Terminal:</strong> ${port.type || 'Container'}</div>
                <div class="map-popup__detail" style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
                    <strong>Status:</strong> ${statusBadge(port.status === 'disrupted' ? 'Delayed' : 'Delivered')}
                </div>
                <div class="map-popup__detail" style="margin-top: 4px;">
                    <strong>Risk Level:</strong> ${severityBadge(port.riskLevel || 'low')}
                </div>
            </div>
        `;

        marker.bindPopup(popupContent).addTo(portsLayer);
    });
}

/**
 * Plot Shipment Routes & Ship Markers Layer
 */
function plotRoutes() {
    // Index ports for fast coordinate lookup
    const portsMap = {};
    ports.forEach(p => {
        portsMap[p.id] = p;
    });

    shipments.forEach(shp => {
        // Draw route line if shipment is active
        if (shp.status !== 'In Transit' && shp.status !== 'Delayed') return;

        const originPort = portsMap[shp.originId];
        const destPort = portsMap[shp.destinationId];

        if (!originPort || !destPort) return;

        const routeLatLngs = [originPort.coordinates];

        // Add transit ports if available
        if (shp.transitPorts && shp.transitPorts.length > 0) {
            shp.transitPorts.forEach(portId => {
                const transitPort = portsMap[portId];
                if (transitPort) {
                    routeLatLngs.push(transitPort.coordinates);
                }
            });
        }

        routeLatLngs.push(destPort.coordinates);

        // Determine line color based on shipment risk score
        const riskColor = getRiskColor(shp.riskScore);
        const isHighRisk = shp.riskScore >= 60;

        // Plot polyline
        const polyline = L.polyline(routeLatLngs, {
            color: isHighRisk ? riskColor : '#3B82F6',
            weight: 2.5,
            opacity: isHighRisk ? 0.75 : 0.45,
            dashArray: shp.status === 'Delayed' ? '5, 5' : null
        }).addTo(routesLayer);

        // Add ship marker at current location
        if (shp.currentLocation && shp.currentLocation.length === 2) {
            const shipIcon = L.divIcon({
                className: 'vessel-marker',
                html: `<i class="fas fa-ship" style="color: ${riskColor}; font-size: 14px; filter: drop-shadow(0 0 6px ${riskColor}); transition: transform 0.3s;"></i>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            const shipMarker = L.marker(shp.currentLocation, { icon: shipIcon }).addTo(routesLayer);

            const formattedEta = new Date(shp.eta).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            const popupContent = `
                <div class="map-popup" style="padding: 4px; min-width: 230px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 6px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #fff;">${shp.id}</span>
                        ${statusBadge(shp.status)}
                    </div>
                    <h4 class="map-popup__title" style="margin-bottom: 8px; line-height: 1.3;">${shp.vessel}</h4>
                    <div class="map-popup__detail"><i class="fas fa-box" style="width: 14px;"></i> <strong>Cargo:</strong> ${shp.cargo} (${shp.cargoVolume})</div>
                    <div class="map-popup__detail"><i class="fas fa-compass" style="width: 14px;"></i> <strong>Route:</strong> ${originPort.name.replace('Port of ', '')} &rarr; ${destPort.name.replace('Port of ', '')}</div>
                    <div class="map-popup__detail"><i class="fas fa-calendar-alt" style="width: 14px;"></i> <strong>ETA:</strong> ${formattedEta}</div>
                    <div class="map-popup__detail" style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-shield-alt" style="width: 14px;"></i> <strong>Risk Score:</strong>
                        <span style="color: ${riskColor}; font-weight: 700; font-size: 0.8125rem;">${shp.riskScore}/100</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #F8FAFC; background: rgba(255, 255, 255, 0.03); border: 1px dashed rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 8px; margin-top: 8px; line-height: 1.4;">
                        <strong>Indicator Action:</strong><br>${shp.recommendation}
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                        <a href="/shipments#${shp.id}" class="btn btn-sm btn-secondary" style="font-size: 10px; padding: 4px 8px; height: auto;">Manage Shipment</a>
                    </div>
                </div>
            `;

            shipMarker.bindPopup(popupContent, { maxWidth: 260 });

            // Animate ship zoom on line click
            polyline.on('click', () => {
                map.setView(shp.currentLocation, 5);
                shipMarker.openPopup();
            });
        }
    });
}

/**
 * Bind actions for map control buttons
 */
function bindMapControls() {
    const btnReset = document.getElementById('btn-reset-view');
    const btnIncidents = document.getElementById('btn-toggle-incidents');
    const btnPorts = document.getElementById('btn-toggle-ports');
    const btnRoutes = document.getElementById('btn-toggle-routes');

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            map.setView([15, 20], 3);
        });
    }

    if (btnIncidents) {
        // Init active state
        btnIncidents.classList.replace('btn-secondary', 'btn-primary');
        btnIncidents.addEventListener('click', () => {
            showIncidents = !showIncidents;
            if (showIncidents) {
                map.addLayer(incidentsLayer);
                btnIncidents.classList.replace('btn-secondary', 'btn-primary');
            } else {
                map.removeLayer(incidentsLayer);
                btnIncidents.classList.replace('btn-primary', 'btn-secondary');
            }
        });
    }

    if (btnPorts) {
        btnPorts.classList.replace('btn-secondary', 'btn-primary');
        btnPorts.addEventListener('click', () => {
            showPorts = !showPorts;
            if (showPorts) {
                map.addLayer(portsLayer);
                btnPorts.classList.replace('btn-secondary', 'btn-primary');
            } else {
                map.removeLayer(portsLayer);
                btnPorts.classList.replace('btn-primary', 'btn-secondary');
            }
        });
    }

    if (btnRoutes) {
        btnRoutes.classList.replace('btn-secondary', 'btn-primary');
        btnRoutes.addEventListener('click', () => {
            showRoutes = !showRoutes;
            if (showRoutes) {
                map.addLayer(routesLayer);
                btnRoutes.classList.replace('btn-secondary', 'btn-primary');
            } else {
                map.removeLayer(routesLayer);
                btnRoutes.classList.replace('btn-primary', 'btn-secondary');
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapPage);
} else {
    setTimeout(initMapPage, 100);
}
