"use client";

// CSR - 문제풀이 챗봇 패널: 입력 높이, 전송 상태, 메시지 렌더링이 사용자 입력에 따라 즉시 바뀜
import { useEffect, useRef } from "react";
import Image from "next/image";

import { problemChatClasses } from "@/features/chat/styles";
import { isUserMessage, resizeChatInput } from "@/features/chat/utils";

import type { ChatMessage } from "../types";

interface ProblemChatPanelProps {
  chatInput: string;
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  chatRoomTitleEditing?: boolean;
  chatRoomTitleInput?: string;
  chatRoomTitle?: string | null;
  chatSending: boolean;
  showChatSendingIndicator?: boolean;
  canEditChatRoomTitle?: boolean;
  onChatInputChange: (value: string) => void;
  onChatRoomTitleCancel?: () => void;
  onChatRoomTitleChange?: (value: string) => void;
  onChatRoomTitleEdit?: () => void;
  onChatRoomTitleSubmit?: () => void;
  onClose: () => void;
  onSendChat: () => void;
}

export default function ProblemChatPanel({
  chatInput,
  chatMessages,
  chatOpen,
  chatRoomTitleEditing = false,
  chatRoomTitleInput = "",
  chatRoomTitle,
  chatSending,
  showChatSendingIndicator = chatSending,
  canEditChatRoomTitle = false,
  onChatInputChange,
  onChatRoomTitleCancel,
  onChatRoomTitleChange,
  onChatRoomTitleEdit,
  onChatRoomTitleSubmit,
  onClose,
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
        <button
          aria-label="채팅창 닫기"
          className={problemChatClasses.closeButton}
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
        {chatRoomTitle && (
          <span className={problemChatClasses.chatRoomTitleRow}>
            {chatRoomTitleEditing ? (
              <>
                <input
                  aria-label="채팅방 이름"
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
        {chatMessages.map((message, index) => {
          if (!isUserMessage(message) && !message.content) {
            return null;
          }

          return (
            <div
              className={`${problemChatClasses.chatMessageWrap} ${
                isUserMessage(message)
                  ? problemChatClasses.userMessageWrap
                  : problemChatClasses.assistantMessageWrap
              }`}
              key={message.clientId ?? `${message.role}-${index}`}
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
          );
        })}
        {showChatSendingIndicator && (
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
          aria-label="챗봇 질문 입력"
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
