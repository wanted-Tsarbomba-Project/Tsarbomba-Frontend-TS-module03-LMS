"use client";

import { useEffect, useRef } from "react";
import {
  getLectureProgress,
  recordLectureProgress,
} from "@/features/course/lectureActions";

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    class Player {
      constructor(elementId: string, options: PlayerOptions);
      getCurrentTime(): number;
      getDuration(): number;
      seekTo(seconds: number, allowSeekAhead?: boolean): void;
      destroy(): void;
    }

    interface PlayerOptions {
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: { target: Player }) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
      };
    }

    interface OnStateChangeEvent {
      data: number;
    }

    enum PlayerState {
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
    }
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
  const containerIdRef = useRef(
    `youtube-player-${lectureId}-${Math.random().toString(36).slice(2)}`,
  );

  const playerRef = useRef<YT.Player | null>(null);
  const watchedDeltaRef = useRef(0);
  const playingRef = useRef(false);
  const lastTickAtRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const existingWatchedSecRef = useRef(0);
  const completedRef = useRef(false);
  const lastSafePosRef = useRef(0);
  const onProgressSavedRef = useRef(onProgressSaved);
  onProgressSavedRef.current = onProgressSaved;

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
      } catch {}

      await loadYoutubeApi();
      if (!mounted || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(containerIdRef.current, {
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

  return (
    <div id={containerIdRef.current} title={title} className="w-full h-full" />
  );
}
