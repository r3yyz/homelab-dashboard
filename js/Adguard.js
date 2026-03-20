/* ============================================================
   adguard.js — Widget AdGuard Home : stats de blocage
   Prérequis : CONFIG.adguard défini dans config.js
============================================================ */

function fmtNumber(n) {
    if (!n && n !== 0) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
    return String(n);
}

async function renderAdGuard() {
    const container = document.getElementById('adguard-widget');
    if (!container) return;

    if (typeof CONFIG.adguard === 'undefined') {
        container.innerHTML = `<div class="pve-error">AdGuard non configuré dans config.js</div>`;
        return;
    }

    try {
        const { host, user, password } = CONFIG.adguard;
        const credentials = btoa(`${user}:${password}`);

        const res = await fetch(`${host}/control/stats`, {
            headers: { 'Authorization': `Basic ${credentials}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const blockPct = data.num_dns_queries
            ? Math.round((data.num_blocked_filtering / data.num_dns_queries) * 100)
            : 0;

        container.innerHTML = `
            <div class="adg-grid">
                <div class="adg-stat">
                    <div class="adg-val">${fmtNumber(data.num_dns_queries)}</div>
                    <div class="adg-label">requêtes aujourd'hui</div>
                </div>
                <div class="adg-stat adg-blocked">
                    <div class="adg-val">${fmtNumber(data.num_blocked_filtering)}</div>
                    <div class="adg-label">bloquées (${blockPct}%)</div>
                </div>
                <div class="adg-stat">
                    <div class="adg-val">${fmtNumber(data.num_replaced_safebrowsing)}</div>
                    <div class="adg-label">malwares bloqués</div>
                </div>
                <div class="adg-stat">
                    <div class="adg-val">${fmtNumber(data.avg_processing_time ? (data.avg_processing_time * 1000).toFixed(1) : null)} <span style="font-size:11px;">ms</span></div>
                    <div class="adg-label">temps moyen</div>
                </div>
            </div>
            <div style="margin-top:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:11px;color:var(--color-text-muted);">Taux de blocage</span>
                    <span style="font-size:11px;font-family:var(--font-mono);color:var(--color-accent);">${blockPct}%</span>
                </div>
                <div style="height:5px;background:var(--color-border);border-radius:99px;overflow:hidden;">
                    <div style="width:${blockPct}%;height:100%;background:var(--color-accent);border-radius:99px;transition:width .6s ease;"></div>
                </div>
            </div>`;

    } catch (err) {
        container.innerHTML = `<div class="pve-error">AdGuard inaccessible — ${err.message}</div>`;
        console.warn('[adguard.js]', err);
    }
}

function initAdGuard() {
    renderAdGuard();
    setInterval(renderAdGuard, CONFIG.refresh?.adguard || 60000);
}