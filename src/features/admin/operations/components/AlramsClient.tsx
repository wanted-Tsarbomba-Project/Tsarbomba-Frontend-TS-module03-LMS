"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  LoadingIndicator,
  OneButtonModal,
  Pagination,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getOperationAlerts } from "../api";
import type { AlertStatus, OperationAlertSummary, TargetType } from "../types";

const PAGE_SIZE = 20;

const alramListClasses = {
  container: "box-border p-6 text-text-primary",
  header:
    "mb-5 flex items-center justify-between gap-4 [&_h1]:m-0 [&_h1]:text-2xl [&_h1]:font-bold",
  statusSelect:
    "h-9 w-[120px] rounded-base border border-button-blue-bg bg-bg-box px-2.5 text-description text-text-primary",
  typeButtonGroup: "mb-5 flex gap-2.5",
  typeButton:
    "h-9 w-[88px] cursor-pointer rounded-base border border-button-blue-bg bg-bg-box text-center text-body font-medium leading-6 text-text-primary",
  active: "border-0 bg-button-blue-bg text-text-white",
} as const;

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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
        const result = await getOperationAlerts(type, status, page, PAGE_SIZE);

        setAlerts(result.data.content);
        setTotalPages(result.data.totalPages ?? 1);
      } catch (error) {
        console.error("알람 목록 조회 실패:", error);
        handleClientError(error, {
          router,
          fallbackTitle: "알람을 불러오지 못했습니다.",
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
  }, [page, router, type, status]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPage(0);
    setStatus(event.target.value as AlertStatus | "");
  };

  const handleTargetTypeChange = (nextType: TargetType) => {
    setPage(0);
    setType(nextType);
  };

  return (
    <>
      <div className={alramListClasses.container}>
        <div className={alramListClasses.header}>
          <h1>알람 관리</h1>

          <select
            className={alramListClasses.statusSelect}
            onChange={handleStatusChange}
            value={status}
          >
            <option value="">전체</option>
            <option value="OPEN">미처리</option>
            <option value="RESOLVED">처리 완료</option>
            <option value="IGNORED">무시됨</option>
          </select>
        </div>

        <div className={alramListClasses.typeButtonGroup}>
          {targetTabs.map((tab) => (
            <button
              className={`${alramListClasses.typeButton} ${
                type === tab.value ? alramListClasses.active : ""
              }`}
              key={tab.value}
              onClick={() => handleTargetTypeChange(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingIndicator message="알람 목록을 불러오는 중입니다." />
        ) : (
          <List
            columns={alertColumns}
            data={alerts}
            emptyMessage="조회된 알람이 없습니다."
            onRowClick={(alert) =>
              router.push(`/admin/alrams/${alert.operationAlertId}`)
            }
            pagination={
              <Pagination
                currentPage={page}
                disabled={loading}
                onPageChange={setPage}
                totalPages={totalPages}
              />
            }
            rowKey={(alert) => alert.operationAlertId}
          />
        )}
      </div>

      <OneButtonModal
        isOpen={noticeModal.isOpen}
        modalContent={noticeModal.content}
        modalTitle={noticeModal.title}
        onClose={() =>
          setNoticeModal({ isOpen: false, title: "", content: "" })
        }
      />
    </>
  );
}
