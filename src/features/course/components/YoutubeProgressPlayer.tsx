"use client";

import { useEffect, useRef } from "react";
import {
  getLectureProgress,
  recordLectureProgress,
} from "@/features/course/lectureActions";

// YT IFrame API 전역 타입 — namespace 대신 interface 로 선언 (no-namespace 룰 준수).
interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  destroy(): void;
}

interface YTPlayerOptions {
  videoId: string;
  width?: string;
  height?: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number }) => void;
  };
}

interface YTGlobal {
  Player: new (
    element: string | HTMLElement,
    options: YTPlayerOptions,
  ) => YTPlayer;
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2 };
}

declare global {
  interface Window {
    YT?: YTGlobal;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YoutubeProgressPlayerProps {
  lectureId: number | string;
  videoUrl?: string | null;
  title: string;
  onProgressSaved?: () => void;
}

const getYoutubeVideoId = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");

    if (host === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (host === "youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
    }
    return null;
  } catch {
    return null;
  }
};

const loadYoutubeApi = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    window.onYouTubeIframeAPIReady = () => resolve();

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  });
};

export default function YoutubeProgressPlayer({
  lectureId,
  videoUrl,
  title,
  onProgressSaved,
}: YoutubeProgressPlayerProps) {
  // 컨테이너 ref — YT.Player 가 HTMLElement 도 받으므로 랜덤 ID 생성 불필요 (purity 룰 준수).
  const containerRef = useRef<HTMLDivElement | null>(null);

  const playerRef = useRef<YTPlayer | null>(null);
  const watchedDeltaRef = useRef(0);
  const playingRef = useRef(false);
  const lastTickAtRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const existingWatchedSecRef = useRef(0);
  const completedRef = useRef(false);
  const lastSafePosRef = useRef(0);

  // 콜백 ref 갱신은 effect 안에서 — render 도중 ref.current 변형 금지 룰 준수.
  const onProgressSavedRef = useRef(onProgressSaved);
  useEffect(() => {
    onProgressSavedRef.current = onProgressSaved;
  }, [onProgressSaved]);

  useEffect(() => {
    const videoId = getYoutubeVideoId(videoUrl);
    if (!videoId) return;

    let mounted = true;
    let initialLastPosition = 0;

    const startWatchTimer = () => {
      if (tickTimerRef.current !== null) return;
      lastTickAtRef.current = Date.now();

      tickTimerRef.current = window.setInterval(() => {
        const player = playerRef.current;
        if (!playingRef.current || lastTickAtRef.current === null || !player) {
          return;
        }
        const now = Date.now();
        const elapsedSec = Math.floor((now - lastTickAtRef.current) / 1000);

        // 미완료 강의는 앞으로 seek 차단 — 현재 재생 위치가 안전 지점 + 실제 경과보다
        // 의미있게 앞서면 사용자가 점프한 것으로 보고 안전 지점으로 되돌림.
        const currentPos = player.getCurrentTime();
        if (
          !completedRef.current &&
          currentPos > lastSafePosRef.current + elapsedSec + 2
        ) {
          player.seekTo(lastSafePosRef.current, true);
        } else {
          lastSafePosRef.current = currentPos;
        }

        if (elapsedSec > 0) {
          watchedDeltaRef.current += elapsedSec;
          lastTickAtRef.current = now;
        }
      }, 1000);
    };

    const stopWatchTimer = () => {
      if (tickTimerRef.current !== null) {
        window.clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
      lastTickAtRef.current = null;
    };

    const saveProgress = async () => {
      const player = playerRef.current;
      const rawDelta = watchedDeltaRef.current;
      if (!player || rawDelta <= 0) return;

      const lastPositionSec = Math.floor(player.getCurrentTime());
      const durationSec = Math.floor(player.getDuration());

      const remaining =
        durationSec > 0
          ? Math.max(0, durationSec - existingWatchedSecRef.current)
          : rawDelta;
      const watchedDeltaSec = Math.min(rawDelta, remaining);

      if (watchedDeltaSec <= 0) {
        watchedDeltaRef.current = 0;
        return;
      }

      watchedDeltaRef.current = 0;
      try {
        await recordLectureProgress(lectureId, {
          lastPositionSec,
          durationSec: durationSec > 0 ? durationSec : undefined,
          watchedDeltaSec,
        });
        existingWatchedSecRef.current += watchedDeltaSec;
        if (
          !completedRef.current &&
          durationSec > 0 &&
          existingWatchedSecRef.current / durationSec >= 0.9
        ) {
          completedRef.current = true;
        }
        onProgressSavedRef.current?.();
      } catch {
        watchedDeltaRef.current += rawDelta;
      }
    };

    const init = async () => {
      try {
        const p = await getLectureProgress(lectureId);
        existingWatchedSecRef.current = p?.watchedSec ?? 0;
        completedRef.current = !!p?.completed;
        const last = p?.lastPositionSec ?? 0;
        const watched = p?.watchedSec ?? 0;
        initialLastPosition = Math.min(last, watched);
        lastSafePosRef.current = initialLastPosition;
      } catch {
        /* 진도 row 없는 첫 시청 — 0 으로 시작 */
      }

      await loadYoutubeApi();
      if (!mounted || !window.YT?.Player || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          start: initialLastPosition,
        },
        events: {
          onReady: ({ target }) => {
            if (initialLastPosition > 0) {
              target.seekTo(initialLastPosition, true);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState.PLAYING) {
              playingRef.current = true;
              startWatchTimer();
              return;
            }
            if (
              event.data === window.YT?.PlayerState.PAUSED ||
              event.data === window.YT?.PlayerState.ENDED
            ) {
              playingRef.current = false;
              stopWatchTimer();
              void saveProgress();
            }
          },
        },
      });
    };

    void init();

    return () => {
      mounted = false;
      playingRef.current = false;
      stopWatchTimer();
      void saveProgress();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [lectureId, videoUrl]);

  return <div ref={containerRef} title={title} className="w-full h-full" />;
}
