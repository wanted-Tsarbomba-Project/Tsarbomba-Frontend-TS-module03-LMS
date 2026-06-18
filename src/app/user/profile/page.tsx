"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { OneButtonModal, TwoButtonModal } from "@/components/common";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import ErrorPageView from "@/components/common/ErrorPageView";
import {
  getMyProfile,
  updateMyProfile,
  verifyPassword,
  withdrawUser,
} from "@/services/userService";

// ════════════════════════════════════════════════════════════════════════════════
// 마이페이지 - 프로필 정보
// ════════════════════════════════════════════════════════════════════════════════

type Mode = "view" | "verify" | "edit";
const PHONE_REGEX = /^01[0-9]-\d{3,4}-\d{4}$/;

export default function ProfilePage() {
  // ══════════════════════════════════════════════════════════════════════════
  // 상태
  // ══════════════════════════════════════════════════════════════════════════
  const [mode, setMode] = useState<Mode>("view");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 회원 정보
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");

  // [2] 비밀번호 확인
  const [verifyPw, setVerifyPw] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // [3] 프로필 수정
  const [phoneErr, setPhoneErr] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // [4] 회원 탈퇴
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawPw, setWithdrawPw] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // ══════════════════════════════════════════════════════════════════════════
  // 1. 내 정보 조회
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const me = await getMyProfile();
        if (!mounted) return;
        setName(me.name ?? "");
        setEmail(me.email ?? "");
        setNickname(me.nickname ?? "");
        setPhone(me.phone ?? "");
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. 비밀번호 확인 (수정 진입 전)
  // ══════════════════════════════════════════════════════════════════════════
  const goVerify = () => {
    setVerifyPw("");
    setVerifyError("");
    setMode("verify");
  };

  // POST /me/verify-password (서버에 인증 상태 기록 후 수정 진입)
  const handleVerifyConfirm = async () => {
    if (!verifyPw.trim() || verifying) return;
    setVerifying(true);
    setVerifyError("");
    try {
      await verifyPassword(verifyPw);
      setVerifyPw("");
      setPhoneErr("");
      setMode("edit");
    } catch (err) {
      setVerifyError(
        err instanceof Error ? err.message : "비밀번호가 일치하지 않습니다.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 3. 프로필 수정 (닉네임 / 전화번호)
  // ══════════════════════════════════════════════════════════════════════════
  // 전화번호 형식 검증 (회원가입과 동일 양식)
  const validatePhone = (value: string) => {
    if (!value.trim()) {
      setPhoneErr("전화번호를 입력해주세요.");
      return false;
    }
    if (!PHONE_REGEX.test(value)) {
      setPhoneErr("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return false;
    }
    setPhoneErr("");
    return true;
  };

  // 수정 완료 클릭
  const handleSaveClick = () => {
    if (!nickname.trim()) return;
    if (!validatePhone(phone)) return;
    setConfirmOpen(true);
  };

  // 닉네임 갱신
  const handleUpdateConfirm = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await updateMyProfile({ nickname, phone });

      // 상단 닉네임 동기화
      if (typeof window !== "undefined") {
        localStorage.setItem("userNickname", nickname);
        window.dispatchEvent(new Event("loginSuccess"));
      }

      // 서버 최신값 재조회 (새로고침 없이 동기화)
      const me = await getMyProfile();
      setName(me.name ?? "");
      setEmail(me.email ?? "");
      setNickname(me.nickname ?? "");
      setPhone(me.phone ?? "");

      setMode("view");
      setDoneOpen(true);
    } catch (err) {
      setAlertMsg(
        err instanceof Error ? err.message : "프로필 수정에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 4. 회원 탈퇴
  // ══════════════════════════════════════════════════════════════════════════
  const closeWithdraw = () => {
    if (withdrawing) return;
    setWithdrawOpen(false);
    setWithdrawPw("");
    setWithdrawError("");
  };

  // DELETE /me { password } (비밀번호 재확인 후 탈퇴)
  const handleWithdrawConfirm = async () => {
    if (!withdrawPw.trim() || withdrawing) return;
    setWithdrawing(true);
    setWithdrawError("");
    try {
      await withdrawUser(withdrawPw);

      // 세션 정리 (로그아웃과 동일): 로컬/세션/쿠키 제거 + 상단 상태 갱신
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
      setWithdrawError(
        err instanceof Error ? err.message : "회원 탈퇴에 실패했습니다.",
      );
      setWithdrawing(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 공통 스타일 / 로딩·에러
  // ══════════════════════════════════════════════════════════════════════════
  const fieldLabel = "text-sm text-gray-500 mb-1.5";
  const fieldBase =
    "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-base text-gray-800";

  if (loading) {
    return <LoadingIndicator message="회원 정보를 불러오는 중입니다." />;
  }
  if (error) {
    return (
      <ErrorPageView status={500} message="회원 정보를 불러오지 못했습니다." />
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 렌더 1) 비밀번호 확인 화면
  // ════════════════════════════════════════════════════════════════════════════
  if (mode === "verify") {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-90 border border-gray-200 rounded-xl bg-white p-7 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
            비밀번호 확인
          </h2>
          <input
            type="password"
            value={verifyPw}
            onChange={(e) => {
              setVerifyPw(e.target.value);
              if (verifyError) setVerifyError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleVerifyConfirm();
            }}
            placeholder="비밀번호를 입력하세요"
            autoFocus
            className={`w-full border-b pb-2 text-base text-gray-800 outline-none mb-2 ${
              verifyError
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-900"
            }`}
          />
          {verifyError && (
            <p className="mb-4 text-sm text-red-500">{verifyError}</p>
          )}
          <button
            type="button"
            onClick={handleVerifyConfirm}
            disabled={!verifyPw.trim() || verifying}
            className="mt-6 w-full h-11 cursor-pointer bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-950 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? "확인 중" : "확인"}
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 렌더 2) 수정 화면 (닉네임 / 전화번호)
  // ════════════════════════════════════════════════════════════════════════════
  if (mode === "edit") {
    return (
      <>
        <div className="border border-gray-200 rounded-xl bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            프로필 정보
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <p className={fieldLabel}>이름</p>
              <input
                className={`${fieldBase} bg-gray-50 text-gray-400`}
                value={name}
                readOnly
              />
            </div>
            <div>
              <p className={fieldLabel}>이메일</p>
              <input
                className={`${fieldBase} bg-gray-50 text-gray-400`}
                value={email}
                readOnly
              />
            </div>
            <div>
              <p className={fieldLabel}>닉네임</p>
              <input
                className={fieldBase}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div>
              <p className={fieldLabel}>전화번호</p>
              <input
                type="tel"
                className={`${fieldBase} ${phoneErr ? "border-red-500" : ""}`}
                value={phone}
                placeholder="010-0000-0000"
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneErr) setPhoneErr("");
                }}
                onBlur={(e) => validatePhone(e.target.value)}
              />
              {phoneErr && (
                <p className="mt-1.5 text-sm text-red-500">{phoneErr}</p>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-2 mt-8">
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={saving || !nickname.trim()}
              className="px-4 py-2 text-sm font-semibold bg-blue-900 text-white rounded-lg cursor-pointer hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "저장 중" : "수정 완료"}
            </button>
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              className="px-4 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
            >
              회원탈퇴
            </button>
          </div>
        </div>

        {/* 수정 완료 확인 모달 */}
        <TwoButtonModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleUpdateConfirm}
          modalTitle="수정하시겠습니까?"
          modalContent={"수정이 완료되면,\n마이페이지로 이동합니다."}
        />

        {/* 회원탈퇴 — 비밀번호 재확인 모달 */}
        {withdrawOpen && (
          <div
            className="fixed inset-0 z-999 flex h-full w-full items-center justify-center bg-[rgba(16,24,40,0.45)]"
            onClick={closeWithdraw}
          >
            <div
              className="relative w- rounded-2xl bg-bg-box p-8 max-[560px]:w-[calc(100%-32px)]"
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

              <h2 className="mt-6 text-center text-2xl font-medium leading-8 text-[#101828]">
                탈퇴하시겠습니까?
              </h2>
              <p className="mt-3 whitespace-pre-line text-center text-body leading-6 text-[#667085]">
                {
                  "이 작업은 되돌릴 수 없습니다.\n계속하려면 비밀번호를 입력해주세요."
                }
              </p>

              <input
                type="password"
                value={withdrawPw}
                onChange={(e) => {
                  setWithdrawPw(e.target.value);
                  setWithdrawError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleWithdrawConfirm();
                }}
                placeholder="비밀번호를 입력하세요"
                autoFocus
                className={`${fieldBase} mt-6 ${
                  withdrawError ? "border-red-500" : ""
                }`}
              />
              {withdrawError && (
                <p className="mt-1.5 text-sm text-red-500">{withdrawError}</p>
              )}

              <div className="mt-7 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleWithdrawConfirm}
                  disabled={!withdrawPw.trim() || withdrawing}
                  className="h-12 w-32 rounded-[10px] bg-button-red-bg text-text-white text-body font-medium transition-all duration-200 hover:not-disabled:bg-button-red-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {withdrawing ? "처리 중" : "탈퇴"}
                </button>
                <button
                  type="button"
                  onClick={closeWithdraw}
                  disabled={withdrawing}
                  className="h-12 w-32 rounded-[10px] bg-bg-navbar text-[#364153] text-body font-medium transition-all duration-200 hover:not-disabled:bg-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 저장 실패 안내 */}
        <OneButtonModal
          isOpen={!!alertMsg}
          onClose={() => setAlertMsg("")}
          modalTitle="수정 실패"
          modalContent={alertMsg}
        />
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 렌더 3) 조회 화면 (기본)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="border border-gray-200 rounded-xl bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">프로필 정보</h2>
          <button
            type="button"
            onClick={goVerify}
            className="px-4 py-2 text-sm font-semibold bg-blue-900 text-white rounded-lg cursor-pointer hover:bg-blue-950 transition-colors"
          >
            수정
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className={fieldLabel}>이름</p>
            <input
              className={`${fieldBase} bg-gray-50`}
              value={name}
              readOnly
            />
          </div>
          <div>
            <p className={fieldLabel}>이메일</p>
            <input
              className={`${fieldBase} bg-gray-50`}
              value={email}
              readOnly
            />
          </div>
          <div>
            <p className={fieldLabel}>닉네임</p>
            <input
              className={`${fieldBase} bg-gray-50`}
              value={nickname}
              readOnly
            />
          </div>
          <div>
            <p className={fieldLabel}>전화번호</p>
            <input
              className={`${fieldBase} bg-gray-50`}
              value={phone}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* 수정 완료 안내 모달 */}
      <OneButtonModal
        isOpen={doneOpen}
        onClose={() => setDoneOpen(false)}
        modalTitle="수정 완료"
        modalContent="프로필 정보가 수정되었습니다."
      />
    </>
  );
}
