/* Game: owns the state machine, the score, the lives, the loop and the rendering.

   States:
     menu     --play-->            playing
     playing  --no lives left-->   gameover
     gameover --retry-->           playing
     gameover --main menu-->       menu */
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
    best: loadBest(),
    gameOverTime: 0,     // seconds spent on the game over screen
    cloudsX: 0,
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
    game.player = createPlayer();
    game.obstacles = createObstacles();
    game.scenery = createScenery();
    input.clear();
    updateHud();
}

function showMenu() {
    resetRun();
    game.state = 'menu';
    document.querySelector('.menu-best').textContent = game.best;
    showScreen(menuScreen);
}

function startGame() {
    resetRun();
    game.state = 'playing';
    showScreen(null);
    showSceneName();
}

function endGame() {
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
    menuScreen.hidden = screen !== menuScreen;
    gameOverScreen.hidden = screen !== gameOverScreen;
    hud.hidden = screen !== null;
    if (screen) sceneLabel.classList.remove('show');
    // A button that was just clicked keeps keyboard focus even after its
    // screen is hidden, and would swallow the next Space press.
    if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur();
}

/* The delay stops a late jump press from retrying by accident. */
function canLeaveGameOver() {
    return game.state === 'gameover' && game.gameOverTime >= CONFIG.restartDelay;
}

/* source is 'key' or 'pointer' (see input.js). */
function handlePress(source) {
    if (game.state === 'menu') startGame();
    // On the game over screen a tap must hit a button; only keys retry directly.
    else if (source === 'key' && canLeaveGameOver()) startGame();
}

function handleCancel() {
    if (canLeaveGameOver()) showMenu();
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

function loadBest() {
    try {
        return Number(localStorage.getItem(CONFIG.storageKey)) || 0;
    } catch (error) {
        return 0;   // storage blocked (private mode, file:// in some browsers)
    }
}

function saveBest(value) {
    try {
        localStorage.setItem(CONFIG.storageKey, String(value));
    } catch (error) {
        /* not being able to save the record is not fatal */
    }
}

/* ---------- update ---------- */

function update(dt) {
    input.update(dt);

    // Clouds drift in every state, as in the original game.
    game.cloudsX -= CONFIG.clouds.speed * dt;
    if (game.cloudsX < -CONFIG.clouds.width) game.cloudsX = world.width;

    if (game.state === 'menu') {
        game.player.animTime += dt;   // idle animation only
        return;
    }

    if (game.state === 'gameover') {
        game.gameOverTime += dt;      // everything stays frozen where it was
        updateScenery(game.scenery, dt, game.score, false);   // only lets a fade finish
        return;
    }

    game.time += dt;
    updatePlayer(game.player, dt, input.wantsJump(), input.jumpHeld);

    const sceneObstacles = SCENES[game.scenery.index].obstacles || DEFAULT_OBSTACLES;
    const cleared = updateObstacles(game.obstacles, dt, world.width, game.player.x, sceneObstacles);
    if (cleared > 0) {
        game.score += cleared;
        updateHud();
    }

    if (updateScenery(game.scenery, dt, game.score, true)) showSceneName();

    if (game.player.invulnerable === 0 && playerHitsObstacle(game.player, game.obstacles, getGroundY())) {
        game.lives -= 1;
        updateHud();
        if (game.lives === 0) endGame();
        else hurtPlayer(game.player);   // keeps running, blinking for a moment
    }
}

/* ---------- render ---------- */

function render() {
    const groundY = getGroundY();
    ctx.clearRect(0, 0, world.width, world.height);

    drawScenery(ctx, game.scenery, images.scenes, images.clouds, game.cloudsX, world);

    drawObstacles(ctx, images.obstacles, game.obstacles, groundY);
    drawPlayer(ctx, images.sprite, game.player, game.state, groundY);

    if (DEBUG) {
        ctx.strokeStyle = 'red';
        const boxes = game.obstacles.items.map((item) => getObstacleHitbox(item, groundY));
        boxes.push(getPlayerHitbox(game.player, groundY));
        for (const box of boxes) ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
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

    try {
        [images.sprite, images.clouds] = await Promise.all([
            loadImage(SPRITE.src),
            loadImage('./images/clouds.png'),
        ]);
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

    game.cloudsX = world.width;
    input.init(board);
    input.onPress = handlePress;
    input.onCancel = handleCancel;
    document.querySelector('.btn-play').addEventListener('click', startGame);
    document.querySelector('.btn-retry').addEventListener('click', () => { if (canLeaveGameOver()) startGame(); });
    document.querySelector('.btn-menu').addEventListener('click', () => { if (canLeaveGameOver()) showMenu(); });
    showMenu();

    lastTime = performance.now();
    requestAnimationFrame(frame);
}

boot();
