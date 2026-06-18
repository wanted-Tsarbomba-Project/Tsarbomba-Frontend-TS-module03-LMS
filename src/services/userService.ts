// ════════════════════════════════════════════════════════════════════════════════
// userService — 마이페이지(회원) API
// ════════════════════════════════════════════════════════════════════════════════

import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** 내 프로필 (GET /api/v1/users/me 응답) */
export interface MyProfile {
  email: string;
  name: string;
  nickname: string;
  phone: string;
  role: string;
  provider: string;
  emailVerified: boolean;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  fallbackMessage = "요청을 처리하지 못했습니다.",
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
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

  const text = await response.text();

  // 실패 시
  if (!response.ok) {
    let payload: BackendErrorPayload = {};
    try {
      payload = text ? (JSON.parse(text) as BackendErrorPayload) : {};
    } catch {
      payload = { message: text };
    }
    throw new ApiClientError(
      {
        ...payload,
        status: payload.status ?? response.status,
        path: payload.path ?? path,
      },
      fallbackMessage,
    );
  }

  const parsed = text ? JSON.parse(text) : null;
  return (parsed?.data ?? parsed) as T;
}

/** 내 정보 조회 — GET /api/v1/users/me */
export const getMyProfile = async (): Promise<MyProfile> => {
  return request<MyProfile>(
    "/api/v1/users/me",
    { method: "GET" },
    "회원 정보를 불러오지 못했습니다.",
  );
};

/**
 * 내 프로필 수정 — PUT /api/v1/users/me (API 명세 기준)
 * 명세상 닉네임/전화번호 수정 가능.
 */
export const updateMyProfile = async (body: {
  nickname: string;
  phone?: string;
}): Promise<void> => {
  await request(
    "/api/v1/users/me",
    { method: "PUT", body: JSON.stringify(body) },
    "프로필 수정에 실패했습니다.",
  );
};

/** 비밀번호 확인 — POST /api/v1/users/me/verify-password */
export const verifyPassword = async (password: string): Promise<void> => {
  await request(
    "/api/v1/users/me/verify-password",
    { method: "POST", body: JSON.stringify({ password }) },
    "비밀번호가 일치하지 않습니다.",
  );
};

/** 회원 탈퇴 — DELETE /api/v1/users/me { password } */
export const withdrawUser = async (password: string): Promise<void> => {
  await request(
    "/api/v1/users/me",
    { method: "DELETE", body: JSON.stringify({ password }) },
    "회원 탈퇴에 실패했습니다.",
  );
};
