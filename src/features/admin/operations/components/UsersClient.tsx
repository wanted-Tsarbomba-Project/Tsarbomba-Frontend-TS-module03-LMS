"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  LoadingIndicator,
  OneButtonModal,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getAdminUsers } from "../api";
import type { AdminUserSummary } from "../types";

import styles from "@/app/admin/users/page.module.css";

const userColumns: ListColumn<AdminUserSummary>[] = [
  { key: "index", label: "No." },
  { key: "nickname", label: "닉네임" },
  { key: "email", label: "이메일" },
  {
    key: "createdAt",
    label: "가입일",
    render: (user) => formatDate(user.createdAt),
  },
  {
    key: "isLocked",
    label: "상태",
    render: (user) => (user.isLocked ? "비활성" : "활성"),
  },
];

export default function UsersClient() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [noticeModal, setNoticeModal] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const result = await getAdminUsers();
        setUsers(result.data.content);
      } catch (error) {
        console.error("회원 목록 조회 실패:", error);
        handleClientError(error, {
          router,
          fallbackTitle: "회원 목록을 불러오지 못했습니다",
          fallbackMessage: "잠시 후 다시 시도해 주세요.",
          showModal: (title, content) =>
            setNoticeModal({
              isOpen: true,
              title,
              content,
            }),
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, [router]);

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>회원 관리</h1>

        {loading ? (
          <LoadingIndicator message="회원 목록을 불러오는 중입니다." />
        ) : (
          <List
            columns={userColumns}
            data={users}
            emptyMessage="조회된 회원이 없습니다."
            onRowClick={(user) => router.push(`/admin/users/${user.userId}`)}
            rowKey={(user) => user.userId}
          />
        )}
      </div>

      <OneButtonModal
        isOpen={noticeModal.isOpen}
        modalContent={noticeModal.content}
        modalTitle={noticeModal.title}
        onClose={() =>
          setNoticeModal({
            isOpen: false,
            title: "",
            content: "",
          })
        }
      />
    </>
  );
}

function formatDate(value?: string | null) {
  return value?.split("T")[0] ?? "-";
}
