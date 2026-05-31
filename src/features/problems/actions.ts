import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

import type {
  CreateProblemRequest,
  ProblemCategoryId,
  ProblemInfo,
  SubProblem,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const DIFFICULTY_MAP = {
  EASY: "쉬움",
  MEDIUM: "보통",
  HARD: "어려움",
} as const;

export const PROBLEM_CATEGORY: Record<ProblemCategoryId, string> = {
  "2001": "비즈니스 기초",
  "2002": "데이터 분석",
  "2003": "백엔드 설계",
  "2004": "Python 데이터 분석",
};

export const INITIAL_PROBLEM_INFO: ProblemInfo = {
  title: "",
  categoryId: "2001",
  difficulty: "EASY",
  description: "",
};

export const INITIAL_SUB_PROBLEM: SubProblem = {
  questionTitle: "",
  context: "",
  point: 1,
  answer: "",
  hint: "",
  solution: "",
};

const REQUEST_PATH = "/api/v1/problems/with-dataset";
const FALLBACK_MESSAGE = "문제를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.";

export function createProblemRequestBody(
  problemInfo: ProblemInfo,
  problems: SubProblem[],
  file: File,
): CreateProblemRequest {
  return {
    title: problemInfo.title,
    categoryName: PROBLEM_CATEGORY[problemInfo.categoryId],
    difficulty: problemInfo.difficulty,
    description: problemInfo.description,
    dataFileName: file.name,
    problems: problems.map((problem) => ({
      title: problem.questionTitle,
      content: problem.context,
      point: Number(problem.point),
      startCode: null,
      answer: problem.answer,
      hint: problem.hint,
      explanation: problem.solution,
    })),
  };
}

export async function createProblem(requestBody: CreateProblemRequest, file: File) {
  const formData = new FormData();

  formData.append(
    "request",
    new Blob([JSON.stringify(requestBody)], {
      type: "application/json",
    }),
  );
  formData.append("datasetFile", file);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${REQUEST_PATH}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch (error) {
    throw new ApiClientError(
      {
        message:
          error instanceof Error
            ? error.message
            : "서버와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        path: REQUEST_PATH,
      },
      FALLBACK_MESSAGE,
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw createApiError(response, text);
  }

  return text ? JSON.parse(text) : null;
}

function createApiError(response: Response, text: string) {
  if (!text) {
    return new ApiClientError(
      {
        status: response.status,
        message: FALLBACK_MESSAGE,
        path: REQUEST_PATH,
      },
      FALLBACK_MESSAGE,
    );
  }

  try {
    const payload = JSON.parse(text) as BackendErrorPayload;

    return new ApiClientError(
      {
        ...payload,
        status: payload.status ?? response.status,
        path: payload.path ?? REQUEST_PATH,
      },
      FALLBACK_MESSAGE,
    );
  } catch {
    return new ApiClientError(
      {
        status: response.status,
        message: text || FALLBACK_MESSAGE,
        path: REQUEST_PATH,
      },
      FALLBACK_MESSAGE,
    );
  }
}
