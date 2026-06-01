"use client";

// CSR - 문제풀이 챗봇 패널: 입력 높이, 전송 상태, 메시지 렌더링이 사용자 입력에 따라 즉시 바뀜
import { useEffect, useRef } from "react";

import type { ChatMessage } from "../types";

import styles from "./UserProblemDetailClient.module.css";

interface ProblemChatPanelProps {
  chatInput: string;
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  chatSending: boolean;
  onChatInputChange: (value: string) => void;
  onResetChat: () => void;
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

export default function ProblemChatPanel({
  chatInput,
  chatMessages,
  chatOpen,
  chatSending,
  onChatInputChange,
  onResetChat,
  onSendChat,
}: ProblemChatPanelProps) {
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    resizeChatInput(chatInputRef.current);
  }, [chatInput]);

  return (
    <aside className={`${styles.chatPanel} ${chatOpen ? styles.open : ""}`}>
      <div className={styles.chatHeader}>
        <span>문제 전용 챗봇</span>
        <button aria-label="새 대화" onClick={onResetChat} type="button">
          +
        </button>
      </div>

      <div className={styles.chatMessages}>
        {chatMessages.map((message, index) => (
          <div
            className={`${styles.chatMessageWrap} ${
              message.role === "USER" ? styles.userMessageWrap : ""
            }`}
            key={`${message.role}-${index}`}
          >
            <div
              className={`${styles.chatMessage} ${
                message.role === "USER" ? styles.userMessage : styles.assistantMessage
              } ${message.error ? styles.errorMessage : ""}`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {chatSending && (
          <div className={styles.chatMessageWrap}>
            <div className={`${styles.chatMessage} ${styles.assistantMessage}`}>
              AI 응답 중입니다.
            </div>
          </div>
        )}
      </div>

      <div className={styles.chatInputWrap}>
        <textarea
          disabled={chatSending}
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
        <button disabled={chatSending || !chatInput.trim()} onClick={onSendChat} type="button">
          전송
        </button>
      </div>
    </aside>
  );
}
