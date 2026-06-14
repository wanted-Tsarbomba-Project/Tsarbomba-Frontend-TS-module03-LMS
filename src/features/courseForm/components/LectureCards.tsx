"use client";

import { useEffect, useRef } from "react";

import type { ProblemSetSummary, VideoLecture, ProblemLecture } from "../types";

// ── 드래그 핸들 아이콘 ──────────────────────────────────────────────────────────
export function DragHandle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-gray-400 shrink-0"
    >
      <circle cx="5" cy="4" r="1.2" fill="currentColor" />
      <circle cx="11" cy="4" r="1.2" fill="currentColor" />
      <circle cx="5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="11" cy="8" r="1.2" fill="currentColor" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

// ── 삭제(X) 버튼 ────────────────────────────────────────────────────────────────
export function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
      aria-label="삭제"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M12 4L4 12M4 4l8 8" />
      </svg>
    </button>
  );
}

// ── 영상 강의 카드 ──────────────────────────────────────────────────────────────

interface VideoLectureCardProps {
  label: string;
  item: VideoLecture;
  onUpdate: (id: string, field: keyof VideoLecture, value: unknown) => void;
  onRemove: () => void;
}

export function VideoLectureCard({
  label,
  item,
  onUpdate,
  onRemove,
}: VideoLectureCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <DragHandle />
        <span className="text-base font-semibold text-gray-800 flex-1">
          {label}
        </span>
        {item.lectureId && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            기존
          </span>
        )}
        <RemoveButton onClick={onRemove} />
      </div>

      {/* 입력 필드 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            영상 제목 *
          </label>
          <input
            value={item.title}
            onChange={(e) => onUpdate(item.id, "title", e.target.value)}
            placeholder="영상 제목을 적어주세요."
            className="w-full h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-900 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            영상 상세 설명 *
          </label>
          <textarea
            value={item.description}
            onChange={(e) => onUpdate(item.id, "description", e.target.value)}
            placeholder="영상 상세 설명을 적어주세요."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-900 resize-none transition-colors"
          />
        </div>

        {/* 파일 첨부 */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-900 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.5 1v8M4 3.5L6.5 1 9 3.5" />
              <path d="M2 10v1a1 1 0 001 1h7a1 1 0 001-1v-1" />
            </svg>
            {item.file ? (
              <span className="max-w-48 truncate text-blue-900">
                {item.file.name}
              </span>
            ) : (
              "파일 첨부"
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) =>
              onUpdate(item.id, "file", e.target.files?.[0] ?? null)
            }
          />
        </div>
      </div>
    </div>
  );
}

// ── 문제 강의 카드 ──────────────────────────────────────────────────────────────

interface ProblemLectureCardProps {
  label: string;
  item: ProblemLecture;
  availableProblemSets: ProblemSetSummary[];
  allProblemSets: ProblemSetSummary[];
  onToggleDropdown: () => void;
  onSelectProblem: (id: number) => void;
  onRemove: () => void;
}

export function ProblemLectureCard({
  label,
  item,
  availableProblemSets,
  allProblemSets,
  onToggleDropdown,
  onSelectProblem,
  onRemove,
}: ProblemLectureCardProps) {
  const assigned = allProblemSets.find(
    (ps) => ps.problemSetId === item.problemSetId,
  );
  // problemSets 미로딩 시에도 기존 연결 제목 표시
  const displayTitle =
    assigned?.title ?? (item.problemSetId != null ? item.problemTitle : "");
  const dropRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!item.dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        onToggleDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [item.dropdownOpen, onToggleDropdown]);

  return (
    <div className="p-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <DragHandle />
        <span className="text-base font-semibold text-gray-800 flex-1">
          {label}
        </span>
        {item.lectureId && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            기존
          </span>
        )}
        <RemoveButton onClick={onRemove} />
      </div>

      {/* 문제 선택 */}
      <div className="relative" ref={dropRef}>
        <div className="flex items-center gap-3">
          {displayTitle ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 7l4 4 6-6" />
              </svg>
              <span className="text-sm text-blue-900 font-medium truncate">
                {displayTitle}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 flex-1">문제 선택하기</span>
          )}

          <button
            type="button"
            onClick={onToggleDropdown}
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white transition-colors whitespace-nowrap"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.dropdownOpen ? "M2 8l4-4 4 4" : "M2 4l4 4 4-4"} />
            </svg>
            {displayTitle ? "변경" : "선택"}
          </button>
        </div>

        {/* 드롭다운 */}
        {item.dropdownOpen && (
          <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-30 w-full max-h-48 overflow-y-auto">
            {availableProblemSets.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-400 text-center">
                우측 패널에서 문제를 먼저 선택해주세요.
              </div>
            ) : (
              availableProblemSets.map((ps) => (
                <button
                  key={ps.problemSetId}
                  type="button"
                  onClick={() => onSelectProblem(ps.problemSetId)}
                  className={[
                    "block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors",
                    item.problemSetId === ps.problemSetId
                      ? "text-blue-900 font-semibold bg-gray-100"
                      : "text-gray-800",
                  ].join(" ")}
                >
                  {ps.title}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
