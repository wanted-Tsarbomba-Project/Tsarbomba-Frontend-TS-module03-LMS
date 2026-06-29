import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

import { requestAdminOperation } from "../operations/api";
import type {
  AdminBadge,
  CreateBadgePayload,
  UpdateBadgePayload,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const BADGE_PATH = "/api/v1/admin/badges";
const FALLBACK_MESSAGE =
  "배지 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

export async function getAdminBadges() {
  const result = await requestAdminOperation<AdminBadge[]>(BADGE_PATH);

  return result.data ?? [];
}

export async function getAdminBadgeDetail(badgeId: string) {
  const result = await requestAdminOperation<AdminBadge>(
    `${BADGE_PATH}/${encodeURIComponent(badgeId)}`,
  );

  return result.data ?? null;
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
    return unwrapApiData<AdminBadge>(JSON.parse(text));
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

export async function updateAdminBadge(
  badgeId: string,
  payload: UpdateBadgePayload,
  badgeImage?: File | null,
) {
  const formData = new FormData();

  formData.append("request", JSON.stringify(payload));

  if (badgeImage) {
    formData.append("badgeImage", badgeImage);
  }

  const path = `${BADGE_PATH}/${encodeURIComponent(badgeId)}`;
  const result = await requestBadgeMultipart<AdminBadge>(path, {
    method: "PATCH",
    body: formData,
  });

  return result;
}

export async function deleteAdminBadge(badgeId: string) {
  return requestAdminOperation<Record<string, never>>(
    `${BADGE_PATH}/${encodeURIComponent(badgeId)}`,
    {
      method: "DELETE",
    },
  );
}

async function requestBadgeMultipart<T>(path: string, init: RequestInit) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
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
    return null;
  }

  try {
    return unwrapApiData<T>(JSON.parse(text));
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

function unwrapApiData<T>(parsed: unknown) {
  if (parsed !== null && typeof parsed === "object" && "data" in parsed) {
    return (parsed as { data?: T }).data ?? null;
  }

  return parsed as T;
}

function createApiError(
  response: Response,
  text: string,
  requestPath = BADGE_PATH,
) {
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
