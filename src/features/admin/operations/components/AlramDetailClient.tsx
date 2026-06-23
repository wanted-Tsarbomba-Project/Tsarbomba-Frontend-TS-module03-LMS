"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  LoadingIndicator,
  OneButtonModal,
  TwoButtonModal,
  WarningModal,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  deleteOperationAlert,
  getOperationAlertDetail,
  updateOperationAlertMemo,
  updateOperationAlertStatus,
} from "../actions";
import { alertStatusLabel, operationTargetTypeLabel } from "../constants";
import type { AlertStatus, OperationAlertDetail } from "../types";

const alramDetailClasses = {
  "wrapper": "box-border bg-bg-main p-6 text-body text-text-primary",
  "topBar": "mb-4 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start",
  "status": "text-description text-text-secondary",
  "topActions": "flex flex-wrap gap-2",
  "card": "mb-4 rounded-base border border-border-light bg-bg-box p-4",
  "title": "mt-0 mb-3 text-title-lg text-text-primary",
  "grid": "grid grid-cols-2 gap-3 max-md:grid-cols-1",
  "infoRow": "flex justify-between gap-4 py-1.5 max-md:flex-col max-md:gap-1",
  "infoLabel": "shrink-0 basis-[120px] text-description text-text-secondary max-md:basis-auto",
  "infoValue": "min-w-0 flex-1 text-right text-description text-text-primary [overflow-wrap:anywhere] max-md:text-left",
  "text": "text-description text-text-primary",
  "memoHeader": "flex items-center justify-between gap-4",
  "textarea": "mt-2.5 box-border h-[120px] w-full resize-none rounded-base border border-border-light p-3 text-description text-text-primary outline-none",
  "count": "mt-1 text-right text-xs text-text-secondary",
  "button": "cursor-pointer rounded-base px-3 py-1.5 text-description disabled:cursor-not-allowed disabled:opacity-50",
  "whiteBlueButton": "border border-button-blue-bg bg-bg-box text-text-blue hover:not-disabled:bg-button-blue-bg hover:not-disabled:text-text-white",
  "blueButton": "border-0 bg-button-blue-bg text-text-white hover:not-disabled:bg-button-blue-hover-bg",
  "whiteRedButton": "border border-button-red-bg bg-bg-box text-text-red hover:not-disabled:bg-button-red-bg hover:not-disabled:text-text-white"
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

export default function AlramDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [detail, setDetail] = useState<OperationAlertDetail | null>(null);
  const [adminMemo, setAdminMemo] = useState("");
  const [status, setStatus] = useState<AlertStatus>("OPEN");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noticeModal, setNoticeModal] =
    useState<NoticeModalState>(initialNoticeModal);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    nextStatus: AlertStatus | null;
  }>({
    isOpen: false,
    nextStatus: null,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const result = await getOperationAlertDetail(id);
        const detail = result.data;

        if (!detail) {
          setDetail(null);
          return;
        }

        setDetail(detail);
        setAdminMemo(detail.alert.adminMemo ?? "");
        setStatus(detail.alert.status);
      } catch (error) {
        console.error("알람 상세 조회 실패:", error);
        handleClientError(error, {
          router,
          fallbackTitle: "알람 정보를 불러오지 못했습니다",
          fallbackMessage: "잠시 후 다시 시도해 주세요.",
          showModal: openNoticeModal,
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [id, router]);

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

  const handleMemoSave = async () => {
    if (adminMemo.length > 500) {
      openNoticeModal("입력 확인", "관리자 메모는 500자까지 입력할 수 있습니다.");
      return;
    }

    try {
      setSaving(true);
      await updateOperationAlertMemo(id, adminMemo);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              alert: {
                ...prev.alert,
                adminMemo,
              },
            }
          : prev,
      );
      openNoticeModal("저장 완료", "관리자 메모가 저장되었습니다.");
    } catch (error) {
      console.error("관리자 메모 저장 실패:", error);
      handleClientError(error, {
        router,
        fallbackTitle: "메모를 저장하지 못했습니다",
        fallbackMessage: "잠시 후 다시 시도해 주세요.",
        showModal: openNoticeModal,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusButtonClick = (nextStatus: AlertStatus) => {
    if (nextStatus === status) return;

    setStatusModal({
      isOpen: true,
      nextStatus,
    });
  };

  const handleStatusConfirm = async () => {
    const nextStatus = statusModal.nextStatus;
    if (!nextStatus) return;

    try {
      setSaving(true);
      await updateOperationAlertStatus(id, nextStatus);
      setStatus(nextStatus);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              alert: {
                ...prev.alert,
                status: nextStatus,
              },
            }
          : prev,
      );
      setStatusModal({ isOpen: false, nextStatus: null });
      openNoticeModal("변경 완료", "알람 상태가 변경되었습니다.");
    } catch (error) {
      console.error("알람 상태 변경 실패:", error);
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

  const handleDeleteConfirm = async () => {
    try {
      setSaving(true);
      await deleteOperationAlert(id);
      setDeleteModalOpen(false);
      openNoticeModal("삭제 완료", "알람이 삭제되었습니다.");
      router.push("/admin/alrams");
    } catch (error) {
      console.error("알람 삭제 실패:", error);
      handleClientError(error, {
        router,
        fallbackTitle: "알람을 삭제하지 못했습니다",
        fallbackMessage: "잠시 후 다시 시도해 주세요.",
        showModal: openNoticeModal,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={alramDetailClasses.wrapper}>
        <LoadingIndicator message="알림 정보를 불러오는 중입니다." />
      </div>
    );
  }

  if (!detail) {
    return <div className={alramDetailClasses.wrapper}>알림 정보를 찾을 수 없습니다.</div>;
  }

  const { alert: alertInfo, rule, target, metric, assignee } = detail;

  return (
    <>
      <div className={alramDetailClasses.wrapper}>
        <div className={alramDetailClasses.topBar}>
          <div className={alramDetailClasses.status}>상태: {alertStatusLabel[status] ?? status}</div>

          <div className={alramDetailClasses.topActions}>
            <StatusButton
              disabled={saving || status === "OPEN"}
              label="미처리"
              onClick={() => handleStatusButtonClick("OPEN")}
            />
            <StatusButton
              disabled={saving || status === "RESOLVED"}
              label="처리 완료"
              onClick={() => handleStatusButtonClick("RESOLVED")}
            />
            <StatusButton
              disabled={saving || status === "IGNORED"}
              label="무시"
              onClick={() => handleStatusButtonClick("IGNORED")}
            />
            <button
              className={`${alramDetailClasses.button} ${alramDetailClasses.whiteRedButton}`}
              disabled={saving}
              onClick={() => setDeleteModalOpen(true)}
              type="button"
            >
              삭제하기
            </button>
          </div>
        </div>

        <section className={alramDetailClasses.card}>
          <h1 className={alramDetailClasses.title}>알림 정보</h1>

          <div className={alramDetailClasses.grid}>
            <Info label="알림 ID" value={alertInfo.operationAlertId} />
            <Info label="규칙" value={rule.ruleName} />
            <Info label="규칙 코드" value={rule.ruleCode} />
            <Info label="설명" value={rule.description} />
            <Info
              label="대상"
              value={`${operationTargetTypeLabel[target.targetType] ?? target.targetType} #${
                target.targetId
              }`}
            />
            <Info label="대상명" value={target.title ?? target.nickname} />
            <Info label="상태" value={alertStatusLabel[status] ?? status} />
            <Info label="심각도" value={alertInfo.severity} />
            <Info label="감지 사유" value={alertInfo.reason} />
            <Info label="권장 조치" value={alertInfo.recommendedAction} />
            <Info label="최초 감지" value={formatDateTime(alertInfo.firstDetectedAt)} />
            <Info label="최근 감지" value={formatDateTime(alertInfo.lastDetectedAt)} />
            <Info label="생성일" value={formatDateTime(alertInfo.createdAt)} />
            <Info label="수정일" value={formatDateTime(alertInfo.updatedAt)} />
          </div>
        </section>

        <section className={alramDetailClasses.card}>
          <h2 className={alramDetailClasses.title}>측정 정보</h2>

          <div className={alramDetailClasses.grid}>
            <Info
              label={metric.observedLabel ?? "감지값"}
              value={formatMetric(metric.observedValue, metric.unit)}
            />
            <Info
              label={metric.thresholdLabel ?? "기준값"}
              value={formatMetric(metric.thresholdValue, metric.unit)}
            />
            <Info
              label={rule.minSampleCountLabel ?? "최소 표본 수"}
              value={formatMetric(metric.minSampleCount, metric.minSampleCountUnit)}
            />
            <Info
              label="알림 기준값"
              value={formatMetric(alertInfo.thresholdValueSnapshot, rule.thresholdUnit)}
            />
          </div>
        </section>

        <section className={alramDetailClasses.card}>
          <h2 className={alramDetailClasses.title}>대상 상세</h2>

          <div className={alramDetailClasses.grid}>
            <Info label="문제집" value={target.problemSetTitle} />
            <Info label="강의" value={target.courseTitle} />
            <Info label="회원 닉네임" value={target.nickname} />
            <Info label="회원 이메일" value={target.email} />
            <Info label="대상 상태" value={target.status} />
          </div>
        </section>

        <section className={alramDetailClasses.card}>
          <h2 className={alramDetailClasses.title}>담당자</h2>
          <div className={alramDetailClasses.text}>
            {assignee
              ? `${assignee.name ?? "-"} (${assignee.email ?? "-"})`
              : "담당자가 지정되지 않았습니다."}
          </div>
        </section>

        <section className={alramDetailClasses.card}>
          <div className={alramDetailClasses.memoHeader}>
            <h2 className={alramDetailClasses.title}>관리자 메모</h2>

            <button
              className={`${alramDetailClasses.button} ${alramDetailClasses.blueButton}`}
              disabled={saving}
              onClick={() => void handleMemoSave()}
              type="button"
            >
              저장
            </button>
          </div>

          <textarea
            className={alramDetailClasses.textarea}
            maxLength={500}
            onChange={(event) => setAdminMemo(event.target.value)}
            placeholder="관리자 메모를 입력하세요."
            value={adminMemo}
          />

          <div className={alramDetailClasses.count}>{adminMemo.length}/500</div>
        </section>
      </div>

      <TwoButtonModal
        cancelDisabled={saving}
        confirmDisabled={saving}
        isOpen={statusModal.isOpen}
        modalContent={`${alertStatusLabel[statusModal.nextStatus ?? status]} 상태로 변경합니다.`}
        modalTitle="상태를 변경하시겠습니까?"
        onClose={() => setStatusModal({ isOpen: false, nextStatus: null })}
        onConfirm={() => void handleStatusConfirm()}
      />

      <WarningModal
        cancelDisabled={saving}
        confirmDisabled={saving}
        isOpen={deleteModalOpen}
        modalContent="삭제된 알람은 되돌릴 수 없습니다."
        modalTitle="알람을 삭제하시겠습니까?"
        onClose={() => {
          if (!saving) setDeleteModalOpen(false);
        }}
        onConfirm={() => void handleDeleteConfirm()}
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

function StatusButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`${alramDetailClasses.button} ${alramDetailClasses.whiteBlueButton}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: number | string | null;
}) {
  return (
    <div className={alramDetailClasses.infoRow}>
      <div className={alramDetailClasses.infoLabel}>{label}</div>
      <div className={alramDetailClasses.infoValue}>{value ?? "-"}</div>
    </div>
  );
}

function formatMetric(value?: number | null, unit?: string | null) {
  if (value === null || value === undefined) return "-";
  return `${value}${unit ?? ""}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}
