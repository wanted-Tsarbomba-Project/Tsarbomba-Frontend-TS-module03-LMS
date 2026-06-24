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

  // null = 조회 실패(401 등), [] = 등록 0건. 실패만 건너뛰고 0건은 정상 차단
  const enrollments = await getMyEnrollmentsServer().catch(() => null);
  if (enrollments !== null) {
    const enrolled = enrollments.some(
      (e) => String(e.courseId) === String(courseId),
    );
    if (!enrolled) {
      redirect(`/courses/${courseId}`);
    }
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
