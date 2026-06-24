/* ============================================================
   shipments.js — Shipments Page Logic
   Smart Incident Indicator
   ============================================================ */

import { fetchJSON, statusBadge, severityBadge, getRiskColor, formatDate, searchFilter, paginate, sortBy, toCSV, downloadFile, debounce } from './utils.js';
import { toastSuccess } from './toast.js';

let allShipments = [];
let filteredShipments = [];
let currentPage = 1;
let sortKey = 'riskScore';
let sortDir = 'desc';
const perPage = 10;

async function initShipments() {
    allShipments = await fetchJSON('/data/shipments.json') || [];
    filteredShipments = sortBy([...allShipments], sortKey, sortDir);
    renderTable();
    bindFilters();
    bindSort();
    bindExport();
}

function renderTable() {
    const { data, totalPages, currentPage: page, total } = paginate(filteredShipments, currentPage, perPage);
    const tbody = document.getElementById('shipments-tbody');

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-state__icon"><i class="fas fa-ship"></i></div><div class="empty-state__title">No shipments found</div><div class="empty-state__text">Try adjusting your filters.</div></div></td></tr>`;
        document.getElementById('shipments-pagination').innerHTML = '';
        document.getElementById('table-info').textContent = '';
        return;
    }

    tbody.innerHTML = data.map(shp => {
        const riskColor = getRiskColor(shp.riskScore);
        const transitStr = shp.transitPorts.length > 0
            ? shp.transitPorts.map(p => `<span class="badge badge-info" style="font-size: 0.625rem; padding: 1px 6px;">${p}</span>`).join(' ')
            : '<span style="color: var(--color-text-muted); font-size: 0.75rem;">Direct</span>';

        return `
            <tr>
                <td><span style="font-weight: 600; color: var(--color-accent);">${shp.id}</span></td>
                <td>
                    <div style="font-weight: 600;">${shp.vessel}</div>
                    <div style="font-size: 0.6875rem; color: var(--color-text-muted);">${shp.cargo} · ${shp.cargoVolume}</div>
                </td>
                <td>${shp.origin.replace('Port of ', '')}</td>
                <td>${shp.destination.replace('Port of ', '')}</td>
                <td><div style="display: flex; flex-wrap: wrap; gap: 4px;">${transitStr}</div></td>
                <td>${formatDate(shp.eta, { hour: undefined, minute: undefined })}</td>
                <td>${statusBadge(shp.status)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 60px; height: 6px; background: var(--color-secondary); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${shp.riskScore}%; height: 100%; background: ${riskColor}; border-radius: 3px; transition: width 1s ease;"></div>
                        </div>
                        <span style="font-weight: 700; font-size: 0.8125rem; color: ${riskColor}; min-width: 24px;">${shp.riskScore}</span>
                    </div>
                </td>
                <td><button class="btn btn-sm btn-ghost" data-tooltip="${shp.recommendation}" style="font-size: 0.75rem;"><i class="fas fa-eye"></i></button></td>
            </tr>
        `;
    }).join('');

    // Info text
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    document.getElementById('table-info').textContent = `Showing ${start}-${end} of ${total} shipments`;

    // Pagination
    renderPagination(totalPages, page);
}

function renderPagination(totalPages, page) {
    const container = document.getElementById('shipments-pagination');
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<button class="pagination__btn ${page <= 1 ? 'pagination__btn--disabled' : ''}" data-page="${page - 1}"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination__btn ${i === page ? 'pagination__btn--active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="pagination__btn ${page >= totalPages ? 'pagination__btn--disabled' : ''}" data-page="${page + 1}"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;

    container.querySelectorAll('.pagination__btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = parseInt(btn.dataset.page);
            if (p >= 1 && p <= totalPages) { currentPage = p; renderTable(); }
        });
    });
}

function bindFilters() {
    const search = document.getElementById('shipment-search');
    const risk = document.getElementById('risk-filter');
    const status = document.getElementById('status-filter');

    const applyFilters = debounce(() => {
        let result = [...allShipments];
        if (search.value.trim()) result = searchFilter(result, search.value.trim(), ['id', 'vessel', 'origin', 'destination', 'cargo']);
        if (risk.value) result = result.filter(s => s.riskLevel === risk.value);
        if (status.value) result = result.filter(s => s.status === status.value);
        filteredShipments = sortBy(result, sortKey, sortDir);
        currentPage = 1;
        renderTable();
    }, 250);

    search?.addEventListener('input', applyFilters);
    risk?.addEventListener('change', applyFilters);
    status?.addEventListener('change', applyFilters);
}

function bindSort() {
    document.querySelectorAll('[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            filteredShipments = sortBy(filteredShipments, sortKey, sortDir);
            // Update header icons
            document.querySelectorAll('[data-sort]').forEach(h => {
                h.classList.remove('sorted');
                h.querySelector('i').className = 'fas fa-sort';
            });
            th.classList.add('sorted');
            th.querySelector('i').className = sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            renderTable();
        });
    });
}

function bindExport() {
    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
        const csv = toCSV(filteredShipments,
            ['id', 'vessel', 'cargo', 'origin', 'destination', 'eta', 'status', 'riskScore', 'riskLevel', 'recommendation'],
            { id: 'Shipment ID', vessel: 'Vessel', cargo: 'Cargo', origin: 'Origin', destination: 'Destination', eta: 'ETA', status: 'Status', riskScore: 'Risk Score', riskLevel: 'Risk Level', recommendation: 'Recommendation' }
        );
        downloadFile(csv, 'shipments_export.csv', 'text/csv');
        toastSuccess('Export Complete', 'Shipments data exported as CSV.');
    });

    document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
        // Simple print-based PDF export
        const printContent = `<html><head><title>Shipments Report</title><style>body{font-family:Arial,sans-serif;font-size:12px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f4f4f4;font-weight:bold;}</style></head><body><h1>Smart Incident Indicator — Shipments Report</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>ID</th><th>Vessel</th><th>Origin</th><th>Destination</th><th>ETA</th><th>Status</th><th>Risk</th></tr></thead><tbody>${filteredShipments.map(s => `<tr><td>${s.id}</td><td>${s.vessel}</td><td>${s.origin}</td><td>${s.destination}</td><td>${new Date(s.eta).toLocaleDateString()}</td><td>${s.status}</td><td>${s.riskScore}</td></tr>`).join('')}</tbody></table></body></html>`;
        const win = window.open('', '_blank');
        win.document.write(printContent);
        win.document.close();
        win.print();
        toastSuccess('PDF Export', 'Print dialog opened for PDF export.');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initShipments, 150));
} else {
    setTimeout(initShipments, 150);
}
