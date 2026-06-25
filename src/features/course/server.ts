// 강좌 도메인 — 서버 컴포넌트 전용 조회
import { cookies } from "next/headers";
import type { Course, CourseDetail, Enrollment, LectureSummary } from "./types";

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

async function getJson<T>(path: string, fallbackMessage: string): Promise<T> {
  const cookieHeader = (await cookies()).toString();

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json", Cookie: cookieHeader },
    cache: "no-store",
  });

  if (response.status === 401) throw new UnauthorizedError();
  if (!response.ok) throw new Error(fallbackMessage);

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  let parsed: { data?: unknown };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(fallbackMessage);
  }
  return (parsed?.data ?? parsed) as T;
}

export async function getUserCoursesServer(): Promise<Course[]> {
  const data = await getJson<Course[]>(
    "/api/v1/courses",
    "강좌 목록을 불러오지 못했습니다.",
  );
  return data ?? [];
}

export async function getMyEnrollmentsServer(): Promise<Enrollment[]> {
  const data = await getJson<Enrollment[]>(
    "/api/v1/users/me/enrollments",
    "수강 목록을 불러오지 못했습니다.",
  );
  return data ?? [];
}

export async function getCourseServer(
  courseId: string | number,
): Promise<CourseDetail> {
  return getJson<CourseDetail>(
    `/api/v1/courses/${courseId}`,
    "강좌 정보를 불러오지 못했습니다.",
  );
}

export async function getCourseLecturesServer(
  courseId: string | number,
): Promise<LectureSummary[]> {
  const data = await getJson<LectureSummary[]>(
    `/api/v1/courses/${courseId}/lectures`,
    "강의 목록을 불러오지 못했습니다.",
  );
  return (data ?? []).sort((a, b) => a.lectureOrder - b.lectureOrder);
}
