/* ============================================================
   main.js — Point d'entrée principal
   Orchestre l'initialisation de tous les modules.
   Ce fichier est chargé EN DERNIER dans index.html.
============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* Vérification de sécurité : CONFIG doit être chargé */
    if (typeof CONFIG === 'undefined') {
        console.error('[main.js] config.js est introuvable ou mal chargé.');
        return;
    }

    /* --- Initialisation des modules --- */
    initClock();      /* clock.js    */
    initWeather();    /* weather.js  */
    initServices();   /* services.js */
    initKiosk();      /* theme.js    */

    console.info('[HomeLab] Dashboard initialisé avec', CONFIG.services.length, 'service(s).');
});