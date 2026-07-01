"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  ListSkeleton,
  OneButtonModal,
  Pagination,
  TwoButtonModal,
  type ListColumn,
} from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getAdminAccounts, updateAdminAccountPermission } from "../actions";
import {
  ADMIN_ACCOUNT_LIST_COLUMN_LABELS,
  ADMIN_ACCOUNT_PAGE_SIZE,
} from "../constants";
import { adminMasterClasses } from "../styles";
import type { AdminAccountSummary, AdminPermissionType } from "../types";

const permissionLabels: Record<AdminPermissionType, string> = {
  userManagement: "회원 관리",
  ruleManagement: "규칙 관리",
};

interface PendingPermissionChange {
  account: AdminAccountSummary;
  granted: boolean;
  permissionType: AdminPermissionType;
}

function getPermissionState(
  account: AdminAccountSummary,
  permissionType: AdminPermissionType,
) {
  return Boolean(account.permissionStates?.[permissionType]);
}

function getAccountLabel(account: AdminAccountSummary) {
  return account.nickname ?? account.name ?? account.email ?? "관리자";
}

export default function MasterAccountsClient() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AdminAccountSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pendingChange, setPendingChange] =
    useState<PendingPermissionChange | null>(null);
  const [noticeModal, setNoticeModal] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const result = await getAdminAccounts(
          page,
          ADMIN_ACCOUNT_PAGE_SIZE,
          controller.signal,
        );

        setAccounts(result.data?.items ?? []);
        setTotalPages(result.data?.totalPages ?? 1);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("관리자 계정 목록 조회 실패:", error);
        handleClientError(error, {
          router,
          fallbackTitle: "관리자 계정을 불러오지 못했습니다.",
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

    void fetchAccounts();

    return () => controller.abort();
  }, [page, router]);

  const openPermissionConfirm = (
    account: AdminAccountSummary,
    permissionType: AdminPermissionType,
  ) => {
    setPendingChange({
      account,
      granted: !getPermissionState(account, permissionType),
      permissionType,
    });
  };

  const handlePermissionChange = async () => {
    if (!pendingChange || updating) {
      return;
    }

    setUpdating(true);

    try {
      const result = await updateAdminAccountPermission(
        pendingChange.account.userId,
        pendingChange.permissionType,
        pendingChange.granted,
      );
      const updatedAccount = result.data;

      setAccounts((prev) =>
        prev.map((account) => {
          if (account.userId !== pendingChange.account.userId) {
            return account;
          }

          if (updatedAccount) {
            return {
              ...account,
              ...updatedAccount,
              permissionStates: {
                ...account.permissionStates,
                ...updatedAccount.permissionStates,
              },
            };
          }

          return {
            ...account,
            permissionStates: {
              ...account.permissionStates,
              [pendingChange.permissionType]: pendingChange.granted,
            },
          };
        }),
      );
      setPendingChange(null);
      setNoticeModal({
        isOpen: true,
        title: "권한 변경 완료",
        content: "관리자 권한이 변경되었습니다.",
      });
    } catch (error) {
      handleClientError(error, {
        router,
        fallbackTitle: "권한 변경 실패",
        fallbackMessage: "권한을 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) =>
          setNoticeModal({
            isOpen: true,
            title,
            content,
          }),
      });
    } finally {
      setUpdating(false);
    }
  };

  const accountColumns = useMemo<ListColumn<AdminAccountSummary>[]>(
    () => [
      {
        key: "rowNumber",
        label: ADMIN_ACCOUNT_LIST_COLUMN_LABELS[0],
        render: (_account, index) => page * ADMIN_ACCOUNT_PAGE_SIZE + index + 1,
      },
      { key: "name", label: ADMIN_ACCOUNT_LIST_COLUMN_LABELS[1] },
      { key: "nickname", label: ADMIN_ACCOUNT_LIST_COLUMN_LABELS[2] },
      { key: "email", label: ADMIN_ACCOUNT_LIST_COLUMN_LABELS[3] },
      {
        key: "userManagement",
        label: ADMIN_ACCOUNT_LIST_COLUMN_LABELS[4],
        render: (account) => (
          <PermissionButton
            account={account}
            disabled={updating}
            onClick={openPermissionConfirm}
            permissionType="userManagement"
          />
        ),
      },
      {
        key: "ruleManagement",
        label: ADMIN_ACCOUNT_LIST_COLUMN_LABELS[5],
        render: (account) => (
          <PermissionButton
            account={account}
            disabled={updating}
            onClick={openPermissionConfirm}
            permissionType="ruleManagement"
          />
        ),
      },
    ],
    [page, updating],
  );

  const permissionChangeMessage = pendingChange
    ? `${getAccountLabel(pendingChange.account)} 계정의 ${
        permissionLabels[pendingChange.permissionType]
      } 권한을 ${pendingChange.granted ? "부여" : "회수"}하시겠습니까?`
    : "";

  return (
    <>
      <section className={adminMasterClasses.container}>
        <div className={adminMasterClasses.header}>
          <h1>관리자 관리</h1>
        </div>

        {loading ? (
          <ListSkeleton
            columns={[...ADMIN_ACCOUNT_LIST_COLUMN_LABELS]}
            rowCount={ADMIN_ACCOUNT_PAGE_SIZE}
            statusMessage="관리자 계정을 불러오는 중입니다."
          />
        ) : (
          <List
            columns={accountColumns}
            data={accounts}
            emptyMessage="조회된 관리자 계정이 없습니다."
            pagination={
              <Pagination
                currentPage={page}
                disabled={loading || updating}
                onPageChange={setPage}
                totalPages={totalPages}
              />
            }
            rowKey={(account) => account.userId}
          />
        )}
      </section>

      <TwoButtonModal
        confirmDisabled={updating}
        isOpen={Boolean(pendingChange)}
        modalContent={permissionChangeMessage}
        modalTitle="권한 변경 확인"
        onClose={() => {
          if (!updating) {
            setPendingChange(null);
          }
        }}
        onConfirm={handlePermissionChange}
      />

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

function PermissionButton({
  account,
  disabled,
  onClick,
  permissionType,
}: {
  account: AdminAccountSummary;
  disabled: boolean;
  onClick: (
    account: AdminAccountSummary,
    permissionType: AdminPermissionType,
  ) => void;
  permissionType: AdminPermissionType;
}) {
  const granted = getPermissionState(account, permissionType);

  return (
    <button
      className={
        granted
          ? adminMasterClasses.permissionActive
          : adminMasterClasses.permissionInactive
      }
      disabled={disabled}
      onClick={() => onClick(account, permissionType)}
      type="button"
    >
      {granted ? "활성화" : "비활성화"}
    </button>
  );
}
