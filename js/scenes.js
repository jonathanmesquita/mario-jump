/* Scenery system: the background changes as the score grows.

   To add a place, drop its image in images/cenarios/ and add one line to SCENES.
   Scenes are visited in this order and loop back to the first one.

     name    shown on screen when the scene starts
     image   path of the background, or null for the plain sky gradient (CSS)
     clouds  true to draw the drifting clouds on top of it
     obstacles  names from OBSTACLE_TYPES (obstacles.js) that appear here;
                leave it out to use DEFAULT_OBSTACLES

   The image is scaled to the height of the board and repeated sideways.
   Every second copy is drawn mirrored, so the left and right edges always
   meet themselves and no seam shows, even if the art does not tile.

   The art includes its own pavement, so the scenery scrolls at the same
   speed as the obstacles (otherwise they would slide over the floor). */
const SCENES = [
    { name: 'Avenida Paulista', image: './images/cenarios/cenario-01-masp-paulista.png' },
    { name: 'Metrô',            image: './images/cenarios/cenario-02-metro-sp.png' },
    { name: 'Trânsito',         image: './images/cenarios/cenario-03-transito-sp.png' },
    { name: 'Paraisópolis',     image: './images/cenarios/cenario-04-paraisopolis.png' },
    { name: 'Faria Lima',       image: './images/cenarios/cenario-05-faria-lima-v2.png' },
    { name: 'The Office',       image: './images/cenarios/cenario-06-the-office.png' },
];

function createScenery() {
    return {
        index: 0,        // scene being shown
        previous: -1,    // scene fading out (-1 = none)
        fade: 1,         // 0 -> 1 while the new scene fades in
        offset: 0,       // how far the background has scrolled, in px
    };
}

function sceneIndexForScore(score) {
    return Math.floor(score / CONFIG.scenery.pointsPerScene) % SCENES.length;
}

/* Returns true on the frame the scene changes. */
function updateScenery(scenery, dt, score, scrolling) {
    const cfg = CONFIG.scenery;
    let changed = false;

    const target = sceneIndexForScore(score);
    if (target !== scenery.index) {
        scenery.previous = scenery.index;
        scenery.index = target;
        scenery.fade = 0;
        changed = true;
    }

    scenery.fade = Math.min(1, scenery.fade + dt / cfg.fadeTime);
    if (scenery.fade === 1) scenery.previous = -1;

    if (scrolling) scenery.offset += CONFIG.obstacles.speed * cfg.scrollFactor * dt;

    return changed;
}

/* sceneImages[i] is the loaded image of SCENES[i] (null if it has none). */
function drawScenery(ctx, scenery, sceneImages, cloudsImage, cloudsX, world) {
    if (scenery.previous >= 0) {
        drawScene(ctx, scenery.previous, 1 - scenery.fade, scenery, sceneImages, cloudsImage, cloudsX, world);
    }
    drawScene(ctx, scenery.index, scenery.fade, scenery, sceneImages, cloudsImage, cloudsX, world);
    ctx.globalAlpha = 1;
}

function drawScene(ctx, index, alpha, scenery, sceneImages, cloudsImage, cloudsX, world) {
    const image = sceneImages[index];
    ctx.globalAlpha = alpha;

    if (image) {
        const width = Math.ceil(image.width * world.height / image.height);

        // Copy number i covers [i * width, (i + 1) * width) of the endless strip.
        for (let i = Math.floor(scenery.offset / width); ; i++) {
            const x = Math.round(i * width - scenery.offset);
            if (x >= world.width) break;

            if (i % 2 === 0) {
                ctx.drawImage(image, x, 0, width, world.height);
            } else {
                // Odd copies are flipped horizontally.
                ctx.save();
                ctx.translate(x + width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(image, 0, 0, width, world.height);
                ctx.restore();
            }
        }
    }

    if (SCENES[index].clouds) {
        const clouds = CONFIG.clouds;
        ctx.drawImage(cloudsImage, Math.round(cloudsX), clouds.y, clouds.width, clouds.height);
    }
}
