export type CutRound =
  | "cocktail"
  | "outing"
  | "date_event"
  | "final_dinner"
  | "punched"
  | "none";

export type Difficulty = "EASY" | "NORMAL" | "HARD" | "NIGHTMARE";

export interface ScanResult {
  punch_worthiness: {
    score: number;
    cut_round: CutRound;
    label: string;
    roast: string;
    why: string;
  };
  sellout_index: {
    score: number;
    label: string;
    why: string;
  };
  legacy_multiplier: {
    score: number;
    difficulty: Difficulty;
    label: string;
    why: string;
  };
  paper_trail: {
    score: number;
    label: string;
    notes: string[];
    why: string;
  };
  human_moat: {
    score: number;
    label: string;
    why: string;
  };
  gunner_rating: {
    score: number;
    label: string;
    why: string;
  };
  certifiably_cracked: {
    score: number;
    label: string;
    why: string;
  };
  final_club: {
    club: string;
    match_pct: number;
    odds_pct: number;
    traits: string[];
    line: string;
    lookalike: {
      name: string;
      line: string;
    };
  };
}

export interface ScanPayload {
  name: string;
  context: string;
  result: ScanResult;
  factCount: number;
  createdAt: number;
}
