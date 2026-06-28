import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

import { requestAdminOperation } from "../operations/api";
import type { AdminBadge, CreateBadgePayload } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const BADGE_PATH = "/api/v1/admin/badges";
const FALLBACK_MESSAGE =
  "배지 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

export async function getAdminBadges() {
  const result = await requestAdminOperation<AdminBadge[]>(BADGE_PATH);

  return result.data ?? [];
}

export async function createAdminBadge(
  payload: CreateBadgePayload,
  badgeImage: File,
) {
  const formData = new FormData();

  formData.append("request", JSON.stringify(payload));
  formData.append("badgeImage", badgeImage);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${BADGE_PATH}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch (error) {
    throw new ApiClientError(
      {
        message: error instanceof Error ? error.message : FALLBACK_MESSAGE,
        path: BADGE_PATH,
      },
      FALLBACK_MESSAGE,
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw createApiError(response, text);
  }

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text) as { data?: AdminBadge } | AdminBadge;

    return "data" in parsed ? (parsed.data ?? null) : parsed;
  } catch {
    throw new ApiClientError(
      {
        message: FALLBACK_MESSAGE,
        path: BADGE_PATH,
      },
      FALLBACK_MESSAGE,
    );
  }
}

function createApiError(response: Response, text: string) {
  if (!text) {
    return new ApiClientError(
      {
        status: response.status,
        message: FALLBACK_MESSAGE,
        path: BADGE_PATH,
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
        path: payload.path ?? BADGE_PATH,
      },
      FALLBACK_MESSAGE,
    );
  } catch {
    return new ApiClientError(
      {
        status: response.status,
        message: text || FALLBACK_MESSAGE,
        path: BADGE_PATH,
      },
      FALLBACK_MESSAGE,
    );
  }
}
