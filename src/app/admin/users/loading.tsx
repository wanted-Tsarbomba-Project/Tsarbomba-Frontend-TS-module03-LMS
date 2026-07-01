import { ListSkeleton } from "@/components/common";
import {
  ADMIN_USER_LIST_COLUMN_LABELS,
  ADMIN_USER_PAGE_SIZE,
} from "@/features/admin/operations/constants";

export default function AdminUsersLoading() {
  return (
    <div className="box-border p-[30px]">
      <div className="mb-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
        <h1 className="m-0 text-title-lg font-bold text-text-primary">
          회원 관리
        </h1>
      </div>

      <ListSkeleton
        columns={[...ADMIN_USER_LIST_COLUMN_LABELS]}
        rowCount={ADMIN_USER_PAGE_SIZE}
        statusMessage="회원 목록을 불러오는 중입니다."
      />
    </div>
  );
}
