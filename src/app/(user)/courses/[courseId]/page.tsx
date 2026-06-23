import { redirect } from "next/navigation";
import {
  getCourseLecturesServer,
  getCourseServer,
  UnauthorizedError,
} from "@/features/course/server";
import CourseDetailClient from "@/features/course/components/CourseDetailClient";
import ErrorPageView from "@/components/common/ErrorPageView";
import type { CourseDetail, LectureSummary } from "@/features/course/types";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;

  let course: CourseDetail;
  let lectures: LectureSummary[];
  try {
    [course, lectures] = await Promise.all([
      getCourseServer(courseId),
      getCourseLecturesServer(courseId),
    ]);
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/auth/login");
    return <ErrorPageView status={404} message="강좌를 찾을 수 없습니다." />;
  }

  return (
    <CourseDetailClient
      courseId={courseId}
      course={course}
      lectures={lectures}
    />
  );
}
