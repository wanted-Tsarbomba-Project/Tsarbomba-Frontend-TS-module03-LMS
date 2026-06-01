"use client";

// CSR - 문제풀이 상호작용: 서버 초기 문제 데이터를 상태로 받아 코드 입력, 실행, 제출, 문제 이동을 즉시 처리함
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import CategoryNav from "@/components/layout/CategoryNav";
import Sidebar from "@/components/layout/Sidebar";
import {
  OneButtonModal,
  WarningModal,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  createProblemChatMessage,
  getProblemHints,
  getProblemSetDetail,
  runProblem,
  sendProblemChatMessage,
  submitProblem,
} from "../actions";
import type {
  ChatMessage,
  ExecutionResult,
  ProblemHint,
  ProblemResultTab,
  ProblemSetDetail,
  ProblemStatus,
  SubmissionResult,
} from "../types";
import ProblemChatPanel from "./ProblemChatPanel";
import ProblemResultPanel from "./ProblemResultPanel";

import styles from "./UserProblemDetailClient.module.css";

interface UserProblemDetailClientProps {
  problemSetId: string;
  initialProblemSet: ProblemSetDetail;
  initialUserId: string;
}

const updateArrayItem = <T,>(items: T[], index: number, value: T) =>
  items.map((item, itemIndex) => (itemIndex === index ? value : item));

function getInitialProblemIndex(problemSet: ProblemSetDetail) {
  return Math.max(
    problemSet.problems.findIndex((problem) =>
      problemSet.currentProblemId
        ? problem.problemId === problemSet.currentProblemId
        : problem.problemNumber === problemSet.currentProblemNumber,
    ),
    0,
  );
}

function getInitialProblemState(problemSet: ProblemSetDetail) {
  const initialIndex = getInitialProblemIndex(problemSet);

  return {
    currentIndex: initialIndex,
    problemStates: problemSet.problems.map(
      (problem) => problem.status ?? "UNSOLVED",
    ),
    hintEnabled: problemSet.problems.map(
      (problem) => problem.status === "WRONG" || problem.status === "CORRECT",
    ),
    solutionEnabled: problemSet.problems.map(
      (problem) => problem.status === "CORRECT",
    ),
    hints: problemSet.problems.map(() => [] as ProblemHint[]),
    userCodes: problemSet.problems.map((problem) => problem.startCode ?? ""),
    code: problemSet.problems[initialIndex]?.startCode ?? "",
  };
}

