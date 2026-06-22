import type { RankingUser } from "./types";

export function formatRank(rank?: number | null) {
  if (rank == null) {
    return "-";
  }

  return String(rank).padStart(2, "0");
}

export function formatPoint(point: number) {
  return point.toLocaleString("ko-KR");
}

export function getDisplayName(user: RankingUser) {
  return user.nickname;
}

export function isMyRankingItem(
  item: RankingUser,
  myRanking: RankingUser | null,
) {
  return myRanking ? item.userId === myRanking.userId : false;
}
