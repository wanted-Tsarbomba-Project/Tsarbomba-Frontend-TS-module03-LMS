"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Course } from "@/features/course/types";
import CourseItem from "@/features/admin/operations/components/CourseItem";

interface CourseListClientProps {
  initialCourses: Course[];
}

function CourseListContent({ initialCourses }: CourseListClientProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "전체";

  const filteredCourses =
    category === "전체"
      ? initialCourses
      : initialCourses.filter(
          (course) => course.courseCategoryName === category,
        );

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

export default function CourseListClient({
  initialCourses,
}: CourseListClientProps) {
  return (
    <Suspense fallback={null}>
      <CourseListContent initialCourses={initialCourses} />
    </Suspense>
  );
}
