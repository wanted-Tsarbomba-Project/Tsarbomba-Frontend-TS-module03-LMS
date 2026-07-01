import { ListSkeleton } from "@/components/common";
import {
  ADMIN_ACCOUNT_LIST_COLUMN_LABELS,
  ADMIN_ACCOUNT_PAGE_SIZE,
} from "@/features/admin/operations/constants";

export default function AdminMasterLoading() {
  return (
    <section className="box-border p-[30px]">
      <div className="mb-5 flex items-center justify-between">
        <h1>관리자 관리</h1>
      </div>

      <ListSkeleton
        columns={[...ADMIN_ACCOUNT_LIST_COLUMN_LABELS]}
        rowCount={ADMIN_ACCOUNT_PAGE_SIZE}
        statusMessage="관리자 계정을 불러오는 중입니다."
      />
    </section>
  );
}
