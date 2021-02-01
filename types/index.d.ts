export type Battle = {
    wins: number;
    rating: number;
    highestRating: number;
    rank: number;
    games: number;
    name1: string;
    rank1: number;
    rating1: number;
    highestRating1: number;
    games1: number;
    name2: string;
    rank2: number;
    rating2: number;
    highestRating2: number;
    games2: number;
};

export type Duel = {
    name1: string;
    name2: string;
    games: number;
    wins: number;
    winPercent: number;
};
