import { Skeleton } from "primereact/skeleton";

const problemListSkeletonClasses = {
  container: "min-h-screen bg-bg-main py-[30px] max-md:py-6",
  pageTitle: "mt-0 mb-5 text-title-lg font-bold text-text-primary",
  scrollArea:
    "max-h-[min(520px,calc(100vh-260px))] overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
  table:
    "w-full table-fixed border-collapse [&_td]:overflow-hidden [&_td]:text-ellipsis [&_td]:whitespace-nowrap [&_th]:overflow-hidden [&_th]:text-ellipsis [&_th]:whitespace-nowrap [&_thead_th]:h-[50px] [&_thead_th]:border-y [&_thead_th]:border-border-light [&_thead_th]:bg-bg-navbar [&_thead_th]:text-center [&_thead_th]:align-middle [&_thead_th]:font-semibold [&_tbody_td]:h-[50px] [&_tbody_td]:border-b [&_tbody_td]:border-border-light [&_tbody_td]:p-0 [&_tbody_td]:text-center [&_tbody_td]:align-middle",
  cellContent:
    "box-border flex min-h-[50px] items-center justify-center whitespace-normal break-words p-2",
  pagination: "mt-4 flex justify-center gap-2",
} as const;

const columns = ["No.", "문제명", "문제 설명", "난이도", "정답률", "등록일"];

const rowSkeletonWidths = ["36px", "64%", "82%", "56px", "48px", "76px"];

function SkeletonCell({ index }: { index: number }) {
  return (
    <td>
      <div className={problemListSkeletonClasses.cellContent}>
        <Skeleton
          borderRadius="8px"
          height="18px"
          width={rowSkeletonWidths[index] ?? "60%"}
        />
      </div>
    </td>
  );
}

export default function ProblemListSkeleton() {
  return (
    <main
      aria-busy="true"
      className={problemListSkeletonClasses.container}
    >
      <p aria-live="polite" className="sr-only" role="status">
        문제 목록을 불러오는 중입니다.
      </p>

      <h2 className={problemListSkeletonClasses.pageTitle}>문제풀이</h2>

      <div
        aria-hidden="true"
        className={problemListSkeletonClasses.scrollArea}
      >
        <table className={problemListSkeletonClasses.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 8 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <SkeletonCell index={columnIndex} key={column} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div aria-hidden="true" className={problemListSkeletonClasses.pagination}>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            borderRadius="8px"
            height="36px"
            key={index}
            width={index === 2 ? "44px" : "36px"}
          />
        ))}
      </div>
    </main>
  );
}
