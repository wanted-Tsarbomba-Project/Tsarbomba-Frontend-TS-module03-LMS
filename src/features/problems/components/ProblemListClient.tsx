"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  LoadingIndicator,
  OneButtonModal,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  DIFFICULTY_MAP,
  getProblemSets,
} from "../actions";
import type { ProblemSetSummary } from "../types";

const problemListClasses = {
  "container": "min-h-screen bg-bg-main p-[30px]",
  "header": "mb-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch",
  "pageTitle": "m-0 text-title-lg font-bold text-text-primary",
  "registerButton": "cursor-pointer rounded-base border border-button-blue-bg bg-button-blue-bg px-[18px] py-2.5 text-description font-semibold text-text-white hover:bg-button-blue-hover-bg max-md:w-full"
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
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, title: "", content: "" });

  const columns = useMemo<ListColumn<ProblemSetSummary>[]>(
    () => [
      {
        key: "problemNumber",
        label: "No.",
        render: (item, index) => item.problemNumber ?? index + 1,
      },
      {
        key: "title",
        label: "문제명",
      },
      {
        key: "description",
        label: "문제 설명",
      },
      {
        key: "difficulty",
        label: "난이도",
        render: (item) =>
          DIFFICULTY_MAP[item.difficulty as keyof typeof DIFFICULTY_MAP] ??
          item.difficulty,
      },
      {
        key: "accuracyRate",
        label: "정답률",
        render: (item) =>
          typeof item.accuracyRate === "number" ? `${item.accuracyRate}%` : "-",
      },
      {
        key: "createdAt",
        label: "등록일",
        render: (item) => formatDate(item.createdAt),
      },
    ],
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchProblemSets = async () => {
      setIsLoading(true);

      try {
        const data = await getProblemSets();

        if (isMounted) {
          setProblemSets(data);
        }
      } catch (error) {
        if (!isMounted) {
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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProblemSets();

    return () => {
      isMounted = false;
    };
  }, [router]);

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
        <LoadingIndicator message="문제 목록을 불러오는 중입니다." />
      ) : (
        <List
          columns={columns}
          data={problemSets}
          emptyMessage="등록된 문제가 없습니다."
          onRowClick={(item) => router.push(`/admin/problems/${item.problemSetId}/edit`)}
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
