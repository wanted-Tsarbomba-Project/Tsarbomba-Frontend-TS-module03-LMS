"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { DIFFICULTY_MAP } from "../actions";
import { problemDetailClasses } from "../problemDetailStyles";
import type { ProblemSetRecommendation } from "../types";

const CAROUSEL_INTERVAL_MS = 5000;

interface ProblemRecommendationModalProps {
  isHidingToday: boolean;
  onClose: () => void;
  onHideToday: () => void;
  onSelect: (problemSetId: number) => void;
  recommendations: ProblemSetRecommendation[];
}

export default function ProblemRecommendationModal({
  isHidingToday,
  onClose,
  onHideToday,
  onSelect,
  recommendations,
}: ProblemRecommendationModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const modalRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const visibleRecommendations = useMemo(
    () =>
      [...recommendations]
        .sort((prev, next) => prev.rankNo - next.rankNo)
        .slice(0, 3),
    [recommendations],
  );
  const safeActiveIndex =
    visibleRecommendations.length > 0
      ? activeIndex % visibleRecommendations.length
      : 0;
  const activeRecommendation = visibleRecommendations[safeActiveIndex];
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    const previousActiveElement = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (visibleRecommendations.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % visibleRecommendations.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [visibleRecommendations.length]);

  if (!portalTarget || !activeRecommendation) {
    return null;
  }

  return createPortal(
    <div
      className={problemDetailClasses.recommendationOverlay}
      onClick={onClose}
    >
      <section
        aria-labelledby="problem-recommendation-title"
        aria-modal="true"
        className={problemDetailClasses.recommendationModal}
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
        role="dialog"
      >
        <div className={problemDetailClasses.recommendationHeader}>
          <div>
            <p>오늘의 추천 문제</p>
            <h2 id="problem-recommendation-title">이 문제도 풀어볼까요?</h2>
          </div>
          <button
            aria-label="추천 문제 닫기"
            className={problemDetailClasses.recommendationCloseButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </div>

        <button
          className={problemDetailClasses.recommendationCard}
          onClick={() => onSelect(activeRecommendation.problemSetId)}
          type="button"
        >
          <span className={problemDetailClasses.recommendationRank}>
            추천 {activeRecommendation.rankNo}
          </span>
          <strong>{activeRecommendation.title}</strong>
          {activeRecommendation.description && (
            <span>{activeRecommendation.description}</span>
          )}
          <div className={problemDetailClasses.recommendationMeta}>
            {activeRecommendation.categoryName && (
              <span>{activeRecommendation.categoryName}</span>
            )}
            {activeRecommendation.difficulty && (
              <span>
                {DIFFICULTY_MAP[
                  activeRecommendation.difficulty as keyof typeof DIFFICULTY_MAP
                ] ??
                  activeRecommendation.difficulty}
              </span>
            )}
            {typeof activeRecommendation.accuracyRate === "number" && (
              <span>정답률 {activeRecommendation.accuracyRate}%</span>
            )}
          </div>
        </button>

        {visibleRecommendations.length > 1 && (
          <div
            aria-label="추천 문제 순서"
            className={problemDetailClasses.recommendationDots}
          >
            {visibleRecommendations.map((recommendation, index) => (
              <button
                aria-label={`${index + 1}번째 추천 보기`}
                aria-pressed={index === safeActiveIndex}
                className={
                  index === safeActiveIndex
                    ? problemDetailClasses.recommendationDotActive
                    : problemDetailClasses.recommendationDot
                }
                key={recommendation.recommendationId}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
        )}

        <div className={problemDetailClasses.recommendationActions}>
          <button disabled={isHidingToday} onClick={onHideToday} type="button">
            오늘 하루 보지 않기
          </button>
        </div>
      </section>
    </div>,
    portalTarget,
  );
}
