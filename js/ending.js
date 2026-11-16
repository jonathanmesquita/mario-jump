/* Ending system: the credits roll and the beach scene shown after a win.

   It has no loop of its own: game.js calls updateCredits / updateBeach and
   the draw functions from the single game loop.
   The images are only downloaded when the player gets close to winning. */

/* ---------- credits (edit here) ----------
   Each block is a heading followed by names.
     heading      a key of the texts in i18n.js (translated), or
     headingText  fixed text, the same in every language
     names        fixed text lines (optional)
     nameKeys     lines taken from i18n.js (optional, translated) */
const CREDITS = [
    { headingText: 'ARRIBA JUMP' },
    { heading: 'creditsCreation', names: ['Jonathan Mesquita'] },
    { heading: 'creditsArt', names: ['Jonathan Mesquita'] },
    { heading: 'creditsCode', names: ['Jonathan Mesquita'] },
    { heading: 'creditsPlaces', names: SCENES.map((scene) => scene.name) },
    { heading: 'creditsThanks', names: ['Alura', 'Manual do Dev'], nameKeys: ['creditsPlayer'] },
    { heading: 'creditsEnd' },
];

/* ---------- beach scene (edit here) ----------
   Positions and sizes are fractions of the scenery image (0 to 1), so the
   scene keeps its layout at any screen size. */
const ENDING = {
    scenery: './images/ending/cenario-final-por-do-sol.png',   // 1672x941

    // Jonathan in the hammock: 8 frames on a regular 4x2 grid.
    character: {
        image: './images/ending/sprite-arriba-final-01.png',   // 1774x887
        columns: 4, rows: 2, frames: 8, fps: 4,
        x: 0.15, y: 0.53, width: 0.31,                         // left, top, width; cell is square
    },

    // Sea: 8 strips of 412x104. They are not on a regular grid, so the
    // left edge of each column and the top edge of each row are listed.
    waves: {
        image: './images/ending/sprite-ondas-final-01.png',    // 1774x887
        columnsX: [16, 460, 903, 1346], rowsY: [225, 595],
        frameWidth: 411, frameHeight: 104, frames: 8, fps: 6,
        x: 0.293, y: 0.531, width: 0.622, height: 0.213,       // over the sea, centred under the sun
        edgeFade: 0.25,   // the strip fades out towards its sides to blend with the painted sea
        alpha: 0.9,
    },

    // On wide screens, how far the mirrored sides stay visible (fraction of
    // the scenery width) before they are fully black.
    sideReach: 0.28,

    // Colours that fill the space above and below the scenery on tall screens.
    skyColor: '#202c8e',
    sandColor: '#dc6f2c',
};

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------- loading ---------- */

const endingImages = { scenery: null, character: null, waves: null, promise: null };

/* Starts the download once; calling it again returns the same promise. */
function preloadEnding() {
    if (!endingImages.promise) {
        endingImages.promise = Promise.all([
            loadImage(ENDING.scenery),
            loadImage(ENDING.character.image),
            loadImage(ENDING.waves.image),
        ]).then(([scenery, character, waves]) => {
            endingImages.scenery = scenery;
            endingImages.character = character;
            endingImages.waves = waves;
        }).catch(() => {
            endingImages.promise = null;   // allow another try on the next win
        });
    }
    return endingImages.promise;
}

/* ---------- credits ---------- */

/* Turns CREDITS into drawable lines in the current language. */
function buildCreditLines() {
    const lines = [];
    CREDITS.forEach((block, blockIndex) => {
        const heading = block.headingText || i18n.t(block.heading);
        const isTitle = !block.names && !block.nameKeys;
        lines.push({ text: heading, style: isTitle ? 'title' : 'heading', block: blockIndex });
        const names = (block.names || []).concat((block.nameKeys || []).map((key) => i18n.t(key)));
        for (const name of names) lines.push({ text: name, style: 'name', block: blockIndex });
    });
    return lines;
}

const CREDIT_STYLES = {
    title:   { size: 40, color: '#ffd95a', before: 70 },
    heading: { size: 18, color: '#ffd95a', before: 60 },
    name:    { size: 26, color: '#ffffff', before: 12 },
};

