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
    scenery: './images/ending/cenario-final-por-do-sol.webp',   // 1672x941

    // The character of the run relaxing on the beach. Every sheet is 1774x887
    // with 8 frames on a regular 4x2 grid of square cells.
    characterGrid: { columns: 4, rows: 2, frames: 8, fps: 4 },

    // Per character:
    //   image          the ending sheet
    //   width          size of one cell on screen, as a fraction of the scenery width
    //   contentBottom  where the drawing ends inside a cell (0 = top, 1 = bottom),
    //                  measured from the PNG, so the feet can be put on the sand
    //   feetY          the sand line where that bottom lands (fraction of the scenery height)
    //   x              left edge of the cell (fraction of the scenery width)
    // A character without an entry (e.g. the secret boss before its art exists)
    // falls back to Arriba.
    characters: {
        arriba:            { image: './images/ending/sprite-arriba-final-01.webp',              width: 0.31, contentBottom: 0.832, feetY: 0.988, x: 0.15 },
        ariel:             { image: './images/ending/sprite-ariel-final-praia-01.webp',         width: 0.25, contentBottom: 0.936, feetY: 0.95,  x: 0.15 },
        'amaury-caldeira': { image: './images/ending/sprite-amaury-caldeira-final-praia-01.webp', width: 0.25, contentBottom: 0.931, feetY: 0.95,  x: 0.15 },
        'ana-caroline':    { image: './images/ending/sprite-ana-caroline-final-praia-01.webp',  width: 0.25, contentBottom: 0.963, feetY: 0.95,  x: 0.15 },
        milena:            { image: './images/ending/sprite-milena-final-praia-01.webp',        width: 0.25, contentBottom: 0.961, feetY: 0.95,  x: 0.17 },
        ananias:           { image: './images/ending/sprite-ananias-final-praia-01.webp',       width: 0.25, contentBottom: 0.954, feetY: 0.95,  x: 0.15 },
    },

    // Sea: 8 strips of 412x104. They are not on a regular grid, so the
    // left edge of each column and the top edge of each row are listed.
    waves: {
        image: './images/ending/sprite-ondas-final-01.webp',    // 1774x887
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

const endingImages = { scenery: null, waves: null, characters: {}, promise: null, characterPromises: {} };

function endingCharacterId(id) {
    return ENDING.characters[id] ? id : 'arriba';
}

/* Starts the download of the beach and of this character's ending sheet.
   Calling it again reuses what is already loading or loaded. */
function preloadEnding(characterId) {
    if (!endingImages.promise) {
        endingImages.promise = Promise.all([
            loadImage(ENDING.scenery),
            loadImage(ENDING.waves.image),
        ]).then(([scenery, waves]) => {
            endingImages.scenery = scenery;
            endingImages.waves = waves;
        }).catch(() => {
            endingImages.promise = null;   // allow another try on the next win
        });
    }

    const id = endingCharacterId(characterId);
    if (!endingImages.characterPromises[id]) {
        endingImages.characterPromises[id] = loadImage(ENDING.characters[id].image)
            .then((image) => { endingImages.characters[id] = image; })
            .catch(() => { delete endingImages.characterPromises[id]; });
    }
    return Promise.all([endingImages.promise, endingImages.characterPromises[id]]);
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

function createBeach(characterId) {
    return {
        character: endingCharacterId(characterId),
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

/* The run's character on the beach (Arriba if that sheet failed to load). */
function drawHammock(ctx, beach, left, top, width, height) {
    let id = beach.character;
    if (!endingImages.characters[id]) id = 'arriba';
    const image = endingImages.characters[id];
    if (!image) return;   // still downloading

    const grid = ENDING.characterGrid;
    const place = ENDING.characters[id];
    const frame = endingFrame(beach, grid);
    const cellWidth = image.width / grid.columns;
    const cellHeight = image.height / grid.rows;
    const drawWidth = place.width * width;
    const drawHeight = drawWidth * cellHeight / cellWidth;

    ctx.drawImage(
        image,
        (frame % grid.columns) * cellWidth,
        Math.floor(frame / grid.columns) * cellHeight,
        cellWidth, cellHeight,
        left + Math.round(place.x * width),
        top + Math.round(place.feetY * height - place.contentBottom * drawHeight),
        drawWidth,
        drawHeight
    );
}
