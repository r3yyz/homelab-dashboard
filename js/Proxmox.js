/* proxmox.js — Widget Proxmox. Dépend de ICONS. */

/* --- Utilitaires --- */
function pvePct(used, total) { return total ? Math.round(used / total * 100) : 0; }
function pveMB(bytes)  {
    if (!bytes && bytes !== 0) return '—';
    const gb = bytes / 1073741824;
    return gb >= 1 ? gb.toFixed(1) + ' Go' : Math.round(bytes / 1048576) + ' Mo';
}
function pveUptime(s) {
    if (!s) return '—';
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return d > 0 ? `${d}j ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function pveBar(pct) {
    const cls = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : 'ok';
    return `<div class="bar-track">
        <div class="bar-bg"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="bar-pct">${pct}%</span>
    </div>`;
}
function pveMiniBar(pct) {
    const bg = pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warn)' : 'var(--ok)';
    return `<div class="pve-mini-bg"><div class="pve-mini-fill" style="width:${pct}%;background:${bg};"></div></div>`;
}

async function pveGet(path) {
    const { host, tokenId, token } = CONFIG.proxmox;
    const res = await fetch(`${host}/api2/json${path}`, {
        headers: { Authorization: `PVEAPIToken=${tokenId}=${token}` },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).data;
}

function renderNode(s) {
    const cpu  = Math.round((s.cpu || 0) * 100);
    const ram  = pvePct(s.memory?.used, s.memory?.total);
    const disk = pvePct(s.rootfs?.used, s.rootfs?.total);
    return `
    <div class="pve-node">
        <div class="pve-label">${ICONS.get('server', 13)} ${CONFIG.proxmox.node} · uptime ${pveUptime(s.uptime)} · ${s.cpuinfo?.cpus || '?'} cœurs</div>
        <div class="pve-metrics">
            <div>
                <div class="pve-metric-name">CPU</div>
                ${pveBar(cpu)}
            </div>
            <div>
                <div class="pve-metric-name">RAM</div>
                ${pveBar(ram)}
                <div class="pve-metric-sub">${pveMB(s.memory?.used)} / ${pveMB(s.memory?.total)}</div>
            </div>
            <div>
                <div class="pve-metric-name">Disque</div>
                ${pveBar(disk)}
                <div class="pve-metric-sub">${pveMB(s.rootfs?.used)} / ${pveMB(s.rootfs?.total)}</div>
            </div>
        </div>
    </div>`;
}

function renderGuest(g, type) {
    const icon    = ICONS.get(type === 'qemu' ? 'vm' : 'container', 14);
    const running = g.status === 'running';
    const cpu     = running ? Math.round((g.cpu || 0) * 100) : null;
    const ram     = running ? pvePct(g.mem, g.maxmem) : null;
    const badge   = `<span class="pve-badge ${g.status}">${g.status === 'running' ? 'actif' : g.status === 'stopped' ? 'arrêté' : g.status}</span>`;

    return `
    <div class="pve-row">
        <div class="pve-row-left">
            <span style="color:var(--text-2);display:flex;">${icon}</span>
            <div>
                <div class="pve-name">${g.name || `${type}-${g.vmid}`}</div>
                <div class="pve-meta">ID ${g.vmid} · ${type === 'qemu' ? 'VM' : 'CT'}</div>
            </div>
        </div>
        <div class="pve-row-right">
            ${running ? `<div class="pve-mini-bars">
                <div class="pve-mini-bar">
                    <span class="pve-mini-lbl">CPU</span>${pveMiniBar(cpu)}
                    <span class="pve-mini-pct">${cpu}%</span>
                </div>
                <div class="pve-mini-bar">
                    <span class="pve-mini-lbl">RAM</span>${pveMiniBar(ram)}
                    <span class="pve-mini-pct">${ram}%</span>
                </div>
            </div>` : ''}
            ${badge}
        </div>
    </div>`;
}

window.initProxmox = function () {
    if (!CONFIG.proxmox?.enabled) return;

    const container = document.getElementById('proxmox-widget');
    if (!container) return;

    async function render() {
        try {
            const node = CONFIG.proxmox.node;
            const [status, vms, cts] = await Promise.all([
                pveGet(`/nodes/${node}/status`),
                pveGet(`/nodes/${node}/qemu`),
                pveGet(`/nodes/${node}/lxc`),
            ]);

            const sort = arr => [...arr].sort((a, b) =>
                a.status === b.status ? (a.name || '').localeCompare(b.name || '') : a.status === 'running' ? -1 : 1
            );

            const guests = [
                ...sort(vms).map(g => renderGuest(g, 'qemu')),
                ...sort(cts).map(g => renderGuest(g, 'lxc')),
            ];
            const running = [...vms, ...cts].filter(g => g.status === 'running').length;

            container.innerHTML = `
                ${renderNode(status)}
                <div class="pve-label pve-guests-label">
                    ${ICONS.get('cpu', 13)} Machines — ${running} / ${guests.length} actives
                </div>
                <div class="pve-list">${guests.join('')}</div>`;

        } catch (err) {
            container.innerHTML = `<div class="widget-state">
                ${ICONS.get('info', 20)}
                Proxmox inaccessible<br>
                <span style="font-size:0.72rem;">${err.message}</span>
                <span style="font-size:0.65rem;margin-top:4px;">Acceptez le certificat auto-signé dans votre navigateur.</span>
            </div>`;
            console.warn('[proxmox]', err.message);
        }
    }

    render();
    setInterval(render, CONFIG.refresh.proxmox);
};