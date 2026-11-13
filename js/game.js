/* Game: owns the state machine, the score, the loop and the rendering.

   States:  ready --press--> playing --hit a pipe--> gameover --press--> playing */
const board = document.querySelector('.game-board');
const canvas = document.querySelector('.game-canvas');
const ctx = canvas.getContext('2d');
const scoreLabel = document.querySelector('.score');
const bestLabel = document.querySelector('.best');
const messageLabel = document.querySelector('.message');
const sceneLabel = document.querySelector('.scene-name');

// Add ?debug to the URL to see the hitboxes.
const DEBUG = new URLSearchParams(location.search).has('debug');

const images = { scenes: [] };
const world = { width: 0, height: 0 };   // canvas size in CSS px

/* Screen y where feet and obstacles rest. */
function getGroundY() {
    return world.height - CONFIG.scenery.groundOffset;
}

const game = {
    state: 'ready',
    score: 0,
    best: loadBest(),
    gameOverTime: 0,     // seconds spent on the game over screen
    cloudsX: 0,
    player: createPlayer(),
    obstacles: createObstacles(),
    scenery: createScenery(),
};

/* ---------- state ---------- */

function startGame() {
    // Everything that changes during a run is rebuilt here, so a restart
    // can never inherit state from the previous run.
    game.state = 'playing';
    game.score = 0;
    game.player = createPlayer();
    game.obstacles = createObstacles();
    game.scenery = createScenery();
    input.clear();
    updateHud();
    messageLabel.textContent = '';
    if (SCENES.length > 1) showSceneName();
}

function endGame() {
    game.state = 'gameover';
    game.gameOverTime = 0;
    if (game.score > game.best) {
        game.best = game.score;
        saveBest(game.best);
    }
    updateHud();
    messageLabel.textContent = 'Game Over\nPress Space or tap to play again';
}

function handlePress() {
    if (game.state === 'ready') startGame();
    else if (game.state === 'gameover' && game.gameOverTime >= CONFIG.restartDelay) startGame();
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

    if (game.state === 'ready') {
        game.player.animTime += dt;   // idle animation only
        return;
    }

    if (game.state === 'gameover') {
        game.gameOverTime += dt;      // everything stays frozen where it was
        updateScenery(game.scenery, dt, game.score, false);   // only lets a fade finish
        return;
    }

    updatePlayer(game.player, dt, input.wantsJump());

    const cleared = updateObstacles(game.obstacles, dt, world.width, game.player.x);
    if (cleared > 0) {
        game.score += cleared;
        updateHud();
    }

    if (updateScenery(game.scenery, dt, game.score, true)) showSceneName();

    if (playerHitsObstacle(game.player, game.obstacles, getGroundY())) endGame();
}

/* ---------- render ---------- */

function render() {
    const groundY = getGroundY();
    ctx.clearRect(0, 0, world.width, world.height);

    drawScenery(ctx, game.scenery, images.scenes, images.clouds, game.cloudsX, world);

    drawObstacles(ctx, images.pipe, game.obstacles, groundY);
    drawPlayer(ctx, images.sprite, game.player, game.state, groundY);

    if (DEBUG) {
        ctx.strokeStyle = 'red';
        const boxes = game.obstacles.pipes.map((pipe) => getPipeHitbox(pipe, groundY));
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
    // game slows down for a moment instead of teleporting through a pipe.
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
        image.onerror = () => reject(new Error(`Could not load ${src}`));
        image.src = src;
    });
}

async function boot() {
    try {
        [images.sprite, images.pipe, images.clouds] = await Promise.all([
            loadImage(SPRITE.src),
            loadImage('./images/pipe.png'),
            loadImage('./images/clouds.png'),
        ]);
    } catch (error) {
        messageLabel.textContent = error.message;
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
    updateHud();
    messageLabel.textContent = 'Press Space or tap to start';

    lastTime = performance.now();
    requestAnimationFrame(frame);
}

boot();
