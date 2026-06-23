import { redirect } from "next/navigation";
import {
  getUserCoursesServer,
  UnauthorizedError,
} from "@/features/course/server";
import OperatorCourseListClient from "@/features/course/components/OperatorCourseListClient";

export default async function AdminLectureManagementPage() {
  let courses;

  try {
    courses = await getUserCoursesServer();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/auth/login");
    throw error;
  }

  return <OperatorCourseListClient initialCourses={courses} />;
}
