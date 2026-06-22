import { request } from "./http";
import type {
  Course,
  CourseCategory,
  CourseDetail,
  CourseUpsertBody,
} from "./types";

export const getUserCourses = async (): Promise<Course[]> => {
  return request<Course[]>(
    "/api/v1/courses",
    { method: "GET" },
    "강좌 목록을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

export const getCourse = async (
  courseId: number | string,
): Promise<CourseDetail> => {
  return request<CourseDetail>(
    `/api/v1/courses/${courseId}`,
    { method: "GET" },
    "강좌 정보를 불러오지 못했습니다.",
  );
};

export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  return request<CourseCategory[]>(
    "/api/v1/course-categories",
    { method: "GET" },
    "카테고리를 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

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

export const createCourse = async (body: CourseUpsertBody): Promise<number> => {
  const data = await request<{ courseId: number }>(
    "/api/v1/courses",
    { method: "POST", body: JSON.stringify(body) },
    "강좌 등록에 실패했습니다.",
  );
  return data?.courseId;
};

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

// ACTIVE 전환은 별도 publish 엔드포인트가 필요하므로 분기 (백엔드 정책).
export const updateCourseStatus = async (
  courseId: number | string,
  status: "ACTIVE" | "DRAFT" | "DELETED",
): Promise<void> => {
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

export const publishCourse = async (
  courseId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}/publish`,
    { method: "PATCH" },
    "강좌 공개에 실패했습니다.",
  );
};

export const deleteCourse = async (
  courseId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}`,
    { method: "DELETE" },
    "강좌 삭제에 실패했습니다.",
  );
};
