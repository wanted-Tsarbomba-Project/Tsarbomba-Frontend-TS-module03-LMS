"use client";

// CSR - 전역 에러 페이지: 런타임 렌더링 오류를 클라이언트에서 감지하고 복구 동작을 제공함
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
