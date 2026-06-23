import type { AlertStatus, AutomationRule, TargetType } from "./types";

export const ALERT_PAGE_SIZE = 20;

export const alertStatusLabel: Record<AlertStatus, string> = {
  OPEN: "미처리",
  RESOLVED: "처리 완료",
  IGNORED: "무시됨",
};

export const alertTargetTabs: Array<{ label: string; value: TargetType }> = [
  { label: "문제", value: "PROBLEM" },
  { label: "회원", value: "USER" },
  { label: "강좌", value: "COURSE" },
];

export const automationTargetTypeLabel: Record<
  AutomationRule["targetType"],
  string
> = {
  COURSE: "강좌",
  PROBLEM: "문제",
  USER: "회원",
};

export const operationTargetTypeLabel: Record<TargetType, string> = {
  COURSE: "강좌",
  PROBLEM: "문제",
  USER: "회원",
};
