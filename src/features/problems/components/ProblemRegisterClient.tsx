"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OneButtonModal,
  TwoButtonModal,
  WarningModal,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  createProblem,
  createProblemRequestBody,
  INITIAL_PROBLEM_INFO,
  INITIAL_SUB_PROBLEM,
} from "../actions";
import type { ProblemCategory, ProblemInfo, SubProblem } from "../types";
import RegisterForm from "./RegisterForm";
const problemFormPageClasses = {
  "container": "min-h-screen bg-bg-main p-[30px]",
  "pageTitle": "mt-0 mb-5 text-title-lg font-bold text-text-primary",
  "bottomButtonGroup": "flex justify-end gap-[15px]",
  "submitButton": "min-w-[92px] cursor-pointer rounded-base border border-button-blue-bg bg-button-blue-bg px-[30px] py-3 text-[15px] font-semibold text-text-white hover:not-disabled:bg-button-blue-hover-bg disabled:cursor-not-allowed disabled:opacity-60",
  "cancelButton": "min-w-[92px] cursor-pointer rounded-base border border-border-light bg-bg-box px-[30px] py-3 text-[15px] font-semibold text-text-primary hover:not-disabled:bg-bg-box-hover disabled:cursor-not-allowed disabled:opacity-60",
  "deleteButton": "min-w-[92px] cursor-pointer rounded-base border border-button-red-bg bg-bg-box px-[30px] py-3 text-[15px] font-semibold text-text-red hover:not-disabled:bg-button-red-bg hover:not-disabled:text-text-white disabled:cursor-not-allowed disabled:opacity-60"
} as const;



interface ProblemRegisterClientProps {
  initialCategories: ProblemCategory[];
}

const createInitialSubProblem = (): SubProblem => ({
  ...INITIAL_SUB_PROBLEM,
  testCases: INITIAL_SUB_PROBLEM.testCases.map((testCase) => ({ ...testCase })),
});

const createInitialTestCase = () => ({ ...INITIAL_SUB_PROBLEM.testCases[0] });

