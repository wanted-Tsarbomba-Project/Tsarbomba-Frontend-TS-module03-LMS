import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

import type { ApiResponse } from "./types";

// 빈값이어도 상대경로(/api/...)로 호출되어 프록시/ALB 가 처리하도록 throw 대신 "" 폴백
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const JSON_HEADERS = { "Content-Type": "application/json" };
const FALLBACK_MESSAGE =
  "요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

export async function requestAdminOperation<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...JSON_HEADERS,
        ...init.headers,
      },
    });
  } catch (error) {
    throw new ApiClientError(
      {
        message: error instanceof Error ? error.message : FALLBACK_MESSAGE,
        path,
      },
      FALLBACK_MESSAGE,
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw createApiError(response, text, path);
  }

  if (!text) {
    return { data: undefined };
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      {
        message: FALLBACK_MESSAGE,
        path,
      },
      FALLBACK_MESSAGE,
    );
  }
}

function createApiError(response: Response, text: string, requestPath: string) {
  if (!text) {
    return new ApiClientError(
      {
        status: response.status,
        message: FALLBACK_MESSAGE,
        path: requestPath,
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
        path: payload.path ?? requestPath,
      },
      FALLBACK_MESSAGE,
    );
  } catch {
    return new ApiClientError(
      {
        status: response.status,
        message: text || FALLBACK_MESSAGE,
        path: requestPath,
      },
      FALLBACK_MESSAGE,
    );
  }
}
