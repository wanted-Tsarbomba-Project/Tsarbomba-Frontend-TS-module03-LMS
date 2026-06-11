"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

type PageItem =
  | {
      type: "page";
      page: number;
    }
  | {
      type: "ellipsis";
      key: string;
    };

const SIBLING_COUNT = 2;

const paginationClasses = {
  container: "flex items-center justify-center gap-2",
  button:
    "min-w-9 h-9 cursor-pointer rounded-base border border-border-light bg-bg-box px-3 text-description font-semibold text-text-primary transition-colors hover:cursor-pointer hover:bg-bg-hover-gray disabled:cursor-not-allowed disabled:opacity-50",
  activeButton:
    "min-w-9 h-9 cursor-pointer rounded-base border border-button-blue-bg bg-button-blue-bg px-3 text-description font-semibold text-text-white transition-colors hover:cursor-pointer",
  ellipsis:
    "flex h-9 min-w-9 items-center justify-center px-1 text-description font-semibold text-text-secondary",
} as const;

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, page) => ({
      type: "page",
      page,
    }));
  }

  const firstPage = 0;
  const lastPage = totalPages - 1;
  const start = Math.max(1, currentPage - SIBLING_COUNT);
  const end = Math.min(lastPage - 1, currentPage + SIBLING_COUNT);
  const items: PageItem[] = [{ type: "page", page: firstPage }];

  if (start > 1) {
    items.push({ type: "ellipsis", key: "start-ellipsis" });
  }

  for (let page = start; page <= end; page += 1) {
    items.push({ type: "page", page });
  }

  if (end < lastPage - 1) {
    items.push({ type: "ellipsis", key: "end-ellipsis" });
  }

  items.push({ type: "page", page: lastPage });

  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 0), safeTotalPages - 1);
  const pageItems = getPageItems(safeCurrentPage, safeTotalPages);

  if (safeTotalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="페이지네이션" className={paginationClasses.container}>
      <button
        className={paginationClasses.button}
        disabled={disabled || safeCurrentPage === 0}
        onClick={() => onPageChange(safeCurrentPage - 1)}
        type="button"
      >
        이전
      </button>

      {pageItems.map((item) => {
        if (item.type === "ellipsis") {
          return (
            <span
              aria-hidden="true"
              className={paginationClasses.ellipsis}
              key={item.key}
            >
              ...
            </span>
          );
        }

        return (
          <button
            aria-current={item.page === safeCurrentPage ? "page" : undefined}
            className={
              item.page === safeCurrentPage
                ? paginationClasses.activeButton
                : paginationClasses.button
            }
            disabled={disabled}
            key={item.page}
            onClick={() => onPageChange(item.page)}
            type="button"
          >
            {item.page + 1}
          </button>
        );
      })}

      <button
        className={paginationClasses.button}
        disabled={disabled || safeCurrentPage >= safeTotalPages - 1}
        onClick={() => onPageChange(safeCurrentPage + 1)}
        type="button"
      >
        다음
      </button>
    </nav>
  );
}
