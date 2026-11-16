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
   something else instead. */
function drawMenuScene(ctx, world) {
    const image = menuScene.image;
    if (!image) return false;

    // Cover the whole board without stretching; whatever is cut is cut evenly
    // from both sides, so the aisle stays in the middle.
    const scale = Math.max(world.width / image.width, world.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const left = (world.width - width) / 2;
    const top = (world.height - height) / 2;
    ctx.drawImage(image, left, top, width, height);

    if (reducedMotionQuery.matches) return true;

    const t = menuScene.time;
    const cfg = MENU_SCENE;
    ctx.save();

    // Light streaks crossing each window, one after the other.
    ctx.globalCompositeOperation = 'lighter';
    cfg.windows.forEach(([x0, y0, x1, y1], index) => {
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

    // Ceiling lights: two slow waves mixed, so the flicker never looks regular.
    const flicker = 0.5 + 0.3 * Math.sin(t * 2.1) + 0.2 * Math.sin(t * 5.3 + 1);
    const lightBottom = top + cfg.ceilingBottom * scale;
    const lights = ctx.createLinearGradient(0, top, 0, lightBottom);
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
