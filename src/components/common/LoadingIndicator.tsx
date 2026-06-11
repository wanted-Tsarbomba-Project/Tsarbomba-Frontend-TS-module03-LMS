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
      className="box-border flex min-h-[72px] w-full items-center justify-center gap-3 rounded-base border border-border-light bg-bg-box p-6 text-body text-text-secondary"
      role="status"
    >
      <span
        className="h-[22px] w-[22px] animate-spin rounded-full border-[3px] border-bg-navbar border-t-button-blue-bg motion-reduce:animate-[spin_1.6s_linear_infinite]"
        aria-hidden="true"
      />
      <span className="text-body leading-normal text-text-secondary">
        {message}
      </span>
    </div>
  );
}
