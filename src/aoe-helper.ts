import { LeaderboardBattle } from '../types';
import { AOEProfile } from '../types/aoe-api';
import { GAME_MODES } from './aoe-api';

export class AOEHelper {
    public static formatLeaderboard({ profile, gameMode }: { profile: AOEProfile; gameMode: GAME_MODES }): string {
        return `
Game mode: ${gameMode}
Player: ${profile.name}
Rank: ${profile.rank}
Rating: ${profile.rating}
Highest rating: ${profile.highest_rating}
Games: ${profile.num_games}
Streak: ${profile.streak}
Wins: ${profile.num_wins}
Losses: ${profile.num_games - profile.num_wins}
Win ratio: ${profile.win_percent}`;
    }

    public static leaderboardBattle({
        profile1,
        profile2,
    }: {
        profile1: AOEProfile;
        profile2: AOEProfile;
    }): LeaderboardBattle {
        return {
            wins: profile2.num_wins - profile1.num_wins,
            rating: profile2.rating - profile1.rating,
            rank: profile2.rank - profile1.rank,
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
        const addSign = (a: number): string => (a >= 0 ? '+' : '') + a.toString();

        return `
Game mode: ${gameMode}
Player 1: ${profile1.name}
Player 2: ${profile2.name}
Rank: ${addSign(battle.rank)}
Rating: ${addSign(battle.rating)}
Wins: ${addSign(battle.wins)}`;
    }
}
