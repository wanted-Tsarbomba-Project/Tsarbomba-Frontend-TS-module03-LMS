const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ────────────────────────────────────────────────────────────────────────────────
// 공통 유틸
// ────────────────────────────────────────────────────────────────────────────────

/**
 * 유튜브 URL 유효성 검사 — 백엔드(LectureCommandService)와 동일 규칙.
 */
export const isValidYoutubeUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (u.port || u.username || u.password) return false;
    const isId = (id: string) => /^[A-Za-z0-9_-]{11}$/.test(id);
    const host = u.hostname.toLowerCase();
    if (host === "youtu.be") {
      const seg = u.pathname.slice(1).split("/");
      return seg.length === 1 && isId(seg[0]);
    }
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      if (u.pathname === "/watch") {
        const vs = u.searchParams.getAll("v");
        return vs.length === 1 && isId(vs[0]);
      }
      const embed = u.pathname.match(/^\/embed\/([^/]+)$/);
      if (embed) return isId(embed[1]);
      const shorts = u.pathname.match(/^\/shorts\/([^/]+)$/);
      if (shorts) return isId(shorts[1]);
    }
    return false;
  } catch {
    return false;
  }
};

export const resolveThumbnailUrl = (url?: string | null): string => {
  if (!url) return "";
  if (
    url.startsWith("http") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

/**
 * JSON 요청 공통 처리.
 * - 쿠키 인증 고정(credentials: "include")
 * - FormData면 Content-Type 자동 설정에 맡기고, 그 외엔 application/json
 * - 실패 시 백엔드 message → 없으면 fallbackMessage로 throw
 * - 성공 시 { data } 래핑을 벗겨서 반환
 */
async function request<T>(
  path: string,
  init: RequestInit = {},
  fallbackMessage = "요청을 처리하지 못했습니다.",
): Promise<T> {
  const isFormData = init.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(parsed?.message || fallbackMessage);
  }

  return (parsed?.data ?? parsed) as T;
}

// ════════════════════════════════════════════════════════════════════════════════
// 타입
// ════════════════════════════════════════════════════════════════════════════════

// ── 강좌 ─────────────────────────────────────────────────────────────────────────

/* 강좌 목록 아이템 */
export interface Course {
  courseId: number;
  instructorId: number;
  courseCategoryId: number | null;
  courseCategoryName: string | null;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: "ACTIVE" | "DRAFT" | "DELETED";
}

/* 강좌 상세 */
export interface CourseDetail {
  courseId: number;
  instructorId?: number;
  instructorName?: string | null;
  courseCategoryId: number | null;
  courseCategoryName: string | null;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: string;
}

/* 강좌 카테고리 (드롭다운) */
export interface CourseCategory {
  courseCategoryId: number;
  name: string;
}

// ── 강의 ─────────────────────────────────────────────────────────────────────────

/* 강의 요약 (목록 / 상세 공용) */
export interface LectureSummary {
  lectureId: number;
  courseId?: number;
  title: string;
  description: string;
  lectureOrder: number;
  lectureType?: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
}

// ── 수강 / 학습 ──────────────────────────────────────────────────────────────────

/* 내 수강 강좌 (enrollment 기준) */
export interface Enrollment {
  enrollmentId?: number;
  courseId?: number;
  courseTitle?: string | null;
  courseDescription?: string | null;
  courseThumbnailUrl?: string | null;
  courseCategoryName?: string | null;
  instructorName?: string | null;
  status?: string | null;
  enrolledAt?: string | null;
}

/* 수강생 학습 현황 (강사용) */
export interface LearningProgressItem {
  userId: number;
  userName: string;
  email?: string;
  completedLectures: number;
  totalLectures: number;
  progressRate: number;
}

// ── 등록/수정 요청 바디 ──────────────────────────────────────────────────────────

/* 강좌 생성·수정 요청 바디 */
export interface CourseUpsertBody {
  title: string;
  courseCategoryId: number;
  description: string;
  thumbnailUrl: string;
}

/* 강의 생성·수정 요청 바디 */
export interface LectureUpsertBody {
  title: string;
  description: string | null;
  videoUrl?: string | null;
  lectureOrder: number;
  lectureType?: string;
}

// ── 문제세트 연결 ────────────────────────────────────────────────────────────────

/* 강좌 ↔ 문제세트 연결 요청 (configure용) */
export interface ProblemSetConnection {
  problemSetId: number;
  lectureId: number | null;
  role: string;
  displayOrder: number;
}

/* 강좌에 연결된 문제세트 (조회 응답) */
export interface CourseProblemSetLink {
  courseProblemSetId: number;
  lectureProblemSetId?: number;
  courseId: number;
  lectureId: number;
  problemSetId: number;
  role: string;
  displayOrder: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// 강좌 (Course)
// ════════════════════════════════════════════════════════════════════════════════

/* 강좌 목록 조회 — GET /api/v1/courses */
export const getUserCourses = async (): Promise<Course[]> => {
  return request<Course[]>(
    "/api/v1/courses",
    { method: "GET" },
    "강좌 목록을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

/* 강좌 상세 조회 — GET /api/v1/courses/{courseId} */
export const getCourse = async (
  courseId: number | string,
): Promise<CourseDetail> => {
  return request<CourseDetail>(
    `/api/v1/courses/${courseId}`,
    { method: "GET" },
    "강좌 정보를 불러오지 못했습니다.",
  );
};

/* 강좌 카테고리 목록 조회 — GET /api/v1/course-categories */
export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  return request<CourseCategory[]>(
    "/api/v1/course-categories",
    { method: "GET" },
    "카테고리를 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

/* 썸네일 업로드 — POST /api/v1/courses/thumbnails → 저장된 thumbnailUrl 반환 */
export const uploadCourseThumbnail = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("thumbnail", file);
  const data = await request<{ thumbnailUrl: string }>(
    "/api/v1/courses/thumbnails",
    { method: "POST", body: formData },
    "썸네일 업로드에 실패했습니다.",
  );
  return data?.thumbnailUrl ?? "";
};

/* 강좌 생성 — POST /api/v1/courses → courseId 반환 */
export const createCourse = async (body: CourseUpsertBody): Promise<number> => {
  const data = await request<{ courseId: number }>(
    "/api/v1/courses",
    { method: "POST", body: JSON.stringify(body) },
    "강좌 등록에 실패했습니다.",
  );
  return data?.courseId;
};

/* 강좌 기본 정보 수정 — PUT /api/v1/courses/{courseId} */
export const updateCourse = async (
  courseId: number | string,
  body: CourseUpsertBody,
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}`,
    { method: "PUT", body: JSON.stringify(body) },
    "강좌 수정에 실패했습니다.",
  );
};

/**
 * 강좌 상태 변경 (OPERATOR 전용).
 * - ACTIVE: 공개 전용 엔드포인트(publishCourse) 사용
 * - DRAFT/DELETED: 일반 PUT으로 status만 변경
 */
export const updateCourseStatus = async (
  courseId: number | string,
  status: "ACTIVE" | "DRAFT" | "DELETED",
): Promise<void> => {
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  if (userRole !== "OPERATOR") {
    throw new Error(
      "권한이 없습니다. 오퍼레이터 계정만 상태 변경이 가능합니다.",
    );
  }

  if (status === "ACTIVE") {
    await publishCourse(courseId);
    return;
  }

  await request(
    `/api/v1/courses/${courseId}`,
    { method: "PUT", body: JSON.stringify({ status }) },
    "상태 변경 도중 에러가 발생했습니다.",
  );
};

/* 강좌 공개 — PATCH /api/v1/courses/{courseId}/publish */
export const publishCourse = async (
  courseId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}/publish`,
    { method: "PATCH" },
    "강좌 공개에 실패했습니다.",
  );
};

/* 강좌 삭제 — DELETE /api/v1/courses/{courseId} */
export const deleteCourse = async (
  courseId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}`,
    { method: "DELETE" },
    "강좌 삭제에 실패했습니다.",
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// 강의 (Lecture)
// ════════════════════════════════════════════════════════════════════════════════

/* 강좌의 강의 목록 조회 — GET /api/v1/courses/{courseId}/lectures (순서 정렬) */
export const getCourseLectures = async (
  courseId: number | string,
): Promise<LectureSummary[]> => {
  const data = await request<LectureSummary[]>(
    `/api/v1/courses/${courseId}/lectures`,
    { method: "GET" },
    "강의 목록을 불러오지 못했습니다.",
  );
  return (data ?? []).sort((a, b) => a.lectureOrder - b.lectureOrder);
};

/* 강의 상세 조회 — GET /api/v1/lectures/{lectureId} */
export const getLecture = async (
  lectureId: number | string,
): Promise<LectureSummary> => {
  return request<LectureSummary>(
    `/api/v1/lectures/${lectureId}`,
    { method: "GET" },
    "강의 정보를 불러오지 못했습니다.",
  );
};

/* 강의 생성 — POST /api/v1/courses/{courseId}/lectures → lectureId 반환 */
export const createLecture = async (
  courseId: number | string,
  body: LectureUpsertBody,
): Promise<number> => {
  const data = await request<{ lectureId: number }>(
    `/api/v1/courses/${courseId}/lectures`,
    { method: "POST", body: JSON.stringify(body) },
    "강의 등록에 실패했습니다.",
  );
  return data?.lectureId;
};

/* 강의 수정 — PUT /api/v1/lectures/{lectureId} */
export const updateLecture = async (
  lectureId: number | string,
  body: LectureUpsertBody,
): Promise<void> => {
  await request(
    `/api/v1/lectures/${lectureId}`,
    { method: "PUT", body: JSON.stringify(body) },
    "강의 수정에 실패했습니다.",
  );
};

/* 강의 삭제 — DELETE /api/v1/lectures/{lectureId} */
export const deleteLecture = async (
  lectureId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/lectures/${lectureId}`,
    { method: "DELETE" },
    "강의 삭제에 실패했습니다.",
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// 문제세트 연결 (Course ↔ ProblemSet)
// ════════════════════════════════════════════════════════════════════════════════

/* 강좌-문제세트 연결 설정 — PUT /api/v1/courses/{courseId}/problem-sets */
export const configureCourseProblemSets = async (
  courseId: number | string,
  problemSets: ProblemSetConnection[],
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}/problem-sets`,
    { method: "PUT", body: JSON.stringify({ problemSets }) },
    "문제 연결에 실패했습니다.",
  );
};

/* 강좌에 연결된 문제세트 목록 조회 — GET /api/v1/courses/{courseId}/problem-sets (수정 시 기존 연결 복원용) */
export const getCourseProblemSets = async (
  courseId: number | string,
): Promise<CourseProblemSetLink[]> => {
  return request<CourseProblemSetLink[]>(
    `/api/v1/courses/${courseId}/problem-sets`,
    { method: "GET" },
    "강좌 문제 연결 정보를 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

// ════════════════════════════════════════════════════════════════════════════════
// 수강 신청 (Enrollment) — 로그인 사용자(JWT) 기준
// ════════════════════════════════════════════════════════════════════════════════

/* 수강 신청 — POST /api/v1/courses/{courseId}/enrollments */
export const enrollCourse = async (
  courseId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}/enrollments`,
    { method: "POST" },
    "수강 신청에 실패했습니다.",
  );
};

/* 내 수강 강좌 목록 조회 — GET /api/v1/users/me/enrollments */
export const getMyEnrollments = async (): Promise<Enrollment[]> => {
  return request<Enrollment[]>(
    `/api/v1/users/me/enrollments`,
    { method: "GET" },
    "수강 목록을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

/* 수강 신청 취소 — DELETE /api/v1/users/me/enrollments/{enrollmentId} */
export const cancelEnrollment = async (
  enrollmentId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/users/me/enrollments/${enrollmentId}`,
    { method: "DELETE" },
    "수강 취소에 실패했습니다.",
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// 학습 현황 (Learning Progress)
// ════════════════════════════════════════════════════════════════════════════════

/* 수강생 학습 현황 목록 조회 — GET /api/v1/courses/{courseId}/users/learning-progress */
export const getCourseLearningProgress = async (
  courseId: number | string,
): Promise<LearningProgressItem[]> => {
  return request<LearningProgressItem[]>(
    `/api/v1/courses/${courseId}/users/learning-progress`,
    { method: "GET" },
    "학습 현황을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};
