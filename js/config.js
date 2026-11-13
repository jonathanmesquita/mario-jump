/* All tunable numbers in one place.
   Units: pixels, seconds, pixels/second. Nothing here depends on frame rate. */
const CONFIG = {
    player: {
        x: 110,              // screen x of the character's anchor (centre of the hat)
        jumpSpeed: 1000,     // initial upward speed  -> peak = jumpSpeed² / (2·gravity) ≈ 192px
        gravity: 2600,       //                       -> air time = 2·jumpSpeed / gravity ≈ 0.77s
        jumpBuffer: 0.12,    // a press this long before landing still jumps
        landTime: 0.08,      // how long the landing frame is shown
        // Hitbox relative to the anchor (x) and the feet (y), in screen px.
        // It covers torso + legs only: the wide sombrero brim and the
        // trailing poncho are deliberately left out so near-misses feel fair.
        hitbox: { left: -32, right: 22, height: 108 },
    },

    pipe: {
        width: 80,
        height: 102,         // 80px wide at the image's 293:375 ratio
        speed: 560,
        minGap: 520,         // distance between consecutive pipes
        maxGap: 900,
        hitboxInset: 6,      // shrink the pipe's box a little on each side
    },

    scenery: {
        pointsPerScene: 10,  // pipes to clear before the next scene
        fadeTime: 0.8,       // cross-fade between two scenes
        scrollFactor: 0.25,  // background speed as a fraction of the pipe speed
    },

    clouds: { width: 550, height: 253, speed: 80, y: 0 },

    maxDelta: 1 / 30,        // longest step simulated in one frame (tab switch, lag spike)
    restartDelay: 0.4,       // ignore input right after game over, so a late jump press doesn't restart
    storageKey: 'mario-jump.best',
};
