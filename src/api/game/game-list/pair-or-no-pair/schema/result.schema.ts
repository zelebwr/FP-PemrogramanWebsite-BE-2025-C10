export interface IEvaluateResult {
  id: string;
  score: number;
  difficulty: string;
  created_at: Date;
  rank: number;
}

export interface ILeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  difficulty: string;
  created_at: Date;
}
