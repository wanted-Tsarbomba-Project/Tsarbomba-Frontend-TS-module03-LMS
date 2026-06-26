"use client";

import { memo } from "react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { problemDetailClasses } from "../problemDetailStyles";

interface ProblemStatementCardProps {
  className?: string;
  content?: string;
  isDownloadingDataset?: boolean;
  onDownloadDataset?: () => void;
  style?: CSSProperties;
}

function ProblemStatementCard({
  className = "",
  content,
  isDownloadingDataset = false,
  onDownloadDataset,
  style,
}: ProblemStatementCardProps) {
  return (
    <article
      className={`${problemDetailClasses.problemBox} ${className}`}
      style={style}
    >
      <div className={problemDetailClasses.problemHeader}>
        <h2>문제 내용</h2>
        {onDownloadDataset && (
          <button
            aria-label="CSV 다운로드"
            className={problemDetailClasses.datasetDownloadButton}
            disabled={isDownloadingDataset}
            onClick={onDownloadDataset}
            title="CSV 다운로드"
            type="button"
          >
            <Image
              alt=""
              height={18}
              src="/assets/img/download-Icon.svg"
              width={18}
            />
          </button>
        )}
      </div>
      <div className={problemDetailClasses.problemContent}>{content}</div>
    </article>
  );
}

export default memo(ProblemStatementCard);
