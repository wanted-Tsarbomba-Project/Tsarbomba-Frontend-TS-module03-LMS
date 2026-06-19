"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getLecture,
  getCourseLectures,
  getCourseProblemSets,
  resolveThumbnailUrl,
  type LectureSummary,
  type CourseProblemSetLink,
} from "@/services/courseService";
import TwoButtonModal from "@/components/common/TwoButtonModal";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import ErrorPageView from "@/components/common/ErrorPageView";

// ────────────────────────────────────────────────────────────────────────────────
// 강의 상세 (영상 시청) 화면
// ────────────────────────────────────────────────────────────────────────────────
const getYoutubeEmbedUrl = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id = "";
    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v") ?? "";
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
};

export default function LectureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lectureId = params.lectureId as string;

  const [lecture, setLecture] = useState<LectureSummary | null>(null);
  const [lectures, setLectures] = useState<LectureSummary[]>([]);
  const [problemLinks, setProblemLinks] = useState<CourseProblemSetLink[]>([]);
  const [loading, setLoading] = useState(true);

  const [panelOpen, setPanelOpen] = useState(true);
  const [problemNavTarget, setProblemNavTarget] =
    useState<CourseProblemSetLink | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!courseId || !lectureId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [lectureData, lectureList, links] = await Promise.all([
          getLecture(lectureId),
          getCourseLectures(courseId),
          getCourseProblemSets(courseId).catch(() => []),
        ]);
        setLecture(lectureData);
        setLectures(lectureList);
        setProblemLinks(links);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId, lectureId]);

  const currentIndex = lectures.findIndex(
    (l) => String(l.lectureId) === String(lectureId),
  );
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture =
    currentIndex >= 0 && currentIndex < lectures.length - 1
      ? lectures[currentIndex + 1]
      : null;

  const linkByLecture = new Map<number, CourseProblemSetLink>();
  problemLinks.forEach((link) => linkByLecture.set(link.lectureId, link));

  const goToLecture = (id: number) => {
    router.push(`/courses/${courseId}/lectures/${id}`);
  };

  const goToProblem = (link: CourseProblemSetLink) => {
    const lpsId = link.lectureProblemSetId ?? link.courseProblemSetId;
    router.push(`/courses/${courseId}/problems/${lpsId}`);
  };

  // 목록 클릭: 문제면 이동 확인 모달, 영상이면 바로 해당 강의로 이동
  const handleListItemClick = (item: LectureSummary) => {
    const link = linkByLecture.get(item.lectureId);
    if (link) {
      setProblemNavTarget(link); // 문제 → "이동하시겠습니까?" 모달
    } else {
      goToLecture(item.lectureId); // 영상 → 바로 이동
    }
  };

  // 현재 보고 있는 강의가 문제 강의인지
  const currentLink = linkByLecture.get(Number(lectureId));

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingIndicator message="강의를 불러오는 중입니다." />;
  }

  if (!lecture) {
    return <ErrorPageView status={404} message="강의를 찾을 수 없습니다." />;
  }

  const embedUrl = getYoutubeEmbedUrl(lecture.videoUrl);
  const videoSrc = resolveThumbnailUrl(lecture.videoUrl);

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex gap-4 items-start">
        {/* ── 메인 영역 (제목 + 영상 + 이전/다음) ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-800 mb-3">
            {lecture.lectureOrder}주차: {lecture.title}
          </h1>

          {/* 문제 강의면 안내 화면, 영상 강의면 영상 */}
          {currentLink ? (
            <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-5 px-6 text-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect
                  x="12"
                  y="8"
                  width="40"
                  height="48"
                  rx="4"
                  stroke="#1E3A8A"
                  strokeWidth="2"
                  fill="white"
                />
                <path
                  d="M22 22h20M22 32h20M22 42h12"
                  stroke="#1E3A8A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  문제 강의입니다
                </p>
                <p className="text-sm text-gray-500">
                  아래 버튼을 눌러 문제를 풀어보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProblemNavTarget(currentLink)}
                className="px-6 py-2.5 text-base font-medium bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors"
              >
                문제 풀러 가기
              </button>
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={lecture.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : videoSrc ? (
                <video src={videoSrc} controls className="w-full h-full" />
              ) : (
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <circle
                    cx="36"
                    cy="36"
                    r="34"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                  />
                  <path d="M30 26l16 10-16 10V26z" fill="#9CA3AF" />
                </svg>
              )}
            </div>
          )}

          {!currentLink && (
            <div className="mt-4 flex items-start justify-between gap-4">
              <p className="flex-1 text-sm text-gray-500 leading-relaxed">
                {lecture.description}
              </p>
              <button
                type="button"
                disabled
                title="준비 중인 기능입니다"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 2v8m0 0l3-3m-3 3L5 7M3 12h10" />
                </svg>
                첨부 파일
              </button>
            </div>
          )}

          {/* 이전 / 다음 */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              disabled={!prevLecture}
              onClick={() => prevLecture && goToLecture(prevLecture.lectureId)}
              className="flex items-center gap-1 text-base font-medium text-gray-800 hover:text-blue-900 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4l-5 5 5 5" />
              </svg>
              이전
            </button>

            <button
              type="button"
              disabled={!nextLecture}
              onClick={() => nextLecture && goToLecture(nextLecture.lectureId)}
              className="flex items-center gap-1 text-base font-medium text-gray-800 hover:text-blue-900 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              다음
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 4l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── 우측 강의목록 슬라이드 패널 ──────────────────────────────────── */}
        <div className="shrink-0 flex items-start">
          {!panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M10 4L6 8l4 4" />
              </svg>
              강의 목록
            </button>
          )}

          <div
            className={[
              "overflow-hidden transition-all duration-300",
              panelOpen ? "w-72 opacity-100" : "w-0 opacity-0",
            ].join(" ")}
          >
            <div className="w-72 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <span className="text-base font-semibold text-gray-800">
                  강의 목록
                </span>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="목록 접기"
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 4l5 5-5 5" />
                  </svg>
                </button>
              </div>

              <ul className="max-h-96 overflow-y-auto py-1">
                {lectures.map((item) => {
                  const isCurrent =
                    String(item.lectureId) === String(lectureId);
                  const isProblem = linkByLecture.has(item.lectureId);
                  return (
                    <li key={item.lectureId}>
                      <button
                        type="button"
                        onClick={() => handleListItemClick(item)}
                        className={[
                          "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2",
                          isCurrent
                            ? "bg-blue-900 text-white"
                            : "text-gray-800 hover:bg-gray-100",
                        ].join(" ")}
                      >
                        <span className="truncate flex-1">
                          {item.lectureOrder}. {item.title}
                        </span>
                        {isProblem && (
                          <span
                            className={[
                              "text-xs px-1.5 py-0.5 rounded shrink-0",
                              isCurrent
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-500",
                            ].join(" ")}
                          >
                            문제
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 문제 이동 확인 모달 */}
      <TwoButtonModal
        isOpen={!!problemNavTarget}
        onClose={() => setProblemNavTarget(null)}
        onConfirm={() => {
          if (problemNavTarget) goToProblem(problemNavTarget);
          setProblemNavTarget(null);
        }}
        modalTitle="문제 풀이로 이동"
        modalContent="문제 풀이 화면으로 이동하시겠습니까?"
      />
    </div>
  );
}
