/* ============================================================
   incidents.js — Incidents Page Logic
   Smart Incident Indicator
   ============================================================ */

import { fetchJSON, severityBadge, statusBadge, timeAgo, formatDate, searchFilter, paginate, debounce } from './utils.js';

let allIncidents = [];
let filteredIncidents = [];
let currentPage = 1;
const perPage = 9;

async function initIncidents() {
    allIncidents = await fetchJSON('/data/incidents.json') || [];
    filteredIncidents = [...allIncidents];
    renderIncidents();
    bindFilters();
    bindModal();
    handleHash();
    window.addEventListener('hashchange', handleHash);
}

function handleHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#INC')) {
        const id = hash.substring(1);
        openIncidentModal(id);
    }
}

function renderIncidents() {
    const { data, totalPages, currentPage: page } = paginate(filteredIncidents, currentPage, perPage);
    const container = document.getElementById('incidents-list');

    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-state__icon"><i class="fas fa-search"></i></div><div class="empty-state__title">No incidents found</div><div class="empty-state__text">Try adjusting your filters or search query.</div></div>`;
        document.getElementById('incidents-pagination').innerHTML = '';
        return;
    }

    container.innerHTML = data.map((inc, i) => `
        <div class="incident-card incident-card--${inc.severity} animate-fade-in-up" style="animation-delay: ${i * 0.05}s; cursor: pointer;" data-id="${inc.id}">
            <div class="incident-card__header">
                <h4 class="incident-card__title">${inc.title}</h4>
                ${severityBadge(inc.severity)}
            </div>
            <div class="incident-card__meta">
                <span class="incident-card__meta-item"><i class="fas fa-map-marker-alt"></i> ${inc.country}</span>
                <span class="incident-card__meta-item"><i class="fas fa-anchor"></i> ${inc.port}</span>
                <span class="incident-card__meta-item"><i class="fas fa-clock"></i> ${timeAgo(inc.detectedTime)}</span>
            </div>
            <p style="font-size: 0.8125rem; color: var(--color-text-secondary); margin-bottom: 12px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${inc.description}</p>
            <div class="incident-card__footer">
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${statusBadge(inc.status)}
                    <span class="incident-card__source">${inc.source}</span>
                </div>
                <button class="btn btn-sm btn-secondary">Details</button>
            </div>
        </div>
    `).join('');

    // Pagination
    renderPagination(totalPages, page);

    // Card click to open modal
    container.querySelectorAll('.incident-card').forEach(card => {
        card.addEventListener('click', () => openIncidentModal(card.dataset.id));
    });
}

function renderPagination(totalPages, page) {
    const container = document.getElementById('incidents-pagination');
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
            if (p >= 1 && p <= totalPages) {
                currentPage = p;
                renderIncidents();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function bindFilters() {
    const search = document.getElementById('incident-search');
    const severity = document.getElementById('severity-filter');
    const status = document.getElementById('status-filter');

    const applyFilters = debounce(() => {
        let result = [...allIncidents];
        const searchTerm = search.value.trim();
        const sevValue = severity.value;
        const statValue = status.value;

        if (searchTerm) result = searchFilter(result, searchTerm, ['title', 'country', 'port', 'description']);
        if (sevValue) result = result.filter(i => i.severity === sevValue);
        if (statValue) result = result.filter(i => i.status === statValue);

        filteredIncidents = result;
        currentPage = 1;
        renderIncidents();
    }, 250);

    search?.addEventListener('input', applyFilters);
    severity?.addEventListener('change', applyFilters);
    status?.addEventListener('change', applyFilters);
}

function openIncidentModal(id) {
    const inc = allIncidents.find(i => i.id === id);
    if (!inc) return;

    if (window.location.hash !== '#' + id) {
        history.pushState(null, null, '#' + id);
    }

    const modal = document.getElementById('incident-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');

    title.textContent = inc.title;
    content.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;">
            ${severityBadge(inc.severity)} ${statusBadge(inc.status)}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div><span style="font-size: 0.75rem; color: var(--color-text-muted);">Country</span><div style="font-weight: 600;">${inc.country}</div></div>
            <div><span style="font-size: 0.75rem; color: var(--color-text-muted);">Port</span><div style="font-weight: 600;">${inc.port}</div></div>
            <div><span style="font-size: 0.75rem; color: var(--color-text-muted);">Detected</span><div style="font-weight: 600;">${formatDate(inc.detectedTime)}</div></div>
            <div><span style="font-size: 0.75rem; color: var(--color-text-muted);">Source</span><div style="font-weight: 600;">${inc.source}</div></div>
        </div>

        <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1rem; margin-bottom: 8px;"><i class="fas fa-align-left" style="color: var(--color-accent);"></i> Description</h4>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.8;">${inc.description}</p>
        </div>

        <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1rem; margin-bottom: 12px;"><i class="fas fa-history" style="color: var(--color-accent);"></i> Timeline</h4>
            <div class="timeline">
                ${inc.timeline.map(t => {
                    const dotClass = t.type === 'critical' ? 'timeline__dot--red' : t.type === 'warning' ? 'timeline__dot--yellow' : '';
                    return `<div class="timeline__item"><div class="timeline__dot ${dotClass}"></div><div class="timeline__time">${formatDate(t.time)}</div><div class="timeline__title">${t.event}</div></div>`;
                }).join('')}
            </div>
        </div>

        ${inc.affectedPorts.length ? `<div style="margin-bottom: 24px;"><h4 style="font-size: 1rem; margin-bottom: 8px;"><i class="fas fa-anchor" style="color: var(--color-accent);"></i> Affected Ports</h4><div style="display: flex; flex-wrap: wrap; gap: 8px;">${inc.affectedPorts.map(p => `<span class="badge badge-info">${p}</span>`).join('')}</div></div>` : ''}

        ${inc.recommendedActions.length ? `<div><h4 style="font-size: 1rem; margin-bottom: 12px;"><i class="fas fa-lightbulb" style="color: var(--color-yellow);"></i> Recommended Actions</h4><div class="incident-detail__actions-list">${inc.recommendedActions.map(a => `<div class="incident-detail__action-item"><i class="fas fa-check-circle"></i><span class="incident-detail__action-text">${a}</span></div>`).join('')}</div></div>` : ''}
    `;

    modal.classList.add('active');
}

function closeIncidentModal() {
    const modal = document.getElementById('incident-modal');
    if (modal) {
        modal.classList.remove('active');
        if (window.location.hash) {
            history.pushState(null, null, ' ');
        }
    }
}

function bindModal() {
    const modal = document.getElementById('incident-modal');
    const closeBtn = document.getElementById('modal-close');

    closeBtn?.addEventListener('click', closeIncidentModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeIncidentModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeIncidentModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initIncidents, 150));
} else {
    setTimeout(initIncidents, 150);
}