export default function UserProblemDetailClient({
  problemSetId,
  initialProblemSet,
  initialUserId,
}: UserProblemDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialState = useMemo(
    () => getInitialProblemState(initialProblemSet),
    [initialProblemSet],
  );

  const [problemSet, setProblemSet] = useState<ProblemSetDetail>(initialProblemSet);
  const [currentIndex, setCurrentIndex] = useState(initialState.currentIndex);
  const [code, setCode] = useState(initialState.code);
  const [userCodes, setUserCodes] = useState<string[]>(initialState.userCodes);
  const [problemStates, setProblemStates] = useState<ProblemStatus[]>(
    initialState.problemStates,
  );
  const [hintEnabled, setHintEnabled] = useState<boolean[]>(
    initialState.hintEnabled,
  );
  const [solutionEnabled, setSolutionEnabled] = useState<boolean[]>(
    initialState.solutionEnabled,
  );
  const [hints, setHints] = useState<ProblemHint[][]>(initialState.hints);
  const [activeTab, setActiveTab] = useState<ProblemResultTab>("result");
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHintToast, setShowHintToast] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [emptySubmitModalOpen, setEmptySubmitModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", content: "" });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const userId = useMemo(() => {
    if (typeof window === "undefined") {
      return searchParams.get("userId") ?? "";
    }

    return searchParams.get("userId") ?? localStorage.getItem("userId") ?? "";
  }, [searchParams]);

  const currentProblem = problemSet.problems[currentIndex];
  const currentHints = hints[currentIndex] ?? [];

  useEffect(() => {
    let isMounted = true;

    const fetchProblemSet = async () => {
      try {
        if (!userId || userId === initialUserId) {
          return;
        }

        const data = await getProblemSetDetail(problemSetId, userId);
        const nextState = getInitialProblemState(data);

        if (!isMounted) {
          return;
        }

        setProblemSet(data);
        setCurrentIndex(nextState.currentIndex);
        setProblemStates(nextState.problemStates);
        setHintEnabled(nextState.hintEnabled);
        setSolutionEnabled(nextState.solutionEnabled);
        setHints(nextState.hints);
        setUserCodes(nextState.userCodes);
        setCode(nextState.code);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        handleClientError(error, {
          router,
          fallbackTitle: "문제 조회 실패",
          fallbackMessage: "문제 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          showModal: (title, content) => setAlertModal({ open: true, title, content }),
        });
      }
    };

    fetchProblemSet();

    return () => {
      isMounted = false;
    };
  }, [initialUserId, problemSetId, router, userId]);

  const canMoveProblem = (index: number) => problemStates[index] !== "LOCKED";

  const getProblemButtonClass = (state: ProblemStatus | undefined, isCurrent: boolean) => {
    if (isCurrent) {
      return "bg-[#1a237e] text-white";
    }

    if (state === "CORRECT") {
      return "border border-[#1a237e] text-[#1a237e] bg-white";
    }

    if (state === "WRONG") {
      return "border border-[#fb2c36] text-[#fb2c36] bg-white";
    }

    return "border border-[#e8e8e8] text-[#1f2937] bg-white hover:bg-[#f3f4f6]";
  };

  const resetChat = () => {
    setChatRoomId(null);
    setChatMessages([]);
    setChatInput("");
    setChatSending(false);
  };

  const moveProblem = (index: number) => {
    if (!canMoveProblem(index)) {
      return;
    }

    const nextCodes = updateArrayItem(userCodes, currentIndex, code);

    setUserCodes(nextCodes);
    setCurrentIndex(index);
    setCode(nextCodes[index] ?? "");
    setActiveTab("result");
    setExecutionResult(null);
    setSubmissionResult(null);
    resetChat();
  };

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode);
    setUserCodes((prev) => updateArrayItem(prev, currentIndex, nextCode));
  };

  const fetchHints = async (problemId: number, index: number) => {
    try {
      const hintList = await getProblemHints(problemId);
      setHints((prev) => updateArrayItem(prev, index, hintList));
      return hintList;
    } catch (error) {
      handleClientError(error, {
        router,
        fallbackTitle: "힌트 조회 실패",
        fallbackMessage: "힌트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => setAlertModal({ open: true, title, content }),
      });
      return [];
    }
  };

  const handleRun = async () => {
    if (!currentProblem?.problemId || isRunning) {
      return;
    }

    if (!code.trim()) {
      setEmptySubmitModalOpen(true);
      return;
    }

    setIsRunning(true);

    try {
      const result = await runProblem(currentProblem.problemId, userId, code);
      setSubmissionResult(null);
      setExecutionResult(result);
      setActiveTab("result");
    } catch (error) {
      handleClientError(error, {
        router,
        fallbackTitle: "코드 실행 실패",
        fallbackMessage: "코드를 실행하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => setAlertModal({ open: true, title, content }),
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem?.problemId || isSubmitting) {
      return;
    }

    if (!code.trim()) {
      setEmptySubmitModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitProblem(currentProblem.problemId, userId, code);

      setExecutionResult(null);
      setSubmissionResult(result);
      setActiveTab("result");

      if (result.isCorrect) {
        setProblemStates((prev) =>
          prev.map((state, index) => {
            const problemId = problemSet?.problems[index]?.problemId;

            if (index === currentIndex) {
              return "CORRECT";
            }

            if (
              result.nextProblemId &&
              problemId === result.nextProblemId &&
              state === "LOCKED"
            ) {
              return "UNSOLVED";
            }

            return state;
          }),
        );
        setHintEnabled((prev) => updateArrayItem(prev, currentIndex, true));
        setSolutionEnabled((prev) => updateArrayItem(prev, currentIndex, true));

        if (!hints[currentIndex]?.length) {
          await fetchHints(currentProblem.problemId, currentIndex);
        }

        setSuccessModalOpen(true);
      } else {
        setProblemStates((prev) => updateArrayItem(prev, currentIndex, "WRONG"));
        setHintEnabled((prev) => updateArrayItem(prev, currentIndex, true));

        if (!hints[currentIndex]?.length) {
          await fetchHints(currentProblem.problemId, currentIndex);
        }

        setShowHintToast(true);
        window.setTimeout(() => setShowHintToast(false), 2000);
      }
    } catch (error) {
      handleClientError(error, {
        router,
        fallbackTitle: "답안 제출 실패",
        fallbackMessage: "답안을 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => setAlertModal({ open: true, title, content }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatSending || !problemSet.id || !currentProblem?.problemId) {
      return;
    }

    const userMessage = chatInput;
    setChatMessages((prev) => [...prev, { role: "USER", content: userMessage }]);
    setChatInput("");
    setChatSending(true);

    try {
      const response = chatRoomId
        ? await sendProblemChatMessage(chatRoomId, userMessage)
        : await createProblemChatMessage(userMessage, problemSet.id, currentProblem.problemId);

      setChatMessages((prev) => [
        ...prev,
        { role: "ASSISTANT", content: response?.answer ?? "답변을 받지 못했습니다." },
      ]);

      if (!chatRoomId && response?.roomId) {
        setChatRoomId(response.roomId);
      }

      window.dispatchEvent(new Event("chatRoomUpdated"));
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ASSISTANT",
          content: "AI 답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          error: true,
        },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  return (
    <>
      <main className={styles.container}>
        <CategoryNav
          isProblemChatOpen={chatOpen}
          isRunning={isRunning}
          onBack={() => setWarningModalOpen(true)}
          onRun={handleRun}
          onToggleProblemChat={() => setChatOpen((prev) => !prev)}
          variant="problem-detail"
        />

        <div className={styles.mainArea}>
          <Sidebar
            canMoveProblem={canMoveProblem}
            currentIndex={currentIndex}
            getProblemButtonClass={getProblemButtonClass}
            moveProblem={moveProblem}
            problemSet={problemSet}
            problemStates={problemStates}
            variant="problem-detail"
          />

          <section className={styles.contentArea}>
            <article className={styles.problemBox}>
              <h2>문제 내용</h2>
              <div className={styles.problemContent}>{currentProblem.content}</div>
            </article>

            <section className={styles.solveBox}>
              <div className={styles.editorSection}>
                <h2>문제풀이 영역</h2>
                {showHintToast && (
                  <div className={styles.hintToast}>힌트를 확인할 수 있습니다.</div>
                )}
                <textarea
                  className={styles.codeEditor}
                  onChange={(event) => handleCodeChange(event.target.value)}
                  value={code}
                />
              </div>

              <div className={styles.tabs}>
                <button
                  className={activeTab === "result" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("result")}
                  type="button"
                >
                  실행결과
                </button>
                <button
                  className={activeTab === "hint" ? styles.activeTab : ""}
                  disabled={!hintEnabled[currentIndex]}
                  onClick={() => setActiveTab("hint")}
                  type="button"
                >
                  힌트
                </button>
                <button
                  className={activeTab === "solution" ? styles.activeTab : ""}
                  disabled={!solutionEnabled[currentIndex]}
                  onClick={() => setActiveTab("solution")}
                  type="button"
                >
                  해설보기
                </button>
              </div>

              <ProblemResultPanel
                activeTab={activeTab}
                currentHints={currentHints}
                currentProblemExplanation={currentProblem.explanation}
                executionResult={executionResult}
                submissionResult={submissionResult}
              />

              <div className={styles.submitWrap}>
                <button
                  className={styles.submitButton}
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  type="button"
                >
                  {isSubmitting ? "제출 중" : "제출하기"}
                </button>
              </div>
            </section>
          </section>

          <ProblemChatPanel
            chatInput={chatInput}
            chatMessages={chatMessages}
            chatOpen={chatOpen}
            chatSending={chatSending}
            onChatInputChange={setChatInput}
            onResetChat={resetChat}
            onSendChat={sendChat}
          />
        </div>
      </main>

      <OneButtonModal
        isOpen={successModalOpen}
        modalContent="해당 문제의 해설을 확인할 수 있습니다."
        modalTitle="정답입니다"
        onClose={() => setSuccessModalOpen(false)}
      />
      <OneButtonModal
        isOpen={emptySubmitModalOpen}
        modalContent="실행하거나 제출할 코드를 입력해 주세요."
        modalTitle="내용을 입력해 주세요"
        onClose={() => setEmptySubmitModalOpen(false)}
      />
      <OneButtonModal
        isOpen={alertModal.open}
        modalContent={alertModal.content}
        modalTitle={alertModal.title}
        onClose={() => setAlertModal((prev) => ({ ...prev, open: false }))}
      />
      <WarningModal
        isOpen={warningModalOpen}
        modalContent="작성한 내용은 저장되지 않습니다."
        modalTitle="정말 나가시겠습니까?"
        onClose={() => setWarningModalOpen(false)}
        onConfirm={() => router.push("/problems")}
      />
    </>
  );
}
