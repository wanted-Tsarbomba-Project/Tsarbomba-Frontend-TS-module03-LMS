import type { Key, ReactNode } from "react";

type ListItem = object & {
  id?: Key;
};

export interface ListColumn<T extends ListItem> {
  key: keyof T | "index" | string;
  label: ReactNode;
  render?: (item: T, index: number) => ReactNode;
}

interface ListProps<T extends ListItem> {
  data: T[];
  columns: ListColumn<T>[];
  onRowClick?: (item: T) => void;
  rowKey?: (item: T, index: number) => Key;
  rowClassName?: string | ((item: T, index: number) => string);
  scrollable?: boolean;
  pagination?: ReactNode;
  emptyMessage?: ReactNode;
}

const listClasses = {
  container: "w-full",
  scrollArea:
    "max-h-[min(520px,calc(100vh-260px))] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
  table:
    "w-full table-fixed border-collapse [&_td]:overflow-hidden [&_td]:text-ellipsis [&_td]:whitespace-nowrap [&_th]:overflow-hidden [&_th]:text-ellipsis [&_th]:whitespace-nowrap [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-[1] [&_thead_th]:h-[50px] [&_thead_th]:border-y [&_thead_th]:border-border-light [&_thead_th]:bg-bg-navbar [&_thead_th]:text-center [&_thead_th]:align-middle [&_thead_th]:font-semibold [&_tbody_td]:h-[50px] [&_tbody_td]:border-b [&_tbody_td]:border-border-light [&_tbody_td]:p-0 [&_tbody_td]:text-center [&_tbody_td]:align-middle [&_tbody_tr:hover_td]:cursor-pointer [&_tbody_tr:hover_td]:bg-[#f0f0f0]",
  cellContent: "box-border whitespace-normal break-words p-2",
  pagination: "mt-4 flex justify-center",
};

export default function List<T extends ListItem>({
  data,
  columns,
  onRowClick,
  rowKey,
  rowClassName,
  scrollable = true,
  pagination = null,
  emptyMessage = "조회된 데이터가 없습니다.",
}: ListProps<T>) {
  const table = (
    <table className={listClasses.table}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)}>{column.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr
              className={getRowClassName(rowClassName, item, index)}
              key={rowKey?.(item, index) ?? item.id ?? index}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td key={String(column.key)}>
                  <div className={listClasses.cellContent}>
                    {getCellContent(item, column, index)}
                  </div>
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length}>
              <div className={listClasses.cellContent}>{emptyMessage}</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className={listClasses.container}>
      {scrollable ? <div className={listClasses.scrollArea}>{table}</div> : table}

      {pagination && <div className={listClasses.pagination}>{pagination}</div>}
    </div>
  );
}

function getRowClassName<T extends ListItem>(
  rowClassName: ListProps<T>["rowClassName"],
  item: T,
  index: number,
) {
  if (typeof rowClassName === "function") {
    return rowClassName(item, index);
  }

  return rowClassName;
}

function getCellContent<T extends ListItem>(
  item: T,
  column: ListColumn<T>,
  index: number,
): ReactNode {
  if (column.key === "index") {
    return index + 1;
  }

  if (column.render) {
    return column.render(item, index);
  }

  const value = (item as Record<string, unknown>)[String(column.key)];

  if (value === null || value === undefined) {
    return "-";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "-";
}
