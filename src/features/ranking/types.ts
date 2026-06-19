export type RankingMode = "total" | "weekly";

export interface RankingUser {
  rank: number;
  userId: number;
  name: string;
  nickname: string;
  badgeImageUrl: string | null;
  weeklyPoint: number;
  totalPoint: number;
}

export interface RankingListData {
  rankings: RankingUser[];
}
