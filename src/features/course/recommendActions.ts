import type { ProblemSetSummary } from "@/features/problems/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** 추천 조회 결과 — 미완료(403)와 일반 실패를 UI가 구분할 수 있도록 상태로 반환 */
export type FinalProblemSetResult =
  | { status: "ok"; problemSets: ProblemSetSummary[] }
  | { status: "notCompleted" } // 강의 미완료 / 마지막 강의 아님 (BE 403)
  | { status: "error" };

/**
 * FINAL 추천 문제세트 조회 — GET /api/v1/lectures/{lectureId}/final-problem-set-candidates
 *
 * 강의 완료 여부(이전+현재 강의 모두 수강)는 BE 가 검증한다.
 * 미완료이거나 마지막 강의가 아니면 BE 가 403 을 반환하므로, FE 는 이를 "notCompleted" 로 구분한다.
 */
export const getFinalProblemSetCandidates = async (
  lectureId: number | string,
): Promise<FinalProblemSetResult> => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/lectures/${lectureId}/final-problem-set-candidates`,
      { credentials: "include", headers: { Accept: "application/json" } },
    );

    if (res.status === 403) return { status: "notCompleted" };
    if (!res.ok) return { status: "error" };

    const json = await res.json().catch(() => null);
    // 응답이 배열이 아니면 빈 목록으로 — 모달의 .length/.map 런타임 오류 방지
    const data = Array.isArray(json?.data)
      ? (json.data as ProblemSetSummary[])
      : [];
    return { status: "ok", problemSets: data };
  } catch {
    return { status: "error" };
  }
};
