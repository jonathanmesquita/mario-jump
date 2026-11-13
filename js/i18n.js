/* Language system: every piece of interface text lives here.

   In index.html, an element with data-i18n="key" gets the text of that
   key; data-i18n-label="key" sets its aria-label instead.
   Place names (scenes.js) are proper names and stay in Portuguese. */
const LANGUAGES = {
    pt: {
        label: 'Português',
        htmlLang: 'pt-BR',
        text: {
            gameLabel: 'Jogo Arriba Jump',
            lives: 'Vidas',
            language: 'Idioma',
            score: 'Pontos',
            best: 'Recorde',
            play: 'Jogar',
            menuHint: 'Espaço, ↑ ou toque para pular.\nSegure para pular mais alto.',
            time: 'Tempo',
            reached: 'Chegou até',
            newRecord: 'Novo recorde!',
            retry: 'Tentar novamente',
            mainMenu: 'Menu principal',
            gameOverHint: 'Espaço = tentar novamente · Esc = menu',
            loadError: 'Não foi possível carregar',
        },
    },
    en: {
        label: 'English',
        htmlLang: 'en',
        text: {
            gameLabel: 'Arriba Jump game',
            lives: 'Lives',
            language: 'Language',
            score: 'Score',
            best: 'Best',
            play: 'Play',
            menuHint: 'Space, ↑ or tap to jump.\nHold to jump higher.',
            time: 'Time',
            reached: 'Reached',
            newRecord: 'New record!',
            retry: 'Try again',
            mainMenu: 'Main menu',
            gameOverHint: 'Space = try again · Esc = menu',
            loadError: 'Could not load',
        },
    },
    es: {
        label: 'Español',
        htmlLang: 'es',
        text: {
            gameLabel: 'Juego Arriba Jump',
            lives: 'Vidas',
            language: 'Idioma',
            score: 'Puntos',
            best: 'Récord',
            play: 'Jugar',
            menuHint: 'Espacio, ↑ o toca para saltar.\nMantén pulsado para saltar más alto.',
            time: 'Tiempo',
            reached: 'Llegaste hasta',
            newRecord: '¡Nuevo récord!',
            retry: 'Intentar de nuevo',
            mainMenu: 'Menú principal',
            gameOverHint: 'Espacio = intentar de nuevo · Esc = menú',
            loadError: 'No se pudo cargar',
        },
    },
    fr: {
        label: 'Français',
        htmlLang: 'fr',
        text: {
            gameLabel: 'Jeu Arriba Jump',
            lives: 'Vies',
            language: 'Langue',
            score: 'Points',
            best: 'Record',
            play: 'Jouer',
            menuHint: 'Espace, ↑ ou touchez pour sauter.\nMaintenez pour sauter plus haut.',
            time: 'Temps',
            reached: 'Arrivé jusqu’à',
            newRecord: 'Nouveau record !',
            retry: 'Réessayer',
            mainMenu: 'Menu principal',
            gameOverHint: 'Espace = réessayer · Échap = menu',
            loadError: 'Impossible de charger',
        },
    },
};

const DEFAULT_LANGUAGE = 'pt';
const LANGUAGE_STORAGE_KEY = 'arriba-jump.language';

const i18n = {
    current: DEFAULT_LANGUAGE,

    /* Text of a key in the current language. */
    t(key) {
        return LANGUAGES[this.current].text[key];
    },

    /* Switches language, rewrites every tagged element and remembers the choice. */
    set(code) {
        if (!LANGUAGES[code]) code = DEFAULT_LANGUAGE;
        this.current = code;
        document.documentElement.lang = LANGUAGES[code].htmlLang;

        for (const element of document.querySelectorAll('[data-i18n]')) {
            element.textContent = this.t(element.dataset.i18n);
        }
        for (const element of document.querySelectorAll('[data-i18n-label]')) {
            element.setAttribute('aria-label', this.t(element.dataset.i18nLabel));
        }
        for (const button of document.querySelectorAll('.btn-lang')) {
            button.setAttribute('aria-pressed', String(button.dataset.lang === code));
        }

        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
        } catch (error) {
            /* the choice just won't be remembered */
        }
    },

    /* Builds one button per language inside `container` and applies the saved choice. */
    init(container) {
        for (const code of Object.keys(LANGUAGES)) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-lang';
            button.dataset.lang = code;
            button.lang = LANGUAGES[code].htmlLang;
            button.textContent = LANGUAGES[code].label;
            button.addEventListener('click', () => {
                this.set(code);
                button.blur();   // so Space starts the game instead of pressing this again
            });
            container.appendChild(button);
        }

        let saved = null;
        try {
            saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        } catch (error) {
            /* storage blocked: use the default */
        }
        this.set(saved || DEFAULT_LANGUAGE);
    },
};
