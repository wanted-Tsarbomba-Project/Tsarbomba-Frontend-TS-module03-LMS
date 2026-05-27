"use client"; // 필수

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로그 수집 (예: Sentry, 콘솔 등)
    console.error(error);
  }, [error]);

  return <div></div>;
}
