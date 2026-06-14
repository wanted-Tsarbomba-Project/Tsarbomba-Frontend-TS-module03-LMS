"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getCourse,
  getCourseLectures,
  deleteCourse,
  getCourseLearningProgress,
  resolveThumbnailUrl,
  type CourseDetail,
  type LectureSummary,
  type LearningProgressItem,
} from "@/services/courseService";
import OneButtonModal from "@/components/common/OneButtonModal";
import TwoButtonModal from "@/components/common/TwoButtonModal";
import List, { type ListColumn } from "@/components/common/List";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import ErrorPageView from "@/components/common/ErrorPageView";

export default function AdminCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lectures, setLectures] = useState<LectureSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showProgress, setShowProgress] = useState(false);
  const [progressData, setProgressData] = useState<LearningProgressItem[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const [resultModal, setResultModal] = useState<{
    title: string;
    content: string;
    redirect?: string;
  } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseData, lectureData] = await Promise.all([
          getCourse(courseId),
          getCourseLectures(courseId),
        ]);
        setCourse(courseData);
        setLectures(lectureData);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLectureClick = (lectureId: number) => {
    router.push(`/courses/${courseId}/lectures/${lectureId}`);
  };

  const handleEditClick = () => {
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteCourse(courseId);
      setShowDeleteConfirm(false);
      setResultModal({
        title: "삭제 완료",
        content: "강좌가 삭제되었습니다.",
        redirect: "/admin/courses",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setShowDeleteConfirm(false);
      setResultModal({ title: "삭제 실패", content: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProgressClick = async () => {
    setShowProgress(true);
    if (progressData.length > 0) return;
    setProgressLoading(true);
    try {
      setProgressData(await getCourseLearningProgress(courseId));
    } catch {
      /* ignore */
    } finally {
      setProgressLoading(false);
    }
  };

  const handleResultClose = () => {
    const redirect = resultModal?.redirect;
    setResultModal(null);
    if (redirect) router.push(redirect);
  };

  const progressColumns: ListColumn<LearningProgressItem>[] = [
    { key: "userName", label: "이름" },
    { key: "email", label: "이메일" },
    {
      key: "completed",
      label: "완료 강의",
      render: (item) => `${item.completedLectures} / ${item.totalLectures}`,
    },
    {
      key: "progressRate",
      label: "진행률",
      render: (item) => `${item.progressRate ?? 0}%`,
    },
  ];

  const outlineBtn =
    "px-4 py-2 text-sm font-medium bg-white text-blue-900 border border-blue-900 rounded-lg hover:bg-blue-900 hover:text-white transition-colors whitespace-nowrap";

  if (loading) {
    return <LoadingIndicator message="강좌 정보를 불러오는 중입니다." />;
  }

  if (!course) {
    return <ErrorPageView status={404} message="강좌를 찾을 수 없습니다." />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* 강좌 상단 카드 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="w-full h-72 bg-gray-100 flex items-center justify-center overflow-hidden">
            {course.thumbnailUrl ? (
              <img
                src={resolveThumbnailUrl(course.thumbnailUrl)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="64" height="64" viewBox="0 0 56 56" fill="none">
                <rect
                  x="4"
                  y="10"
                  width="48"
                  height="36"
                  rx="4"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M4 38l13-14 10 10 8-8 17 18"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="18" cy="24" r="4" fill="#9CA3AF" />
              </svg>
            )}
          </div>

          <div className="p-6">
            {course.instructorName && (
              <p className="text-sm text-gray-500 mb-1">
                강사: {course.instructorName}
              </p>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-800 mb-2">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 mt-1">
                <button
                  type="button"
                  onClick={handleProgressClick}
                  className={outlineBtn}
                >
                  학습률 조회하기
                </button>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className={outlineBtn}
                >
                  수정하기
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-medium bg-white text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 커리큘럼 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">커리큘럼</h2>

          {lectures.length === 0 ? (
            <div className="border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-400">
              등록된 강의가 없습니다.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {lectures.map((lecture, index) => (
                <button
                  key={lecture.lectureId}
                  type="button"
                  onClick={() => handleLectureClick(lecture.lectureId)}
                  className={[
                    "w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-100 transition-colors",
                    index < lectures.length - 1 ? "border-b border-gray-200" : "",
                  ].join(" ")}
                >
                  <span className="text-base text-gray-800">
                    {lecture.lectureOrder}주차: {lecture.title}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 삭제 확인 모달 */}
      <TwoButtonModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        confirmDisabled={isDeleting}
        modalTitle="강좌 삭제"
        modalContent="삭제하면 복구할 수 없습니다. 삭제하시겠습니까?"
      />

      {/* 학습률 모달 */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-screen flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                수강생 학습 현황
              </h3>
              <button
                type="button"
                onClick={() => setShowProgress(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M15 5L5 15M5 5l10 10" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {progressLoading ? (
                <LoadingIndicator message="학습 현황을 불러오는 중입니다." />
              ) : (
                <List
                  data={progressData}
                  columns={progressColumns}
                  rowKey={(item) => item.userId}
                  emptyMessage="수강생 데이터가 없습니다."
                />
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowProgress(false)}
                className="px-5 py-2.5 text-sm text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과(알림) 모달 */}
      <OneButtonModal
        isOpen={!!resultModal}
        onClose={handleResultClose}
        modalTitle={resultModal?.title ?? ""}
        modalContent={resultModal?.content}
      />
    </div>
  );
}
