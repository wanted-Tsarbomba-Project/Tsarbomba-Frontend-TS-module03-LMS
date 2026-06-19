import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

import type { RankingListData, RankingUser } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

interface ApiResponse<T> {
  data?: T;
}

type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

async function requestJson<T>(
  path: string,
  fallbackMessage: string,
  init: NextRequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      cache: init.cache ?? "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
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

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      {
        message: fallbackMessage,
        path,
      },
      fallbackMessage,
    );
  }
}

export async function getTotalPointRankings(init: NextRequestInit = {}) {
  const result = await requestJson<RankingListData>(
    "/api/v1/rankings/points",
    "전체 랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data?.rankings ?? [];
}

export async function getWeeklyPointRankings(init: NextRequestInit = {}) {
  const result = await requestJson<RankingListData>(
    "/api/v1/rankings/points/weekly",
    "주간 랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data?.rankings ?? [];
}

export async function getMyPointRanking(init: NextRequestInit = {}) {
  const result = await requestJson<RankingUser>(
    "/api/v1/rankings/points/me",
    "내 랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    init,
  );

  return result.data ?? null;
}

function createApiError(
  response: Response,
  text: string,
  requestPath: string,
  fallbackMessage: string,
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
