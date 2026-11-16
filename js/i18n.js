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
            victoryTitle: 'Percurso concluído!',
            skipCredits: 'Pular créditos',
            endingTitle: 'Missão cumprida!',
            playAgain: 'Jogar novamente',
            endingHint: 'Espaço = jogar novamente · Esc = menu',
            creditsCreation: 'Criação e direção',
            creditsArt: 'Arte',
            creditsCode: 'Programação',
            creditsPlaces: 'Cenários',
            creditsThanks: 'Agradecimentos',
            creditsPlayer: 'E a você, por jogar',
            creditsEnd: 'Obrigado por jogar!',
            settings: 'Configurações',
            paused: 'Pausado',
            sound: 'Som',
            difficulty: 'Dificuldade crescente',
            mode: 'Modo de jogo',
            modeCampaign: 'Campanha',
            modeInfinite: 'Infinito',
            on: 'Ligado',
            off: 'Desligado',
            resume: 'Continuar',
            back: 'Voltar',
            menuOnly: 'Modo e dificuldade só mudam no menu principal.',
            settingsHint: 'P ou Esc = pausar e continuar',
            chooseCharacter: 'Escolha seu personagem',
            locked: 'Bloqueado',
            inactive: 'Inativo',
            lockedHint: 'bloqueado. Conclua fases para liberar.',
            inactiveHint: 'inativo, não pode ser escolhido.',
            comingSoon: 'Em breve: animação de jogo em produção.',
            comingSoonShort: 'Em breve',
            selectHint: 'Setas para navegar · Enter para escolher e jogar · Esc = menu',
            secretHint: 'o chefe secreto. Em breve.',
            chooseCharacterButton: 'Escolher personagem',
            changeCharacter: 'Trocar personagem',
            currentCharacter: 'Personagem',
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
            victoryTitle: 'Course complete!',
            skipCredits: 'Skip credits',
            endingTitle: 'Mission accomplished!',
            playAgain: 'Play again',
            endingHint: 'Space = play again · Esc = menu',
            creditsCreation: 'Created and directed by',
            creditsArt: 'Art',
            creditsCode: 'Programming',
            creditsPlaces: 'Locations',
            creditsThanks: 'Special thanks',
            creditsPlayer: 'And you, for playing',
            creditsEnd: 'Thanks for playing!',
            settings: 'Settings',
            paused: 'Paused',
            sound: 'Sound',
            difficulty: 'Increasing difficulty',
            mode: 'Game mode',
            modeCampaign: 'Campaign',
            modeInfinite: 'Endless',
            on: 'On',
            off: 'Off',
            resume: 'Resume',
            back: 'Back',
            menuOnly: 'Mode and difficulty can only be changed in the main menu.',
            settingsHint: 'P or Esc = pause and resume',
            chooseCharacter: 'Choose your character',
            locked: 'Locked',
            inactive: 'Inactive',
            lockedHint: 'locked. Complete stages to unlock.',
            inactiveHint: 'inactive, cannot be chosen.',
            comingSoon: 'Coming soon: gameplay animation in production.',
            comingSoonShort: 'Coming soon',
            selectHint: 'Arrows to move · Enter to choose and play · Esc = menu',
            secretHint: 'the secret boss. Coming soon.',
            chooseCharacterButton: 'Choose character',
            changeCharacter: 'Change character',
            currentCharacter: 'Character',
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
            victoryTitle: '¡Recorrido completado!',
            skipCredits: 'Saltar créditos',
            endingTitle: '¡Misión cumplida!',
            playAgain: 'Jugar de nuevo',
            endingHint: 'Espacio = jugar de nuevo · Esc = menú',
            creditsCreation: 'Creación y dirección',
            creditsArt: 'Arte',
            creditsCode: 'Programación',
            creditsPlaces: 'Escenarios',
            creditsThanks: 'Agradecimientos',
            creditsPlayer: 'Y a ti, por jugar',
            creditsEnd: '¡Gracias por jugar!',
            settings: 'Configuración',
            paused: 'En pausa',
            sound: 'Sonido',
            difficulty: 'Dificultad creciente',
            mode: 'Modo de juego',
            modeCampaign: 'Campaña',
            modeInfinite: 'Infinito',
            on: 'Activado',
            off: 'Desactivado',
            resume: 'Continuar',
            back: 'Volver',
            menuOnly: 'El modo y la dificultad solo se cambian en el menú principal.',
            settingsHint: 'P o Esc = pausar y continuar',
            chooseCharacter: 'Elige tu personaje',
            locked: 'Bloqueado',
            inactive: 'Inactivo',
            lockedHint: 'bloqueado. Completa fases para desbloquearlo.',
            inactiveHint: 'inactivo, no se puede elegir.',
            comingSoon: 'Próximamente: animación de juego en producción.',
            comingSoonShort: 'Próximamente',
            selectHint: 'Flechas para moverte · Enter para elegir y jugar · Esc = menú',
            secretHint: 'el jefe secreto. Próximamente.',
            chooseCharacterButton: 'Elegir personaje',
            changeCharacter: 'Cambiar personaje',
            currentCharacter: 'Personaje',
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
            victoryTitle: 'Parcours terminé !',
            skipCredits: 'Passer le générique',
            endingTitle: 'Mission accomplie !',
            playAgain: 'Rejouer',
            endingHint: 'Espace = rejouer · Échap = menu',
            creditsCreation: 'Création et direction',
            creditsArt: 'Graphismes',
            creditsCode: 'Programmation',
            creditsPlaces: 'Décors',
            creditsThanks: 'Remerciements',
            creditsPlayer: 'Et à vous, pour avoir joué',
            creditsEnd: 'Merci d’avoir joué !',
            settings: 'Paramètres',
            paused: 'En pause',
            sound: 'Son',
            difficulty: 'Difficulté croissante',
            mode: 'Mode de jeu',
            modeCampaign: 'Campagne',
            modeInfinite: 'Infini',
            on: 'Activé',
            off: 'Désactivé',
            resume: 'Reprendre',
            back: 'Retour',
            menuOnly: 'Le mode et la difficulté ne se changent que dans le menu principal.',
            settingsHint: 'P ou Échap = pause et reprise',
            chooseCharacter: 'Choisissez votre personnage',
            locked: 'Verrouillé',
            inactive: 'Inactif',
            lockedHint: 'verrouillé. Terminez des niveaux pour le débloquer.',
            inactiveHint: 'inactif, ne peut pas être choisi.',
            comingSoon: 'Bientôt : animation de jeu en cours de production.',
            comingSoonShort: 'Bientôt',
            selectHint: 'Flèches pour naviguer · Entrée pour choisir et jouer · Échap = menu',
            secretHint: 'le boss secret. Bientôt.',
            chooseCharacterButton: 'Choisir le personnage',
            changeCharacter: 'Changer de personnage',
            currentCharacter: 'Personnage',
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