function createCredits() {
    return {
        time: 0,
        lines: buildCreditLines(),
        reduced: prefersReducedMotion(),   // decided once, when the credits start
        done: false,
    };
}

/* Text gets smaller on narrow screens so long lines still fit. */
function creditScale(world) {
    return Math.min(1, world.width / 620);
}

/* Total height of the roll, in px. */
function creditsHeight(credits, scale) {
    return credits.lines.reduce((sum, line) => {
        const style = CREDIT_STYLES[line.style];
        return sum + (style.before + style.size) * scale;
    }, 0);
}

/* Distance the roll travels, from entering at the bottom to leaving at the top. */
function creditsDistance(credits, world) {
    return world.height - CONFIG.credits.bottomMargin + creditsHeight(credits, creditScale(world));
}

/* Scroll speed in px/s, slowed down if needed to respect the minimum duration. */
function creditsSpeed(credits, world) {
    const cfg = CONFIG.credits;
    return Math.min(cfg.speed, creditsDistance(credits, world) / cfg.minDuration);
}

function updateCredits(credits, dt, world) {
    credits.time += dt;
    const cfg = CONFIG.credits;

    if (credits.reduced) {
        // One block per page, no scrolling.
        credits.done = credits.time >= Math.max(cfg.minDuration, CREDITS.length * cfg.pageTime);
    } else {
        credits.done = credits.time * creditsSpeed(credits, world) >= creditsDistance(credits, world);
    }
}

