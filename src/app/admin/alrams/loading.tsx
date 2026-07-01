import { ListSkeleton } from "@/components/common";
import {
  ALERT_LIST_COLUMN_LABELS,
  ALERT_PAGE_SIZE,
} from "@/features/admin/operations/constants";

export default function AdminAlramsLoading() {
  return (
    <div className="box-border p-[30px]">
      <div className="mb-5 flex items-center justify-between">
        <h1>알람 관리</h1>
      </div>

      <ListSkeleton
        columns={[...ALERT_LIST_COLUMN_LABELS]}
        rowCount={ALERT_PAGE_SIZE}
        statusMessage="알람 목록을 불러오는 중입니다."
      />
    </div>
  );
}
