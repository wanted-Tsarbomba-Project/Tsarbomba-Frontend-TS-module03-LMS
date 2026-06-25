import { request } from "./http";
import type { CourseProblemSetLink, ProblemSetConnection } from "./types";

export const configureCourseProblemSets = async (
  courseId: number | string,
  problemSets: ProblemSetConnection[],
): Promise<void> => {
  await request(
    `/api/v1/courses/${courseId}/lecture-problem-sets`,
    { method: "PUT", body: JSON.stringify({ problemSets }) },
    "문제 연결에 실패했습니다.",
  );
};

export const getCourseProblemSets = async (
  courseId: number | string,
): Promise<CourseProblemSetLink[]> => {
  return request<CourseProblemSetLink[]>(
    `/api/v1/courses/${courseId}/lecture-problem-sets`,
    { method: "GET" },
    "강좌 문제 연결 정보를 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};
