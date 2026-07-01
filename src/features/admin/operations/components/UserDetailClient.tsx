"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  List,
  ListSkeleton,
  OneButtonModal,
  TwoButtonModal,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  getAdminUserDetail,
  getUserCourseProgress,
  getUserProblemList,
  toggleUserLock,
} from "../actions";
import {
  USER_DETAIL_COURSE_COLUMN_LABELS,
  USER_DETAIL_PROBLEM_COLUMN_LABELS,
} from "../constants";
import type {
  AdminUserDetail,
  UserCourseRow,
  UserDetailTab,
  UserProblemSubmission,
} from "../types";
import UserDetailSkeleton from "./UserDetailSkeleton";

const userDetailClasses = {
  "container": "box-border min-h-screen p-6 text-text-primary",
  "pageHeader": "mb-7 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch",
  "pageTitle": "m-0 text-[30px] font-bold",
  "headerButtonGroup": "flex gap-2.5 max-md:flex-wrap",
  "grayButton": "cursor-pointer rounded-[10px] border-0 bg-[#e5e5e5] px-[18px] py-3 text-[15px] font-semibold transition duration-200 hover:not-disabled:bg-[#d9d9d9] disabled:cursor-not-allowed disabled:opacity-60",
  "infoSection": "mb-10",
  "row": "flex gap-5 max-md:flex-col max-md:items-stretch",
  "inputGroup": "mb-6 flex flex-1 flex-col [&>label]:mb-2.5 [&>label]:text-[15px] [&>label]:font-semibold [&>label]:text-[#666666]",
  "readonlyBox": "flex min-h-[52px] items-center rounded-[10px] border border-[#dedede] bg-bg-box px-4 text-[15px]",
  "tabGroup": "mt-5 mb-2.5 flex gap-2.5",
  "tabButton": "h-9 w-[100px] cursor-pointer rounded-base border border-button-blue-bg bg-bg-box text-body font-medium text-text-primary",
  "active": "border-0 bg-button-blue-bg text-text-white",
  "listSection": "overflow-hidden rounded-xl border border-[#e5e5e5] bg-bg-box"
} as const;


interface NoticeModalState {
  isOpen: boolean;
  title: string;
  content: string;
}

const initialNoticeModal: NoticeModalState = {
  isOpen: false,
  title: "",
  content: "",
};

const courseColumns: ListColumn<UserCourseRow>[] = [
  { key: "index", label: USER_DETAIL_COURSE_COLUMN_LABELS[0] },
  { key: "title", label: USER_DETAIL_COURSE_COLUMN_LABELS[1] },
  // 진행률은 수강 목록 API 응답에 포함되지 않아 표시하지 않습니다.
  {
    key: "date",
    label: USER_DETAIL_COURSE_COLUMN_LABELS[2],
    render: (course) => formatDate(course.date),
  },
];

