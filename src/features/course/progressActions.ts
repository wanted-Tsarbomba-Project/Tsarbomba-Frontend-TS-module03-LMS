import { request } from "./http";
import type { LearningProgressItem } from "./types";

export const getCourseLearningProgress = async (
  courseId: number | string,
): Promise<LearningProgressItem[]> => {
  return request<LearningProgressItem[]>(
    `/api/v1/courses/${courseId}/users/learning-progress`,
    { method: "GET" },
    "학습 현황을 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};
