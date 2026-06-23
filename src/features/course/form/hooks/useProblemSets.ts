"use client";

import { useEffect, useState } from "react";
import { fetchProblemSetsByCategory } from "../http";
import type { ProblemSetSummary } from "../types";

// snapshot.key === categoryId 매칭으로 빈 상태를 렌더에서 derive — effect setState 제거 + 응답 레이스 방지.
export function useProblemSets(categoryId: string) {
  const [snapshot, setSnapshot] = useState<{
    key: string;
    sets: ProblemSetSummary[];
  }>({ key: "", sets: [] });

  useEffect(() => {
    if (!categoryId) return;
    let alive = true;
    fetchProblemSetsByCategory(categoryId).then((sets) => {
      if (alive) setSnapshot({ key: categoryId, sets });
    });
    return () => {
      alive = false;
    };
  }, [categoryId]);

  return snapshot.key === categoryId ? snapshot.sets : [];
}
