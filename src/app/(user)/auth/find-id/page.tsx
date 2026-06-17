"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function FindIdPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [resultEmail, setResultEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFindIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !phone) {
      setErrorMsg("이름과 전화번호를 모두 입력해주세요.");
      return;
    }

    setResultEmail("codebomba***@naver.com");
  };

  return (
    <div className="w-full flex flex-col items-center justify-start bg-background px-4 pb-16">
      <div className="w-100 max-w-full px-10 py-8 bg-bg-box border border-border-light rounded-base text-center box-border shadow-sm">
        {!resultEmail ? (
          <>
            <h1 className="text-title-lg font-bold text-text-primary mb-6">
              아이디 찾기
            </h1>
            <form
              onSubmit={handleFindIdSubmit}
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
                <label className="auth-label">이름*</label>
                <input
                  type="text"
                  className="auth-input w-full"
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value) setErrorMsg("");
                  }}
                />
              </div>

              <div className="text-left flex flex-col">
                <label className="auth-label">전화번호*</label>
                <input
                  type="text"
                  className="auth-input w-full"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (e.target.value) setErrorMsg("");
                  }}
                />
              </div>

              <div className="flex items-center justify-end pt-1 text-xs text-text-secondary select-none">
                <span
                  className="cursor-pointer hover:text-text-blue transition-colors"
                  onClick={() => router.push("/auth/reset-pw")}
                >
                  비밀번호 찾기
                </span>
              </div>

              {errorMsg && <p className="auth-error text-left">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full h-11 text-body border-none rounded-base bg-button-blue-bg text-text-white font-medium flex items-center justify-center cursor-pointer mt-6 hover:bg-button-blue-hover-bg transition-colors"
              >
                확인
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-title-lg font-bold text-text-primary mb-6">
              아이디 찾기 결과
            </h1>
            <div className="text-title-md font-bold text-text-blue my-12 text-center select-all">
              {resultEmail}
            </div>
            <button
              type="button"
              className="w-full h-11 text-body border-none rounded-base bg-button-blue-bg text-text-white font-medium flex items-center justify-center cursor-pointer hover:bg-button-blue-hover-bg transition-colors"
              onClick={() => router.push("/auth/login")}
            >
              돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
