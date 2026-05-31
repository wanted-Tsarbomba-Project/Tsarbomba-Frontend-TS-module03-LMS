"use client";

import Image from "next/image";

import styles from "./Modal.module.css";

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modalTitle: string;
  modalContent?: string;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
}

export default function WarningModal({
  isOpen,
  onClose,
  onConfirm,
  modalTitle,
  modalContent,
  confirmDisabled = false,
  cancelDisabled = false,
}: WarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(event) => event.stopPropagation()}>
        <div className={styles.iconWrap}>
          <Image
            alt="warning icon"
            className={styles.icon}
            height={64}
            src="/assets/img/modalWarningIcon.svg"
            width={64}
          />
        </div>

        <div className={styles.textWrap}>
          <h2 className={styles.title}>{modalTitle}</h2>
          {modalContent && <p className={styles.content}>{modalContent}</p>}
        </div>

        <div className={styles.buttonWrap}>
          <button
            className={`${styles.button} ${styles.warningButton}`}
            disabled={confirmDisabled}
            onClick={onConfirm}
            type="button"
          >
            확인
          </button>

          <button
            className={`${styles.button} ${styles.cancelButton}`}
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
