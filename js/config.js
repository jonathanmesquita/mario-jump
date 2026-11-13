/* All tunable numbers in one place.
   Units: pixels, seconds, pixels/second. Nothing here depends on frame rate. */
const CONFIG = {
    player: {
        x: 110,              // screen x of the character's anchor (centre of the hat)
        jumpSpeed: 1000,     // initial upward speed  -> peak = jumpSpeed² / (2·gravity) ≈ 192px
        gravity: 2600,       //                       -> air time = 2·jumpSpeed / gravity ≈ 0.77s
        jumpCutSpeed: 450,   // releasing the button early caps the upward speed here (short hop ≈ 50px)
        jumpBuffer: 0.12,    // a press this long before landing still jumps
        landTime: 0.08,      // how long the landing frame is shown
        lives: 3,
        hurtTime: 0.35,      // how long the hurt frame is shown after a hit
        invulnerableTime: 1.5,   // blinking, cannot be hit again
        // Hitbox relative to the anchor (x) and the feet (y), in screen px.
        // It covers torso + legs only: the wide sombrero brim and the
        // trailing poncho are deliberately left out so near-misses feel fair.
        hitbox: { left: -32, right: 22, height: 108 },
    },

    // Sizes and collision boxes of each object live in obstacles.js.
    obstacles: {
        speed: 560,
        minGap: 520,         // distance between consecutive obstacles
        maxGap: 900,
    },

    scenery: {
        pointsPerScene: 10,  // obstacles to clear before the next scene
        fadeTime: 0.6,       // cross-fade between two scenes
        scrollFactor: 1,     // background speed as a fraction of the obstacle speed (1 = same floor)
        groundOffset: 36,    // the pavement in the art: feet stand this far above the bottom edge
    },

    clouds: { width: 550, height: 253, speed: 80, y: 0 },

    maxDelta: 1 / 30,        // longest step simulated in one frame (tab switch, lag spike)
    restartDelay: 0.4,       // ignore input right after game over, so a late jump press doesn't restart
    storageKey: 'mario-jump.best',
};
