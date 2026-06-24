import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

import type {
  CreateProblemRequest,
  NormalizedProblemDetail,
  ProblemDatasetFile,
  ProblemCategoryId,
  ProblemCategory,
  ChatMessage,
  ChatResponse,
  ChatRoomTitleUpdate,
  ExecutionResult,
  ProblemHint,
  ProblemInfo,
  ProblemChatRoom,
  ProblemDatasetDownloadUrl,
  ProblemSetDetail,
  ProblemSetDetailProblem,
  ProblemSetResult,
  ProblemSetSummary,
  ProblemStatus,
  RawProblemDetail,
  SubmissionResult,
  SubProblem,
  UpdateProblemRequest,
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

export const INITIAL_PROBLEM_INFO: ProblemInfo = {
  title: "",
  categoryId: "",
  difficulty: "EASY",
  description: "",
};

export const INITIAL_SUB_PROBLEM: SubProblem = {
  questionTitle: "",
  context: "",
  point: 1,
  hint: "",
  solution: "",
  testCases: [
    {
      testCode: "",
      isHidden: false,
      timeoutMs: 3,
    },
  ],
};

interface ApiResponse<T> {
  data?: T;
}

type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

const CREATE_PATH = "/api/v1/problems/with-dataset";
const DEFAULT_FALLBACK_MESSAGE =
  "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

export function createProblemRequestBody(
  problemInfo: ProblemInfo,
  problems: SubProblem[],
  file: File,
  categories: ProblemCategory[],
): CreateProblemRequest {
  return {
    title: problemInfo.title,
    categoryName: getProblemCategoryName(problemInfo.categoryId, categories),
    difficulty: problemInfo.difficulty,
    description: problemInfo.description,
    dataFileName: file.name,
    problems: problems.map((problem) => ({
      title: problem.questionTitle,
      content: problem.context,
      point: Number(problem.point),
      startCode: problem.startCode ?? null,
      hint: problem.hint,
      explanation: problem.solution,
      testCases: problem.testCases.map((testCase) => ({
        testCode: testCase.testCode,
        isHidden: testCase.isHidden,
        timeoutMs: Number(testCase.timeoutMs) * 1000,
      })),
    })),
  };
}

export async function createProblem(
  requestBody: CreateProblemRequest,
  file: File,
) {
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
    response = await fetch(`${API_BASE_URL}${CREATE_PATH}`, {
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
        path: CREATE_PATH,
      },
      "문제를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw createApiError(
      response,
      text,
      CREATE_PATH,
      "문제를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  return text ? JSON.parse(text) : null;
}

export function createProblemUpdateRequestBody(
  problemInfo: ProblemInfo,
  problems: SubProblem[],
  file: ProblemDatasetFile | null,
  datasetId: number | null,
  categories: ProblemCategory[],
): UpdateProblemRequest {
  return {
    title: problemInfo.title,
    categoryName: getProblemCategoryName(problemInfo.categoryId, categories),
    difficulty: problemInfo.difficulty,
    description: problemInfo.description,
    dataFileName: file?.name ?? "",
    datasetId,
    problems: problems.map((problem) => ({
      problemId: problem.problemId,
      title: problem.questionTitle,
      content: problem.context,
      point: Number(problem.point),
      startCode: problem.startCode ?? null,
      hintId: problem.hintId,
      hint: problem.hint,
      explanation: problem.solution,
      testCases: problem.testCases.map((testCase) => ({
        testCode: testCase.testCode,
        isHidden: testCase.isHidden,
        timeoutMs: Number(testCase.timeoutMs) * 1000,
      })),
    })),
  };
}

export async function getProblemSets(
  categoryId?: string | null,
  revalidateSeconds?: number,
  init: NextRequestInit = {},
) {
  const path = categoryId
    ? `/api/v1/problem-sets?categoryId=${encodeURIComponent(categoryId)}`
    : "/api/v1/problem-sets";

  const result = await requestJson<ProblemSetSummary[]>(
    path,
    "문제 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      ...init,
      ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : {}),
    },
  );

  return result.data ?? [];
}

export async function getProblemCategories(
  revalidateSeconds?: number,
  init: NextRequestInit = {},
) {
  const result = (await requestJson<ProblemCategory[]>(
    "/api/v1/problem-categories",
    "카테고리 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      ...init,
      ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : {}),
    },
  )) as ApiResponse<ProblemCategory[]> | ProblemCategory[];

  const categories = Array.isArray(result) ? result : (result.data ?? []);

  return categories.map((category) => ({
    ...category,
    categoryId: String(category.categoryId),
  }));
}

