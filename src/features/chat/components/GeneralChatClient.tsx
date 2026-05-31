"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { OneButtonModal } from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import {
  createGeneralChatMessage,
  getChatMessages,
  getChatRooms,
  sendChatMessage,
} from "../api";
import type { ChatMessage } from "../types";

import styles from "./GeneralChatClient.module.css";

const DEFAULT_CHAT_TITLE = "새 대화";

const CHAT_INPUT_MAX_HEIGHT = 144;

interface GeneralChatClientProps {
  roomId?: string;
}

function createMessage(role: ChatMessage["role"], content: string, error = false) {
  return {
    role,
    content,
    error,
  };
}

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

export default function GeneralChatClient({ roomId }: GeneralChatClientProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [chatTitle, setChatTitle] = useState(DEFAULT_CHAT_TITLE);
  const [modal, setModal] = useState({ open: false, title: "", content: "" });

  const activeRoomId = useMemo(() => roomId, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    resizeChatInput(inputRef.current);
  }, [inputValue]);

  useEffect(() => {
    if (!activeRoomId) {
      return undefined;
    }

    const controller = new AbortController();

    const loadChat = async () => {
      try {
        const [rooms, roomMessages] = await Promise.all([
          getChatRooms(controller.signal),
          getChatMessages(activeRoomId, controller.signal),
        ]);
        const currentRoom = rooms.find(
          (room) => String(room.roomId) === String(activeRoomId),
        );

        setChatTitle(currentRoom?.title || DEFAULT_CHAT_TITLE);
        setMessages(roomMessages);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        handleClientError(error, {
          router,
          fallbackTitle: "채팅 조회 실패",
          fallbackMessage: "채팅 내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          showModal: (title, content) => setModal({ open: true, title, content }),
        });
      }
    };

    loadChat();

    return () => {
      controller.abort();
    };
  }, [activeRoomId, router]);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || sending) {
      return;
    }

    const userMessage = inputValue;

    appendMessage(createMessage("USER", userMessage));
    setInputValue("");
    setSending(true);

    try {
      const response = activeRoomId
        ? await sendChatMessage(activeRoomId, userMessage)
        : await createGeneralChatMessage(userMessage);

      appendMessage(
        createMessage("ASSISTANT", response?.answer ?? "답변을 받지 못했습니다."),
      );
      window.dispatchEvent(new Event("chatRoomUpdated"));

      if (!activeRoomId && response?.roomId) {
        router.replace(`/chat/${response.roomId}`);
      }
    } catch (error) {
      appendMessage(
        createMessage(
          "ASSISTANT",
          "AI 답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          true,
        ),
      );

      handleClientError(error, {
        router,
        fallbackTitle: "메시지 전송 실패",
        fallbackMessage: "메시지를 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => setModal({ open: true, title, content }),
      });
    } finally {
      setSending(false);
    }
  }, [activeRoomId, appendMessage, inputValue, router, sending]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.header}>{chatTitle}</div>

      <div className={styles.messageContainer}>
        {messages.map((message, index) => (
          <div
            className={`${styles.messageWrapper} ${
              message.role === "USER" ? styles.userWrapper : styles.assistantWrapper
            }`}
            key={`${message.role}-${index}`}
          >
            <div
              className={`${styles.message} ${
                message.role === "USER" ? styles.userMessage : styles.assistantMessage
              } ${message.error ? styles.errorMessage : ""}`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className={`${styles.messageWrapper} ${styles.assistantWrapper}`}>
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              AI 답변 중입니다.
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputWrapper}>
        <textarea
          className={styles.input}
          disabled={sending}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문 입력"
          ref={inputRef}
          rows={1}
          value={inputValue}
        />

        <button
          className={styles.sendButton}
          disabled={sending || !inputValue.trim()}
          onClick={sendMessage}
          type="button"
        >
          전송
        </button>
      </div>

      <OneButtonModal
        isOpen={modal.open}
        modalContent={modal.content}
        modalTitle={modal.title}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </main>
  );
}
