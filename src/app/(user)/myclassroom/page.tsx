"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getMyEnrollments,
  cancelEnrollment,
  resolveThumbnailUrl,
  type Enrollment,
} from "@/services/courseService";
import TwoButtonModal from "@/components/common/TwoButtonModal";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import ErrorPageView from "@/components/common/ErrorPageView";

// 완료(끝까지 수강) 여부 판단
const isCompleted = (status?: string | null) =>
  (status ?? "").toUpperCase() === "COMPLETED";

export default function MyClassroomPage() {
  const router = useRouter();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [cancelTarget, setCancelTarget] = useState<Enrollment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const arr = await getMyEnrollments();
      setEnrollments(arr);
      setErrorMsg("");
    } catch {
      setErrorMsg("수강 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const inProgress = enrollments.filter((e) => !isCompleted(e.status));
  const completed = enrollments.filter((e) => isCompleted(e.status));

  const goToCourse = (courseId?: number) => {
    if (courseId) router.push(`/courses/${courseId}`);
  };

  // 수강취소 확정 → DELETE /api/v1/users/me/enrollments/{enrollmentId}
  const handleCancelConfirm = async () => {
    if (cancelTarget?.enrollmentId == null) return;
    setIsCancelling(true);
    try {
      await cancelEnrollment(cancelTarget.enrollmentId);
      setCancelTarget(null);
      await loadEnrollments();
    } catch {
      setErrorMsg("수강 취소에 실패했습니다.");
      setCancelTarget(null);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="수강 목록을 불러오는 중입니다." />;
  }

  if (errorMsg) {
    return (
      <ErrorPageView
        status={401}
        message={errorMsg}
        onRetry={loadEnrollments}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-6">
      <Section
        title="진행 중인 강의"
        count={inProgress.length}
        emptyText="진행 중인 강의가 없습니다."
        items={inProgress}
        onClick={goToCourse}
        onCancel={setCancelTarget}
      />

      <Section
        title="완료한 강의"
        count={completed.length}
        emptyText="완료한 강의가 없습니다."
        items={completed}
        onClick={goToCourse}
        onCancel={setCancelTarget}
      />

      <TwoButtonModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        confirmDisabled={isCancelling}
        modalTitle="수강 취소"
        modalContent={`'${cancelTarget?.courseTitle ?? "이 강좌"}' 수강을 취소하시겠습니까?`}
      />
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  count: number;
  emptyText: string;
  items: Enrollment[];
  onClick: (courseId?: number) => void;
  onCancel: (enrollment: Enrollment) => void;
}

function Section({
  title,
  count,
  emptyText,
  items,
  onClick,
  onCancel,
}: SectionProps) {
  return (
    <section className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <span className="text-sm font-medium text-blue-900 bg-gray-100 px-2 py-0.5 rounded-full">
          {count}개
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((e) => (
            <CourseCard
              key={e.enrollmentId ?? e.courseId}
              enrollment={e}
              onClick={() => onClick(e.courseId)}
              onCancel={() => onCancel(e)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── CourseCard ────────────────────────────────────────────────────────────────

function CourseCard({
  enrollment,
  onClick,
  onCancel,
}: {
  enrollment: Enrollment;
  onClick: () => void;
  onCancel: () => void;
}) {
  const thumb = resolveThumbnailUrl(enrollment.courseThumbnailUrl);

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="w-full h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={enrollment.courseTitle ?? "강좌"}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M6 10c4-2 8-2 14 0 6-2 10-2 14 0v20c-4-2-8-2-14 0-6-2-10-2-14 0V10z"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
            />
            <path d="M20 10v20" stroke="#9CA3AF" strokeWidth="2" />
          </svg>
        )}
      </div>

      <div className="p-4">
        {enrollment.courseCategoryName && (
          <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-2">
            {enrollment.courseCategoryName}
          </span>
        )}
        <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
          {enrollment.courseTitle ?? "제목 없음"}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-9">
          {enrollment.courseDescription ?? ""}
        </p>
        {enrollment.instructorName && (
          <p className="text-xs text-gray-500 mt-3">
            {enrollment.instructorName} 강사
          </p>
        )}

        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            onCancel();
          }}
          className="mt-3 w-full py-2 text-sm font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
        >
          수강 취소
        </button>
      </div>
    </div>
  );
}
