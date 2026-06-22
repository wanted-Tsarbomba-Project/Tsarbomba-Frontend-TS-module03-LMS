import { redirect } from "next/navigation";
import {
  getUserCoursesServer,
  UnauthorizedError,
} from "@/features/course/server";
import CourseListClient from "@/features/course/components/CourseListClient";

export default async function StudentCourseListPage() {
  try {
    const courses = await getUserCoursesServer();
    const activeCourses = courses.filter((c) => c.status === "ACTIVE");
    return <CourseListClient initialCourses={activeCourses} />;
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/auth/login");
    throw error;
  }
}
