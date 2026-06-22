"use client";

import { memo } from "react";

import { problemDetailClasses } from "../problemDetailStyles";
import type {
  ExecutionResult,
  ProblemHint,
  ProblemResultTab,
  SubmissionResult,
} from "../types";
import ProblemResultPanel from "./ProblemResultPanel";

interface ProblemSolveSectionProps {
  activeTab: ProblemResultTab;
  code: string;
  currentHints: ProblemHint[];
  currentProblemExplanation?: string;
  executionResult: ExecutionResult | null;
  hintEnabled: boolean;
  isCurrentProblemCorrect: boolean;
  isSubmitting: boolean;
  onCodeChange: (nextCode: string) => void;
  onSubmit: () => void;
  onTabChange: (tab: ProblemResultTab) => void;
  showHintToast: boolean;
  solutionEnabled: boolean;
  submissionResult: SubmissionResult | null;
}

function ProblemSolveSection({
  activeTab,
  code,
  currentHints,
  currentProblemExplanation,
  executionResult,
  hintEnabled,
  isCurrentProblemCorrect,
  isSubmitting,
  onCodeChange,
  onSubmit,
  onTabChange,
  showHintToast,
  solutionEnabled,
  submissionResult,
}: ProblemSolveSectionProps) {
  return (
    <section className={problemDetailClasses.solveBox}>
      <div className={problemDetailClasses.editorSection}>
        <h2>문제풀이 영역</h2>
        {showHintToast && (
          <div className={problemDetailClasses.hintToast}>
            힌트를 확인할 수 있습니다.
          </div>
        )}
        <textarea
          aria-label="답안 코드 입력"
          className={problemDetailClasses.codeEditor}
          onChange={(event) => onCodeChange(event.target.value)}
          value={code}
        />
      </div>

      <div
        aria-label="문제 풀이 결과 탭"
        className={problemDetailClasses.tabs}
        role="tablist"
      >
        <button
          aria-selected={activeTab === "result"}
          className={activeTab === "result" ? problemDetailClasses.activeTab : ""}
          onClick={() => onTabChange("result")}
          role="tab"
          type="button"
        >
          실행결과
        </button>
        <button
          aria-selected={activeTab === "hint"}
          className={activeTab === "hint" ? problemDetailClasses.activeTab : ""}
          disabled={!hintEnabled}
          onClick={() => onTabChange("hint")}
          role="tab"
          type="button"
        >
          힌트
        </button>
        <button
          aria-selected={activeTab === "solution"}
          className={
            activeTab === "solution" ? problemDetailClasses.activeTab : ""
          }
          disabled={!solutionEnabled}
          onClick={() => onTabChange("solution")}
          role="tab"
          type="button"
        >
          해설보기
        </button>
      </div>

      <ProblemResultPanel
        activeTab={activeTab}
        currentHints={currentHints}
        currentProblemExplanation={currentProblemExplanation}
        executionResult={executionResult}
        submissionResult={submissionResult}
      />

      <div className={problemDetailClasses.submitWrap}>
        <button
          className={problemDetailClasses.submitButton}
          disabled={isSubmitting || isCurrentProblemCorrect}
          onClick={onSubmit}
          type="button"
        >
          {isCurrentProblemCorrect
            ? "제출 완료"
            : isSubmitting
              ? "제출 중"
              : "제출하기"}
        </button>
      </div>
    </section>
  );
}

export default memo(ProblemSolveSection);
