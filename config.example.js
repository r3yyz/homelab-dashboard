// ============================================================
//  config.example.js — Modèle de configuration
//  Copiez ce fichier en "config.js" et remplissez vos valeurs.
//  Ce fichier peut être partagé sur GitHub sans risque.
// ============================================================

const CONFIG = {

    // --- Localisation météo ---
    location: {
        lat:   48.85,           // Latitude (ex: Paris)
        lon:   2.35,            // Longitude
        label: "Ma Ville",      // Nom affiché dans le widget
    },

    // --- Intervalles de rafraîchissement ---
    refresh: {
        weather:  15 * 60 * 1000,   // Météo : toutes les 15 min
        services: 30 * 1000,         // Services : toutes les 30 sec
    },

    // --- Services du HomeLab ---
    // url      : adresse utilisée pour le test de disponibilité
    // href     : adresse du lien cliquable sur le dashboard
    // dotId    : identifiant unique du point de statut (doit être unique)
    // icon     : emoji ou chemin vers une icône SVG dans assets/icons/
    // name     : nom affiché
    // description : sous-titre de la carte
    services: [
        {
            url:         "https://192.168.X.X",
            href:        "https://192.168.X.X",
            dotId:       "dot-firewall",
            icon:        "shield",
            name:        "Pare-feu",
            description: "Routage / VPN",
        },
        {
            url:         "https://192.168.X.X:8006",
            href:        "https://192.168.X.X:8006",
            dotId:       "dot-hyperviseur",
            icon:        "server",
            name:        "Hyperviseur",
            description: "Virtualisation",
        },
        // Ajoutez vos services ici...
    ],
};