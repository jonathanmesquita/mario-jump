/* Gameplay sprite sheets, one per character. All sheets are 1402x1122 with
   a 5x4 layout:
     row 1  idle (5 frames)
     row 2  run (5 frames)
     row 3  jump: crouch, take-off, apex, fall, land
     row 4  Arriba: duck, hurt, victory, idle facing left, run facing left
            colleagues: duck, hurt, then 3 frames of their own celebration

   The frames are NOT on a uniform grid: they differ in size and spacing.
   So each frame is listed explicitly as
       [x, y, width, height, anchorX]
   (x, y, width, height) is the tight box around the character in the sheet.
   anchorX is the horizontal centre of the head (Arriba: of the hat) inside
   that box; the bottom edge of the box is the feet. Drawing every frame with
   the anchor at the same screen point keeps the character from jittering.
   The colleagues' tables were measured from their PNGs; re-measure them if
   a sheet is redrawn. */
const SPRITES = {
    // Arriba: images/characters/sprite-arriba-jump-01.webp
    arriba: {
    src: './images/characters/sprite-arriba-jump-01.webp',
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
    fps: { idle: 5, run: 12, victory: 4 },
    },

    // Ariel: garrafinha rosa
    'ariel': {
        src: './images/characters/animations/sprite-ariel-animacao-02.webp',
        scale: 0.6,
        frames: {
            idle: [[107, 40, 116, 228, 60], [372, 36, 113, 232, 60], [635, 34, 114, 234, 62], [899, 42, 117, 226, 60], [1163, 42, 118, 226, 60]],
            run: [[80, 318, 152, 220, 98], [356, 318, 142, 212, 95], [612, 309, 169, 205, 104], [902, 321, 135, 217, 84], [1165, 324, 145, 222, 97]],
            jump: [[80, 635, 143, 185, 92], [347, 597, 150, 208, 87], [601, 568, 174, 189, 94], [882, 599, 128, 210, 75], [1146, 626, 136, 194, 84]],
            duck: [[79, 907, 145, 184, 94]],
            hurt: [[334, 865, 181, 226, 76]],
            victory: [[601, 865, 178, 226, 81], [870, 862, 173, 229, 78], [1137, 861, 194, 230, 82]],
        },
        fps: { idle: 5, run: 12, victory: 4 },
    },

    // Amaury Caldeira: banjo
    'amaury-caldeira': {
        src: './images/characters/animations/sprite-amaury-caldeira-animacao-02.webp',
        scale: 0.6,
        frames: {
            idle: [[93, 43, 138, 225, 66], [361, 43, 139, 225, 66], [629, 39, 138, 229, 68], [899, 50, 139, 218, 69], [1173, 47, 139, 221, 67]],
            run: [[62, 321, 174, 213, 108], [351, 320, 158, 214, 92], [602, 310, 188, 197, 119], [902, 325, 152, 209, 86], [1164, 326, 151, 208, 102]],
            jump: [[65, 625, 151, 182, 98], [333, 586, 166, 205, 94], [602, 562, 186, 190, 99], [887, 590, 156, 214, 89], [1157, 608, 149, 199, 88]],
            duck: [[65, 903, 156, 183, 105]],
            hurt: [[337, 845, 177, 242, 86]],
            victory: [[598, 856, 193, 231, 61], [875, 854, 197, 233, 55], [1149, 854, 201, 233, 60]],
        },
        fps: { idle: 5, run: 12, victory: 4 },
    },

    // Ana Caroline: chocolate e "negativo"
    'ana-caroline': {
        src: './images/characters/animations/sprite-ana-caroline-animacao-02.webp',
        scale: 0.6,
        frames: {
            idle: [[115, 35, 117, 235, 59], [377, 34, 120, 236, 62], [641, 29, 121, 241, 62], [904, 37, 120, 233, 61], [1167, 35, 119, 235, 59]],
            run: [[79, 320, 152, 211, 99], [353, 320, 141, 209, 88], [616, 309, 156, 186, 88], [877, 321, 157, 210, 94], [1150, 326, 141, 202, 89]],
            jump: [[86, 628, 130, 171, 86], [342, 585, 152, 210, 83], [608, 563, 156, 176, 84], [876, 593, 147, 200, 89], [1149, 611, 138, 188, 80]],
            duck: [[87, 908, 136, 187, 90]],
            hurt: [[332, 834, 177, 249, 93]],
            victory: [[614, 846, 130, 250, 60], [870, 846, 150, 250, 75], [1133, 848, 165, 248, 81]],
        },
        fps: { idle: 5, run: 12, victory: 4 },
    },

    // Milena: dança
    'milena': {
        src: './images/characters/animations/sprite-milena-animacao-02.webp',
        scale: 0.6,
        frames: {
            idle: [[103, 32, 113, 231, 69], [368, 32, 117, 231, 71], [629, 28, 123, 235, 76], [893, 35, 123, 228, 77], [1167, 35, 116, 228, 69]],
            run: [[78, 310, 159, 219, 105], [346, 310, 152, 218, 100], [601, 304, 173, 192, 111], [864, 313, 171, 214, 113], [1144, 316, 157, 213, 101]],
            jump: [[76, 624, 148, 183, 98], [337, 590, 154, 205, 103], [593, 563, 182, 189, 96], [859, 595, 162, 207, 96], [1139, 615, 157, 193, 102]],
            duck: [[76, 905, 153, 182, 100]],
            hurt: [[324, 836, 188, 251, 103]],
            victory: [[595, 838, 173, 250, 70], [861, 835, 174, 255, 80], [1124, 864, 189, 226, 83]],
        },
        fps: { idle: 5, run: 12, victory: 4 },
    },

    // Ananias: computador (inactive)
    'ananias': {
        src: './images/characters/animations/sprite-ananias-animacao-02.webp',
        scale: 0.6,
        frames: {
            idle: [[115, 23, 116, 245, 61], [391, 23, 116, 245, 59], [651, 21, 117, 247, 61], [910, 29, 117, 239, 61], [1176, 30, 112, 238, 58]],
            run: [[75, 312, 165, 223, 107], [351, 313, 158, 217, 104], [616, 300, 165, 202, 101], [895, 314, 145, 219, 89], [1149, 317, 167, 216, 108]],
            jump: [[83, 623, 152, 186, 95], [353, 583, 150, 201, 93], [615, 561, 171, 188, 93], [891, 586, 141, 217, 85], [1155, 621, 153, 188, 96]],
            duck: [[79, 901, 171, 194, 112]],
            hurt: [[328, 837, 181, 258, 98]],
            victory: [[579, 857, 214, 239, 78], [846, 858, 216, 238, 85], [1108, 852, 229, 245, 88]],
        },
        fps: { idle: 5, run: 12, victory: 4 },
    },
};

/* Draws one frame with its anchor at (x, feetY) in screen coordinates. */
function drawSpriteFrame(ctx, image, frame, x, feetY, scale) {
    const [sx, sy, sw, sh, anchorX] = frame;
    ctx.drawImage(
        image,
        sx, sy, sw, sh,
        Math.round(x - anchorX * scale),
        Math.round(feetY - sh * scale),
        sw * scale,
        sh * scale
    );
}
