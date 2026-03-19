// ============================================================
//  config.js — Votre configuration personnelle
//  ⚠️  CE FICHIER EST DANS .gitignore — ne pas partager
// ============================================================

const CONFIG = {

    location: {
        lat:   47.89,
        lon:   1.83,
        label: "Orléans",
    },

    refresh: {
        weather:  15 * 60 * 1000,
        services: 30 * 1000,
    },

    services: [
        {
            url:         "https://192.168.20.254",
            href:        "http://192.168.1.1",
            dotId:       "dot-opnsense",
            icon:        "shield",
            name:        "OPNSense",
            description: "Pare-feu / Routage / VPN",
        },
        {
            url:         "https://192.168.20.212:8006",
            href:        "https://192.168.1.100:8006",
            dotId:       "dot-proxmox",
            icon:        "server",
            name:        "Proxmox",
            description: "Virtualisation",
        },
        {
            url:         "http://192.168.20.213",
            href:        "http://192.168.1.50",
            dotId:       "dot-adguard",
            icon:        "block",
            name:        "AdGuard",
            description: "DNS / Blocage Pub",
        },
        {
            url:         "http://192.168.20.214/index.php/apps/dashboard/",
            href:        "https://nextcloud.lystria.fr",
            dotId:       "dot-nextcloud",
            icon:        "cloud",
            name:        "Nextcloud",
            description: "Stockage Cloud",
        },
        {
            url:         "https://192.168.20.215",
            href:        "http://192.168.1.20",
            dotId:       "dot-nginx",
            icon:        "globe",
            name:        "Nginx",
            description: "Reverse Proxy",
        },
    ],
};