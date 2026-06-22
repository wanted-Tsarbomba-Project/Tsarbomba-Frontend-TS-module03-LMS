import type { ChatMessage, ChatRoom } from "./types";

export const DEFAULT_CHAT_TITLE = "새 채팅";
export const CHAT_INPUT_MAX_HEIGHT = 144;

export interface LinkedProblem {
  problemSetId: string;
  problemId: string;
  problemSetTitle?: string;
  problemTitle?: string;
}

export function createMessage(
  role: ChatMessage["role"],
  content: string,
  error = false,
) {
  return {
    role,
    content,
    error,
  };
}

export function resizeChatInput(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, CHAT_INPUT_MAX_HEIGHT);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > CHAT_INPUT_MAX_HEIGHT ? "auto" : "hidden";
}

export function normalizeId(value?: number | string | null) {
  return value == null ? "" : String(value);
}

export function getRoomProblemSetId(room: ChatRoom) {
  return (
    room.problemSetId ??
    room.problemSet?.problemSetId ??
    room.problemSet?.id ??
    null
  );
}

export function getRoomProblemId(room: ChatRoom) {
  return room.problemId ?? room.problem?.problemId ?? room.problem?.id ?? null;
}

export function getLinkedProblem(room?: ChatRoom): LinkedProblem | null {
  if (!room) {
    return null;
  }

  const problemSetId = normalizeId(getRoomProblemSetId(room));
  const problemId = normalizeId(getRoomProblemId(room));

  if (!problemSetId || !problemId) {
    return null;
  }

  return { problemSetId, problemId };
}

export function getLinkedProblemLabel(linkedProblem: LinkedProblem) {
  if (linkedProblem.problemSetTitle || linkedProblem.problemTitle) {
    return [
      linkedProblem.problemSetTitle ?? `문제 세트 ${linkedProblem.problemSetId}`,
      linkedProblem.problemTitle ?? `문제 ${linkedProblem.problemId}`,
    ].join(" - ");
  }

  return `문제 세트 ${linkedProblem.problemSetId} - 문제 ${linkedProblem.problemId}`;
}

export function isUserMessage(message: ChatMessage) {
  return message.role.toUpperCase() === "USER";
}
