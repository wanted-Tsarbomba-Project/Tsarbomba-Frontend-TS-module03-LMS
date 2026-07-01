"use client";

import React from "react";
import type { ProblemCategory, ProblemSetSummary } from "../types";

interface ProblemSetPanelProps {
  problemCategories: ProblemCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;

  problemSets: ProblemSetSummary[];
  selectedProblemSetIds: Set<number>;
  assignedProblemSetIds: Set<number>;
  onToggleProblemSet: (id: number) => void;
  // 이미 배정된 문제가 있으면 카테고리 변경 잠금 — 한 강좌엔 한 카테고리 문제만 (추천 기준 일관성)
  categoryLocked?: boolean;
}

export default function ProblemSetPanel({
  problemCategories,
  selectedCategoryId,
  onSelectCategory,
  problemSets,
  selectedProblemSetIds,
  assignedProblemSetIds,
  onToggleProblemSet,
  categoryLocked = false,
}: ProblemSetPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-base font-medium text-gray-800 mb-1.5">
          문제 카테고리 *
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => onSelectCategory(e.target.value)}
          disabled={categoryLocked}
          className="w-full h-11 px-4 border border-gray-200 rounded-lg text-base text-gray-800 outline-none focus:border-blue-900 bg-white transition-colors cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">카테고리 선택</option>
          {problemCategories.map((c) => (
            <option key={String(c.categoryId)} value={String(c.categoryId)}>
              {c.categoryName}
            </option>
          ))}
        </select>
        {categoryLocked && (
          <p className="mt-1.5 text-xs text-gray-500">
            한 강좌에는 하나의 문제 카테고리만 사용할 수 있어요. 카테고리를
            바꾸려면 배정된 문제 강의를 먼저 삭제해주세요.
          </p>
        )}
      </div>

      <div className="flex-1">
        <label className="block text-base font-medium text-gray-800 mb-1.5">
          문제 등록 *
        </label>
        <div className="border border-gray-200 rounded-lg overflow-hidden min-h-52">
          {problemSets.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">
              {selectedCategoryId
                ? "해당 카테고리에 문제가 없습니다."
                : "카테고리를 선택하면 문제 목록이 나타납니다."}
            </div>
          ) : (
            problemSets.map((ps) => {
              const isSelected = selectedProblemSetIds.has(ps.problemSetId);
              const isAssigned = assignedProblemSetIds.has(ps.problemSetId);
              return (
                <div
                  key={ps.problemSetId}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0"
                >
                  <span className="text-sm text-gray-800 flex-1 truncate pr-3">
                    {ps.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleProblemSet(ps.problemSetId)}
                    disabled={isAssigned}
                    title={
                      isAssigned ? "강의에 이미 배정된 문제입니다" : undefined
                    }
                    className={[
                      "text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors",
                      isSelected
                        ? "bg-blue-900 text-white"
                        : "bg-white text-blue-900 border border-blue-900 hover:bg-blue-900 hover:text-white",
                      isAssigned
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer",
                    ].join(" ")}
                  >
                    강의 문제
                  </button>
                </div>
              );
            })
          )}
        </div>
        {selectedProblemSetIds.size > 0 && (
          <p className="mt-1.5 text-xs text-gray-500">
            {selectedProblemSetIds.size}개 선택됨 — 아래 강의 추가 시 문제로
            배정할 수 있어요
          </p>
        )}
      </div>
    </div>
  );
}
