import { LeaderboardBattle } from '../types';
import { AOEMatch, AOEPlayer, AOEProfile } from '../types/aoe-api';
import { MATCH_SLOT_TYPES, GAME_MODES } from './aoe-api';

export class AOEHelper {
    public static formatLeaderboard({ profile, gameMode }: { profile: AOEProfile; gameMode: GAME_MODES }): string {
        return `
Game mode: ${gameMode}
*=== ${profile.name} ===*
*Rank:* ${profile.rank}
*Rating:* ${profile.rating}
*Rating+:* ${profile.highest_rating}
*Games:* ${profile.num_games}
*Streak:* ${addSign(profile.streak)}
*Wins:* ${profile.num_wins}
*Losses:* ${profile.num_games - profile.num_wins}
*Ratio:* ${profile.win_percent}%`;
    }

    public static leaderboardBattle({
        profile1,
        profile2,
    }: {
        profile1: AOEProfile;
        profile2: AOEProfile;
    }): LeaderboardBattle {
        return {
            wins: profile1.num_wins - profile2.num_wins,
            rating: profile1.rating - profile2.rating,
            highestRating: profile1.highest_rating - profile2.highest_rating,
            rank: profile1.rank - profile2.rank,
            numGames: profile1.num_games - profile2.num_games,
        };
    }

    public static formatleaderboardBattle({
        gameMode,
        battle,
        profile1,
        profile2,
    }: {
        gameMode: GAME_MODES;
        battle: LeaderboardBattle;
        profile1: AOEProfile;
        profile2: AOEProfile;
    }): string {
        return `
Game mode: ${gameMode}
*=== ${profile1.name} VS ${profile2.name} ===*
*Rank:* #${profile1.rank} | #${profile2.rank} | _${addSign(battle.rank)}_
*Rating:* ${profile1.rating} | ${profile2.rating} | _${addSign(battle.rating)}_
*Rating+:* ${profile1.highest_rating} | ${profile2.highest_rating} | _${addSign(battle.highestRating)}_
*Games:* ${profile1.num_games} | ${profile2.num_games} | _${addSign(battle.numGames)}_
*Wins:* ${profile1.num_wins} | ${profile2.num_wins} | _${addSign(battle.wins)}_
`;
    }

    public static formatLiveMatch({ match }: { match: AOEMatch }): string {
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
}

function addSign(a: number): string {
    return (a >= 0 ? '+' : '') + a.toString();
}
