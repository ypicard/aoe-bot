import TelegramBot from 'node-telegram-bot-api';
import { AOE, availableModesStr } from './aoe';
import { GAME_MODES } from './aoe-api';
import { AOEHelper } from './aoe-helper';
export class AOEBot {
    private readonly telegram: TelegramBot;
    private readonly aoe: AOE;

    constructor({ token, aoe }: { token: string; aoe: AOE }) {
        this.aoe = aoe;
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
        this.setupDuel();
    }

    private setupStart(): void {
        this.telegram.onText(/\/start/, (msg): any => {
            return this.telegram.sendMessage(
                msg.chat.id,
                `Available commands:
- Search for a player's leaderboard: /leaderboard <mode> <name>
- Compare player profiles: /battle <mode> <name1> vs <name2>
- Lookup ongoing matches: /live <name>
- Confront player profiles (all game modes together): /duel <name1> vs <name2>

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

            this.aoe
                .leaderboard({ search, gameMode })
                .then((profile) => {
                    const outputMsg = AOEHelper.leaderboard({ profile, gameMode });

                    return this.telegram.sendMessage(msg.chat.id, outputMsg, { parse_mode: 'HTML' });
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

            return this.aoe
                .battle({ gameMode, search1, search2 })
                .then((battle) => {
                    const outputMsg = AOEHelper.battle({ gameMode, battle });

                    return this.telegram.sendMessage(msg.chat.id, outputMsg, { parse_mode: 'HTML' });
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

            return this.aoe
                .live({ search })
                .then((match) => {
                    if (!match) {
                        return this.telegram.sendMessage(
                            msg.chat.id,
                            `No ongoing match found with player '${search}'.`
                        );
                    }

                    const outputMsg = AOEHelper.live({ match });

                    return this.telegram.sendMessage(msg.chat.id, outputMsg, { parse_mode: 'HTML' });
                })
                .catch((err) => this.errorHandler(msg.chat.id, err));
        });
    }

    private setupDuel(): void {
        this.telegram.onText(/\/duel/, (msg): any => {
            const m = /\/duel (?<search1>.*) vs (?<search2>.*)/.exec(msg.text || '');
            if (!m || !m.groups) {
                return this.telegram.sendMessage(
                    msg.chat.id,
                    `Specify two player names separated by 'vs':
/duel hugo.lerai1 vs Adrien Lerai
  `
                );
            }

            const { search1, search2 } = m.groups as {
                search1: string;
                search2: string;
            };
            return this.aoe
                .duel({ search1, search2 })
                .then(async (duel) => {
                    if (duel.games === 0) {
                        return this.telegram.sendMessage(
                            msg.chat.id,
                            `Players '${duel.name1}' and '${duel.name2}' have never played against one another.`
                        );
                    }

                    const outputMsg = await AOEHelper.duel({ duel });

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
