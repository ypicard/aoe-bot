import { Duel } from '../types';
import { AOEApi, GAME_MODES } from './aoe-api';

export class AOE {
    private readonly aoeApi: AOEApi;

    constructor({ aoeApi }: { aoeApi: AOEApi }) {
        this.aoeApi = aoeApi;
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

        const res = matches1.reduce(
            (acc, m) => {
                const pl1 = m.players.find((pl) => pl.steam_id === player1.steam_id);
                const pl2 = m.players.find((pl) => pl.steam_id === player2.steam_id);

                if (!pl1 || !pl2 || pl1.team === pl2.team) {
                    return acc;
                }

                acc.games += 1;
                acc.wins += pl1.won ? 1 : 0;
                acc.winPercent = (acc.wins / acc.games) * 100;

                return acc;
            },
            { games: 0, wins: 0, winPercent: 0 }
        );

        if (res.games === 0) {
            throw new Error(`'${player1.name}' and '${player2.name}' have never played against one another.`);
        }

        return res;
    }
}
