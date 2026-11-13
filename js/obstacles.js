/* Obstacle system: objects that scroll right-to-left at a constant speed.

   To add an object, drop its image in images/ and add one entry to
   OBSTACLE_TYPES, then list its name in the scenes where it should
   appear (the "obstacles" field of SCENES, in scenes.js).

     image   path of the picture (transparent background, object touching
             the bottom edge of the image)
     width   size on screen, in px
     height
     inset   how much the collision box is shrunk on the left, right and
             top, so touching a transparent corner does not count as a hit */
const OBSTACLE_TYPES = {
    pipe: { image: './images/pipe.png', width: 80, height: 102, inset: 6 },
};

/* Used by scenes that do not list their own obstacles. */
const DEFAULT_OBSTACLES = ['pipe'];

/* Each item is { x, type, passed }: x is its left edge in screen px and
   type is a key of OBSTACLE_TYPES. */
function createObstacles() {
    return {
        items: [],
        distanceToNext: 0,   // px left to scroll before the next one appears
    };
}

/* Moves the obstacles and returns how many the player cleared this step.
   typeNames lists what may spawn now (the current scene's obstacles). */
function updateObstacles(obstacles, dt, worldWidth, playerX, typeNames) {
    const cfg = CONFIG.obstacles;
    const step = cfg.speed * dt;
    let cleared = 0;

    for (const item of obstacles.items) {
        item.x -= step;
        if (!item.passed && item.x + OBSTACLE_TYPES[item.type].width < playerX) {
            item.passed = true;
            cleared += 1;
        }
    }

    // Drop the ones that left the screen so the array never grows.
    obstacles.items = obstacles.items.filter((item) => item.x + OBSTACLE_TYPES[item.type].width > 0);

    obstacles.distanceToNext -= step;
    if (obstacles.distanceToNext <= 0) {
        const type = typeNames[Math.floor(Math.random() * typeNames.length)];
        obstacles.items.push({ x: worldWidth, type, passed: false });
        obstacles.distanceToNext = cfg.minGap + Math.random() * (cfg.maxGap - cfg.minGap);
    }

    return cleared;
}

function getObstacleHitbox(item, groundY) {
    const type = OBSTACLE_TYPES[item.type];
    return {
        x: item.x + type.inset,
        y: groundY - type.height + type.inset,
        width: type.width - type.inset * 2,
        height: type.height - type.inset,
    };
}

/* obstacleImages[name] is the loaded image of OBSTACLE_TYPES[name]. */
function drawObstacles(ctx, obstacleImages, obstacles, groundY) {
    for (const item of obstacles.items) {
        const type = OBSTACLE_TYPES[item.type];
        const image = obstacleImages[item.type];
        if (image) ctx.drawImage(image, Math.round(item.x), groundY - type.height, type.width, type.height);
    }
}
