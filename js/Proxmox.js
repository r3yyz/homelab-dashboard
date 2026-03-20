/* ============================================================
   proxmox.js — Widget Proxmox : nœud + VMs + conteneurs
   Utilise l'API Proxmox via token (lecture seule)
   Prérequis : CONFIG.proxmox défini dans config.js
============================================================ */

/* --- Utilitaires --- */
function pct(used, total) {
    if (!total) return 0;
    return Math.round((used / total) * 100);
}

function fmtBytes(bytes) {
    if (bytes === undefined || bytes === null) return '—';
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) return gb.toFixed(1) + ' Go';
    const mb = bytes / 1024 / 1024;
    return Math.round(mb) + ' Mo';
}

function fmtUptime(seconds) {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}j ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

/* --- Barre de progression --- */
function progressBar(value, warn = 70, danger = 90) {
    const color = value >= danger
        ? 'var(--color-offline)'
        : value >= warn
            ? '#f59e0b'
            : 'var(--color-online)';
    return `
        <div style="display:flex; align-items:center; gap:8px;">
            <div style="flex:1; height:5px; background:var(--color-border); border-radius:99px; overflow:hidden;">
                <div style="width:${value}%; height:100%; background:${color}; border-radius:99px; transition:width .6s ease;"></div>
            </div>
            <span style="font-size:11px; font-family:var(--font-mono); color:var(--color-text-secondary); width:32px; text-align:right;">${value}%</span>
        </div>`;
}

/* --- Badge état VM/CT --- */
function statusBadge(status) {
    const map = {
        running: { label: 'actif',    color: 'var(--color-online)' },
        stopped: { label: 'arrêté',   color: 'var(--color-offline)' },
        paused:  { label: 'pause',    color: '#f59e0b' },
    };
    const s = map[status] || { label: status, color: 'var(--color-text-muted)' };
    return `<span style="font-size:10px; padding:2px 7px; border-radius:99px; background:${s.color}22; color:${s.color}; font-family:var(--font-mono); letter-spacing:0.04em;">${s.label}</span>`;
}

