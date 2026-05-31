import type {
  AlertStatus,
  AdminUserDetail,
  AdminUserSummary,
  ApiResponse,
  AutomationRule,
  OperationAlertDetail,
  OperationAlertSummary,
  PageResponse,
  TargetType,
  UserCourseProgressResponse,
  UserProblemSubmission,
} from "./types";
import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const JSON_HEADERS = { "Content-Type": "application/json" };

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...JSON_HEADERS,
        ...init.headers,
      },
    });
  } catch (error) {
    throw new ApiClientError(
      {
        message:
          error instanceof Error
            ? error.message
            : "요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        path,
      },
      "요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw createApiError(response, text, path);
  }

  if (!text) {
    return { data: undefined as T };
  }

  return JSON.parse(text) as ApiResponse<T>;
}

function createApiError(response: Response, text: string, requestPath: string) {
  const fallbackMessage = "요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

  if (!text) {
    return new ApiClientError(
      {
        status: response.status,
        message: fallbackMessage,
        path: requestPath,
      },
      fallbackMessage,
    );
  }

  try {
    const payload = JSON.parse(text) as BackendErrorPayload;

    return new ApiClientError(
      {
        ...payload,
        status: payload.status ?? response.status,
        path: payload.path ?? requestPath,
      },
      fallbackMessage,
    );
  } catch {
    return new ApiClientError(
      {
        status: response.status,
        message: text || fallbackMessage,
        path: requestPath,
      },
      fallbackMessage,
    );
  }
}

export async function getAutomationRules() {
  return request<AutomationRule[]>("/api/v1/admin/automation-rules");
}

export async function updateAutomationRules(rules: AutomationRule[]) {
  return request<unknown>("/api/v1/admin/automation-rules", {
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
  return request<unknown>(
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

  return request<PageResponse<OperationAlertSummary>>(
    `/api/v1/admin/operation-alerts?${params.toString()}`,
  );
}

export async function getOperationAlertDetail(operationAlertId: string) {
  return request<OperationAlertDetail>(
    `/api/v1/admin/operation-alerts/${operationAlertId}`,
  );
}

export async function updateOperationAlertMemo(
  operationAlertId: string,
  adminMemo: string,
) {
  return request<unknown>(
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
  return request<unknown>(
    `/api/v1/admin/operation-alerts/${operationAlertId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export async function deleteOperationAlert(operationAlertId: string) {
  return request<unknown>(
    `/api/v1/admin/operation-alerts/${operationAlertId}`,
    {
      method: "DELETE",
    },
  );
}

export async function getAdminUsers(page = 0, size = 20) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return request<PageResponse<AdminUserSummary>>(
    `/api/v1/users?${params.toString()}`,
  );
}

export async function getAdminUserDetail(userId: string) {
  return request<AdminUserDetail>(`/api/v1/admin/users/${userId}`);
}

export async function getUserCourseProgress(userId: string) {
  return request<UserCourseProgressResponse>(
    `/api/v1/users/${userId}/enrollments`,
  );
}

export async function getUserProblemList(userId: string) {
  return request<{ submissions: UserProblemSubmission[] }>(
    `/api/v1/users/${userId}/problem`,
  );
}

export async function toggleUserLock(userId: string, locked: boolean) {
  return request<unknown>(`/api/v1/users/${userId}/lock`, {
    method: "PATCH",
    body: JSON.stringify({ locked }),
  });
}
