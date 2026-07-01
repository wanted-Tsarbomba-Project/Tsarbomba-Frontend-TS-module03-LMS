"use client";

import { useState } from "react";
import { OneButtonModal } from "@/components/common";
import type { Mode, MyProfile } from "../types";
import ProfileView from "./ProfileView";
import PasswordVerifyCard from "./PasswordVerifyCard";
import ProfileEditForm from "./ProfileEditForm";
import PasswordChangePanel from "./PasswordChangePanel";
import WithdrawModal from "./WithdrawModal";

export default function ProfileClient({
  initialProfile,
}: {
  initialProfile: MyProfile;
}) {
  const [profile, setProfile] = useState<MyProfile>(initialProfile);
  const [mode, setMode] = useState<Mode>("view");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  // 소셜(구글) 계정은 비밀번호가 없어 재인증·비번변경 흐름을 쓸 수 없음 → provider 로 분기.
  const isSocial = profile.provider === "GOOGLE";

  // 저장 성공
  const handleSaved = (updated: { nickname: string; phone: string }) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    setMode("view");
    setDoneOpen(true);
  };

  if (mode === "verify") {
    return <PasswordVerifyCard onVerified={() => setMode("edit")} />;
  }

  if (mode === "edit") {
    return (
      <>
        <div className="flex gap-5 items-start max-lg:flex-col">
          <ProfileEditForm
            profile={profile}
            onSaved={handleSaved}
            onWithdraw={() => setWithdrawOpen(true)}
          />
          {/* 비밀번호 변경은 LOCAL 계정만 — 소셜 계정은 비밀번호가 없어 숨김 */}
          {!isSocial && <PasswordChangePanel email={profile.email} />}
        </div>

        <WithdrawModal
          open={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          provider={profile.provider}
        />
      </>
    );
  }

  // 기본: 조회 화면
  return (
    <>
      {/* 소셜 계정은 비번 재인증을 못 하므로 수정 클릭 시 바로 편집 모드로 */}
      <ProfileView
        profile={profile}
        onEdit={() => setMode(isSocial ? "edit" : "verify")}
      />

      <OneButtonModal
        isOpen={doneOpen}
        onClose={() => setDoneOpen(false)}
        modalTitle="수정 완료"
        modalContent="프로필 정보가 수정되었습니다."
      />
    </>
  );
}