export async function getProblem(
  problemSetId: string,
  categories: ProblemCategory[] = [],
  init: NextRequestInit = {},
) {
  const result = await requestJson<RawProblemDetail>(
    `/api/v1/problems/${problemSetId}`,
    "문제 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return normalizeProblemDetail(result.data, categories);
}

export async function updateProblem(
  problemSetId: string,
  requestBody: UpdateProblemRequest,
  file: ProblemDatasetFile | null,
) {
  const hasNewFile = file instanceof File;

  if (hasNewFile) {
    return updateProblemWithFormData(problemSetId, requestBody, file);
  }

  try {
    return await requestJson<unknown>(
      `/api/v1/problems/${problemSetId}`,
      "문제를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
      },
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 415) {
      return updateProblemWithFormData(problemSetId, requestBody, null);
    }

    throw error;
  }
}

export async function deleteProblem(problemSetId: string) {
  return requestJson<unknown>(
    `/api/v1/problems/${problemSetId}`,
    "문제를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "DELETE",
    },
  );
}

export async function getProblemSetDetail(
  problemSetId: string,
  userId: string,
  init: NextRequestInit = {},
) {
  const params = new URLSearchParams();

  if (userId) {
    params.set("userId", userId);
  }

  const query = params.toString();
  const result = await requestJson<unknown>(
    `/api/v1/problem-sets/${problemSetId}${query ? `?${query}` : ""}`,
    "문제 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return normalizeProblemSetDetail(result);
}

export async function getProblemSetResult(
  problemSetId: string,
  init: NextRequestInit = {},
) {
  const result = await requestJson<ProblemSetResult>(
    `/api/v1/problem-sets/${problemSetId}/result`,
    "문제 풀이 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data ?? null;
}

export async function getProblemDatasetDownloadUrl(problemSetId: string) {
  const result = await requestJson<ProblemDatasetDownloadUrl>(
    `/api/v1/problem-sets/${encodeURIComponent(
      problemSetId,
    )}/dataset/download-url`,
    "데이터셋 다운로드 URL을 발급받지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "POST",
    },
  );

  return result.data ?? null;
}

export async function getProblemHints(problemId: number) {
  const result = await requestJson<ProblemHint[]>(
    `/api/v1/problems/${problemId}/hints`,
    "힌트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
  );

  return result.data ?? [];
}

export async function submitProblem(
  problemId: number,
  userId: string,
  code: string,
) {
  const result = await requestJson<SubmissionResult>(
    `/api/v1/problems/${problemId}/submissions`,
    "답안을 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "POST",
      body: JSON.stringify({ userId, code }),
    },
  );

  return result.data ?? {};
}

export async function runProblem(
  problemId: number,
  userId: string,
  code: string,
) {
  const result = await requestJson<ExecutionResult>(
    `/api/v1/code-problems/${problemId}/executions`,
    "코드를 실행하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "POST",
      body: JSON.stringify({ userId, code }),
    },
  );

  return result.data ?? {};
}

export async function createProblemChatMessage(
  userMessage: string,
  problemSetId: number,
  problemId: number,
) {
  const result = await requestJson<ChatResponse>(
    "/api/v1/chat/messages",
    "AI 답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "POST",
      body: JSON.stringify({ userMessage, problemSetId, problemId }),
    },
  );

  return result.data;
}

export async function getProblemChatRooms(init: NextRequestInit = {}) {
  const result = await requestJson<ProblemChatRoom[]>(
    "/api/v1/chat/list",
    "채팅방 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "GET",
      ...init,
    },
  );

  return result.data ?? [];
}

export async function getProblemChatMessages(
  roomId: number,
  init: NextRequestInit = {},
) {
  const result = await requestJson<ChatMessage[]>(
    `/api/v1/chat/${roomId}/messages`,
    "채팅 내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "GET",
      ...init,
    },
  );

  return result.data ?? [];
}

export async function sendProblemChatMessage(
  roomId: number,
  userMessage: string,
) {
  const result = await requestJson<ChatResponse>(
    `/api/v1/chat/${roomId}/messages`,
    "AI 답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "POST",
      body: JSON.stringify({ userMessage }),
    },
  );

  return result.data;
}

export async function updateProblemChatRoomTitle(roomId: number, title: string) {
  const result = await requestJson<ChatRoomTitleUpdate>(
    `/api/v1/chat/${roomId}`,
    "채팅방 이름을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    },
  );

  return result.data;
}

