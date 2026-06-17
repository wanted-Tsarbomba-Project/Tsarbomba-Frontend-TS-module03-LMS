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
    <div className="w-full flex flex-col items-center justify-start bg-white px-4 pb-16">
      <div className="w-100 px-10 py-8 bg-white border border-[#e8e8e8] rounded-lg text-center box-border shadow-sm">
        {!resultEmail ? (
          <>
            <h1 className="text-2xl font-bold text-[#1f2937] mb-7.5">
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
              <div className="text-left">
                <label className="block text-base font-bold text-[#1f2937] mb-2.5">
                  이름*
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e]"
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value) setErrorMsg("");
                  }}
                />
              </div>
              <div className="text-left">
                <label className="block text-base font-bold text-[#1f2937] mb-2.5">
                  전화번호*
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border placeholder-[#d1d5db] focus:border-[#1a237e]"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (e.target.value) setErrorMsg("");
                  }}
                />
              </div>

              <div className="flex items-center justify-end pt-1 text-xs text-[#9ca3af] select-none">
                <span
                  className="cursor-pointer hover:text-[#1a237e] transition-colors"
                  onClick={() => router.push("/auth/reset-pw")}
                >
                  비밀번호 찾기
                </span>
              </div>

              {errorMsg && (
                <p className="text-xs text-[#fb2c36] mt-1.5 pl-1 text-left">
                  {errorMsg}
                </p>
              )}
              <button
                type="submit"
                className="w-full h-11 text-base border-none rounded-lg bg-[#1a237e] text-white font-medium flex items-center justify-center cursor-pointer mt-6.25 hover:bg-[#111751] transition-colors"
              >
                확인
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#1f2937] mb-7.5">
              아이디 찾기 결과
            </h1>
            <div className="text-lg font-bold text-[#1a237e] my-12 text-center select-all">
              {resultEmail}
            </div>
            <button
              type="button"
              className="w-full h-11 text-base border-none rounded-lg bg-[#1a237e] text-white font-medium flex items-center justify-center cursor-pointer hover:bg-[#111751] transition-colors"
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
