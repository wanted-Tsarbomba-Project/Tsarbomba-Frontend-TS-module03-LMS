import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getLectureProblemSet } from "@/features/course/problems/actions";
import { getMyEnrollmentsServer } from "@/features/course/server";
import CourseProblemDetailClient from "@/features/course/problems/components/CourseProblemDetailClient";
import ErrorPageView from "@/components/common/ErrorPageView";
import { ApiClientError } from "@/lib/errorHandling";
import type { ProblemSetDetail } from "@/features/problems/types";

interface CourseProblemPageProps {
  params: Promise<{
    courseId: string;
    lectureProblemSetId: string;
  }>;
}

export default async function CourseProblemPage({
  params,
}: CourseProblemPageProps) {
  const { courseId, lectureProblemSetId } = await params;
  const cookieHeader = (await cookies()).toString();

  // 401 등으로 빈 배열이 떨어진 경우는 가드를 건너뛰고 아래 problemSet 조회가 401/에러 처리하도록
  const enrollments = await getMyEnrollmentsServer().catch(() => []);
  const enrolled = enrollments.some(
    (e) => String(e.courseId) === String(courseId),
  );
  if (enrollments.length > 0 && !enrolled) {
    redirect(`/courses/${courseId}`);
  }

  let problemSet: ProblemSetDetail;
  try {
    problemSet = await getLectureProblemSet(lectureProblemSetId, {
      cache: "no-store",
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : undefined;
    const message =
      error instanceof Error
        ? error.message
        : "문제 정보를 불러오지 못했습니다.";
    return (
      <ErrorPageView
        status={status ?? 500}
        message={message}
        returnTo={`/courses/${courseId}`}
      />
    );
  }

  return (
    <CourseProblemDetailClient
      courseId={courseId}
      lectureProblemSetId={lectureProblemSetId}
      initialProblemSet={problemSet}
    />
  );
}
