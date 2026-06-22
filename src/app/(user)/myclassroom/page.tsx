import { redirect } from "next/navigation";
import {
  getMyEnrollmentsServer,
  UnauthorizedError,
} from "@/features/course/server";
import MyClassroomClient from "@/features/course/components/MyClassroomClient";
import ErrorPageView from "@/components/common/ErrorPageView";

export default async function MyClassroomPage() {
  try {
    const enrollments = await getMyEnrollmentsServer();
    return <MyClassroomClient initialEnrollments={enrollments} />;
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/auth/login");
    return (
      <ErrorPageView
        status={500}
        message="수강 목록을 불러오지 못했습니다."
      />
    );
  }
}
