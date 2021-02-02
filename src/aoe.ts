import { Duel, Battle } from '../types';
import { AOEMatch, AOEProfile } from '../types/aoe-api';
import { AOEApi, GAME_MODES } from './aoe-api';

export const availableModesStr = 'Available modes: rm-team, rm-1v1, unranked, dm-1v1, dm-team';

export class AOE {
    private readonly aoeApi: AOEApi;

    constructor({ aoeApi }: { aoeApi: AOEApi }) {
        this.aoeApi = aoeApi;
    }

    public async leaderboard({ search, gameMode }: { search: string; gameMode: GAME_MODES }): Promise<AOEProfile> {
        if (!Object.values(GAME_MODES).includes(gameMode)) {
            throw new Error(
                `Unknown game mode: '${gameMode}'

${availableModesStr}
`
            );
        }

        return this.aoeApi.leaderboard({ gameMode, search });
    }

    public async battle({
        search1,
        search2,
        gameMode,
    }: {
        search1: string;
        search2: string;
        gameMode: GAME_MODES;
    }): Promise<Battle> {
        return Promise.all([
            this.aoeApi.leaderboard({ gameMode, search: search1 }),
            this.aoeApi.leaderboard({ gameMode, search: search2 }),
        ]).then(([profile1, profile2]) => {
            return {
                wins: profile1.num_wins - profile2.num_wins,
                rating: profile1.rating - profile2.rating,
                highestRating: profile1.highest_rating - profile2.highest_rating,
                rank: profile1.rank - profile2.rank,
                games: profile1.num_games - profile2.num_games,
                name1: profile1.name,
                rank1: profile1.rank,
                rating1: profile1.rating,
                highestRating1: profile1.highest_rating,
                games1: profile1.num_games,
                name2: profile2.name,
                rank2: profile2.rank,
                rating2: profile2.rating,
                highestRating2: profile2.highest_rating,
                games2: profile2.num_games,
            };
        });
    }

    public async live({ search }: { search: string }): Promise<AOEMatch | undefined> {
        return this.aoeApi.ongoing().then((res) => {
            const match = res.find((match) => match.players.findIndex((pl) => pl.name === search) !== -1);

            return match;
        });
    }

    public async duel({ search1, search2 }: { search1: string; search2: string }): Promise<Duel> {
        const [player1, player2] = await Promise.all([
            this.aoeApi.leaderboard({ search: search1 }),
            this.aoeApi.leaderboard({ search: search2 }),
        ]);

        if (!player1.steam_id) {
            throw new Error(`No steam id found for player '${search1}'`);
        }

        if (!player2.steam_id) {
            throw new Error(`No steam id found for player '${search2}'`);
        }

        const matches1 = await this.aoeApi.allMatches({ steamId: player1.steam_id });

        const duel = { name1: player1.name, name2: player2.name, games: 0, wins: 0, winPercent: 0 };
        const res = matches1.reduce((acc, m) => {
            if (m.players.length > 2) {
                return acc; // only 1v1
            }

            const pl1 = m.players.find((pl) => pl.steam_id === player1.steam_id);
            const pl2 = m.players.find((pl) => pl.steam_id === player2.steam_id);

            if (!pl1 || !pl2 || pl1.team === pl2.team) {
                return acc;
            }

            acc.games += 1;
            acc.wins += pl1.won ? 1 : 0;
            acc.winPercent = (acc.wins / acc.games) * 100;

            return acc;
        }, duel);

        return res;
    }
}
