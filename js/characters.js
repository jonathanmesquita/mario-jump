/* Character system: the roster, unlocks by progress, and the selection screen.

   images/characters/portraits/manifest.json is the art inventory delivered
   with the portraits. The game reads the list below instead (fetching JSON
   does not work when index.html is opened straight from disk), so keep
   both in step when a character is added or changes status.

   Portraits: one PNG per character, 1774x887, two square cells of 887x887.
   The left half is the normal expression, the right half the "selected" one.
   CSS shows one half at a time (see .character-portrait in style.css).

   Each character:
     id          unique key
     name        proper name, the same in every language
     portrait    path of the two-expression PNG
     status      'available' = playable from the start
                 'locked'    = unlocked by completing a scene (see unlockScene)
                 'secret'    = the boss, shown as "?" with its silhouette portrait;
                 stays locked unless revealOnCampaignWin is true
                 'inactive'  = shown grey with an X and not selectable, unless it
                 has unlockAfterWins (hidden cheat, see below)
     unlockAfterWins  an 'inactive' character with this becomes available
                 after the campaign has been won that many times
     unlockScene index in SCENES (0 = Avenida Paulista ... 5 = The Office) whose
                 completion unlocks a 'locked' character. null = not decided yet,
                 so the character stays locked.
     playable    true only when the character has its own gameplay sprite sheet
                 (see SPRITES in sprite.js). An unlocked character without one
                 can be picked on this screen but cannot start a run yet
                 ("coming soon"). */
const CHARACTERS = [
    { id: 'arriba',          name: 'Arriba',          status: 'available', playable: true },
    { id: 'ariel',           name: 'Ariel',           status: 'available', playable: true },
    { id: 'amaury-caldeira', name: 'Amaury Caldeira', status: 'available', playable: true },
    { id: 'ana-caroline',    name: 'Ana Caroline',    status: 'available', playable: true },
    { id: 'milena',          name: 'Milena',          status: 'available', playable: true },
    // Mateus Prioro: roster slot ready, but his art is not delivered yet. Until it
    // is, he borrows the silhouette portrait and shows "coming soon". When the
    // art exists: drop portrait-mateus-prioro-01.webp in images/characters/portraits/,
    // remove the portrait line, set playable: true, and add his sheets to
    // SPRITES (sprite.js) and ENDING.characters (ending.js).
    { id: 'mateus-prioro',   name: 'Mateus Prioro',   status: 'available', playable: false,
      portrait: './images/characters/portraits/portrait-chefe-secreto-01.webp' },
    // Hidden cheat: finishing the campaign twice brings Ananias back.
    { id: 'ananias',         name: 'Ananias',         status: 'inactive', playable: true, unlockAfterWins: 2 },
    // The secret boss. For now it always stays locked: its face, gameplay and
    // ending art do not exist yet. To reveal it later after a won campaign,
    // set revealOnCampaignWin: true, its real name and playable: true, and add
    // its sheets to SPRITES (sprite.js) and ENDING.characters (ending.js).
    // It is the boss, not a "random character" button.
    { id: 'chefe-secreto',   name: '?',               status: 'secret',    playable: false, revealOnCampaignWin: false },
];

for (const character of CHARACTERS) {
    character.portrait = character.portrait || `./images/characters/portraits/portrait-${character.id}-01.webp`;
}

/* CSS url() inside a custom property is resolved against the stylesheet
   (css/), not the page, so the portrait path is made absolute first. */
function portraitUrl(character) {
    return `url("${new URL(character.portrait, document.baseURI).href}")`;
}

const DEFAULT_CHARACTER = 'arriba';
const CHARACTER_STORAGE_KEY = 'arriba-jump.characters';
const GRID_COLUMNS = 4;   // keep in step with .character-grid in style.css

/* ---------- progress ---------- */

const roster = {
    selected: DEFAULT_CHARACTER,
    completedScenes: [],   // indexes of SCENES the player has completed at least once
    campaignWins: 0,       // how many times the campaign was finished

    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(CHARACTER_STORAGE_KEY)) || {};
            if (Array.isArray(saved.completedScenes)) {
                this.completedScenes = saved.completedScenes.filter(Number.isInteger);
            }
            if (Number.isInteger(saved.campaignWins)) this.campaignWins = saved.campaignWins;
            else if (saved.campaignWon === true) this.campaignWins = 1;   // saved by an older version
            if (saved.selected && this.canPlay(this.get(saved.selected))) this.selected = saved.selected;
        } catch (error) {
            /* nothing saved, or storage blocked: start from scratch */
        }
    },

    save() {
        try {
            localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify({
                selected: this.selected,
                completedScenes: this.completedScenes,
                campaignWins: this.campaignWins,
            }));
        } catch (error) {
            /* progress just won't be remembered */
        }
    },

    get(id) {
        return CHARACTERS.find((character) => character.id === id);
    },

    /* 'available', 'locked' or 'inactive'. */
    statusOf(character) {
        if (!character) return 'inactive';
        if (character.status === 'inactive') {
            const wins = character.unlockAfterWins;
            return wins && this.campaignWins >= wins ? 'available' : 'inactive';
        }
        if (character.status === 'available') return 'available';
        if (character.status === 'secret') {
            return character.revealOnCampaignWin && this.campaignWins > 0 ? 'available' : 'locked';
        }
        const unlocked = character.unlockScene !== null && character.unlockScene !== undefined
            && this.completedScenes.includes(character.unlockScene);
        return unlocked ? 'available' : 'locked';
    },

    canPlay(character) {
        return this.statusOf(character) === 'available' && character.playable === true;
    },

    /* Records a won campaign. Returns the characters it unlocked, if any. */
    winCampaign() {
        const lockedBefore = CHARACTERS.filter((character) => this.statusOf(character) !== 'available');
        this.campaignWins += 1;
        this.save();
        return lockedBefore.filter((character) => this.statusOf(character) === 'available');
    },

    /* The name to show: the secret character stays "?" until revealed. */
    displayName(character) {
        return character.status === 'secret' && this.statusOf(character) !== 'available'
            ? '?' : character.name;
    },

    /* Records a completed scene. Returns the characters it unlocked, if any. */
    completeScene(index) {
        if (index < 0 || this.completedScenes.includes(index)) return [];
        const lockedBefore = CHARACTERS.filter((character) => this.statusOf(character) === 'locked');
        this.completedScenes.push(index);
        this.save();
        return lockedBefore.filter((character) => this.statusOf(character) === 'available');
    },
};

