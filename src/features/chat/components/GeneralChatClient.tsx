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

const chatClasses = {
  "page": "flex h-[66vh] max-h-[720px] min-h-[480px] w-full flex-col overflow-hidden rounded-base border border-border-light bg-bg-box text-text-primary max-md:h-[calc(100vh-120px)] max-md:max-h-none max-md:min-h-0 max-md:rounded-none",
  "header": "flex min-h-14 shrink-0 items-center border-b border-border-light bg-bg-box px-6 text-title-lg font-bold text-text-primary max-md:min-h-[52px] max-md:px-5 max-md:text-title-md",
  "messageContainer": "flex flex-1 flex-col gap-4 overflow-y-auto bg-bg-box p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-md:p-5",
  "messageWrapper": "flex w-full",
  "assistantWrapper": "justify-start",
  "userWrapper": "justify-end",
  "message": "max-w-[70%] whitespace-pre-wrap break-words rounded-base px-[18px] py-3.5 text-body leading-[1.6] text-text-primary max-md:max-w-[90%]",
  "assistantMessage": "bg-[#bfd3ef]",
  "userMessage": "border border-border-light bg-bg-box",
  "errorMessage": "text-text-red",
  "inputWrapper": "flex shrink-0 items-end gap-3 border-t border-border-light bg-bg-box px-6 py-4 max-md:px-5 max-md:py-3.5",
  "input": "box-border max-h-36 min-h-[52px] flex-1 resize-none overflow-y-hidden rounded-base border border-border-light px-4 py-3.5 text-body leading-normal text-text-primary outline-none placeholder:text-text-placeholder focus:border-button-blue-bg max-md:min-h-12",
  "sendButton": "h-[52px] min-w-[88px] cursor-pointer rounded-base border-0 bg-button-blue-bg text-body font-bold text-text-white hover:not-disabled:bg-button-blue-hover-bg disabled:cursor-not-allowed disabled:opacity-50 max-md:h-12 max-md:min-w-[76px]"
} as const;


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
    <main className={chatClasses.page}>
      <div className={chatClasses.header}>{chatTitle}</div>

      <div className={chatClasses.messageContainer}>
        {messages.map((message, index) => (
          <div
            className={`${chatClasses.messageWrapper} ${
              message.role === "USER" ? chatClasses.userWrapper : chatClasses.assistantWrapper
            }`}
            key={`${message.role}-${index}`}
          >
            <div
              className={`${chatClasses.message} ${
                message.role === "USER" ? chatClasses.userMessage : chatClasses.assistantMessage
              } ${message.error ? chatClasses.errorMessage : ""}`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className={`${chatClasses.messageWrapper} ${chatClasses.assistantWrapper}`}>
            <div className={`${chatClasses.message} ${chatClasses.assistantMessage}`}>
              AI 답변 중입니다.
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={chatClasses.inputWrapper}>
        <textarea
          className={chatClasses.input}
          disabled={sending}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문 입력"
          ref={inputRef}
          rows={1}
          value={inputValue}
        />

        <button
          className={chatClasses.sendButton}
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
