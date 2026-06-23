"use client";

// CSR - 회원 문제 목록 테이블: 서버에서 받은 목록 props를 그대로 렌더링하고 행 클릭 라우팅만 클라이언트에서 처리함
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  OneButtonModal,
  type ListColumn,
} from "@/components/common";

import { DIFFICULTY_MAP } from "../actions";
import type { ProblemSetSummary } from "../types";

const userProblemListClasses = {
  "container": "min-h-screen bg-bg-main py-[30px] max-md:py-6",
  "pageTitle": "mt-0 mb-5 text-title-lg font-bold text-text-primary"
} as const;


interface UserProblemListClientProps {
  initialProblemSets: ProblemSetSummary[];
}

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

export default function UserProblemListClient({
  initialProblemSets,
}: UserProblemListClientProps) {
  const router = useRouter();

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

  return (
    <main className={userProblemListClasses.container}>
      <h2 className={userProblemListClasses.pageTitle}>문제풀이</h2>

      <List
        columns={columns}
        data={initialProblemSets}
        emptyMessage="등록된 문제가 없습니다."
        onRowClick={(item) => router.push(`/problems/${item.problemSetId}`)}
        rowKey={(item) => item.problemSetId}
      />

      <OneButtonModal
        isOpen={modal.open}
        modalContent={modal.content}
        modalTitle={modal.title}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </main>
  );
}
