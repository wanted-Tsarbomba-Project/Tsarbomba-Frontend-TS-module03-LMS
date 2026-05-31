"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { OneButtonModal } from "@/components/common";

import {
  getAutomationRules,
  updateAutomationRuleEnabled,
  updateAutomationRules,
} from "../api";
import type { AutomationRule } from "../types";

import styles from "@/app/admin/rules/page.module.css";

const targetTypeLabel: Record<AutomationRule["targetType"], string> = {
  COURSE: "강좌",
  PROBLEM: "문제",
  USER: "회원",
};

type NumericRuleField = "thresholdValue" | "minSampleCount";

export default function RulesClient() {
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
      openNoticeModal("조회 실패", "규칙 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [openNoticeModal]);

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
      openNoticeModal("변경 실패", "활성 상태 변경에 실패했습니다.");
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
      openNoticeModal("수정 실패", "규칙 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  return (
    <>
      <div className={styles.container}>
        {rules.map((rule) => (
          <section className={styles.ruleBlock} key={rule.operationRuleId}>
            <div className={styles.ruleHeader}>
              <h2 className={styles.ruleLabel}>
                {targetTypeLabel[rule.targetType] ?? rule.targetType}
              </h2>

              <button
                className={`${styles.toggleButton} ${
                  rule.enabled ? styles.enabled : styles.disabled
                }`}
                onClick={() => void handleToggleEnabled(rule)}
                type="button"
              >
                {rule.enabled ? "활성" : "비활성"}
              </button>
            </div>

            <div className={styles.ruleInputBox}>
              {renderRuleInputs(rule, handleChange)}
            </div>
          </section>
        ))}

        <div className={styles.submitWrapper}>
          <button
            className={styles.submitButton}
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
      <div className={styles.ruleItem}>
        <span className={styles.ruleText}>수강생의 수가</span>
        <RuleNumberInput
          field="thresholdValue"
          onChange={onChange}
          rule={rule}
        />
        <span className={styles.ruleText}>명 이하인 강좌</span>
      </div>
    );
  }

  if (rule.ruleCode === "PROBLEM_HIGH_WRONG_RATE") {
    return (
      <>
        <div className={styles.ruleItem}>
          <RuleNumberInput
            field="minSampleCount"
            onChange={onChange}
            rule={rule}
          />
          <span className={styles.ruleText}>회 제출 이상인 문제 중</span>
        </div>

        <div className={styles.ruleItem}>
          <span className={styles.ruleText}>오답률이</span>
          <RuleNumberInput
            field="thresholdValue"
            onChange={onChange}
            rule={rule}
          />
          <span className={styles.ruleText}>% 이상인 문제</span>
        </div>
      </>
    );
  }

  if (rule.ruleCode === "USER_INACTIVE_NO_COURSE") {
    return (
      <div className={styles.ruleItem}>
        <span className={styles.ruleText}>미로그인 기간이</span>
        <RuleNumberInput
          field="thresholdValue"
          onChange={onChange}
          rule={rule}
        />
        <span className={styles.ruleText}>일 이상인 회원</span>
      </div>
    );
  }

  return (
    <span className={styles.ruleText}>{rule.description ?? rule.ruleName}</span>
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
      className={styles.ruleInput}
      max={field === "thresholdValue" ? rule.thresholdMax : undefined}
      min={field === "thresholdValue" ? rule.thresholdMin : undefined}
      onChange={(event) => onChange(rule.operationRuleId, field, event)}
      type="number"
      value={rule[field] ?? ""}
    />
  );
}
