// ════════════════════════════════════════════════════════════════════════════════
// 마이페이지(회원) API
// ════════════════════════════════════════════════════════════════════════════════

import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";
import type {
  MyProfile,
  LoginHistoryItem,
  TrustedDeviceItem,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

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

/** 로그인 이력 조회 — GET /api/v1/users/me/login-history (20건/페이지, 최신순) */
export const getLoginHistory = async (
  page = 0,
): Promise<LoginHistoryItem[]> => {
  return request<LoginHistoryItem[]>(
    `/api/v1/users/me/login-history?page=${page}`,
    { method: "GET" },
    "로그인 이력을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

/** 신뢰 기기 목록 조회 — GET /api/v1/users/me/trusted-devices */
export const getTrustedDevices = async (): Promise<TrustedDeviceItem[]> => {
  return request<TrustedDeviceItem[]>(
    "/api/v1/users/me/trusted-devices",
    { method: "GET" },
    "신뢰 기기 목록을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

/** 신뢰 기기 해제 — DELETE /api/v1/users/me/trusted-devices/{deviceId} */
export const removeTrustedDevice = async (deviceId: number): Promise<void> => {
  await request(
    `/api/v1/users/me/trusted-devices/${deviceId}`,
    { method: "DELETE" },
    "신뢰 기기 해제에 실패했습니다.",
  );
};

/** 내 프로필 수정 — PUT /api/v1/users/me (닉네임/전화번호) */
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

/** 비밀번호 변경 — PUT /api/v1/users/me/password */
export const changeMyPassword = async (
  newPassword: string,
  confirmPassword: string,
): Promise<void> => {
  await request(
    "/api/v1/users/me/password",
    {
      method: "PUT",
      body: JSON.stringify({ newPassword, confirmPassword }),
    },
    "비밀번호 변경에 실패했습니다.",
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
