/* adguard.js — Widget AdGuard Home. Dépend de ICONS. */

function adgFmt(n) {
    if (n == null) return '—';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
}

window.initAdGuard = function () {
    if (!CONFIG.adguard?.enabled) return;

    const container = document.getElementById('adguard-widget');
    if (!container) return;

    async function render() {
        try {
            const { host, user, password } = CONFIG.adguard;
            const res = await fetch(`${host}/control/stats`, {
                headers: { Authorization: `Basic ${btoa(`${user}:${password}`)}` },
                signal: AbortSignal.timeout(6000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const d = await res.json();

            const total  = d.num_dns_queries || 0;
            const blocked = d.num_blocked_filtering || 0;
            const pct    = total ? Math.round(blocked / total * 100) : 0;
            const ms     = d.avg_processing_time ? (d.avg_processing_time * 1000).toFixed(1) : '—';

            container.innerHTML = `
                <div class="adg-stats">
                    <div class="adg-stat">
                        <div class="adg-val">${adgFmt(total)}</div>
                        <div class="adg-lbl">requêtes aujourd'hui</div>
                    </div>
                    <div class="adg-stat highlight">
                        <div class="adg-val">${adgFmt(blocked)}</div>
                        <div class="adg-lbl">bloquées (${pct}%)</div>
                    </div>
                    <div class="adg-stat">
                        <div class="adg-val">${adgFmt(d.num_replaced_safebrowsing)}</div>
                        <div class="adg-lbl">malwares bloqués</div>
                    </div>
                    <div class="adg-stat">
                        <div class="adg-val">${ms} <span style="font-size:0.75rem;font-weight:400;">ms</span></div>
                        <div class="adg-lbl">temps moyen</div>
                    </div>
                </div>
                <div class="adg-bar-row">
                    <span class="adg-bar-lbl">Taux de blocage</span>
                    <span class="adg-bar-pct">${pct}%</span>
                </div>
                <div class="bar-bg" style="width:100%;">
                    <div class="bar-fill ok" style="width:${pct}%;"></div>
                </div>`;

        } catch (err) {
            container.innerHTML = `<div class="widget-state">
                ${ICONS.get('info', 20)} AdGuard inaccessible<br>
                <span style="font-size:0.72rem;">${err.message}</span>
            </div>`;
            console.warn('[adguard]', err.message);
        }
    }

    render();
    setInterval(render, CONFIG.refresh.adguard);
};