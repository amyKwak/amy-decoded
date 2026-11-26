/**
 * Every game in God's Plan, for the lobby. The games are inspired by Netflix's
 * The Devil's Plan; match types are renamed for our brand (Prison is
 * Sanctuary, Exile is Pilgrimage, Hidden is Revelation, Final is Ascension).
 * Player counts are what the show used; a game we've built can also list
 * modes for fewer players (like playing alone against the computer).
 */

export type MatchType = "Main" | "Mini-game" | "Sanctuary" | "Pilgrimage" | "Revelation" | "Ascension";

export type Game = {
  slug: string;
  name: string;
  season: number;
  day: string;
  type: MatchType;
  players: { min: number; max: number };
  summary: string;
  /** The page to play it on, once it's built. */
  href?: string;
  /** Card art for the lobby, for games that are built. */
  image?: string;
};

export const GAMES: Game[] = [
  { slug: "either-or", name: "Either/Or", season: 3, day: "Day 1", type: "Main", players: { min: 16, max: 16 }, summary: "Secret two-way votes split everyone into teams for four mini-games." },
  { slug: "count-the-cubes", name: "Count the Cubes", season: 3, day: "Day 1", type: "Mini-game", players: { min: 1, max: 16 }, summary: "Count every cube in the pile, including the ones you can't see." },
  { slug: "count-the-rectangles", name: "Count the Rectangles", season: 3, day: "Day 1", type: "Mini-game", players: { min: 1, max: 16 }, summary: "Count the rectangles whose numbers add up to the target." },
  { slug: "memory-poker", name: "Memory Poker", season: 3, day: "Day 1", type: "Mini-game", players: { min: 2, max: 16 }, summary: "Memorize sixteen cards, then secretly pick the two that make the best hand." },
  { slug: "lay-the-grass", name: "Lay the Grass", season: 3, day: "Day 1", type: "Mini-game", players: { min: 16, max: 16 }, summary: "Everyone picks numbered tiles and fits them into one small park." },
  { slug: "heavy-13", name: "Heavy 13", season: 3, day: "Day 1", type: "Sanctuary", players: { min: 7, max: 7 }, summary: "Load weights onto three shared stands without being the one who tips a stand to 13." },
  { slug: "piece-puzzle", name: "Piece Puzzle", season: 3, day: "Day 1", type: "Pilgrimage", players: { min: 4, max: 4 }, summary: "Four travellers build a puzzle from eight Pieces." },
  { slug: "mystery-stock-market", name: "Mystery Stock Market", season: 3, day: "Day 2", type: "Main", players: { min: 12, max: 12 }, summary: "Trade ten made-up stocks whose price rules are hidden and revealed bit by bit." },
  { slug: "spot-the-difference", name: "Spot the Difference", season: 3, day: "Day 2", type: "Pilgrimage", players: { min: 1, max: 4 }, summary: "Find the five changes between two pictures." },
  { slug: "russian-roulette", name: "Russian Roulette", season: 3, day: "Day 2", type: "Sanctuary", players: { min: 6, max: 6 }, summary: "Spend secret credits to reveal, rotate or swap chambers, and don't face a marked slot." },
  { slug: "secret-code", name: "Secret Code", season: 3, day: "Day 2", type: "Pilgrimage", players: { min: 1, max: 4 }, summary: "Be first to build a four-card set that follows every listed rule." },
  { slug: "gem-black-market", name: "Gem Black Market", season: 3, day: "Day 3", type: "Main", players: { min: 9, max: 9 }, summary: "Swap face-down cards to hold the gem a buyer wants, and pass the bombs along." },
  { slug: "loop-fence-puzzle", name: "Loop Fence Puzzle", season: 3, day: "Day 3", type: "Pilgrimage", players: { min: 1, max: 4 }, summary: "Draw one closed fence that matches every number on the grid." },
  { slug: "piggy-bank", name: "Piggy Bank", season: 3, day: "Day 3", type: "Sanctuary", players: { min: 4, max: 4 }, summary: "Jars of black and white coins go around the table. Remember what went in, and doubt anyone who doesn't." },
  { slug: "auction-bingo", name: "Auction Bingo", season: 3, day: "Day 4", type: "Main", players: { min: 8, max: 8 }, summary: "Name a shape out loud, bid for it in secret, and find out what you won at the end." },
  { slug: "symmetrical-puzzle", name: "Symmetrical Puzzle", season: 3, day: "Day 4", type: "Pilgrimage", players: { min: 1, max: 4 }, summary: "Fit tangram-style pieces into symmetrical shapes." },
  { slug: "wall-go-2", name: "Wall Go II", season: 3, day: "Day 4", type: "Sanctuary", players: { min: 2, max: 3 }, summary: "Wall Go with square and round pieces that move differently. Fence off the most squares." },
  { slug: "magic-square-49", name: "Magic Square 49", season: 3, day: "Day 4", type: "Revelation", players: { min: 1, max: 1 }, summary: "The hidden test, for those who look closely." },
  { slug: "tower-of-equations", name: "Tower of Equations", season: 3, day: "Day 5", type: "Sanctuary", players: { min: 3, max: 3 }, summary: "Call the fewest moves to build the target number from six two-sided blocks, then do it." },
  { slug: "hit-stay", name: "Hit, Stay", season: 3, day: "Day 6", type: "Main", players: { min: 5, max: 5 }, summary: "Bet on your number cards, take more or stand, and get closest to the limit without going over." },
  { slug: "gradation", name: "Gradation", season: 3, day: "Day 6", type: "Sanctuary", players: { min: 2, max: 3 }, summary: "Hide seven numbers in a row of shaded boxes, then duel one box at a time." },
  { slug: "card-janggi", name: "Card Janggi", season: 3, day: "Final", type: "Ascension", players: { min: 2, max: 2 }, summary: "Lay five move cards face down in secret order, then race your piece across the board." },
  { slug: "color-link", name: "Color Link", season: 3, day: "Final", type: "Ascension", players: { min: 2, max: 2 }, summary: "Place colored pairs so every pair can still connect. Call \"impossible\" when your rival breaks it." },
  { slug: "equation-traffic-light", name: "Equation Traffic Light", season: 3, day: "Final", type: "Ascension", players: { min: 1, max: 2 }, summary: "Hide a nine-cell equation, then crack your rival's from the green, yellow and red lights on each guess.", href: "/projects/gods-plan/equation-traffic-light", image: "/projects/gods-plan/equation-traffic-light.svg" },
];

