export interface IJeopardyClue {
  id: string;
  question: string;
  answer: string;
  value: number;
  media_url?: string | null;
  is_daily_double: boolean;
}

export interface IJeopardyCategory {
  id: string;
  title: string;
  order: number;
  clues: IJeopardyClue[];
}

export interface IJeopardyRound {
  id: string;
  type: 'jeopardy' | 'double' | 'final';
  name: string;
  order: number;
  categories: IJeopardyCategory[];
}

export interface IJeopardyGameSettings {
  time_limit_per_clue: number;
  allow_daily_double: boolean;
  double_jeopardy_multiplier: number;
  max_teams: number;
  starting_score: number;
}

export interface IJeopardyGameData {
  settings: IJeopardyGameSettings;
  rounds: IJeopardyRound[];
}
