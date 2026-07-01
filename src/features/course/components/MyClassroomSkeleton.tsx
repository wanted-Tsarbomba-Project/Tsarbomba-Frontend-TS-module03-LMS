import { Skeleton } from "primereact/skeleton";

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Skeleton borderRadius="0" height="144px" width="100%" />
      <div className="p-4">
        <Skeleton borderRadius="8px" height="20px" width="72px" />
        <Skeleton borderRadius="8px" className="mt-3" height="22px" width="78%" />
        <Skeleton borderRadius="8px" className="mt-2" height="16px" width="92%" />
        <Skeleton borderRadius="8px" className="mt-2" height="16px" width="68%" />
        <Skeleton borderRadius="8px" className="mt-4" height="38px" width="100%" />
      </div>
    </div>
  );
}

function ClassroomSectionSkeleton({ title }: { title: string }) {
  return (
    <section className="rounded-lg border border-gray-200 p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <Skeleton borderRadius="999px" height="22px" width="38px" />
      </div>

      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export default function MyClassroomSkeleton() {
  return (
    <div
      aria-busy="true"
      className="mx-auto max-w-6xl space-y-6 px-6"
    >
      <p aria-live="polite" className="sr-only" role="status">
        내 강의실 정보를 불러오는 중입니다.
      </p>

      <ClassroomSectionSkeleton title="진행 중인 강의" />
      <ClassroomSectionSkeleton title="완료한 강의" />
    </div>
  );
}