function drawCredits(ctx, credits, world) {
    const scale = creditScale(world);
    const fadeIn = Math.min(1, credits.time / CONFIG.credits.fadeTime);

    // Darkens the frozen game behind until it is black.
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeIn})`;
    ctx.fillRect(0, 0, world.width, world.height);

    // The text stays out of the bottom strip, where the skip button is.
    const areaHeight = world.height - CONFIG.credits.bottomMargin;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, world.width, areaHeight);
    ctx.clip();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    let lines = credits.lines;
    let y;
    if (credits.reduced) {
        const page = Math.min(CREDITS.length - 1, Math.floor(credits.time / CONFIG.credits.pageTime));
        lines = lines.filter((line) => line.block === page);
        const height = creditsHeight({ lines }, scale);
        y = (areaHeight - height) / 2;
    } else {
        y = areaHeight - credits.time * creditsSpeed(credits, world);
    }

    for (const line of lines) {
        const style = CREDIT_STYLES[line.style];
        y += (style.before + style.size) * scale;
        if (y < -10 || y > world.height + style.size) continue;   // off screen
        ctx.font = `bold ${Math.round(style.size * scale)}px "Courier New", monospace`;
        ctx.fillStyle = style.color;
        ctx.fillText(line.text, world.width / 2, y);
    }
    ctx.restore();
}

/* ---------- beach ---------- */

function createBeach() {
    return {
        time: 0,
        reduced: prefersReducedMotion(),
    };
}

function updateBeach(beach, dt) {
    beach.time += dt;
}

/* Scratch canvas used to fade the edges of the wave strip. */
const waveCanvas = document.createElement('canvas');
const waveCtx = waveCanvas.getContext('2d');

function drawBeach(ctx, beach, world) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, world.width, world.height);

    const scenery = endingImages.scenery;
    if (!scenery) return;   // still downloading: stay black

    // Smooth arrival. With reduced motion the scene simply appears.
    ctx.globalAlpha = beach.reduced ? 1 : Math.min(1, beach.time / CONFIG.ending.fadeTime);

    // The whole picture is always visible and never stretched: it is
    // scaled to fit, and what is left around it is filled in.
    const scale = Math.min(world.width / scenery.width, world.height / scenery.height);
    const width = Math.round(scenery.width * scale);
    const height = Math.round(scenery.height * scale);
    const left = Math.round((world.width - width) / 2);
    const top = Math.round((world.height - height) / 2);

    if (top > 0) {
        // Tall screen (phone upright): sky above, sand below.
        ctx.fillStyle = ENDING.skyColor;
        ctx.fillRect(0, 0, world.width, top);
        ctx.fillStyle = ENDING.sandColor;
        ctx.fillRect(0, top + height, world.width, world.height - top - height);
    }

    ctx.drawImage(scenery, left, top, width, height);

    if (left > 0) {
        // Wide screen: the beach continues to both sides as mirrored copies
        // that fade to black before the mirrored sun would show up.
        for (const x of [left, left + 2 * width]) {
            ctx.save();
            ctx.translate(x, top);
            ctx.scale(-1, 1);
            ctx.drawImage(scenery, 0, 0, width, height);
            ctx.restore();
        }
        const reach = ENDING.sideReach * width;
        for (const direction of [-1, 1]) {
            const edge = direction < 0 ? left : left + width;
            const shade = ctx.createLinearGradient(edge, 0, edge + direction * reach, 0);
            shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
            shade.addColorStop(1, 'rgba(0, 0, 0, 1)');
            ctx.fillStyle = shade;
            ctx.fillRect(direction < 0 ? 0 : edge, top, left, height);
        }
    }

    drawWaves(ctx, beach, left, top, width, height);
    drawHammock(ctx, beach, left, top, width, height);
    ctx.globalAlpha = 1;
}

/* Frame of a looping animation; frozen on the first one with reduced motion. */
function endingFrame(beach, animation) {
    return beach.reduced ? 0 : Math.floor(beach.time * animation.fps) % animation.frames;
}

function drawWaves(ctx, beach, left, top, width, height) {
    const waves = ENDING.waves;
    const frame = endingFrame(beach, waves);
    const sx = waves.columnsX[frame % waves.columnsX.length];
    const sy = waves.rowsY[Math.floor(frame / waves.columnsX.length)];
    const w = Math.round(waves.width * width);
    const h = Math.round(waves.height * height);
    if (w < 2 || h < 2) return;

    // Draw the strip on the scratch canvas, then erase its borders with
    // gradients so it melts into the painted sea.
    waveCanvas.width = w;
    waveCanvas.height = h;
    waveCtx.imageSmoothingEnabled = false;
    waveCtx.globalCompositeOperation = 'source-over';
    waveCtx.drawImage(endingImages.waves, sx, sy, waves.frameWidth, waves.frameHeight, 0, 0, w, h);

    waveCtx.globalCompositeOperation = 'destination-in';
    const sides = waveCtx.createLinearGradient(0, 0, w, 0);
    sides.addColorStop(0, 'rgba(0, 0, 0, 0)');
    sides.addColorStop(waves.edgeFade, 'rgba(0, 0, 0, 1)');
    sides.addColorStop(1 - waves.edgeFade, 'rgba(0, 0, 0, 1)');
    sides.addColorStop(1, 'rgba(0, 0, 0, 0)');
    waveCtx.fillStyle = sides;
    waveCtx.fillRect(0, 0, w, h);

    const topBottom = waveCtx.createLinearGradient(0, 0, 0, h);
    topBottom.addColorStop(0, 'rgba(0, 0, 0, 0)');
    topBottom.addColorStop(0.3, 'rgba(0, 0, 0, 1)');
    topBottom.addColorStop(0.88, 'rgba(0, 0, 0, 1)');
    topBottom.addColorStop(1, 'rgba(0, 0, 0, 0)');
    waveCtx.fillStyle = topBottom;
    waveCtx.fillRect(0, 0, w, h);

    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha * waves.alpha;
    ctx.drawImage(waveCanvas, left + Math.round(waves.x * width), top + Math.round(waves.y * height));
    ctx.globalAlpha = alpha;
}

function drawHammock(ctx, beach, left, top, width, height) {
    const character = ENDING.character;
    const image = endingImages.character;
    const frame = endingFrame(beach, character);
    const cellWidth = image.width / character.columns;
    const cellHeight = image.height / character.rows;
    const size = character.width * width;

    ctx.drawImage(
        image,
        (frame % character.columns) * cellWidth,
        Math.floor(frame / character.columns) * cellHeight,
        cellWidth, cellHeight,
        left + Math.round(character.x * width),
        top + Math.round(character.y * height),
        size,
        size * cellHeight / cellWidth
    );
}
