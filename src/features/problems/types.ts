export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export type ProblemCategoryId = "2001" | "2002" | "2003" | "2004";

export interface ProblemInfo {
  title: string;
  categoryId: ProblemCategoryId;
  difficulty: ProblemDifficulty;
  description: string;
}

export interface SubProblem {
  questionTitle: string;
  context: string;
  point: number;
  answer: string;
  hint: string;
  solution: string;
}

export interface CreateProblemRequest {
  title: string;
  categoryName: string;
  difficulty: ProblemDifficulty;
  description: string;
  dataFileName: string;
  problems: Array<{
    title: string;
    content: string;
    point: number;
    startCode: null;
    answer: string;
    hint: string;
    explanation: string;
  }>;
}
