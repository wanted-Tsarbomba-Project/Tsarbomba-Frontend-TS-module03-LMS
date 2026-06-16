"use client";

// CSR - 문제 전용 챗봇 패널: 입력 높이, 전송 상태, 메시지 렌더링이 사용자 입력에 따라 즉시 바뀜.
import { useEffect, useRef } from "react";

import type { ChatMessage } from "../types";

const problemChatClasses = {
  chatPanel:
    "absolute right-0 top-3.5 z-20 flex h-[calc(100%-28px)] min-h-[560px] w-[min(420px,calc(100%-32px))] flex-col rounded-base border border-border-light bg-bg-box shadow-[0_12px_32px_rgba(15,23,42,0.16)] transition-[opacity,transform] duration-200 ease-in-out max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:top-[74px] max-md:h-auto max-md:min-h-0 max-md:w-auto",
  closed: "pointer-events-none translate-x-6 opacity-0",
  open: "pointer-events-auto translate-x-0 opacity-100",
  chatHeader:
    "flex min-h-[58px] flex-col justify-center border-b border-border-light px-5 text-text-primary",
  chatHeaderTitle: "text-title-md font-bold",
  chatRoomTitle: "mt-1 max-w-full truncate text-description text-text-secondary",
  chatMessages: "flex-1 overflow-y-auto p-[18px]",
  chatMessageWrap: "mb-2.5 flex",
  assistantMessageWrap: "justify-start",
  userMessageWrap: "justify-end",
  chatMessage:
    "max-w-[86%] whitespace-pre-wrap break-words rounded-base px-3 py-2.5 leading-[1.6] text-text-primary",
  assistantMessage: "bg-[#bfd3ef]",
  userMessage: "border border-border-light bg-bg-box",
  errorMessage: "text-text-red",
  chatInputWrap:
    "flex items-end gap-2 border-t border-border-light p-3.5 [&_textarea]:box-border [&_textarea]:max-h-36 [&_textarea]:min-h-11 [&_textarea]:flex-1 [&_textarea]:resize-none [&_textarea]:overflow-y-hidden [&_textarea]:rounded-base [&_textarea]:border [&_textarea]:border-border-light [&_textarea]:p-2.5 [&_textarea]:leading-normal [&_textarea]:text-text-primary [&_textarea]:outline-none [&_button]:h-11 [&_button]:min-w-[72px] [&_button]:cursor-pointer [&_button]:rounded-base [&_button]:border [&_button]:border-button-blue-bg [&_button]:bg-button-blue-bg [&_button]:text-text-white [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60",
} as const;

interface ProblemChatPanelProps {
  chatInput: string;
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  chatRoomTitle?: string | null;
  chatSending: boolean;
  onChatInputChange: (value: string) => void;
  onSendChat: () => void;
}

const CHAT_INPUT_MAX_HEIGHT = 144;

function resizeChatInput(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, CHAT_INPUT_MAX_HEIGHT);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > CHAT_INPUT_MAX_HEIGHT ? "auto" : "hidden";
}

function isUserMessage(message: ChatMessage) {
  return message.role.toUpperCase() === "USER";
}

export default function ProblemChatPanel({
  chatInput,
  chatMessages,
  chatOpen,
  chatRoomTitle,
  chatSending,
  onChatInputChange,
  onSendChat,
}: ProblemChatPanelProps) {
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const isChatDisabled = chatSending || !chatOpen;

  useEffect(() => {
    resizeChatInput(chatInputRef.current);
  }, [chatInput]);

  return (
    <aside
      aria-hidden={!chatOpen}
      className={`${problemChatClasses.chatPanel} ${
        chatOpen ? problemChatClasses.open : problemChatClasses.closed
      }`}
    >
      <div className={problemChatClasses.chatHeader}>
        <span className={problemChatClasses.chatHeaderTitle}>
          문제 전용 챗봇
        </span>
        {chatRoomTitle && (
          <span className={problemChatClasses.chatRoomTitle}>
            {chatRoomTitle}
          </span>
        )}
      </div>

      <div className={problemChatClasses.chatMessages}>
        {chatMessages.map((message, index) => (
          <div
            className={`${problemChatClasses.chatMessageWrap} ${
              isUserMessage(message)
                ? problemChatClasses.userMessageWrap
                : problemChatClasses.assistantMessageWrap
            }`}
            key={`${message.role}-${index}`}
          >
            <div
              className={`${problemChatClasses.chatMessage} ${
                isUserMessage(message)
                  ? problemChatClasses.userMessage
                  : problemChatClasses.assistantMessage
              } ${message.error ? problemChatClasses.errorMessage : ""}`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {chatSending && (
          <div
            className={`${problemChatClasses.chatMessageWrap} ${problemChatClasses.assistantMessageWrap}`}
          >
            <div
              className={`${problemChatClasses.chatMessage} ${problemChatClasses.assistantMessage}`}
            >
              AI 응답 중입니다.
            </div>
          </div>
        )}
      </div>

      <div className={problemChatClasses.chatInputWrap}>
        <textarea
          disabled={isChatDisabled}
          onChange={(event) => onChatInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSendChat();
            }
          }}
          placeholder="질문 입력"
          ref={chatInputRef}
          rows={1}
          value={chatInput}
        />
        <button
          disabled={isChatDisabled || !chatInput.trim()}
          onClick={onSendChat}
          type="button"
        >
          전송
        </button>
      </div>
    </aside>
  );
}
