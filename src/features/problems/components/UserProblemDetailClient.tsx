"use client";

// CSR - 문제풀이 상호작용: 서버 초기 문제 데이터를 상태로 받아 코드 입력, 실행, 제출, 문제 이동을 즉시 처리함
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import CategoryNav from "@/components/layout/CategoryNav";
import Sidebar from "@/components/layout/Sidebar";
import {
  OneButtonModal,
  TwoButtonModal,
  WarningModal,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  createProblemChatMessage,
  getProblemChatMessages,
  getProblemChatRooms,
  getProblemHints,
  getProblemSetDetail,
  getProblemSetResult,
  runProblem,
  sendProblemChatMessage,
  submitProblem,
  updateProblemChatRoomTitle,
} from "../actions";
import type {
  ChatMessage,
  ExecutionResult,
  ProblemHint,
  ProblemResultTab,
  ProblemSetDetail,
  ProblemSetResult,
  ProblemChatRoom,
  ProblemStatus,
  SubmissionResult,
} from "../types";
import ProblemChatPanel from "./ProblemChatPanel";
import ProblemResultPanel from "./ProblemResultPanel";

// 강좌 문제풀이(CourseProblemDetailClient)에서도 동일 스타일을 재사용하기 위해 export
export const problemDetailClasses = {
  "container": "min-h-[80vh] w-full bg-bg-main",
  "mainArea": "relative flex min-h-[calc(80vh-80px)] gap-4 overflow-hidden py-3.5 max-lg:flex-col",
  "contentArea": "flex min-w-0 flex-1 gap-4 max-lg:flex-col",
  "problemBox": "min-w-0 flex-1 rounded-base border border-border-light bg-bg-box p-4 [&_h2]:mt-0 [&_h2]:mb-2.5 [&_h2]:text-title-lg [&_h2]:font-bold [&_h2]:text-text-primary",
  "solveBox": "min-w-0 flex-1 rounded-base border border-border-light bg-bg-box p-4 [&_h2]:mt-0 [&_h2]:mb-2.5 [&_h2]:text-title-lg [&_h2]:font-bold [&_h2]:text-text-primary",
  "problemContent": "whitespace-pre-wrap text-body leading-normal text-text-primary",
  "editorSection": "relative",
  "codeEditor": "min-h-[220px] w-full resize-y rounded-base border border-border-light p-3 font-mono text-body text-text-primary",
  "hintToast": "absolute left-1/2 top-[42px] z-10 -translate-x-1/2 whitespace-nowrap rounded-base bg-button-blue-bg px-[18px] py-3 text-body font-semibold text-text-white",
  "tabs": "mt-3 mb-2 flex gap-2 [&_button]:min-w-24 [&_button]:cursor-pointer [&_button]:rounded-base [&_button]:border [&_button]:border-border-light [&_button]:bg-bg-box [&_button]:px-3.5 [&_button]:py-[9px] [&_button]:text-[15px] [&_button]:text-text-primary [&_button:disabled]:cursor-not-allowed [&_button:disabled]:bg-bg-navbar [&_button:disabled]:text-[#9ca3af]",
  "activeTab": "bg-bg-navbar! text-text-blue!",
  "bottomPanel": "min-h-[140px] w-full overflow-y-auto rounded-base border border-border-light p-3 text-body text-text-primary",
  "executionOutput": "m-0 whitespace-pre-wrap break-words font-mono",
  "executionError": "m-0 whitespace-pre-wrap break-words font-mono text-text-red",
  "submitWrap": "mt-3 flex justify-end",
  "submitButton": "h-11 min-w-[120px] cursor-pointer rounded-base border border-button-blue-bg bg-button-blue-bg text-body font-semibold text-text-white hover:not-disabled:bg-button-blue-hover-bg disabled:cursor-not-allowed disabled:opacity-60",
  "chatPanel": "pointer-events-none absolute right-0 top-3.5 z-20 flex h-[calc(100%-28px)] min-h-[560px] w-[min(420px,calc(100%-32px))] translate-x-6 flex-col rounded-base border border-border-light bg-bg-box opacity-0 shadow-[0_12px_32px_rgba(15,23,42,0.16)] transition-[opacity,transform] duration-200 ease-in-out max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:top-[74px] max-md:h-auto max-md:min-h-0 max-md:w-auto",
  "open": "pointer-events-auto translate-x-0 opacity-100",
  "chatHeader": "flex min-h-[58px] items-center justify-between border-b border-border-light px-5 text-title-md font-bold text-text-primary [&_button]:inline-flex [&_button]:h-[34px] [&_button]:w-[34px] [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:rounded-base [&_button]:border [&_button]:border-text-primary [&_button]:bg-bg-box [&_button]:p-0 [&_button]:text-2xl [&_button]:leading-none [&_button]:text-text-primary",
  "chatMessages": "flex-1 overflow-y-auto p-[18px]",
  "chatMessageWrap": "mb-2.5 flex justify-start",
  "userMessageWrap": "justify-end",
  "chatMessage": "max-w-[86%] whitespace-pre-wrap break-words rounded-base px-3 py-2.5 leading-[1.6] text-text-primary",
  "assistantMessage": "bg-[#bfd3ef]",
  "userMessage": "border border-border-light bg-bg-box",
  "errorMessage": "text-text-red",
  "chatInputWrap": "flex items-end gap-2 border-t border-border-light p-3.5 [&_textarea]:box-border [&_textarea]:max-h-36 [&_textarea]:min-h-11 [&_textarea]:flex-1 [&_textarea]:resize-none [&_textarea]:overflow-y-hidden [&_textarea]:rounded-base [&_textarea]:border [&_textarea]:border-border-light [&_textarea]:p-2.5 [&_textarea]:leading-normal [&_textarea]:text-text-primary [&_textarea]:outline-none [&_button]:h-11 [&_button]:min-w-[72px] [&_button]:cursor-pointer [&_button]:rounded-base [&_button]:border [&_button]:border-button-blue-bg [&_button]:bg-button-blue-bg [&_button]:text-text-white [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60"
} as const;