/* ---------- selection screen ---------- */

const characterSelect = {
    grid: null,
    cards: [],
    message: '',        // explains why a locked / inactive card can't be picked
    onChange: null,     // set by game.js
    onConfirm: null,    // set by game.js: choosing the already chosen character starts the game

    /* Builds one card per character, once. */
    build(grid) {
        this.grid = grid;
        for (const character of CHARACTERS) {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'character-card';
            card.dataset.id = character.id;
            card.innerHTML = '<span class="character-portrait"></span>'
                + '<span class="card-name"></span>'
                + '<span class="card-badge" aria-hidden="true"></span>';
            card.querySelector('.character-portrait').style.setProperty('--portrait-url', portraitUrl(character));
            card.addEventListener('click', () => this.choose(character.id));
            grid.appendChild(card);
            this.cards.push(card);
        }
        grid.addEventListener('keydown', (event) => this.handleArrows(event));
    },

    choose(id) {
        const character = roster.get(id);
        const status = roster.statusOf(character);
        if (status === 'available') {
            // Second Enter / click on the chosen character confirms it.
            if (roster.selected === id && roster.canPlay(character) && this.onConfirm) {
                this.onConfirm();
                return;
            }
            roster.selected = id;
            this.message = '';
            if (roster.canPlay(character)) roster.save();   // only remember playable choices
        } else {
            const hint = character.status === 'secret' ? 'secretHint' : status === 'locked' ? 'lockedHint' : 'inactiveHint';
            this.message = `${roster.displayName(character)}: ${i18n.t(hint)}`;
        }
        this.refresh();
        if (this.onChange) this.onChange();
    },

    /* Arrow keys move the focus around the grid. */
    handleArrows(event) {
        const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -GRID_COLUMNS, ArrowDown: GRID_COLUMNS };
        const step = steps[event.key];
        if (!step) return;
        event.preventDefault();
        const current = Math.max(this.cards.indexOf(document.activeElement), 0);
        let next = current + step;
        if (Math.abs(step) === 1) {
            next = (next + this.cards.length) % this.cards.length;   // left / right wrap around
        } else if (next < 0 || next >= this.cards.length) {
            return;   // up / down stop at the edge of the grid
        }
        this.cards[next].focus();
    },

    /* Writes states, labels and the preview in the current language. */
    refresh() {
        const statusText = { locked: i18n.t('locked'), inactive: i18n.t('inactive'), available: '' };

        for (const card of this.cards) {
            const character = roster.get(card.dataset.id);
            const status = roster.statusOf(character);
            const selected = character.id === roster.selected;
            const name = roster.displayName(character);
            card.querySelector('.card-name').textContent = name;
            card.classList.toggle('is-locked', status === 'locked');
            card.classList.toggle('is-secret', character.status === 'secret');
            card.classList.toggle('is-inactive', status === 'inactive');
            card.querySelector('.character-portrait').dataset.selected = String(selected);
            card.querySelector('.card-badge').textContent = status === 'locked' ? '🔒' : status === 'inactive' ? i18n.t('inactive') : '';
            card.setAttribute('aria-pressed', String(selected));
            card.setAttribute('aria-disabled', String(status !== 'available'));
            card.setAttribute('aria-label', statusText[status] ? `${name}, ${statusText[status]}` : name);
        }

        const chosen = roster.get(roster.selected);
        const preview = document.querySelector('.preview-portrait');
        preview.style.setProperty('--portrait-url', portraitUrl(chosen));
        document.querySelector('.preview-name').textContent = roster.displayName(chosen);

        const playable = roster.canPlay(chosen);
        document.querySelector('.preview-status').textContent = this.message || (playable ? '' : i18n.t('comingSoon'));
        const playButton = document.querySelector('.btn-select-play');
        playButton.disabled = !playable;
        playButton.textContent = i18n.t(playable ? 'play' : 'comingSoonShort');
    },

    focusSelected() {
        const card = this.cards.find((each) => each.dataset.id === roster.selected);
        if (card) card.focus();
    },
};

/* Preloads the portraits so the cards don't pop in one by one. */
function preloadPortraits() {
    for (const character of CHARACTERS) new Image().src = character.portrait;
}
