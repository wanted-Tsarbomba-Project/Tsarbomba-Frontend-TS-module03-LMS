import { Skeleton } from "primereact/skeleton";

interface ListSkeletonProps {
  columns: string[];
  containerClassName?: string;
  rowCount?: number;
  statusMessage?: string;
  title?: string;
  titleClassName?: string;
  withPagination?: boolean;
}

const listSkeletonClasses = {
  container: "w-full",
  title: "mt-0 mb-5 text-title-lg font-bold text-text-primary",
  scrollArea:
    "max-h-[min(520px,calc(100vh-260px))] overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
  table:
    "w-full table-fixed border-collapse [&_td]:overflow-hidden [&_td]:text-ellipsis [&_td]:whitespace-nowrap [&_th]:overflow-hidden [&_th]:text-ellipsis [&_th]:whitespace-nowrap [&_thead_th]:h-[50px] [&_thead_th]:border-y [&_thead_th]:border-border-light [&_thead_th]:bg-bg-navbar [&_thead_th]:text-center [&_thead_th]:align-middle [&_thead_th]:font-semibold [&_tbody_td]:h-[50px] [&_tbody_td]:border-b [&_tbody_td]:border-border-light [&_tbody_td]:p-0 [&_tbody_td]:text-center [&_tbody_td]:align-middle",
  cellContent:
    "box-border flex min-h-[50px] items-center justify-center whitespace-normal break-words p-2",
  pagination: "mt-4 flex justify-center gap-2",
} as const;

const rowSkeletonWidths = ["36px", "64%", "82%", "56px", "48px", "76px"];

function SkeletonCell({ index }: { index: number }) {
  return (
    <td>
      <div className={listSkeletonClasses.cellContent}>
        <Skeleton
          borderRadius="8px"
          height="18px"
          width={rowSkeletonWidths[index] ?? "60%"}
        />
      </div>
    </td>
  );
}

export default function ListSkeleton({
  columns,
  containerClassName = listSkeletonClasses.container,
  rowCount = 8,
  statusMessage = "목록을 불러오는 중입니다.",
  title,
  titleClassName = listSkeletonClasses.title,
  withPagination = true,
}: ListSkeletonProps) {
  return (
    <div aria-busy="true" className={containerClassName}>
      <p aria-live="polite" className="sr-only" role="status">
        {statusMessage}
      </p>

      {title && <h2 className={titleClassName}>{title}</h2>}

      <div aria-hidden="true" className={listSkeletonClasses.scrollArea}>
        <table className={listSkeletonClasses.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <SkeletonCell index={columnIndex} key={column} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {withPagination && (
        <div aria-hidden="true" className={listSkeletonClasses.pagination}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              borderRadius="8px"
              height="36px"
              key={index}
              width={index === 2 ? "44px" : "36px"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
