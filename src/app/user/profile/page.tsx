"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OneButtonModal,
  TwoButtonModal,
  WarningModal,
} from "@/components/common";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import ErrorPageView from "@/components/common/ErrorPageView";
import { getMyProfile, updateMyProfile } from "@/services/userService";

// ════════════════════════════════════════════════════════════════════════════════
// 마이페이지 - 프로필 정보
// ════════════════════════════════════════════════════════════════════════════════

type Mode = "view" | "verify" | "edit";

const PW_PLACEHOLDER = "영문+숫자+특수문자 포함 8자 이상";

export default function ProfilePage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("view");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 비밀번호 확인 단계
  const [verifyPw, setVerifyPw] = useState("");

  // 회원 정보
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");

  // 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // 비밀번호 재설정 불일치 (프론트 검증)
  const pwMismatch = newPwConfirm.length > 0 && newPw !== newPwConfirm;

  // ── 내 정보 조회 ────────────────────────────────────────────────────────────
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

  const goVerify = () => {
    setVerifyPw("");
    setMode("verify");
  };

  const handleVerifyConfirm = () => {
    // TODO: POST /api/v1/users/me/verify-password 연동
    setMode("edit");
  };

  // 닉네임 수정 저장 → DB 반영 + 상단(헤더/사이드바) 닉네임 갱신
  const handleUpdateConfirm = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await updateMyProfile({ nickname });

      // 상단 닉네임 동기화: localStorage 갱신 + loginSuccess 이벤트 → Header/Sidebar 반영
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

      setNewPw("");
      setNewPwConfirm("");
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

  const handleWithdrawConfirm = () => {
    // TODO: 회원탈퇴 — DELETE /api/v1/users/me { password } (비번 재확인 + Soft Delete + 쿠키 만료)
    setWithdrawOpen(false);
    router.push("/");
  };

  // ── 공통 입력 필드 ──────────────────────────────────────────────────────────
  const fieldLabel = "text-sm text-gray-500 mb-1.5";
  const fieldBase =
    "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-base text-gray-800";

  // ── 로딩 / 에러 ─────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingIndicator message="회원 정보를 불러오는 중입니다." />;
  }
  if (error) {
    return (
      <ErrorPageView status={500} message="회원 정보를 불러오지 못했습니다." />
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 1) 비밀번호 확인 화면
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
            onChange={(e) => setVerifyPw(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full border-b border-gray-300 pb-2 text-base text-gray-800 outline-none focus:border-blue-900 mb-8"
          />
          <button
            type="button"
            onClick={handleVerifyConfirm}
            className="w-full h-11 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-950 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2) 수정 화면 (좌: 프로필 수정 / 우: 비밀번호 재설정)
  // ════════════════════════════════════════════════════════════════════════════
  if (mode === "edit") {
    return (
      <>
        <div className="flex gap-5 items-start max-lg:flex-col">
          {/* 좌측 — 프로필 정보 수정 */}
          <div className="flex-1 min-w-0 border border-gray-200 rounded-xl bg-white p-6">
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
                  className={`${fieldBase} bg-gray-50 text-gray-400`}
                  value={phone}
                  readOnly
                />
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-end gap-2 mt-8">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={saving || !nickname.trim()}
                className="px-4 py-2 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "저장 중" : "수정 완료"}
              </button>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="px-4 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                회원탈퇴
              </button>
            </div>
          </div>

          {/* 우측 — 비밀번호 재설정 */}
          <div className="w-80 shrink-0 border border-gray-200 rounded-xl bg-white p-6 max-lg:w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              비밀번호 재설정
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <p className={fieldLabel}>새 비밀번호 입력</p>
                <input
                  type="password"
                  className={fieldBase}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder={PW_PLACEHOLDER}
                />
              </div>
              <div>
                <p className={fieldLabel}>새 비밀번호 입력 확인</p>
                <input
                  type="password"
                  className={`${fieldBase} ${
                    pwMismatch ? "border-red-500" : ""
                  }`}
                  value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)}
                  placeholder="비밀번호를 한 번 더 입력해주세요"
                />
                {pwMismatch && (
                  <p className="mt-1 text-xs text-red-500">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={pwMismatch || !newPw}
                className="w-full h-11 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
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

        {/* 회원탈퇴 경고 모달 */}
        <WarningModal
          isOpen={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          onConfirm={handleWithdrawConfirm}
          modalTitle="탈퇴하시겠습니까?"
          modalContent={
            "이 작업은 되돌릴 수 없습니다.\n삭제된 데이터는 복구할 수 없습니다."
          }
        />

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
  // 3) 조회 화면 (기본)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="border border-gray-200 rounded-xl bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">프로필 정보</h2>
          <button
            type="button"
            onClick={goVerify}
            className="px-4 py-2 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors"
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
