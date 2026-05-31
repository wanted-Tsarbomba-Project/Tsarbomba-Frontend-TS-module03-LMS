"use client";

import { useEffect } from "react";

import ErrorPageView from "@/components/common/ErrorPageView";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPageView
      code={error.digest}
      message="화면을 불러오는 중 문제가 발생했습니다."
      onRetry={reset}
      status={500}
    />
  );
}
