/* Game: owns the state machine, the score, the lives, the loop and the rendering.

   States:
     menu     --play-->               select    (character selection)
     select   --play-->               playing
     select   --back or Esc-->        menu
     playing  --no lives left-->      gameover
     playing  --course complete-->    victory   (banner over the frozen game)
     victory  --a few seconds-->      credits   (scrolling credits, can be skipped)
     credits  --end or skip-->        ending    (beach at sunset)
     gameover / ending --retry-->     playing
     gameover / ending --main menu--> menu
     menu     --gear-->               settings  --back-->    menu
     playing  --gear, P or Esc-->     paused    --resume-->  playing */
const board = document.querySelector('.game-board');
const canvas = document.querySelector('.game-canvas');
const ctx = canvas.getContext('2d');
const hud = document.querySelector('.hud');
const livesLabel = document.querySelector('.lives');
const scoreLabel = document.querySelector('.score');
const bestLabel = document.querySelector('.best');
const messageLabel = document.querySelector('.message');
const sceneLabel = document.querySelector('.scene-name');
const menuScreen = document.querySelector('.screen-menu');
const gameOverScreen = document.querySelector('.screen-gameover');
const victoryScreen = document.querySelector('.screen-victory');
const creditsScreen = document.querySelector('.screen-credits');
const endingScreen = document.querySelector('.screen-ending');
const settingsScreen = document.querySelector('.screen-settings');
const selectScreen = document.querySelector('.screen-select');
const gearButton = document.querySelector('.btn-gear');
const screens = [menuScreen, gameOverScreen, victoryScreen, creditsScreen, endingScreen, settingsScreen, selectScreen];

// Add ?debug to the URL to see the hitboxes.
const DEBUG = new URLSearchParams(location.search).has('debug');

const images = { scenes: [], obstacles: {} };
const world = { width: 0, height: 0 };   // canvas size in CSS px

/* Screen y where feet and obstacles rest. */
function getGroundY() {
    return world.height - CONFIG.scenery.groundOffset;
}

const game = {
    state: 'menu',
    score: 0,
    lives: CONFIG.player.lives,
    time: 0,             // seconds played in this run
    best: 0,             // best score of the current game mode
    gameOverTime: 0,     // seconds spent on the game over screen
    stateTime: 0,        // seconds spent in the current victory / credits / ending state
    credits: null,       // created when the credits start (see ending.js)
    beach: null,         // created when the beach scene starts
    player: createPlayer(),
    obstacles: createObstacles(),
    scenery: createScenery(),
};

/* ---------- state ---------- */

/* Everything that changes during a run is rebuilt here, so a new run
   can never inherit state from the previous one. */
function resetRun() {
    game.score = 0;
    game.lives = CONFIG.player.lives;
    game.time = 0;
    game.credits = null;
    game.beach = null;
    game.player = createPlayer();
    game.obstacles = createObstacles();
    game.scenery = createScenery();
    input.clear();
    updateHud();
}

function showMenu() {
    game.best = loadBest();
    resetRun();
    game.state = 'menu';
    document.querySelector('.menu-best').textContent = game.best;
    showScreen(menuScreen);
}

/* Character selection, between the menu and the game. */
function openCharacterSelect() {
    game.state = 'select';
    characterSelect.message = '';
    characterSelect.refresh();
    showScreen(selectScreen);
    characterSelect.focusSelected();
}

function startGame() {
    resetRun();
    game.state = 'playing';
    showScreen(null);
    showSceneName();
}

function endGame() {
    playSound('gameover');
    game.state = 'gameover';
    game.gameOverTime = 0;

    const isRecord = game.score > game.best;
    if (isRecord) {
        game.best = game.score;
        saveBest(game.best);
    }
    updateHud();

    document.querySelector('.final-score').textContent = game.score;
    document.querySelector('.final-best').textContent = game.best;
    document.querySelector('.final-time').textContent = Math.round(game.time);
    document.querySelector('.final-place').textContent = SCENES[game.scenery.index].name;
    document.querySelector('.new-record').hidden = !isRecord;
    showScreen(gameOverScreen);
}

/* Shows one full-board screen (or none) and hides the HUD behind it. */
function showScreen(screen) {
    for (const each of screens) each.hidden = each !== screen;
    // The gear is available on the menu and while playing.
    gearButton.hidden = screen !== null && screen !== menuScreen;
    hud.hidden = screen !== null;
    if (screen) sceneLabel.classList.remove('show');
    // A button that was just clicked keeps keyboard focus even after its
    // screen is hidden, and would swallow the next Space press.
    if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur();
}

