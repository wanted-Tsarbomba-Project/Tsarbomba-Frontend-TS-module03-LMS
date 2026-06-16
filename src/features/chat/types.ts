export interface ChatRoom {
  roomId: number;
  title: string;
  updatedAt: string;
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
}

export interface ChatResponse {
  answer: string;
  roomId?: number;
}