function normalizeProblemSetDetail(response: unknown): ProblemSetDetail {
  const payload = response as
    | { data?: Record<string, unknown> }
    | Record<string, unknown>;
  const data = "data" in payload && payload.data ? payload.data : payload;
  const rawData = data as {
    id?: number;
    problemSetId?: number;
    title?: string;
    currentProblemId?: number;
    currentProblemNumber?: number;
    problem?: ProblemSetDetailProblem;
    problems?: ProblemSetDetailProblem[];
  };
  const problemList = Array.isArray(rawData.problems)
    ? rawData.problems
    : rawData.problem
      ? [rawData.problem]
      : [];
  const problems = problemList.map((problem) =>
    rawData.problem?.problemId === problem.problemId
      ? { ...problem, ...rawData.problem }
      : problem,
  );

  return {
    id: rawData.problemSetId ?? rawData.id ?? 0,
    problemSetId: rawData.problemSetId,
    title: rawData.title,
    currentProblemId: rawData.currentProblemId,
    currentProblemNumber: rawData.currentProblemNumber,
    problems: problems.map((problem, index) => ({
      problemId: problem.problemId,
      problemNumber: problem.problemNumber ?? index + 1,
      title: problem.title ?? `문제 ${index + 1}`,
      content: problem.content ?? "",
      point: problem.point,
      startCode: problem.startCode ?? "",
      answer: problem.answer,
      explanation: problem.explanation,
      status: (problem.status ?? "UNSOLVED") as ProblemStatus,
    })),
  };
}

function normalizeProblemDetail(
  data?: RawProblemDetail,
  categories: ProblemCategory[] = [],
): NormalizedProblemDetail {
  const rawProblems = data?.problems?.length ? data.problems : null;

  return {
    problemInfo: {
      title: data?.title ?? "",
      categoryId: getProblemCategoryId(data?.categoryName, categories),
      difficulty: data?.difficulty ?? INITIAL_PROBLEM_INFO.difficulty,
      description: data?.description ?? "",
    },
    problems: rawProblems
      ? rawProblems.map((problem) => ({
          problemId: problem.problemId,
          hintId: problem.hintId,
          questionTitle: problem.title ?? "",
          context: problem.content ?? "",
          point: problem.point ?? 1,
          startCode: problem.startCode ?? null,
          hint: problem.hint ?? "",
          solution: problem.explanation ?? "",
          testCases: problem.testCases?.length
            ? problem.testCases.map((testCase) => ({
                testCode: testCase.testCode ?? "",
                isHidden: testCase.isHidden ?? false,
                timeoutMs: Math.max(
                  1,
                  Math.ceil((testCase.timeoutMs ?? 3000) / 1000),
                ),
              }))
            : INITIAL_SUB_PROBLEM.testCases.map((testCase) => ({
                ...testCase,
              })),
        }))
      : [
          {
            ...INITIAL_SUB_PROBLEM,
            testCases: INITIAL_SUB_PROBLEM.testCases.map((testCase) => ({
              ...testCase,
            })),
          },
        ],
    file: data?.dataFileName
      ? { name: data.dataFileName, isExisting: true }
      : null,
    datasetId: data?.datasetId ?? null,
  };
}

function getProblemCategoryId(
  categoryName?: string,
  categories: ProblemCategory[] = [],
): ProblemCategoryId {
  const category = categories.find(
    (item) => item.categoryName === categoryName,
  );

  return category?.categoryId ?? INITIAL_PROBLEM_INFO.categoryId;
}

function getProblemCategoryName(
  categoryId: ProblemCategoryId,
  categories: ProblemCategory[],
) {
  return (
    categories.find((category) => category.categoryId === categoryId)
      ?.categoryName ?? ""
  );
}

async function requestJson<T>(
  path: string,
  fallbackMessage: string,
  init: NextRequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
  } catch (error) {
    throw new ApiClientError(
      {
        message:
          error instanceof Error
            ? error.message
            : "서버와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        path,
      },
      fallbackMessage,
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw createApiError(response, text, path, fallbackMessage);
  }

  if (!text) {
    return { data: undefined as T };
  }

  return JSON.parse(text) as ApiResponse<T>;
}

async function updateProblemWithFormData(
  problemSetId: string,
  requestBody: UpdateProblemRequest,
  file: File | null,
) {
  const path = `/api/v1/problems/${problemSetId}/with-dataset`;
  const formData = new FormData();

  formData.append(
    "request",
    new Blob([JSON.stringify(requestBody)], {
      type: "application/json",
    }),
  );

  if (file) {
    formData.append("datasetFile", file);
  }

  return requestJson<unknown>(
    path,
    "문제를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "PUT",
      body: formData,
    },
  );
}

function createApiError(
  response: Response,
  text: string,
  requestPath: string,
  fallbackMessage = DEFAULT_FALLBACK_MESSAGE,
) {
  if (!text) {
    return new ApiClientError(
      {
        status: response.status,
        message: fallbackMessage,
        path: requestPath,
      },
      fallbackMessage,
    );
  }

  try {
    const payload = JSON.parse(text) as BackendErrorPayload;

    return new ApiClientError(
      {
        ...payload,
        status: payload.status ?? response.status,
        path: payload.path ?? requestPath,
      },
      fallbackMessage,
    );
  } catch {
    return new ApiClientError(
      {
        status: response.status,
        message: text || fallbackMessage,
        path: requestPath,
      },
      fallbackMessage,
    );
  }
}
