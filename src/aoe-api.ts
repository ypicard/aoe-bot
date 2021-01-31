import fetch from 'node-fetch';
import { AOEMatch, AOEProfile } from '../types/aoe-api';

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

export enum MATCH_SLOT_TYPES {
    Human = 1,
    Empty = -1,
    Bot = 3,
}

export class AOEApi {
    private readonly baseUrl = 'https://aoe2.net';

    public leaderboard({ gameMode, search }: { gameMode: GAME_MODES; search: string }): Promise<AOEProfile[]> {
        const url = `${this.baseUrl}/leaderboard/aoe2de/${gameMode}?search[value]=${search}`;

        return fetch(url)
            .then((res) => res.json())
            .then((res) => {
                if (res.data.length === 0) {
                    throw new Error(`No rating found for '${search}' in ${gameMode}.`);
                }

                return res.data as AOEProfile[];
            });
    }

    public ongoing(): Promise<AOEMatch[]> {
        const url = `${this.baseUrl}/matches/aoe2de/ongoing`;

        return fetch(url)
            .then((res) => res.json())
            .then((res) => {
                if (res.data.length === 0) {
                    throw new Error(`No ongoing matches found.`);
                }

                return res.data as AOEMatch[];
            });
    }
}