import { Skeleton } from "primereact/skeleton";

import { problemDetailClasses } from "../problemDetailStyles";

const skeletonClasses = {
  nav:
    "w-full border-b border-border-light bg-bg-box py-3 mb-4 animate-pulse",
  navInner:
    "mx-auto flex max-w-300 items-center justify-between px-6 max-md:px-4",
  mainArea:
    "relative flex min-h-[calc(80vh-80px)] gap-4 overflow-hidden py-3.5 max-lg:flex-col",
  sidebar:
    "w-[220px] shrink-0 rounded-base border border-border-light bg-bg-box p-4 max-lg:w-full",
  sidebarList: "mt-5 flex flex-col gap-2",
  contentArea: "flex min-w-0 flex-1 items-stretch gap-3 max-[1180px]:flex-col",
  problemBox:
    "min-w-[260px] flex-[0_0_50%] rounded-base border border-border-light bg-bg-box p-4 max-[1180px]:w-full max-[1180px]:max-w-full max-[1180px]:min-w-0 max-[1180px]:flex-auto",
  solveBox:
    "min-w-[400px] flex-1 rounded-base border border-border-light bg-bg-box p-4 max-[1180px]:min-w-0",
  resizeHandle:
    "w-2 shrink-0 rounded-base bg-border-light max-[1180px]:hidden",
  textBlock: "mt-4 flex flex-col gap-3",
  tabs: "mt-3 mb-2 grid min-w-0 grid-cols-4 gap-2 max-[560px]:gap-1.5",
  submitWrap: "mt-3 flex justify-end",
} as const;

function SkeletonLine({
  height = "1rem",
  width,
}: {
  height?: string;
  width: string;
}) {
  return <Skeleton borderRadius="8px" height={height} width={width} />;
}

export default function ProblemDetailSkeleton() {
  return (
    <main
      aria-label="문제풀이 화면을 불러오는 중입니다."
      aria-busy="true"
      className={problemDetailClasses.container}
    >
      <nav className={skeletonClasses.nav}>
        <div className={skeletonClasses.navInner}>
          <Skeleton borderRadius="8px" height="42px" width="92px" />
          <div className="flex gap-2">
            <Skeleton borderRadius="8px" height="42px" width="92px" />
            <Skeleton borderRadius="8px" height="42px" width="92px" />
          </div>
        </div>
      </nav>

      <div className={skeletonClasses.mainArea}>
        <aside className={skeletonClasses.sidebar}>
          <SkeletonLine height="1.25rem" width="64%" />
          <div className={skeletonClasses.sidebarList}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton
                borderRadius="8px"
                height="40px"
                key={index}
                width={index === 0 ? "100%" : "82%"}
              />
            ))}
          </div>
        </aside>

        <section className={skeletonClasses.contentArea}>
          <article className={skeletonClasses.problemBox}>
            <div className="flex items-center justify-between gap-3">
              <SkeletonLine height="1.25rem" width="110px" />
              <Skeleton borderRadius="8px" height="36px" width="36px" />
            </div>

            <div className={skeletonClasses.textBlock}>
              <SkeletonLine width="92%" />
              <SkeletonLine width="84%" />
              <SkeletonLine width="78%" />
              <SkeletonLine width="88%" />
              <SkeletonLine width="64%" />
            </div>
          </article>

          <div className={skeletonClasses.resizeHandle} />

          <section className={skeletonClasses.solveBox}>
            <SkeletonLine height="1.25rem" width="132px" />
            <div className="mt-3">
              <Skeleton borderRadius="8px" height="220px" width="100%" />
            </div>

            <div className={skeletonClasses.tabs}>
              <Skeleton borderRadius="8px" height="42px" width="100%" />
              <Skeleton borderRadius="8px" height="42px" width="100%" />
              <Skeleton borderRadius="8px" height="42px" width="100%" />
              <Skeleton borderRadius="8px" height="42px" width="100%" />
            </div>

            <Skeleton borderRadius="8px" height="180px" width="100%" />

            <div className={skeletonClasses.submitWrap}>
              <Skeleton borderRadius="8px" height="44px" width="120px" />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
