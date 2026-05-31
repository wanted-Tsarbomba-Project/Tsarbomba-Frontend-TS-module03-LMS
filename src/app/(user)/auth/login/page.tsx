"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../../../services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await login(email, password);

      if (res && res.data) {
        localStorage.setItem("userNickname", res.data.nickname || "유저");
        localStorage.setItem("userRole", res.data.role || "USER");

        window.dispatchEvent(new Event("loginSuccess"));

        if (res.data.role === "ADMIN" || res.data.role === "OPERATOR") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "이메일 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  const handleGoogleLogin = () => {
    alert("구글 로그인 기능은 준비 중입니다.");
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-start bg-white px-4 pb-16">
      <div className="h-16 w-full shrink-0" />
      <div className="h-12 w-full shrink-0" />

      <div className="w-[400px] p-[30px_40px] bg-white border border-[#e8e8e8] rounded-lg text-center box-border shadow-sm">
        <h1 className="text-2xl font-bold text-[#1f2937] mb-[30px]">로그인</h1>

        <form
          onSubmit={handleLoginSubmit}
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
              아이디
            </label>
            <input
              type="text"
              className={`w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e] ${
                errorMsg && !email ? "border-[#fb2c36]" : ""
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
            <label className="block text-base font-bold text-[#1f2937] mb-2.5">
              비밀번호
            </label>
            <input
              type="password"
              className={`w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e] ${
                errorMsg && !password ? "border-[#fb2c36]" : ""
              }`}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value) setErrorMsg("");
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-1 text-sm text-[#1a237e] select-none font-medium">
            <span
              className="cursor-pointer hover:underline transition-all"
              onClick={() => router.push("/auth/find-id")}
            >
              아이디 찾기
            </span>
            <span className="text-[#d1d5db]">|</span>
            <span
              className="cursor-pointer hover:underline transition-all"
              onClick={() => router.push("/auth/reset-pw")}
            >
              비밀번호 찾기
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs text-[#fb2c36] mt-2 pl-1 text-left font-medium">
              {errorMsg}
            </p>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 h-11 text-base border-none rounded-lg bg-[#1a237e] text-white font-semibold flex items-center justify-center cursor-pointer hover:bg-[#111751] transition-colors"
              >
                로그인
              </button>

              <button
                type="button"
                className="flex-1 h-11 text-base border-none rounded-lg bg-[#e5e7eb] text-[#1f2937] font-semibold flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => router.push("/auth/register")}
              >
                회원가입
              </button>
            </div>

            <button
              type="button"
              className="w-full h-11 text-base border-none rounded-lg bg-[#e5e7eb] text-[#1f2937] font-semibold flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors mt-1"
              onClick={handleGoogleLogin}
            >
              GOOGLE로 로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
