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

import styles from "./ProblemRegisterClient.module.css";

interface ProblemRegisterClientProps {
  initialCategories: ProblemCategory[];
}

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
    { ...INITIAL_SUB_PROBLEM },
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

  const handleAddProblem = () => {
    setProblems((prev) => [...prev, { ...INITIAL_SUB_PROBLEM }]);
  };

  const handleRemoveProblem = (index: number) => {
    setProblems((prev) =>
      prev.length === 1 ? prev : prev.filter((_, problemIndex) => problemIndex !== index),
    );
  };

  const resetForm = () => {
    setProblemInfo({
      ...INITIAL_PROBLEM_INFO,
      categoryId: initialCategories[0]?.categoryId ?? "",
    });
    setProblems([{ ...INITIAL_SUB_PROBLEM }]);
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

      if (!problem.answer.trim()) {
        return `${label}의 문제 정답을 입력해 주세요.`;
      }

      if (!problem.hint.trim()) {
        return `${label}의 문제 힌트를 입력해 주세요.`;
      }

      if (!problem.solution.trim()) {
        return `${label}의 문제 해설을 입력해 주세요.`;
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
    <main className={styles.container}>
      <h2 className={styles.pageTitle}>문제 등록</h2>

      <RegisterForm
        categories={categories}
        file={file}
        onAddProblem={handleAddProblem}
        onFileChange={setFile}
        onProblemChange={handleProblemChange}
        onProblemInfoChange={handleProblemInfoChange}
        onRemoveFile={() => setFile(null)}
        onRemoveProblem={handleRemoveProblem}
        problemInfo={problemInfo}
        problems={problems}
      />

      <div className={styles.bottomButtonGroup}>
        <button
          className={styles.submitButton}
          disabled={isSubmitting}
          onClick={handleOpenSubmitModal}
          type="button"
        >
          등록
        </button>
        <button
          className={styles.cancelButton}
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
