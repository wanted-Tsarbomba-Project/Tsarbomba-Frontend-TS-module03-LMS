"use client";

import Image from "next/image";

interface OneButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalTitle: string;
  modalContent?: string;
}

const modalClasses = {
  overlay:
    "fixed inset-0 z-[999] flex h-dvh w-dvw items-center justify-center bg-[rgba(16,24,40,0.45)] px-4 py-6",
  container:
    "relative flex max-h-[calc(100dvh-48px)] min-h-[min(348px,calc(100dvh-48px))] w-[min(480px,100%)] flex-col overflow-y-auto rounded-2xl bg-bg-box",
  iconWrap: "mt-12 flex items-center justify-center max-[560px]:mt-8",
  icon: "h-16 w-16 max-[560px]:h-12 max-[560px]:w-12",
  textWrap:
    "mt-8 flex flex-1 flex-col items-center justify-center px-8 pb-24 max-[560px]:mt-5 max-[560px]:px-5",
  title:
    "m-0 text-center text-2xl font-medium leading-8 text-[#101828] max-[560px]:text-title-md max-[560px]:leading-7",
  content:
    "mt-3 mb-0 whitespace-pre-line text-center text-body leading-6 text-[#667085]",
  buttonWrap:
    "absolute bottom-8 flex w-full justify-center gap-3 px-5 max-[560px]:bottom-5",
  button:
    "h-12 w-32 cursor-pointer rounded-[10px] border-0 text-body font-medium leading-6 transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60 max-[560px]:w-full",
  oneButton:
    "bg-button-blue-bg text-text-white hover:not-disabled:bg-button-blue-hover-bg",
};

export default function OneButtonModal({
  isOpen,
  onClose,
  modalTitle,
  modalContent,
}: OneButtonModalProps) {
  if (!isOpen) return null;

  return (
    <div className={modalClasses.overlay} onClick={onClose}>
      <div
        className={modalClasses.container}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={modalClasses.iconWrap}>
          <Image
            alt="check icon"
            className={modalClasses.icon}
            height={64}
            src="/assets/img/modalCheckIcon.svg"
            width={64}
          />
        </div>

        <div className={modalClasses.textWrap}>
          <h2 className={modalClasses.title}>{modalTitle}</h2>
          {modalContent && <p className={modalClasses.content}>{modalContent}</p>}
        </div>

        <div className={modalClasses.buttonWrap}>
          <button
            className={`${modalClasses.button} ${modalClasses.oneButton}`}
            onClick={onClose}
            type="button"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
