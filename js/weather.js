/* ============================================================
   weather.js — Widget météo enrichi
   API : Open-Meteo (gratuite, sans clé, sans inscription)
   Données : température, ressenti, vent, humidité, condition
============================================================ */

/* --- Correspondance codes météo WMO → description + emoji SVG --- */
const WEATHER_CONDITIONS = {
    0:  { label: 'Ciel dégagé',          icon: 'sun' },
    1:  { label: 'Principalement clair',  icon: 'sun-cloud' },
    2:  { label: 'Partiellement nuageux', icon: 'cloud-sun' },
    3:  { label: 'Couvert',               icon: 'cloud' },
    45: { label: 'Brouillard',            icon: 'fog' },
    48: { label: 'Brouillard givrant',    icon: 'fog' },
    51: { label: 'Bruine légère',         icon: 'drizzle' },
    53: { label: 'Bruine modérée',        icon: 'drizzle' },
    55: { label: 'Bruine dense',          icon: 'drizzle' },
    61: { label: 'Pluie légère',          icon: 'rain' },
    63: { label: 'Pluie modérée',         icon: 'rain' },
    65: { label: 'Pluie forte',           icon: 'rain-heavy' },
    71: { label: 'Neige légère',          icon: 'snow' },
    73: { label: 'Neige modérée',         icon: 'snow' },
    75: { label: 'Neige forte',           icon: 'snow' },
    80: { label: 'Averses légères',       icon: 'rain' },
    81: { label: 'Averses modérées',      icon: 'rain' },
    82: { label: 'Averses violentes',     icon: 'rain-heavy' },
    95: { label: 'Orage',                 icon: 'storm' },
    96: { label: 'Orage avec grêle',      icon: 'storm' },
    99: { label: 'Orage violent',         icon: 'storm' },
};

/* --- Icônes SVG inline par condition --- */
const WEATHER_ICONS = {
    'sun': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="2"  x2="12" y2="4"/>
        <line x1="12" y1="20" x2="12" y2="22"/>
        <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="2"  y1="12" x2="4"  y2="12"/>
        <line x1="20" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>`,
    'sun-cloud': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M17 12a5 5 0 0 0-9.9-1A4 4 0 1 0 8 19h9a3 3 0 0 0 0-6z"/>
    </svg>`,
    'cloud-sun': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
        <line x1="8" y1="16" x2="8.01" y2="16"/>
        <line x1="8" y1="20" x2="20" y2="20"/>
        <line x1="20" y1="16" x2="20.01" y2="16"/>
    </svg>`,
    'cloud': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
    </svg>`,
    'fog': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <path d="M5 5h3m4 0h9M3 10h11m4 0h1M5 15h5m4 0h7M3 20h9m4 0h3"/>
    </svg>`,
    'drizzle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <path d="M8 19v2M12 17v2M16 19v2"/>
        <path d="M17.5 14H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
    </svg>`,
    'rain': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <line x1="8"  y1="19" x2="8"  y2="21"/>
        <line x1="12" y1="17" x2="12" y2="19"/>
        <line x1="16" y1="19" x2="16" y2="21"/>
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
    </svg>`,
    'rain-heavy': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <line x1="8"  y1="19" x2="6"  y2="23"/>
        <line x1="12" y1="19" x2="10" y2="23"/>
        <line x1="16" y1="19" x2="14" y2="23"/>
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
    </svg>`,
    'snow': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
        <line x1="8"  y1="16" x2="8"  y2="20"/>
        <line x1="8"  y1="20" x2="6"  y2="18"/>
        <line x1="8"  y1="20" x2="10" y2="18"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="12" y1="23" x2="10" y2="21"/>
        <line x1="12" y1="23" x2="14" y2="21"/>
        <line x1="16" y1="16" x2="16" y2="20"/>
        <line x1="16" y1="20" x2="14" y2="18"/>
        <line x1="16" y1="20" x2="18" y2="18"/>
    </svg>`,
    'storm': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/>
        <polyline points="13 11 9 17 15 17 11 23"/>
    </svg>`,
};

/* --- Direction du vent en texte --- */
function getWindDirection(degrees) {
    const dirs = ['N','NE','E','SE','S','SO','O','NO'];
    return dirs[Math.round(degrees / 45) % 8];
}

/* --- Construction du HTML du widget --- */
function buildWeatherHTML(data) {
    const current  = data.current_weather;
    const hourly   = data.hourly;

    const temp      = Math.round(current.temperature);
    const wind      = Math.round(current.windspeed);
    const windDir   = getWindDirection(current.winddirection);
    const code      = current.weathercode;
    const condition = WEATHER_CONDITIONS[code] || { label: 'Variable', icon: 'cloud' };
    const icon      = WEATHER_ICONS[condition.icon] || WEATHER_ICONS['cloud'];

    /* Humidité et ressenti : pris dans hourly à l'heure courante */
    const currentHour = new Date().getHours();
    const humidity    = hourly?.relativehumidity_2m?.[currentHour] ?? '—';
    const feelsLike   = hourly?.apparent_temperature?.[currentHour] != null
        ? Math.round(hourly.apparent_temperature[currentHour])
        : null;

    const city = (typeof CONFIG !== 'undefined') ? CONFIG.location.label : 'Météo';

    return `
        <span class="weather-icon" style="color: var(--color-accent); display:flex; align-items:center;">${icon}</span>
        <span class="weather-city">${city}</span>
        <span class="weather-temp">${temp}°C</span>
        <span class="weather-sep">·</span>
        <span class="weather-desc">${condition.label}</span>
        <span class="weather-sep">·</span>
        <span class="weather-detail" title="Température ressentie">
            ${feelsLike !== null ? `Ressenti ${feelsLike}°` : ''}
        </span>
        <span class="weather-sep">${feelsLike !== null ? '·' : ''}</span>
        <span class="weather-detail" title="Humidité relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13" style="vertical-align:middle;">
                <path d="M12 2C6 9 4 13.5 4 16a8 8 0 0 0 16 0c0-2.5-2-7-8-14z"/>
            </svg>
            ${humidity}%
        </span>
        <span class="weather-sep">·</span>
        <span class="weather-detail" title="Vent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13" style="vertical-align:middle;">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
            </svg>
            ${wind} km/h ${windDir}
        </span>
    `;
}

/* --- Récupération et affichage --- */
async function getWeather() {
    const widget = document.getElementById('weather-widget');
    if (!widget) return;

    const { lat, lon } = CONFIG.location;
    const url = [
        'https://api.open-meteo.com/v1/forecast',
        `?latitude=${lat}&longitude=${lon}`,
        '&current_weather=true',
        '&hourly=relativehumidity_2m,apparent_temperature',
        '&timezone=auto',
        '&forecast_days=1',
    ].join('');

    try {
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        widget.innerHTML = buildWeatherHTML(data);
    } catch (err) {
        widget.innerHTML = '<span class="weather-loading">Météo indisponible</span>';
        console.warn('[weather.js] Erreur :', err.message);
    }
}

/* --- Export pour main.js --- */
function initWeather() {
    getWeather();
    setInterval(getWeather, CONFIG.refresh.weather);
}