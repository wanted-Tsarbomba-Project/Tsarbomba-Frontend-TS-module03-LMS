"use client";

import { useEffect, useState } from "react";
import { fetchProblemSetsByCategory } from "../http";
import type { ProblemSetSummary } from "../types";

export function useProblemSets(categoryId: string) {
  const [problemSets, setProblemSets] = useState<ProblemSetSummary[]>([]);

  useEffect(() => {
    if (!categoryId) {
      setProblemSets([]);
      return;
    }
    fetchProblemSetsByCategory(categoryId).then(setProblemSets);
  }, [categoryId]);

  return problemSets;
}
