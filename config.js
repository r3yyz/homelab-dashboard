// ============================================================
//  config.js — Configuration du HomeLab Dashboard
//  ⚠️  CE FICHIER EST DANS .gitignore — ne jamais partager
// ============================================================

const CONFIG = {

    // --- Localisation météo ---
    location: {
        lat:   47.89,
        lon:   1.83,
        label: 'Orléans',
    },

    // --- Intervalles de rafraîchissement (ms) ---
    refresh: {
        weather:  15 * 60 * 1000,  // 15 min
        services: 30 * 1000,        // 30 sec
        proxmox:  15 * 1000,        // 15 sec
        adguard:  60 * 1000,        // 1 min
    },

    // --- Services réseau ---
    // Champs : url (test ping), href (lien), dotId, icon, name, description
    services: [
        { url: 'https://192.168.20.254',                          href: 'http://192.168.20.254',           dotId: 'dot-opnsense',  icon: 'shield',   name: 'OPNSense',   description: 'Pare-feu / Routage / VPN' },
        { url: 'https://192.168.20.212:8006',                     href: 'https://192.168.20.212:8006',     dotId: 'dot-proxmox',   icon: 'server',   name: 'Proxmox',    description: 'Virtualisation'           },
        { url: 'http://dns.lystria.fr',                           href: 'http://dns.lystria.fr',           dotId: 'dot-adguard',   icon: 'block',    name: 'AdGuard',    description: 'DNS / Blocage pub'        },
        { url: 'http://cloud.lystria.fr',                         href: 'http://cloud.lystria.fr',         dotId: 'dot-nextcloud', icon: 'cloud',    name: 'Nextcloud',  description: 'Stockage Cloud'          },
        { url: 'https://192.168.20.215',                          href: 'http://192.168.20.215',           dotId: 'dot-nginx',     icon: 'globe',    name: 'Nginx',      description: 'Reverse Proxy'           },
    ],

    // --- Proxmox (mettre enabled: false pour désactiver le widget) ---
    proxmox: {
        enabled:  true,
        host:     'https://192.168.20.212:8006',
        node:     'pve',
        tokenId:  'root@pam!dashboard-pve',
        token:    'cf382365-bc7d-4747-a0ea-2d029f88ba8f',
    },

    // --- AdGuard Home ---
    adguard: {
        enabled:  true,
        host:     'http://192.168.20.213',
        user:     'admin',
        password: '...',
    },
};