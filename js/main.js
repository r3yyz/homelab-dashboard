/* main.js — Orchestrateur. Chargé en dernier. */

document.addEventListener('DOMContentLoaded', function () {

    if (typeof CONFIG === 'undefined') {
        console.error('[main] config.js manquant ou mal chargé.');
        document.body.innerHTML = `<div style="display:flex;height:100vh;align-items:center;justify-content:center;font-family:monospace;color:#ff4d6d;">
            ▸ ERREUR : config.js introuvable. Vérifiez votre installation.</div>`;
        return;
    }

    /* Grille système : ajouter les classes de layout dynamiquement */
    const sysSection = document.getElementById('systeme');
    if (sysSection) {
        if (CONFIG.proxmox?.enabled) sysSection.classList.add('has-proxmox');
        if (CONFIG.adguard?.enabled) sysSection.classList.add('has-adguard');
        /* Masquer la section si aucun widget n'est activé */
        if (!CONFIG.proxmox?.enabled && !CONFIG.adguard?.enabled) {
            sysSection.style.display = 'none';
        }
    }

    /* Initialisation des modules */
    initTheme();    /* theme.js   */
    initClock();    /* clock.js   */
    initWeather();  /* weather.js */
    initServices(); /* services.js */
    initProxmox();  /* proxmox.js  */
    initAdGuard();  /* adguard.js  */

    console.info(`[HomeLab] ${CONFIG.services.length} service(s) · Proxmox: ${CONFIG.proxmox?.enabled ? 'on' : 'off'} · AdGuard: ${CONFIG.adguard?.enabled ? 'on' : 'off'}`);
});