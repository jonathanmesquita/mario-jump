/* Input system: turns keyboard / mouse / touch into one "jump" action.
   The rest of the game never touches DOM events. */
const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];

const input = {
    jumpHeld: false,   // true while a jump key / pointer is down
    jumpBuffer: 0,     // seconds left in which a recent press still counts
    onPress: null,     // set by game.js: called once per physical press

    press() {
        this.jumpHeld = true;
        this.jumpBuffer = CONFIG.player.jumpBuffer;
        if (this.onPress) this.onPress();
    },

    release() {
        this.jumpHeld = false;
    },

    /* Forget any pending press (used when the game starts or restarts). */
    clear() {
        this.jumpHeld = false;
        this.jumpBuffer = 0;
    },

    update(dt) {
        this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    },

    wantsJump() {
        return this.jumpHeld || this.jumpBuffer > 0;
    },

    /* Listeners are attached exactly once, for the lifetime of the page. */
    init(target) {
        document.addEventListener('keydown', (event) => {
            if (!JUMP_KEYS.includes(event.code)) return;
            event.preventDefault();          // Space / ArrowUp would scroll the page
            if (!event.repeat) this.press(); // ignore OS key auto-repeat
        });

        document.addEventListener('keyup', (event) => {
            if (JUMP_KEYS.includes(event.code)) this.release();
        });

        target.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            this.press();
        });
        window.addEventListener('pointerup', () => this.release());
        window.addEventListener('pointercancel', () => this.release());

        // If the window loses focus we never get the keyup: don't stay "held".
        window.addEventListener('blur', () => this.release());
    },
};
