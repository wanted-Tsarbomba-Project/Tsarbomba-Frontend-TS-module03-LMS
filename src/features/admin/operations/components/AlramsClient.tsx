"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { List, OneButtonModal, type ListColumn } from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getOperationAlerts } from "../api";
import type { AlertStatus, OperationAlertSummary, TargetType } from "../types";

import styles from "@/app/admin/alrams/page.module.css";

const statusLabel: Record<AlertStatus, string> = {
  OPEN: "미처리",
  RESOLVED: "처리 완료",
  IGNORED: "무시됨",
};

const targetTabs: Array<{ label: string; value: TargetType }> = [
  { label: "문제", value: "PROBLEM" },
  { label: "회원", value: "USER" },
  { label: "강좌", value: "COURSE" },
];

const alertColumns: ListColumn<OperationAlertSummary>[] = [
  { key: "index", label: "No." },
  { key: "recommendedAction", label: "알람 내용" },
  {
    key: "status",
    label: "처리상태",
    render: (alert) => statusLabel[alert.status] ?? alert.status,
  },
];

export default function AlramsClient() {
  const router = useRouter();
  const [type, setType] = useState<TargetType>("PROBLEM");
  const [status, setStatus] = useState<AlertStatus | "">("");
  const [alerts, setAlerts] = useState<OperationAlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [noticeModal, setNoticeModal] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const result = await getOperationAlerts(type, status);
        setAlerts(result.data.content);
      } catch (error) {
        console.error("알람 목록 조회 실패:", error);
        handleClientError(error, {
          router,
          fallbackTitle: "알람을 불러오지 못했습니다",
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

    void fetchAlerts();
  }, [router, type, status]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value as AlertStatus | "");
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>알람 관리</h1>

          <select
            className={styles.statusSelect}
            onChange={handleStatusChange}
            value={status}
          >
            <option value="">전체</option>
            <option value="OPEN">미처리</option>
            <option value="RESOLVED">처리 완료</option>
            <option value="IGNORED">무시됨</option>
          </select>
        </div>

        <div className={styles.typeButtonGroup}>
          {targetTabs.map((tab) => (
            <button
              className={`${styles.typeButton} ${
                type === tab.value ? styles.active : ""
              }`}
              key={tab.value}
              onClick={() => setType(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <List
            columns={alertColumns}
            data={alerts}
            emptyMessage="조회된 알람이 없습니다."
            onRowClick={(alert) =>
              router.push(`/admin/alrams/${alert.operationAlertId}`)
            }
            rowKey={(alert) => alert.operationAlertId}
          />
        )}
      </div>

      <OneButtonModal
        isOpen={noticeModal.isOpen}
        modalContent={noticeModal.content}
        modalTitle={noticeModal.title}
        onClose={() => setNoticeModal({ isOpen: false, title: "", content: "" })}
      />
    </>
  );
}
