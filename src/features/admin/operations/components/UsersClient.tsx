"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { List, OneButtonModal, type ListColumn } from "@/components/common";

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
        setNoticeModal({
          isOpen: true,
          title: "조회 실패",
          content: "회원 목록 조회에 실패했습니다.",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>회원 관리</h1>

        {loading ? (
          <div>로딩 중...</div>
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
