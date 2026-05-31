import styles from "./LoadingIndicator.module.css";

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({
  message = "로딩 중입니다.",
}: LoadingIndicatorProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={styles.wrapper}
      role="status"
    >
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
