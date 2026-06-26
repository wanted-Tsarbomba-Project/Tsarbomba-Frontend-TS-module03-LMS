"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
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
  getEditableProblemRecommendedCourses,
  getSelectableRecommendedCourses,
  INITIAL_SUB_PROBLEM,
  updateProblem,
  updateProblemsRecommendedCourses,
} from "../actions";
import type {
  NormalizedProblemDetail,
  ProblemCategory,
  ProblemDatasetFile,
  ProblemInfo,
  SelectableRecommendedCourse,
  SubProblem,
} from "../types";
import RegisterForm from "./RegisterForm";
const problemFormPageClasses = {
  "container": "min-h-screen bg-bg-main p-[30px]",
  "pageTitle": "mt-0 mb-5 text-title-lg font-bold text-text-primary",
  "bottomButtonGroup": "flex justify-end gap-[15px]",
  "submitButton": "min-w-[92px] cursor-pointer rounded-base border border-button-blue-bg bg-button-blue-bg px-[30px] py-3 text-[15px] font-semibold text-text-white hover:not-disabled:bg-button-blue-hover-bg disabled:cursor-not-allowed disabled:opacity-60",
  "cancelButton": "min-w-[92px] cursor-pointer rounded-base border border-border-light bg-bg-box px-[30px] py-3 text-[15px] font-semibold text-text-primary hover:not-disabled:bg-bg-box-hover disabled:cursor-not-allowed disabled:opacity-60",
  "deleteButton": "min-w-[92px] cursor-pointer rounded-base border border-button-red-bg bg-bg-box px-[30px] py-3 text-[15px] font-semibold text-text-red hover:not-disabled:bg-button-red-bg hover:not-disabled:text-text-white disabled:cursor-not-allowed disabled:opacity-60"
} as const;



interface ProblemEditClientProps {
  problemSetId: string;
  initialCategories: ProblemCategory[];
  initialDetail: NormalizedProblemDetail;
}

type ModalState = {
  open: boolean;
  title: string;
  content: string;
  status?: number;
};

const createInitialSubProblem = (): SubProblem => ({
  ...INITIAL_SUB_PROBLEM,
  testCases: INITIAL_SUB_PROBLEM.testCases.map((testCase) => ({ ...testCase })),
});

const createInitialTestCase = () => ({ ...INITIAL_SUB_PROBLEM.testCases[0] });

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
    initialDetail.problems.length ? initialDetail.problems : [createInitialSubProblem()],
  );
  const [file, setFile] = useState<ProblemDatasetFile | null>(
    initialDetail.file,
  );
  const [selectableCourses, setSelectableCourses] = useState<
    SelectableRecommendedCourse[]
  >([]);
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

  useEffect(() => {
    let isMounted = true;

    const loadRecommendedCourses = async () => {
      try {
        const [selectable, ...editableResults] = await Promise.all([
          getSelectableRecommendedCourses(),
          ...initialDetail.problems
            .filter((problem) => typeof problem.problemId === "number")
            .map((problem) =>
              getEditableProblemRecommendedCourses(problem.problemId as number),
            ),
        ]);

        if (!isMounted) {
          return;
        }

        setSelectableCourses(
          mergeSelectableCourses(
            selectable,
            editableResults.flatMap((result) => result?.courses ?? []),
          ),
        );

        setProblems((prev) =>
          prev.map((problem) => {
            const editableResult = editableResults.find(
              (result) => result?.problemId === problem.problemId,
            );

            if (!editableResult) {
              return problem;
            }

            return {
              ...problem,
              recommendedCourseIds:
                editableResult.selectedCourseIds ??
                editableResult.courses
                  .filter((course) => course.selected)
                  .map((course) => course.courseId),
            };
          }),
        );
      } catch (error) {
        console.error("추천 강좌 연결 정보 조회 실패:", error);
      }
    };

    void loadRecommendedCourses();

    return () => {
      isMounted = false;
    };
  }, [initialDetail.problems]);

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

  const handleRecommendedCourseChange = (
    problemIndex: number,
    courseIds: number[],
  ) => {
    setProblems((prev) =>
      prev.map((problem, currentIndex) => {
        if (currentIndex !== problemIndex) {
          return problem;
        }

        return {
          ...problem,
          recommendedCourseIds: getOrderedSelectedCourseIds(
            problem.recommendedCourseIds ?? [],
            courseIds,
          ),
        };
      }),
    );
  };

  const handleRecommendedCourseSearch = async (keyword: string) => {
    try {
      const courses = await getSelectableRecommendedCourses(keyword);
      setSelectableCourses((prev) => mergeSelectableCourses(prev, courses));
    } catch (error) {
      console.error("추천 강좌 검색 실패:", error);
    }
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
      await updateProblemsRecommendedCourses(problems, true);

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
    <main className={problemFormPageClasses.container}>
      <h2 className={problemFormPageClasses.pageTitle}>문제 수정</h2>

      <RegisterForm
        categories={categories}
        file={file}
        onAddProblem={handleAddProblem}
        onAddTestCase={handleAddTestCase}
        onFileChange={setFile}
        onProblemChange={handleProblemChange}
        onProblemInfoChange={handleProblemInfoChange}
        onRecommendedCourseChange={handleRecommendedCourseChange}
        onRecommendedCourseSearch={handleRecommendedCourseSearch}
        onRemoveFile={() => setFile(null)}
        onRemoveProblem={handleRemoveProblem}
        onRemoveTestCase={handleRemoveTestCase}
        onTestCaseChange={handleTestCaseChange}
        problemInfo={problemInfo}
        problems={problems}
        selectableCourses={selectableCourses}
      />

      <div className={problemFormPageClasses.bottomButtonGroup}>
        <button
          className={problemFormPageClasses.deleteButton}
          disabled={isSubmitting}
          onClick={() => setOpenDeleteModal(true)}
          type="button"
        >
          삭제
        </button>
        <button
          className={problemFormPageClasses.submitButton}
          disabled={isSubmitting}
          onClick={handleOpenSubmitModal}
          type="button"
        >
          수정
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

function mergeSelectableCourses(
  prev: SelectableRecommendedCourse[],
  next: SelectableRecommendedCourse[],
) {
  const courseMap = new Map<number, SelectableRecommendedCourse>();

  [...prev, ...next].forEach((course) => {
    const existingCourse = courseMap.get(course.courseId);

    courseMap.set(course.courseId, {
      ...existingCourse,
      ...course,
      categoryId: course.categoryId ?? existingCourse?.categoryId,
      categoryName: course.categoryName ?? existingCourse?.categoryName,
    });
  });

  return Array.from(courseMap.values());
}

function getOrderedSelectedCourseIds(prevIds: number[], nextIds: number[]) {
  return [
    ...prevIds.filter((courseId) => nextIds.includes(courseId)),
    ...nextIds.filter((courseId) => !prevIds.includes(courseId)),
  ];
}
