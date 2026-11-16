/* Menu scene: the São Paulo metro car behind the main menu, the settings
   opened from it and the character selection.

   The picture itself never moves. On top of it, drawn every frame:
     - light streaks crossing the windows, as if the tunnel lights rushed by
       (left-side windows to the left, right-side ones to the right, away from
       the front of the train);
     - a gentle flicker of the ceiling lights;
     - a slow rise and fall of the ambient light.
   With "reduce motion" switched on in the system, only the still picture shows. */
const MENU_SCENE = {
    image: './images/menu/wallpaper-menu-metro-v1.png',   // 1672x941

    // Window glass, in pixels of the picture: [left, top, right, bottom].
    windows: [
        [0, 245, 235, 595],
        [370, 345, 490, 560],
        [540, 395, 605, 545],
        [1065, 405, 1135, 540],
        [1185, 355, 1305, 560],
        [1440, 255, 1672, 595],
    ],
    ceilingBottom: 330,       // the fluorescent lights are above this line

    // The chosen character sits on the front-left bench. Picture pixels:
    // the head anchor goes at seatX, the feet at seatFeetY with the character
    // seatHeight tall; then the bench front (seatFront polygon) is painted
    // back over the legs, so only the body above the seat shows.
    seatX: 210,
    seatFeetY: 900,
    seatHeight: 340,
    seatFront: [[0, 780], [330, 800], [450, 830], [450, 941], [0, 941]],

    // How the picture is cut when it doesn't fit the board: 0.85 keeps mostly
    // the bottom (benches and floor); sideways it stays centred, but shifts
    // so the seat is never closer than seatMargin (fraction of the width) to
    // the left edge.
    anchorY: 0.85,
    seatMargin: 0.2,

    streakPeriod: 2.6,        // seconds for a light streak to cross a window
    streakAlpha: 0.32,
    lightFlicker: 0.06,       // strength of the ceiling flicker
    ambientDip: 0.08,         // how much darker the car gets at the low point
    ambientPeriod: 7,         // seconds for one slow rise and fall of the light
};

const menuScene = { image: null, time: 0, promise: null };
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function loadMenuScene() {
    if (!menuScene.promise) {
        menuScene.promise = loadImage(MENU_SCENE.image)
            .then((image) => { menuScene.image = image; })
            .catch(() => { menuScene.promise = null; });   // the menu falls back to the first scenery
    }
    return menuScene.promise;
}

function updateMenuScene(dt) {
    menuScene.time += dt;
}

/* Returns false if the picture is not loaded yet, so the caller can draw
   something else instead. drawSeated(x, feetY, height), if given, draws the
   character sitting on the bench, in screen pixels. */
function drawMenuScene(ctx, world, drawSeated) {
    const image = menuScene.image;
    if (!image) return false;
    const cfg = MENU_SCENE;

    // Cover the whole board without stretching (see anchorY / seatMargin).
    const scale = Math.max(world.width / image.width, world.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const left = Math.min(0, Math.max((world.width - width) / 2, world.width * cfg.seatMargin - cfg.seatX * scale));
    const top = (world.height - height) * cfg.anchorY;
    ctx.drawImage(image, left, top, width, height);

    const reduced = reducedMotionQuery.matches;
    const t = menuScene.time;
    ctx.save();

    // Light streaks crossing each window, one after the other.
    ctx.globalCompositeOperation = 'lighter';
    if (!reduced) cfg.windows.forEach(([x0, y0, x1, y1], index) => {
        const wx = left + x0 * scale;
        const wy = top + y0 * scale;
        const ww = (x1 - x0) * scale;
        const wh = (y1 - y0) * scale;
        const outward = (x0 + x1) / 2 < image.width / 2 ? -1 : 1;
        const progress = ((t / cfg.streakPeriod) + index * 0.37) % 1;
        const band = ww * 0.45;
        // From one side of the window to the other, entering and leaving fully.
        const travel = ww + band;
        const start = outward < 0 ? wx + ww : wx - band;
        const bx = start + outward * progress * travel;

        const gradient = ctx.createLinearGradient(bx, 0, bx + band, 0);
        gradient.addColorStop(0, 'rgba(170, 225, 255, 0)');
        gradient.addColorStop(0.5, `rgba(170, 225, 255, ${cfg.streakAlpha})`);
        gradient.addColorStop(1, 'rgba(170, 225, 255, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.rect(wx, wy, ww, wh);
        ctx.clip();
        ctx.fillStyle = gradient;
        ctx.fillRect(bx, wy, band, wh);
        ctx.restore();
    });

    ctx.globalCompositeOperation = 'source-over';
    if (drawSeated) {
        ctx.save();
        drawSeated(left + cfg.seatX * scale, top + cfg.seatFeetY * scale, cfg.seatHeight * scale);
        ctx.restore();
        // The bench front goes back over the legs.
        ctx.save();
        ctx.beginPath();
        cfg.seatFront.forEach(([x, y], index) => {
            ctx[index ? 'lineTo' : 'moveTo'](left + x * scale, top + y * scale);
        });
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, left, top, width, height);
        ctx.restore();
    }

    if (reduced) {
        ctx.restore();
        return true;
    }

    // Ceiling lights: two slow waves mixed, so the flicker never looks regular.
    const flicker = 0.5 + 0.3 * Math.sin(t * 2.1) + 0.2 * Math.sin(t * 5.3 + 1);
    const lightBottom = top + cfg.ceilingBottom * scale;
    const lights = ctx.createLinearGradient(0, top, 0, lightBottom);
    ctx.globalCompositeOperation = 'lighter';
    lights.addColorStop(0, `rgba(255, 250, 210, ${cfg.lightFlicker * flicker})`);
    lights.addColorStop(1, 'rgba(255, 250, 210, 0)');
    ctx.fillStyle = lights;
    ctx.fillRect(0, top, world.width, lightBottom - top);

    // Ambient light: the whole car dims a little and comes back.
    ctx.globalCompositeOperation = 'source-over';
    const dip = 0.5 - 0.5 * Math.cos((t / cfg.ambientPeriod) * Math.PI * 2);
    ctx.fillStyle = `rgba(0, 12, 24, ${cfg.ambientDip * dip})`;
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.restore();
    return true;
}
