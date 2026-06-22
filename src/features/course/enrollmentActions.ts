import { request } from "./http";
import type { Enrollment } from "./types";

export const enrollCourse = async (
  courseId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}/enrollments`,
    { method: "POST" },
    "수강 신청에 실패했습니다.",
  );
};

export const getMyEnrollments = async (): Promise<Enrollment[]> => {
  return request<Enrollment[]>(
    `/api/v1/users/me/enrollments`,
    { method: "GET" },
    "수강 목록을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

export const cancelEnrollment = async (
  enrollmentId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/users/me/enrollments/${enrollmentId}`,
    { method: "DELETE" },
    "수강 취소에 실패했습니다.",
  );
};
