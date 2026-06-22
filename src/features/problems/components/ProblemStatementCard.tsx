"use client";

import { memo } from "react";

import { problemDetailClasses } from "../problemDetailStyles";

interface ProblemStatementCardProps {
  content?: string;
}

function ProblemStatementCard({ content }: ProblemStatementCardProps) {
  return (
    <article className={problemDetailClasses.problemBox}>
      <h2>문제 내용</h2>
      <div className={problemDetailClasses.problemContent}>{content}</div>
    </article>
  );
}

export default memo(ProblemStatementCard);
