/* Player system: jump physics + choosing which sprite frame to show.
   player.y is the height of the feet above the ground (0 = standing). */
function createPlayer() {
    return {
        x: CONFIG.player.x,
        y: 0,
        velocityY: 0,        // positive = moving up
        onGround: true,
        animTime: 0,         // drives the looping idle / run animations
        landTimer: 0,        // > 0 right after touching down
        hurtTimer: 0,        // > 0 while the hurt frame is shown
        invulnerable: 0,     // > 0 after a hit: blinking, cannot be hit
    };
}

function updatePlayer(player, dt, wantsJump, jumpHeld) {
    const cfg = CONFIG.player;

    // Jumping is only possible from the ground, so key spam can't
    // restart or stack jumps in mid-air.
    if (player.onGround && wantsJump) {
        player.velocityY = cfg.jumpSpeed;
        player.onGround = false;
        input.jumpBuffer = 0;
    }

    // Variable jump height: letting go of the button while still rising
    // cuts the jump short. Hold = high jump, tap = short hop.
    if (!player.onGround && !jumpHeld && player.velocityY > cfg.jumpCutSpeed) {
        player.velocityY = cfg.jumpCutSpeed;
    }

    if (!player.onGround) {
        player.velocityY -= cfg.gravity * dt;
        player.y += player.velocityY * dt;

        if (player.y <= 0) {
            player.y = 0;
            player.velocityY = 0;
            player.onGround = true;
            player.landTimer = cfg.landTime;
        }
    }

    player.landTimer = Math.max(0, player.landTimer - dt);
    player.hurtTimer = Math.max(0, player.hurtTimer - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.animTime += dt;
}

/* state is the game state: 'menu' | 'playing' | 'gameover'. */
function getPlayerFrame(player, state) {
    const frames = SPRITE.frames;

    if (state === 'gameover' || player.hurtTimer > 0) return frames.hurt[0];

    if (!player.onGround) {
        // Pick the jump pose from the vertical speed: rising, apex, falling.
        const apexBand = CONFIG.player.jumpSpeed * 0.35;
        if (player.velocityY > apexBand) return frames.jump[1];
        if (player.velocityY < -apexBand) return frames.jump[3];
        return frames.jump[2];
    }

    if (state === 'menu') return loopFrame(frames.idle, SPRITE.fps.idle, player.animTime);
    if (player.landTimer > 0) return frames.jump[4];
    return loopFrame(frames.run, SPRITE.fps.run, player.animTime);
}

function loopFrame(frames, fps, time) {
    return frames[Math.floor(time * fps) % frames.length];
}

/* Collision box in screen coordinates (groundY = screen y of the ground). */
function getPlayerHitbox(player, groundY) {
    const box = CONFIG.player.hitbox;
    return {
        x: player.x + box.left,
        y: groundY - player.y - box.height,
        width: box.right - box.left,
        height: box.height,
    };
}

/* Called when the player touches an obstacle while vulnerable. */
function hurtPlayer(player) {
    player.hurtTimer = CONFIG.player.hurtTime;
    player.invulnerable = CONFIG.player.invulnerableTime;
}

function drawPlayer(ctx, image, player, state, groundY) {
    // Blink while invulnerable so the player can see they are safe.
    if (state === 'playing' && player.invulnerable > 0 && Math.floor(player.invulnerable * 10) % 2 === 1) return;
    drawSpriteFrame(ctx, image, getPlayerFrame(player, state), player.x, groundY - player.y);
}
