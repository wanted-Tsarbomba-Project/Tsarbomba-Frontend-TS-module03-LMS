import type { Key, ReactNode } from "react";

import styles from "./List.module.css";

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
  scrollable?: boolean;
  pagination?: ReactNode;
  emptyMessage?: ReactNode;
}

export default function List<T extends ListItem>({
  data,
  columns,
  onRowClick,
  rowKey,
  scrollable = true,
  pagination = null,
  emptyMessage = "조회된 데이터가 없습니다.",
}: ListProps<T>) {
  const table = (
    <table className={styles.table}>
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
              key={rowKey?.(item, index) ?? item.id ?? index}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td key={String(column.key)}>
                  <div className={styles.cellContent}>
                    {getCellContent(item, column, index)}
                  </div>
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length}>
              <div className={styles.cellContent}>{emptyMessage}</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className={styles.container}>
      {scrollable ? <div className={styles.scrollArea}>{table}</div> : table}

      {pagination && <div className={styles.pagination}>{pagination}</div>}
    </div>
  );
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
