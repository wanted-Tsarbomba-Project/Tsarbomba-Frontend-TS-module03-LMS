import { ListSkeleton } from "@/components/common";

const problemListSkeletonColumns = [
  "No.",
  "문제명",
  "문제 설명",
  "난이도",
  "정답률",
  "등록일",
];

export default function AdminProblemsLoading() {
  return (
    <main className="min-h-screen bg-bg-main p-[30px]">
      <div className="mb-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
        <h2 className="m-0 text-title-lg font-bold text-text-primary">
          문제 관리
        </h2>
      </div>

      <ListSkeleton
        columns={problemListSkeletonColumns}
        statusMessage="문제 목록을 불러오는 중입니다."
      />
    </main>
  );
}
