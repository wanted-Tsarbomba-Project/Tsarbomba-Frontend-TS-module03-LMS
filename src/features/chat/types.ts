export interface ChatRoom {
  roomId: number;
  title: string;
  updatedAt: string;
  problemSetId?: number | string | null;
  problemId?: number | string | null;
  problemSet?: {
    id?: number | string | null;
    problemSetId?: number | string | null;
  } | null;
  problem?: {
    id?: number | string | null;
    problemId?: number | string | null;
  } | null;
}

export interface ChatRoomTitleUpdate {
  roomId: number;
  title: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "USER" | "ASSISTANT";
  content: string;
  error?: boolean;
  clientId?: string;
}

export interface ChatResponse {
  answer: string;
  roomId?: number;
}
