// ════════════════════════════════════════════════════════════════════════════════
// 마이페이지(회원) API — 서버 컴포넌트 전용 조회
// ════════════════════════════════════════════════════════════════════════════════

import { cookies } from "next/headers";
import { SERVER_API_BASE_URL as BASE_URL } from "@/lib/serverEnv";
import type { MyProfile } from "./types";

/** 미인증(401) 식별용 */
export class UnauthorizedError extends Error {
  constructor() {
    super("인증이 필요합니다.");
    this.name = "UnauthorizedError";
  }
}

/** 내 정보 조회 (서버) — GET /api/v1/users/me */
export async function getMyProfileServer(): Promise<MyProfile> {
  const cookieHeader = (await cookies()).toString();

  const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (response.status === 401) throw new UnauthorizedError();
  if (!response.ok) throw new Error("회원 정보를 불러오지 못했습니다.");

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  return (parsed?.data ?? parsed) as MyProfile;
}
