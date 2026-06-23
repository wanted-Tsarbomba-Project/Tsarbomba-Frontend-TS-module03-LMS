"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LoadingIndicator, OneButtonModal } from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  getAutomationRules,
  updateAutomationRuleEnabled,
  updateAutomationRules,
} from "../actions";
import { automationTargetTypeLabel } from "../constants";
import { adminRuleClasses } from "../styles";
import type { AutomationRule } from "../types";

type NumericRuleField = "thresholdValue" | "minSampleCount";

export default function RulesClient() {
  const router = useRouter();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noticeModal, setNoticeModal] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  const openNoticeModal = useCallback((title: string, content: string) => {
    setNoticeModal({
      isOpen: true,
      title,
      content,
    });
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAutomationRules();
      setRules(result.data);
    } catch (error) {
      console.error("규칙 조회 실패:", error);
      handleClientError(error, {
        router,
        fallbackTitle: "규칙을 불러오지 못했습니다",
        fallbackMessage: "잠시 후 다시 시도해 주세요.",
        showModal: openNoticeModal,
      });
    } finally {
      setLoading(false);
    }
  }, [openNoticeModal, router]);

  useEffect(() => {
    const loadRules = async () => {
      await fetchRules();
    };

    void loadRules();
  }, [fetchRules]);

  const handleChange = (
    operationRuleId: number,
    field: NumericRuleField,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = event.target;

    setRules((prev) =>
      prev.map((rule) =>
        rule.operationRuleId === operationRuleId
          ? {
              ...rule,
              [field]: value === "" ? "" : Number(value),
            }
          : rule,
      ),
    );
  };

  const handleToggleEnabled = async (rule: AutomationRule) => {
    try {
      await updateAutomationRuleEnabled(rule.operationRuleId, !rule.enabled);
      setRules((prev) =>
        prev.map((item) =>
          item.operationRuleId === rule.operationRuleId
            ? { ...item, enabled: !rule.enabled }
            : item,
        ),
      );
    } catch (error) {
      console.error("규칙 활성 상태 변경 실패:", error);
      handleClientError(error, {
        router,
        fallbackTitle: "상태를 변경하지 못했습니다",
        fallbackMessage: "잠시 후 다시 시도해 주세요.",
        showModal: openNoticeModal,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await updateAutomationRules(rules);
      openNoticeModal("수정 완료", "규칙이 수정되었습니다.");
      await fetchRules();
    } catch (error) {
      console.error("규칙 수정 실패:", error);
      handleClientError(error, {
        router,
        fallbackTitle: "규칙을 저장하지 못했습니다",
        fallbackMessage: "잠시 후 다시 시도해 주세요.",
        showModal: openNoticeModal,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={adminRuleClasses.container}>
        <LoadingIndicator message="자동화 규칙을 불러오는 중입니다." />
      </div>
    );
  }

  return (
    <>
      <div className={adminRuleClasses.container}>
        {rules.map((rule) => (
          <section className={adminRuleClasses.ruleBlock} key={rule.operationRuleId}>
            <div className={adminRuleClasses.ruleHeader}>
              <h2 className={adminRuleClasses.ruleLabel}>
                {automationTargetTypeLabel[rule.targetType] ?? rule.targetType}
              </h2>

              <button
                className={`${adminRuleClasses.toggleButton} ${
                  rule.enabled ? adminRuleClasses.enabled : adminRuleClasses.disabled
                }`}
                onClick={() => void handleToggleEnabled(rule)}
                type="button"
              >
                {rule.enabled ? "활성" : "비활성"}
              </button>
            </div>

            <div className={adminRuleClasses.ruleInputBox}>
              {renderRuleInputs(rule, handleChange)}
            </div>
          </section>
        ))}

        <div className={adminRuleClasses.submitWrapper}>
          <button
            className={adminRuleClasses.submitButton}
            disabled={saving}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {saving ? "수정 중..." : "수정하기"}
          </button>
        </div>
      </div>

      <OneButtonModal
        isOpen={noticeModal.isOpen}
        modalContent={noticeModal.content}
        modalTitle={noticeModal.title}
        onClose={() => setNoticeModal({ isOpen: false, title: "", content: "" })}
      />
    </>
  );
}

function renderRuleInputs(
  rule: AutomationRule,
  onChange: (
    operationRuleId: number,
    field: NumericRuleField,
    event: ChangeEvent<HTMLInputElement>,
  ) => void,
) {
  if (rule.ruleCode === "COURSE_LOW_ENROLLMENT") {
    return (
      <div className={adminRuleClasses.ruleItem}>
        <span className={adminRuleClasses.ruleText}>수강생의 수가</span>
        <RuleNumberInput
          field="thresholdValue"
          onChange={onChange}
          rule={rule}
        />
        <span className={adminRuleClasses.ruleText}>명 이하인 강좌</span>
      </div>
    );
  }

  if (rule.ruleCode === "PROBLEM_HIGH_WRONG_RATE") {
    return (
      <>
        <div className={adminRuleClasses.ruleItem}>
          <RuleNumberInput
            field="minSampleCount"
            onChange={onChange}
            rule={rule}
          />
          <span className={adminRuleClasses.ruleText}>회 제출 이상인 문제 중</span>
        </div>

        <div className={adminRuleClasses.ruleItem}>
          <span className={adminRuleClasses.ruleText}>오답률이</span>
          <RuleNumberInput
            field="thresholdValue"
            onChange={onChange}
            rule={rule}
          />
          <span className={adminRuleClasses.ruleText}>% 이상인 문제</span>
        </div>
      </>
    );
  }

  if (rule.ruleCode === "USER_INACTIVE_NO_COURSE") {
    return (
      <div className={adminRuleClasses.ruleItem}>
        <span className={adminRuleClasses.ruleText}>미로그인 기간이</span>
        <RuleNumberInput
          field="thresholdValue"
          onChange={onChange}
          rule={rule}
        />
        <span className={adminRuleClasses.ruleText}>일 이상인 회원</span>
      </div>
    );
  }

  return (
    <span className={adminRuleClasses.ruleText}>{rule.description ?? rule.ruleName}</span>
  );
}

function RuleNumberInput({
  rule,
  field,
  onChange,
}: {
  rule: AutomationRule;
  field: NumericRuleField;
  onChange: (
    operationRuleId: number,
    field: NumericRuleField,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  return (
    <input
      className={adminRuleClasses.ruleInput}
      max={field === "thresholdValue" ? rule.thresholdMax : undefined}
      min={field === "thresholdValue" ? rule.thresholdMin : undefined}
      onChange={(event) => onChange(rule.operationRuleId, field, event)}
      type="number"
      value={rule[field] ?? ""}
    />
  );
}
