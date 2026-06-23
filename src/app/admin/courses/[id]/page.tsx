import { redirect } from "next/navigation";
import {
  getCourseLecturesServer,
  getCourseServer,
  UnauthorizedError,
} from "@/features/course/server";
import OperatorCourseDetailClient from "@/features/course/components/OperatorCourseDetailClient";
import ErrorPageView from "@/components/common/ErrorPageView";
import type { CourseDetail, LectureSummary } from "@/features/course/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCourseDetailPage({ params }: PageProps) {
  const { id: courseId } = await params;

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
    <OperatorCourseDetailClient
      courseId={courseId}
      course={course}
      lectures={lectures}
    />
  );
}
