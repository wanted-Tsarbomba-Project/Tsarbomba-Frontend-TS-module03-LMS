import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";
import { SERVER_API_BASE_URL } from "@/lib/serverEnv";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEFAULT_FALLBACK_MESSAGE =
  "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

interface ApiResponse<T> {
  data?: T;
}

export type RankingRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export async function requestRankingJson<T>(
  path: string,
  fallbackMessage: string,
  init: RankingRequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(resolveRankingApiUrl(path), {
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

function resolveRankingApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (typeof window === "undefined") {
    if (SERVER_API_BASE_URL) {
      return `${SERVER_API_BASE_URL}${path}`;
    }

    throw new ApiClientError(
      {
        message:
          "서버 API 주소가 설정되지 않았습니다. API_PROXY_TARGET 또는 NEXT_PUBLIC_API_URL을 확인해 주세요.",
        path,
      },
      DEFAULT_FALLBACK_MESSAGE,
    );
  }

  return `${API_BASE_URL}${path}`;
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
