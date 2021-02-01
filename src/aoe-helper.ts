import { Duel, Battle } from '../types';
import { AOEMatch, AOEPlayer, AOEProfile } from '../types/aoe-api';
import { MATCH_SLOT_TYPES, GAME_MODES } from './aoe-api';

export class AOEHelper {
    public static leaderboard({ profile, gameMode }: { profile: AOEProfile; gameMode: GAME_MODES }): string {
        return `
Game mode: ${gameMode}
<b>=== ${profile.name} ===</b>
<b>Rank:</b> ${profile.rank}
<b>Rating:</b> ${profile.rating}
<b>Rating+:</b> ${profile.highest_rating}
<b>Games:</b> ${profile.num_games}
<b>Streak:</b> ${addSign(profile.streak)}
<b>Wins:</b> ${profile.num_wins}
<b>Losses:</b> ${profile.num_games - profile.num_wins}
<b>Ratio:</b> ${profile.win_percent}%`;
    }

    public static battle({
        gameMode,
        battle,
    }: {
        gameMode: GAME_MODES;
        battle: Battle;
    }): string {
        return `
Game mode: ${gameMode}
<b>=== ${battle.name1} VS ${battle.name2} ===</b>
<b>Rank:</b> #${battle.rank1} | #${battle.rank2} | <i>${addSign(battle.rank)}</i>
<b>Rating:</b> ${battle.rating1} | ${battle.rating2} | <i>${addSign(battle.rating)}</i>
<b>Rating+:</b> ${battle.highestRating1} | ${battle.highestRating2} | <i>${addSign(battle.highestRating)}</i>
<b>Games:</b> ${battle.games} | ${battle.games} | <i>${addSign(battle.games)}</i>
<b>Wins:</b> ${battle.wins} | ${battle.wins} | <i>${addSign(battle.wins)}</i>
`;
    }

    public static live({ match }: { match: AOEMatch }): string {
        const teams = match.players.reduce((acc, cur) => {
            if (cur.slotType !== MATCH_SLOT_TYPES.Human && cur.slotType !== MATCH_SLOT_TYPES.Bot) {
                return acc;
            }

            if (!(cur.team in acc)) {
                acc[cur.team] = [];
            }

            acc[cur.team].push(cur);

            return acc;
        }, {} as { [k: number]: AOEPlayer[] });

        function getTitleLine(match: AOEMatch) {
            const VSString = Object.values(teams)
                .map((team) => team.length)
                .join('v');
            return `${match.gameType} (${match.ranked ? 'Ranked' : 'Unranked'}) - ${VSString}`;
        }

        function getTeamLine(team: AOEPlayer[], teamNb: number) {
            const teamRating = team.map((pl) => pl.rating).reduce((a, b) => a + b, 0) / team.length;

            return `Team ${teamNb}${isNaN(teamRating) ? ':' : ` (${teamRating}):`}`;
        }

        function getPlayerLine(player: AOEPlayer) {
            if (!player.name) {
                return 'Bot';
            }

            if (!player.rating) {
                return `${player.name}`;
            }

            return `${player.name} (${player.rating})`;
        }

        return `
<b>${getTitleLine(match)}</b>
${Object.values(teams)
    .map((team, teamIdx) => {
        return `<i>${getTeamLine(team, teamIdx + 1)}</i>
${team.map(getPlayerLine).join('\n')}`;
    })
    .join('\n\n')}
`;
    }

    public static duel({ duel }: { duel: Duel; }): string {
        return `
<b>=== ${duel.name1} VS ${duel.name2} ===</b>
<b>Games:</b> ${duel.games}
<b>Wins:</b> ${duel.wins}
<b>Ratio:</b> ${duel.winPercent}%
`;
    }
}

function addSign(a: number): string {
    return (a >= 0 ? '+' : '') + a.toString();
}