interface UserProblemDetailClientProps {
  problemSetId: string;
  initialProblemSet: ProblemSetDetail;
  initialProblemSetResult: ProblemSetResult | null;
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

function getCorrectSubmissionMap(problemSetResult: ProblemSetResult | null) {
  return new Map(
    (problemSetResult?.submissions ?? [])
      .filter((submission) => submission.isCorrect)
      .map((submission) => [submission.problemId, submission]),
  );
}

function getInitialProblemState(
  problemSet: ProblemSetDetail,
  problemSetResult: ProblemSetResult | null,
) {
  const initialIndex = getInitialProblemIndex(problemSet);
  const correctSubmissionMap = getCorrectSubmissionMap(problemSetResult);
  const submissionResults = problemSet.problems.map((problem) => {
    const submission = correctSubmissionMap.get(problem.problemId);

    if (!submission) {
      return null;
    }

    return {
      isCorrect: submission.isCorrect,
      explanation: submission.explanation ?? problem.explanation,
      submittedAt: submission.submittedAt,
    } satisfies SubmissionResult;
  });

  return {
    currentIndex: initialIndex,
    problemStates: problemSet.problems.map((problem) =>
      correctSubmissionMap.has(problem.problemId)
        ? "CORRECT"
        : (problem.status ?? "UNSOLVED"),
    ),
    hintEnabled: problemSet.problems.map(
      (problem) =>
        correctSubmissionMap.has(problem.problemId) ||
        problem.status === "WRONG" ||
        problem.status === "CORRECT",
    ),
    solutionEnabled: problemSet.problems.map(
      (problem) =>
        correctSubmissionMap.has(problem.problemId) ||
        problem.status === "CORRECT",
    ),
    hints: problemSet.problems.map(() => [] as ProblemHint[]),
    userCodes: problemSet.problems.map(
      (problem) =>
        correctSubmissionMap.get(problem.problemId)?.submittedAnswer ??
        problem.startCode ??
        "",
    ),
    submissionResults,
    code:
      correctSubmissionMap.get(problemSet.problems[initialIndex]?.problemId)
        ?.submittedAnswer ??
      problemSet.problems[initialIndex]?.startCode ??
      "",
  };
}

function normalizeId(value?: number | string | null) {
  return value == null ? "" : String(value);
}

function getRoomProblemSetId(room: ProblemChatRoom) {
  return (
    room.problemSetId ??
    room.problemSet?.problemSetId ??
    room.problemSet?.id ??
    null
  );
}

function getRoomProblemId(room: ProblemChatRoom) {
  return room.problemId ?? room.problem?.problemId ?? room.problem?.id ?? null;
}

function findProblemChatRoom(
  rooms: ProblemChatRoom[],
  problemSetId: number,
  problemId: number,
) {
  const targetProblemSetId = normalizeId(problemSetId);
  const targetProblemId = normalizeId(problemId);

  return rooms.find(
    (room) =>
      normalizeId(getRoomProblemSetId(room)) === targetProblemSetId &&
      normalizeId(getRoomProblemId(room)) === targetProblemId,
  );
}

export default function UserProblemDetailClient({
  problemSetId,
  initialProblemSet,
  initialProblemSetResult,
  initialUserId,
}: UserProblemDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialState = useMemo(
    () => getInitialProblemState(initialProblemSet, initialProblemSetResult),
    [initialProblemSet, initialProblemSetResult],
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
  const [submissionResults, setSubmissionResults] = useState<
    Array<SubmissionResult | null>
  >(initialState.submissionResults);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(
      initialState.submissionResults[initialState.currentIndex],
    );
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHintToast, setShowHintToast] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [emptySubmitModalOpen, setEmptySubmitModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", content: "" });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [chatRoomTitle, setChatRoomTitle] = useState<string | null>(null);
  const [chatRoomTitleInput, setChatRoomTitleInput] = useState("");
  const [chatRoomTitleEditing, setChatRoomTitleEditing] = useState(false);
  const [chatRoomTitleConfirmOpen, setChatRoomTitleConfirmOpen] = useState(false);
  const [chatRoomTitleUpdating, setChatRoomTitleUpdating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const activeChatRoomIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeChatRoomIdRef.current = chatRoomId;
  }, [chatRoomId]);

  const userId = useMemo(() => {
    if (typeof window === "undefined") {
      return searchParams.get("userId") ?? "";
    }

    return searchParams.get("userId") ?? localStorage.getItem("userId") ?? "";
  }, [searchParams]);

  const currentProblem = problemSet.problems[currentIndex];
  const currentHints = hints[currentIndex] ?? [];

  const resetChatState = useCallback(() => {
    setChatRoomId(null);
    setChatRoomTitle(null);
    setChatRoomTitleInput("");
    setChatRoomTitleEditing(false);
    setChatRoomTitleConfirmOpen(false);
    setChatMessages([]);
    setChatInput("");
    setChatSending(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProblemSet = async () => {
      try {
        if (!userId || userId === initialUserId) {
          return;
        }

        const [data, result] = await Promise.all([
          getProblemSetDetail(problemSetId, userId),
          getProblemSetResult(problemSetId).catch(() => null),
        ]);
        const nextState = getInitialProblemState(data, result);

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
        setSubmissionResults(nextState.submissionResults);
        setSubmissionResult(nextState.submissionResults[nextState.currentIndex]);
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

  useEffect(() => {
    let isMounted = true;

    const loadProblemChatRoom = async () => {
      if (!problemSet.id || !currentProblem?.problemId) {
        resetChatState();
        return;
      }

      resetChatState();
      setChatLoading(true);

      try {
        const rooms = await getProblemChatRooms();
        const room = findProblemChatRoom(
          rooms,
          problemSet.id,
          currentProblem.problemId,
        );

        if (!isMounted || !room) {
          return;
        }

        setChatRoomId(room.roomId);
        setChatRoomTitle(room.title || null);
        setChatRoomTitleInput(room.title || "");

        const messages = await getProblemChatMessages(room.roomId);

        if (!isMounted) {
          return;
        }

        setChatMessages(messages);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        handleClientError(error, {
          router,
          fallbackTitle: "채팅방 조회 실패",
          fallbackMessage:
            "문제 전용 채팅방을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          showModal: (title, content) =>
            setAlertModal({ open: true, title, content }),
        });
      } finally {
        if (isMounted) {
          setChatLoading(false);
        }
      }
    };

    loadProblemChatRoom();

    return () => {
      isMounted = false;
    };
  }, [currentProblem?.problemId, problemSet.id, resetChatState, router]);

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
    setSubmissionResult(submissionResults[index] ?? null);
    resetChatState();
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
      setSubmissionResults((prev) => updateArrayItem(prev, currentIndex, result));
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

  const startChatRoomTitleEdit = () => {
    setChatRoomTitleInput(chatRoomTitle ?? "");
    setChatRoomTitleEditing(true);
  };

  const cancelChatRoomTitleEdit = () => {
    setChatRoomTitleInput(chatRoomTitle ?? "");
    setChatRoomTitleEditing(false);
    setChatRoomTitleConfirmOpen(false);
  };

  const requestChatRoomTitleUpdate = () => {
    const nextTitle = chatRoomTitleInput.trim();

    if (!nextTitle || nextTitle === (chatRoomTitle ?? "")) {
      cancelChatRoomTitleEdit();
      return;
    }

    setChatRoomTitleConfirmOpen(true);
  };

  const handleChatRoomTitleUpdate = async () => {
    if (!chatRoomId || chatRoomTitleUpdating) {
      return;
    }

    const targetRoomId = chatRoomId;
    const nextTitle = chatRoomTitleInput.trim();

    if (!nextTitle) {
      return;
    }

    setChatRoomTitleUpdating(true);

    try {
      const updatedRoom = await updateProblemChatRoomTitle(targetRoomId, nextTitle);

      if (activeChatRoomIdRef.current !== targetRoomId) {
        return;
      }

      const updatedTitle = updatedRoom?.title ?? nextTitle;

      setChatRoomTitle(updatedTitle);
      setChatRoomTitleInput(updatedTitle);
      setChatRoomTitleEditing(false);
      setChatRoomTitleConfirmOpen(false);
      window.dispatchEvent(new Event("chatRoomUpdated"));
    } catch (error) {
      setChatRoomTitleConfirmOpen(false);
      handleClientError(error, {
        router,
        fallbackTitle: "채팅방 이름 수정 실패",
        fallbackMessage:
          "채팅방 이름을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => setAlertModal({ open: true, title, content }),
      });
    } finally {
      setChatRoomTitleUpdating(false);
    }
  };

  const sendChat = async () => {
    if (
      !chatInput.trim() ||
      chatSending ||
      chatLoading ||
      !problemSet.id ||
      !currentProblem?.problemId
    ) {
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
      <main className={problemDetailClasses.container}>
        <CategoryNav
          isProblemChatOpen={chatOpen}
          isRunning={isRunning}
          onBack={() => setWarningModalOpen(true)}
          onRun={handleRun}
          onToggleProblemChat={() => setChatOpen((prev) => !prev)}
          variant="problem-detail"
        />

        <div className={problemDetailClasses.mainArea}>
          <Sidebar
            canMoveProblem={canMoveProblem}
            currentIndex={currentIndex}
            getProblemButtonClass={getProblemButtonClass}
            moveProblem={moveProblem}
            problemSet={problemSet}
            problemStates={problemStates}
            variant="problem-detail"
          />

          <section className={problemDetailClasses.contentArea}>
            <article className={problemDetailClasses.problemBox}>
              <h2>문제 내용</h2>
              <div className={problemDetailClasses.problemContent}>{currentProblem.content}</div>
            </article>

            <section className={problemDetailClasses.solveBox}>
              <div className={problemDetailClasses.editorSection}>
                <h2>문제풀이 영역</h2>
                {showHintToast && (
                  <div className={problemDetailClasses.hintToast}>힌트를 확인할 수 있습니다.</div>
                )}
                <textarea
                  className={problemDetailClasses.codeEditor}
                  onChange={(event) => handleCodeChange(event.target.value)}
                  value={code}
                />
              </div>

              <div className={problemDetailClasses.tabs}>
                <button
                  className={activeTab === "result" ? problemDetailClasses.activeTab : ""}
                  onClick={() => setActiveTab("result")}
                  type="button"
                >
                  실행결과
                </button>
                <button
                  className={activeTab === "hint" ? problemDetailClasses.activeTab : ""}
                  disabled={!hintEnabled[currentIndex]}
                  onClick={() => setActiveTab("hint")}
                  type="button"
                >
                  힌트
                </button>
                <button
                  className={activeTab === "solution" ? problemDetailClasses.activeTab : ""}
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

              <div className={problemDetailClasses.submitWrap}>
                <button
                  className={problemDetailClasses.submitButton}
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
            canEditChatRoomTitle={Boolean(chatRoomId)}
            chatInput={chatInput}
            chatMessages={chatMessages}
            chatOpen={chatOpen}
            chatRoomTitleEditing={chatRoomTitleEditing}
            chatRoomTitleInput={chatRoomTitleInput}
            chatRoomTitle={chatRoomTitle}
            chatSending={chatSending || chatLoading}
            onChatInputChange={setChatInput}
            onChatRoomTitleCancel={cancelChatRoomTitleEdit}
            onChatRoomTitleChange={setChatRoomTitleInput}
            onChatRoomTitleEdit={startChatRoomTitleEdit}
            onChatRoomTitleSubmit={requestChatRoomTitleUpdate}
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
      <TwoButtonModal
        cancelDisabled={chatRoomTitleUpdating}
        confirmDisabled={chatRoomTitleUpdating || !chatRoomTitleInput.trim()}
        isOpen={chatRoomTitleConfirmOpen}
        modalContent={`채팅방 이름을 "${chatRoomTitleInput.trim()}"(으)로 변경합니다.`}
        modalTitle="채팅방 이름을 수정하시겠습니까?"
        onClose={() => {
          if (!chatRoomTitleUpdating) {
            setChatRoomTitleConfirmOpen(false);
          }
        }}
        onConfirm={handleChatRoomTitleUpdate}
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
