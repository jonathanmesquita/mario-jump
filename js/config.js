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

    // "Increasing difficulty" setting: the game speeds up with the score.
    difficulty: {
        perPoint: 0.008,     // speed gained per obstacle cleared (0.008 = +0.8%)
        maxFactor: 1.45,     // never faster than 1.45x the base speed
        gapPower: 0.7,       // gaps grow slower than the speed, so obstacles also come sooner
    },

    // Campaign: clearing this many obstacles wins the game.
    // 60 = six sceneries x 10 obstacles each (scenery.pointsPerScene).
    campaign: {
        obstaclesToWin: 60,
        victoryTime: 3,      // how long the "course complete" banner stays before the credits
        preloadBefore: 10,   // start downloading the ending images this many obstacles before the end
    },

    credits: {
        speed: 140,          // scroll speed of the credits (about 10s for the whole roll)
        minDuration: 5,      // the roll never takes less than this, however short the list is
        fadeTime: 0.6,       // the frozen game fades to black behind them
        bottomMargin: 64,    // strip at the bottom kept free for the skip button
        pageTime: 1.5,       // reduced motion: seconds per page instead of scrolling
    },

    ending: {
        fadeTime: 1.2,       // the beach fades in
    },

    maxDelta: 1 / 30,        // longest step simulated in one frame (tab switch, lag spike)
    restartDelay: 0.4,       // ignore input right after a screen appears, so a late jump press doesn't act on it
    storageKey: 'mario-jump.best',   // best score of the campaign; infinite mode adds '.infinite'
};