export default function ProblemRegisterClient({
  initialCategories,
}: ProblemRegisterClientProps) {
  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const [problemInfo, setProblemInfo] = useState<ProblemInfo>({
    ...INITIAL_PROBLEM_INFO,
    categoryId: initialCategories[0]?.categoryId ?? "",
  });
  const [problems, setProblems] = useState<SubProblem[]>([
    createInitialSubProblem(),
  ]);
  const [file, setFile] = useState<File | null>(null);
  const categories = initialCategories;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openValidationModal, setOpenValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const handleProblemInfoChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setProblemInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProblemChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setProblems((prev) =>
      prev.map((problem, problemIndex) => {
        if (problemIndex !== index) {
          return problem;
        }

        if (name === "point") {
          const parsedValue = Number.parseInt(value, 10);

          return {
            ...problem,
            point: Number.isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue,
          };
        }

        return {
          ...problem,
          [name]: value,
        };
      }),
    );
  };

  const handleTestCaseChange = (
    problemIndex: number,
    testCaseIndex: number,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setProblems((prev) =>
      prev.map((problem, currentProblemIndex) => {
        if (currentProblemIndex !== problemIndex) {
          return problem;
        }

        return {
          ...problem,
          testCases: problem.testCases.map((testCase, currentTestCaseIndex) => {
            if (currentTestCaseIndex !== testCaseIndex) {
              return testCase;
            }

            if (name === "isHidden") {
              return {
                ...testCase,
                isHidden: (event.target as HTMLInputElement).checked,
              };
            }

            if (name === "timeoutMs") {
              const parsedValue = Number.parseInt(value, 10);

              return {
                ...testCase,
                timeoutMs:
                  Number.isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue,
              };
            }

            return {
              ...testCase,
              [name]: value,
            };
          }),
        };
      }),
    );
  };

  const handleAddProblem = () => {
    setProblems((prev) => [...prev, createInitialSubProblem()]);
  };

  const handleRemoveProblem = (index: number) => {
    setProblems((prev) =>
      prev.length === 1 ? prev : prev.filter((_, problemIndex) => problemIndex !== index),
    );
  };

  const handleAddTestCase = (problemIndex: number) => {
    setProblems((prev) =>
      prev.map((problem, currentProblemIndex) =>
        currentProblemIndex === problemIndex
          ? {
              ...problem,
              testCases: [...problem.testCases, createInitialTestCase()],
            }
          : problem,
      ),
    );
  };

  const handleRemoveTestCase = (problemIndex: number, testCaseIndex: number) => {
    setProblems((prev) =>
      prev.map((problem, currentProblemIndex) =>
        currentProblemIndex === problemIndex
          ? {
              ...problem,
              testCases:
                problem.testCases.length === 1
                  ? problem.testCases
                  : problem.testCases.filter((_, index) => index !== testCaseIndex),
            }
          : problem,
      ),
    );
  };

  const resetForm = () => {
    setProblemInfo({
      ...INITIAL_PROBLEM_INFO,
      categoryId: initialCategories[0]?.categoryId ?? "",
    });
    setProblems([createInitialSubProblem()]);
    setFile(null);
  };

  const handleGoList = () => {
    resetForm();
    router.push("/admin/problems");
  };

  const validateForm = () => {
    if (!problemInfo.title.trim()) {
      return "문제명을 입력해 주세요.";
    }

    if (!problemInfo.categoryId) {
      return "카테고리를 선택해 주세요.";
    }

    if (!problemInfo.description.trim()) {
      return "문제 설명을 입력해 주세요.";
    }

    if (!file) {
      return "데이터 파일을 추가해 주세요.";
    }

    for (let index = 0; index < problems.length; index += 1) {
      const problem = problems[index];
      const label = `소문제 ${index + 1}`;

      if (!problem.questionTitle.trim()) {
        return `${label}의 문제 제목을 입력해 주세요.`;
      }

      if (!problem.context.trim()) {
        return `${label}의 문제 내용을 입력해 주세요.`;
      }

      if (!problem.hint.trim()) {
        return `${label}의 힌트를 입력해 주세요.`;
      }

      if (!problem.solution.trim()) {
        return `${label}의 해설을 입력해 주세요.`;
      }

      for (let testCaseIndex = 0; testCaseIndex < problem.testCases.length; testCaseIndex += 1) {
        const testCase = problem.testCases[testCaseIndex];
        const testCaseLabel = `${label} 테스트 ${testCaseIndex + 1}`;

        if (!testCase.testCode.trim()) {
          return `${testCaseLabel}의 테스트 코드를 입력해 주세요.`;
        }

        if (!testCase.timeoutMs || testCase.timeoutMs < 1) {
          return `${testCaseLabel}의 제한 시간을 입력해 주세요.`;
        }
      }
    }

    return null;
  };

  const handleOpenSubmitModal = () => {
    if (isSubmitting) {
      return;
    }

    const errorMessage = validateForm();

    if (errorMessage) {
      setValidationMessage(errorMessage);
      setOpenValidationModal(true);
      return;
    }

    setOpenConfirmModal(true);
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current || !file) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const requestBody = createProblemRequestBody(
        problemInfo,
        problems,
        file,
        categories,
      );

      await createProblem(requestBody, file);

      setOpenConfirmModal(false);
      setOpenSuccessModal(true);
    } catch (error) {
      setOpenConfirmModal(false);
      handleClientError(error, {
        router,
        fallbackTitle: "문제 등록 실패",
        fallbackMessage: "문제를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => {
          setValidationMessage(content || title);
          setOpenValidationModal(true);
        },
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className={problemFormPageClasses.container}>
      <h2 className={problemFormPageClasses.pageTitle}>문제 등록</h2>

      <RegisterForm
        categories={categories}
        file={file}
        onAddProblem={handleAddProblem}
        onAddTestCase={handleAddTestCase}
        onFileChange={setFile}
        onProblemChange={handleProblemChange}
        onProblemInfoChange={handleProblemInfoChange}
        onRemoveFile={() => setFile(null)}
        onRemoveProblem={handleRemoveProblem}
        onRemoveTestCase={handleRemoveTestCase}
        onTestCaseChange={handleTestCaseChange}
        problemInfo={problemInfo}
        problems={problems}
      />

      <div className={problemFormPageClasses.bottomButtonGroup}>
        <button
          className={problemFormPageClasses.submitButton}
          disabled={isSubmitting}
          onClick={handleOpenSubmitModal}
          type="button"
        >
          등록
        </button>
        <button
          className={problemFormPageClasses.cancelButton}
          disabled={isSubmitting}
          onClick={() => setOpenCancelModal(true)}
          type="button"
        >
          취소
        </button>
      </div>

      <TwoButtonModal
        cancelDisabled={isSubmitting}
        confirmDisabled={isSubmitting}
        isOpen={openConfirmModal}
        modalTitle="등록하시겠습니까?"
        onClose={() => {
          if (!isSubmitting) {
            setOpenConfirmModal(false);
          }
        }}
        onConfirm={handleSubmit}
      />

      <OneButtonModal
        isOpen={openSuccessModal}
        modalContent="문제가 등록되었습니다."
        modalTitle="등록 완료"
        onClose={handleGoList}
      />

      <OneButtonModal
        isOpen={openValidationModal}
        modalContent={validationMessage}
        modalTitle="확인해 주세요"
        onClose={() => setOpenValidationModal(false)}
      />

      <WarningModal
        isOpen={openCancelModal}
        modalContent="작성한 내용은 저장되지 않습니다."
        modalTitle="취소하시겠습니까?"
        onClose={() => setOpenCancelModal(false)}
        onConfirm={handleGoList}
      />
    </main>
  );
}
