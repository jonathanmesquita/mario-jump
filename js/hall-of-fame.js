/* Hall of Fame screen: draws the leaderboard (leaderboard.js) in the
   arcade style of the menus. Opened from the "Placar" button. */

/* Pixel trophy: a fictional golden bonbon on a wooden stand.
   K outline, Y gold, O gold shadow, W shine, B wood, R ribbon. */
const TROPHY_PIXELS = [
    '..KK......KK..',
    '.KYOK....KOYK.',
    '.KYYOKKKKOYYK.',
    '..KKYYYYYYKK..',
    '.KYYWWYYYYYOK.',
    'KYYWWYYYYYYOOK',
    'KYYWYYYYYYYOOK',
    'KRRRRRRRRRRRRK',
    'KYYYYYYYYYOOOK',
    '.KYYYYYYYOOOK.',
    '..KKOOOOOOKK..',
    '....KKKKKK....',
    '.....KBBK.....',
    '...KKBBBBKK...',
    '...KBBBBBBK...',
    '...KKKKKKKK...',
];
const TROPHY_COLORS = { K: '#2a1a00', Y: '#ffd24a', O: '#c98a12', W: '#fff6c0', B: '#7a5420', R: '#2f8a3a' };

function trophySvg(size) {
    const rects = [];
    TROPHY_PIXELS.forEach((row, y) => {
        [...row].forEach((cell, x) => {
            if (TROPHY_COLORS[cell]) rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${TROPHY_COLORS[cell]}"/>`);
        });
    });
    return `<svg class="trophy" width="${size}" height="${size * 16 / 14}" viewBox="0 0 14 16" `
        + `shape-rendering="crispEdges" aria-hidden="true">${rects.join('')}</svg>`;
}

