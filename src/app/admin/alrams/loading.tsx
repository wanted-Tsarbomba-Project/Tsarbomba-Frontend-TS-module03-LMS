import { ListSkeleton } from "@/components/common";

const alertListSkeletonColumns = ["No.", "알람 내용", "처리상태"];

export default function AdminAlramsLoading() {
  return (
    <div className="box-border p-[30px]">
      <div className="mb-5 flex items-center justify-between">
        <h1>알람 관리</h1>
      </div>

      <ListSkeleton
        columns={alertListSkeletonColumns}
        statusMessage="알람 목록을 불러오는 중입니다."
      />
    </div>
  );
}
