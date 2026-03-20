/* theme.js — Thème clair/sombre + mode kiosk. Chargé avant le DOM. */

(function () {
    const KEY_THEME = 'hl-theme';
    const KEY_KIOSK = 'hl-kiosk';
    const root = document.documentElement;

    function prefersDark() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(KEY_THEME, theme);
    }

    /* Appliquer immédiatement avant le premier rendu */
    const saved = localStorage.getItem(KEY_THEME);
    applyTheme(saved === 'light' || saved === 'dark' ? saved : (prefersDark() ? 'dark' : 'light'));

    /* Appliquer kiosk dès que body existe */
    document.addEventListener('DOMContentLoaded', function () {
        if (localStorage.getItem(KEY_KIOSK) === 'true') {
            document.body.classList.add('kiosk');
        }
    });

    /* Init des boutons — appelée par main.js */
    window.initTheme = function () {
        const btnTheme = document.getElementById('theme-toggle');
        const btnKiosk = document.getElementById('kiosk-toggle');
        const body     = document.body;

        if (btnTheme) {
            btnTheme.addEventListener('click', () => {
                applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
            });
        }

        /* Écouter les changements système si pas de préférence sauvegardée */
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem(KEY_THEME)) applyTheme(e.matches ? 'dark' : 'light');
        });

        if (btnKiosk) {
            btnKiosk.addEventListener('click', toggleKiosk);
        }

        /* Touche K pour sortir/entrer en kiosk */
        document.addEventListener('keydown', e => {
            if ((e.key === 'k' || e.key === 'K') && !e.ctrlKey && !e.metaKey) {
                toggleKiosk();
            }
        });

        /* Triple-tap sur l'horloge → sortir du kiosk (usage tablette) */
        let tapCount = 0, tapTimer;
        const clock = document.getElementById('clock');
        if (clock) {
            clock.addEventListener('click', () => {
                tapCount++;
                clearTimeout(tapTimer);
                tapTimer = setTimeout(() => { tapCount = 0; }, 600);
                if (tapCount >= 3) { tapCount = 0; if (body.classList.contains('kiosk')) toggleKiosk(); }
            });
        }

        function toggleKiosk() {
            const on = body.classList.toggle('kiosk');
            localStorage.setItem(KEY_KIOSK, on);
            if (btnKiosk) btnKiosk.setAttribute('title', on ? 'Quitter le mode kiosk (K)' : 'Mode tablette murale (K)');
        }
    };
})();