import { ListSkeleton } from "@/components/common";

const courseListSkeletonColumns = ["No.", "제목", "상태"];

export default function AdminCoursesLoading() {
  return (
    <div className="min-h-screen w-full p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">강의 관리</h1>
      </div>

      <ListSkeleton
        columns={courseListSkeletonColumns}
        statusMessage="강의 목록을 불러오는 중입니다."
      />
    </div>
  );
}
