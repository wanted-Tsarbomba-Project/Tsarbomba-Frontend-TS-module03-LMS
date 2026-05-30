"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AlramsClient() {
  const router = useRouter();
  const [type, setType] = useState<TargetType>("PROBLEM");
  const [status, setStatus] = useState<AlertStatus | "">("");
  const [alerts, setAlerts] = useState<OperationAlertSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const result = await getOperationAlerts(type, status);
        setAlerts(result.data.content);
      } catch (error) {
        console.error("알람 목록 조회 실패:", error);
        alert("알람 목록 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    void fetchAlerts();
  }, [type, status]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value as AlertStatus | "");
  };

  return (
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

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No.</th>
              <th>알람 내용</th>
              <th>처리상태</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3}>로딩 중...</td>
              </tr>
            ) : alerts.length > 0 ? (
              alerts.map((alertItem, index) => (
                <tr
                  key={alertItem.operationAlertId}
                  onClick={() =>
                    router.push(`/admin/alrams/${alertItem.operationAlertId}`)
                  }
                >
                  <td>{index + 1}</td>
                  <td>
                    <div className={styles.cellContent}>
                      {alertItem.recommendedAction ?? "-"}
                    </div>
                  </td>
                  <td>{statusLabel[alertItem.status] ?? alertItem.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>조회된 알람이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
