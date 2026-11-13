/* Sprite sheet description for images/personagem/sprite-arriba-jump-01.png (1402x1122).

   The sheet is a 5x4 layout, but the frames are NOT on a uniform grid:
   they differ in size and spacing. So each frame is listed explicitly as
       [x, y, width, height, anchorX]
   (x, y, width, height) is the tight box around the character in the sheet.
   anchorX is the horizontal centre of the hat inside that box; the bottom
   edge of the box is the feet. Drawing every frame with the anchor at the
   same screen point keeps the character from jittering between frames. */
const SPRITE = {
    src: './images/personagem/sprite-arriba-jump-01.png',
    scale: 0.6,                                  // sheet px -> screen px

    frames: {
        // Row 1: standing / breathing
        idle: [
            [89, 35, 167, 232, 92],
            [352, 31, 166, 236, 93],
            [615, 30, 166, 237, 92],
            [876, 36, 166, 231, 92],
            [1140, 36, 165, 231, 91],
        ],
        // Row 2: run cycle
        run: [
            [61, 311, 199, 227, 123],
            [329, 314, 204, 222, 130],
            [596, 306, 208, 206, 133],
            [864, 319, 201, 219, 125],
            [1128, 321, 207, 216, 130],
        ],
        // Row 3: jump = crouch, take-off, apex, fall, land
        jump: [
            [61, 634, 195, 186, 120],
            [314, 585, 198, 216, 123],
            [580, 558, 207, 209, 123],
            [856, 594, 196, 216, 116],
            [1133, 618, 195, 203, 115],
        ],
        // Row 4: duck, hurt, victory, idle facing left, run facing left
        duck:     [[72, 914, 190, 179, 113]],
        hurt:     [[313, 856, 208, 230, 101]],
        victory:  [[596, 849, 185, 239, 98]],
        idleLeft: [[870, 861, 163, 227, 73]],
        runLeft:  [[1128, 862, 197, 225, 77]],
    },

    // Frames per second of the looping animations.
    fps: { idle: 5, run: 12 },
};

/* Draws one frame with its anchor at (x, feetY) in screen coordinates. */
function drawSpriteFrame(ctx, image, frame, x, feetY) {
    const [sx, sy, sw, sh, anchorX] = frame;
    const scale = SPRITE.scale;
    ctx.drawImage(
        image,
        sx, sy, sw, sh,
        Math.round(x - anchorX * scale),
        Math.round(feetY - sh * scale),
        sw * scale,
        sh * scale
    );
}
