import { requestRankingJson, type RankingRequestInit } from "./api";
import type { RankingListData, RankingMode, RankingUser } from "./types";

export async function getTotalPointRankings(init: RankingRequestInit = {}) {
  const result = await requestRankingJson<RankingListData>(
    "/api/v1/rankings/points",
    "전체 랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data?.rankings ?? [];
}

export async function getWeeklyPointRankings(init: RankingRequestInit = {}) {
  const result = await requestRankingJson<RankingListData>(
    "/api/v1/rankings/points/weekly",
    "주간 랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data?.rankings ?? [];
}

export async function getMyPointRanking(init: RankingRequestInit = {}) {
  const result = await requestRankingJson<RankingUser>(
    "/api/v1/rankings/points/me",
    "내 랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data ?? null;
}

export async function getMyWeeklyPointRanking(init: RankingRequestInit = {}) {
  const result = await requestRankingJson<RankingUser>(
    "/api/v1/rankings/points/weekly/me",
    "내 주간 랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data ?? null;
}

export function getPointRankingsByMode(
  mode: RankingMode,
  init: RankingRequestInit = {},
) {
  return mode === "total"
    ? getTotalPointRankings(init)
    : getWeeklyPointRankings(init);
}

export function getMyPointRankingByMode(
  mode: RankingMode,
  init: RankingRequestInit = {},
) {
  return mode === "total"
    ? getMyPointRanking(init)
    : getMyWeeklyPointRanking(init);
}
