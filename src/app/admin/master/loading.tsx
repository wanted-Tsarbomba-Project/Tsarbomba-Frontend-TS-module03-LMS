import { ListSkeleton } from "@/components/common";

const adminAccountListSkeletonColumns = [
  "No.",
  "이름",
  "닉네임",
  "이메일",
  "회원 관리 권한",
  "규칙 관리 권한",
];

export default function AdminMasterLoading() {
  return (
    <section className="box-border p-[30px]">
      <div className="mb-5 flex items-center justify-between">
        <h1>관리자 관리</h1>
      </div>

      <ListSkeleton
        columns={adminAccountListSkeletonColumns}
        statusMessage="관리자 계정을 불러오는 중입니다."
      />
    </section>
  );
}
