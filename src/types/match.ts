export type MatchType = "upcoming" | "previous";

export interface Match {
  type: MatchType;
  id: string;
  homeTeam: string;
  awayTeam: string;
  datetime: Date;
  homeScore: string | null;
  awayScore: string | null;
}
