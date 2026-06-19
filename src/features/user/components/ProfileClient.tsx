"use client";

import { useState } from "react";
import { OneButtonModal } from "@/components/common";
import { getMyProfile } from "../actions";
import type { Mode, MyProfile } from "../types";
import ProfileView from "./ProfileView";
import PasswordVerifyCard from "./PasswordVerifyCard";
import ProfileEditForm from "./ProfileEditForm";
import PasswordResetPanel from "./PasswordResetPanel";
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

  // 수정 저장 완료
  const handleSaved = async () => {
    try {
      setProfile(await getMyProfile());
    } finally {
      setMode("view");
      setDoneOpen(true);
    }
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
          <PasswordResetPanel email={profile.email} />
        </div>

        <WithdrawModal
          open={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
        />
      </>
    );
  }

  // 기본: 조회 화면
  return (
    <>
      <ProfileView profile={profile} onEdit={() => setMode("verify")} />

      <OneButtonModal
        isOpen={doneOpen}
        onClose={() => setDoneOpen(false)}
        modalTitle="수정 완료"
        modalContent="프로필 정보가 수정되었습니다."
      />
    </>
  );
}
