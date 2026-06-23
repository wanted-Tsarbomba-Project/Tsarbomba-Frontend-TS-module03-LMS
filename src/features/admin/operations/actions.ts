import { requestAdminOperation } from "./api";
import type {
  AlertStatus,
  AdminUserDetail,
  AdminUserSummary,
  AutomationRule,
  OperationAlertDetail,
  OperationAlertSummary,
  PageResponse,
  TargetType,
  UserCourseProgressResponse,
  UserProblemSubmission,
} from "./types";

export async function getAutomationRules() {
  return requestAdminOperation<AutomationRule[]>("/api/v1/admin/automation-rules");
}

export async function updateAutomationRules(rules: AutomationRule[]) {
  return requestAdminOperation<unknown>("/api/v1/admin/automation-rules", {
    method: "PATCH",
    body: JSON.stringify({
      rules: rules.map((rule) => ({
        operationRuleId: rule.operationRuleId,
        thresholdValue: Number(rule.thresholdValue),
        minSampleCount:
          rule.minSampleCount !== null && rule.minSampleCount !== ""
            ? Number(rule.minSampleCount)
            : null,
      })),
    }),
  });
}

export async function updateAutomationRuleEnabled(
  operationRuleId: number,
  enabled: boolean,
) {
  return requestAdminOperation<unknown>(
    `/api/v1/admin/automation-rules/${operationRuleId}/enabled`,
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    },
  );
}

export async function getOperationAlerts(
  targetType: TargetType,
  status: AlertStatus | "",
  page = 0,
  size = 20,
) {
  const params = new URLSearchParams({
    targetType,
    page: String(page),
    size: String(size),
  });

  if (status) {
    params.set("status", status);
  }

  return requestAdminOperation<PageResponse<OperationAlertSummary>>(
    `/api/v1/admin/operation-alerts?${params.toString()}`,
  );
}

export async function getOperationAlertDetail(operationAlertId: string) {
  return requestAdminOperation<OperationAlertDetail>(
    `/api/v1/admin/operation-alerts/${operationAlertId}`,
  );
}

export async function updateOperationAlertMemo(
  operationAlertId: string,
  adminMemo: string,
) {
  return requestAdminOperation<unknown>(
    `/api/v1/admin/operation-alerts/${operationAlertId}/memo`,
    {
      method: "PATCH",
      body: JSON.stringify({ adminMemo }),
    },
  );
}

export async function updateOperationAlertStatus(
  operationAlertId: string,
  status: AlertStatus,
) {
  return requestAdminOperation<unknown>(
    `/api/v1/admin/operation-alerts/${operationAlertId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export async function deleteOperationAlert(operationAlertId: string) {
  return requestAdminOperation<unknown>(
    `/api/v1/admin/operation-alerts/${operationAlertId}`,
    {
      method: "DELETE",
    },
  );
}

const USER_SEARCH_FETCH_CONCURRENCY = 8;

export async function getAdminUsers(
  page = 0,
  size = 20,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return requestAdminOperation<PageResponse<AdminUserSummary>>(
    `/api/v1/users?${params.toString()}`,
    { signal },
  );
}

<<<<<<< Updated upstream
=======
export async function getAllAdminUsers(size = 20, signal?: AbortSignal) {
  const firstPage = await getAdminUsers(0, size, signal);
  const totalPages = firstPage.data.totalPages ?? 1;

  if (totalPages <= 1) {
    return firstPage.data.content;
  }

  const pageIndexes = Array.from(
    { length: totalPages - 1 },
    (_, index) => index + 1,
  );
  const restPages: Array<Awaited<ReturnType<typeof getAdminUsers>>> = [];

  for (
    let index = 0;
    index < pageIndexes.length;
    index += USER_SEARCH_FETCH_CONCURRENCY
  ) {
    if (signal?.aborted) {
      break;
    }

    const pageChunk = pageIndexes.slice(
      index,
      index + USER_SEARCH_FETCH_CONCURRENCY,
    );
    const chunkResults = await Promise.all(
      pageChunk.map((page) => getAdminUsers(page, size, signal)),
    );

    restPages.push(...chunkResults);
  }

  return [
    ...firstPage.data.content,
    ...restPages.flatMap((result) => result.data.content),
  ];
}

>>>>>>> Stashed changes
export async function getAdminUserDetail(userId: string) {
  return requestAdminOperation<AdminUserDetail>(`/api/v1/admin/users/${userId}`);
}

export async function getUserCourseProgress(userId: string) {
  return requestAdminOperation<UserCourseProgressResponse[]>(
    `/api/v1/users/${userId}/enrollments`,
  );
}

export async function getUserProblemList(userId: string) {
  return requestAdminOperation<{ submissions: UserProblemSubmission[] }>(
    `/api/v1/admin/students/${userId}/problems`,
  );
}

export async function toggleUserLock(userId: string, locked: boolean) {
  return requestAdminOperation<unknown>(`/api/v1/users/${userId}/lock`, {
    method: "PATCH",
    body: JSON.stringify({ locked }),
  });
}