/* --- Requête API Proxmox --- */
async function proxmoxFetch(path) {
    const { host, tokenId, token } = CONFIG.proxmox;
    const res = await fetch(`${host}/api2/json${path}`, {
        headers: { 'Authorization': `PVEAPIToken=${tokenId}=${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data;
}

/* --- Rendu : nœud principal --- */
function renderNodeCard(status) {
    const cpuPct  = Math.round((status.cpu || 0) * 100);
    const ramPct  = pct(status.memory?.used, status.memory?.total);
    const diskPct = pct(status.rootfs?.used, status.rootfs?.total);

    return `
    <div class="pve-node-card">
        <div class="pve-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:5px;"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            ${CONFIG.proxmox.node} — uptime ${fmtUptime(status.uptime)}
        </div>
        <div class="pve-metrics">
            <div class="pve-metric">
                <div class="pve-metric-label">CPU</div>
                ${progressBar(cpuPct)}
                <div class="pve-metric-sub">${status.cpuinfo?.cpus || '—'} cœurs</div>
            </div>
            <div class="pve-metric">
                <div class="pve-metric-label">RAM</div>
                ${progressBar(ramPct)}
                <div class="pve-metric-sub">${fmtBytes(status.memory?.used)} / ${fmtBytes(status.memory?.total)}</div>
            </div>
            <div class="pve-metric">
                <div class="pve-metric-label">Disque racine</div>
                ${progressBar(diskPct)}
                <div class="pve-metric-sub">${fmtBytes(status.rootfs?.used)} / ${fmtBytes(status.rootfs?.total)}</div>
            </div>
        </div>
    </div>`;
}

/* --- Rendu : ligne VM ou CT --- */
function renderGuestRow(guest, type) {
    const icon = type === 'qemu'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;

    const isRunning = guest.status === 'running';
    const cpuPct    = isRunning ? Math.round((guest.cpu || 0) * 100) : null;
    const ramPct    = isRunning ? pct(guest.mem, guest.maxmem) : null;

    return `
    <div class="pve-guest-row">
        <div class="pve-guest-left">
            <span class="pve-guest-icon" style="color:var(--color-text-muted);">${icon}</span>
            <div>
                <div class="pve-guest-name">${guest.name || `${type}-${guest.vmid}`}</div>
                <div class="pve-guest-id">ID ${guest.vmid} · ${type === 'qemu' ? 'VM' : 'CT'}</div>
            </div>
        </div>
        <div class="pve-guest-right">
            ${isRunning ? `
                <div class="pve-guest-metrics">
                    <div style="display:flex;align-items:center;gap:5px;">
                        <span style="font-size:10px;color:var(--color-text-muted);width:26px;">CPU</span>
                        <div style="width:60px;height:4px;background:var(--color-border);border-radius:99px;overflow:hidden;">
                            <div style="width:${cpuPct}%;height:100%;background:${cpuPct >= 90 ? 'var(--color-offline)' : cpuPct >= 70 ? '#f59e0b' : 'var(--color-online)'};border-radius:99px;"></div>
                        </div>
                        <span style="font-size:10px;font-family:var(--font-mono);color:var(--color-text-secondary);width:28px;">${cpuPct}%</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:5px;">
                        <span style="font-size:10px;color:var(--color-text-muted);width:26px;">RAM</span>
                        <div style="width:60px;height:4px;background:var(--color-border);border-radius:99px;overflow:hidden;">
                            <div style="width:${ramPct}%;height:100%;background:${ramPct >= 90 ? 'var(--color-offline)' : ramPct >= 70 ? '#f59e0b' : 'var(--color-online)'};border-radius:99px;"></div>
                        </div>
                        <span style="font-size:10px;font-family:var(--font-mono);color:var(--color-text-secondary);width:28px;">${ramPct}%</span>
                    </div>
                </div>` : ''}
            ${statusBadge(guest.status)}
        </div>
    </div>`;
}

/* --- Rendu complet du widget --- */
async function renderProxmox() {
    const container = document.getElementById('proxmox-widget');
    if (!container) return;

    if (typeof CONFIG.proxmox === 'undefined') {
        container.innerHTML = `<div class="pve-error">Proxmox non configuré dans config.js</div>`;
        return;
    }

    try {
        const node = CONFIG.proxmox.node;

        /* Requêtes parallèles pour aller plus vite */
        const [status, vms, cts] = await Promise.all([
            proxmoxFetch(`/nodes/${node}/status`),
            proxmoxFetch(`/nodes/${node}/qemu`),
            proxmoxFetch(`/nodes/${node}/lxc`),
        ]);

        /* Tri : actifs en premier, puis par nom */
        const sortGuests = arr => [...arr].sort((a, b) => {
            if (a.status === b.status) return (a.name || '').localeCompare(b.name || '');
            return a.status === 'running' ? -1 : 1;
        });

        const sortedVMs = sortGuests(vms);
        const sortedCTs = sortGuests(cts);
        const allGuests = [
            ...sortedVMs.map(g => ({ guest: g, type: 'qemu' })),
            ...sortedCTs.map(g => ({ guest: g, type: 'lxc' })),
        ];

        const runningCount = allGuests.filter(g => g.guest.status === 'running').length;

        container.innerHTML = `
            ${renderNodeCard(status)}
            <div class="pve-guests-header">
                <span class="pve-section-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:5px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Machines — ${runningCount} / ${allGuests.length} actives
                </span>
            </div>
            <div class="pve-guests-list">
                ${allGuests.map(({ guest, type }) => renderGuestRow(guest, type)).join('')}
            </div>`;

    } catch (err) {
        container.innerHTML = `
            <div class="pve-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Proxmox inaccessible — ${err.message}
                <div style="font-size:11px;margin-top:6px;color:var(--color-text-muted);">Vérifiez que vous avez accepté le certificat auto-signé dans votre navigateur.</div>
            </div>`;
        console.warn('[proxmox.js]', err);
    }
}

function initProxmox() {
    renderProxmox();
    setInterval(renderProxmox, CONFIG.refresh?.proxmox || 15000);
}