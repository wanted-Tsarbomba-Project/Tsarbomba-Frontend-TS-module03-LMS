import { ListSkeleton } from "@/components/common";
import { ADMIN_COURSE_LIST_COLUMN_LABELS } from "@/features/course/constants";

export default function AdminCoursesLoading() {
  return (
    <div className="min-h-screen w-full p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="m-0 text-title-lg font-bold text-text-primary">
          강의 관리
        </h1>
      </div>

      <ListSkeleton
        columns={[...ADMIN_COURSE_LIST_COLUMN_LABELS]}
        statusMessage="강의 목록을 불러오는 중입니다."
      />
    </div>
  );
}
