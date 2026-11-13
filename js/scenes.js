/* Scenery system: the background changes as the score grows.

   To add a place, drop its image in images/ and add one line to SCENES.
   Scenes are visited in this order and loop back to the first one.

     name    shown on screen when the scene starts
     image   path of the background, or null for the plain sky gradient (CSS)
     clouds  true to draw the drifting clouds on top of it

   The image is scaled to the height of the board and repeated sideways,
   so it looks best when its left and right edges match. */
const SCENES = [
    { name: 'Céu aberto', image: null, clouds: true },
    // { name: 'Avenida Paulista', image: './images/cenario-paulista.png' },
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

    // The background moves slower than the pipes (parallax).
    if (scrolling) scenery.offset += CONFIG.pipe.speed * cfg.scrollFactor * dt;

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
        for (let x = -Math.floor(scenery.offset % width); x < world.width; x += width) {
            ctx.drawImage(image, x, 0, width, world.height);
        }
    }

    if (SCENES[index].clouds) {
        const clouds = CONFIG.clouds;
        ctx.drawImage(cloudsImage, Math.round(cloudsX), clouds.y, clouds.width, clouds.height);
    }
}
