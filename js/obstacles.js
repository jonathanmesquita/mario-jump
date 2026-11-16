/* Obstacle system: objects that scroll right-to-left at a constant speed.

   To add an object, drop its image in images/obstaculos/ and add one entry to
   OBSTACLE_TYPES, then list its name in the scenes where it should
   appear (the "obstacles" field of SCENES, in scenes.js).

     image   path of the picture (transparent background, object touching
             the bottom edge of the image)
     width   size on screen, in px
     height
     inset   how much the collision box is shrunk on the left, right and
             top, so touching a transparent corner does not count as a hit
     sink    optional: px the object is drawn below the ground line
             (the pothole lies in the floor instead of standing on it) */
const OBSTACLE_TYPES = {
    cone:       { image: './images/obstaculos/cone.png',       width: 56, height: 72,  inset: 8 },
    mochila:    { image: './images/obstaculos/mochila.png',    width: 64, height: 68,  inset: 6 },
    impressora: { image: './images/obstaculos/impressora.png', width: 80, height: 60,  inset: 6 },
    caixas:     { image: './images/obstaculos/caixas.png',     width: 72, height: 96,  inset: 6 },
    patinete:   { image: './images/obstaculos/patinete.png',   width: 96, height: 80,  inset: 10 },
    buraco:     { image: './images/obstaculos/buraco.png',     width: 96, height: 24,  inset: 10, sink: 14 },
};

/* Used by scenes that do not list their own obstacles. */
const DEFAULT_OBSTACLES = ['cone'];

/* Each item is { x, type, passed }: x is its left edge in screen px and
   type is a key of OBSTACLE_TYPES. */
function createObstacles() {
    return {
        items: [],
        distanceToNext: 0,   // px left to scroll before the next one appears
    };
}

/* Moves the obstacles and returns how many the player cleared this step.
   typeNames lists what may spawn now (the current scene's obstacles).
   speedFactor is 1 normally and grows with the "increasing difficulty" setting. */
function updateObstacles(obstacles, dt, worldWidth, playerX, typeNames, speedFactor) {
    const cfg = CONFIG.obstacles;
    const step = cfg.speed * speedFactor * dt;
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
        obstacles.items.push({ x: worldWidth, type: pickObstacleType(typeNames), passed: false });
        // Faster game = longer gaps, or two obstacles could not be jumped in a row.
        const gapFactor = Math.pow(speedFactor, CONFIG.difficulty.gapPower);
        obstacles.distanceToNext = (cfg.minGap + Math.random() * (cfg.maxGap - cfg.minGap)) * gapFactor;
    }

    return cleared;
}

function pickObstacleType(typeNames) {
    return typeNames[Math.floor(Math.random() * typeNames.length)];
}

/* Called when the scenery changes: objects still far from the player
   (beyond minX) become objects of the new scene, so a printer does not
   show up on the street. The ones about to be jumped are left alone. */
function retypeObstacles(obstacles, typeNames, minX) {
    for (const item of obstacles.items) {
        if (item.x > minX && !typeNames.includes(item.type)) item.type = pickObstacleType(typeNames);
    }
}

function getObstacleHitbox(item, groundY) {
    const type = OBSTACLE_TYPES[item.type];
    return {
        x: item.x + type.inset,
        y: groundY + (type.sink || 0) - type.height + type.inset,
        width: type.width - type.inset * 2,
        height: type.height - type.inset,
    };
}

/* obstacleImages[name] is the loaded image of OBSTACLE_TYPES[name]. */
function drawObstacles(ctx, obstacleImages, obstacles, groundY) {
    for (const item of obstacles.items) {
        const type = OBSTACLE_TYPES[item.type];
        const image = obstacleImages[item.type];
        const y = groundY + (type.sink || 0) - type.height;
        if (image) ctx.drawImage(image, Math.round(item.x), y, type.width, type.height);
    }
}