const hallOfFame = {
    tab: 'season',
    openRow: null,

    /* Characters shown on the board: never the secret boss before it is revealed. */
    isVisible(characterId) {
        const character = roster.get(characterId);
        if (!character) return false;
        return character.status !== 'secret' || roster.statusOf(character) === 'available';
    },

    monthName(season) {
        try {
            return new Intl.DateTimeFormat(LANGUAGES[i18n.current].htmlLang, { month: 'long', year: 'numeric', timeZone: 'UTC' })
                .format(new Date(`${season}-15T12:00:00Z`));
        } catch (error) {
            return season;
        }
    },

    valueOf(row, tab) {
        return { season: row.season, total: row.total, best: row.best }[tab];
    },

    portrait(characterId, className) {
        const character = roster.get(characterId);
        // The url() contains quotes, so it is escaped to stay inside the attribute.
        return `<span class="character-portrait ${className}" style="--portrait-url: ${this.escape(portraitUrl(character))}"></span>`;
    },

    escape(text) {
        return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    },

    nameOf(characterId) {
        return this.escape(roster.displayName(roster.get(characterId)));
    },

    render() {
        const t = (key) => i18n.t(key);
        leaderboard.closeFinishedSeasons();

        // Highlights: this month's provisional leader and the last champion.
        const season = leaderboard.currentSeason();
        const leader = leaderboard.seasonLeader(season);
        const champion = leaderboard.lastChampion();
        let highlights = `<div class="board-card">
            <p class="board-card-label">${t('currentLeader')} · ${this.escape(this.monthName(season))}</p>`;
        highlights += leader && this.isVisible(leader.characterId)
            ? `<div class="board-card-body">${this.portrait(leader.characterId, 'board-portrait')}
                   <div><p class="board-card-name">${this.nameOf(leader.characterId)}</p>
                   <p>${leader.points} ${t('pointsShort')}</p></div></div>`
            : `<p class="board-card-empty">${t('noLeaderYet')}</p>`;
        highlights += '</div>';
        if (champion && this.isVisible(champion.characterId)) {
            highlights += `<div class="board-card board-card-champion">
                <p class="board-card-label">${t('employeeOfMonth')} · ${this.escape(this.monthName(champion.season))}</p>
                <div class="board-card-body">${trophySvg(34)}${this.portrait(champion.characterId, 'board-portrait')}
                    <div><p class="board-card-name">${this.nameOf(champion.characterId)}</p>
                    <p>${champion.points} ${t('pointsShort')} · ${t('trophyName')}</p></div></div>
                <p class="board-card-message">${t('trophyMessage')}</p>
            </div>`;
        }
        document.querySelector('.board-highlights').innerHTML = highlights;

        for (const button of document.querySelectorAll('.board-tab')) {
            const selected = button.dataset.tab === this.tab;
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected ? 0 : -1;
        }

        // Podium and list for the chosen tab.
        const rows = leaderboard.ranked(this.tab).filter((row) => row.runs > 0 && this.isVisible(row.characterId));
        const content = document.querySelector('.board-content');
        if (rows.length === 0) {
            content.innerHTML = `<p class="board-empty">${t('emptyBoard')}</p>`;
            return;
        }

        const scored = rows.filter((row) => this.valueOf(row, this.tab) > 0).slice(0, 3);
        const places = [1, 0, 2].filter((index) => scored[index]);   // 2nd, 1st, 3rd
        let html = '<div class="podium">' + places.map((index) => {
            const row = scored[index];
            return `<div class="podium-place podium-${index + 1}">
                ${index === 0 ? trophySvg(22) : ''}
                ${this.portrait(row.characterId, 'podium-portrait')}
                <p class="podium-name">${this.nameOf(row.characterId)}</p>
                <p class="podium-value">${this.valueOf(row, this.tab)}</p>
                <div class="podium-block">${index + 1}º</div>
            </div>`;
        }).join('') + '</div>';

        html += `<div class="board-list" role="table" aria-label="${t('board')}">
            <div class="board-row board-head" role="row">
                <span role="columnheader">#</span><span role="columnheader"></span>
                <span role="columnheader">${t('colSeason')}</span>
                <span role="columnheader">${t('colTotal')}</span>
                <span role="columnheader">${t('best')}</span>
            </div>`;
        rows.forEach((row, index) => {
            const open = this.openRow === row.characterId;
            html += `<button type="button" class="board-row" role="row" data-id="${row.characterId}" aria-expanded="${open}">
                <span role="cell">${index + 1}</span>
                <span role="cell" class="board-who">${this.portrait(row.characterId, 'list-portrait')}<span class="board-name">${this.nameOf(row.characterId)}</span></span>
                <span role="cell">${row.season}</span><span role="cell">${row.total}</span><span role="cell">${row.best}</span>
            </button>`;
            if (open) {
                html += `<div class="board-detail" role="row"><span role="cell">
                    ${t('colTotal')}: ${row.total} · ${t('best')}: ${row.best} · ${t('runs')}: ${row.runs}
                    · ${t('wins')}: ${row.wins} · ${t('trophies')}: ${row.trophies}</span></div>`;
            }
        });
        html += '</div>';
        content.innerHTML = html;
    },

    /* Wires the tabs and rows once. */
    init(screen) {
        for (const button of screen.querySelectorAll('.board-tab')) {
            button.addEventListener('click', () => {
                this.tab = button.dataset.tab;
                this.render();
                button.focus();
            });
        }
        // Left / right arrows move between the tabs.
        screen.querySelector('.board-tabs').addEventListener('keydown', (event) => {
            const tabs = [...screen.querySelectorAll('.board-tab')];
            const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
            if (!step) return;
            event.preventDefault();
            const next = tabs[(tabs.findIndex((tab) => tab.dataset.tab === this.tab) + step + tabs.length) % tabs.length];
            next.click();
        });
        // A row opens its character's details.
        screen.querySelector('.board-content').addEventListener('click', (event) => {
            const row = event.target.closest('.board-row[data-id]');
            if (!row) return;
            this.openRow = this.openRow === row.dataset.id ? null : row.dataset.id;
            this.render();
            const again = screen.querySelector(`.board-row[data-id="${row.dataset.id}"]`);
            if (again) again.focus();
        });
    },
};
