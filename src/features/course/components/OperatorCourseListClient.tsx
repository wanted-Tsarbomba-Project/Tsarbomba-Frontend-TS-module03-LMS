"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Searchbar from "@/components/common/Searchbar";
import List, { type ListColumn } from "@/components/common/List";
import OneButtonModal from "@/components/common/OneButtonModal";
import TwoButtonModal from "@/components/common/TwoButtonModal";
import { updateCourseStatus } from "@/features/course/actions";
import { filterCourses } from "@/features/course/search";
import type { Course, CourseStatusFilter } from "@/features/course/types";

interface OperatorCourseListClientProps {
  initialCourses: Course[];
}

type CourseStatus = "ACTIVE" | "DRAFT" | "DELETED";

export default function OperatorCourseListClient({
  initialCourses,
}: OperatorCourseListClientProps) {
  const router = useRouter();

  const [sortFilter, setSortFilter] = useState<CourseStatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CourseStatus | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredCourses = useMemo(
    () =>
      filterCourses(initialCourses, {
        keyword,
        statusFilter: sortFilter,
      }),
    [initialCourses, keyword, sortFilter],
  );

  const handleStatusButtonClick = (
    event: React.MouseEvent,
    id: number,
    status: CourseStatus,
  ) => {
    event.stopPropagation();
    setSelectedCourseId(id);
    setCurrentStatus(status);
    setConfirmModalOpen(true);
  };

  const handleConfirmChange = async () => {
    setConfirmModalOpen(false);

    if (selectedCourseId === null || currentStatus === null) {
      return;
    }

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
          className={`inline-block cursor-pointer rounded-md border px-3 py-1 text-xs font-semibold transition ${
            course.status === "ACTIVE"
              ? "border-blue-900 bg-white text-blue-900 hover:bg-blue-900 hover:text-white"
              : "border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white"
          }`}
          onClick={(event) =>
            handleStatusButtonClick(event, course.courseId, course.status)
          }
          type="button"
        >
          {course.status === "ACTIVE" ? "공개" : "비공개"}
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">강의 관리</h1>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Searchbar
            className="max-w-[260px]"
            onChange={setSearchInput}
            onSearch={setKeyword}
            value={searchInput}
          />

          <button
            className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-950"
            onClick={() => router.push("/admin/courses/new")}
            type="button"
          >
            등록하기
          </button>

          <select
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
            onChange={(event) =>
              setSortFilter(event.target.value as CourseStatusFilter)
            }
            value={sortFilter}
          >
            <option value="all">전체 정렬</option>
            <option value="open">공개</option>
            <option value="hidden">비공개</option>
          </select>
        </div>
      </div>

      <List
        columns={courseColumns}
        data={filteredCourses}
        emptyMessage="조건에 맞는 강의가 없습니다."
        onRowClick={(course) =>
          router.push(`/admin/courses/${course.courseId}`)
        }
        rowKey={(course, index) => course.courseId ?? index}
      />

      <TwoButtonModal
        isOpen={confirmModalOpen}
        modalContent="해당 강좌의 공개/비공개 상태를 변경하시겠습니까?"
        modalTitle="상태 변경 확인"
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmChange}
      />

      <OneButtonModal
        isOpen={successModalOpen}
        modalContent="상태가 성공적으로 변경되었습니다."
        modalTitle="변경 완료"
        onClose={() => setSuccessModalOpen(false)}
      />

      <OneButtonModal
        isOpen={errorModalOpen}
        modalContent={errorMessage}
        modalTitle="변경 실패"
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
}
