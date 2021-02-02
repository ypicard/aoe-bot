import fetch from 'node-fetch';
import { AOEHistoryMatch, AOEMatch, AOEProfile } from '../types/aoe-api';

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

    public leaderboard({
        gameMode = GAME_MODES.randomMap,
        search,
    }: {
        gameMode?: GAME_MODES;
        search: string;
    }): Promise<AOEProfile> {
        const url = `${this.baseUrl}/leaderboard/aoe2de/${gameMode}?search[value]=${search}`;

        return fetch(url)
            .then((res) => res.json())
            .then((res) => {
                if (res.data.length === 0) {
                    throw new Error(`No player found for '${search}' in ${gameMode}.`);
                }

                return res.data[0] as AOEProfile;
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

    public matches({ steamId = '', start = 0, count = 10 }): Promise<AOEHistoryMatch[]> {
        let url = `${this.baseUrl}/api/player/matches?game=aoe2de&count=${count}&start=${start}`;

        if (steamId) {
            url = url + `&steam_id=${steamId}`;
        } else {
            throw new Error("'steamId' is required.");
        }

        return fetch(url).then((res) => res.json());
    }

    public async allMatches({ steamId = '' }): Promise<AOEHistoryMatch[]> {
        const matches: AOEHistoryMatch[] = [];

        while (true) {
            const newMatches = await this.matches({
                steamId,
                count: 1000,
                start: matches.length,
            });
            if (newMatches.length === 0) {
                break;
            }
            matches.push(...newMatches);
        }
        return matches;
    }
}
