"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OneButtonModal from "../../../../components/common/OneButtonModal";
import {
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
} from "@/features/auth/actions";

export default function ResetPwPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const [timer, setTimer] = useState(0);

  const [emailErr, setEmailErr] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [confirmErr, setConfirmErr] = useState("");

  useEffect(() => {
    if (timer <= 0 || isVerified) return;
    const id = setTimeout(() => setTimer((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearTimeout(id);
  }, [timer, isVerified]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // 1) 재설정 코드 이메일 발송 — POST /password/forgot
  const handleSendEmail = async () => {
    if (!email) {
      setEmailErr("이메일을 입력하세요.");
      return;
    }
    try {
      await requestPasswordReset(email);
      setInfoMsg("인증번호가 발송되었습니다.");
      setIsSent(true);
      setTimer(600);
      setEmailErr("");
    } catch (err: unknown) {
      setEmailErr(
        err instanceof Error ? err.message : "재설정 코드 발송에 실패했습니다.",
      );
    }
  };

  // 2) 코드 검증 — POST /password/verify-code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setCodeErr("인증번호를 입력하세요.");
      return;
    }
    try {
      await verifyPasswordResetCode(email, code);
      setInfoMsg("인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.");
      setIsVerified(true);
      setCodeErr("");
    } catch (err: unknown) {
      setCodeErr(
        err instanceof Error
          ? err.message
          : "인증번호가 일치하지 않거나 만료되었습니다.",
      );
    }
  };

  // 3) 비밀번호 변경 — PUT /password/reset
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErr("");
    setConfirmErr("");

    let isValid = true;
    if (!password) {
      setPasswordErr("새 비밀번호를 입력하세요.");
      isValid = false;
    }
    if (password !== confirm) {
      setConfirmErr("비밀번호가 일치하지 않습니다.");
      isValid = false;
    }
    if (!isValid) return;

    try {
      await resetPassword(email, code, password);
      setModalOpen(true);
    } catch (err: unknown) {
      setPasswordErr(
        err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.",
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start bg-background px-4 pb-16">
      <div className="w-100 max-w-full px-10 py-8 bg-bg-box border border-border-light rounded-base text-center box-border shadow-sm">
        <h1 className="text-title-lg font-bold text-text-primary mb-6">
          비밀번호 재설정
        </h1>

        {!isVerified ? (
          <form
            onSubmit={handleVerifyCode}
            className="space-y-4"
            noValidate
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.target as HTMLElement).tagName === "INPUT"
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="text-left flex flex-col">
              <label className="auth-label">이메일</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="auth-input flex-1 min-w-0"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  disabled={isSent}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value) setEmailErr("");
                  }}
                />
                {!isSent && (
                  <button
                    type="button"
                    className="shrink-0 h-11 px-3.5 text-xs bg-button-blue-bg text-text-white border-none rounded-base cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-button-blue-hover-bg transition-colors"
                    onClick={handleSendEmail}
                  >
                    인증번호 전송
                  </button>
                )}
              </div>
              {emailErr && <p className="auth-error">{emailErr}</p>}
            </div>

            <div className="text-left flex flex-col">
              <label className="auth-label">인증번호 입력</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="auth-input flex-1 min-w-0"
                  placeholder="인증번호를 입력하세요."
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (e.target.value) setCodeErr("");
                  }}
                />
                {isSent && (
                  <button
                    type="button"
                    className="shrink-0 h-11 px-3.5 text-xs bg-bg-navbar text-text-primary border border-border-light rounded-base whitespace-nowrap flex items-center justify-center hover:bg-bg-gray-box-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    onClick={handleSendEmail}
                    disabled={timer > 0}
                  >
                    {timer > 0 ? formatTimer(timer) : "재발송"}
                  </button>
                )}
              </div>
              {codeErr && <p className="auth-error">{codeErr}</p>}
            </div>

            <button
              type="submit"
              className="w-full h-11 text-body border-none rounded-base bg-button-blue-bg text-text-white font-medium flex items-center justify-center cursor-pointer mt-6 hover:bg-button-blue-hover-bg transition-colors"
            >
              확인
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleResetSubmit}
            className="space-y-4"
            noValidate
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.target as HTMLElement).tagName === "INPUT"
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="text-left flex flex-col">
              <label className="auth-label">새 비밀번호 입력</label>
              <input
                type="password"
                className="auth-input w-full"
                placeholder="새 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) setPasswordErr("");
                }}
              />
              {passwordErr && <p className="auth-error">{passwordErr}</p>}
            </div>

            <div className="text-left flex flex-col">
              <label className="auth-label">비밀번호 확인</label>
              <input
                type="password"
                className="auth-input w-full"
                placeholder="비밀번호를 한 번 더 입력해주세요"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (e.target.value) setConfirmErr("");
                }}
              />
              {confirmErr && <p className="auth-error">{confirmErr}</p>}
            </div>

            <button
              type="submit"
              className="w-full h-11 text-body border-none rounded-base bg-button-blue-bg text-text-white font-medium flex items-center justify-center cursor-pointer mt-8 hover:bg-button-blue-hover-bg transition-colors"
            >
              확인
            </button>
          </form>
        )}
      </div>

      <OneButtonModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.push("/auth/login");
        }}
        modalTitle="비밀번호 변경 완료"
        modalContent="새로운 비밀번호로 변경되었습니다. 다시 로그인해 주세요."
      />

      <OneButtonModal
        isOpen={!!infoMsg}
        onClose={() => setInfoMsg("")}
        modalTitle="알림"
        modalContent={infoMsg}
      />
    </div>
  );
}
