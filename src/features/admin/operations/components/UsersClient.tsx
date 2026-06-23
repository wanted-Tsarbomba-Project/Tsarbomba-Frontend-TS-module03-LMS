"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  LoadingIndicator,
  OneButtonModal,
  Searchbar,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getAdminUsers, getAllAdminUsers } from "../actions";
import { adminUserListClasses } from "../styles";
import type { AdminUserSummary } from "../types";

const userColumns: ListColumn<AdminUserSummary>[] = [
  { key: "index", label: "No." },
  { key: "name", label: "이름" },
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

function matchesUserName(user: AdminUserSummary, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return (user.name ?? "").toLowerCase().includes(normalizedKeyword);
}

export default function UsersClient() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [noticeModal, setNoticeModal] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const normalizedKeyword = keyword.trim();

        if (normalizedKeyword) {
          const allUsers = await getAllAdminUsers(20, controller.signal);

          if (controller.signal.aborted) {
            return;
          }

          setUsers(
            allUsers.filter((user) => matchesUserName(user, normalizedKeyword)),
          );
          return;
        }

        const result = await getAdminUsers(0, 20, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setUsers(result.data.content);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      controller.abort();
    };
  }, [keyword, router]);

  return (
    <>
      <div className={adminUserListClasses.container}>
        <div className={adminUserListClasses.header}>
          <h1 className={adminUserListClasses.title}>회원 관리</h1>

          <div className={adminUserListClasses.searchWrap}>
            <Searchbar
              className="max-w-[260px]"
              onChange={setSearchInput}
              onSearch={setKeyword}
              placeholder="회원 이름 검색"
              value={searchInput}
            />
          </div>
        </div>

        {loading ? (
          <LoadingIndicator message="회원 목록을 불러오는 중입니다." />
        ) : (
          <List
            columns={userColumns}
            data={users}
            emptyMessage={
              keyword.trim()
                ? "검색 조건에 맞는 회원이 없습니다."
                : "조회된 회원이 없습니다."
            }
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
