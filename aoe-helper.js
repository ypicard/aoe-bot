class AOEHelper {
  static formatLeaderboard({ profile, gameMode }) {
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

  static leaderboardBattle({ profile1, profile2 }) {
    return {
      wins: profile2.num_wins - profile1.num_wins,
      rating: profile2.rating - profile1.rating,
      rank: profile2.rank - profile1.rank,
    };
  }

  static formatleaderboardBattle({ gameMode, battle, profile1, profile2 }) {
    const addSign = (a) => ((a >= 0 ? '+' : '') + a);
    return `
Game mode: ${gameMode}
Player 1: ${profile1.name}
Player 2: ${profile2.name}
Rank: ${addSign(battle.rank)}
Rating: ${addSign(battle.rating)}
Wins: ${addSign(battle.wins)}`;
  }
}

module.exports = { AOEHelper };
