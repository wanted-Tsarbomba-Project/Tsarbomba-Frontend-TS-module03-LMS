"use client";

import { useRouter } from "next/navigation";
import { Course, resolveThumbnailUrl } from "@/services/courseService";

interface CourseItemProps {
  course: Course;
}

function CourseItem({ course }: CourseItemProps) {
  const router = useRouter();

  const { courseId, title, courseCategoryName, thumbnailUrl, description } =
    course;

  return (
    <div
      className="border border-[#e8e8e8] rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => router.push(`/courses/${courseId}`)}
    >
      {/* 강좌 썸네일 */}
      <img
        src={
          resolveThumbnailUrl(thumbnailUrl) ||
          "https://placehold.co/640x360?text=No+Image"
        }
        alt={title || "강좌 이미지"}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        {/* 카테고리 태그 */}
        <span className="text-xs font-semibold text-[#1a237e] bg-[#e8e8e8] px-2 py-1 rounded">
          {courseCategoryName || "미지정"}
        </span>

        {/* 강좌 제목 */}
        <h3 className="text-lg font-bold text-[#1F2937] mt-2 line-clamp-1">
          {title}
        </h3>

        {/* 강좌 설명 */}
        <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">
          {description || "등록된 강좌 설명이 없습니다."}
        </p>
      </div>
    </div>
  );
}

export default CourseItem;
