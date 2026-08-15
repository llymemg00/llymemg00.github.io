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

// Отключение прокрутки колесом мыши (только на десктопе, на мобильных разрешена)
(function() {
    // Проверяем, является ли устройство мобильным
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.innerWidth <= 768);
    }
    
    // Если это мобильное устройство, не отключаем прокрутку
    if (isMobileDevice()) {
        return;
    }
    
    function preventWheelScroll(e) {
        e.preventDefault();
    }
    
    // Отключаем прокрутку колесом мыши только на десктопе
    document.addEventListener('wheel', preventWheelScroll, { passive: false });
    
    // Также отключаем прокрутку через клавиатуру (стрелки, Page Up/Down) только на десктопе
    document.addEventListener('keydown', function(e) {
        if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
    });
})();

// Action button click handler - переключение между верхней и нижней секциями
(function() {
    let currentSection = 'top'; // 'top' или 'bottom'
    
    function initActionButtons() {
        const topActionButton = document.querySelector('.action-button:not(.action-button-bottom)');
        const bottomActionButton = document.querySelector('.action-button-bottom');
        const topSection = document.getElementById('top-section');
        const bottomSection = document.getElementById('bottom-section');
        
        if (!topActionButton) {
            console.error('Верхняя кнопка не найдена!');
            return;
        }
        
        if (!topSection || !bottomSection) {
            console.error('Секции не найдены!');
            return;
        }
        
        // Настройка кнопок
        function setupButton(button, svg) {
            if (button && svg) {
                button.style.pointerEvents = 'auto';
                button.style.zIndex = '1000';
                button.style.cursor = 'pointer';
                button.style.position = 'fixed';
            }
        }
        
        const topSvg = topActionButton?.querySelector('svg');
        const bottomSvg = bottomActionButton?.querySelector('svg');
        
        setupButton(topActionButton, topSvg);
        if (bottomActionButton && bottomSvg) {
            setupButton(bottomActionButton, bottomSvg);
        }
        
        // Иконка для верхней кнопки (вниз)
        if (topSvg) {
            topActionButton.title = 'Вниз';
        }
        
        // Иконка для нижней кнопки (вверх)
        if (bottomSvg) {
            bottomActionButton.title = 'Наверх';
        }
        
        // Функция переключения на нижнюю секцию (из верхней кнопки)
        function showBottomSection() {
            currentSection = 'bottom';
            topSection.style.display = 'none';
            bottomSection.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'instant' });
            setTimeout(() => {
                bottomSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 10);
        }
        
        // Функция переключения на верхнюю секцию (из нижней кнопки)
        function showTopSection() {
            currentSection = 'top';
            bottomSection.style.display = 'none';
            topSection.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'instant' });
            setTimeout(() => {
                topSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 10);
        }
        
        // Функция для запуска анимации кнопки
        function animateButton(svg) {
            if (!svg) return;
            svg.classList.remove('animate-rotate');
            // Небольшая задержка для перезапуска анимации
            setTimeout(() => {
                svg.classList.add('animate-rotate');
            }, 10);
        }
        
        // Обработчик клика для верхней кнопки (вниз)
        topActionButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (currentSection === 'top') {
                animateButton(topSvg);
                showBottomSection();
            }
        });
        
        // Обработчик клика для нижней кнопки (вверх)
        if (bottomActionButton) {
            bottomActionButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (currentSection === 'bottom') {
                    animateButton(bottomSvg);
                    showTopSection();
                }
            });
        }
        
        // Обработчики для touch устройств
        topActionButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (currentSection === 'top') {
                animateButton(topSvg);
                showBottomSection();
            }
        }, { passive: false });
        
        if (bottomActionButton) {
            bottomActionButton.addEventListener('touchstart', function(e) {
                e.preventDefault();
                if (currentSection === 'bottom') {
                    animateButton(bottomSvg);
                    showTopSection();
                }
            }, { passive: false });
        }
        
        // Изначально показываем только верхнюю секцию
        topSection.style.display = 'block';
        bottomSection.style.display = 'none';
        
        console.log('Кнопки инициализированы');
    }
    
    // Инициализируем обработчики после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initActionButtons);
    } else {
        setTimeout(initActionButtons, 100);
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

// Spotify icon click handler - removed, now opens Spotify link directly

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

// Minesweeper
(function initMinesweeper() {
    const LEVELS = {
        medium: { rows: 12, cols: 12, mines: 25 },
        hard: { rows: 16, cols: 16, mines: 50 }
    };

    const boardEl = document.getElementById('minesweeper-board');
    const rootEl = document.getElementById('minesweeper');
    const resetBtn = document.getElementById('minesweeper-reset');
    const flagModeBtn = document.getElementById('minesweeper-flag-mode');
    const mineCountEl = document.getElementById('mine-count');
    const timerEl = document.getElementById('mine-timer');
    const statusEl = document.getElementById('minesweeper-status');
    const titleEl = document.getElementById('minesweeper-title');
    const levelsEl = document.getElementById('minesweeper-levels');
    const levelButtons = document.querySelectorAll('.minesweeper-level');

    if (!boardEl || !rootEl || !resetBtn || !flagModeBtn || !mineCountEl || !timerEl || !statusEl) {
        return;
    }

    let rows = LEVELS.medium.rows;
    let cols = LEVELS.medium.cols;
    let mineTotal = LEVELS.medium.mines;
    let currentLevel = 'medium';

    let mines = [];
    let revealed = [];
    let flagged = [];
    let gameOver = false;
    let gameStarted = false;
    let flagMode = false;
    let timerId = null;
    let seconds = 0;

    function createMatrix(value) {
        return Array.from({ length: rows }, () => Array(cols).fill(value));
    }

    function inBounds(row, col) {
        return row >= 0 && row < rows && col >= 0 && col < cols;
    }

    function neighbors(row, col) {
        const list = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (inBounds(nr, nc)) list.push([nr, nc]);
            }
        }
        return list;
    }

    function stopTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    function startTimer() {
        if (timerId) return;
        timerId = setInterval(() => {
            seconds += 1;
            timerEl.textContent = String(seconds);
        }, 1000);
    }

    function updateMineCount() {
        const flags = flagged.flat().filter(Boolean).length;
        mineCountEl.textContent = String(Math.max(0, mineTotal - flags));
    }

    function applyBoardLayout() {
        boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        rootEl.style.maxWidth = `${Math.min(560, cols * 28 + 24)}px`;
    }

    function updateLevelButtons() {
        levelButtons.forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.level === currentLevel);
        });
    }

    function setLevel(level) {
        const config = LEVELS[level];
        if (!config) return;

        currentLevel = level;
        rows = config.rows;
        cols = config.cols;
        mineTotal = config.mines;
        applyBoardLayout();
        updateLevelButtons();
        resetGame();
    }

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function setResetState(state) {
        resetBtn.dataset.state = state;
    }

    function setGameState(won, lost) {
        rootEl.classList.toggle('minesweeper--won', won);
        rootEl.classList.toggle('minesweeper--lost', lost);
    }

    function placeMines(safeRow, safeCol) {
        mines = createMatrix(false);
        const safeZone = new Set([`${safeRow},${safeCol}`]);
        neighbors(safeRow, safeCol).forEach(([r, c]) => safeZone.add(`${r},${c}`));

        let placed = 0;
        while (placed < mineTotal) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            if (safeZone.has(`${row},${col}`) || mines[row][col]) continue;
            mines[row][col] = true;
            placed += 1;
        }
    }

    function countAdjacentMines(row, col) {
        return neighbors(row, col).reduce((sum, [r, c]) => sum + (mines[r][c] ? 1 : 0), 0);
    }

    function revealAllMines(hitRow, hitCol) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!mines[row][col]) continue;
                revealed[row][col] = true;
                const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (!cell) continue;
                cell.classList.add('mine-cell--revealed', 'mine-cell--mine');
                if (row === hitRow && col === hitCol) {
                    cell.classList.add('mine-cell--mine-hit');
                }
                cell.textContent = '💣';
                cell.disabled = true;
            }
        }
    }

    function checkWin() {
        let hiddenSafe = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!mines[row][col] && !revealed[row][col]) hiddenSafe += 1;
            }
        }
        if (hiddenSafe === 0) {
            gameOver = true;
            stopTimer();
            setResetState('won');
            setGameState(true, false);
            setStatus('Победа! Все мины найдены.');
            boardEl.querySelectorAll('.mine-cell').forEach((cell) => {
                cell.disabled = true;
            });
        }
    }

    function revealCell(row, col) {
        if (gameOver || flagged[row][col] || revealed[row][col]) return;

        if (!gameStarted) {
            placeMines(row, col);
            gameStarted = true;
            startTimer();
            setStatus('');
        }

        revealed[row][col] = true;
        const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        if (mines[row][col]) {
            gameOver = true;
            stopTimer();
            setResetState('lost');
            setGameState(false, true);
            setStatus('Бум! Попробуй ещё раз.');
            revealAllMines(row, col);
            boardEl.querySelectorAll('.mine-cell').forEach((btn) => {
                btn.disabled = true;
            });
            return;
        }

        const count = countAdjacentMines(row, col);
        cell.classList.add('mine-cell--revealed');
        cell.disabled = true;

        if (count > 0) {
            cell.textContent = String(count);
            cell.classList.add(`mine-cell--n${count}`);
        } else {
            neighbors(row, col).forEach(([r, c]) => revealCell(r, c));
        }

        checkWin();
    }

    function toggleFlag(row, col) {
        if (gameOver || revealed[row][col]) return;

        flagged[row][col] = !flagged[row][col];
        const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        if (flagged[row][col]) {
            cell.textContent = '🚩';
            cell.classList.add('mine-cell--flagged');
        } else {
            cell.textContent = '';
            cell.classList.remove('mine-cell--flagged');
        }

        updateMineCount();
    }

    function handleCellAction(row, col, isFlagAction) {
        if (isFlagAction) {
            toggleFlag(row, col);
        } else {
            revealCell(row, col);
        }
    }

    function buildBoard() {
        boardEl.innerHTML = '';
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'mine-cell';
                cell.dataset.row = String(row);
                cell.dataset.col = String(col);
                cell.setAttribute('aria-label', `Клетка ${row + 1}, ${col + 1}`);

                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleCellAction(row, col, flagMode);
                });

                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleCellAction(row, col, true);
                });

                boardEl.appendChild(cell);
            }
        }
    }

    function resetGame() {
        stopTimer();
        mines = createMatrix(false);
        revealed = createMatrix(false);
        flagged = createMatrix(false);
        gameOver = false;
        gameStarted = false;
        flagMode = false;
        seconds = 0;

        timerEl.textContent = '0';
        mineCountEl.textContent = String(mineTotal);
        setResetState('idle');
        setStatus('');
        setGameState(false, false);

        flagModeBtn.setAttribute('aria-pressed', 'false');
        flagModeBtn.textContent = 'Флаг: выкл';

        buildBoard();
    }

    resetBtn.addEventListener('click', resetGame);

    flagModeBtn.addEventListener('click', () => {
        flagMode = !flagMode;
        flagModeBtn.setAttribute('aria-pressed', String(flagMode));
        flagModeBtn.textContent = flagMode ? 'Флаг: вкл' : 'Флаг: выкл';
    });

    boardEl.addEventListener('contextmenu', (e) => e.preventDefault());

    if (titleEl && levelsEl) {
        titleEl.addEventListener('click', () => {
            const isVisible = levelsEl.classList.toggle('is-visible');
            levelsEl.setAttribute('aria-hidden', String(!isVisible));
        });
    }

    levelButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const level = btn.dataset.level;
            if (level && level !== currentLevel) {
                setLevel(level);
            }
        });
    });

    applyBoardLayout();
    updateLevelButtons();
    resetGame();
})();
