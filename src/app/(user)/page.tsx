"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getUserCourses, Course } from "../../services/courseService";
import CourseItem from "@/features/admin/operations/components/CourseItem";

function StudentCourseListContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "전체";

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

  const filteredCourses =
    category === "전체"
      ? courses
      : courses.filter((course) => course.courseCategoryName === category);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {filteredCourses.length === 0 ? (
        <div className="py-24 text-center text-[14px] text-[#C8C8C8]">
          {category === "전체"
            ? "등록된 강좌가 없습니다."
            : `'${category}' 카테고리에 강좌가 없습니다.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {filteredCourses.map((course) => (
            <CourseItem key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentCourseListPage() {
  return (
    <Suspense fallback={null}>
      <StudentCourseListContent />
    </Suspense>
  );
}
