// 문제 도메인은 강좌 도메인과 별개라 강좌 actions 를 거치지 않고 직접 fetch.
// 쿠키 인증 + 로컬 토큰을 병행 (앱 전반의 인증 방식과 동일).

import type { ProblemCategory, ProblemSetSummary } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const authHeader = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: { ...authHeader() },
    });
    const json = await res.json();
    // 페이지네이션 응답(data.content) / 비페이지네이션(data 배열) / 루트 배열 모두 수용
    const data = Array.isArray(json?.data?.content)
      ? json.data.content
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : null;
    return (data as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchProblemCategories(): Promise<ProblemCategory[]> {
  const arr = await fetchJson<ProblemCategory[]>(
    "/api/v1/problem-categories",
    [],
  );

  return arr.map((c) => ({ ...c, categoryId: String(c.categoryId) }));
}

export async function fetchProblemSetsByCategory(
  categoryId: string,
): Promise<ProblemSetSummary[]> {
  if (!categoryId) return [];
  return fetchJson<ProblemSetSummary[]>(
    `/api/v1/problem-sets?categoryId=${encodeURIComponent(categoryId)}`,
    [],
  );
}
