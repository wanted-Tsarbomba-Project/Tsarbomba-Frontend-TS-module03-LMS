"use client";

import { useId, useState } from "react";
import { OneButtonModal, TwoButtonModal } from "@/components/common";
import { updateMyProfile } from "../actions";
import { PHONE_REGEX, toUserMessage } from "../validation";
import type { MyProfile } from "../types";
import { fieldBase, fieldLabel } from "./styles";
import ReadonlyField from "./ReadonlyField";

// 프로필 수정
export default function ProfileEditForm({
  profile,
  onSaved,
  onWithdraw,
}: {
  profile: MyProfile;
  onSaved: (updated: { nickname: string; phone: string }) => void;
  onWithdraw: () => void;
}) {
  const nicknameId = useId();
  const phoneId = useId();
  const [nickname, setNickname] = useState(profile.nickname);
  const [phone, setPhone] = useState(profile.phone);
  const [phoneErr, setPhoneErr] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // 전화번호 형식 검증 (회원가입과 동일 양식)
  const validatePhone = (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      setPhoneErr("전화번호를 입력해주세요.");
      return false;
    }
    if (!PHONE_REGEX.test(normalized)) {
      setPhoneErr("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return false;
    }
    setPhoneErr("");
    return true;
  };

  const handleSaveClick = () => {
    if (!nickname.trim()) return;
    if (!validatePhone(phone)) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const normalizedNickname = nickname.trim();
    const normalizedPhone = phone.trim();
    setConfirmOpen(false);
    setSaving(true);
    try {
      await updateMyProfile({
        nickname: normalizedNickname,
        phone: normalizedPhone,
      });

      // 상단 닉네임 동기화 (Header/Sidebar 반영)
      if (typeof window !== "undefined") {
        localStorage.setItem("userNickname", normalizedNickname);
        window.dispatchEvent(new Event("loginSuccess"));
      }

      onSaved({ nickname: normalizedNickname, phone: normalizedPhone });
    } catch (err) {
      setAlertMsg(toUserMessage(err, "프로필 수정에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 border border-border-light rounded-xl bg-bg-box p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-5">
        프로필 정보
      </h2>

      <div className="flex flex-col gap-4">
        <ReadonlyField label="이름" value={profile.name} muted />
        <ReadonlyField label="이메일" value={profile.email} muted />
        <div>
          <label htmlFor={nicknameId} className={fieldLabel}>
            닉네임
          </label>
          <input
            id={nicknameId}
            className={fieldBase}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={phoneId} className={fieldLabel}>
            전화번호
          </label>
          <input
            id={phoneId}
            type="tel"
            className={`${fieldBase} ${phoneErr ? "border-text-red" : ""}`}
            value={phone}
            placeholder="010-0000-0000"
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneErr) setPhoneErr("");
            }}
            onBlur={(e) => validatePhone(e.target.value)}
          />
          {phoneErr && (
            <p className="mt-1.5 text-sm text-text-red">{phoneErr}</p>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-2 mt-8">
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={saving || !nickname.trim()}
          className="px-4 py-2 text-sm font-semibold bg-button-blue-bg text-text-white rounded-lg cursor-pointer hover:bg-button-blue-hover-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "저장 중" : "수정 완료"}
        </button>
        <button
          type="button"
          onClick={onWithdraw}
          className="px-4 py-2 text-sm font-semibold border border-button-red-bg text-button-red-bg rounded-lg cursor-pointer hover:bg-bg-gray-box transition-colors"
        >
          회원탈퇴
        </button>
      </div>

      {/* 수정 완료 확인 모달 */}
      <TwoButtonModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        modalTitle="수정하시겠습니까?"
        modalContent={"수정이 완료되면,\n마이페이지로 이동합니다."}
      />

      {/* 저장 실패 안내 */}
      <OneButtonModal
        isOpen={!!alertMsg}
        onClose={() => setAlertMsg("")}
        modalTitle="수정 실패"
        modalContent={alertMsg}
      />
    </div>
  );
}
