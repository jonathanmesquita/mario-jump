/* Settings system: the player's choices, remembered between visits.
   The settings screen itself is built and handled in game.js. */
const SETTINGS_STORAGE_KEY = 'arriba-jump.settings';

const settings = {
    sound: true,            // sound effects on / off
    difficulty: true,       // true = the game speeds up as the score grows
    mode: 'campaign',       // 'campaign' (ends with the credits) or 'infinite' (never ends)

    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || {};
            if (typeof saved.sound === 'boolean') this.sound = saved.sound;
            if (typeof saved.difficulty === 'boolean') this.difficulty = saved.difficulty;
            if (saved.mode === 'campaign' || saved.mode === 'infinite') this.mode = saved.mode;
        } catch (error) {
            /* nothing saved, or storage blocked: keep the defaults */
        }
    },

    save() {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
                sound: this.sound,
                difficulty: this.difficulty,
                mode: this.mode,
            }));
        } catch (error) {
            /* the choices just won't be remembered */
        }
    },
};
