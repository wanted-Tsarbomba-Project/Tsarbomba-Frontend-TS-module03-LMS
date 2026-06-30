import { getCourseProblemSets } from "./problemSetActions";
import { fetchProblemCategories } from "./form/http";
import { getProblemSets } from "@/features/problems/actions";
import type { ProblemSetSummary } from "@/features/problems/types";

/**
 * 강좌 등록 시 고른 문제 카테고리를 기준으로, 강좌에 포함되지 않은 다른 문제세트를 랜덤 추천한다.
 *
 * 강좌엔 문제 카테고리가 저장되지 않으므로, 카테고리별 문제세트 목록을 받아
 * 강좌에 연결된 문제세트가 속한 카테고리를 역으로 찾아낸다.
 * 문제 강의가 없거나 같은 카테고리에 다른 문제세트가 없으면 빈 배열을 반환한다.
 */
export const getRecommendedProblemSets = async (
  courseId: number | string,
  count = 2,
): Promise<ProblemSetSummary[]> => {
  // 1. 강좌에 연결된 문제세트 id
  const links = await getCourseProblemSets(courseId);
  const courseSetIds = links
    .map((l) => l.problemSetId)
    .filter((id): id is number => id != null);
  if (courseSetIds.length === 0) return [];
  const courseSet = new Set(courseSetIds);

  // 2. 카테고리별 문제세트를 받아 강좌 문제세트가 속한 카테고리를 매칭
  //    개별 조회 실패는 빈 배열로 숨기지 않고 전파 — UI가 "추천 없음"과 "조회 실패"를 구분하도록.
  const categories = await fetchProblemCategories();
  const groups = await Promise.all(
    categories.map((c) => getProblemSets(String(c.categoryId))),
  );
  const matched = groups.find((sets) =>
    sets.some((s) => courseSet.has(s.problemSetId)),
  );
  if (!matched) return [];

  // 3. 강좌에 이미 포함된 문제세트는 제외하고 랜덤 count개
  const candidates = matched.filter((s) => !courseSet.has(s.problemSetId));
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, count);
};
