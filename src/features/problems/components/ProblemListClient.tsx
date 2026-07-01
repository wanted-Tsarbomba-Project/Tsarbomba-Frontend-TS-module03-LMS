"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  ListSkeleton,
  OneButtonModal,
  Pagination,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  DIFFICULTY_MAP,
  getProblemSetPage,
} from "../actions";
import {
  PROBLEM_LIST_COLUMN_LABELS,
  PROBLEM_SET_PAGE_SIZE,
} from "../constants";
import type { ProblemSetSummary } from "../types";

const problemListClasses = {
  "container": "min-h-screen bg-bg-main p-[30px]",
  "header": "mb-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch",
  "pageTitle": "m-0 text-title-lg font-bold text-text-primary",
  "registerButton": "cursor-pointer rounded-base border border-button-blue-bg bg-button-blue-bg px-[18px] py-2.5 text-description font-semibold text-text-white hover:bg-button-blue-hover-bg max-md:w-full",
  "twoLineCell": "line-clamp-2 !whitespace-normal break-words leading-5 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
} as const;

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export default function ProblemListClient() {
  const router = useRouter();

  const [problemSets, setProblemSets] = useState<ProblemSetSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    content: "",
  });

  const columns = useMemo<ListColumn<ProblemSetSummary>[]>(
    () => [
      {
        key: "problemNumber",
        label: PROBLEM_LIST_COLUMN_LABELS[0],
        render: (item, index) =>
          item.problemNumber ?? page * PROBLEM_SET_PAGE_SIZE + index + 1,
      },
      {
        key: "title",
        label: PROBLEM_LIST_COLUMN_LABELS[1],
        cellClassName: problemListClasses.twoLineCell,
      },
      {
        key: "description",
        label: PROBLEM_LIST_COLUMN_LABELS[2],
        cellClassName: problemListClasses.twoLineCell,
      },
      {
        key: "difficulty",
        label: PROBLEM_LIST_COLUMN_LABELS[3],
        render: (item) =>
          DIFFICULTY_MAP[item.difficulty as keyof typeof DIFFICULTY_MAP] ??
          item.difficulty,
      },
      {
        key: "accuracyRate",
        label: PROBLEM_LIST_COLUMN_LABELS[4],
        render: (item) =>
          typeof item.accuracyRate === "number" ? `${item.accuracyRate}%` : "-",
      },
      {
        key: "createdAt",
        label: PROBLEM_LIST_COLUMN_LABELS[5],
        render: (item) => formatDate(item.createdAt),
      },
    ],
    [page],
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchProblemSets = async () => {
      setIsLoading(true);

      try {
        const data = await getProblemSetPage({
          page,
          size: PROBLEM_SET_PAGE_SIZE,
          init: {
            signal: controller.signal,
          },
        });

        if (controller.signal.aborted) {
          return;
        }

        setProblemSets(data.problemSets);
        setTotalPages(data.totalPages);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        handleClientError(error, {
          router,
          fallbackTitle: "문제 목록 조회 실패",
          fallbackMessage: "문제 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          showModal: (title, content) => {
            setModal({ open: true, title, content });
          },
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProblemSets();

    return () => {
      controller.abort();
    };
  }, [page, router]);

  return (
    <main className={problemListClasses.container}>
      <div className={problemListClasses.header}>
        <h2 className={problemListClasses.pageTitle}>문제 관리</h2>

        <button
          className={problemListClasses.registerButton}
          onClick={() => router.push("/admin/problems/new")}
          type="button"
        >
          등록하기
        </button>
      </div>

      {isLoading ? (
        <ListSkeleton
          columns={[...PROBLEM_LIST_COLUMN_LABELS]}
          rowCount={PROBLEM_SET_PAGE_SIZE}
          statusMessage="문제 목록을 불러오는 중입니다."
        />
      ) : (
        <List
          columns={columns}
          data={problemSets}
          emptyMessage="등록된 문제가 없습니다."
          onRowClick={(item) => router.push(`/admin/problems/${item.problemSetId}/edit`)}
          pagination={
            <Pagination
              currentPage={page}
              disabled={isLoading}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          }
          rowKey={(item) => item.problemSetId}
        />
      )}

      <OneButtonModal
        isOpen={modal.open}
        modalContent={modal.content}
        modalTitle={modal.title}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </main>
  );
}
