/* Collision system: plain axis-aligned rectangle overlap.
   A box is { x, y, width, height } in screen px. */
function boxesOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function playerHitsObstacle(player, obstacles, groundY) {
    const playerBox = getPlayerHitbox(player, groundY);
    return obstacles.pipes.some((pipe) => boxesOverlap(playerBox, getPipeHitbox(pipe, groundY)));
}
