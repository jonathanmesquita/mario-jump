/* Hall of Fame: local leaderboard per character (MVP, this browser only).

   Saved in localStorage under LEADERBOARD_KEY. It lives only in this browser
   on this device: it is not a world ranking and can be lost if the site data
   is cleared. The game's own best score (mario-jump.best) is left untouched;
   it never recorded which character made it, so it cannot be moved here.

   Data (version 1):
     characters   { [characterId]: { total, best, bestAt, runs, wins } }
     seasons      { [YYYY-MM]: { [characterId]: { [YYYY-MM-DD]: { score, at } } } }
                  only the best run of each day, per character, is kept
     champions    { [YYYY-MM]: { characterId, points, best, closedAt } }
     recentRunIds the last runIds recorded, so one run is never counted twice

   Three numbers, kept apart on purpose:
     total   every valid run added up (long-term progress)
     best    highest single run (arcade skill)
     season  sum of the best run of each day in the month (decides the
             "Funcionário do Mês", so replaying hundreds of times doesn't win)

   A future online version can send the same run objects to a server; nothing
   here talks to the network. */
const LEADERBOARD_KEY = 'arribaJumpLeaderboardV1';
const SEASON_TIME_ZONE = 'America/Sao_Paulo';
const RECENT_RUN_IDS = 200;

function emptyLeaderboard() {
    return { version: 1, characters: {}, seasons: {}, champions: {}, recentRunIds: [] };
}

/* Day and month of a date in the season's time zone. */
function seasonDateKeys(date) {
    let year, month, day;
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: SEASON_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
        }).formatToParts(date);
        const get = (type) => parts.find((part) => part.type === type).value;
        year = get('year'); month = get('month'); day = get('day');
    } catch (error) {
        // Very old browsers without time zone support: use the device's own clock.
        year = String(date.getFullYear());
        month = String(date.getMonth() + 1).padStart(2, '0');
        day = String(date.getDate()).padStart(2, '0');
    }
    return { season: `${year}-${month}`, day: `${year}-${month}-${day}` };
}

