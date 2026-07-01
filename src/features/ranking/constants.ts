export const RANKING_LIST_COLUMN_LABELS = {
  badge: "뱃지",
  nickname: "이름",
  rank: "No.",
  totalPoint: "누적 포인트",
  weeklyPoint: "주간 포인트",
} as const;

export const RANKING_LIST_SKELETON_COLUMNS = [
  RANKING_LIST_COLUMN_LABELS.rank,
  RANKING_LIST_COLUMN_LABELS.badge,
  RANKING_LIST_COLUMN_LABELS.nickname,
  RANKING_LIST_COLUMN_LABELS.weeklyPoint,
  RANKING_LIST_COLUMN_LABELS.totalPoint,
] as const;

export const RANKING_PAGE_SIZE = 20;
