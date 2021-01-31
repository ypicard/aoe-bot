import TelegramBot from 'node-telegram-bot-api';
import { AOEApi, GAME_MODES } from './aoe-api';
import { AOEHelper } from './aoe-helper';

const availableModesStr = 'Available modes: rm-team, rm-1v1, unranked, dm-1v1, dm-team';

export class AOEBot {
    private readonly aoeApi: AOEApi;
    private readonly telegram: TelegramBot;

    constructor({ token, aoeApi }: { token: string; aoeApi: AOEApi }) {
        this.aoeApi = aoeApi;
        this.telegram = new TelegramBot(token, { polling: true });
        this.telegram.on('polling_error', console.error);

        this.setup();
    }

    private setup(): void {
        this.telegram.on('message', (msg): any => console.log(`New message: ${msg.text || ''}`));
        this.setupStart();
        this.setupLeaderboard();
        this.setupBattle();
        this.setupLive();
    }

    private setupStart(): void {
        this.telegram.onText(/\/start/, (msg): any => {
            return this.telegram.sendMessage(
                msg.chat.id,
                `Available commands:
- Search for a player's leaderboard: /leaderboard <mode> <name>
- Compare player profiles: /battle <mode> <name1> vs <name2>
- Lookup ongoing matches: /live <name>

${availableModesStr}
`
            );
        });
    }

    private setupLeaderboard(): void {
        this.telegram.onText(/\/leaderboard/, (msg): any => {
            const m = /\/leaderboard (?<gameMode>[-\w]+) (?<search>.*)/.exec(msg.text || '');
            if (!m || !m.groups) {
                return this.telegram.sendMessage(
                    msg.chat.id,
                    `Specify a game mode and a player name:
/leaderboard rm-team hugo.lerai1

${availableModesStr}
  `
                );
            }

            const { search, gameMode } = m.groups as { search: string; gameMode: GAME_MODES };
            if (!Object.values(GAME_MODES).includes(gameMode)) {
                return this.telegram.sendMessage(
                    msg.chat.id,
                    `Unknown game mode: '${gameMode}'

${availableModesStr}
`
                );
            }

            this.aoeApi
                .leaderboard({ gameMode, search })
                .then((res) => {
                    const outputMsg = AOEHelper.formatLeaderboard({ profile: res[0], gameMode });

                    return this.telegram.sendMessage(msg.chat.id, outputMsg, { parse_mode: 'Markdown' });
                })
                .catch((err) => this.errorHandler(msg.chat.id, err));
        });
    }

    private setupBattle(): void {
        this.telegram.onText(/\/battle/, (msg): any => {
            const m = /\/battle (?<gameMode>[-\w]+) (?<search1>.*) vs (?<search2>.*)/.exec(msg.text || '');
            if (!m || !m.groups) {
                return this.telegram.sendMessage(
                    msg.chat.id,
                    `Specify a game mode and two player names separated by 'vs':
/battle rm-team hugo.lerai1 vs Adrien Lerai

${availableModesStr}
  `
                );
            }

            const { search1, search2, gameMode } = m.groups as {
                search1: string;
                search2: string;
                gameMode: GAME_MODES;
            };

            return Promise.all([
                this.aoeApi.leaderboard({ gameMode, search: search1 }),
                this.aoeApi.leaderboard({ gameMode, search: search2 }),
            ])
                .then(([res1, res2]) => {
                    const profile1 = res1[0];
                    const profile2 = res2[0];

                    const battle = AOEHelper.leaderboardBattle({ profile1, profile2 });
                    const outputMsg = AOEHelper.formatleaderboardBattle({ gameMode, battle, profile1, profile2 });

                    return this.telegram.sendMessage(msg.chat.id, outputMsg, { parse_mode: 'Markdown' });
                })
                .catch((err) => this.errorHandler(msg.chat.id, err));
        });
    }

    private setupLive(): void {
        this.telegram.onText(/\/live/, (msg): any => {
            const m = /\/live (?<search>.*)/.exec(msg.text || '');
            if (!m || !m.groups) {
                return this.telegram.sendMessage(
                    msg.chat.id,
                    `Specify a player name:
/live Adrien Lerai
  `
                );
            }

            const { search } = m.groups as { search: string };

            return this.aoeApi
                .ongoing()
                .then((res) => {
                    const match = res.find((match) => {
                        return match.players.findIndex((pl) => pl.name === search) !== -1;
                    });

                    if (!match) {
                        return this.telegram.sendMessage(
                            msg.chat.id,
                            `No ongoing match found with player '${search}'.`
                        );
                    }

                    const outputMsg = AOEHelper.formatLiveMatch({ match });

                    return this.telegram.sendMessage(msg.chat.id, outputMsg, { parse_mode: 'HTML' });
                })
                .catch((err) => this.errorHandler(msg.chat.id, err));
        });
    }

    private errorHandler(chatId: number, err: Error): void {
        console.error(err);
        this.telegram.sendMessage(chatId, err.message).catch((e) => console.error(e));
    }
}

module.exports = { AOEBot };
