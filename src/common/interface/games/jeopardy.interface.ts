/**
 * Jeopardy Game JSON Structure
 *
 * Game structure based on the classic Jeopardy game show format.
 * Contains categories with clues of varying point values.
 */

export interface IJeopardyClue {
  /** Unique identifier for the clue */
  id: string;
  /** The question/clue text shown to players */
  question: string;
  /** The correct answer (should be phrased as "What is...?" in classic Jeopardy) */
  answer: string;
  /** Point value for this clue (typically 100, 200, 300, 400, 500) */
  value: number;
  /** Optional media URL (image/audio) for the clue */
  media_url?: string | null;
  /** Whether this clue is a Daily Double */
  is_daily_double: boolean;
}

export interface IJeopardyCategory {
  /** Unique identifier for the category */
  id: string;
  /** Category title displayed on the board */
  title: string;
  /** Order of the category on the board (0-indexed) */
  order: number;
  /** Array of clues in this category (typically 5 clues per category) */
  clues: IJeopardyClue[];
}

export interface IJeopardyRound {
  /** Unique identifier for the round */
  id: string;
  /** Round type: 'jeopardy' (single), 'double' (double jeopardy), or 'final' */
  type: 'jeopardy' | 'double' | 'final';
  /** Display name for the round */
  name: string;
  /** Order of the round in the game */
  order: number;
  /** Categories in this round (typically 6 categories per round, 1 for final) */
  categories: IJeopardyCategory[];
}

export interface IJeopardyGameSettings {
  /** Time limit per clue in seconds (0 = no limit) */
  time_limit_per_clue: number;
  /** Whether to allow Daily Double wagering */
  allow_daily_double: boolean;
  /** Multiplier for Double Jeopardy round values */
  double_jeopardy_multiplier: number;
  /** Maximum number of teams/players */
  max_teams: number;
  /** Starting score for each team */
  starting_score: number;
}

export interface IJeopardyGameData {
  /** Game configuration settings */
  settings: IJeopardyGameSettings;
  /** Array of rounds in the game */
  rounds: IJeopardyRound[];
}
