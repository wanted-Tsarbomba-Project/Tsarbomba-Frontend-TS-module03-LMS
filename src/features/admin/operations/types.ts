export type TargetType = "COURSE" | "PROBLEM" | "USER";

export type AlertStatus = "OPEN" | "RESOLVED" | "IGNORED";

export interface ApiResponse<T> {
  status?: number;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
}

export interface AutomationRule {
  operationRuleId: number;
  ruleCode: string;
  ruleName?: string;
  description?: string;
  targetType: TargetType;
  enabled: boolean;
  thresholdValue: number | "";
  thresholdMin?: number;
  thresholdMax?: number;
  thresholdUnit?: string;
  minSampleCount: number | null | "";
  minSampleCountLabel?: string | null;
}

export interface OperationAlertSummary {
  operationAlertId: number;
  recommendedAction?: string | null;
  status: AlertStatus;
  severity?: string | null;
}

export interface OperationAlertDetail {
  alert: {
    operationAlertId: number;
    status: AlertStatus;
    severity?: string | null;
    reason?: string | null;
    recommendedAction?: string | null;
    adminMemo?: string | null;
    thresholdValueSnapshot?: number | null;
    firstDetectedAt?: string | null;
    lastDetectedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  rule: {
    ruleName?: string | null;
    ruleCode?: string | null;
    description?: string | null;
    thresholdUnit?: string | null;
    minSampleCountLabel?: string | null;
  };
  target: {
    targetType: TargetType;
    targetId: number;
    title?: string | null;
    nickname?: string | null;
    problemSetTitle?: string | null;
    courseTitle?: string | null;
    email?: string | null;
    status?: string | null;
  };
  metric: {
    observedLabel?: string | null;
    observedValue?: number | null;
    thresholdLabel?: string | null;
    thresholdValue?: number | null;
    unit?: string | null;
    minSampleCount?: number | null;
    minSampleCountUnit?: string | null;
  };
  assignee?: {
    name?: string | null;
    email?: string | null;
  } | null;
}
