// ════════════════════════════════════════════════════════════════════════════════
// 마이페이지(회원) API — 서버 컴포넌트 전용 조회
// ════════════════════════════════════════════════════════════════════════════════

import { cookies } from "next/headers";
import type { MyProfile } from "./types";

// 서버 컴포넌트 fetch 는 프록시(rewrites)를 안 거치므로 BE 절대주소가 필요.
// 서버 전용 API_PROXY_TARGET 우선, 없으면 NEXT_PUBLIC_API_URL.
const BASE_URL =
  process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL ?? "";

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
