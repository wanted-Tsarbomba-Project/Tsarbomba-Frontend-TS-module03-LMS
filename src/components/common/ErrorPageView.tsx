"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getStatusGuide, getStatusTitle } from "@/lib/errorHandling";

import styles from "./ErrorPageView.module.css";

interface ErrorPageViewProps {
  status?: number;
  code?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  returnTo?: string;
  onRetry?: () => void;
}

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
    <main className={styles.wrapper}>
      <section className={styles.panel}>
        <p className={styles.status}>{status}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message || getStatusGuide(status)}</p>
        <p className={styles.guide}>{getStatusGuide(status)}</p>

        <div className={styles.actions}>
          {status === 401 && (
            <button
              className={styles.button}
              onClick={() => router.push("/auth/login")}
              type="button"
            >
              로그인으로
            </button>
          )}

          {returnTo && status !== 401 && (
            <button
              className={styles.button}
              onClick={() => router.push(returnTo)}
              type="button"
            >
              이전 화면으로
            </button>
          )}

          {onRetry && (
            <button className={styles.button} onClick={onRetry} type="button">
              다시 시도
            </button>
          )}

          <button
            className={`${styles.button} ${styles.secondaryButton}`}
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
