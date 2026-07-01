import { Skeleton } from "primereact/skeleton";

const problemFormPageClasses = {
  container: "min-h-screen bg-bg-main p-[30px]",
  pageTitle: "mt-0 mb-5 text-title-lg font-bold text-text-primary",
  sectionBox:
    "mb-[25px] rounded-base border border-border-light bg-bg-box p-[25px]",
  row: "flex gap-5 max-md:flex-col max-md:gap-0",
  inputGroup: "mb-5 flex flex-1 flex-col gap-2.5",
  bottomButtonGroup: "flex justify-end gap-[15px]",
} as const;

function FieldSkeleton({ height = "46px" }: { height?: string }) {
  return (
    <div className={problemFormPageClasses.inputGroup}>
      <Skeleton borderRadius="8px" height="20px" width="88px" />
      <Skeleton borderRadius="8px" height={height} width="100%" />
    </div>
  );
}

function SubProblemSkeleton({ index }: { index: number }) {
  return (
    <section className={problemFormPageClasses.sectionBox}>
      <div className="mb-[25px] flex items-center justify-between">
        <h3 className="m-0 text-title-md font-bold text-text-primary">
          소문제 {index + 1}
        </h3>
        <Skeleton borderRadius="8px" height="42px" width="56px" />
      </div>

      <div className={problemFormPageClasses.row}>
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton height="120px" />
      <FieldSkeleton />
      <FieldSkeleton height="120px" />
      <FieldSkeleton />

      <div className="mt-2.5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
          <h4 className="m-0 text-title-md font-bold text-text-primary">
            테스트 케이스
          </h4>
          <Skeleton borderRadius="8px" height="38px" width="104px" />
        </div>
        <div className="rounded-base border border-border-light bg-bg-box p-4">
          <div className="mb-[25px] flex items-center justify-between">
            <Skeleton borderRadius="8px" height="20px" width="72px" />
            <Skeleton borderRadius="8px" height="42px" width="56px" />
          </div>
          <FieldSkeleton height="120px" />
          <div className={problemFormPageClasses.row}>
            <FieldSkeleton />
            <Skeleton borderRadius="8px" className="mt-[30px]" height="46px" width="180px" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProblemEditSkeleton() {
  return (
    <main
      aria-busy="true"
      className={problemFormPageClasses.container}
    >
      <p aria-live="polite" className="sr-only" role="status">
        문제 수정 정보를 불러오는 중입니다.
      </p>

      <h2 className={problemFormPageClasses.pageTitle}>문제 수정</h2>

      <section aria-hidden="true" className={problemFormPageClasses.sectionBox}>
        <div className={problemFormPageClasses.row}>
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton />
        <div className={problemFormPageClasses.inputGroup}>
          <Skeleton borderRadius="8px" height="20px" width="88px" />
          <div className="flex items-center gap-2.5 max-md:flex-col max-md:items-stretch">
            <Skeleton borderRadius="8px" height="42px" width="100%" />
            <Skeleton borderRadius="8px" height="42px" width="56px" />
          </div>
        </div>
      </section>

      <div aria-hidden="true">
        <SubProblemSkeleton index={0} />
        <SubProblemSkeleton index={1} />
      </div>

      <div aria-hidden="true" className={problemFormPageClasses.bottomButtonGroup}>
        <Skeleton borderRadius="8px" height="46px" width="92px" />
        <Skeleton borderRadius="8px" height="46px" width="92px" />
        <Skeleton borderRadius="8px" height="46px" width="92px" />
      </div>
    </main>
  );
}
