import { request } from "./http";
import type { LectureSummary, LectureUpsertBody } from "./types";

// 강의는 lectureOrder 순으로 정렬해서 내려준다.
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

export const getLecture = async (
  lectureId: number | string,
): Promise<LectureSummary> => {
  return request<LectureSummary>(
    `/api/v1/lectures/${lectureId}`,
    { method: "GET" },
    "강의 정보를 불러오지 못했습니다.",
  );
};

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

export const deleteLecture = async (
  lectureId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/lectures/${lectureId}`,
    { method: "DELETE" },
    "강의 삭제에 실패했습니다.",
  );
};
