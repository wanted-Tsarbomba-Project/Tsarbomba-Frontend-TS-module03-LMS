import { ApiClientError, type BackendErrorPayload } from "@/lib/errorHandling";

import type { ChatMessage, ChatResponse, ChatRoom } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

interface ApiResponse<T> {
  data?: T;
}

async function requestJson<T>(
  path: string,
  fallbackMessage: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init.headers,
      },
    });
  } catch (error) {
    throw new ApiClientError(
      {
        message:
          error instanceof Error
            ? error.message
            : "서버와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        path,
      },
      fallbackMessage,
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw createApiError(response, text, path, fallbackMessage);
  }

  if (!text) {
    return { data: undefined as T };
  }

  return JSON.parse(text) as ApiResponse<T>;
}

export async function getChatRooms(signal?: AbortSignal) {
  const result = await requestJson<ChatRoom[]>(
    "/api/v1/chat/list",
    "채팅방 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "GET",
      signal,
    },
  );

  return result.data ?? [];
}

export async function getChatMessages(roomId: string, signal?: AbortSignal) {
  const result = await requestJson<ChatMessage[]>(
    `/api/v1/chat/${roomId}/messages`,
    "채팅 내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "GET",
      signal,
    },
  );

  return result.data ?? [];
}

export async function createGeneralChatMessage(userMessage: string) {
  const result = await requestJson<ChatResponse>(
    "/api/v1/chat/messages",
    "AI 답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "POST",
      body: JSON.stringify({ userMessage }),
    },
  );

  return result.data;
}

export async function sendChatMessage(roomId: string, userMessage: string) {
  const result = await requestJson<ChatResponse>(
    `/api/v1/chat/${roomId}/messages`,
    "메시지를 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "POST",
      body: JSON.stringify({ userMessage }),
    },
  );

  return result.data;
}

export async function deleteChatRoom(roomId: string) {
  return requestJson<unknown>(
    `/api/v1/chat/${roomId}`,
    "채팅방을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    {
      method: "DELETE",
    },
  );
}

function createApiError(
  response: Response,
  text: string,
  requestPath: string,
  fallbackMessage: string,
) {
  if (!text) {
    return new ApiClientError(
      {
        status: response.status,
        message: fallbackMessage,
        path: requestPath,
      },
      fallbackMessage,
    );
  }

  try {
    const payload = JSON.parse(text) as BackendErrorPayload;

    return new ApiClientError(
      {
        ...payload,
        status: payload.status ?? response.status,
        path: payload.path ?? requestPath,
      },
      fallbackMessage,
    );
  } catch {
    return new ApiClientError(
      {
        status: response.status,
        message: text || fallbackMessage,
        path: requestPath,
      },
      fallbackMessage,
    );
  }
}
