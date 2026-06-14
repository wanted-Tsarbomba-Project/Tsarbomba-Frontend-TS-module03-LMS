"use client";

import Image from "next/image";

interface TwoButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modalTitle: string;
  modalContent?: string;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
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
  primaryButton:
    "bg-button-blue-bg text-text-white hover:not-disabled:bg-button-blue-hover-bg",
  cancelButton:
    "bg-bg-navbar text-[#364153] hover:not-disabled:bg-[#e5e7eb]",
};

export default function TwoButtonModal({
  isOpen,
  onClose,
  onConfirm,
  modalTitle,
  modalContent,
  confirmDisabled = false,
  cancelDisabled = false,
}: TwoButtonModalProps) {
  if (!isOpen) return null;

  return (
    <div className={modalClasses.overlay} onClick={onClose}>
      <div
        className={modalClasses.container}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={modalClasses.iconWrap}>
          <Image
            alt="notice icon"
            className={modalClasses.icon}
            height={64}
            src="/assets/img/modalNoticeIcon.svg"
            width={64}
          />
        </div>

        <div className={modalClasses.textWrap}>
          <h2 className={modalClasses.title}>{modalTitle}</h2>
          {modalContent && <p className={modalClasses.content}>{modalContent}</p>}
        </div>

        <div className={modalClasses.buttonWrap}>
          <button
            className={`${modalClasses.button} ${modalClasses.primaryButton}`}
            disabled={confirmDisabled}
            onClick={onConfirm}
            type="button"
          >
            확인
          </button>

          <button
            className={`${modalClasses.button} ${modalClasses.cancelButton}`}
            disabled={cancelDisabled}
            onClick={onClose}
            type="button"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
