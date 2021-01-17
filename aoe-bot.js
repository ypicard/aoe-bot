process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const { GAME_MODES } = require('./aoe-api');
const { AOEHelper } = require('./aoe-helper');

const availableModesStr = 'Available modes: rm-team, rm-1v1, unranked, dm-1v1, dm-team';

class AOEBot {
  constructor({ token, aoeApi }) {
    this._aoeApi = aoeApi;
    this._telegram = new TelegramBot(token, { polling: true });
    this._telegram.on('polling_error', console.error);

    this._setup();
  }

  _setup() {
    this._setupStart();
    this._setupLeaderboard();
    this._setupBattle();
  }

  _setupStart() {
    this._telegram.onText(/\/start/, (msg) => {
      return this._telegram.sendMessage(
        msg.chat.id,
        `Available commands:
- Search for a player's leaderboard: /leaderboard <mode> <name>
- Compare player profiles: /battle <mode> <name1> vs <name2>

${availableModesStr}
`
      );
    });
  }

  _setupLeaderboard() {
    this._telegram.onText(/\/leaderboard/, (msg) => {
      const m = /\/leaderboard (?<gameMode>[-\w]+) (?<search>.*)/.exec(msg.text);
      if (!m) {
        return this._telegram.sendMessage(
          msg.chat.id,
          `Specify a game mode and a player name:
/leaderboard rm-team hugo.lerai1

${availableModesStr}
  `
        );
      }

      const { search, gameMode } = m.groups;
      if (!Object.values(GAME_MODES).includes(gameMode)) {
        return this._telegram.sendMessage(
          msg.chat.id,
          `Unknown game mode: '${gameMode}'

${availableModesStr}
`
        );
      }

      this._aoeApi
        .leaderboard({ gameMode, search })
        .then((res) => {
          const outputMsg = AOEHelper.formatLeaderboard({ profile: res[0], gameMode });

          return this._telegram.sendMessage(msg.chat.id, outputMsg);
        })
        .catch((err) => this._errorHandler(msg.chat.id, err));
    });
  }

  _setupBattle() {
    this._telegram.onText(/\/battle/, (msg) => {
      const m = /\/battle (?<gameMode>[-\w]+) (?<search1>.*) vs (?<search2>.*)/.exec(msg.text);
      if (!m) {
        return this._telegram.sendMessage(
          msg.chat.id,
          `Specify a game mode and two player names separated by 'vs':
/battle rm-team hugo.lerai1 vs Adrien Lerai

${availableModesStr}
  `
        );
      }
      const { search1, search2, gameMode } = m.groups;

      return Promise.all([
        this._aoeApi.leaderboard({ gameMode, search: search1 }),
        this._aoeApi.leaderboard({ gameMode, search: search2 }),
      ])
        .then(([res1, res2]) => {
          const profile1 = res1[0];
          const profile2 = res2[0];

          const battle = AOEHelper.leaderboardBattle({ profile1, profile2, gameMode });
          const outputMsg = AOEHelper.formatleaderboardBattle({ gameMode, battle, profile1, profile2 });

          return this._telegram.sendMessage(msg.chat.id, outputMsg);
        })
        .catch((err) => this._errorHandler(msg.chat.id, err));
    });
  }

  _errorHandler(chatId, err) {
    console.error(err);
    return this._telegram.sendMessage(chatId, err.message);
  }
}

module.exports = { AOEBot };
