export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export type ProblemCategoryId = string;

export interface ProblemCategory {
  categoryId: ProblemCategoryId;
  categoryName: string;
  description?: string;
}

export interface ProblemInfo {
  title: string;
  categoryId: ProblemCategoryId;
  difficulty: ProblemDifficulty;
  description: string;
}

export interface SubProblem {
  problemId?: number;
  hintId?: number;
  questionTitle: string;
  context: string;
  point: number;
  startCode?: string | null;
  answer: string;
  hint: string;
  solution: string;
}

export interface ExistingDatasetFile {
  name: string;
  isExisting: true;
}

export type ProblemDatasetFile = File | ExistingDatasetFile;

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

export interface UpdateProblemRequest {
  title: string;
  categoryName: string;
  difficulty: ProblemDifficulty;
  description: string;
  dataFileName: string;
  datasetId?: number | null;
  problems: Array<{
    problemId?: number;
    title: string;
    content: string;
    point: number;
    startCode: string | null;
    answer: string;
    hintId?: number;
    hint: string;
    explanation: string;
  }>;
}

export interface ProblemSetSummary {
  problemSetId: number;
  problemNumber?: number;
  title: string;
  description: string;
  difficulty: ProblemDifficulty | string;
  accuracyRate?: number;
  createdAt?: string;
}

export interface RawProblemDetail {
  title?: string;
  categoryName?: string;
  difficulty?: ProblemDifficulty;
  description?: string;
  dataFileName?: string;
  datasetId?: number;
  problems?: Array<{
    problemId?: number;
    hintId?: number;
    title?: string;
    content?: string;
    point?: number;
    startCode?: string | null;
    answer?: string;
    hint?: string;
    explanation?: string;
  }>;
}

export interface NormalizedProblemDetail {
  problemInfo: ProblemInfo;
  problems: SubProblem[];
  file: ExistingDatasetFile | null;
  datasetId: number | null;
}

export type ProblemStatus = "LOCKED" | "UNSOLVED" | "CORRECT" | "WRONG";

export type ProblemResultTab = "result" | "hint" | "solution";

export interface ProblemSetDetailProblem {
  problemId: number;
  problemNumber?: number;
  title: string;
  content: string;
  point?: number;
  startCode?: string | null;
  answer?: string;
  explanation?: string;
  status?: ProblemStatus;
}

export interface ProblemSetDetail {
  id: number;
  problemSetId?: number;
  title?: string;
  currentProblemId?: number;
  currentProblemNumber?: number;
  problems: ProblemSetDetailProblem[];
}

export interface ProblemHint {
  hintId: number;
  hintContent: string;
}

export interface ExecutionResult {
  executionStatus?: string;
  output?: string;
  stdout?: string;
  result?: string;
  message?: string;
  errorMessage?: string;
  stderr?: string;
}

export interface SubmissionResult {
  isCorrect?: boolean;
  passedTestCount?: number;
  totalTestCount?: number;
  executionStatus?: string;
  errorMessage?: string;
  explanation?: string;
  nextProblemId?: number;
}

export interface ChatMessage {
  role: "USER" | "ASSISTANT";
  content: string;
  error?: boolean;
}

export interface ChatResponse {
  answer: string;
  roomId?: number;
}
