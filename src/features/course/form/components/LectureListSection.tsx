"use client";

import React, { useEffect, useRef, useState } from "react";
import type {
  LectureItem,
  ProblemLecture,
  ProblemSetSummary,
  VideoLecture,
} from "../types";
import { ProblemLectureCard, VideoLectureCard } from "./LectureCards";
import { useLectureDnd } from "../hooks/useLectureDnd";

interface LectureListSectionProps {
  lectures: LectureItem[];
  setLectures: (next: LectureItem[]) => void;
  problemSets: ProblemSetSummary[];
  onAddVideo: () => void;
  onAddProblem: () => void;
  onRemoveLecture: (id: string) => void;
  onUpdateVideoField: (
    id: string,
    field: keyof VideoLecture,
    value: unknown,
  ) => void;
  onToggleProblemDropdown: (id: string) => void;
  onAssignProblem: (lectureId: string, problemSetId: number) => void;
  getLabel: (index: number) => string;
  getAvailableForLecture: (lectureId: string) => ProblemSetSummary[];
}

export default function LectureListSection({
  lectures,
  setLectures,
  problemSets,
  onAddVideo,
  onAddProblem,
  onRemoveLecture,
  onUpdateVideoField,
  onToggleProblemDropdown,
  onAssignProblem,
  getLabel,
  getAvailableForLecture,
}: LectureListSectionProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dnd = useLectureDnd(lectures, setLectures);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="relative" ref={addMenuRef}>
          <button
            type="button"
            onClick={() => setShowAddMenu((prev) => !prev)}
            className="text-sm text-blue-900 font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
          >
            <span className="text-lg leading-none">+</span>
            추가
          </button>
          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden w-24">
              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  onAddVideo();
                }}
                className="block w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                영상
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  onAddProblem();
                }}
                className="block w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                문제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {lectures.length === 0 && (
          <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center text-sm text-gray-400">
            우측 상단 + 추가 버튼으로 강의를 추가해주세요
          </div>
        )}

        {lectures.map((lecture, index) => (
          <div
            key={lecture.id}
            draggable
            onDragStart={() => dnd.onDragStart(index)}
            onDragOver={(e) => dnd.onDragOver(e, index)}
            onDrop={(e) => dnd.onDrop(e, index)}
            onDragEnd={dnd.onDragEnd}
            className={[
              "border rounded-lg bg-white transition-all cursor-grab active:cursor-grabbing",
              dnd.dragOverIdx === index
                ? "border-blue-900 shadow-md"
                : "border-gray-200",
            ].join(" ")}
          >
            {lecture.type === "video" ? (
              <VideoLectureCard
                label={getLabel(index)}
                item={lecture as VideoLecture}
                onUpdate={onUpdateVideoField}
                onRemove={() => onRemoveLecture(lecture.id)}
              />
            ) : (
              <ProblemLectureCard
                label={getLabel(index)}
                item={lecture as ProblemLecture}
                availableProblemSets={getAvailableForLecture(lecture.id)}
                allProblemSets={problemSets}
                onToggleDropdown={() => onToggleProblemDropdown(lecture.id)}
                onSelectProblem={(psId) => onAssignProblem(lecture.id, psId)}
                onRemove={() => onRemoveLecture(lecture.id)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