/* ---------- victory, credits and ending ---------- */

/* Infinite mode has no finish line. */
function getWinScore() {
    return settings.mode === 'infinite' ? Infinity : CONFIG.campaign.obstaclesToWin;
}

/* 1 normally; grows with the score when "increasing difficulty" is on. */
function getSpeedFactor() {
    if (!settings.difficulty) return 1;
    return Math.min(1 + game.score * CONFIG.difficulty.perPoint, CONFIG.difficulty.maxFactor);
}

/* The course is complete: obstacles, score and timer stop here. */
function winGame() {
    playSound('win');
    roster.completeScene(game.scenery.index);   // the last scene counts as completed too
    game.state = 'victory';
    game.stateTime = 0;
    preloadEnding();

    if (game.score > game.best) {
        game.best = game.score;
        saveBest(game.best);
    }
    updateHud();
    for (const label of document.querySelectorAll('.win-score')) label.textContent = game.score;
    for (const label of document.querySelectorAll('.win-time')) label.textContent = Math.round(game.time);
    showScreen(victoryScreen);
}

/* Runs once per completed game: only the victory state leads here. */
function startCredits() {
    if (game.state !== 'victory') return;
    game.state = 'credits';
    game.stateTime = 0;
    game.credits = createCredits();
    showScreen(creditsScreen);
}

/* Reached when the credits end or are skipped. */
function startEnding() {
    if (game.state !== 'credits') return;
    game.state = 'ending';
    game.stateTime = 0;
    game.beach = createBeach();
    showScreen(endingScreen);
}

/* ---------- settings and pause ---------- */

/* The gear: settings from the menu, pause during the game. */
function openSettings() {
    if (game.state === 'playing') game.state = 'paused';
    else if (game.state === 'menu') game.state = 'settings';
    else return;
    refreshSettingsScreen();
    showScreen(settingsScreen);
}

function closeSettings() {
    if (game.state === 'paused') {
        game.state = 'playing';
        input.clear();
        showScreen(null);
    } else if (game.state === 'settings') {
        showMenu();   // also reloads the best score of the chosen mode
    }
}

function toggleSettings() {
    if (game.state === 'paused' || game.state === 'settings') closeSettings();
    else openSettings();
}

/* Writes the current choices (in the current language) on the screen. */
function refreshSettingsScreen() {
    const paused = game.state === 'paused';
    document.querySelector('.settings-title').textContent = i18n.t(paused ? 'paused' : 'settings');
    document.querySelector('.btn-resume').textContent = i18n.t(paused ? 'resume' : 'back');
    document.querySelector('.btn-settings-menu').hidden = !paused;
    document.querySelector('.settings-note').hidden = !paused;

    const setToggle = (selector, value, locked) => {
        const button = document.querySelector(selector);
        button.textContent = i18n.t(value ? 'on' : 'off');
        button.setAttribute('aria-pressed', String(value));
        button.disabled = locked;
    };
    setToggle('.opt-sound', settings.sound, false);
    // Changing the rules in the middle of a run would be unfair to the record.
    setToggle('.opt-difficulty', settings.difficulty, paused);
    for (const button of document.querySelectorAll('.opt-mode')) {
        button.setAttribute('aria-pressed', String(button.dataset.mode === settings.mode));
        button.disabled = paused;
    }
}

function changeSetting(change) {
    change();
    settings.save();
    refreshSettingsScreen();
}

/* ---------- input ---------- */

/* The delay stops a late jump press from acting on a screen that just appeared. */
function canLeaveGameOver() {
    return game.state === 'gameover' && game.gameOverTime >= CONFIG.restartDelay;
}

function canAct(state) {
    return game.state === state && game.stateTime >= CONFIG.restartDelay;
}

/* source is 'key' or 'pointer' (see input.js). */
function handlePress(source) {
    if (game.state === 'menu') openCharacterSelect();
    else if (canAct('victory')) startCredits();
    // On the screens below a tap must hit a button; only keys act directly.
    else if (source !== 'key') return;
    else if (canLeaveGameOver() || canAct('ending')) startGame();
    else if (canAct('credits')) startEnding();
}

/* Escape. */
function handleCancel() {
    if (canLeaveGameOver() || canAct('ending')) showMenu();
    else if (canAct('credits')) startEnding();
    else if (game.state === 'select') showMenu();
    else if (game.state === 'playing') openSettings();
    else closeSettings();
}

