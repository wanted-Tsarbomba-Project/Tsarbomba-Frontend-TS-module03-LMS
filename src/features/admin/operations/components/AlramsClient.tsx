"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  ListSkeleton,
  OneButtonModal,
  Pagination,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getOperationAlerts } from "../actions";
import {
  ALERT_PAGE_SIZE,
  ALERT_LIST_COLUMN_LABELS,
  alertStatusLabel,
  alertTargetTabs,
} from "../constants";
import { adminAlramListClasses } from "../styles";
import type { AlertStatus, OperationAlertSummary, TargetType } from "../types";

const alertColumns: ListColumn<OperationAlertSummary>[] = [
  { key: "index", label: ALERT_LIST_COLUMN_LABELS[0] },
  { key: "recommendedAction", label: ALERT_LIST_COLUMN_LABELS[1] },
  {
    key: "status",
    label: ALERT_LIST_COLUMN_LABELS[2],
    render: (alert) => alertStatusLabel[alert.status] ?? alert.status,
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
        const result = await getOperationAlerts(
          type,
          status,
          page,
          ALERT_PAGE_SIZE,
        );

        setAlerts(result.data?.content ?? []);
        setTotalPages(result.data?.totalPages ?? 1);
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
      <div className={adminAlramListClasses.container}>
        <div className={adminAlramListClasses.header}>
          <h1>알람 관리</h1>

          <select
            className={adminAlramListClasses.statusSelect}
            onChange={handleStatusChange}
            value={status}
          >
            <option value="">전체</option>
            <option value="OPEN">미처리</option>
            <option value="RESOLVED">처리 완료</option>
            <option value="IGNORED">무시됨</option>
          </select>
        </div>

        <div className={adminAlramListClasses.typeButtonGroup}>
          {alertTargetTabs.map((tab) => (
            <button
              className={`${adminAlramListClasses.typeButton} ${
                type === tab.value ? adminAlramListClasses.active : ""
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
          <ListSkeleton
            columns={[...ALERT_LIST_COLUMN_LABELS]}
            rowCount={ALERT_PAGE_SIZE}
            statusMessage="알람 목록을 불러오는 중입니다."
          />
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
            rowNumberOffset={page * ALERT_PAGE_SIZE}
            rowKey={(alert) => alert.operationAlertId}
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
