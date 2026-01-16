// Update time every minute
function updateTime() {
    const now = new Date();
    const kievTime = now.toLocaleString('en-GB', {
        timeZone: 'Europe/Kiev',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    const [hours, minutes] = kievTime.split(':');
    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// --- Weather: Odesa region (using open-meteo.com, no API key required) ---

const ODESA_COORDS = {
    latitude: 46.48,
    longitude: 30.73
};

function mapWeatherCodeToText(code) {
    // Open-Meteo weather codes
    if ([0].includes(code)) return 'Ясно';
    if ([1, 2].includes(code)) return 'Переменная облачность';
    if ([3].includes(code)) return 'Пасмурно';
    if ([45, 48].includes(code)) return 'Туман';
    if ([51, 53, 55].includes(code)) return 'Морось';
    if ([61, 63, 65].includes(code)) return 'Дождь';
    if ([66, 67].includes(code)) return 'Ледяной дождь';
    if ([71, 73, 75, 77].includes(code)) return 'Снег';
    if ([80, 81, 82].includes(code)) return 'Ливень';
    if ([95, 96, 99].includes(code)) return 'Гроза';
    return 'Неизвестно';
}

async function updateWeather() {
    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-cond');
    const locEl = document.getElementById('weather-loc');
    if (!tempEl || !condEl || !locEl) return;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${ODESA_COORDS.latitude}&longitude=${ODESA_COORDS.longitude}&current_weather=true&timezone=Europe%2FKiev`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
        const data = await res.json();
        const current = data.current_weather;
        tempEl.textContent = `${Math.round(current.temperature)}°`;
        condEl.textContent = mapWeatherCodeToText(current.weathercode);
        locEl.textContent = 'Odesa region, UA';
    } catch (e) {
        condEl.textContent = 'Не удалось загрузить погоду';
    }
}

// Initialize time & weather on load
updateTime();
updateWeather();

// Update time every minute, weather каждые 10 минут
setInterval(updateTime, 60000);
setInterval(updateWeather, 10 * 60 * 1000);

// Action button click handler - плавная прокрутка вниз
(function() {
    let bottomSectionUnlocked = false;
    let preventScrollHandler = null;
    
    function initActionButton() {
        const actionButton = document.querySelector('.action-button');
        const bottomSection = document.getElementById('bottom-section');
        const body = document.body;
        const html = document.documentElement;
        
        if (!actionButton) {
            console.error('Кнопка не найдена!');
            return;
        }
        
        if (!bottomSection) {
            console.error('Нижняя секция не найдена!');
            return;
        }
        
        console.log('Инициализация кнопки...');
        
        // Убеждаемся, что кнопка кликабельна
        actionButton.style.pointerEvents = 'auto';
        actionButton.style.zIndex = '1000';
        actionButton.style.cursor = 'pointer';
        actionButton.style.position = 'fixed';
        
        // Блокируем прокрутку вниз до клика
        preventScrollHandler = function(e) {
            if (bottomSectionUnlocked) return;
            
            const scrollTop = window.pageYOffset || html.scrollTop || body.scrollTop;
            const scrollHeight = html.scrollHeight || body.scrollHeight;
            const clientHeight = html.clientHeight || window.innerHeight;
            const isScrollingDown = e.deltaY > 0;
            
            // Блокируем прокрутку вниз, если достигли конца видимой области
            if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 10) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        window.addEventListener('wheel', preventScrollHandler, { passive: false });
        
        // Обработчик клика на кнопку
        actionButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Кнопка нажата!');
            
            // Разблокируем нижнюю секцию
            bottomSectionUnlocked = true;
            
            // Удаляем блокировку прокрутки
            if (preventScrollHandler) {
                window.removeEventListener('wheel', preventScrollHandler);
            }
            
            // Показываем нижнюю секцию
            bottomSection.style.display = 'block';
            
            // Небольшая задержка для применения display: block
            setTimeout(function() {
                // Плавная прокрутка вниз
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        });
        
        // Тест кликабельности
        actionButton.addEventListener('mousedown', function() {
            console.log('Кнопка получила событие mousedown');
        });
        
        actionButton.addEventListener('mouseenter', function() {
            console.log('Курсор над кнопкой');
        });
        
        console.log('Кнопка инициализирована');
    }
    
    // Инициализируем обработчик после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initActionButton);
    } else {
        // DOM уже загружен - используем небольшую задержку
        setTimeout(initActionButton, 100);
    }
})();

// Modal window functionality
const modalOverlay = document.getElementById('modal-overlay');
const spotifyIcon = document.getElementById('spotify-icon');

function showModal() {
    if (modalOverlay) {
        modalOverlay.classList.add('active');
    }
}

function hideModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
}

// Spotify icon click handler
if (spotifyIcon) {
    spotifyIcon.addEventListener('click', function(e) {
        e.preventDefault();
        showModal();
    });
}

// Close modal on overlay click
if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });
}

// Connection icons hover effects
document.querySelectorAll('.connection-icon').forEach(icon => {
    if (icon.id !== 'spotify-icon') {
        icon.addEventListener('click', function() {
            // Add click functionality for connections
            console.log('Connection clicked');
        });
    }
});

// Discord presence (Lanyard)
const LANYARD_USER_ID = '826095966229889055';
let spotifyTickTimer = null;
let activityTickTimer = null;
let lastGameActivity = null;

function formatMs(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function clearSpotifyTick() {
    if (spotifyTickTimer) {
        clearInterval(spotifyTickTimer);
        spotifyTickTimer = null;
    }
}

function clearActivityTick() {
    if (activityTickTimer) {
        clearInterval(activityTickTimer);
        activityTickTimer = null;
    }
}

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderSpotifyActivity(spotify, timestamps) {
    const activityEl = document.getElementById('discord-activity');
    if (!activityEl) return;

    const start = timestamps?.start;
    const end = timestamps?.end;
    if (!start || !end) {
        activityEl.textContent = `🎵 Слушает: ${spotify.song} — ${spotify.artist}`;
        return;
    }

    activityEl.innerHTML = `
        <div class="spotify-activity">
            <img class="spotify-cover" src="${spotify.album_art_url}" alt="Cover">
            <div class="spotify-meta">
                <div class="spotify-title">${escapeHtml(spotify.song)}</div>
                <div class="spotify-artist">${escapeHtml(spotify.artist)}</div>
                <div class="spotify-progress"><div id="spotify-bar"></div></div>
                <div class="spotify-times">
                    <span id="spotify-now">0:00</span>
                    <span id="spotify-total">0:00</span>
                </div>
            </div>
        </div>
    `;

    const bar = document.getElementById('spotify-bar');
    const nowEl = document.getElementById('spotify-now');
    const totalEl = document.getElementById('spotify-total');
    if (!bar || !nowEl || !totalEl) return;

    const duration = end - start;
    totalEl.textContent = formatMs(duration);

    const tick = () => {
        const t = Date.now();
        const pos = Math.min(Math.max(0, t - start), duration);
        const pct = duration > 0 ? (pos / duration) * 100 : 0;
        bar.style.width = `${pct}%`;
        nowEl.textContent = formatMs(pos);
    };

    clearSpotifyTick();
    clearActivityTick();
    tick();
    spotifyTickTimer = setInterval(tick, 1000);
}

function discordAssetUrl(applicationId, image) {
    if (!applicationId || !image) return null;
    // mp:external/... → media proxy
    if (image.startsWith('mp:')) {
        const path = image.slice(3); // remove "mp:"
        return `https://media.discordapp.net/${path}`;
    }
    // Regular app-assets (usually hashes or asset names)
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
}

function renderGameActivity(activity) {
    const activityEl = document.getElementById('discord-activity');
    if (!activityEl) return;

    const name = activity?.name || 'Игра';
    const details = activity?.details || activity?.state || '';
    const appId = activity?.application_id;
    const large = discordAssetUrl(appId, activity?.assets?.large_image);
    const small = discordAssetUrl(appId, activity?.assets?.small_image);
    const start = activity?.timestamps?.start;

    activityEl.innerHTML = `
        <div class="game-activity">
            <div class="game-art-wrap">
                <img class="game-cover" src="${large || ''}" alt="Game">
                ${small ? `<img class="game-badge" src="${small}" alt="">` : ''}
            </div>
            <div class="game-meta">
                <div class="game-title">${escapeHtml(name)}</div>
                ${details ? `<div class="game-sub">${escapeHtml(details)}</div>` : `<div class="game-sub">В игре</div>`}
                <div class="game-time" id="game-time">${start ? '0:00' : ''}</div>
            </div>
        </div>
    `;

    // If we don't have images, keep layout but avoid broken icon
    const cover = activityEl.querySelector('.game-cover');
    if (cover && !large) {
        cover.style.display = 'none';
    }

    clearSpotifyTick();
    clearActivityTick();

    if (!start) return;
    const timeEl = document.getElementById('game-time');
    if (!timeEl) return;

    const tick = () => {
        timeEl.textContent = `⏱ ${formatMs(Date.now() - start)}`;
    };
    tick();
    activityTickTimer = setInterval(tick, 1000);
}

function buildGamePreviewHtml(activity) {
    const name = activity?.name || 'Игра';
    const details = activity?.details || activity?.state || '';
    const appId = activity?.application_id;
    const large = discordAssetUrl(appId, activity?.assets?.large_image);
    const small = discordAssetUrl(appId, activity?.assets?.small_image);

    return `
        <div class="game-activity game-activity--secondary">
            <div class="game-art-wrap">
                <img class="game-cover" src="${large || ''}" alt="Game">
                ${small ? `<img class="game-badge" src="${small}" alt="">` : ''}
            </div>
            <div class="game-meta">
                <div class="game-title">${escapeHtml(name)}</div>
                ${details ? `<div class="game-sub">${escapeHtml(details)}</div>` : `<div class="game-sub">В игре</div>`}
                <div class="game-time discord-activity-secondary">Предыдущая активность</div>
            </div>
        </div>
    `;
}

function setPresenceDot(status) {
    const dot = document.getElementById('presence-dot');
    if (!dot) return;

    const safe = ['online', 'idle', 'dnd', 'offline'].includes(status) ? status : 'offline';
    dot.classList.remove('status-dot--online', 'status-dot--idle', 'status-dot--dnd', 'status-dot--offline');
    dot.classList.add(`status-dot--${safe}`);
    dot.title = `Discord: ${safe}`;
}

async function updateDiscordPresence() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${LANYARD_USER_ID}`);
        if (!response.ok) throw new Error(`Lanyard HTTP ${response.status}`);
        const payload = await response.json();
        const data = payload?.data;
        const status = data?.discord_status ?? 'offline';
        setPresenceDot(status);

        // Activity text under bio
        const activityEl = document.getElementById('discord-activity');
        if (activityEl && data) {
            let text = '';
            const activities = data.activities || [];
            const currentGame = activities.find(a => a.type === 0);
            if (currentGame) {
                // сохраняем последнюю игровую активность
                lastGameActivity = currentGame;
            }

            if (data.listening_to_spotify && data.spotify) {
                renderSpotifyActivity(data.spotify, data.spotify?.timestamps || data.timestamps);

                // Предыдущая активность при Spotify — полноценная игровая карточка:
                // сначала пробуем текущую игру, если есть, иначе используем сохранённую последнюю
                const gamePrev = currentGame || lastGameActivity;
                if (gamePrev) {
                    activityEl.insertAdjacentHTML(
                        'beforeend',
                        buildGamePreviewHtml(gamePrev)
                    );
                }
                return;
            } else {
                clearSpotifyTick();
                clearActivityTick();
                const game = activities.find(a => a.type === 0);
                const custom = activities.find(a => a.type === 4 && a.state);

                if (game) {
                    renderGameActivity(game);

                    // Предыдущая активность: custom status, если есть
                    if (custom && custom !== game) {
                        const prevText = `Предыдущая активность: ${escapeHtml(custom.state)}`;
                        activityEl.insertAdjacentHTML(
                            'beforeend',
                            `<div class="discord-activity-secondary">${prevText}</div>`
                        );
                    }
                    return;
                } else if (!game && lastGameActivity) {
                    // Игра уже закрыта, но показываем последнюю игру как основную активность
                    // (без таймера, чтобы не считать время после выхода из игры)
                    const cached = { ...lastGameActivity, timestamps: null };
                    renderGameActivity(cached);
                    return;
                } else if (activities.length > 0) {
                    if (custom) {
                        text = `💬 ${escapeHtml(custom.state)}`;

                        // Попробуем показать ещё игру как предыдущую, если она есть в списке
                        const gameSecond = activities.find(a => a.type === 0);
                        if (gameSecond) {
                            const details = gameSecond.details || gameSecond.state || '';
                            const prevText = `Предыдущая активность: играл в ${escapeHtml(gameSecond.name)}${details ? ' — ' + escapeHtml(details) : ''}`;
                            activityEl.insertAdjacentHTML(
                                'beforeend',
                                `<div class="discord-activity-secondary">${prevText}</div>`
                            );
                        }
                    }
                }
            }

            if (!text) {
                const humanStatus = {
                    online: 'В сети',
                    idle: 'Неактивен',
                    dnd: 'Не беспокоить',
                    offline: 'Не в сети'
                }[status] || status;
                text = `⚫ Discord: ${humanStatus}`;
            }

            activityEl.textContent = text;
        }
    } catch (e) {
        // If request fails, assume offline and keep UI consistent
        setPresenceDot('offline');
        clearSpotifyTick();
        clearActivityTick();
        const activityEl = document.getElementById('discord-activity');
        if (activityEl) {
            activityEl.textContent = 'Не удалось загрузить Discord активность';
        }
    }
}

updateDiscordPresence();
setInterval(updateDiscordPresence, 10000);

// Randomize GTA flash timing
const gtaFlashLayer = document.querySelector('.gta-flash-layer');

function randomizeGtaFlashTiming() {
    if (!gtaFlashLayer) return;
    const duration = 4 + Math.random() * 6; // 4–10s
    const delay = Math.random() * 3;        // 0–3s
    gtaFlashLayer.style.animationDuration = `${duration}s`;
    gtaFlashLayer.style.animationDelay = `${delay}s`;
}

if (gtaFlashLayer) {
    randomizeGtaFlashTiming();
    gtaFlashLayer.addEventListener('animationiteration', randomizeGtaFlashTiming);
}
