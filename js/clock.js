/* clock.js — Horloge temps réel + date */

window.initClock = function () {
    const clockEl = document.getElementById('clock');
    const dateEl  = document.getElementById('date-display');

    function tick() {
        const now = new Date();
        if (clockEl) {
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${hh}:${mm}:${ss}`;
            clockEl.setAttribute('datetime', now.toISOString());
        }
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            });
        }
    }

    tick();
    setInterval(tick, 1000);
};