"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  List,
  LoadingIndicator,
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
} from "../api";
import type {
  AdminUserDetail,
  UserCourseRow,
  UserDetailTab,
  UserProblemSubmission,
} from "../types";

import styles from "@/app/admin/users/[id]/page.module.css";

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
  { key: "index", label: "No." },
  { key: "title", label: "강의명" },
  {
    key: "progress",
    label: "진행률",
    render: (course) => `${course.progress ?? 0}%`,
  },
  {
    key: "date",
    label: "등록일",
    render: (course) => formatDate(course.date),
  },
];

const problemColumns: ListColumn<UserProblemSubmission>[] = [
  { key: "index", label: "No." },
  { key: "problemTitle", label: "문제명" },
  { key: "submissionStatus", label: "결과" },
  {
    key: "submittedAt",
    label: "제출일",
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
        setUser(result.data);
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
          const data = result.data;

          setCourseRows([
            {
              courseId: data.courseId,
              title: data.courseTitle,
              progress: data.averageLearningRate,
              date: data.updatedAt,
            },
          ]);
          return;
        }

        const result = await getUserProblemList(userId);
        setProblemRows(result.data.submissions ?? []);
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
    return (
      <div className={styles.container}>
        <LoadingIndicator message="회원 정보를 불러오는 중입니다." />
      </div>
    );
  }

  const nextLockLabel = user.isLocked ? "잠금해제" : "계정잠금";

  return (
    <>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>회원 상세조회</h1>

          <div className={styles.headerButtonGroup}>
            <button
              className={styles.grayButton}
              disabled={saving}
              onClick={() => setLockModalOpen(true)}
              type="button"
            >
              {saving ? "처리 중..." : nextLockLabel}
            </button>

            <button
              className={styles.grayButton}
              onClick={() => router.push("/admin/users")}
              type="button"
            >
              목록으로
            </button>
          </div>
        </div>

        <section className={styles.infoSection}>
          <div className={styles.row}>
            <ReadonlyField label="이름" value={user.name} />
            <ReadonlyField label="닉네임" value={user.nickname ?? "-"} />
          </div>

          <div className={styles.row}>
            <ReadonlyField label="이메일" value={user.email} />
            <ReadonlyField label="전화번호" value={user.phone} />
          </div>

          <ReadonlyField label="역할" value={user.role} />
          <ReadonlyField
            label="계정 상태"
            value={user.isLocked ? "비활성" : "활성"}
          />
        </section>

        <div className={styles.tabGroup}>
          <button
            className={`${styles.tabButton} ${
              tab === "COURSE" ? styles.active : ""
            }`}
            onClick={() => setTab("COURSE")}
            type="button"
          >
            강의목록
          </button>

          <button
            className={`${styles.tabButton} ${
              tab === "PROBLEM" ? styles.active : ""
            }`}
            onClick={() => setTab("PROBLEM")}
            type="button"
          >
            문제목록
          </button>
        </div>

        <div className={styles.listSection}>
          {listLoading ? (
            <LoadingIndicator message="목록을 불러오는 중입니다." />
          ) : tab === "COURSE" ? (
            <List
              columns={courseColumns}
              data={courseRows}
              emptyMessage="조회된 강의가 없습니다."
              rowKey={(course, index) => course.courseId ?? index}
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
    <div className={styles.inputGroup}>
      <label>{label}</label>
      <div className={styles.readonlyBox}>{value ?? ""}</div>
    </div>
  );
}

function formatDate(value?: string | null) {
  return value?.split("T")[0] ?? "-";
}
