import type { ProblemSetSummary } from "./types";

function normalizeKeyword(keyword: string) {
  return keyword.trim().toLowerCase();
}

export function matchesProblemSetKeyword(
  problemSet: ProblemSetSummary,
  keyword: string,
) {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return true;
  }

  return problemSet.title.toLowerCase().includes(normalizedKeyword);
}
