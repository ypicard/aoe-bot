import fetch from 'node-fetch';
import { AOEProfile } from '../types/aoe-api';

export enum LEADERBOARD_IDS {
    unranked = 0,
    deathmatch = 1,
    teamDeathmatch = 2,
    randomMap = 3,
    teamRandomMap = 4,
}

export enum GAME_MODES {
    teamRandomMap = 'rm-team',
    randomMap = 'rm-1v1',
    unranked = 'unranked',
    deathmatch = 'dm-1v1',
    teamDeathmatch = 'dm-team',
}

export class AOEApi {
    private readonly baseUrl = 'https://aoe2.net';

    public leaderboard({ gameMode, search }: { gameMode: GAME_MODES; search: string }): Promise<AOEProfile[]> {
        const url = `${this.baseUrl}/leaderboard/aoe2de/${gameMode}?search[value]=${search}`;

        return fetch(url)
            .then((res) => res.json())
            .then((res) => {
                if (res.data.length === 0) {
                    throw new Error(`No rating found for '${search}' in ${gameMode}`);
                }

                return res.data as AOEProfile[];
            });
    }

    // public playerMatchHistory({ steamId = '', steamIds = [], count = 10 }): any {
    //     let url = `${this.baseUrl}/api/player/matches?game=aoe2de&count=${count}`;

    //     if (steamId) {
    //         url = url + `&steam_id=${steamId}`;
    //     } else if (steamIds.length > 0) {
    //         url = url + `&steam_ids=${steamIds.join(',')}`;
    //     } else {
    //         throw new Error('One of `steamId` or `steamIds` args is required.');
    //     }

    //     return fetch(url).then((res) => res.json());
    // }

    // public playerRatingHistory({
    //     steamId = '',
    //     leaderboard,
    //     count = 10,
    // }: {
    //     steamId: string;
    //     leaderboard: LEADERBOARD_IDS;
    //     count: number;
    // }): any {
    //     const url = `${this.baseUrl}/api/player/ratinghistory?game=aoe2de&leaderboard_id=${LEADERBOARD_IDS[leaderboard]}&steam_id=${steamId}&count=${count}`;

    //     return fetch(url).then((res) => res.json());
    // }
}

module.exports = { AOEApi, GAME_MODES, LEADERBOARD_IDS };
