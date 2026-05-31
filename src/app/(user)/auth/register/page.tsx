"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signup,
  checkEmail,
  checkNickname,
  sendVerificationCode,
  verifyCode,
} from "../../../../services/authService";
import OneButtonModal from "../../../../components/common/OneButtonModal";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");

  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [emailErr, setEmailErr] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [nicknameErr, setNicknameErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");

  const checkEmailFormat = (emailValue: string) => {
    if (!emailValue) {
      setEmailErr("이메일을 입력해주세요.");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailValue)) {
      setEmailErr("이메일 형식이 올바르지 않습니다. (예: user@email.com)");
      return false;
    }
    setEmailErr("");
    return true;
  };

  const validatePasswordOnBlur = (value: string) => {
    if (!value) {
      setPwErr("비밀번호는 필수입니다.");
      return;
    }
    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/~`\\|-]).{8,}$/;
    if (!pwRegex.test(value)) {
      setPwErr("비밀번호 형식이 맞지 않습니다.");
    } else {
      setPwErr("");
    }
  };

  const validateConfirmOnBlur = (value: string) => {
    if (!value) {
      setConfirmErr("비밀번호 확인은 필수입니다.");
      return;
    }
    if (pw !== value) {
      setConfirmErr("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmErr("");
    }
  };

  const validatePhoneOnBlur = (value: string) => {
    if (!value) {
      setPhoneErr("전화번호는 필수입니다.");
      return;
    }
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(value)) {
      setPhoneErr("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
    } else {
      setPhoneErr("");
    }
  };

  /* 1. 이메일 중복 체크 */
  const handleEmailCheck = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const isFormatValid = checkEmailFormat(email);
    if (!isFormatValid) return;

    try {
      const res: any = await checkEmail(email);
      const isAvailable =
        res === true ||
        res?.success === true ||
        res?.data === true ||
        res?.data?.available === true;

      if (isAvailable) {
        setModalTitle("중복 확인 완료");
        setModalContent("사용 가능한 이메일입니다.");
        setIsSuccess(false);
        setModalOpen(true);
        setIsEmailChecked(true);
        setEmailErr("");
      } else {
        setEmailErr("이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      }
    } catch (err: any) {
      setEmailErr(
        err.message || "이메일 중복 확인 API 통신 실패 (네트워크 점검 필요)",
      );
      setIsEmailChecked(false);
    }
  };

  /* 2. 닉네임 중복 체크 */
  const handleNicknameCheck = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    if (!nickname) {
      setNicknameErr("닉네임을 입력해주세요.");
      return;
    }
    try {
      const res: any = await checkNickname(nickname);
      const isAvailable =
        res === true ||
        res?.success === true ||
        res?.data === true ||
        res?.data?.available === true;

      if (isAvailable) {
        setModalTitle("중복 확인 완료");
        setModalContent("사용 가능한 닉네임입니다.");
        setIsSuccess(false);
        setModalOpen(true);
        setIsNicknameChecked(true);
        setNicknameErr("");
      } else {
        setNicknameErr("이미 사용 중인 닉네임입니다.");
        setIsNicknameChecked(false);
      }
    } catch (err: any) {
      setNicknameErr(err.message || "이미 사용 중인 닉네임입니다.");
      setIsNicknameChecked(false);
    }
  };

  /* 3. 이메일 인증번호 전송 */
  const handleSendEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email) {
      setEmailErr("이메일을 입력해주세요.");
      return;
    }
    if (!isEmailChecked) {
      setEmailErr("이메일 중복확인을 먼저 완료해주세요.");
      return;
    }
    try {
      await sendVerificationCode(email);
      setIsSent(true);
      setEmailErr("");
      setModalTitle("인증번호 발송");
      setModalContent("입력하신 이메일로 인증번호가 발송되었습니다.");
      setIsSuccess(false);
      setModalOpen(true);
    } catch (err: any) {
      if (err.message?.includes("횟수") || err.message?.includes("AUT-014")) {
        setEmailErr("이메일 발송 횟수를 초과했습니다.");
      } else {
        setEmailErr(err.message || "인증번호 발송 중 오류가 발생했습니다.");
      }
    }
  };

  /* 4. 인증번호 확인 검증 */
  const handleVerifyCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!code) {
      setCodeErr("인증번호를 입력해주세요.");
      return;
    }
    try {
      await verifyCode(email, code);
      setIsVerified(true);
      setCodeErr("");
      setModalTitle("인증 완료");
      setModalContent("이메일 인증이 성공적으로 완료되었습니다.");
      setIsSuccess(false);
      setModalOpen(true);
    } catch (err: any) {
      setCodeErr(err.message || "인증번호가 일치하지 않거나 만료되었습니다.");
      setIsVerified(false);
    }
  };

  /* 5. 최종 가입 폼 요청 제출 */
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (!email || emailErr) {
      setEmailErr("이메일을 확인해주세요.");
      isValid = false;
    }
    if (!isEmailChecked) {
      setEmailErr("이메일 중복확인을 완료해주세요.");
      isValid = false;
    }
    if (!isVerified) {
      setCodeErr("이메일 인증을 완료해주세요.");
      isValid = false;
    }
    if (!pw || pwErr) {
      setPwErr("비밀번호를 확인해주세요.");
      isValid = false;
    }
    if (pw !== confirm || confirmErr) {
      setConfirmErr("비밀번호가 일치하지 않습니다.");
      isValid = false;
    }
    if (!name) {
      setNameErr("이름을 입력해주세요.");
      isValid = false;
    }
    if (!nickname || !isNicknameChecked) {
      setNicknameErr("닉네임 중복확인을 완료해주세요.");
      isValid = false;
    }
    if (!phone || phoneErr) {
      setPhoneErr("전화번호를 확인해주세요.");
      isValid = false;
    }

    if (isValid) {
      try {
        await signup({
          email,
          password: pw,
          passwordConfirm: confirm,
          name,
          nickname,
          phone,
        });
        setModalTitle("회원가입 완료");
        setModalContent("회원가입이 성공적으로 완료되었습니다!");
        setIsSuccess(true);
        setModalOpen(true);
      } catch (error: any) {
        alert(error.message || "회원가입 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-white px-4 py-10">
      <div className="w-[500px] p-[25px_40px] bg-white border border-[#e8e8e8] rounded-lg text-center box-border">
        <h1 className="text-2xl font-bold text-[#1f2937] mb-[30px]">
          회원가입
        </h1>

        <form
          onSubmit={handleSignupSubmit}
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
              이메일*
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className={`w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border disabled:bg-[#f3f4f6] ${emailErr ? "border-[#fb2c36]" : "focus:border-[#1a237e]"}`}
                placeholder="your@email.com"
                value={email}
                disabled={isVerified}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailChecked(false);
                  if (e.target.value) setEmailErr("");
                }}
              />
              <button
                type="button"
                className="h-11 px-3.5 text-sm bg-[#f3f4f6] text-[#1f2937] border border-[#e8e8e8] rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#e8e8e8] transition-colors disabled:opacity-50"
                disabled={isVerified}
                onClick={handleEmailCheck}
              >
                중복확인
              </button>
            </div>
            {emailErr && (
              <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">{emailErr}</p>
            )}
          </div>

          <div className="text-left">
            <label className="block text-base font-bold text-[#1f2937] mb-2.5">
              이메일 확인*
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className={`flex-1 h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border disabled:bg-[#f3f4f6] ${codeErr ? "border-[#fb2c36]" : "focus:border-[#1a237e]"}`}
                placeholder="인증번호 입력"
                value={code}
                disabled={isVerified}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (e.target.value) setCodeErr("");
                }}
              />
              {!isSent ? (
                <button
                  type="button"
                  className="h-11 px-5 text-sm bg-[#1a237e] text-white border-none rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#111751] transition-colors"
                  onClick={handleSendEmail}
                >
                  인증번호 전송
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="h-11 px-3.5 text-sm bg-[#f3f4f6] text-[#1f2937] border border-[#e8e8e8] rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
                    onClick={handleSendEmail}
                    disabled={isVerified}
                  >
                    재발송
                  </button>
                  <button
                    type="button"
                    className="h-11 px-3.5 text-sm bg-[#1a237e] text-white border-none rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#111751] transition-colors"
                    onClick={handleVerifyCode}
                    disabled={isVerified}
                  >
                    확인
                  </button>
                </div>
              )}
            </div>
            {codeErr && (
              <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">{codeErr}</p>
            )}
          </div>

          <div className="text-left">
            <label className="block text-base font-bold text-[#1f2937] mb-2.5">
              비밀번호*
            </label>
            <input
              type="password"
              className={`w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border ${pwErr ? "border-[#fb2c36]" : "focus:border-[#1a237e]"}`}
              placeholder="비밀번호를 입력해주세요"
              value={pw}
              onBlur={(e) => validatePasswordOnBlur(e.target.value)}
              onChange={(e) => {
                setPw(e.target.value);
                if (e.target.value) setPwErr("");
              }}
            />
            <p className="text-xs text-[#9ca3af] mt-1.5 pl-1">
              ※ 8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.
            </p>
            {pwErr && (
              <p className="text-xs text-[#fb2c36] mt-1 pl-1 font-semibold">
                {pwErr}
              </p>
            )}
          </div>

          <div className="text-left">
            <label className="block text-base font-bold text-[#1f2937] mb-2.5">
              비밀번호 확인*
            </label>
            <input
              type="password"
              className={`w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border ${confirmErr ? "border-[#fb2c36]" : "focus:border-[#1a237e]"}`}
              placeholder="비밀번호를 한 번 더 입력해주세요"
              value={confirm}
              onBlur={(e) => validateConfirmOnBlur(e.target.value)}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (e.target.value) setConfirmErr("");
              }}
            />
            {confirmErr && (
              <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">{confirmErr}</p>
            )}
          </div>

          <div className="text-left">
            <label className="block text-base font-bold text-[#1f2937] mb-2.5">
              이름*
            </label>
            <input
              type="text"
              className={`w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border ${nameErr ? "border-[#fb2c36]" : "focus:border-[#1a237e]"}`}
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value) setNameErr("");
              }}
            />
            {nameErr && (
              <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">{nameErr}</p>
            )}
          </div>

          <div className="text-left">
            <label className="block text-base font-bold text-[#1f2937] mb-2.5">
              닉네임*
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className={`flex-1 h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border ${nicknameErr ? "border-[#fb2c36]" : "focus:border-[#1a237e]"}`}
                placeholder="닉네임을 입력해주세요"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setIsNicknameChecked(false);
                  if (e.target.value) setNicknameErr("");
                }}
              />
              <button
                type="button"
                className="h-11 px-3.5 text-sm bg-[#f3f4f6] text-[#1f2937] border border-[#e8e8e8] rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
                onClick={handleNicknameCheck}
              >
                중복확인
              </button>
            </div>
            {nicknameErr && (
              <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">
                {nicknameErr}
              </p>
            )}
          </div>

          <div className="text-left">
            <label className="block text-base font-bold text-[#1f2937] mb-2.5">
              전화번호*
            </label>
            <input
              type="text"
              className={`w-full h-11 px-4 border border-[#e8e8e8] rounded-lg text-base outline-none box-border ${phoneErr ? "border-[#fb2c36]" : "focus:border-[#1a237e]"}`}
              placeholder="010-0000-0000"
              value={phone}
              onBlur={(e) => validatePhoneOnBlur(e.target.value)}
              onChange={(e) => {
                setPhone(e.target.value);
                if (e.target.value) setPhoneErr("");
              }}
            />
            {phoneErr && (
              <p className="text-xs text-[#fb2c36] mt-1.5 pl-1">{phoneErr}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="w-full h-10 text-base border-none rounded-lg bg-[#1a237e] text-white flex items-center justify-center flex-1 cursor-pointer hover:bg-[#111751] transition-colors"
            >
              가입하기
            </button>
            <button
              type="button"
              className="w-full h-10 text-base rounded-lg bg-[#f3f4f6] text-[#1f2937] border border-[#e8e8e8] flex items-center justify-center flex-1 cursor-pointer hover:bg-[#e8e8e8] transition-colors"
              onClick={() => router.push("/auth/login")}
            >
              취소
            </button>
          </div>
        </form>
      </div>

      <OneButtonModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (isSuccess) {
            router.push("/auth/login");
          }
        }}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </div>
  );
}
