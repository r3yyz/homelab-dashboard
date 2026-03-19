/* ============================================================
   theme.js — Gestion du thème clair / sombre
   Chargé EN PREMIER avant les autres scripts pour éviter
   le "flash" de mauvais thème au chargement de la page.
============================================================ */

(function () {
    const STORAGE_KEY = 'homelab-theme';
    const root        = document.documentElement;

    /* 1. Lire la préférence sauvegardée, sinon respecter le système */
    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    /* 2. Appliquer le thème sur <html data-theme="..."> */
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    /* 3. Appliquer immédiatement (avant le premier rendu) */
    applyTheme(getPreferredTheme());

    /* 4. Brancher le bouton toggle une fois le DOM prêt */
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            const current = root.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });

        /* 5. Suivre les changements du thème système en temps réel */
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', function (e) {
                /* Ne réagir que si l'utilisateur n'a pas de préférence sauvegardée */
                if (!localStorage.getItem(STORAGE_KEY)) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
    });
})();

/* --- Mode kiosk (tablette murale) --- */
function initKiosk() {
    const btn  = document.getElementById('kiosk-toggle');
    const body = document.body;
    const KEY  = 'homelab-kiosk';

    /* Restaurer l'état sauvegardé */
    if (localStorage.getItem(KEY) === 'true') {
        body.classList.add('kiosk-mode');
    }

    if (!btn) return;

    btn.addEventListener('click', function () {
        const isKiosk = body.classList.toggle('kiosk-mode');
        localStorage.setItem(KEY, isKiosk);
        btn.setAttribute('title', isKiosk ? 'Quitter le mode tablette' : 'Mode tablette murale');
    });
}