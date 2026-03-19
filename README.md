# HomeLab Dashboard

Dashboard personnel pour monitorer les services d'un HomeLab depuis le navigateur.

## Fonctionnalités

- Horloge en temps réel
- Météo locale détaillée (température, vent, humidité)
- Statut en direct des services réseau
- Thème clair / sombre (avec mémorisation)
- Mode tablette murale (kiosk)

## Installation

```bash
git clone https://github.com/votre-pseudo/homelab-dashboard.git
cd homelab-dashboard
cp config.example.js config.js
```

Éditez ensuite `config.js` avec vos propres IPs et coordonnées GPS.

## Structure

```
homelab-dashboard/
├── index.html          # Point d'entrée
├── config.js           # ⚠️ Votre config (non versionné)
├── config.example.js   # Modèle de config (versionné)
├── .gitignore
├── css/
│   ├── variables.css   # Tokens de design (couleurs, espacements)
│   ├── base.css        # Styles globaux
│   ├── components.css  # Cartes, widgets, boutons
│   └── theme.css       # Thème clair / sombre
├── js/
│   ├── main.js         # Point d'entrée JS
│   ├── clock.js        # Horloge
│   ├── weather.js      # Widget météo
│   ├── services.js     # Statut des services
│   └── theme.js        # Toggle thème
└── assets/
    └── icons/          # Icônes SVG
```

## Configuration

Tous les paramètres sont dans `config.js` :

| Clé | Description |
|-----|-------------|
| `location.lat / lon` | Coordonnées pour la météo |
| `location.label` | Nom de la ville affiché |
| `refresh.weather` | Fréquence de mise à jour météo (ms) |
| `refresh.services` | Fréquence de test des services (ms) |
| `services[]` | Liste de vos services HomeLab |

## Technologies

- HTML5 / CSS3 / JavaScript vanilla (aucune dépendance)
- API météo : [Open-Meteo](https://open-meteo.com/) (gratuite, sans clé)