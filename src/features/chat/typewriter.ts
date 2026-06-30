interface ChatTypewriterOptions {
  intervalMs?: number;
  onUpdate: (content: string) => void;
  signal?: AbortSignal;
}

const DEFAULT_TYPEWRITER_INTERVAL_MS = 18;
const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("ko", { granularity: "grapheme" })
    : null;

export function createChatTypewriter({
  intervalMs = DEFAULT_TYPEWRITER_INTERVAL_MS,
  onUpdate,
  signal,
}: ChatTypewriterOptions) {
  let displayedContent = "";
  let queuedCharacters: string[] = [];
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let flushResolvers: Array<() => void> = [];

  const resolveFlush = () => {
    if (queuedCharacters.length > 0 || timerId) {
      return;
    }

    flushResolvers.forEach((resolve) => resolve());
    flushResolvers = [];
  };

  const clearTimer = () => {
    if (!timerId) {
      return;
    }

    clearTimeout(timerId);
    timerId = null;
  };

  const stop = () => {
    stopped = true;
    queuedCharacters = [];
    clearTimer();
    resolveFlush();
  };

  const tick = () => {
    timerId = null;

    if (stopped || signal?.aborted) {
      stop();
      return;
    }

    const nextCharacter = queuedCharacters.shift();

    if (nextCharacter) {
      displayedContent += nextCharacter;
      onUpdate(displayedContent);
    }

    if (queuedCharacters.length > 0) {
      timerId = setTimeout(tick, intervalMs);
      return;
    }

    resolveFlush();
  };

  const schedule = () => {
    if (stopped || signal?.aborted || timerId || queuedCharacters.length === 0) {
      return;
    }

    timerId = setTimeout(tick, intervalMs);
  };

  return {
    flush() {
      if (queuedCharacters.length === 0 && !timerId) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        flushResolvers.push(resolve);
      });
    },
    push(token: string) {
      if (stopped || signal?.aborted || !token) {
        return;
      }

      queuedCharacters.push(...splitCharacters(token));
      schedule();
    },
    stop,
  };
}

function splitCharacters(value: string) {
  if (!graphemeSegmenter) {
    return Array.from(value);
  }

  return Array.from(graphemeSegmenter.segment(value), (item) => item.segment);
}
