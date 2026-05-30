import type {
  AlertStatus,
  ApiResponse,
  AutomationRule,
  OperationAlertDetail,
  OperationAlertSummary,
  PageResponse,
  TargetType,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const JSON_HEADERS = { "Content-Type": "application/json" };

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...JSON_HEADERS,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const text = await response.text();

  if (!text) {
    return { data: undefined as T };
  }

  return JSON.parse(text) as ApiResponse<T>;
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