const problemColumns: ListColumn<UserProblemSubmission>[] = [
  { key: "index", label: USER_DETAIL_PROBLEM_COLUMN_LABELS[0] },
  { key: "problemTitle", label: USER_DETAIL_PROBLEM_COLUMN_LABELS[1] },
  { key: "submissionStatus", label: USER_DETAIL_PROBLEM_COLUMN_LABELS[2] },
  {
    key: "submittedAt",
    label: USER_DETAIL_PROBLEM_COLUMN_LABELS[3],
    render: (problem) => formatDate(problem.submittedAt),
  },
];
export default function UserDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [tab, setTab] = useState<UserDetailTab>("COURSE");
  const [courseRows, setCourseRows] = useState<UserCourseRow[]>([]);
  const [problemRows, setProblemRows] = useState<UserProblemSubmission[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [noticeModal, setNoticeModal] =
    useState<NoticeModalState>(initialNoticeModal);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        const result = await getAdminUserDetail(userId);
        setUser(result.data ?? null);
      } catch (error) {
        console.error("회원 상세 조회 실패:", error);
        handleClientError(error, {
          router,
          fallbackTitle: "회원 정보를 불러오지 못했습니다",
          fallbackMessage: "잠시 후 다시 시도해 주세요.",
          showModal: openNoticeModal,
        });
      } finally {
        setUserLoading(false);
      }
    };

    void fetchUser();
  }, [router, userId]);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setListLoading(true);

        if (tab === "COURSE") {
          const result = await getUserCourseProgress(userId);
          const data = result.data ?? [];

          setCourseRows(
            data.map((course) => ({
              enrollmentId: course.enrollmentId,
              courseId: course.courseId,
              title: course.courseTitle,
              date: course.enrolledAt,
            })),
          );
          return;
        }

        const result = await getUserProblemList(userId);
        setProblemRows(result.data?.submissions ?? []);
      } catch (error) {
        console.error("회원 상세 목록 조회 실패:", error);
        handleClientError(error, {
          router,
          fallbackTitle: "목록을 불러오지 못했습니다",
          fallbackMessage: "잠시 후 다시 시도해 주세요.",
          showModal: openNoticeModal,
        });
      } finally {
        setListLoading(false);
      }
    };

    void fetchList();
  }, [router, tab, userId]);

  function openNoticeModal(title: string, content: string) {
    setNoticeModal({
      isOpen: true,
      title,
      content,
    });
  }

  const closeNoticeModal = () => {
    setNoticeModal(initialNoticeModal);
  };

  const handleLockConfirm = async () => {
    if (saving || !user) return;

    try {
      setSaving(true);
      const nextLocked = !user.isLocked;
      await toggleUserLock(userId, nextLocked);
      setUser((prev) => (prev ? { ...prev, isLocked: nextLocked } : prev));
      setLockModalOpen(false);
      openNoticeModal(
        nextLocked ? "계정이 비활성화되었습니다." : "계정이 활성화되었습니다.",
        nextLocked
          ? "해당 회원의 계정이 비활성화되었습니다."
          : "해당 회원의 계정이 활성화되었습니다.",
      );
    } catch (error) {
      console.error("회원 상태 변경 실패:", error);
      handleClientError(error, {
        router,
        fallbackTitle: "상태를 변경하지 못했습니다",
        fallbackMessage: "잠시 후 다시 시도해 주세요.",
        showModal: openNoticeModal,
      });
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || !user) {
    return <UserDetailSkeleton />;
  }

  const nextLockLabel = user.isLocked ? "잠금해제" : "계정잠금";

  return (
    <>
      <div className={userDetailClasses.container}>
        <div className={userDetailClasses.pageHeader}>
          <h1 className={userDetailClasses.pageTitle}>회원 상세조회</h1>

          <div className={userDetailClasses.headerButtonGroup}>
            <button
              className={userDetailClasses.grayButton}
              disabled={saving}
              onClick={() => setLockModalOpen(true)}
              type="button"
            >
              {saving ? "처리 중..." : nextLockLabel}
            </button>

            <button
              className={userDetailClasses.grayButton}
              onClick={() => router.push("/admin/users")}
              type="button"
            >
              목록으로
            </button>
          </div>
        </div>

        <section className={userDetailClasses.infoSection}>
          <div className={userDetailClasses.row}>
            <ReadonlyField label="이름" value={user.name} />
            <ReadonlyField label="닉네임" value={user.nickname ?? "-"} />
          </div>

          <div className={userDetailClasses.row}>
            <ReadonlyField label="이메일" value={user.email} />
            <ReadonlyField label="전화번호" value={user.phone} />
          </div>

          <ReadonlyField label="역할" value={user.role} />
          <ReadonlyField
            label="계정 상태"
            value={user.isLocked ? "비활성" : "활성"}
          />
        </section>

        <div className={userDetailClasses.tabGroup}>
          <button
            className={`${userDetailClasses.tabButton} ${
              tab === "COURSE" ? userDetailClasses.active : ""
            }`}
            onClick={() => setTab("COURSE")}
            type="button"
          >
            강의목록
          </button>

          <button
            className={`${userDetailClasses.tabButton} ${
              tab === "PROBLEM" ? userDetailClasses.active : ""
            }`}
            onClick={() => setTab("PROBLEM")}
            type="button"
          >
            문제목록
          </button>
        </div>

        <div className={userDetailClasses.listSection}>
          {listLoading ? (
            <ListSkeleton
              columns={
                tab === "COURSE"
                  ? [...USER_DETAIL_COURSE_COLUMN_LABELS]
                  : [...USER_DETAIL_PROBLEM_COLUMN_LABELS]
              }
              statusMessage="목록을 불러오는 중입니다."
              withPagination={false}
            />
          ) : tab === "COURSE" ? (
            <List
              columns={courseColumns}
              data={courseRows}
              emptyMessage="조회된 강의가 없습니다."
              rowKey={(course, index) => course.enrollmentId ?? course.courseId ?? index}
              scrollable={false}
            />
          ) : (
            <List
              columns={problemColumns}
              data={problemRows}
              emptyMessage="조회된 문제가 없습니다."
              rowKey={(problem, index) => `${problem.problemId ?? "problem"}-${index}`}
              scrollable={false}
            />
          )}
        </div>
      </div>

      <TwoButtonModal
        cancelDisabled={saving}
        confirmDisabled={saving}
        isOpen={lockModalOpen}
        modalContent={`${nextLockLabel} 상태로 변경합니다.`}
        modalTitle={`회원 계정을 ${nextLockLabel}하시겠습니까?`}
        onClose={() => {
          if (!saving) setLockModalOpen(false);
        }}
        onConfirm={() => void handleLockConfirm()}
      />

      <OneButtonModal
        isOpen={noticeModal.isOpen}
        modalContent={noticeModal.content}
        modalTitle={noticeModal.title}
        onClose={closeNoticeModal}
      />
    </>
  );
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className={userDetailClasses.inputGroup}>
      <label>{label}</label>
      <div className={userDetailClasses.readonlyBox}>{value ?? ""}</div>
    </div>
  );
}

function formatDate(value?: string | null) {
  return value?.split("T")[0] ?? "-";
}
