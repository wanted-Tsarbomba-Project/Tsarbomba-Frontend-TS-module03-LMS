"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getStatusGuide, getStatusTitle } from "@/lib/errorHandling";

interface ErrorPageViewProps {
  status?: number;
  code?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  returnTo?: string;
  onRetry?: () => void;
}

const errorPageClasses = {
  wrapper:
    "flex min-h-screen items-start justify-center bg-bg-main p-6 text-text-primary",
  panel:
    "w-[min(100%,680px)] rounded-base border border-border-light bg-bg-box p-6 max-[560px]:p-5",
  status:
    "mt-0 mb-2 text-title-md font-semibold leading-[26px] text-text-blue",
  title: "mt-0 mb-3 text-title-lg font-semibold leading-7 text-text-primary",
  message: "mt-0 mb-5 text-body leading-6 text-text-primary",
  guide: "mt-0 mb-6 text-description leading-[22px] text-text-secondary",
  actions: "flex flex-wrap gap-2.5 max-[560px]:flex-col",
  button:
    "h-[42px] cursor-pointer rounded-base border-0 bg-button-blue-bg px-4 text-description font-semibold text-text-white transition-colors duration-200 ease-in-out hover:bg-button-blue-hover-bg max-[560px]:w-full",
  secondaryButton:
    "border border-button-blue-bg bg-bg-box text-text-blue hover:bg-button-blue-bg hover:text-text-white",
};

export default function ErrorPageView({
  status = 500,
  code,
  message,
  path,
  timestamp,
  returnTo,
  onRetry,
}: ErrorPageViewProps) {
  const router = useRouter();
  const title = getStatusTitle(status);

  useEffect(() => {
    if (!code && !path && !timestamp) return;

    console.info("Error details", {
      status,
      code,
      path,
      timestamp,
    });
  }, [code, path, status, timestamp]);

  return (
    <main className={errorPageClasses.wrapper}>
      <section className={errorPageClasses.panel}>
        <p className={errorPageClasses.status}>{status}</p>
        <h1 className={errorPageClasses.title}>{title}</h1>
        <p className={errorPageClasses.message}>{message || getStatusGuide(status)}</p>
        <p className={errorPageClasses.guide}>{getStatusGuide(status)}</p>

        <div className={errorPageClasses.actions}>
          {status === 401 && (
            <button
              className={errorPageClasses.button}
              onClick={() => router.push("/auth/login")}
              type="button"
            >
              로그인으로
            </button>
          )}

          {returnTo && status !== 401 && (
            <button
              className={errorPageClasses.button}
              onClick={() => router.push(returnTo)}
              type="button"
            >
              이전 화면으로
            </button>
          )}

          {onRetry && (
            <button
              className={errorPageClasses.button}
              onClick={onRetry}
              type="button"
            >
              다시 시도
            </button>
          )}

          <button
            className={`${errorPageClasses.button} ${errorPageClasses.secondaryButton}`}
            onClick={() => router.push("/")}
            type="button"
          >
            홈으로
          </button>
        </div>
      </section>
    </main>
  );
}