export const SEASONS = [...new Set(GAMES.map((g) => g.season))].sort((a, b) => b - a);
export const MATCH_TYPES: MatchType[] = ["Main", "Mini-game", "Sanctuary", "Pilgrimage", "Revelation", "Ascension"];

export type GameFilter = {
  season?: number;
  /** How many people want to play, as a range ("3 to 6 of us"). */
  players?: { min: number; max: number };
  type?: MatchType;
  playableOnly?: boolean;
  /** Free text matched against the name and summary. */
  query?: string;
};

/** Games that fit the filter, ones you can play now first. */
export function filterGames(games: Game[], filter: GameFilter): Game[] {
  const { players } = filter;
  const query = filter.query?.trim().toLowerCase() ?? "";
  return games
    .filter(
      (g) =>
        (filter.season === undefined || g.season === filter.season) &&
        (players === undefined || (g.players.min <= players.max && players.min <= g.players.max)) &&
        (filter.type === undefined || g.type === filter.type) &&
        (!filter.playableOnly || g.href !== undefined) &&
        (query === "" || `${g.name} ${g.summary}`.toLowerCase().includes(query)),
    )
    .sort((a, b) => Number(b.href !== undefined) - Number(a.href !== undefined));
}

/** The "Who's playing?" choices in the lobby. */
export const GROUP_SIZES = [
  { label: "Just me", players: { min: 1, max: 1 } },
  { label: "Two of us", players: { min: 2, max: 2 } },
  { label: "3–6", players: { min: 3, max: 6 } },
  { label: "7 or more", players: { min: 7, max: 99 } },
] as const;

export const playerLabel = ({ min, max }: Game["players"]) =>
  min === max ? `${min}` : `${min}–${max}`;
