"use client";

import { useState } from "react";
import Image from "next/image";
import { withdrawUser } from "../actions";
import { fieldBase } from "./styles";

// 회원 탈퇴
export default function WithdrawModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    if (loading) return;
    setPw("");
    setError("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!pw.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      await withdrawUser(pw);

      // 세션 정리
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((cookie) => {
          document.cookie =
            cookie.split("=")[0].trim() +
            "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        });
        window.dispatchEvent(new Event("loginSuccess"));
        window.location.href = "/";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "회원 탈퇴에 실패했습니다.",
      );
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex h-full w-full items-center justify-center bg-[rgba(16,24,40,0.45)]"
      onClick={close}
    >
      <div
        className="relative w-120 rounded-2xl bg-bg-box p-8 max-[560px]:w-[calc(100%-32px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <Image
            alt="warning icon"
            className="h-16 w-16"
            height={64}
            src="/assets/img/modalWarningIcon.svg"
            width={64}
          />
        </div>

        <h2 className="mt-6 text-center text-2xl font-medium leading-8 text-text-primary">
          탈퇴하시겠습니까?
        </h2>
        <p className="mt-3 whitespace-pre-line text-center text-body leading-6 text-text-secondary">
          {"이 작업은 되돌릴 수 없습니다.\n계속하려면 비밀번호를 입력해주세요."}
        </p>

        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
          placeholder="비밀번호를 입력하세요"
          autoFocus
          className={`${fieldBase} mt-6 ${error ? "border-text-red" : ""}`}
        />
        {error && <p className="mt-1.5 text-sm text-text-red">{error}</p>}

        <div className="mt-7 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!pw.trim() || loading}
            className="h-12 w-32 rounded-[10px] bg-button-red-bg text-text-white text-body font-medium transition-all duration-200 hover:not-disabled:bg-button-red-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "처리 중" : "탈퇴"}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={loading}
            className="h-12 w-32 rounded-[10px] bg-bg-navbar text-text-primary text-body font-medium transition-all duration-200 hover:not-disabled:bg-bg-gray-box-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
