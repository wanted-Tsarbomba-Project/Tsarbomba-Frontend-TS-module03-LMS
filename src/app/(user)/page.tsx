"use client";

import { useState, useEffect } from "react";
import { getUserCourses, Course } from "../../services/courseService";
import CourseItem from "@/features/admin/operations/components/CourseItem";

function StudentCourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getUserCourses();
        const activeCourses = data.filter(
          (course) => course.status === "ACTIVE",
        );
        setCourses(activeCourses);
      } catch (error) {
        console.error("홈페이지 강좌 로드 실패:", error);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-7xl mx-auto">
      {courses.map((course) => (
        <CourseItem key={course.courseId} course={course} />
      ))}
    </div>
  );
}

export default StudentCourseListPage;
