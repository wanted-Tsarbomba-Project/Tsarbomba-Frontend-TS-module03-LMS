import { ListSkeleton } from "@/components/common";

const problemListSkeletonClasses = {
  container: "min-h-screen bg-bg-main py-[30px] max-md:py-6",
  pageTitle: "mt-0 mb-5 text-title-lg font-bold text-text-primary",
} as const;

const columns = ["No.", "문제명", "문제 설명", "난이도", "정답률", "등록일"];

export default function ProblemListSkeleton() {
  return (
    <ListSkeleton
      columns={columns}
      containerClassName={problemListSkeletonClasses.container}
      statusMessage="문제 목록을 불러오는 중입니다."
      title="문제풀이"
      titleClassName={problemListSkeletonClasses.pageTitle}
    />
  );
}
