"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OneButtonModal from "../../../../components/common/OneButtonModal";

export default function ResetPwPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [emailErr, setEmailErr] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [confirmErr, setConfirmErr] = useState("");

  const handleSendEmail = () => {
    if (!email) {
      setEmailErr("이메일을 입력하세요.");
      return;
    }
    alert("인증번호가 발송되었습니다. (테스트용 번호: 아무거나)");
    setIsSent(true);
    setEmailErr("");
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setCodeErr("인증번호를 입력하세요.");
      return;
    }
    alert("인증 완료되었습니다. 새 비밀번호를 입력해 주세요.");
    setIsVerified(true);
    setCodeErr("");
  };

  const handleResetSubmit = (e: React.FormEvent) => {
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

    if (isValid) {
      setModalOpen(true);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-start bg-white px-4 pb-16">
      <div className="h-16 w-full shrink-0" />
      <div className="h-12 w-full shrink-0" />

      <div className="w-[400px] px-10 py-8 bg-white border border-[#e8e8e8] rounded-lg text-center box-border shadow-sm">
        <h1 className="text-2xl font-bold text-[#1f2937] mb-[30px]">
          비밀번호 재설정
        </h1>

        {!isVerified ? (
          <form
            onSubmit={handleVerifyCode}
            className="space-y-4"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.target as HTMLElement).tagName === "INPUT"
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="text-left">
              <label className="block text-base font-bold text-[#1f2937] mb-2.5">
                이메일
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="flex-1 h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e]"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value) setEmailErr("");
                  }}
                />
                <button
                  type="button"
                  className="h-11 px-3.5 text-sm bg-[#1a237e] text-white border-none rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#111751] transition-colors"
                  onClick={handleSendEmail}
                >
                  인증번호 전송
                </button>
              </div>
              {emailErr && (
                <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">{emailErr}</p>
              )}
            </div>

            <div className="text-left">
              <label className="block text-base font-bold text-[#1f2937] mb-2.5">
                인증번호 입력
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="flex-1 h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e]"
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
                    className="h-11 px-3.5 text-sm bg-[#f3f4f6] text-[#1f2937] border border-[#e8e8e8] rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
                    onClick={handleSendEmail}
                  >
                    재발송
                  </button>
                )}
              </div>
              {codeErr && (
                <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">{codeErr}</p>
              )}
            </div>

            <div className="flex items-center justify-end pt-1 text-xs text-[#9ca3af] select-none">
              <span
                className="cursor-pointer hover:text-[#1a237e] transition-colors"
                onClick={() => router.push("/auth/find-id")}
              >
                아이디 찾기
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-11 text-base border-none rounded-lg bg-[#1a237e] text-white font-medium flex items-center justify-center cursor-pointer mt-[25px] hover:bg-[#111751] transition-colors"
            >
              확인
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleResetSubmit}
            className="space-y-4"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.target as HTMLElement).tagName === "INPUT"
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="text-left">
              <label className="block text-base font-bold text-[#1f2937] mb-2.5">
                새 비밀번호 입력
              </label>
              <input
                type="password"
                className="w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e]"
                placeholder="새 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) setPasswordErr("");
                }}
              />
              {passwordErr && (
                <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">
                  {passwordErr}
                </p>
              )}
            </div>

            <div className="text-left">
              <label className="block text-base font-bold text-[#1f2937] mb-2.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                className="w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e]"
                placeholder="비밀번호를 한 번 더 입력해주세요"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (e.target.value) setConfirmErr("");
                }}
              />
              {confirmErr && (
                <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">
                  {confirmErr}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-11 text-base border-none rounded-lg bg-[#1a237e] text-white font-medium flex items-center justify-center cursor-pointer mt-[35px] hover:bg-[#111751] transition-colors"
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
    </div>
  );
}
