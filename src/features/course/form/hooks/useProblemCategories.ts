"use client";

import { useEffect, useState } from "react";
import { fetchProblemCategories } from "../http";
import type { ProblemCategory } from "../types";

export function useProblemCategories() {
  const [categories, setCategories] = useState<ProblemCategory[]>([]);

  useEffect(() => {
    fetchProblemCategories().then(setCategories);
  }, []);

  return categories;
}
