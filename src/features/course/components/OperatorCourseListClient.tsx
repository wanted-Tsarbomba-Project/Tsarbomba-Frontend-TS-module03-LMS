"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TwoButtonModal from "@/components/common/TwoButtonModal";
import OneButtonModal from "@/components/common/OneButtonModal";
import List, { type ListColumn } from "@/components/common/List";
import { updateCourseStatus } from "@/features/course/actions";
import type { Course } from "@/features/course/types";

interface OperatorCourseListClientProps {
  initialCourses: Course[];
}

type SortFilter = "all" | "open" | "hidden";
type CourseStatus = "ACTIVE" | "DRAFT" | "DELETED";

export default function OperatorCourseListClient({
  initialCourses,
}: OperatorCourseListClientProps) {
  const router = useRouter();

  const [sortFilter, setSortFilter] = useState<SortFilter>("all");

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CourseStatus | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredCourses = initialCourses.filter((course) => {
    if (sortFilter === "open") return course.status === "ACTIVE";
    if (sortFilter === "hidden")
      return course.status === "DRAFT" || course.status === "DELETED";
    return true;
  });

  const handleStatusButtonClick = (
    e: React.MouseEvent,
    id: number,
    status: CourseStatus,
  ) => {
    e.stopPropagation();
    setSelectedCourseId(id);
    setCurrentStatus(status);
    setConfirmModalOpen(true);
  };

  const handleConfirmChange = async () => {
    setConfirmModalOpen(false);

    if (selectedCourseId === null || currentStatus === null) return;

    try {
      const nextStatus = currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";
      await updateCourseStatus(selectedCourseId, nextStatus);
      router.refresh();
      setSuccessModalOpen(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "상태 변경 도중 에러가 발생했습니다.",
      );
      setErrorModalOpen(true);
    }
  };

  const courseColumns: ListColumn<Course>[] = [
    { key: "index", label: "No." },
    {
      key: "title",
      label: "제목",
      render: (course) => course.title || "제목 없는 강좌",
    },
    {
      key: "status",
      label: "상태",
      render: (course) => (
        <button
          type="button"
          onClick={(e) =>
            handleStatusButtonClick(e, course.courseId, course.status)
          }
          className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
            course.status === "ACTIVE"
              ? "border-blue-900 text-blue-900 bg-white hover:bg-blue-900 hover:text-white"
              : "border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white"
          }`}
        >
          {course.status === "ACTIVE" ? "공개" : "비공개"}
        </button>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">강의 관리</h1>

        <div className="flex items-center gap-3">
          <button
            className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
            onClick={() => router.push("/admin/courses/new")}
          >
            등록하기
          </button>

          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value as SortFilter)}
            className="border border-gray-200 rounded-lg text-sm px-4 py-2 text-gray-800 bg-white shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="all">전체 정렬</option>
            <option value="open">공개</option>
            <option value="hidden">비공개</option>
          </select>
        </div>
      </div>

      <List
        data={filteredCourses}
        columns={courseColumns}
        rowKey={(course, index) => course.courseId ?? index}
        onRowClick={(course) =>
          router.push(`/admin/courses/${course.courseId}`)
        }
        emptyMessage="등록된 강의가 없습니다."
      />

      <TwoButtonModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmChange}
        modalTitle="상태 변경 확인"
        modalContent="해당 강좌의 공개/비공개 상태를 변경하시겠습니까?"
      />

      <OneButtonModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        modalTitle="변경 완료"
        modalContent="상태가 성공적으로 변경되었습니다."
      />

      <OneButtonModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        modalTitle="변경 실패"
        modalContent={errorMessage}
      />
    </div>
  );
}
