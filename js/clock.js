/* ============================================================
   clock.js — Horloge en temps réel + date
============================================================ */

function updateClock() {
    const now = new Date();

    /* Horloge HH:MM:SS */
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}:${s}`;
        /* Mise à jour de l'attribut datetime pour l'accessibilité */
        clockEl.setAttribute('datetime', now.toISOString());
    }

    /* Date en toutes lettres : "jeudi 19 mars 2026" */
    const dateEl = document.getElementById('date-display');
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day:     'numeric',
            month:   'long',
            year:    'numeric',
        });
    }
}

function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}