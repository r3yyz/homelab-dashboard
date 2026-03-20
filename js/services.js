/* services.js — Cartes de services dynamiques. Dépend de ICONS. */

function buildBar(pct) {
    const cls = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : 'ok';
    return `<div class="bar-track">
        <div class="bar-bg"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="bar-pct">${pct}%</span>
    </div>`;
}

function buildCard(svc) {
    const icon = ICONS.get(svc.icon || 'info', 30);
    const card = document.createElement('a');
    card.href      = svc.href;
    card.className = 'service-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('target', '_blank');
    card.setAttribute('rel', 'noopener noreferrer');
    card.setAttribute('aria-label', `${svc.name} — ${svc.description}`);
    card.innerHTML = `
        <span class="status-dot" id="${svc.dotId}" title="En attente…" aria-label="Statut en attente"></span>
        <span class="svc-icon">${icon}</span>
        <span class="svc-name">${svc.name}</span>
        <span class="svc-desc">${svc.description}</span>`;
    return card;
}

async function pingService(svc) {
    const dot = document.getElementById(svc.dotId);
    if (!dot) return;
    const t0 = performance.now();
    try {
        await fetch(svc.url, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(5000) });
        const ms = Math.round(performance.now() - t0);
        dot.classList.replace('offline', 'online') || dot.classList.add('online');
        dot.setAttribute('title', `En ligne — ${ms} ms`);
        dot.setAttribute('aria-label', `En ligne (${ms} ms)`);
    } catch {
        dot.classList.replace('online', 'offline') || dot.classList.add('offline');
        dot.setAttribute('title', 'Hors ligne ou inaccessible');
        dot.setAttribute('aria-label', 'Hors ligne');
    }
}

window.initServices = function () {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    const frag = document.createDocumentFragment();
    CONFIG.services.forEach(svc => frag.appendChild(buildCard(svc)));
    grid.appendChild(frag);

    function checkAll() { CONFIG.services.forEach(pingService); }
    checkAll();
    setInterval(checkAll, CONFIG.refresh.services);
};