/* weather.js — Widget météo enrichi. Dépend de ICONS (icons.js). */

const WEATHER_MAP = {
    0:  { label: 'Ciel dégagé' },          1:  { label: 'Principalement clair' },
    2:  { label: 'Partiellement nuageux' }, 3:  { label: 'Couvert' },
    45: { label: 'Brouillard' },            48: { label: 'Brouillard givrant' },
    51: { label: 'Bruine légère' },         53: { label: 'Bruine' },
    61: { label: 'Pluie légère' },          63: { label: 'Pluie' },
    65: { label: 'Pluie forte' },           71: { label: 'Neige légère' },
    73: { label: 'Neige' },                 75: { label: 'Neige forte' },
    80: { label: 'Averses légères' },       81: { label: 'Averses' },
    82: { label: 'Averses violentes' },     95: { label: 'Orage' },
    96: { label: 'Orage avec grêle' },      99: { label: 'Orage violent' },
};

function windDir(deg) {
    return ['N','NE','E','SE','S','SO','O','NO'][Math.round(deg / 45) % 8];
}

window.initWeather = function () {
    async function fetch_weather() {
        const widget = document.getElementById('weather-widget');
        if (!widget) return;

        const { lat, lon, label } = CONFIG.location;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
            + `&current_weather=true&hourly=relativehumidity_2m,apparent_temperature`
            + `&timezone=auto&forecast_days=1`;

        try {
            const res  = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const cw   = data.current_weather;
            const h    = new Date().getHours();

            const temp    = Math.round(cw.temperature);
            const wind    = Math.round(cw.windspeed);
            const dir     = windDir(cw.winddirection);
            const hum     = data.hourly?.relativehumidity_2m?.[h] ?? '—';
            const feel    = data.hourly?.apparent_temperature?.[h] != null
                ? Math.round(data.hourly.apparent_temperature[h]) : null;
            const cond    = WEATHER_MAP[cw.weathercode]?.label || 'Variable';

            widget.innerHTML = `
                <span class="w-city">${label}</span>
                <span class="w-temp">${temp}°C</span>
                <span class="w-sep">·</span>
                <span class="w-desc">${cond}</span>
                <span class="w-sep">·</span>
                ${feel !== null ? `<span class="w-detail">Ressenti ${feel}°</span><span class="w-sep">·</span>` : ''}
                <span class="w-detail">${ICONS.get('droplet', 13)} ${hum}%</span>
                <span class="w-sep">·</span>
                <span class="w-detail">${ICONS.get('wind', 13)} ${wind} km/h ${dir}</span>`;
        } catch (err) {
            widget.innerHTML = `<span class="w-desc" style="color:var(--text-3)">Météo indisponible</span>`;
            console.warn('[weather]', err.message);
        }
    }

    fetch_weather();
    setInterval(fetch_weather, CONFIG.refresh.weather);
};