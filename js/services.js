/* ============================================================
   services.js — Cartes de services dynamiques
   Génère le HTML des cartes depuis CONFIG.services
   et vérifie la disponibilité de chaque service.
============================================================ */

/* --- Icônes SVG par type de service --- */
const SERVICE_ICONS = {
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,
    server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <rect x="2" y="2" width="20" height="8" rx="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/>
        <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>`,
    block: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <circle cx="12" cy="12" r="10"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
    </svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`,
    database: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>`,
    monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`,
};

/* Icône de fallback si le type n'est pas reconnu */
const ICON_FALLBACK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32">
    <rect x="2" y="2" width="20" height="20" rx="4"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>`;

/* --- Construction d'une carte de service --- */
function buildServiceCard(service) {
    const icon = SERVICE_ICONS[service.icon] || ICON_FALLBACK;

    const card = document.createElement('a');
    card.href      = service.href;
    card.className = 'service-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `${service.name} — ${service.description}`);
    card.setAttribute('target', '_blank');
    card.setAttribute('rel', 'noopener noreferrer');

    card.innerHTML = `
        <span class="status-dot" id="${service.dotId}" aria-label="Statut : en attente"></span>
        <span class="service-icon" aria-hidden="true">${icon}</span>
        <h3 class="service-name">${service.name}</h3>
        <p class="service-desc">${service.description}</p>
    `;

    return card;
}

/* --- Injection de toutes les cartes dans la grille --- */
function renderServiceCards() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    /* Fragment pour un seul reflow DOM */
    const fragment = document.createDocumentFragment();

    CONFIG.services.forEach(service => {
        fragment.appendChild(buildServiceCard(service));
    });

    grid.appendChild(fragment);
}

/* --- Test de disponibilité d'un service --- */
async function checkService(service) {
    const dot = document.getElementById(service.dotId);
    if (!dot) return;

    const start = performance.now();

    try {
        await fetch(service.url, {
            mode:  'no-cors',
            cache: 'no-store',
            signal: AbortSignal.timeout(5000), /* timeout 5 secondes */
        });

        const ms = Math.round(performance.now() - start);

        dot.classList.add('online');
        dot.classList.remove('offline');
        dot.setAttribute('aria-label', `Statut : en ligne (${ms} ms)`);
        dot.setAttribute('title', `En ligne — ${ms} ms`);

    } catch (err) {
        dot.classList.add('offline');
        dot.classList.remove('online');
        dot.setAttribute('aria-label', 'Statut : hors ligne');
        dot.setAttribute('title', 'Hors ligne ou inaccessible');
    }
}

/* --- Vérification de tous les services --- */
function checkAllServices() {
    CONFIG.services.forEach(service => checkService(service));
}

/* --- Export pour main.js --- */
function initServices() {
    renderServiceCards();   /* 1. Dessiner les cartes */
    checkAllServices();     /* 2. Tester les statuts */
    setInterval(checkAllServices, CONFIG.refresh.services);
}