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
    "fixed inset-0 z-[999] flex h-full w-full items-center justify-center bg-[rgba(16,24,40,0.45)]",
  container:
    "relative h-[348px] w-[480px] overflow-hidden rounded-2xl bg-bg-box max-[560px]:w-[calc(100%-32px)]",
  iconWrap: "mt-12 flex items-center justify-center",
  icon: "h-16 w-16",
  textWrap: "mt-8 flex flex-col items-center justify-center px-8",
  title: "m-0 text-center text-2xl font-medium leading-8 text-[#101828]",
  content:
    "mt-3 mb-0 whitespace-pre-line text-center text-body leading-6 text-[#667085]",
  buttonWrap: "absolute bottom-8 flex w-full justify-center gap-3",
  button:
    "h-12 w-32 cursor-pointer rounded-[10px] border-0 text-body font-medium leading-6 transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60",
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
