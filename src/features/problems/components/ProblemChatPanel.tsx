"use client";

// CSR - 문제풀이 챗봇 패널: 입력 높이, 전송 상태, 메시지 렌더링이 사용자 입력에 따라 즉시 바뀜.
import { useEffect, useRef } from "react";
import Image from "next/image";

import type { ChatMessage } from "../types";

const problemChatClasses = {
  chatPanel:
    "absolute right-0 top-3.5 z-20 flex h-[calc(100%-28px)] min-h-[560px] w-[min(420px,calc(100%-32px))] flex-col rounded-base border border-border-light bg-bg-box shadow-[0_12px_32px_rgba(15,23,42,0.16)] transition-[opacity,transform] duration-200 ease-in-out max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:top-[74px] max-md:h-auto max-md:min-h-0 max-md:w-auto",
  closed: "pointer-events-none translate-x-6 opacity-0",
  open: "pointer-events-auto translate-x-0 opacity-100",
  chatHeader:
    "flex min-h-[86px] flex-col justify-center gap-2 border-b border-border-light px-5 pt-4 pb-2 text-text-primary",
  chatHeaderTitle: "text-title-md font-bold leading-6",
  chatRoomTitleRow: "flex min-h-8 max-w-full items-center gap-2",
  chatRoomTitle: "min-w-0 truncate text-description text-text-secondary",
  chatRoomTitleInput:
    "h-8 min-w-0 flex-1 rounded-base border border-border-light bg-bg-box px-2 text-description text-text-primary outline-none focus:border-button-blue-bg",
  editTitleButton:
    "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-base border-0 bg-transparent hover:bg-bg-box-hover disabled:cursor-not-allowed disabled:opacity-50",
  titleActionButton:
    "h-8 shrink-0 cursor-pointer rounded-base border border-button-blue-bg bg-bg-box px-2 text-description font-semibold text-text-blue hover:bg-button-blue-bg hover:text-text-white disabled:cursor-not-allowed disabled:opacity-50",
  titleCancelButton:
    "h-8 shrink-0 cursor-pointer rounded-base border border-border-light bg-bg-box px-2 text-description font-semibold text-text-primary hover:bg-bg-box-hover disabled:cursor-not-allowed disabled:opacity-50",
  chatMessages: "flex-1 overflow-y-auto p-[18px]",
  chatMessageWrap: "mb-2.5 flex",
  assistantMessageWrap: "justify-start",
  userMessageWrap: "justify-end",
  chatMessage:
    "max-w-[86%] whitespace-pre-wrap break-words rounded-base px-3 py-2.5 leading-[1.6] text-text-primary",
  assistantMessage: "bg-[#bfd3ef]",
  userMessage: "border border-border-light bg-bg-box",
  errorMessage: "text-text-red",
  spinnerWrap: "flex items-center gap-2",
  spinner:
    "h-4 w-4 animate-spin rounded-full border-2 border-[#93a9c8] border-t-button-blue-bg",
  spinnerText: "text-body text-text-primary",
  chatInputWrap:
    "flex items-end gap-2 border-t border-border-light p-3.5 [&_textarea]:box-border [&_textarea]:max-h-36 [&_textarea]:min-h-11 [&_textarea]:flex-1 [&_textarea]:resize-none [&_textarea]:overflow-y-hidden [&_textarea]:rounded-base [&_textarea]:border [&_textarea]:border-border-light [&_textarea]:p-2.5 [&_textarea]:leading-normal [&_textarea]:text-text-primary [&_textarea]:outline-none [&_button]:h-11 [&_button]:min-w-[72px] [&_button]:cursor-pointer [&_button]:rounded-base [&_button]:border [&_button]:border-button-blue-bg [&_button]:bg-button-blue-bg [&_button]:text-text-white [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60",
} as const;

interface ProblemChatPanelProps {
  chatInput: string;
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  chatRoomTitleEditing?: boolean;
  chatRoomTitleInput?: string;
  chatRoomTitle?: string | null;
  chatSending: boolean;
  canEditChatRoomTitle?: boolean;
  onChatInputChange: (value: string) => void;
  onChatRoomTitleCancel?: () => void;
  onChatRoomTitleChange?: (value: string) => void;
  onChatRoomTitleEdit?: () => void;
  onChatRoomTitleSubmit?: () => void;
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
  chatRoomTitleEditing = false,
  chatRoomTitleInput = "",
  chatRoomTitle,
  chatSending,
  canEditChatRoomTitle = false,
  onChatInputChange,
  onChatRoomTitleCancel,
  onChatRoomTitleChange,
  onChatRoomTitleEdit,
  onChatRoomTitleSubmit,
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
          문제풀이 챗봇
        </span>
        {chatRoomTitle && (
          <span className={problemChatClasses.chatRoomTitleRow}>
            {chatRoomTitleEditing ? (
              <>
                <input
                  className={problemChatClasses.chatRoomTitleInput}
                  maxLength={80}
                  onChange={(event) =>
                    onChatRoomTitleChange?.(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onChatRoomTitleSubmit?.();
                    }

                    if (event.key === "Escape") {
                      onChatRoomTitleCancel?.();
                    }
                  }}
                  value={chatRoomTitleInput}
                />
                <button
                  className={problemChatClasses.titleActionButton}
                  onClick={onChatRoomTitleSubmit}
                  type="button"
                >
                  저장
                </button>
                <button
                  className={problemChatClasses.titleCancelButton}
                  onClick={onChatRoomTitleCancel}
                  type="button"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <span className={problemChatClasses.chatRoomTitle}>
                  {chatRoomTitle}
                </span>
                {canEditChatRoomTitle && (
                  <button
                    aria-label="채팅방 이름 수정"
                    className={problemChatClasses.editTitleButton}
                    onClick={onChatRoomTitleEdit}
                    type="button"
                  >
                    <Image
                      alt=""
                      height={20}
                      src="/assets/img/edit-Icon.svg"
                      width={20}
                    />
                  </button>
                )}
              </>
            )}
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
              aria-live="polite"
              className={`${problemChatClasses.chatMessage} ${problemChatClasses.assistantMessage}`}
              role="status"
            >
              <span className={problemChatClasses.spinnerWrap}>
                <span
                  aria-hidden="true"
                  className={problemChatClasses.spinner}
                />
                <span className={problemChatClasses.spinnerText}>
                  AI 응답 중입니다.
                </span>
              </span>
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
