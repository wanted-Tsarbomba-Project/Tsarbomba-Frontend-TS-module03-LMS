"use client";

import type { MyProfile } from "../types";
import ReadonlyField from "./ReadonlyField";

// 조회 화면
export default function ProfileView({
  profile,
  onEdit,
}: {
  profile: MyProfile;
  onEdit: () => void;
}) {
  const { name, email, nickname, phone } = profile;

  return (
    <div className="border border-border-light rounded-xl bg-bg-box p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-text-primary">프로필 정보</h2>
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 text-sm font-semibold bg-button-blue-bg text-text-white rounded-lg cursor-pointer hover:bg-button-blue-hover-bg transition-colors"
        >
          수정
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <ReadonlyField label="이름" value={name} />
        <ReadonlyField label="이메일" value={email} />
        <ReadonlyField label="닉네임" value={nickname} />
        <ReadonlyField label="전화번호" value={phone} />
      </div>
    </div>
  );
}
