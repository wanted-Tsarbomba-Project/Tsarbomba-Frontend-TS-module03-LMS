"use client";

import { useEffect, useId, useState } from "react";
import { OneButtonModal } from "@/components/common";
import {
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
} from "@/features/auth/actions";
import { PW_PLACEHOLDER, PW_REGEX, toUserMessage } from "../validation";
import { fieldBase, fieldLabel } from "./styles";

// 비밀번호 재설정 (로그인 비밀번호 찾기 사용)
export default function PasswordResetPanel({ email }: { email: string }) {
  const codeId = useId();
  const newPwId = useId();
  const newPwConfirmId = useId();
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [codeErr, setCodeErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [doneOpen, setDoneOpen] = useState(false);

  const pwMismatch = newPwConfirm.length > 0 && newPw !== newPwConfirm;

  // 인증번호 재발송 타이머
  useEffect(() => {
    if (timer <= 0 || verified) return;
    const id = setTimeout(() => setTimer((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearTimeout(id);
  }, [timer, verified]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // 1) 가입 이메일로 인증번호 발송
  const handleSendCode = async () => {
    if (loading || !email) return;
    setLoading(true);
    setCodeErr("");
    try {
      await requestPasswordReset(email);
      setSent(true);
      setTimer(600);
    } catch (err) {
      setCodeErr(toUserMessage(err, "인증번호 발송에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  // 2) 인증번호 검증
  const handleVerifyCode = async () => {
    if (loading || !sent || !code.trim()) return;
    setLoading(true);
    setCodeErr("");
    try {
      await verifyPasswordResetCode(email, code);
      setVerified(true);
    } catch (err) {
      setCodeErr(
        toUserMessage(err, "인증번호가 일치하지 않거나 만료되었습니다."),
      );
    } finally {
      setLoading(false);
    }
  };

  // 3) 새 비밀번호로 변경
  const handleReset = async () => {
    if (loading) return;
    setPwErr("");
    if (!PW_REGEX.test(newPw)) {
      setPwErr("비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.");
      return;
    }
    if (newPw !== newPwConfirm) {
      setPwErr("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, newPw);
      setDoneOpen(true);
    } catch (err) {
      setPwErr(toUserMessage(err, "비밀번호 변경에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  // 변경 완료 후 재로그인
  const handleDoneClose = () => {
    setDoneOpen(false);
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((cookie) => {
        document.cookie =
          cookie.split("=")[0].trim() +
          "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
      });
      window.dispatchEvent(new Event("loginSuccess"));
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="w-80 shrink-0 border border-border-light rounded-xl bg-bg-box p-6 max-lg:w-full">
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        비밀번호 재설정
      </h2>
      <p className="text-sm text-text-secondary mb-5 break-all">
        가입 이메일로 인증번호를 전송합니다.
        <br />
        <span className="font-medium text-text-primary">이메일: {email}</span>
      </p>

      {!verified ? (
        // 1) 이메일 인증번호 발송 + 검증
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor={codeId} className={fieldLabel}>
              인증번호
            </label>
            <div className="flex gap-2">
              <input
                id={codeId}
                type="text"
                className={`${fieldBase} ${codeErr ? "border-text-red" : ""}`}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (codeErr) setCodeErr("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerifyCode();
                }}
                placeholder="인증번호 입력"
                disabled={!sent}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading || timer > 0}
                className="shrink-0 h-11 px-3 text-sm bg-bg-gray-box text-text-primary rounded-lg cursor-pointer whitespace-nowrap hover:bg-bg-gray-box-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {timer > 0 ? formatTimer(timer) : sent ? "재발송" : "전송"}
              </button>
            </div>
            {codeErr && (
              <p className="mt-1.5 text-sm text-text-red">{codeErr}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={loading || !sent || !code.trim()}
            className="w-full h-11 bg-button-blue-bg text-text-white rounded-lg font-semibold cursor-pointer hover:bg-button-blue-hover-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            인증 확인
          </button>
        </div>
      ) : (
        // 2) 새 비밀번호 입력
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor={newPwId} className={fieldLabel}>
              새 비밀번호 입력
            </label>
            <input
              id={newPwId}
              type="password"
              className={`${fieldBase} ${pwErr ? "border-text-red" : ""}`}
              value={newPw}
              onChange={(e) => {
                setNewPw(e.target.value);
                if (pwErr) setPwErr("");
              }}
              placeholder={PW_PLACEHOLDER}
            />
          </div>
          <div>
            <label htmlFor={newPwConfirmId} className={fieldLabel}>
              새 비밀번호 입력 확인
            </label>
            <input
              id={newPwConfirmId}
              type="password"
              className={`${fieldBase} ${pwMismatch ? "border-text-red" : ""}`}
              value={newPwConfirm}
              onChange={(e) => setNewPwConfirm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReset();
              }}
              placeholder="비밀번호를 한 번 더 입력해주세요"
            />
            {pwMismatch && (
              <p className="mt-1 text-xs text-text-red">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
            {pwErr && !pwMismatch && (
              <p className="mt-1 text-xs text-text-red">{pwErr}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading || pwMismatch || !newPw || !newPwConfirm}
            className="w-full h-11 bg-button-blue-bg text-text-white rounded-lg font-semibold cursor-pointer hover:bg-button-blue-hover-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "변경 중" : "변경"}
          </button>
        </div>
      )}

      {/* 비밀번호 변경 완료 모달 */}
      <OneButtonModal
        isOpen={doneOpen}
        onClose={handleDoneClose}
        modalTitle="비밀번호 변경 완료"
        modalContent={
          "비밀번호가 변경되었습니다.\n새 비밀번호로 다시 로그인해주세요."
        }
      />
    </div>
  );
}
