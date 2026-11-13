/* Input system: turns keyboard / mouse / touch into one "jump" action.
   The rest of the game never touches DOM events. */
const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];

const input = {
    jumpHeld: false,   // true while a jump key / pointer is down
    jumpBuffer: 0,     // seconds left in which a recent press still counts
    onPress: null,     // set by game.js: called once per physical press, with 'key' or 'pointer'
    onCancel: null,    // set by game.js: called when Escape is pressed

    press(source) {
        this.jumpHeld = true;
        this.jumpBuffer = CONFIG.player.jumpBuffer;
        if (this.onPress) this.onPress(source);
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
            if (event.code === 'Escape') {
                if (this.onCancel) this.onCancel();
                return;
            }
            if (!JUMP_KEYS.includes(event.code)) return;
            // A focused button keeps its normal keyboard behaviour.
            if (event.target.closest('button')) return;
            event.preventDefault();                 // Space / ArrowUp would scroll the page
            if (!event.repeat) this.press('key');   // ignore OS key auto-repeat
        });

        document.addEventListener('keyup', (event) => {
            if (JUMP_KEYS.includes(event.code)) this.release();
        });

        target.addEventListener('pointerdown', (event) => {
            if (event.target.closest('button')) return;   // buttons handle their own clicks
            event.preventDefault();
            this.press('pointer');
        });
        window.addEventListener('pointerup', () => this.release());
        window.addEventListener('pointercancel', () => this.release());

        // If the window loses focus we never get the keyup: don't stay "held".
        window.addEventListener('blur', () => this.release());
    },
};
