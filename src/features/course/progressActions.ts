import { request } from "./http";
import type {
  StudentLearningProgressPage,
  StudentProblemEntry,
  StudentProblemItem,
} from "./types";

export const getCourseLearningProgress = async (
  courseId: number | string,
  page = 0,
): Promise<StudentLearningProgressPage> => {
  return request<StudentLearningProgressPage>(
    `/api/v1/courses/${courseId}/users/learning-progress?page=${page}`,
    { method: "GET" },
    "학습 현황을 불러오지 못했습니다.",
  );
};

/* 어드민: 특정 수강생의 문제 풀이 현황 조회 */
export const getStudentProblemSet = async (
  courseId: number | string,
  userId: number | string,
  lectureProblemSetId: number | string,
): Promise<StudentProblemEntry> => {
  const raw = await request<{
    title?: string;
    problems?: StudentProblemItem[];
    problem?: StudentProblemItem;
  }>(
    `/api/v1/admin/courses/${courseId}/students/${userId}/lecture-problem-sets/${lectureProblemSetId}`,
    { method: "GET" },
    "문제 풀이 현황을 불러오지 못했습니다.",
  );

  const problems = Array.isArray(raw?.problems)
    ? raw.problems
    : raw?.problem
      ? [raw.problem]
      : [];

  return { title: raw?.title, problems };
};
