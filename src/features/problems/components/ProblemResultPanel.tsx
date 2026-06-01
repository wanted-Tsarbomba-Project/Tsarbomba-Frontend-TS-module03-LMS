"use client";

// CSR - 문제풀이 결과 패널: 실행/제출 결과와 힌트/해설 탭이 풀이 상태에 따라 즉시 전환됨
import type {
  ExecutionResult,
  ProblemHint,
  ProblemResultTab,
  SubmissionResult,
} from "../types";

import styles from "./UserProblemDetailClient.module.css";

interface ProblemResultPanelProps {
  activeTab: ProblemResultTab;
  currentHints: ProblemHint[];
  currentProblemExplanation?: string;
  executionResult: ExecutionResult | null;
  submissionResult: SubmissionResult | null;
}

export default function ProblemResultPanel({
  activeTab,
  currentHints,
  currentProblemExplanation,
  executionResult,
  submissionResult,
}: ProblemResultPanelProps) {
  if (activeTab === "hint") {
    return (
      <div className={styles.bottomPanel}>
        {currentHints.length
          ? currentHints.map((hint) => (
              <p key={hint.hintId}>{hint.hintContent}</p>
            ))
          : "힌트가 없습니다."}
      </div>
    );
  }

  if (activeTab === "solution") {
    return (
      <div className={styles.bottomPanel}>
        {submissionResult?.explanation ??
          currentProblemExplanation ??
          "해설이 없습니다."}
      </div>
    );
  }

  return (
    <div className={styles.bottomPanel}>
      {submissionResult ? (
        <>
          <p>채점 결과: {submissionResult.isCorrect ? "정답" : "오답"}</p>
          <p>
            통과 테스트: {submissionResult.passedTestCount ?? 0}/
            {submissionResult.totalTestCount ?? 0}
          </p>
          {submissionResult.executionStatus && (
            <p>실행 상태: {submissionResult.executionStatus}</p>
          )}
          {submissionResult.errorMessage && (
            <pre className={styles.executionError}>
              {submissionResult.errorMessage}
            </pre>
          )}
        </>
      ) : executionResult ? (
        <ExecutionResultView executionResult={executionResult} />
      ) : (
        ""
      )}
    </div>
  );
}

function ExecutionResultView({
  executionResult,
}: {
  executionResult: ExecutionResult;
}) {
  const output =
    executionResult.output ??
    executionResult.stdout ??
    executionResult.result ??
    executionResult.message;
  const error = executionResult.errorMessage ?? executionResult.stderr;

  return (
    <>
      {executionResult.executionStatus && (
        <p>실행 상태: {executionResult.executionStatus}</p>
      )}
      {output && <pre className={styles.executionOutput}>{output}</pre>}
      {error && <pre className={styles.executionError}>{error}</pre>}
      {!executionResult.executionStatus && !output && !error && (
        <pre className={styles.executionOutput}>
          {JSON.stringify(executionResult, null, 2)}
        </pre>
      )}
    </>
  );
}
