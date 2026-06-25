"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/actions";
import type { LoginResponseData } from "@/features/auth/types";
import OneButtonModal from "@/components/common/OneButtonModal";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  // 모달 닫을 때 이동할 경로 — role 에 따라 분기
  const [successRedirect, setSuccessRedirect] = useState("/");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail && !password) {
      setErrorMsg("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (!normalizedEmail) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await login(normalizedEmail, password);

      if (res && res.data) {
        const resData = res.data as Partial<LoginResponseData>;
        const role = resData.role;
        const nickname = resData.nickname;

        if (!role || !nickname) {
          setErrorMsg(
            "로그인 응답 형식이 올바르지 않습니다. 다시 시도해 주세요.",
          );
          return;
        }

        localStorage.setItem("userNickname", nickname);
        localStorage.setItem("userRole", role);

        window.dispatchEvent(new Event("loginSuccess"));

        const redirectByRole =
          role === "MASTER"
            ? "/admin/master"
            : role === "ADMIN"
              ? "/admin/rules"
              : role === "OPERATOR"
                ? "/admin/courses"
                : "/";
        setSuccessRedirect(redirectByRole);
        setSuccessOpen(true);
      } else {
        setErrorMsg("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const isClean = !!msg && !msg.includes("\n") && msg.length <= 60;
      setErrorMsg(isClean ? msg : "아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start bg-white px-4 pb-16">
      <div className="w-100 p-[30px_40px] bg-white border border-border-light rounded-base text-center box-border shadow-sm">
        <h1 className="text-2xl font-bold text-text-primary mb-7.5">로그인</h1>

        <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
          <div className="text-left">
            <label htmlFor="login-email" className="auth-label">
              아이디
            </label>
            <input
              id="login-email"
              type="email"
              aria-invalid={!!errorMsg && !email}
              aria-describedby={errorMsg ? "login-error" : undefined}
              className={`w-full auth-input ${
                errorMsg && !email ? "border-text-red" : ""
              }`}
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value) setErrorMsg("");
              }}
            />
          </div>

          <div className="text-left">
            <label htmlFor="login-password" className="auth-label">
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              aria-invalid={!!errorMsg && !password}
              aria-describedby={errorMsg ? "login-error" : undefined}
              className={`w-full auth-input ${
                errorMsg && !password ? "border-text-red" : ""
              }`}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value) setErrorMsg("");
              }}
            />
          </div>

          {errorMsg && (
            <p
              id="login-error"
              role="alert"
              aria-live="polite"
              className="text-xs text-text-red mt-2 pl-1 text-left font-medium"
            >
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 pt-1 text-sm text-text-blue select-none font-medium">
            <button
              type="button"
              className="cursor-pointer hover:underline transition-all bg-transparent border-none p-0 text-text-blue"
              onClick={() => router.push("/auth/find-id")}
            >
              아이디 찾기
            </button>
            <span className="text-text-placeholder">|</span>
            <button
              type="button"
              className="cursor-pointer hover:underline transition-all bg-transparent border-none p-0 text-text-blue"
              onClick={() => router.push("/auth/reset-pw")}
            >
              비밀번호 찾기
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 h-11 text-base border-none rounded-base bg-button-blue-bg text-white font-semibold flex items-center justify-center cursor-pointer hover:bg-button-blue-hover-bg transition-colors"
              >
                로그인
              </button>

              <button
                type="button"
                className="flex-1 h-11 text-base border-none rounded-base bg-bg-gray-box text-text-primary font-semibold flex items-center justify-center cursor-pointer hover:bg-bg-gray-box-hover transition-colors"
                onClick={() => router.push("/auth/register")}
              >
                회원가입
              </button>
            </div>

            <button
              type="button"
              className="w-full h-11 text-base border-none rounded-base bg-bg-gray-box text-text-primary font-semibold flex items-center justify-center cursor-pointer hover:bg-bg-gray-box-hover transition-colors mt-1"
            >
              GOOGLE로 로그인
            </button>
          </div>
        </form>
      </div>

      <OneButtonModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          window.location.href = successRedirect;
        }}
        modalTitle="로그인 완료"
        modalContent="환영합니다!"
      />
    </div>
  );
}