function newRunId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const leaderboard = {
    data: emptyLeaderboard(),
    now: () => new Date(),   // replaced in tests to simulate other days and months
    // Which characters can lead or win a month. game.js hands in a rule that
    // leaves out the secret boss while it is hidden; its runs are still kept.
    eligible: () => true,

    /* Reads the saved board. Anything missing or broken is dropped instead of
       stopping the game. */
    load() {
        const data = emptyLeaderboard();
        try {
            const saved = JSON.parse(localStorage.getItem(LEADERBOARD_KEY));
            if (saved && saved.version === 1) {
                const isCount = (value) => Number.isInteger(value) && value >= 0;
                for (const [id, entry] of Object.entries(saved.characters || {})) {
                    if (entry && isCount(entry.total) && isCount(entry.best) && isCount(entry.runs)) {
                        data.characters[id] = {
                            total: entry.total, best: entry.best, runs: entry.runs,
                            wins: isCount(entry.wins) ? entry.wins : 0,
                            bestAt: typeof entry.bestAt === 'string' ? entry.bestAt : '',
                        };
                    }
                }
                for (const [season, perCharacter] of Object.entries(saved.seasons || {})) {
                    if (!/^\d{4}-\d{2}$/.test(season) || typeof perCharacter !== 'object') continue;
                    for (const [id, days] of Object.entries(perCharacter || {})) {
                        for (const [day, entry] of Object.entries(days || {})) {
                            if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !entry || !isCount(entry.score)) continue;
                            ((data.seasons[season] ||= {})[id] ||= {})[day] = { score: entry.score, at: String(entry.at || '') };
                        }
                    }
                }
                for (const [season, champion] of Object.entries(saved.champions || {})) {
                    if (champion && typeof champion.characterId === 'string') data.champions[season] = champion;
                }
                if (Array.isArray(saved.recentRunIds)) {
                    data.recentRunIds = saved.recentRunIds.filter((id) => typeof id === 'string').slice(-RECENT_RUN_IDS);
                }
            }
        } catch (error) {
            /* corrupted or blocked: start from an empty board */
        }
        this.data = data;
        this.closeFinishedSeasons();
    },

    save() {
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(this.data));
        } catch (error) {
            /* full or blocked storage: the board just isn't remembered */
        }
    },

    currentSeason() {
        return seasonDateKeys(this.now()).season;
    },

    /* Records a finished run once. run: { runId, characterId, score,
       durationSeconds, completed, mode }. Returns what changed, or null if the
       run was invalid or already counted. */
    recordRun(run) {
        if (!run || typeof run.runId !== 'string' || typeof run.characterId !== 'string') return null;
        if (this.data.recentRunIds.includes(run.runId)) return null;
        const score = Math.max(0, Math.floor(Number(run.score) || 0));

        this.closeFinishedSeasons();
        const playedAt = this.now();
        const at = playedAt.toISOString();
        const keys = seasonDateKeys(playedAt);
        const leaderBefore = this.seasonLeader(keys.season);

        const stats = this.data.characters[run.characterId] ||= { total: 0, best: 0, bestAt: '', runs: 0, wins: 0 };
        const newBest = score > stats.best;
        stats.total += score;
        stats.runs += 1;
        if (run.completed) stats.wins += 1;
        if (newBest || !stats.bestAt) {
            stats.best = Math.max(stats.best, score);
            stats.bestAt = at;
        }

        // Season: keep only the best run of the day (the first one wins a tie).
        const days = (this.data.seasons[keys.season] ||= {})[run.characterId] ||= {};
        if (!days[keys.day] || score > days[keys.day].score) days[keys.day] = { score, at };

        this.data.recentRunIds.push(run.runId);
        this.data.recentRunIds = this.data.recentRunIds.slice(-RECENT_RUN_IDS);
        this.save();

        const leaderAfter = this.seasonLeader(keys.season);
        return {
            newCharacterBest: newBest && score > 0,
            tookLead: Boolean(leaderAfter) && leaderAfter.characterId === run.characterId
                && (!leaderBefore || leaderBefore.characterId !== run.characterId),
        };
    },

    /* Season ranking: points (sum of daily bests), then the best single run,
       then whoever reached their final total first. */
    seasonRanking(season) {
        const perCharacter = this.data.seasons[season] || {};
        return Object.entries(perCharacter).filter(([characterId]) => this.eligible(characterId)).map(([characterId, days]) => {
            const entries = Object.values(days);
            return {
                characterId,
                points: entries.reduce((sum, entry) => sum + entry.score, 0),
                best: Math.max(0, ...entries.map((entry) => entry.score)),
                reachedAt: entries.map((entry) => entry.at).sort().pop() || '',
            };
        }).sort((a, b) => b.points - a.points || b.best - a.best || a.reachedAt.localeCompare(b.reachedAt));
    },

    /* The provisional leader of a season, or null if nobody scored yet. */
    seasonLeader(season) {
        const top = this.seasonRanking(season)[0];
        return top && top.points > 0 ? top : null;
    },

    /* Every month before the current one that has runs and no champion yet
       gets its champion now. Points and records are never erased. */
    closeFinishedSeasons() {
        const current = this.currentSeason();
        let changed = false;
        for (const season of Object.keys(this.data.seasons)) {
            if (season >= current || this.data.champions[season]) continue;
            const leader = this.seasonLeader(season);
            if (!leader) continue;
            this.data.champions[season] = {
                characterId: leader.characterId,
                points: leader.points,
                best: leader.best,
                closedAt: this.now().toISOString(),
            };
            changed = true;
        }
        if (changed) this.save();
    },

    /* The most recent closed season and its champion, or null. */
    lastChampion() {
        const seasons = Object.keys(this.data.champions).sort();
        const season = seasons[seasons.length - 1];
        return season ? { season, ...this.data.champions[season] } : null;
    },

    trophiesOf(characterId) {
        return Object.values(this.data.champions).filter((champion) => champion.characterId === characterId).length;
    },

    /* One row per character that has played, with all three numbers. */
    rows() {
        const season = this.seasonRanking(this.currentSeason());
        return Object.entries(this.data.characters).map(([characterId, stats]) => {
            const inSeason = season.find((row) => row.characterId === characterId);
            return {
                characterId,
                season: inSeason ? inSeason.points : 0,
                seasonBest: inSeason ? inSeason.best : 0,
                seasonReachedAt: inSeason ? inSeason.reachedAt : '',
                total: stats.total,
                best: stats.best,
                bestAt: stats.bestAt,
                runs: stats.runs,
                wins: stats.wins,
                trophies: this.trophiesOf(characterId),
            };
        });
    },

    /* Rows sorted for one tab: 'season', 'total' or 'best'. */
    ranked(tab) {
        const rows = this.rows();
        const order = {
            season: (a, b) => b.season - a.season || b.seasonBest - a.seasonBest || a.seasonReachedAt.localeCompare(b.seasonReachedAt),
            total: (a, b) => b.total - a.total || b.best - a.best || a.bestAt.localeCompare(b.bestAt),
            best: (a, b) => b.best - a.best || a.bestAt.localeCompare(b.bestAt),
        };
        return rows.sort(order[tab]);
    },
};
