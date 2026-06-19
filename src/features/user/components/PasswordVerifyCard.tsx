"use client";

import { useState } from "react";
import { verifyPassword } from "../actions";

// 비밀번호 확인 — POST /me/verify-password 성공 시 onVerified 호출
export default function PasswordVerifyCard({
  onVerified,
}: {
  onVerified: () => void;
}) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleConfirm = async () => {
    if (!pw.trim() || verifying) return;
    setVerifying(true);
    setError("");
    try {
      await verifyPassword(pw);
      onVerified();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "비밀번호가 일치하지 않습니다.",
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex justify-center pt-20">
      <div className="w-90 border border-border-light rounded-xl bg-bg-box p-7 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary text-center mb-6">
          비밀번호 확인
        </h2>
        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
          placeholder="비밀번호를 입력하세요"
          autoFocus
          className={`w-full border-b pb-2 text-base text-text-primary outline-none mb-2 ${
            error
              ? "border-text-red"
              : "border-border-light focus:border-text-blue"
          }`}
        />
        {error && <p className="mb-4 text-sm text-text-red">{error}</p>}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!pw.trim() || verifying}
          className="mt-6 w-full h-11 cursor-pointer bg-button-blue-bg text-text-white rounded-lg font-semibold hover:bg-button-blue-hover-bg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying ? "확인 중" : "확인"}
        </button>
      </div>
    </div>
  );
}
