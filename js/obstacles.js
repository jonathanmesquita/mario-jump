/* Obstacle system: pipes that scroll right-to-left at a constant speed.
   Each pipe is { x, passed }, where x is its left edge in screen px. */
function createObstacles() {
    return {
        pipes: [],
        distanceToNext: 0,   // px left to scroll before the next pipe appears
    };
}

/* Moves the pipes and returns how many were cleared by the player this step. */
function updateObstacles(obstacles, dt, worldWidth, playerX) {
    const cfg = CONFIG.pipe;
    const step = cfg.speed * dt;
    let cleared = 0;

    for (const pipe of obstacles.pipes) {
        pipe.x -= step;
        if (!pipe.passed && pipe.x + cfg.width < playerX) {
            pipe.passed = true;
            cleared += 1;
        }
    }

    // Drop pipes that left the screen so the array never grows.
    obstacles.pipes = obstacles.pipes.filter((pipe) => pipe.x + cfg.width > 0);

    obstacles.distanceToNext -= step;
    if (obstacles.distanceToNext <= 0) {
        obstacles.pipes.push({ x: worldWidth, passed: false });
        obstacles.distanceToNext = cfg.minGap + Math.random() * (cfg.maxGap - cfg.minGap);
    }

    return cleared;
}

function getPipeHitbox(pipe, groundY) {
    const cfg = CONFIG.pipe;
    return {
        x: pipe.x + cfg.hitboxInset,
        y: groundY - cfg.height + cfg.hitboxInset,
        width: cfg.width - cfg.hitboxInset * 2,
        height: cfg.height - cfg.hitboxInset,
    };
}

function drawObstacles(ctx, image, obstacles, groundY) {
    const cfg = CONFIG.pipe;
    for (const pipe of obstacles.pipes) {
        ctx.drawImage(image, Math.round(pipe.x), groundY - cfg.height, cfg.width, cfg.height);
    }
}
