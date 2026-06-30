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
  setPlaybackRate(rate: number): void;
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
    onPlaybackRateChange?: (event: { data: number; target: YTPlayer }) => void;
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
  const autoSaveTimerRef = useRef<number | null>(null);
  const existingWatchedSecRef = useRef(0);
  const completedRef = useRef(false);
  const lastSafePosRef = useRef(0);
  // 저장 직렬화 — 자동저장/일시정지/종료 저장이 겹쳐 delta 중복·위치 역전되는 것 방지
  const savingRef = useRef(false);
  // 재생바 끝 도달로 강제 완료 저장을 1회만 트리거하기 위한 가드
  const endSaveTriggeredRef = useRef(false);

  // 재생 중 주기 저장 간격 — 위치 이어보기용 (완료는 영상 끝 도달 시에만)
  const AUTO_SAVE_INTERVAL_MS = 10_000;
  // 재생 중 BE 누적 상한 비율 — 완료 기준(90%) 직전까지만 보고해 끝까지 봐야 완료되게 함
  const PLAYING_CAP_RATIO = 0.89;

  // 콜백 ref 갱신은 effect 안에서 — render 도중 ref.current 변형 금지 룰 준수.
  const onProgressSavedRef = useRef(onProgressSaved);
  useEffect(() => {
    onProgressSavedRef.current = onProgressSaved;
  }, [onProgressSaved]);

  useEffect(() => {
    const videoId = getYoutubeVideoId(videoUrl);
    if (!videoId) return;

    // 강의 전환 시 이전 강의의 진도 값이 남지 않도록 초기화 (init 실패해도 안전)
    existingWatchedSecRef.current = 0;
    completedRef.current = false;
    lastSafePosRef.current = 0;
    watchedDeltaRef.current = 0;
    savingRef.current = false;
    endSaveTriggeredRef.current = false;

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

        // 재생바가 끝(±1.5초)에 닿으면 강제 완료 저장 — YT ENDED 이벤트 누락 대비.
        const duration = player.getDuration();
        if (
          !completedRef.current &&
          !endSaveTriggeredRef.current &&
          duration > 0 &&
          currentPos >= duration - 1.5
        ) {
          endSaveTriggeredRef.current = true;
          void saveProgress(true);
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

    const startAutoSaveTimer = () => {
      if (autoSaveTimerRef.current !== null) return;
      autoSaveTimerRef.current = window.setInterval(() => {
        void saveProgress();
      }, AUTO_SAVE_INTERVAL_MS);
    };

    const stopAutoSaveTimer = () => {
      if (autoSaveTimerRef.current !== null) {
        window.clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };

    // ended=true: 영상 끝까지 본 경우 재생바를 끝으로 두고 누적을 durationSec 까지 채워 BE 100% 완료 판단 유도
    const saveProgress = async (ended = false) => {
      const player = playerRef.current;
      if (!player) return;
      // 직렬화 — 진행 중 저장이 있으면 자동저장은 건너뛰고, 종료 저장은 끝난 뒤 한 번 더 실행
      if (savingRef.current) {
        if (ended) {
          window.setTimeout(() => void saveProgress(true), 300);
        }
        return;
      }
      savingRef.current = true;
      try {
        await runSaveProgress(ended);
      } finally {
        savingRef.current = false;
      }
    };

    const runSaveProgress = async (ended: boolean) => {
      const player = playerRef.current;
      if (!player) return;

      const durationSec = Math.floor(player.getDuration());
      const rawDelta = watchedDeltaRef.current;

      // BE 실제 누적을 다시 읽어 남은 만큼만 전송 — FE 추적값이 낮으면 과다 전송돼 LRN-010 거부됨
      if (ended && durationSec > 0) {
        try {
          const fresh = await getLectureProgress(lectureId);
          existingWatchedSecRef.current = fresh?.watchedSec ?? 0;
        } catch {
          /* 조회 실패해도 아래 로직으로 진행 */
        }
      }

      // 재생 중에는 누적이 완료 기준(90%)에 닿지 않도록 89% 로 상한 → 영상 끝(ended)에 도달해야만 완료.
      const allowedTotalSec =
        durationSec > 0
          ? ended
            ? durationSec
            : Math.floor(durationSec * PLAYING_CAP_RATIO)
          : 0;
      const remaining =
        durationSec > 0
          ? Math.max(0, allowedTotalSec - existingWatchedSecRef.current)
          : rawDelta;
      const watchedDeltaSec = ended
        ? remaining
        : Math.min(rawDelta, remaining);
      const lastPositionSec =
        ended && durationSec > 0
          ? durationSec
          : Math.floor(player.getCurrentTime());

      // 끝까지 봄 → 이후 seek 제한 해제 (완료 확정은 BE 가 누적 100% 로 판정)
      if (ended) completedRef.current = true;

      if (watchedDeltaSec <= 0) {
        watchedDeltaRef.current = 0;
        // 종료인데 이미 채워진 상태면 갱신만 트리거 (완료 모달 노출용)
        if (ended) onProgressSavedRef.current?.();
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
        onProgressSavedRef.current?.();
      } catch {
        watchedDeltaRef.current += rawDelta;
        // 저장 실패 시 완료 처리 롤백 — seek 제한 유지
        if (ended) {
          completedRef.current = false;
          endSaveTriggeredRef.current = false;
        }
      }
    };

    const init = async () => {
      try {
        const p = await getLectureProgress(lectureId);
        existingWatchedSecRef.current = p?.watchedSec ?? 0;
        completedRef.current = !!p?.completed;
        // 이어보기는 영상 위치(lastPositionSec) 기준 — watchedSec(시청 시간)을 섞으면
        // 저장 타이밍/상한 차이로 last > watched 가 되어 되감김이 생김.
        // 안 본 구간 앞 점프는 재생 중 seek 차단이 막으므로 위치값만 사용해도 안전.
        initialLastPosition = p?.lastPositionSec ?? 0;
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
          // 첫 시청(미완료) 중에는 배속을 1배로 강제 — 빨리 감아 완료 처리되는 것 방지.
          onPlaybackRateChange: ({ data, target }) => {
            if (!completedRef.current && data !== 1) {
              target.setPlaybackRate(1);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState.PLAYING) {
              playingRef.current = true;
              startWatchTimer();
              startAutoSaveTimer();
              return;
            }
            if (event.data === window.YT?.PlayerState.ENDED) {
              playingRef.current = false;
              stopWatchTimer();
              stopAutoSaveTimer();
              void saveProgress(true); // 끝까지 봄 → 100% 강제 마감
              return;
            }
            if (event.data === window.YT?.PlayerState.PAUSED) {
              playingRef.current = false;
              stopWatchTimer();
              stopAutoSaveTimer();
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
      stopAutoSaveTimer();
      void saveProgress();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [lectureId, videoUrl]);

  return <div ref={containerRef} title={title} className="w-full h-full" />;
}