/* Names of the objects that may appear in the current scene. */
function getSceneObstacles() {
    return SCENES[game.scenery.index].obstacles || DEFAULT_OBSTACLES;
}

/* Flashes the name of the current place. */
function showSceneName() {
    sceneLabel.textContent = SCENES[game.scenery.index].name;
    sceneLabel.classList.remove('show');
    void sceneLabel.offsetWidth;   // restart the CSS animation
    sceneLabel.classList.add('show');
}

/* ---------- score ---------- */

function updateHud() {
    livesLabel.textContent = '♥'.repeat(game.lives) + '♡'.repeat(CONFIG.player.lives - game.lives);
    scoreLabel.textContent = game.score;
    bestLabel.textContent = game.best;
}

/* Each game mode keeps its own record. */
function bestStorageKey() {
    return settings.mode === 'infinite' ? `${CONFIG.storageKey}.infinite` : CONFIG.storageKey;
}

function loadBest() {
    try {
        return Number(localStorage.getItem(bestStorageKey())) || 0;
    } catch (error) {
        return 0;   // storage blocked (private mode, file:// in some browsers)
    }
}

function saveBest(value) {
    try {
        localStorage.setItem(bestStorageKey(), String(value));
    } catch (error) {
        /* not being able to save the record is not fatal */
    }
}

/* ---------- update ---------- */

function update(dt) {
    input.update(dt);

    // Paused or in the settings: nothing moves.
    if (game.state === 'paused' || game.state === 'settings') return;

    if (game.state === 'menu' || game.state === 'select') {
        game.player.animTime += dt;   // idle animation only
        return;
    }

    if (game.state === 'gameover') {
        game.gameOverTime += dt;      // everything stays frozen where it was
        updateScenery(game.scenery, dt, game.score, 0);   // only lets a fade finish
        return;
    }

    if (game.state === 'victory') {
        game.stateTime += dt;
        updatePlayer(game.player, dt, false, false);   // only lets a jump in progress land
        if (game.stateTime >= CONFIG.campaign.victoryTime) startCredits();
        return;
    }

    if (game.state === 'credits') {
        game.stateTime += dt;
        updateCredits(game.credits, dt, world);
        if (game.credits.done) startEnding();
        return;
    }

    if (game.state === 'ending') {
        game.stateTime += dt;
        updateBeach(game.beach, dt);
        return;
    }

    game.time += dt;
    updatePlayer(game.player, dt, input.wantsJump(), input.jumpHeld);

    const speedFactor = getSpeedFactor();
    const cleared = updateObstacles(game.obstacles, dt, world.width, game.player.x, getSceneObstacles(), speedFactor);
    if (cleared > 0) {
        game.score += cleared;
        updateHud();

        // The ending images are big: fetch them shortly before they are needed.
        if (game.score >= getWinScore() - CONFIG.campaign.preloadBefore) preloadEnding();

        if (game.score >= getWinScore()) {
            winGame();
            return;
        }
    }

    if (updateScenery(game.scenery, dt, game.score, CONFIG.obstacles.speed * speedFactor)) {
        playSound('scene');
        showSceneName();
        roster.completeScene(game.scenery.previous);   // may unlock a character
        retypeObstacles(game.obstacles, getSceneObstacles(), game.player.x + 250);
    }

    if (game.player.invulnerable === 0 && playerHitsObstacle(game.player, game.obstacles, getGroundY())) {
        game.lives -= 1;
        updateHud();
        if (game.lives === 0) endGame();
        else {
            playSound('hit');
            hurtPlayer(game.player);   // keeps running, blinking for a moment
        }
    }
}

/* ---------- render ---------- */

function render() {
    const groundY = getGroundY();
    ctx.clearRect(0, 0, world.width, world.height);

    if (game.state === 'ending') {
        drawBeach(ctx, game.beach, world);
        return;
    }

    drawScenery(ctx, game.scenery, images.scenes, world);

    drawObstacles(ctx, images.obstacles, game.obstacles, groundY);
    // He keeps the victory pose while the credits fade in.
    const pose = game.state === 'credits' ? 'victory' : game.state;
    drawPlayer(ctx, images.sprite, game.player, pose, groundY);

    if (DEBUG) {
        ctx.strokeStyle = 'red';
        const boxes = game.obstacles.items.map((item) => getObstacleHitbox(item, groundY));
        boxes.push(getPlayerHitbox(game.player, groundY));
        for (const box of boxes) ctx.strokeRect(box.x, box.y, box.width, box.height);
    }

    // The credits roll over the frozen game, which fades to black behind them.
    if (game.state === 'credits') drawCredits(ctx, game.credits, world);
}

