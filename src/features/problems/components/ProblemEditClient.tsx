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
  createProblemUpdateRequestBody,
  deleteProblem,
  INITIAL_SUB_PROBLEM,
  updateProblem,
} from "../actions";
import type {
  NormalizedProblemDetail,
  ProblemCategory,
  ProblemDatasetFile,
  ProblemInfo,
  SubProblem,
} from "../types";
import RegisterForm from "./RegisterForm";

import styles from "./ProblemRegisterClient.module.css";

interface ProblemEditClientProps {
  problemSetId: string;
  initialCategories: ProblemCategory[];
  initialDetail: NormalizedProblemDetail;
}

type ModalState = {
  open: boolean;
  title: string;
  content: string;
};

export default function ProblemEditClient({
  problemSetId,
  initialCategories,
  initialDetail,
}: ProblemEditClientProps) {
  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const [problemInfo, setProblemInfo] = useState<ProblemInfo>(
    initialDetail.problemInfo,
  );
  const [problems, setProblems] = useState<SubProblem[]>(
    initialDetail.problems,
  );
  const [file, setFile] = useState<ProblemDatasetFile | null>(
    initialDetail.file,
  );
  const datasetId = initialDetail.datasetId;
  const categories = initialCategories;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeleteSuccessModal, setOpenDeleteSuccessModal] = useState(false);
  const [alertModal, setAlertModal] = useState<ModalState>({
    open: false,
    title: "",
    content: "",
  });

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
      setAlertModal({
        open: true,
        title: "확인해 주세요",
        content: errorMessage,
      });
      return;
    }

    setOpenConfirmModal(true);
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const requestBody = createProblemUpdateRequestBody(
        problemInfo,
        problems,
        file,
        datasetId,
        categories,
      );

      await updateProblem(problemSetId, requestBody, file);

      setOpenConfirmModal(false);
      setOpenSuccessModal(true);
    } catch (error) {
      setOpenConfirmModal(false);
      handleClientError(error, {
        router,
        fallbackTitle: "문제 수정 실패",
        fallbackMessage: "문제를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => {
          setAlertModal({ open: true, title, content });
        },
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await deleteProblem(problemSetId);

      setOpenDeleteModal(false);
      setOpenDeleteSuccessModal(true);
    } catch (error) {
      setOpenDeleteModal(false);
      handleClientError(error, {
        router,
        fallbackTitle: "문제 삭제 실패",
        fallbackMessage: "문제를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => {
          setAlertModal({ open: true, title, content });
        },
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleGoList = () => {
    router.push("/admin/problems");
  };

  return (
    <main className={styles.container}>
      <h2 className={styles.pageTitle}>문제 수정</h2>

      <RegisterForm
        categories={categories}
        file={file}
        onAddProblem={() => setProblems((prev) => [...prev, { ...INITIAL_SUB_PROBLEM }])}
        onFileChange={setFile}
        onProblemChange={handleProblemChange}
        onProblemInfoChange={handleProblemInfoChange}
        onRemoveFile={() => setFile(null)}
        onRemoveProblem={(index) =>
          setProblems((prev) =>
            prev.length === 1
              ? prev
              : prev.filter((_, problemIndex) => problemIndex !== index),
          )
        }
        problemInfo={problemInfo}
        problems={problems}
      />

      <div className={styles.bottomButtonGroup}>
        <button
          className={styles.deleteButton}
          disabled={isSubmitting}
          onClick={() => setOpenDeleteModal(true)}
          type="button"
        >
          삭제
        </button>
        <button
          className={styles.submitButton}
          disabled={isSubmitting}
          onClick={handleOpenSubmitModal}
          type="button"
        >
          수정
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
        modalTitle="수정하시겠습니까?"
        onClose={() => {
          if (!isSubmitting) {
            setOpenConfirmModal(false);
          }
        }}
        onConfirm={handleSubmit}
      />

      <OneButtonModal
        isOpen={openSuccessModal}
        modalContent="문제가 수정되었습니다."
        modalTitle="수정 완료"
        onClose={handleGoList}
      />

      <WarningModal
        isOpen={openCancelModal}
        modalContent="수정한 내용은 저장되지 않습니다."
        modalTitle="취소하시겠습니까?"
        onClose={() => setOpenCancelModal(false)}
        onConfirm={handleGoList}
      />

      <WarningModal
        cancelDisabled={isSubmitting}
        confirmDisabled={isSubmitting}
        isOpen={openDeleteModal}
        modalContent="삭제한 문제는 복구할 수 없습니다."
        modalTitle="삭제하시겠습니까?"
        onClose={() => {
          if (!isSubmitting) {
            setOpenDeleteModal(false);
          }
        }}
        onConfirm={handleDelete}
      />

      <OneButtonModal
        isOpen={openDeleteSuccessModal}
        modalContent="문제가 삭제되었습니다."
        modalTitle="삭제 완료"
        onClose={handleGoList}
      />

      <OneButtonModal
        isOpen={alertModal.open}
        modalContent={alertModal.content}
        modalTitle={alertModal.title}
        onClose={() => setAlertModal((prev) => ({ ...prev, open: false }))}
      />
    </main>
  );
}
