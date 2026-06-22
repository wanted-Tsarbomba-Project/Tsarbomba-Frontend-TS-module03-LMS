import { cookies } from "next/headers";

import { getLectureProblemSet } from "@/features/course/problems/actions";
import CourseProblemDetailClient from "@/features/course/problems/components/CourseProblemDetailClient";
import ErrorPageView from "@/components/common/ErrorPageView";
import { ApiClientError } from "@/lib/errorHandling";

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

  try {
    const problemSet = await getLectureProblemSet(lectureProblemSetId, {
      cache: "no-store",
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });

    return (
      <CourseProblemDetailClient
        courseId={courseId}
        lectureProblemSetId={lectureProblemSetId}
        initialProblemSet={problemSet}
      />
    );
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
}