/* Match the canvas buffer to its on-screen size (and to high-DPI screens). */
function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    world.width = board.clientWidth;
    world.height = board.clientHeight;
    canvas.width = Math.round(world.width * ratio);
    canvas.height = Math.round(world.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

/* ---------- loop ---------- */

let lastTime = 0;

function frame(now) {
    // Real elapsed time, capped: after a lag spike or a background tab the
    // game slows down for a moment instead of teleporting through an obstacle.
    // Never negative either: the first frame's timestamp can be slightly
    // older than the moment the loop was started.
    const dt = Math.max(0, Math.min((now - lastTime) / 1000, CONFIG.maxDelta));
    lastTime = now;

    update(dt);
    render();
    requestAnimationFrame(frame);
}

/* ---------- boot ---------- */

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        // decode() finishes the heavy work now, so the first time a big
        // scenery is drawn the game does not stutter.
        image.onload = () => image.decode().then(() => resolve(image), () => resolve(image));
        image.onerror = () => reject(new Error(src));
        image.src = src;
    });
}

async function boot() {
    i18n.init(document.querySelector('.languages'));
    settings.load();
    roster.load();
    characterSelect.build(document.querySelector('.character-grid'));
    characterSelect.onConfirm = () => { if (game.state === 'select') startGame(); };
    preloadPortraits();

    try {
        images.sprite = await loadImage(SPRITE.src);
        await Promise.all(Object.keys(OBSTACLE_TYPES).map(async (name) => {
            images.obstacles[name] = await loadImage(OBSTACLE_TYPES[name].image);
        }));
    } catch (error) {
        messageLabel.textContent = `${i18n.t('loadError')} ${error.message}`;
        return;
    }

    // Only the first scenery is needed to start. The others are big files,
    // so they load in the background while the player is already playing.
    // A scenery that is missing or still loading shows the sky gradient.
    images.scenes = SCENES.map(() => null);
    const loadScene = (index) => {
        if (!SCENES[index].image) return Promise.resolve();
        return loadImage(SCENES[index].image)
            .then((image) => { images.scenes[index] = image; })
            .catch(() => {});
    };
    await loadScene(0);
    SCENES.slice(1).reduce((queue, scene, i) => queue.then(() => loadScene(i + 1)), Promise.resolve());

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    input.init(board);
    input.onPress = handlePress;
    input.onCancel = handleCancel;
    input.onPause = () => { if (['playing', 'paused'].includes(game.state)) toggleSettings(); };

    gearButton.addEventListener('click', toggleSettings);
    document.querySelector('.btn-resume').addEventListener('click', closeSettings);
    document.querySelector('.btn-settings-menu').addEventListener('click', showMenu);
    document.querySelector('.opt-sound').addEventListener('click', () => changeSetting(() => { settings.sound = !settings.sound; }));
    document.querySelector('.opt-difficulty').addEventListener('click', () => changeSetting(() => { settings.difficulty = !settings.difficulty; }));
    for (const button of document.querySelectorAll('.opt-mode')) {
        button.addEventListener('click', () => changeSetting(() => { settings.mode = button.dataset.mode; }));
    }
    // Leaving the tab in the middle of a run pauses it.
    document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'playing') openSettings(); });
    document.querySelector('.btn-play').addEventListener('click', openCharacterSelect);
    document.querySelector('.btn-select-play').addEventListener('click', () => {
        if (game.state === 'select' && roster.canPlay(roster.get(roster.selected))) startGame();
    });
    document.querySelector('.btn-select-back').addEventListener('click', showMenu);
    document.querySelector('.btn-retry').addEventListener('click', () => { if (canLeaveGameOver()) startGame(); });
    document.querySelector('.screen-gameover .btn-menu').addEventListener('click', () => { if (canLeaveGameOver()) showMenu(); });
    document.querySelector('.btn-skip').addEventListener('click', startEnding);
    document.querySelector('.btn-again').addEventListener('click', () => { if (canAct('ending')) startGame(); });
    document.querySelector('.btn-ending-menu').addEventListener('click', () => { if (canAct('ending')) showMenu(); });
    showMenu();

    lastTime = performance.now();
    requestAnimationFrame(frame);
}

boot();
